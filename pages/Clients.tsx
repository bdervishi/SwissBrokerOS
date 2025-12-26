import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, Navigate } from 'react-router-dom';
import { MOCK_CLIENTS, MOCK_TENANTS } from '../constants';
import { Search, Plus, User, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const Clients: React.FC = () => {
  const { role, user } = useAuth();

  // 1. Client Access Control (Rational Database Access)
  // Clients cannot see "other clients".
  if (role === UserRole.CLIENT) {
    return <Navigate to="/dashboard" />;
  }

  // 2. SaaS View (Tenants instead of End-Clients)
  if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_SALES || role === UserRole.SAAS_FINANCE) {
      return (
        <Layout>
          <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Verwaltete Makler (Tenants)</h1>
                <p className="text-slate-500 text-sm">Übersicht aller Broker-Firmen auf der Plattform.</p>
            </div>
            <Button icon={<Plus size={18} />}>Neuer Tenant</Button>
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
                                 <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
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
                             <Button size="sm" variant="ghost">Verwalten</Button>
                         </td>
                     </tr>
                 ))}
              </tbody>
             </table>
          </Card>
        </Layout>
      );
  }

  // 3. Filter for Agents (Only show their assigned clients)
  let displayedClients = MOCK_CLIENTS;
  if (role === UserRole.BROKER_AGENT && user) {
      displayedClients = MOCK_CLIENTS.filter(c => c.advisorId === user.id);
  }

  // 4. Broker View (Standard End-Clients)
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {role === UserRole.BROKER_AGENT ? 'Meine Klienten' : 'Klienten'}
        </h1>
        <Button icon={<Plus size={18} />}>Neuer Klient</Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Suche nach Name, Ort..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
           </div>
           <Button variant="outline">Filter</Button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Wohnort</th>
              <th className="px-6 py-3">Geburtsdatum</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {displayedClients.length > 0 ? displayedClients.map(client => (
              <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <img src={client.avatarUrl} className="w-8 h-8 rounded-full bg-slate-200 object-cover" alt="" />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">{client.firstName} {client.lastName}</div>
                    <div className="text-xs text-slate-500">{client.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.zipCity}</td>
                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{client.birthDate}</td>
                <td className="px-6 py-4">
                   <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                     Aktiv
                   </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link to={`/client/${client.id}`}>
                    <Button size="sm" variant="outline">Ansehen</Button>
                  </Link>
                </td>
              </tr>
            )) : (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                        Keine Klienten gefunden.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </Card>
    </Layout>
  );
};