
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Link, Navigate } from 'react-router-dom';
import { MOCK_TENANTS } from '../constants';
import { Search, Plus, User, Building2, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useClients } from '../src/hooks/useData';
import { db } from '../src/services/db';
import { UserRole } from '../types';

type NewClientType = 'PRIVATE' | 'CORPORATE';

const EMPTY_FORM = {
  type: 'PRIVATE' as NewClientType,
  firstName: '',
  lastName: '',
  companyName: '',
  email: '',
  phone: '',
  address: '',
  zipCity: '',
  birthDate: '',
  taxDomicile: 'ZH',
};

// Small avatar that falls back to initials when no image is set (DB clients
// have no avatar column).
const ClientAvatar: React.FC<{ src?: string; first?: string; last?: string }> = ({ src, first, last }) => {
  if (src) return <img src={src} className="w-8 h-8 rounded-full bg-slate-200 object-cover" alt="" />;
  const initials = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase() || '?';
  return (
    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
      {initials}
    </div>
  );
};

export const Clients: React.FC = () => {
  const { role, user } = useAuth();
  const { data: clients, refetch } = useClients();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleCreateClient = async () => {
    setError(null);
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Vorname, Nachname und E-Mail sind erforderlich.');
      return;
    }
    if (form.type === 'CORPORATE' && !form.companyName.trim()) {
      setError('Firmenname ist für Firmenkunden erforderlich.');
      return;
    }
    setSubmitting(true);
    try {
      // Only DB-backed columns – the Client interface also carries auth-only
      // fields (username/role/avatarUrl) that are not columns on `clients`.
      await db.clients.create({
        type: form.type,
        status: 'ACTIVE',
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        companyName: form.type === 'CORPORATE' ? form.companyName.trim() : null,
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        zipCity: form.zipCity.trim(),
        country: 'Schweiz',
        birthDate: form.birthDate || null,
        taxDomicile: form.taxDomicile.trim() || 'ZH',
        maritalStatus: 'LEDIG',
        tenantId: user?.tenantId,
        advisorId: user?.id,
      } as any);
      setIsModalOpen(false);
      setForm(EMPTY_FORM);
      refetch();
    } catch (err: any) {
      setError(err?.message || 'Speichern fehlgeschlagen.');
    } finally {
      setSubmitting(false);
    }
  };

  // 1. Client Access Control – clients cannot see "other clients".
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
              {MOCK_TENANTS.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold" style={{ backgroundColor: tenant.branding.primaryColor + '20', color: tenant.branding.primaryColor }}>
                        {tenant.name.substring(0, 2).toUpperCase()}
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
      </Layout>
    );
  }

  // 3. Broker / Agent view (real end-clients from the data layer)
  const visibleClients = (role === UserRole.BROKER_AGENT && user
    ? clients.filter((c) => c.advisorId === user.id)
    : clients
  ).filter((c) => {
    if (!searchTerm.trim()) return true;
    const haystack = `${c.firstName} ${c.lastName} ${c.companyName ?? ''} ${c.email} ${c.zipCity ?? ''}`.toLowerCase();
    return haystack.includes(searchTerm.toLowerCase());
  });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {role === UserRole.BROKER_AGENT ? 'Meine Klienten' : 'Klienten'}
        </h1>
        <Button icon={<Plus size={18} />} onClick={() => { setError(null); setIsModalOpen(true); }}>Neuer Klient</Button>
      </div>

      <Card noPadding>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Suche nach Name, Ort..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            {visibleClients.length > 0 ? visibleClients.map((client) => (
              <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <ClientAvatar src={(client as any).avatarUrl} first={client.firstName} last={client.lastName} />
                  <div>
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {client.companyName ? client.companyName : `${client.firstName} ${client.lastName}`}
                    </div>
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

      {/* CREATE CLIENT MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Neuen Klienten erfassen" maxWidth="max-w-xl">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['PRIVATE', 'CORPORATE'] as NewClientType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setField('type', t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-semibold transition-colors ${
                  form.type === t
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
              >
                {t === 'PRIVATE' ? <User size={16} /> : <Building2 size={16} />}
                {t === 'PRIVATE' ? 'Privatkunde' : 'Firmenkunde'}
              </button>
            ))}
          </div>

          {form.type === 'CORPORATE' && (
            <Input label="Firmenname *" value={form.companyName} onChange={(v) => setField('companyName', v)} />
          )}

          <div className="grid grid-cols-2 gap-3">
            <Input label="Vorname *" value={form.firstName} onChange={(v) => setField('firstName', v)} />
            <Input label="Nachname *" value={form.lastName} onChange={(v) => setField('lastName', v)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="E-Mail *" type="email" value={form.email} onChange={(v) => setField('email', v)} />
            <Input label="Telefon" value={form.phone} onChange={(v) => setField('phone', v)} />
          </div>
          <Input label="Adresse" value={form.address} onChange={(v) => setField('address', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="PLZ / Ort" value={form.zipCity} onChange={(v) => setField('zipCity', v)} />
            <Input label="Steuerdomizil (Kanton)" value={form.taxDomicile} onChange={(v) => setField('taxDomicile', v)} />
          </div>
          {form.type === 'PRIVATE' && (
            <Input label="Geburtsdatum" type="date" value={form.birthDate} onChange={(v) => setField('birthDate', v)} />
          )}

          {error && <p className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>Abbrechen</Button>
            <Button onClick={handleCreateClient} disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Klient erstellen'}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

const Input: React.FC<{ label: string; value: string; onChange: (v: string) => void; type?: string }> = ({ label, value, onChange, type = 'text' }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  </div>
);
