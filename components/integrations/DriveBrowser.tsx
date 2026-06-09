import React, { useEffect, useState } from 'react';
import { integrationsApi, DriveProvider, DriveFile } from '../../src/services/integrations';
import { Folder, FileText, ExternalLink, ChevronRight, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  provider: DriveProvider;
  tenantId: string;
}

interface Crumb { id?: string; name: string; }

const formatSize = (bytes?: number) => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes, i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)} ${units[i]}`;
};

export const DriveBrowser: React.FC<Props> = ({ provider, tenantId }) => {
  const [path, setPath] = useState<Crumb[]>([{ name: 'Start' }]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = path[path.length - 1];

  const load = async (folderId?: string) => {
    setLoading(true);
    setError(null);
    try {
      setFiles(await integrationsApi.listFiles(provider, tenantId, folderId));
    } catch (e: any) {
      setError(e?.message || 'Konnte Dateien nicht laden.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(current.id); /* eslint-disable-next-line */ }, [provider, current.id]);

  const openFolder = (f: DriveFile) => setPath((p) => [...p, { id: f.id, name: f.name }]);
  const goTo = (idx: number) => setPath((p) => p.slice(0, idx + 1));

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-sm overflow-x-auto">
        {path.length > 1 && (
          <button onClick={() => goTo(path.length - 2)} className="p-1 text-slate-400 hover:text-slate-700 mr-1"><ArrowLeft size={16} /></button>
        )}
        {path.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight size={14} className="text-slate-400 shrink-0" />}
            <button onClick={() => goTo(i)} className={`whitespace-nowrap ${i === path.length - 1 ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}>{c.name}</button>
          </React.Fragment>
        ))}
        <button onClick={() => load(current.id)} className="ml-auto p-1 text-slate-400 hover:text-slate-700" title="Aktualisieren"><RefreshCw size={14} /></button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {loading && <div className="p-6 flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2" size={18} /> Lädt…</div>}
        {!loading && error && <div className="p-6 text-center text-sm text-red-500">{error}</div>}
        {!loading && !error && files.length === 0 && <div className="p-6 text-center text-sm text-slate-400">Dieser Ordner ist leer.</div>}
        {!loading && !error && files.map((f) => (
          <div key={f.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900/40">
            {f.type === 'folder'
              ? <button onClick={() => openFolder(f)} className="flex items-center gap-3 flex-1 text-left">
                  <Folder size={18} className="text-amber-500 shrink-0" />
                  <span className="font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
                </button>
              : <div className="flex items-center gap-3 flex-1">
                  <FileText size={18} className="text-slate-400 shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 truncate">{f.name}</span>
                </div>}
            <span className="text-xs text-slate-400 shrink-0">{formatSize(f.size)}</span>
            {(f.webUrl || f.downloadUrl) && (
              <a href={f.downloadUrl || f.webUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-brand-600 shrink-0" title="Öffnen"><ExternalLink size={15} /></a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
