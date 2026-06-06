
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, Navigate } from 'react-router-dom';
import { MOCK_CLIENTS, MOCK_TENANTS } from '../constants';
import { 
    Search, Plus, User, Building2, Users, ArrowRight, ArrowLeft, 
    ShieldCheck, Wallet, FileText, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, ClientType } from '../types';
import { Modal } from '../components/ui/Modal';

export const Clients: React.FC = () => {
  const { role, user } = useAuth();
  const [viewType, setViewType] = useState<ClientType>('PRIVATE');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  // --- WIZARD STATE ---
  const [wizardStep, setWizardStep] = useState(1);
  const TOTAL_STEPS = 4;

  // New Tenant Form
  const [newTenantData, setNewTenantData] = useState({
      name: '',
      plan: 'STARTER',
      adminEmail: ''
  });

  // Comprehensive New Client Form
  const [clientForm, setClientForm] = useState({
      type: 'PRIVATE' as ClientType,
      firstName: '',
      lastName: '',
      companyName: '',
      uidNumber: '',
      email: '',
      phone: '',
      address: '',
      zip: '',
      city: '',
      nationality: 'CH',
      birthDate: '',
      idType: 'PASSPORT',
      idNumber: '',
      isPep: false,
      riskProfile: 'LOW',
      ahvNumber: '',
      taxDomicile: '',
      bankName: '',
      iban: '',
      maritalStatus: 'SINGLE'
  });

  // 1. Client Access Control
  if (role === UserRole.CLIENT) {
    return <Navigate to="/dashboard" />;
  }

  // --- Handlers ---
  const handleCreateTenant = () => {
      console.log("Creating Tenant:", newTenantData);
      setIsTenantModalOpen(false);
      setNewTenantData({ name: '', plan: 'STARTER', adminEmail: '' });
  };

  const handleCreateClient = () => {
      console.log("FINAL CLIENT DATA:", clientForm);
      setIsClientModalOpen(false);
      setWizardStep(1);
      // Reset form logic...
  };

  const nextStep = () => setWizardStep(p => Math.min(TOTAL_STEPS, p + 1));
  const prevStep = () => setWizardStep(p => Math.max(1, p - 1));

  // 2. SaaS View
  if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_SALES || role === UserRole.SAAS_FINANCE) {
      return (
        <Layout>
          <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verwaltete Makler (Tenants)</h1>
            </div>
            <Button icon={<Plus size={18} />} onClick={() => setIsTenantModalOpen(true)}>Neuer Tenant</Button>
          </div>
          <Card noPadding>
             <div className="p-4 text-center text-slate-500">Tenant-Liste (Mock)</div>
          </Card>
          
           {/* CREATE TENANT MODAL */}
           <Modal
            isOpen={isTenantModalOpen}
            onClose={() => setIsTenantModalOpen(false)}
            title="Neuen Mandanten erstellen"
            maxWidth="max-w-md"
          >
              <div className="space-y-4">
                  <input className="w-full p-2 border rounded" placeholder="Firmenname" value={newTenantData.name} onChange={e => setNewTenantData({...newTenantData, name: e.target.value})} />
                  <Button onClick={handleCreateTenant}>Erstellen</Button>
              </div>
          </Modal>
        </Layout>
      );
  }

  // 3. Broker View Logic
  let baseClients = MOCK_CLIENTS;
  if (role === UserRole.BROKER_AGENT && user) {
      baseClients = MOCK_CLIENTS.filter(c => c.advisorId === user.id);
  }

  const displayedClients = baseClients.filter(c => {
      const typeMatch = (c.type || 'PRIVATE') === viewType;
      const searchMatch = 
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {role === UserRole.BROKER_AGENT ? 'Meine Klienten' : 'Klienten-Portfolio'}
        </h1>
        <Button 
            icon={<Plus size={18} />} 
            onClick={() => setIsClientModalOpen(true)}
        >
            Neuer Klient
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button onClick={() => setViewType('PRIVATE')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'PRIVATE' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'}`}>
                  <User size={16} /> Privatkunden
              </button>
              <button onClick={() => setViewType('CORPORATE')} className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'CORPORATE' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}>
                  <Building2 size={16} /> Firmenkunden
              </button>
          </div>
          <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Suche..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
           </div>
      </div>

      <Card noPadding>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">{viewType === 'PRIVATE' ? 'Name' : 'Firma'}</th>
              <th className="px-6 py-3">Ort</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedClients.length > 0 ? displayedClients.map(client => (
              <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                        {viewType === 'PRIVATE' ? `${client.firstName} ${client.lastName}` : client.companyName}
                    </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.zipCity}</td>
                <td className="px-6 py-4"><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Aktiv</span></td>
                <td className="px-6 py-4 text-right">
                  <Link to={viewType === 'CORPORATE' ? `/corporate/${client.id}` : `/client/${client.id}`}>
                    <Button size="sm" variant="outline">Ansehen</Button>
                  </Link>
                </td>
              </tr>
            )) : (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-500">Keine Klienten gefunden.</td></tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* CREATE CLIENT WIZARD */}
      <Modal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          title="Neuen Klienten erfassen"
          maxWidth="max-w-2xl"
      >
          <div className="flex flex-col h-[70vh]">
              {/* Progress */}
              <div className="px-6 pt-2 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500 uppercase">Schritt {wizardStep} / {TOTAL_STEPS}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-600 transition-all duration-300" style={{width: `${(wizardStep / TOTAL_STEPS) * 100}%`}}></div>
                  </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {wizardStep === 1 && (
                      <div className="space-y-4 animate-in slide-in-from-right-4">
                          <h3 className="font-bold text-lg">Basisdaten</h3>
                          <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => setClientForm({...clientForm, type: 'PRIVATE'})} className={`p-4 border rounded-xl text-left ${clientForm.type === 'PRIVATE' ? 'border-brand-500 bg-brand-50' : ''}`}>
                                  <User className="mb-2" />
                                  <div className="font-bold">Privatperson</div>
                              </button>
                              <button onClick={() => setClientForm({...clientForm, type: 'CORPORATE'})} className={`p-4 border rounded-xl text-left ${clientForm.type === 'CORPORATE' ? 'border-brand-500 bg-brand-50' : ''}`}>
                                  <Building2 className="mb-2" />
                                  <div className="font-bold">Firma</div>
                              </button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 block mb-1">Vorname</label>
                                  <input className="w-full p-2 border rounded" value={clientForm.firstName} onChange={e => setClientForm({...clientForm, firstName: e.target.value})} />
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 block mb-1">Nachname</label>
                                  <input className="w-full p-2 border rounded" value={clientForm.lastName} onChange={e => setClientForm({...clientForm, lastName: e.target.value})} />
                              </div>
                          </div>
                      </div>
                  )}
                  {wizardStep === 2 && <div><h3 className="font-bold">Compliance Check</h3><p className="text-sm text-slate-500">GwG Prüfung...</p></div>}
                  {wizardStep === 3 && <div><h3 className="font-bold">Finanzdaten</h3><p className="text-sm text-slate-500">Steuerdomizil & Bank...</p></div>}
                  {wizardStep === 4 && <div className="text-center py-10"><CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4"/><h3 className="font-bold text-xl">Bereit zum Speichern</h3></div>}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between bg-slate-50 dark:bg-slate-900">
                  <Button variant="ghost" onClick={wizardStep === 1 ? () => setIsClientModalOpen(false) : prevStep}>
                      {wizardStep === 1 ? 'Abbrechen' : 'Zurück'}
                  </Button>
                  <Button onClick={wizardStep === TOTAL_STEPS ? handleCreateClient : nextStep}>
                      {wizardStep === TOTAL_STEPS ? 'Erstellen' : 'Weiter'}
                  </Button>
              </div>
          </div>
      </Modal>
    </Layout>
  );
};
