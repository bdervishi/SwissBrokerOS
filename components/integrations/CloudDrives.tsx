import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { integrationsApi, DriveProvider } from '../../src/services/integrations';
import { DriveBrowser } from './DriveBrowser';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Cloud, CheckCircle2, FolderOpen, Loader2 } from 'lucide-react';

const PROVIDERS: { code: DriveProvider; name: string; hint: string }[] = [
  { code: 'google_drive', name: 'Google Drive', hint: 'Google Workspace' },
  { code: 'microsoft_onedrive', name: 'Microsoft OneDrive', hint: 'Office 365' },
];

export const CloudDrives: React.FC = () => {
  const { user } = useAuth();
  const tenantId = user?.tenantId || '';
  const [status, setStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [openBrowser, setOpenBrowser] = useState<DriveProvider | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = async () => {
    if (!tenantId) { setLoading(false); return; }
    setLoading(true);
    const entries = await Promise.all(
      PROVIDERS.map(async (p) => [p.code, (await integrationsApi.status(p.code, tenantId)).connected] as const),
    );
    setStatus(Object.fromEntries(entries));
    setLoading(false);
  };

  useEffect(() => {
    // Feedback after the OAuth redirect (#/integrations?provider=..&status=..)
    const hash = window.location.hash;
    const qIndex = hash.indexOf('?');
    if (qIndex !== -1) {
      const params = new URLSearchParams(hash.slice(qIndex + 1));
      const st = params.get('status');
      const prov = params.get('provider');
      if (st === 'connected') setNotice(`${prov === 'microsoft_onedrive' ? 'OneDrive' : 'Google Drive'} erfolgreich verbunden.`);
      else if (st === 'error') setNotice('Verbindung fehlgeschlagen. Bitte erneut versuchen.');
    }
    refresh();
    // eslint-disable-next-line
  }, [tenantId]);

  const connect = (code: DriveProvider) => {
    window.location.href = integrationsApi.connectUrl(code, tenantId);
  };
  const disconnect = async (code: DriveProvider) => {
    await integrationsApi.disconnect(code, tenantId);
    if (openBrowser === code) setOpenBrowser(null);
    refresh();
  };

  return (
    <Card title="Cloud-Speicher" className="mb-8">
      <p className="text-sm text-slate-500 dark:text-slate-400 -mt-2 mb-4">
        Verbinde den Cloud-Speicher deines Mandanten, um Kundendokumente direkt aus dem Drive zu laden und anzuzeigen.
      </p>
      {notice && (
        <div className="mb-4 px-3 py-2 rounded-lg text-sm bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300">{notice}</div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROVIDERS.map((p) => {
          const connected = !!status[p.code];
          return (
            <div key={p.code} className="border border-slate-200 dark:border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Cloud size={20} className="text-brand-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.hint}</p>
                  </div>
                </div>
                {loading ? <Loader2 className="animate-spin text-slate-400" size={18} /> : connected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><CheckCircle2 size={14} /> Verbunden</span>
                ) : null}
              </div>

              <div className="mt-4 flex gap-2">
                {connected ? (
                  <>
                    <Button size="sm" variant="outline" icon={<FolderOpen size={15} />} onClick={() => setOpenBrowser(openBrowser === p.code ? null : p.code)}>
                      {openBrowser === p.code ? 'Dateien ausblenden' : 'Dateien anzeigen'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => disconnect(p.code)}>Trennen</Button>
                  </>
                ) : (
                  <Button size="sm" onClick={() => connect(p.code)} disabled={!tenantId}>Verbinden</Button>
                )}
              </div>

              {connected && openBrowser === p.code && (
                <div className="mt-4">
                  <DriveBrowser provider={p.code} tenantId={tenantId} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
