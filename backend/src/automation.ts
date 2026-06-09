import { createClient } from '@supabase/supabase-js';

/**
 * Deadline automation: scans policies / mortgages / clients and creates
 * calendar_events for upcoming deadlines (cancellation notice periods, mortgage
 * expiry, client birthdays). Idempotent – it never creates a duplicate for the
 * same (related_id, type, day). Runs on a daily cron (see server.ts) and can be
 * triggered manually via POST /api/automation/run.
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
);

const DAY = 86_400_000;
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() - m); return x; };

interface Candidate {
  tenantId: string;
  relatedId: string;
  relatedType: string;
  type: string;       // EventType
  title: string;
  start: Date;
  description?: string;
}

export async function runDeadlineAutomation(): Promise<{ created: number; scanned: number }> {
  const now = new Date();
  const horizon = new Date(now.getTime() + 90 * DAY);
  const bdayHorizon = new Date(now.getTime() + 30 * DAY);
  const candidates: Candidate[] = [];

  // 1. Policy cancellation deadlines + storno (clawback) watch
  const { data: policies } = await supabase
    .from('policies')
    .select('id, tenant_id, insurer, type, end_date, cancellation_notice_period, status, start_date, liability_duration_months, initial_commission');
  for (const p of policies || []) {
    if (p.status === 'CANCELLED') continue;
    if (p.end_date) {
      const end = new Date(p.end_date);
      const deadline = addMonths(end, p.cancellation_notice_period || 3);
      if (deadline >= now && deadline <= horizon) {
        candidates.push({
          tenantId: p.tenant_id, relatedId: p.id, relatedType: 'POLICY', type: 'DEADLINE',
          title: `Kündigungsfrist: ${p.insurer} ${p.type}`, start: deadline,
          description: `Letzter Termin zur Kündigung der Police bei ${p.insurer}.`,
        });
      }
    }
    // Storno watch: reminder when the clawback liability period is about to end.
    if (p.start_date && (p.liability_duration_months || 0) > 0 && (p.initial_commission || 0) > 0) {
      const clawbackEnd = new Date(p.start_date);
      clawbackEnd.setMonth(clawbackEnd.getMonth() + p.liability_duration_months);
      if (clawbackEnd >= now && clawbackEnd <= horizon) {
        candidates.push({
          tenantId: p.tenant_id, relatedId: p.id, relatedType: 'POLICY', type: 'TASK',
          title: `Stornohaftung endet: ${p.insurer} ${p.type}`, start: clawbackEnd,
          description: 'Ab diesem Datum besteht kein Stornorückforderungs-Risiko mehr für diese Police.',
        });
      }
    }
  }

  // 2. Mortgage expiry
  const { data: mortgages } = await supabase
    .from('mortgages')
    .select('id, tenant_id, property_name, end_date');
  for (const m of mortgages || []) {
    if (!m.end_date) continue;
    const end = new Date(m.end_date);
    if (end >= now && end <= horizon) {
      candidates.push({
        tenantId: m.tenant_id, relatedId: m.id, relatedType: 'MORTGAGE', type: 'DEADLINE',
        title: `Hypothek läuft aus: ${m.property_name || 'Liegenschaft'}`, start: end,
        description: 'Ablauf der Hypothek – Anschlussfinanzierung prüfen.',
      });
    }
  }

  // 3. Client birthdays
  const { data: clients } = await supabase
    .from('clients')
    .select('id, tenant_id, first_name, last_name, birth_date');
  for (const c of clients || []) {
    if (!c.birth_date) continue;
    const b = new Date(c.birth_date);
    let next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
    if (next < now) next = new Date(now.getFullYear() + 1, b.getMonth(), b.getDate());
    if (next >= now && next <= bdayHorizon) {
      candidates.push({
        tenantId: c.tenant_id, relatedId: c.id, relatedType: 'CLIENT', type: 'BIRTHDAY',
        title: `Geburtstag: ${c.first_name} ${c.last_name}`, start: next,
      });
    }
  }

  if (candidates.length === 0) return { created: 0, scanned: 0 };

  // Dedup against existing automation events
  const relatedIds = Array.from(new Set(candidates.map((c) => c.relatedId)));
  const { data: existing } = await supabase
    .from('calendar_events')
    .select('related_id, type, start_time')
    .in('related_id', relatedIds);
  const seen = new Set((existing || []).map((e) => `${e.related_id}|${e.type}|${ymd(new Date(e.start_time))}`));

  const toInsert = candidates
    .filter((c) => !seen.has(`${c.relatedId}|${c.type}|${ymd(c.start)}`))
    .map((c) => ({
      tenant_id: c.tenantId,
      title: c.title,
      start_time: c.start.toISOString(),
      end_time: c.start.toISOString(),
      type: c.type,
      related_id: c.relatedId,
      related_type: c.relatedType,
      is_all_day: true,
      description: c.description,
    }));

  if (toInsert.length === 0) return { created: 0, scanned: candidates.length };
  const { error } = await supabase.from('calendar_events').insert(toInsert);
  if (error) throw error;
  return { created: toInsert.length, scanned: candidates.length };
}

/**
 * Lead follow-ups: leads stuck in NEW/CONTACTED without an update for 7+ days
 * get an open "Nachfassen" task (idempotent – skips leads that already have an
 * open follow-up task).
 */
export async function runLeadFollowups(): Promise<{ created: number }> {
  const staleBefore = new Date(Date.now() - 7 * DAY).toISOString();
  const { data: leads } = await supabase
    .from('leads')
    .select('id, tenant_id, name, status, updated_at')
    .in('status', ['NEW', 'CONTACTED'])
    .lt('updated_at', staleBefore);
  if (!leads || leads.length === 0) return { created: 0 };

  const leadIds = leads.map((l) => l.id);
  const { data: openTasks } = await supabase
    .from('lead_tasks')
    .select('lead_id, label, is_completed')
    .in('lead_id', leadIds)
    .eq('is_completed', false);
  const hasOpenFollowup = new Set((openTasks || []).filter((t) => t.label === 'Nachfassen').map((t) => t.lead_id));

  const toInsert = leads
    .filter((l) => !hasOpenFollowup.has(l.id))
    .map((l) => ({ lead_id: l.id, label: 'Nachfassen', due_date: ymd(new Date()), priority: 'HIGH', is_completed: false }));
  if (toInsert.length === 0) return { created: 0 };
  const { error } = await supabase.from('lead_tasks').insert(toInsert);
  if (error) throw error;
  return { created: toInsert.length };
}

/** Runs every automation and aggregates the result. */
export async function runAllAutomation() {
  const deadlines = await runDeadlineAutomation();
  const followups = await runLeadFollowups();
  return { deadlineEvents: deadlines.created, leadFollowups: followups.created };
}
