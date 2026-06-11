import { supabase } from '../lib/supabase';
import { db, USE_MOCK } from './db';
import { API_BASE } from './integrations';
import {
  Commission, CommissionAgreement, CommissionSplitRule, CommissionStatus,
  CommissionType, Policy,
} from '../types';

/**
 * Courtage-Domänenlogik (Konzept: docs/COURTAGEN_KONZEPT.md):
 *  - Soll-Stellung: erwartete Courtagen aus Police + Courtagevereinbarung
 *  - Storno: pro-rata-Rückforderung bei Kündigung in der Haftungszeit
 *  - Splits: Beraterbeteiligung gemäss Regelwerk
 *  - Abrechnungsabgleich: KI-Parse + Matching (Backend; Mock-Simulation offline)
 */

async function authHeaders(extra: Record<string, string> = {}): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return { ...extra, ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

const ym = (d: Date): string => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

/** Most specific matching agreement: exact line beats the all-lines fallback. */
export const findAgreement = (
  agreements: CommissionAgreement[], insurer: string, line: string,
): CommissionAgreement | undefined => {
  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
  const forInsurer = agreements.filter((a) => norm(a.insurer) === norm(insurer));
  return forInsurer.find((a) => norm(a.line) === norm(line))
      ?? forInsurer.find((a) => !a.line);
};

/** Best matching split rule for an agent: exact line beats all-lines. */
export const findSplitRule = (
  rules: CommissionSplitRule[], agentId?: string | null, line?: string,
): CommissionSplitRule | undefined => {
  if (!agentId) return undefined;
  const norm = (s?: string | null) => (s ?? '').trim().toLowerCase();
  const forAgent = rules.filter((r) => r.agentId === agentId);
  return forAgent.find((r) => norm(r.line) === norm(line))
      ?? forAgent.find((r) => !r.line);
};

/**
 * Soll-Stellung: generates EXPECTED commission rows for a freshly captured
 * policy – one acquisition commission plus recurring (Bestand) commissions for
 * up to `recurringYears` policy years. A manually captured initialCommission
 * on the policy overrides the agreement's acquisition rate.
 */
export async function generateExpectedForPolicy(
  policy: Policy & { tenantId?: string },
  opts: { advisorId?: string | null; recurringYears?: number } = {},
): Promise<number> {
  const tenantId = (policy as any).tenantId;
  const agreements = await db.commissionAgreements.getAll(tenantId ? { tenantId } : undefined);
  const agreement = findAgreement(agreements, policy.insurer, policy.type);
  const premium = Number(policy.premiumAmount) || 0;

  const acquisition = policy.initialCommission && policy.initialCommission > 0
    ? policy.initialCommission
    : premium * ((agreement?.acquisitionRate ?? 0) / 100);
  const recurring = premium * ((agreement?.recurringRate ?? 0) / 100);
  if (acquisition <= 0 && recurring <= 0) return 0; // nothing to expect

  const start = policy.startDate ? new Date(policy.startDate) : new Date();
  const end = policy.endDate ? new Date(policy.endDate) : null;
  const years = Math.max(0, opts.recurringYears ?? 3);

  // Advisor attribution: explicit override, else the client's advisor.
  let advisorId = opts.advisorId;
  if (advisorId === undefined && policy.clientId) {
    advisorId = (await db.clients.getById(policy.clientId).catch(() => undefined))?.advisorId ?? null;
  }
  const rules = await db.commissionSplitRules.getAll(tenantId ? { tenantId } : undefined);
  const rule = findSplitRule(rules, advisorId, policy.type);

  const base: Partial<Commission> = {
    tenantId,
    policyId: policy.id,
    clientId: policy.clientId,
    agreementId: agreement?.id ?? null,
    currency: 'CHF',
    status: 'EXPECTED' as CommissionStatus,
    partnerName: policy.insurer,
    agentId: advisorId ?? undefined,
    splitAgentId: advisorId ?? null,
    splitRate: rule?.rate ?? null,
  } as any;

  let created = 0;

  if (acquisition > 0) {
    await db.commissions.create({
      ...base,
      type: 'ACQUISITION' as CommissionType,
      amount: 0,
      expectedAmount: Math.round(acquisition * 100) / 100,
      period: ym(start),
      date: start.toISOString().slice(0, 10),
      description: `Abschlusscourtage ${policy.type} (${policy.policyNumber || 'ohne Nr.'})`,
      splitAmount: rule ? Math.round(acquisition * rule.rate) / 100 : null,
    } as any);
    created++;
  }

  if (recurring > 0) {
    for (let y = 1; y <= years; y++) {
      const due = new Date(start);
      due.setFullYear(due.getFullYear() + y);
      if (end && due > end) break;
      await db.commissions.create({
        ...base,
        type: 'RECURRING' as CommissionType,
        amount: 0,
        expectedAmount: Math.round(recurring * 100) / 100,
        period: ym(due),
        date: due.toISOString().slice(0, 10),
        description: `Bestandescourtage ${policy.type} – Jahr ${y + 1}`,
        splitAmount: rule ? Math.round(recurring * rule.rate) / 100 : null,
      } as any);
      created++;
    }
  }

  return created;
}

/** Pro-rata clawback for a policy cancelled inside the liability window. */
export const computeClawback = (policy: Policy): number => {
  const liability = policy.liabilityDurationMonths || 0;
  const commission = policy.initialCommission || 0;
  if (liability <= 0 || commission <= 0 || !policy.startDate) return 0;
  const start = new Date(policy.startDate);
  const now = new Date();
  const monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const remaining = Math.max(0, liability - monthsPassed);
  if (remaining <= 0) return 0;
  return Math.round(commission * (remaining / liability) * 100) / 100;
};

/** Books the CLAWBACK row (negative amount) incl. the advisor's share. */
export async function registerClawbackForPolicy(
  policy: Policy & { tenantId?: string },
): Promise<Commission | null> {
  const clawback = computeClawback(policy);
  if (clawback <= 0) return null;
  const tenantId = (policy as any).tenantId;
  const existing = await db.commissions.getAll({ policyId: policy.id } as any).catch(() => []);
  if ((existing as Commission[]).some((c) => c.status === ('CLAWBACK' as CommissionStatus))) return null;

  const acq = (existing as Commission[]).find((c) => c.type === ('ACQUISITION' as CommissionType));
  const now = new Date();
  return db.commissions.create({
    tenantId,
    policyId: policy.id,
    clientId: policy.clientId,
    type: 'ACQUISITION' as CommissionType,
    status: 'CLAWBACK' as CommissionStatus,
    amount: -clawback,
    expectedAmount: -clawback,
    currency: 'CHF',
    period: ym(now),
    date: now.toISOString().slice(0, 10),
    partnerName: policy.insurer,
    description: `Storno-Rückforderung ${policy.type} (${policy.policyNumber || 'ohne Nr.'})`,
    splitAgentId: acq?.splitAgentId ?? null,
    splitRate: acq?.splitRate ?? null,
    splitAmount: acq?.splitRate != null ? -Math.round(clawback * acq.splitRate) / 100 : null,
  } as any);
}

// ---------------------------------------------------------------------------
// Abrechnungsabgleich (statements)
// ---------------------------------------------------------------------------

export interface ReconcileResult {
  itemsParsed: number;
  matched: number;
  disputed: number;
  unexpected: number;
}

export const statementsApi = {
  /**
   * Parse + reconcile a statement. Real mode: backend downloads the document,
   * extracts items via Gemini and matches them against EXPECTED commissions.
   * Mock mode: simulates a plausible statement from the tenant's policies so
   * the whole flow is demoable offline.
   */
  parseAndReconcile: async (statementId: string, tenantId: string): Promise<ReconcileResult> => {
    if (!USE_MOCK) {
      const res = await fetch(`${API_BASE}/api/commissions/statements/${statementId}/parse`, {
        method: 'POST',
        headers: await authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ tenantId }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Abgleich fehlgeschlagen.');
      return res.json();
    }

    // ----- mock simulation ---------------------------------------------------
    const statement = await db.commissionStatements.getById(statementId);
    if (!statement) throw new Error('Abrechnung nicht gefunden.');
    const policies = await db.policies.getAll();
    const insurerPolicies = policies.filter(
      (p) => p.insurer.toLowerCase() === statement.insurer.toLowerCase(),
    ).slice(0, 3);
    const expected = (await db.commissions.getAll()).filter(
      (c) => c.status === ('EXPECTED' as CommissionStatus),
    );

    let matched = 0, disputed = 0, unexpected = 0, itemsParsed = 0;
    for (const [i, p] of insurerPolicies.entries()) {
      // earliest open expectation of this policy (acquisition before recurring)
      const exp = expected
        .filter((c) => c.policyId === p.id)
        .sort((a, b) => (a.period ?? '').localeCompare(b.period ?? ''))[0];
      // simulate: first item pays in full, second pays 20% short, third has no match
      const factor = i === 1 ? 0.8 : 1;
      const amount = Math.round((exp?.expectedAmount ?? (p.premiumAmount * 0.1)) * factor * 100) / 100;
      const item = await db.commissionStatementItems.create({
        tenantId, statementId,
        policyNumber: p.policyNumber, clientName: '', line: p.type,
        premium: p.premiumAmount, amount,
        matchStatus: exp ? (factor < 1 ? 'DISPUTED' : 'MATCHED') : 'UNEXPECTED',
        matchedCommissionId: exp?.id ?? null,
      } as any);
      itemsParsed++;
      if (exp) {
        await db.commissions.update(exp.id, {
          status: (factor < 1 ? 'DISPUTED' : 'PAID') as CommissionStatus,
          amount,
          statementItemId: item.id,
        } as any);
        factor < 1 ? disputed++ : matched++;
      } else {
        unexpected++;
      }
    }
    await db.commissionStatements.update(statementId, {
      status: 'RECONCILED', parsedAt: new Date().toISOString(),
      totalAmount: undefined,
    } as any);
    return { itemsParsed, matched, disputed, unexpected };
  },

  /** Anonymised cross-tenant benchmark (backend only; null when unavailable). */
  benchmark: async (insurer: string, line?: string): Promise<{ acquisitionRate: number; recurringRate: number; tenants: number } | null> => {
    if (USE_MOCK) return null;
    try {
      const qp = new URLSearchParams({ insurer, ...(line ? { line } : {}) });
      const res = await fetch(`${API_BASE}/api/commissions/benchmark?${qp}`, { headers: await authHeaders() });
      if (!res.ok) return null;
      return res.json();
    } catch {
      return null;
    }
  },
};
