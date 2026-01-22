
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, Navigate } from 'react-router-dom';
import { MOCK_CLIENTS, MOCK_TENANTS } from '../constants';
import { Search, Plus, User, Building2, Users } from 'lucide-react';
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
  
  // New Tenant Form
  const [newTenantData, setNewTenantData] = useState({
      name: '',
      plan: 'STARTER',
      adminEmail: ''
  });

  // New Client Form
  const [newClientType, setNewClientType] = useState<ClientType>('PRIVATE');
  const [newClientData, setNewClientData] = useState({
      firstName: '',
      lastName: '',
      companyName: '',
      uidNumber: '',
      email: '',
      zipCity: ''
  });

  // 1. Client Access Control (Rational Database Access)
  if (role === UserRole.CLIENT) {
    return <Navigate to="/dashboard" />;
  }

  // --- Handlers ---

  const handleCreateTenant = () => {
      console.log("Creating Tenant:", newTenantData);
      // In a real app, this would trigger an API call to create the tenant in Supabase
      setIsTenantModalOpen(false);
      setNewTenantData({ name: '', plan: 'STARTER', adminEmail: '' });
  };

  const handleCreateClient = () => {
      console.log("Creating Client:", { type: newClientType, ...newClientData });
      // In a real app, this would trigger an API call to create the client in Supabase
      setIsClientModalOpen(false);
      setNewClientData({ firstName: '', lastName: '', companyName: '', uidNumber: '', email: '', zipCity: '' });
  };


  // 2. SaaS View (Tenants instead of End-Clients)
  if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_SALES || role === UserRole.SAAS_FINANCE) {
      return (
        <Layout>
          <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verwaltete Makler (Tenants)</h1>
                <p className="text-slate-500 text-sm">Übersicht aller Broker-Firmen auf der Plattform.</p>
            </div>
            <Button icon={<Plus size={18} />} onClick={() => setIsTenantModalOpen(true)}>Neuer Tenant</Button>
          </div>

          <Card noPadding>
             <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">Firma</th>
                  <th className="px-6 py-3">Plan</th>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">MRR</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {MOCK_TENANTS.map(tenant => (
                     <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                         <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                             <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: tenant.branding.primaryColor + '20', color: tenant.branding.primaryColor }}>
                                     {tenant.name.substring(0,2).toUpperCase()}
                                 </div>
                                 {tenant.name}
                             </div>
                         </td>
                         <td className="px-6 py-4"><span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{tenant.plan}</span></td>
                         <td className="px-6 py-4">{tenant.usersCount}</td>
                         <td className="px-6 py-4 font-mono text-emerald-600">CHF {tenant.mrr}</td>
                         <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                tenant.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                                tenant.status === 'TRIAL' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                            }`}>
                                {tenant.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                             <Link to={`/tenant/${tenant.id}`}>
                                <Button size="sm" variant="ghost">Verwalten</Button>
                             </Link>
                         </td>
                     </tr>
                 ))}
              </tbody>
             </table>
          </Card>

          {/* CREATE TENANT MODAL */}
          <Modal
            isOpen={isTenantModalOpen}
            onClose={() => setIsTenantModalOpen(false)}
            title="Neuen Mandanten erstellen"
            maxWidth="max-w-md"
          >
              <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Firmenname</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        placeholder="z.B. Muster Finanz AG"
                        value={newTenantData.name}
                        onChange={e => setNewTenantData({...newTenantData, name: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Admin Email</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        placeholder="admin@firma.ch"
                        value={newTenantData.adminEmail}
                        onChange={e => setNewTenantData({...newTenantData, adminEmail: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan</label>
                      <select 
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        value={newTenantData.plan}
                        onChange={e => setNewTenantData({...newTenantData, plan: e.target.value})}
                      >
                          <option value="STARTER">Starter</option>
                          <option value="PROFESSIONAL">Professional</option>
                          <option value="ENTERPRISE">Enterprise</option>
                      </select>
                  </div>
                  <div className="pt-4 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsTenantModalOpen(false)}>Abbrechen</Button>
                      <Button onClick={handleCreateTenant} disabled={!newTenantData.name || !newTenantData.adminEmail}>Erstellen</Button>
                  </div>
              </div>
          </Modal>
        </Layout>
      );
  }

  // 3. Filter for Agents (Only show their assigned clients)
  let baseClients = MOCK_CLIENTS;
  if (role === UserRole.BROKER_AGENT && user) {
      baseClients = MOCK_CLIENTS.filter(c => c.advisorId === user.id);
  }

  // 4. Filter by Type and Search
  const displayedClients = baseClients.filter(c => {
      const typeMatch = (c.type || 'PRIVATE') === viewType;
      const searchMatch = 
        (c.firstName + ' ' + c.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
        (c.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.zipCity.toLowerCase().includes(searchTerm.toLowerCase());
      return typeMatch && searchMatch;
  });

  // 4. Broker View (Standard End-Clients)
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {role === UserRole.BROKER_AGENT ? 'Meine Klienten' : 'Klienten-Portfolio'}
        </h1>
        <Button icon={<Plus size={18} />} onClick={() => setIsClientModalOpen(true)}>Neuer Klient</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center">
          {/* Segmented Control */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setViewType('PRIVATE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'PRIVATE' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <User size={16} /> Privatkunden
              </button>
              <button 
                onClick={() => setViewType('CORPORATE')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${viewType === 'CORPORATE' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  <Building2 size={16} /> Firmenkunden
              </button>
          </div>

          <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={viewType === 'PRIVATE' ? "Suche nach Name, Ort..." : "Suche nach Firma, UID, Ort..."} 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
           </div>
      </div>

      <Card noPadding>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">{viewType === 'PRIVATE' ? 'Name' : 'Firma'}</th>
              <th className="px-6 py-3">Ort</th>
              <th className="px-6 py-3">{viewType === 'PRIVATE' ? 'Geburtsdatum' : 'Branche (NOGA)'}</th>
              {viewType === 'CORPORATE' && <th className="px-6 py-3">Personal</th>}
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedClients.length > 0 ? displayedClients.map(client => (
              <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  {viewType === 'PRIVATE' ? (
                      <img src={client.avatarUrl} className="w-10 h-10 rounded-full bg-slate-200 object-cover" alt="" />
                  ) : (
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center font-bold text-xs border border-indigo-100 dark:border-indigo-800">
                          {client.companyName?.substring(0,2).toUpperCase()}
                      </div>
                  )}
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                        {viewType === 'PRIVATE' ? `${client.firstName} ${client.lastName}` : client.companyName}
                    </div>
                    <div className="text-xs text-slate-500">
                        {viewType === 'PRIVATE' ? client.email : `UID: ${client.uidNumber || 'N/A'}`}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.zipCity}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                    {viewType === 'PRIVATE' ? client.birthDate : <span className="font-mono text-xs">{client.nogaCode || '-'}</span>}
                </td>
                {viewType === 'CORPORATE' && (
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1">
                            <Users size={14} className="text-slate-400" /> {client.employeeCount || 0}
                        </div>
                    </td>
                )}
                <td className="px-6 py-4">
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                     Aktiv
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={viewType === 'CORPORATE' ? `/corporate/${client.id}` : `/client/${client.id}`}>
                    <Button size="sm" variant="outline">Ansehen</Button>
                  </Link>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={viewType === 'CORPORATE' ? 6 : 5} className="px-6 py-12 text-center text-slate-500">
                        Keine {viewType === 'CORPORATE' ? 'Firmen' : 'Privatpersonen'} gefunden.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* CREATE CLIENT MODAL */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Neuen Klienten erfassen"
        maxWidth="max-w-lg"
      >
          <div className="space-y-6">
              {/* Type Switcher */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setNewClientType('PRIVATE')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newClientType === 'PRIVATE' ? 'bg-white dark:bg-slate-900 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
                  >
                      Privatperson
                  </button>
                  <button 
                    onClick={() => setNewClientType('CORPORATE')}
                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newClientType === 'CORPORATE' ? 'bg-white dark:bg-slate-900 shadow text-brand-600' : 'text-slate-500'}`}
                  >
                      Firma (Juristische Person)
                  </button>
              </div>

              <div className="space-y-4">
                  {newClientType === 'PRIVATE' ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vorname</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                                    value={newClientData.firstName}
                                    onChange={e => setNewClientData({...newClientData, firstName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nachname</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                                    value={newClientData.lastName}
                                    onChange={e => setNewClientData({...newClientData, lastName: e.target.value})}
                                />
                            </div>
                        </div>
                      </>
                  ) : (
                      <>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Firmenname</label>
                            <input 
                                type="text" 
                                className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                                placeholder="z.B. Muster Bau AG"
                                value={newClientData.companyName}
                                onChange={e => setNewClientData({...newClientData, companyName: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">UID Nummer</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                                    placeholder="CHE-123.456.789"
                                    value={newClientData.uidNumber}
                                    onChange={e => setNewClientData({...newClientData, uidNumber: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Kontaktperson</label>
                                <input 
                                    type="text" 
                                    className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                                    placeholder="Name"
                                    value={newClientData.lastName}
                                    onChange={e => setNewClientData({...newClientData, lastName: e.target.value})}
                                />
                            </div>
                        </div>
                      </>
                  )}

                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        value={newClientData.email}
                        onChange={e => setNewClientData({...newClientData, email: e.target.value})}
                      />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PLZ / Ort</label>
                      <input 
                        type="text" 
                        className="w-full p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900"
                        value={newClientData.zipCity}
                        onChange={e => setNewClientData({...newClientData, zipCity: e.target.value})}
                      />
                  </div>

                  <div className="pt-4 flex justify-end gap-3">
                      <Button variant="ghost" onClick={() => setIsClientModalOpen(false)}>Abbrechen</Button>
                      <Button onClick={handleCreateClient} disabled={!newClientData.email || (newClientType === 'PRIVATE' ? !newClientData.lastName : !newClientData.companyName)}>
                          Erstellen
                      </Button>
                  </div>
              </div>
          </Modal>
    </Layout>
  );
};
