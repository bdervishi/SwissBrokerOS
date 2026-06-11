import React, { useRef, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useDocuments } from '../../src/hooks/useData';
import { documentsService } from '../../src/services/documents';
import { USE_MOCK } from '../../src/services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useToast, useConfirm } from '../ui/Feedback';
import {
  ClientDocument, DocumentCategory, Policy, TaxReturn, MortgageScenario,
} from '../../types';
import {
  FileText, FileImage, FileSpreadsheet, File as FileIcon, Upload, Download,
  Trash2, Loader2, Link2, Plus,
} from 'lucide-react';

/**
 * Native document vault for one client: upload to Supabase Storage, categorise,
 * optionally link to a policy / tax return / mortgage, list + download + delete.
 * Lives alongside the cloud-drive section in the client's DOCUMENTS tab.
 */

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  POLICE: 'Police', OFFERTE: 'Offerte', STEUERN: 'Steuern', VORSORGE: 'Vorsorge',
  HYPOTHEK: 'Hypothek', IDENTITAET: 'Identität / KYC', KORRESPONDENZ: 'Korrespondenz',
  COURTAGE: 'Courtageabrechnung', SONSTIGES: 'Sonstiges',
};

const CATEGORY_COLORS: Record<DocumentCategory, string> = {
  POLICE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  OFFERTE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  STEUERN: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  VORSORGE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  HYPOTHEK: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  IDENTITAET: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  KORRESPONDENZ: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  COURTAGE: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  SONSTIGES: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
};

const fileIcon = (mime?: string) => {
  if (!mime) return <FileIcon size={18} className="text-slate-400" />;
  if (mime.startsWith('image/')) return <FileImage size={18} className="text-purple-500" />;
  if (mime.includes('pdf')) return <FileText size={18} className="text-red-500" />;
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return <FileSpreadsheet size={18} className="text-emerald-500" />;
  return <FileIcon size={18} className="text-slate-400" />;
};

