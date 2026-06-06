
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { MOCK_INTEGRATIONS, MOCK_DRIVE_FOLDERS } from '../constants';
import { Integration, IntegrationStatus, IntegrationCategory } from '../types';
import { useBranding } from '../contexts/BrandingContext';
import { Blocks, Check, RefreshCw, AlertCircle, ExternalLink, Settings as SettingsIcon, Link as LinkIcon, Lock, Server, Loader2, XCircle, Mail, User, Folder, HardDrive, ChevronRight, ChevronDown, CheckCircle, Database, Shield, Zap, TrendingUp, Cloud, CreditCard } from 'lucide-react';

export const Integrations: React.FC = () => {
  const { tenant } = useBranding();
  const [filter, setFilter] = useState<IntegrationCategory | 'ALL'>('ALL');
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for Generic Integration Logic
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'CONNECT' | 'SELECT_ACCOUNTS' | 'SUCCESS' | 'STORAGE_CONFIG' | 'UPGRADE_OFFER'>('CONNECT');
  const [apiKeyInput, setApiKeyInput] = useState('');
  
  // Mock Data found during "Scan" (Email)
  const [foundAccounts, setFoundAccounts] = useState([
      { email: 'max.muster@swissbroker.ch', type: 'Personal', selected: true },
      { email: 'schaden@swissbroker.ch', type: 'Shared Mailbox', selected: true },
      { email: 'info@swissbroker.ch', type: 'Alias', selected: false }
  ]);

  // State for Storage Wizard
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['root']);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [storageConfig, setStorageConfig] = useState({
      mappingStrategy: 'EXACT_MATCH',
      enableAiIndexing: false
  });

  // Local state for integrations to handle updates
  const [localIntegrations, setLocalIntegrations] = useState(MOCK_INTEGRATIONS);

  // Managed Storage Props (Mocked from Tenant if available)
  const quotaUsed = tenant?.storageQuota?.usedBytes || 0;
  const quotaLimit = tenant?.storageQuota?.limitBytes || 5000000000; // 5GB default
  const quotaPercent = (quotaUsed / quotaLimit) * 100;

  const filteredIntegrations = filter === 'ALL' 
    ? localIntegrations 
    : localIntegrations.filter(i => i.category === filter);

  // Derived selected integration
  const selectedIntegration = localIntegrations.find(i => i.id === selectedIntegrationId) || null;

  const handleOpenModal = (integration: Integration) => {
    setSelectedIntegrationId(integration.id);
    setApiKeyInput(''); 
    
    // Determine start step
    if (integration.connectionType === 'MANAGED' && integration.status !== IntegrationStatus.CONNECTED) {
        setStep('UPGRADE_OFFER');
    } else {
        setStep('CONNECT');
    }

    // Reset mock accounts selection
    setFoundAccounts(prev => prev.map(a => ({...a, selected: a.type !== 'Alias'})));
    setSelectedFolderId(null);
    setIsModalOpen(true);
  };

  const handleConnect = async () => {
      if (!selectedIntegration) return;
      
      setIsLoading(true);
      
      // Simulate API/OAuth call with delay
      setTimeout(() => {
          setIsLoading(false);
          
          if (selectedIntegration.category === IntegrationCategory.DOCUMENT_STORAGE) {
              // Storage flow moves to Folder Selection OR Success if Managed
              if (selectedIntegration.connectionType === 'MANAGED') {
                  updateIntegrationStatus(selectedIntegration.id, IntegrationStatus.CONNECTED);
                  setStep('SUCCESS');
              } else {
                  setStep('STORAGE_CONFIG');
              }
          } else if (selectedIntegration.connectionType === 'OAUTH') {
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

  const handleFinalizeStorage = () => {
      if (!selectedIntegration || !selectedFolderId) return;
      setIsLoading(true);
      
      // Simulate indexing
      setTimeout(() => {
          // Update status with selected root folder name
          const rootName = MOCK_DRIVE_FOLDERS.find(f => f.id === selectedFolderId)?.name || 'Unbekannt';
          
          setLocalIntegrations(prev => prev.map(i => 
            i.id === selectedIntegration.id ? { 
                ...i, 
                status: IntegrationStatus.CONNECTED, 
                lastSync: 'Initial Sync läuft...',
                errorMessage: undefined,
                storageConfig: {
                    rootFolderId: selectedFolderId,
                    rootFolderName: rootName,
                    aiIndexingEnabled: storageConfig.enableAiIndexing
                }
            } : i
          ));

          setIsLoading(false);
          setStep('SUCCESS');
      }, 2000);
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

  const toggleFolderExpand = (folderId: string) => {
      setExpandedFolders(prev => 
          prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
      );
  };

  // Recursive Folder Renderer
  const renderFolderTree = (parentId: string | null, level = 0) => {
      // Find children
      const children = MOCK_DRIVE_FOLDERS.filter(f => 
          (parentId === null && f.id === 'root') || // Mock root logic
          (parentId !== null && MOCK_DRIVE_FOLDERS.find(p => p.id === parentId)?.children?.includes(f.id))
      );

      if (children.length === 0) return null;

      return (
          <div className="space-y-1">
              {children.map(folder => {
                  const isExpanded = expandedFolders.includes(folder.id);
                  const hasChildren = folder.children && folder.children.length > 0;
                  const isSelected = selectedFolderId === folder.id;

                  return (
                      <div key={folder.id}>
                          <div 
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-brand-50 border border-brand-200 dark:bg-brand-900/20 dark:border-brand-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                              style={{ marginLeft: level * 20 }}
                              onClick={() => setSelectedFolderId(folder.id)}
                          >
                              <button 
                                  onClick={(e) => { e.stopPropagation(); toggleFolderExpand(folder.id); }}
                                  className={`p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${hasChildren ? '' : 'invisible'}`}
                              >
                                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                              </button>
                              
                              <Folder size={16} className={`${isSelected ? 'text-brand-600' : 'text-slate-400'} shrink-0`} fill={isSelected ? "currentColor" : "none"} />
                              
                              <span className={`text-sm ${isSelected ? 'font-bold text-brand-900 dark:text-brand-100' : 'text-slate-700 dark:text-slate-300'}`}>
                                  {folder.name}
                              </span>
                              
                              {isSelected && <CheckCircle size={14} className="ml-auto text-brand-600" />}
                          </div>
                          {isExpanded && renderFolderTree(folder.id, level + 1)}
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Integrationen & API</h1>
        <p className="text-slate-500 dark:text-slate-400">Verbinden Sie SwissBroker OS mit Ihren bevorzugten Tools und Schweizer Services.</p>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <FilterButton label="Alle" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
        <FilterButton label="Dokumente (DMS)" active={filter === IntegrationCategory.DOCUMENT_STORAGE} onClick={() => setFilter(IntegrationCategory.DOCUMENT_STORAGE)} />
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
                {integration.iconUrl === 'CH' ? <span className="text-white bg-red-600 w-full h-full rounded-lg flex items-center justify-center">+</span> : integration.iconUrl}
              </div>
              <StatusBadge status={integration.status} />
            </div>
            
            <div className="mb-4 flex-1">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  {integration.name}
                  {integration.connectionType === 'MANAGED' && <span className="text-[10px] bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full uppercase">Managed</span>}
              </h3>
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

              {/* MANAGED STORAGE VISUALIZATION */}
              {integration.connectionType === 'MANAGED' && integration.status === IntegrationStatus.CONNECTED && (
                  <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-end mb-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Belegt</span>
                          <span className="text-xs font-mono font-medium text-slate-700 dark:text-slate-300">
                              {(quotaUsed / 1000000000).toFixed(2)} GB / {(quotaLimit / 1000000000).toFixed(0)} GB
                          </span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                          <div 
                            className={`h-full transition-all duration-1000 ${quotaPercent > 90 ? 'bg-red-500' : 'bg-brand-500'}`} 
                            style={{width: `${quotaPercent}%`}} 
                          />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-400 flex items-center gap-1"><Cloud size={10}/> Swiss Tier IV</span>
                          <button 
                            className="text-[10px] font-bold text-brand-600 hover:underline"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenModal(integration);
                                setStep('UPGRADE_OFFER');
                            }}
                          >
                              Speicher erweitern
                          </button>
                      </div>
                  </div>
              )}

              {/* BYOS Storage Info if connected */}
              {integration.category === IntegrationCategory.DOCUMENT_STORAGE && integration.connectionType !== 'MANAGED' && integration.status === IntegrationStatus.CONNECTED && integration.storageConfig && (
                  <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-1 text-slate-500">
                          <HardDrive size={12} />
                          <span>Mount Point:</span>
                      </div>
                      <div className="font-mono font-bold truncate">/{integration.storageConfig.rootFolderName}</div>
                      {integration.storageConfig.aiIndexingEnabled && (
                          <div className="flex items-center gap-1 mt-2 text-purple-600 font-bold">
                              <Database size={12} /> AI Indexing Active
                          </div>
                      )}
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
                {integration.status === IntegrationStatus.CONNECTED ? 'Verwalten' : (integration.connectionType === 'MANAGED' ? 'Buchen' : 'Verbinden')}
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
            maxWidth={step === 'STORAGE_CONFIG' || step === 'UPGRADE_OFFER' ? 'max-w-2xl' : 'max-w-lg'}
          >
              <div className="space-y-6">
                 {/* Header Info */}
                 <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                     <div className="w-10 h-10 rounded bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-lg">
                        {selectedIntegration.iconUrl === 'CH' ? '+' : selectedIntegration.iconUrl}
                     </div>
                     <div>
                         <h4 className="font-medium text-slate-900 dark:text-slate-100">{selectedIntegration.name}</h4>
                         <div className="flex gap-2 text-xs text-slate-500">
                             <span>{selectedIntegration.category}</span>
                             <span>•</span>
                             <span>{selectedIntegration.connectionType === 'OAUTH' ? 'OAuth 2.0' : selectedIntegration.connectionType === 'MANAGED' ? 'Managed Cloud' : 'API Key'}</span>
                         </div>
                     </div>
                 </div>

                 {/* STEP: UPGRADE OFFER (For Managed Storage) */}
                 {step === 'UPGRADE_OFFER' && (
                     <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                         <div className="text-center mb-6">
                             <div className="inline-flex p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 mb-4">
                                 <Shield size={32} />
                             </div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">SwissBroker Secure Vault</h3>
                             <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
                                 Keine eigene IT? Kein Problem. Wir hosten Ihre Dokumente sicher in Zürich (Google Cloud Switzerland). 
                                 Inklusive automatischem Backup und nDSG-Compliance.
                             </p>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <div className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md ${quotaLimit === 5000000000 ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/10' : 'border-slate-200 dark:border-slate-800'}`}>
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="text-sm font-bold uppercase text-slate-500">Starter</span>
                                     {quotaLimit === 5000000000 && <CheckCircle size={18} className="text-brand-500" />}
                                 </div>
                                 <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">5 GB</div>
                                 <div className="text-sm text-slate-500">Inklusive</div>
                                 <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                     <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Hosting Zürich</li>
                                     <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Daily Backup</li>
                                 </ul>
                             </div>

                             <div className={`p-6 rounded-2xl border-2 transition-all cursor-pointer hover:shadow-md group border-slate-200 dark:border-slate-800 hover:border-brand-300`}>
                                 <div className="flex justify-between items-start mb-2">
                                     <span className="text-sm font-bold uppercase text-slate-500">Professional</span>
                                     <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded">Empfohlen</span>
                                 </div>
                                 <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">50 GB</div>
                                 <div className="text-sm text-brand-600 font-bold">CHF 9.00 / Monat</div>
                                 <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                     <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Alles aus Starter</li>
                                     <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Priority Speed</li>
                                     <li className="flex items-center gap-2"><Check size={12} className="text-emerald-500"/> Audit Log</li>
                                 </ul>
                                 <Button className="w-full mt-4" size="sm" onClick={handleConnect}>Upgrade buchen</Button>
                             </div>
                         </div>

                         {selectedIntegration.status === IntegrationStatus.CONNECTED && (
                             <div className="flex justify-center pt-4">
                                 <p className="text-xs text-slate-400">Aktuell genutzt: {(quotaUsed/1000000000).toFixed(2)} GB</p>
                             </div>
                         )}
                     </div>
                 )}

                 {/* STEP 1: CONNECT (AUTH) - For External Providers */}
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

                 {/* STEP 2A: SELECT ACCOUNTS (Email Sync) */}
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

                 {/* STEP 2B: STORAGE CONFIG (Document Storage) */}
                 {step === 'STORAGE_CONFIG' && (
                     <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                             {/* Left: Folder Picker */}
                             <div className="border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col overflow-hidden">
                                 <div className="bg-slate-100 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 font-bold text-sm text-slate-700 dark:text-slate-300">
                                     Verfügbare Ordner
                                 </div>
                                 <div className="flex-1 overflow-y-auto p-3 bg-white dark:bg-slate-900">
                                     {renderFolderTree(null)}
                                 </div>
                             </div>

                             {/* Right: Settings */}
                             <div className="flex flex-col gap-4">
                                 <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                                     <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm mb-2">BYOS Konfiguration</h4>
                                     <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                                         SwissBroker speichert keine Dateien. Wir erstellen lediglich Referenzen (Links) zu Ihrem bestehenden Speicher.
                                     </p>
                                 </div>

                                 <div className="space-y-3">
                                     <label className="text-xs font-bold text-slate-500 uppercase">Mapping Strategie</label>
                                     <select 
                                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={storageConfig.mappingStrategy}
                                        onChange={(e) => setStorageConfig({...storageConfig, mappingStrategy: e.target.value})}
                                     >
                                         <option value="EXACT_MATCH">Ordnername = Kundenname</option>
                                         <option value="ID_MATCH">Ordnername enthält Kunden-Nr.</option>
                                         <option value="MANUAL">Manuelle Zuweisung</option>
                                     </select>
                                 </div>

                                 <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                     <label className="flex items-start gap-3 cursor-pointer">
                                         <input 
                                            type="checkbox" 
                                            className="mt-1"
                                            checked={storageConfig.enableAiIndexing}
                                            onChange={(e) => setStorageConfig({...storageConfig, enableAiIndexing: e.target.checked})}
                                         />
                                         <div>
                                             <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">AI Deep Search aktivieren</span>
                                             <span className="block text-xs text-slate-500 mt-1">Erlaubt der KI, Dokumenteninhalte zu lesen und zu indexieren (RAG), um Fragen zu Policen zu beantworten.</span>
                                         </div>
                                     </label>
                                 </div>
                             </div>
                         </div>

                         <div className="pt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                             <Button variant="ghost" onClick={() => setStep('CONNECT')}>Zurück</Button>
                             <Button 
                                onClick={handleFinalizeStorage} 
                                disabled={isLoading || !selectedFolderId}
                                icon={isLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                             >
                                 {isLoading ? 'Verbinde...' : 'Speicher verknüpfen'}
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
                             {selectedIntegration.category === IntegrationCategory.DOCUMENT_STORAGE 
                                ? 'Der Speicher ist nun verbunden. Die Indexierung läuft im Hintergrund.'
                                : 'Die Synchronisation läuft im Hintergrund. Daten erscheinen in Kürze.'
                             }
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
