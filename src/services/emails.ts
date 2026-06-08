import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Email } from '../types';
import { MOCK_EMAILS } from '../constants';

const env = (import.meta as any).env || {};
const forceMock = String(env.VITE_USE_MOCK_DATA ?? 'true').toLowerCase() !== 'false';
const USE_MOCK = forceMock || !isSupabaseConfigured;

const rowToEmail = (row: any): Email => ({
  id: row.id,
  senderName: row.sender_name,
  senderEmail: row.sender_email,
  subject: row.subject,
  preview: row.preview,
  content: row.content,
  date: row.date ? new Date(row.date) : new Date(),
  isRead: row.is_read ?? false,
  folder: row.folder ?? 'INBOX',
  source: row.source,
  priority: row.priority,
  tags: row.tags ?? [],
  category: row.category,
  snoozedUntil: row.snoozed_until ? new Date(row.snoozed_until) : undefined,
  attachments: row.attachments ?? undefined,
});

// Patch (camel) -> row (snake) for the fields the UI mutates.
const patchToRow = (p: Partial<Email>) => {
  const out: Record<string, any> = {};
  if (p.isRead !== undefined) out.is_read = p.isRead;
  if (p.folder !== undefined) out.folder = p.folder;
  if (p.tags !== undefined) out.tags = p.tags;
  if (p.snoozedUntil !== undefined) out.snoozed_until = p.snoozedUntil instanceof Date ? p.snoozedUntil.toISOString() : p.snoozedUntil;
  return out;
};

const store: Email[] = MOCK_EMAILS.map((e) => ({ ...e }));

export const emailsService = {
  getAll: async (tenantId?: string): Promise<Email[]> => {
    if (USE_MOCK) return store;
    let query = supabase.from('emails').select('*').order('date', { ascending: false });
    if (tenantId) query = query.eq('tenant_id', tenantId);
    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(rowToEmail);
  },

  update: async (id: string, patch: Partial<Email>): Promise<void> => {
    if (USE_MOCK) {
      const e = store.find((x) => x.id === id);
      if (e) Object.assign(e, patch);
      return;
    }
    const { error } = await supabase.from('emails').update(patchToRow(patch)).eq('id', id);
    if (error) throw error;
  },
};