const humanSize = (bytes?: number) => {
  if (!bytes) return '–';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

interface DocumentVaultProps {
  tenantId: string;
  clientId: string;
  policies?: Policy[];
  taxReturns?: TaxReturn[];
  mortgages?: MortgageScenario[];
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  tenantId, clientId, policies = [], taxReturns = [], mortgages = [],
}) => {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const { data: documents, loading, refetch } = useDocuments(clientId);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('SONSTIGES');
  const [related, setRelated] = useState('');   // '' | 'POLICY:<id>' | 'TAX_RETURN:<id>' | 'MORTGAGE:<id>'
  const [notes, setNotes] = useState('');

  const openUpload = () => {
    setFile(null); setTitle(''); setCategory('SONSTIGES'); setRelated(''); setNotes('');
    setError(null);
    setIsUploadOpen(true);
  };

  const onPickFile = (f: File | null) => {
    setFile(f);
    if (f && !title.trim()) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleUpload = async () => {
    setError(null);
    if (!file) { setError('Bitte eine Datei wählen.'); return; }
    setUploading(true);
    try {
      const [relatedType, relatedId] = related ? related.split(':') : [null, null];
      await documentsService.upload({
        tenantId, clientId, file,
        title: title.trim() || file.name,
        category,
        relatedType: (relatedType as any) || null,
        relatedId: relatedId || null,
        uploadedBy: user?.id ?? null,
        notes,
      });
      setIsUploadOpen(false);
      refetch();
    } catch (err: any) {
      setError(err?.message || 'Upload fehlgeschlagen.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: ClientDocument) => {
    setBusyDocId(doc.id);
    try {
      const url = await documentsService.downloadUrl(doc);
      if (url) window.open(url, '_blank', 'noopener');
    } catch (err: any) {
      toast.error(err?.message || 'Download fehlgeschlagen.');
    } finally {
      setBusyDocId(null);
    }
  };

  const handleDelete = async (doc: ClientDocument) => {
    if (!(await confirm({ title: 'Dokument löschen?', body: `«${doc.title}» wird unwiderruflich entfernt.`, danger: true, confirmLabel: 'Löschen' }))) return;
    setBusyDocId(doc.id);
    try {
      await documentsService.remove(doc);
      toast.success('Dokument gelöscht.');
      refetch();
    } finally {
      setBusyDocId(null);
    }
  };

  const relatedLabel = (doc: ClientDocument): string | null => {
    if (!doc.relatedType || !doc.relatedId) return null;
    if (doc.relatedType === 'POLICY') {
      const p = policies.find((x) => x.id === doc.relatedId);
      return p ? `Police: ${p.type} (${p.insurer})` : 'Police';
    }
    if (doc.relatedType === 'TAX_RETURN') {
      const t = taxReturns.find((x) => x.id === doc.relatedId);
      return t ? `Steuern ${t.year}` : 'Steuererklärung';
    }
    if (doc.relatedType === 'MORTGAGE') {
      const m = mortgages.find((x) => x.id === doc.relatedId);
      return m ? `Hypothek: ${m.propertyName}` : 'Hypothek';
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
      <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100">Dokumenten-Ablage</h4>
          <p className="text-xs text-slate-500">
            {USE_MOCK ? 'Demo-Modus: nur Metadaten, kein echter Upload.' : 'Sicher gespeichert (privater Speicher, mandantengetrennt).'}
          </p>
        </div>
        <Button size="sm" icon={<Upload size={14} />} onClick={openUpload}>Dokument hochladen</Button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin inline" size={20} /></div>
      ) : documents.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">Noch keine Dokumente abgelegt.</div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {documents.map((doc) => (
            <div key={doc.id} className="px-6 py-3 flex items-center gap-4 group">
              <div className="shrink-0">{fileIcon(doc.mimeType)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${CATEGORY_COLORS[doc.category] ?? CATEGORY_COLORS.SONSTIGES}`}>
                    {CATEGORY_LABELS[doc.category] ?? doc.category}
                  </span>
                  {relatedLabel(doc) && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-slate-500"><Link2 size={10} /> {relatedLabel(doc)}</span>
                  )}
                  <span className="text-[10px] text-slate-400">{humanSize(doc.sizeBytes)}</span>
                  {doc.createdAt && <span className="text-[10px] text-slate-400">{String(doc.createdAt).slice(0, 10)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {doc.storagePath && (
                  <button onClick={() => handleDownload(doc)} disabled={busyDocId === doc.id} className="p-2 text-slate-400 hover:text-brand-600 transition-colors" title="Herunterladen">
                    {busyDocId === doc.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                  </button>
                )}
                <button onClick={() => handleDelete(doc)} disabled={busyDocId === doc.id} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Löschen">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Dokument hochladen" maxWidth="max-w-xl">
        <div className="space-y-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-6 text-center cursor-pointer hover:border-brand-400 transition-colors"
          >
            <input ref={fileRef} type="file" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0] ?? null)} />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                {fileIcon(file.type)} {file.name} <span className="text-slate-400">({humanSize(file.size)})</span>
              </div>
            ) : (
              <div className="text-slate-400 text-sm flex flex-col items-center gap-2">
                <Plus size={24} />
                Datei wählen (PDF, Bild, Office …)
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="z.B. Police Hausrat 2026" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Kategorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value as DocumentCategory)} className={inputCls}>
                {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((c) => (
                  <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verknüpfen mit</label>
              <select value={related} onChange={(e) => setRelated(e.target.value)} className={inputCls}>
                <option value="">– keine Verknüpfung –</option>
                {policies.length > 0 && (
                  <optgroup label="Policen">
                    {policies.map((p) => <option key={p.id} value={`POLICY:${p.id}`}>{p.type} ({p.insurer})</option>)}
                  </optgroup>
                )}
                {taxReturns.length > 0 && (
                  <optgroup label="Steuererklärungen">
                    {taxReturns.map((t) => <option key={t.id} value={`TAX_RETURN:${t.id}`}>Steuerjahr {t.year}</option>)}
                  </optgroup>
                )}
                {mortgages.length > 0 && (
                  <optgroup label="Hypotheken">
                    {mortgages.map((m) => <option key={m.id} value={`MORTGAGE:${m.id}`}>{m.propertyName}</option>)}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Notiz</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputCls} min-h-[50px]`} />
          </div>

          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={uploading}>Abbrechen</Button>
            <Button onClick={handleUpload} disabled={uploading || !file}>
              {uploading ? <Loader2 className="animate-spin" size={18} /> : 'Hochladen'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';
