import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, USE_MOCK } from './db';
import { ClientDocument, DocumentCategory } from '../types';

/**
 * Native document service: binaries go to the private Supabase Storage bucket
 * `documents` (path: <tenant_id>/<client_id>/<uuid>-<filename>, enforced by
 * storage RLS), metadata rows go to public.documents via the generic data
 * layer. In mock mode only the metadata row is kept (no real upload).
 */

export interface UploadDocumentInput {
  tenantId: string;
  clientId: string;
  file: File;
  title: string;
  category: DocumentCategory;
  relatedType?: 'POLICY' | 'MORTGAGE' | 'TAX_RETURN' | null;
  relatedId?: string | null;
  uploadedBy?: string | null;
  notes?: string;
}

const BUCKET = 'documents';

// Storage object keys must be ASCII-safe; keep the original name in file_name.
const sanitizeFileName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'datei';

export const documentsService = {
  list: (clientId: string): Promise<ClientDocument[]> =>
    db.documents.getAll({ clientId }),

  upload: async (input: UploadDocumentInput): Promise<ClientDocument> => {
    const meta: Partial<ClientDocument> = {
      tenantId: input.tenantId,
      clientId: input.clientId,
      title: input.title.trim() || input.file.name,
      category: input.category,
      relatedType: input.relatedType ?? null,
      relatedId: input.relatedId ?? null,
      fileName: input.file.name,
      mimeType: input.file.type || 'application/octet-stream',
      sizeBytes: input.file.size,
      uploadedBy: input.uploadedBy ?? null,
      notes: input.notes?.trim() || undefined,
    };

    if (USE_MOCK || !isSupabaseConfigured) {
      // Mock mode: metadata only – good enough to exercise the UI offline.
      return db.documents.create({ ...meta, createdAt: new Date().toISOString() });
    }

    const path = `${input.tenantId}/${input.clientId}/${crypto.randomUUID()}-${sanitizeFileName(input.file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, input.file, { contentType: meta.mimeType, upsert: false });
    if (upErr) throw new Error(`Upload fehlgeschlagen: ${upErr.message}`);

    try {
      return await db.documents.create({ ...meta, storagePath: path });
    } catch (err) {
      // Don't leave orphaned binaries when the metadata insert fails.
      await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
      throw err;
    }
  },

  /** Short-lived signed URL for viewing/downloading (private bucket). */
  downloadUrl: async (doc: ClientDocument): Promise<string | null> => {
    if (!doc.storagePath || USE_MOCK || !isSupabaseConfigured) return null;
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(doc.storagePath, 300);
    if (error) throw new Error(`Download-Link fehlgeschlagen: ${error.message}`);
    return data?.signedUrl ?? null;
  },

  remove: async (doc: ClientDocument): Promise<void> => {
    if (doc.storagePath && !USE_MOCK && isSupabaseConfigured) {
      // Best effort: a stale binary is preferable to a dangling metadata row.
      await supabase.storage.from(BUCKET).remove([doc.storagePath]).catch(() => undefined);
    }
    await db.documents.remove(doc.id);
  },
};
