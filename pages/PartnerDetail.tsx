import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_PARTNERS } from '../constants';
import { 
  ArrowLeft, 
  ExternalLink, 
  Mail, 
  Phone, 
  Shield, 
  FileText, 
  Briefcase, 
  Check, 
  Building2,
  Users
} from 'lucide-react';

export const PartnerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PRODUCTS' | 'AGREEMENTS'>('OVERVIEW');

  const partner = MOCK_PARTNERS.find(p => p.id === id);

  if (!partner) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-slate-500 mb-4">Partner nicht gefunden</p>
          <Button onClick={() => navigate(-1)}>Zurück</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
          <ArrowLeft size={16} />
          Zurück zum Partner Hub
        </button>
        
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-6">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-3xl font-bold text-slate-400 border border-slate-100 dark:border-slate-700 shrink-0">
               {partner.name.substring(0,2).toUpperCase()}
           </div>
           <div className="flex-1">
               <div className="flex items-center gap-2 mb-1">
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{partner.name}</h1>
                   {partner.status === 'ACTIVE' && <Check size={18} className="text-brand-500" />}
               </div>
               <p className="text-slate-500 dark:text-slate-400 max-w-2xl">{partner.description}</p>
               <div className="flex items-center gap-4 mt-4 text-sm">
                   <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                       <Building2 size={14} />
                       {partner.category}
                   </span>
                   <a href={partner.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-brand-600 hover:underline">
                       <ExternalLink size={14} />
                       Website
                   </a>
               </div>
           </div>
           <div className="flex gap-3">
               <Button variant="outline">Bearbeiten</Button>
               <Button>Kontaktieren</Button>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                <TabButton active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<Shield size={16} />} label="Übersicht" />
                <TabButton active={activeTab === 'PRODUCTS'} onClick={() => setActiveTab('PRODUCTS')} icon={<Briefcase size={16} />} label="Produkte & Konditionen" />
                <TabButton active={activeTab === 'AGREEMENTS'} onClick={() => setActiveTab('AGREEMENTS')} icon={<FileText size={16} />} label="Verträge" />
              </div>

              {activeTab === 'OVERVIEW' && (
                  <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Card title="Makler-Status">
                              <div className="space-y-3">
                                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                                      <span className="text-sm text-slate-500">Broker Nummer</span>
                                      <span className="text-sm font-mono font-medium">{partner.brokerNumber}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-slate-50 dark:border-slate-800 pb-2">
                                      <span className="text-sm text-slate-500">Status</span>
                                      <span className="text-sm font-medium text-emerald-600">Zusammenarbeitsvertrag Aktiv</span>
                                  </div>
                                  <div className="flex justify-between">
                                      <span className="text-sm text-slate-500">Seit</span>
                                      <span className="text-sm font-medium">01.01.2020</span>
                                  </div>
                              </div>
                          </Card>
                          <Card title="Performance">
                              <div className="flex items-center gap-4 mb-4">
                                  <div className="p-3 bg-brand-100 dark:bg-brand-900/30 rounded-lg text-brand-600">
                                      <Users size={24} />
                                  </div>
                                  <div>
                                      <p className="text-2xl font-bold">24</p>
                                      <p className="text-xs text-slate-500">Aktive Klienten bei diesem Partner</p>
                                  </div>
                              </div>
                              <Button size="sm" variant="outline" className="w-full">Klienten anzeigen</Button>
                          </Card>
                      </div>

                      <Card title="Kontaktpersonen">
                          <div className="space-y-4">
                              {partner.contacts.map((contact, idx) => (
                                  <div key={idx} className="flex items-start justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-900/50">
                                      <div>
                                          <p className="font-medium text-slate-900 dark:text-slate-100">{contact.name}</p>
                                          <p className="text-xs text-brand-600 font-medium mb-2">{contact.role}</p>
                                          <div className="space-y-1">
                                              <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600">
                                                  <Mail size={14} /> {contact.email}
                                              </a>
                                              <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-slate-500 hover:text-brand-600">
                                                  <Phone size={14} /> {contact.phone}
                                              </a>
                                          </div>
                                      </div>
                                      <Button size="sm" variant="ghost">Kontakt</Button>
                                  </div>
                              ))}
                          </div>
                      </Card>
                  </div>
              )}

              {activeTab === 'PRODUCTS' && (
                  <div className="space-y-4">
                      {partner.products.map((product, idx) => (
                          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">{product.category}</span>
                                  </div>
                                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{product.name}</h3>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{product.description}</p>
                              </div>
                              <div className="text-right pl-4 md:border-l border-slate-100 dark:border-slate-800 min-w-[140px]">
                                  <p className="text-xs text-slate-400 mb-1">Courtage / Provision</p>
                                  <p className="text-lg font-bold text-emerald-600">{product.commissionRate}</p>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {activeTab === 'AGREEMENTS' && (
                  <Card title="Vertragsdokumente">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                          <div className="py-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded">
                                      <FileText size={20} />
                                  </div>
                                  <div>
                                      <p className="font-medium text-slate-900 dark:text-slate-100">Zusammenarbeitsvertrag 2020</p>
                                      <p className="text-xs text-slate-500">Unterschrieben am 01.01.2020 • PDF</p>
                                  </div>
                              </div>
                              <Button variant="outline" size="sm">Download</Button>
                          </div>
                          <div className="py-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 rounded">
                                      <FileText size={20} />
                                  </div>
                                  <div>
                                      <p className="font-medium text-slate-900 dark:text-slate-100">Courtage-Vereinbarung 2024</p>
                                      <p className="text-xs text-slate-500">Gültig ab 01.01.2024 • PDF</p>
                                  </div>
                              </div>
                              <Button variant="outline" size="sm">Download</Button>
                          </div>
                      </div>
                  </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
              <Card title="Quick Actions">
                  <div className="space-y-3">
                      <Button className="w-full justify-start" icon={<Briefcase size={16} />}>Offerte anfragen</Button>
                      <Button className="w-full justify-start" variant="outline" icon={<Mail size={16} />}>Email an KAM</Button>
                      <Button className="w-full justify-start" variant="outline" icon={<ExternalLink size={16} />}>Partner Portal Login</Button>
                  </div>
              </Card>

              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white">
                  <h3 className="font-bold mb-2">Notizen</h3>
                  <textarea 
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400 min-h-[100px]"
                    placeholder="Interne Notizen zu diesem Partner..."
                  ></textarea>
                  <div className="mt-2 text-right">
                      <Button size="sm" variant="secondary">Speichern</Button>
                  </div>
              </div>
          </div>
      </div>
    </Layout>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
      ${active 
        ? 'border-brand-500 text-brand-600 dark:text-brand-400' 
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
  >
    {icon}
    {label}
  </button>
);