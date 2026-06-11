import React, { useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useClients, usePolicies, useDocuments } from '../src/hooks/useData';
import { notificationsService } from '../src/services/notifications';
import { documentsService } from '../src/services/documents';
import { useToast } from '../components/ui/Feedback';
import { CATEGORY_LABELS } from '../components/documents/DocumentVault';
import { UserRole, ClientDocument } from '../types';
import {
  ShieldAlert, FileText, Download, Loader2, AlertTriangle, CalendarPlus,
  FolderOpen, MessageSquare, CheckCircle2,
} from 'lucide-react';

/**
 * Kundenportal (Self-Service für die Endkunden-Rolle):
 *  - eigene Dokumente einsehen & herunterladen (read-only)
 *  - Schaden melden  -> Benachrichtigung an den zuständigen Berater
 *  - Termin anfragen -> Benachrichtigung an den zuständigen Berater
 * Alles tenant-/kundengetrennt; keine Schreibrechte auf fremde Daten.
 */

type RequestKind = 'CLAIM' | 'APPOINTMENT' | 'QUESTION';

const humanSize = (b?: number) => !b ? '–' : b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1048576).toFixed(1)} MB`;

export const ClientPortal: React.FC = () => {
  const { user, role } = useAuth();
  const toast = useToast();
  const { data: clients } = useClients();
  const me = useMemo(() => clients.find((c) => c.username === user?.username || c.id === user?.id), [clients, user]);
  const { data: policies } = usePolicies(me?.id);
  const { data: documents, loading: docsLoading } = useDocuments(me?.id);

  const [kind, setKind] = useState<RequestKind | null>(null);
  const [message, setMessage] = useState('');
  const [policyId, setPolicyId] = useState('');
  const [sending, setSending] = useState(false);
  const [busyDoc, setBusyDoc] = useState<string | null>(null);

  if (role !== UserRole.CLIENT) return <Navigate to="/dashboard" />;

  const openRequest = (k: RequestKind) => { setKind(k); setMessage(''); setPolicyId(''); };

  const sendRequest = async () => {
    if (!me) { toast.error('Kundenprofil nicht gefunden.'); return; }
    if (!message.trim()) { toast.warning('Bitte beschreibe dein Anliegen kurz.'); return; }
    setSending(true);
    try {
      const labels: Record<RequestKind, string> = {
        CLAIM: 'Schadenmeldung', APPOINTMENT: 'Terminanfrage', QUESTION: 'Anfrage',
      };
      const pol = policies.find((p) => p.id === policyId);
      await notificationsService.create({
        tenantId: me.tenantId,
        recipientId: me.advisorId,
        actorId: me.id,
        type: kind === 'APPOINTMENT' ? 'SYSTEM' : 'SYSTEM',
        title: `${labels[kind!]} von ${me.firstName} ${me.lastName}`,
        body: `${pol ? `Police: ${pol.type} (${pol.insurer})\n` : ''}${message.trim()}`,
        link: `/client/${me.id}`,
        relatedType: 'CLIENT',
        relatedId: me.id,
      });
      setKind(null);
      toast.success('Ihr Anliegen wurde an Ihren Berater übermittelt. Sie hören in Kürze von uns.');
    } catch (e: any) {
      toast.error(e?.message || 'Senden fehlgeschlagen.');
    } finally {
      setSending(false);
    }
  };

  const download = async (doc: ClientDocument) => {
    setBusyDoc(doc.id);
    try {
      const url = await documentsService.downloadUrl(doc);
      if (url) window.open(url, '_blank', 'noopener');
      else toast.info('Dieses Dokument ist nur als Verweis hinterlegt.');
    } catch (e: any) {
      toast.error(e?.message || 'Download fehlgeschlagen.');
    } finally {
      setBusyDoc(null);
    }
  };

  const modalTitle = kind === 'CLAIM' ? 'Schaden melden' : kind === 'APPOINTMENT' ? 'Termin anfragen' : 'Frage stellen';

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Mein Portal</h1>
        <p className="text-slate-500 dark:text-slate-400">Dokumente, Schadenmeldung und Kontakt zu Ihrem Berater – an einem Ort.</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ActionCard icon={<AlertTriangle className="text-red-600" size={22} />} title="Schaden melden" desc="Schnell & unkompliziert" onClick={() => openRequest('CLAIM')} tone="red" />
        <ActionCard icon={<CalendarPlus className="text-brand-600" size={22} />} title="Termin anfragen" desc="Beratungsgespräch buchen" onClick={() => openRequest('APPOINTMENT')} tone="brand" />
        <ActionCard icon={<MessageSquare className="text-emerald-600" size={22} />} title="Frage stellen" desc="Direkt an Ihren Berater" onClick={() => openRequest('QUESTION')} tone="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Documents */}
        <div className="lg:col-span-2">
          <Card noPadding>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <FolderOpen size={18} className="text-brand-600" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Meine Dokumente</h3>
            </div>
            {docsLoading ? (
              <div className="p-8 text-center text-slate-400"><Loader2 className="animate-spin inline" size={20} /></div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">Noch keine Dokumente freigegeben. Ihr Berater stellt Policen & Unterlagen hier bereit.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {documents.map((doc) => (
                  <div key={doc.id} className="px-6 py-3 flex items-center gap-3">
                    <FileText size={18} className="text-slate-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{doc.title}</p>
                      <p className="text-[11px] text-slate-400">{CATEGORY_LABELS[doc.category] ?? doc.category} · {humanSize(doc.sizeBytes)}{doc.createdAt ? ` · ${String(doc.createdAt).slice(0, 10)}` : ''}</p>
                    </div>
                    {doc.storagePath && (
                      <button onClick={() => download(doc)} disabled={busyDoc === doc.id} className="p-2 text-slate-400 hover:text-brand-600 transition-colors" title="Herunterladen">
                        {busyDoc === doc.id ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* My coverage */}
        <div>
          <Card noPadding>
            <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <ShieldAlert size={18} className="text-brand-600" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Mein Versicherungsschutz</h3>
            </div>
            {policies.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">Keine Policen hinterlegt.</div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {policies.map((p) => (
                  <Link key={p.id} to={`/policy/${p.id}`} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{p.type}</p>
                      <p className="text-xs text-slate-500">{p.insurer}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Request modal */}
      <Modal isOpen={!!kind} onClose={() => setKind(null)} title={modalTitle} maxWidth="max-w-lg">
        <div className="space-y-4">
          {(kind === 'CLAIM' || kind === 'QUESTION') && policies.length > 0 && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Police (optional)</label>
              <select value={policyId} onChange={(e) => setPolicyId(e.target.value)} className={inputCls}>
                <option value="">– keine bestimmte Police –</option>
                {policies.map((p) => <option key={p.id} value={p.id}>{p.type} ({p.insurer})</option>)}
              </select>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {kind === 'CLAIM' ? 'Was ist passiert?' : kind === 'APPOINTMENT' ? 'Wunschtermin & Anliegen' : 'Ihre Frage'}
            </label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputCls} min-h-[120px]`}
              placeholder={kind === 'CLAIM' ? 'Beschreiben Sie den Schaden, Datum, Ort …' : kind === 'APPOINTMENT' ? 'z.B. nächste Woche nachmittags, Thema Vorsorge' : 'Ihre Frage an den Berater …'} />
          </div>
          <p className="text-xs text-slate-400">Ihr Berater wird umgehend benachrichtigt und meldet sich bei Ihnen.</p>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setKind(null)} disabled={sending}>Abbrechen</Button>
            <Button onClick={sendRequest} disabled={sending}>{sending ? <Loader2 className="animate-spin" size={18} /> : 'Senden'}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm';

const ActionCard: React.FC<{ icon: React.ReactNode; title: string; desc: string; onClick: () => void; tone: 'red' | 'brand' | 'emerald' }> = ({ icon, title, desc, onClick, tone }) => {
  const ring = { red: 'hover:border-red-300', brand: 'hover:border-brand-300', emerald: 'hover:border-emerald-300' }[tone];
  return (
    <button onClick={onClick} className={`text-left p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all ${ring}`}>
      <div className="w-11 h-11 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">{icon}</div>
      <p className="font-bold text-slate-900 dark:text-slate-100">{title}</p>
      <p className="text-xs text-slate-500">{desc}</p>
    </button>
  );
};
