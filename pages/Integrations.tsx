import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_INTEGRATIONS } from '../constants';
import { Integration, IntegrationStatus, IntegrationCategory } from '../types';
import { Blocks, Check, RefreshCw, AlertCircle, ExternalLink, Settings as SettingsIcon, Link as LinkIcon, Lock, Server, Loader2, XCircle, Mail, User } from 'lucide-react';

export const Integrations: React.FC = () => {
  const [filter, setFilter] = useState<IntegrationCategory | 'ALL'>('ALL');
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Integration Logic
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'CONNECT' | 'SELECT_ACCOUNTS' | 'SUCCESS'>('CONNECT');
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  // Mock Data found during "Scan"
  const [foundAccounts, setFoundAccounts] = useState([
      { email: 'max.muster@swissbroker.ch', type: 'Personal', selected: true },
      { email: 'schaden@swissbroker.ch', type: 'Shared Mailbox', selected: true },
      { email: 'info@swissbroker.ch', type: 'Alias', selected: false }
  ]);

  // Local state for integrations to handle updates
  const [localIntegrations, setLocalIntegrations] = useState(MOCK_INTEGRATIONS);

  const filteredIntegrations = filter === 'ALL' 
    ? localIntegrations 
    : localIntegrations.filter(i => i.category === filter);

  // Derived selected integration
  const selectedIntegration = localIntegrations.find(i => i.id === selectedIntegrationId) || null;

  const handleOpenModal = (integration: Integration) => {
    setSelectedIntegrationId(integration.id);
    setApiKeyInput(''); 
    setStep('CONNECT'); // Reset step
    // Reset mock accounts selection
    setFoundAccounts(prev => prev.map(a => ({...a, selected: a.type !== 'Alias'})));
    setIsModalOpen(true);
  };

  const handleConnect = async () => {
      if (!selectedIntegration) return;
      
      setIsLoading(true);
      
      // Simulate API/OAuth call with delay
      setTimeout(() => {
          setIsLoading(false);
          
          if (selectedIntegration.connectionType === 'OAUTH') {
              // OAuth flow moves to Account Selection
              setStep('SELECT_ACCOUNTS');
          } else {
              // API Key flow connects directly (or fails)
              if (apiKeyInput.trim().length < 5) {
                  updateIntegrationStatus(selectedIntegration.id, IntegrationStatus.ERROR, 'Ungültiger API-Schlüssel.');
              } else {
                  updateIntegrationStatus(selectedIntegration.id, IntegrationStatus.CONNECTED);
                  setStep('SUCCESS');
              }
          }
      }, 1500);
  };

  const handleFinalizeSync = () => {
      if (!selectedIntegration) return;
      setIsLoading(true);
      setTimeout(() => {
          updateIntegrationStatus(selectedIntegration.id, IntegrationStatus.CONNECTED);
          setIsLoading(false);
          setStep('SUCCESS');
      }, 1000);
  }

  const updateIntegrationStatus = (id: string, status: IntegrationStatus, error?: string) => {
      setLocalIntegrations(prev => prev.map(i => 
          i.id === id ? { 
              ...i, 
              status, 
              lastSync: status === IntegrationStatus.CONNECTED ? 'Gerade eben' : i.lastSync,
              errorMessage: error 
          } : i
      ));
  };

  const handleDisconnect = () => {
      if (selectedIntegration) {
          updateIntegrationStatus(selectedIntegration.id, IntegrationStatus.DISCONNECTED);
          setApiKeyInput('');
          setStep('CONNECT');
          setIsModalOpen(false);
      }
  }

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Integrationen & API</h1>
        <p className="text-slate-500 dark:text-slate-400">Verbinden Sie SwissBroker OS mit Ihren bevorzugten Tools und Schweizer Services.</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <FilterButton label="Alle" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
        <FilterButton label="Buchhaltung" active={filter === IntegrationCategory.ACCOUNTING} onClick={() => setFilter(IntegrationCategory.ACCOUNTING)} />
        <FilterButton label="Kommunikation" active={filter === IntegrationCategory.COMMUNICATION} onClick={() => setFilter(IntegrationCategory.COMMUNICATION)} />
        <FilterButton label="Banking" active={filter === IntegrationCategory.BANKING} onClick={() => setFilter(IntegrationCategory.BANKING)} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredIntegrations.map(integration => (
          <div key={integration.id} className={`bg-white dark:bg-slate-900 border rounded-xl p-6 flex flex-col h-full shadow-sm hover:shadow-md transition-all ${integration.status === IntegrationStatus.ERROR ? 'border-red-200 dark:border-red-900/50' : 'border-slate-200 dark:border-slate-800'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-slate-700 dark:text-slate-300">
                {integration.iconUrl}
              </div>
              <StatusBadge status={integration.status} />
            </div>
            
            <div className="mb-4 flex-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">{integration.name}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {integration.description}
              </p>
              
              {/* Error Message on Card */}
              {integration.status === IntegrationStatus.ERROR && integration.errorMessage && (
                  <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                      <span>{integration.errorMessage}</span>
                  </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {integration.status === IntegrationStatus.CONNECTED && (
                    <span className="flex items-center gap-1"><RefreshCw size={12} /> Sync: {integration.lastSync}</span>
                )}
              </div>
              <Button 
                variant={integration.status === IntegrationStatus.CONNECTED ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleOpenModal(integration)}
              >
                {integration.status === IntegrationStatus.CONNECTED ? 'Verwalten' : 'Verbinden'}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Integration Configuration Modal */}
      {selectedIntegration && (
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={`${selectedIntegration.name} Integration`}
            maxWidth="max-w-lg"
          >
              <div className="space-y-6">
                 {/* Header Info */}
                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                     <div className="w-10 h-10 rounded bg-white dark:bg-slate-700 flex items-center justify-center font-bold">
                        {selectedIntegration.iconUrl}
                     </div>
                     <div>
                         <h4 className="font-medium text-slate-900 dark:text-slate-100">{selectedIntegration.name}</h4>
                         <div className="flex gap-2 text-xs text-slate-500">
                             <span>{selectedIntegration.category}</span>
                             <span>•</span>
                             <span>{selectedIntegration.connectionType === 'OAUTH' ? 'OAuth 2.0' : 'API Key'}</span>
                         </div>
                     </div>
                 </div>

                 {/* STEP 1: CONNECT */}
                 {step === 'CONNECT' && (
                     <>
                        {selectedIntegration.status === IntegrationStatus.ERROR && (
                            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg flex gap-3">
                                <XCircle className="text-red-600 dark:text-red-400 shrink-0" size={20} />
                                <div>
                                    <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Verbindungsfehler</h4>
                                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                        {selectedIntegration.errorMessage || 'Ein unbekannter Fehler ist aufgetreten.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedIntegration.status === IntegrationStatus.CONNECTED ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg flex items-center gap-3">
                                    <Check className="text-emerald-600" />
                                    <span className="text-sm text-emerald-800 dark:text-emerald-200">Verbindung ist aktiv.</span>
                                </div>
                                <Button variant="danger" onClick={handleDisconnect} className="w-full">Verbindung trennen</Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* OAUTH UI */}
                                {selectedIntegration.connectionType === 'OAUTH' ? (
                                    <div className="text-center py-6">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                                            Sie werden zur Anmeldeseite von {selectedIntegration.name} weitergeleitet, um den Zugriff zu autorisieren.
                                        </p>
                                        <Button 
                                            onClick={handleConnect} 
                                            className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800"
                                            disabled={isLoading}
                                            icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <ExternalLink size={18} />}
                                        >
                                            {isLoading ? 'Warte auf Autorisierung...' : `Mit ${selectedIntegration.name.split(' ')[0]} anmelden`}
                                        </Button>
                                    </div>
                                ) : (
                                    /* API KEY UI */
                                    <div className="space-y-4">
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            Bitte geben Sie Ihren API-Schlüssel ein.
                                        </p>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">API Token</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                                <input 
                                                    type="password"
                                                    value={apiKeyInput}
                                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                                    className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500"
                                                    placeholder="sk_live_..."
                                                />
                                            </div>
                                        </div>
                                        <Button 
                                            onClick={handleConnect} 
                                            className="w-full"
                                            disabled={isLoading}
                                            icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : undefined}
                                        >
                                            {isLoading ? 'Prüfe Schlüssel...' : 'Verbinden'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                     </>
                 )}

                 {/* STEP 2: SELECT ACCOUNTS (OAuth only) */}
                 {step === 'SELECT_ACCOUNTS' && (
                     <div className="space-y-4">
                         <h5 className="font-medium text-slate-900 dark:text-slate-100 flex items-center gap-2">
                             <Mail size={16} className="text-brand-500" />
                             Gefundene Postfächer
                         </h5>
                         <p className="text-sm text-slate-500">Wählen Sie die Adressen aus, die Sie in SwissBroker OS synchronisieren möchten.</p>
                         
                         <div className="space-y-2 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                             {foundAccounts.map((acc, idx) => (
                                 <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                                             {acc.type === 'Personal' ? <User size={14} /> : <Mail size={14} />}
                                         </div>
                                         <div>
                                             <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{acc.email}</p>
                                             <p className="text-xs text-slate-500">{acc.type}</p>
                                         </div>
                                     </div>
                                     <input 
                                        type="checkbox" 
                                        checked={acc.selected} 
                                        onChange={() => {
                                            const newAccounts = [...foundAccounts];
                                            newAccounts[idx].selected = !newAccounts[idx].selected;
                                            setFoundAccounts(newAccounts);
                                        }}
                                        className="w-5 h-5 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                                     />
                                 </div>
                             ))}
                         </div>

                         <div className="pt-4 flex justify-end gap-2">
                             <Button variant="ghost" onClick={() => setStep('CONNECT')}>Zurück</Button>
                             <Button 
                                onClick={handleFinalizeSync} 
                                disabled={isLoading || !foundAccounts.some(a => a.selected)}
                                icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : undefined}
                             >
                                 {isLoading ? 'Synchronisiere...' : 'Auswahl importieren'}
                             </Button>
                         </div>
                     </div>
                 )}

                 {/* STEP 3: SUCCESS */}
                 {step === 'SUCCESS' && (
                     <div className="text-center py-8">
                         <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Check size={32} />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Erfolgreich verbunden!</h3>
                         <p className="text-slate-500 dark:text-slate-400 mb-6">
                             Die Synchronisation läuft im Hintergrund. Emails erscheinen in Kürze in Ihrer Inbox.
                         </p>
                         <Button onClick={() => setIsModalOpen(false)} className="w-full">Schliessen</Button>
                     </div>
                 )}
              </div>
          </Modal>
      )}

    </Layout>
  );
};

const FilterButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            active 
            ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20' 
            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
        }`}
    >
        {label}
    </button>
);

const StatusBadge = ({ status }: { status: IntegrationStatus }) => {
    switch (status) {
        case IntegrationStatus.CONNECTED:
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <Check size={12} /> Verbunden
                </span>
            );
        case IntegrationStatus.ERROR:
             return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    Fehler
                </span>
            );
        default:
             return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400">
                    Getrennt
                </span>
            );
    }
}