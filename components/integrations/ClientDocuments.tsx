import React, { useEffect, useState } from 'react';
import { integrationsApi, DriveProvider, ClientFolderMapping } from '../../src/services/integrations';
import { DriveBrowser } from './DriveBrowser';
import { Button } from '../ui/Button';
import { Cloud, Link2, Loader2, FolderOpen } from 'lucide-react';

const PROVIDERS: { code: DriveProvider; name: string }[] = [
  { code: 'google_drive', name: 'Google Drive' },
  { code: 'microsoft_onedrive', name: 'OneDrive' },
  { code: 'dropbox', name: 'Dropbox' },
];

interface Props {
  tenantId: string;
  clientId: string;
}

export const ClientDocuments: React.FC<Props> = ({ tenantId, clientId }) => {
  const [connected, setConnected] = useState<DriveProvider[]>([]);
  const [mappings, setMappings] = useState<ClientFolderMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState<DriveProvider | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    if (!tenantId || !clientId) { setLoading(false); return; }
    setLoading(true);
    const [statuses, maps] = await Promise.all([
      Promise.all(PROVIDERS.map(async (p) => [p.code, (await integrationsApi.status(p.code, tenantId)).connected] as const)),
      integrationsApi.getClientMappings(tenantId, clientId),
    ]);
    setConnected(statuses.filter(([, c]) => c).map(([code]) => code));
    setMappings(maps);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [tenantId, clientId]);

  const mappingFor = (p: DriveProvider) => mappings.find((m) => m.provider === p);
  const nameOf = (p: DriveProvider) => PROVIDERS.find((x) => x.code === p)?.name || p;

  const link = async (provider: DriveProvider, folderId: string) => {
    setBusy(true);
    try {
      await integrationsApi.linkClientFolder(tenantId, clientId, provider, folderId);
      setPicking(null);
      await refresh();
    } finally { setBusy(false); }
  };
  const unlink = async (provider: DriveProvider) => {
    setBusy(true);
    try { await integrationsApi.unlinkClientFolder(tenantId, clientId, provider); await refresh(); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="p-6 flex items-center justify-center text-slate-400"><Loader2 className="animate-spin mr-2" size={18} /> Lädt…</div>;

  if (connected.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
        <Cloud className="mx-auto text-slate-300 mb-3" size={32} />
        <p className="text-slate-500">Kein Cloud-Speicher verbunden.</p>
        <p className="text-sm text-slate-400 mt-1">Verbinde Google Drive, OneDrive oder Dropbox unter <span className="font-medium">Integrationen</span>, um Kundendokumente direkt anzuzeigen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {connected.map((provider) => {
        const mapping = mappingFor(provider);
        return (
          <div key={provider} className="border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Cloud size={16} className="text-brand-600" /> {nameOf(provider)}
              </div>
              {mapping ? (
                <Button size="sm" variant="ghost" onClick={() => unlink(provider)} disabled={busy}>Verknüpfung lösen</Button>
              ) : picking === provider ? (
                <Button size="sm" variant="ghost" onClick={() => setPicking(null)}>Abbrechen</Button>
              ) : (
                <Button size="sm" variant="outline" icon={<Link2 size={14} />} onClick={() => setPicking(provider)}>Ordner verknüpfen</Button>
              )}
            </div>
            <div className="p-4">
              {mapping ? (
                <DriveBrowser provider={provider} tenantId={tenantId} rootId={mapping.folderId} rootName="Kundenordner" />
              ) : picking === provider ? (
                <>
                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><FolderOpen size={13} /> Zum gewünschten Ordner navigieren und oben rechts „Ordner verknüpfen" klicken.</p>
                  <DriveBrowser provider={provider} tenantId={tenantId} onLinkFolder={(folderId) => link(provider, folderId)} />
                </>
              ) : (
                <p className="text-sm text-slate-400">Noch kein Ordner mit diesem Kunden verknüpft.</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
