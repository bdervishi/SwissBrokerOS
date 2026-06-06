import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_PARTNERS } from '../constants';
import { PartnerCategory, PartnerStatus, UserRole } from '../types';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, 
  Plus, 
  Building2, 
  Briefcase, 
  Scale, 
  Wrench,
  CheckCircle,
  Clock,
  XCircle,
  ArrowRight
} from 'lucide-react';

export const PartnerHub: React.FC = () => {
  const { role } = useAuth();
  const [filter, setFilter] = useState<PartnerCategory | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Client Access Control
  if (role === UserRole.CLIENT) {
     return <Navigate to="/dashboard" />;
  }

  const filteredPartners = MOCK_PARTNERS.filter(partner => {
    const matchesFilter = filter === 'ALL' || partner.category === filter;
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          partner.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getCategoryIcon = (category: PartnerCategory) => {
    switch (category) {
      case PartnerCategory.INSURANCE: return <Building2 size={20} />;
      case PartnerCategory.BANK: return <Briefcase size={20} />;
      case PartnerCategory.LEGAL: return <Scale size={20} />;
      case PartnerCategory.SERVICE: return <Wrench size={20} />;
    }
  };

  const getStatusBadge = (status: PartnerStatus) => {
    switch (status) {
      case PartnerStatus.ACTIVE:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><CheckCircle size={12}/> Aktiv</span>;
      case PartnerStatus.PENDING:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"><Clock size={12}/> Ausstehend</span>;
      case PartnerStatus.INACTIVE:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"><XCircle size={12}/> Inaktiv</span>;
    }
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Partner Hub</h1>
          <p className="text-slate-500 dark:text-slate-400">Verwalten Sie Ihre Beziehungen zu Versicherern, Banken und Dienstleistern.</p>
        </div>
        <Button icon={<Plus size={18} />}>Neuer Partner</Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input 
             type="text" 
             placeholder="Partner suchen..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
           />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
           <FilterButton label="Alle" active={filter === 'ALL'} onClick={() => setFilter('ALL')} />
           <FilterButton label="Versicherungen" active={filter === PartnerCategory.INSURANCE} onClick={() => setFilter(PartnerCategory.INSURANCE)} />
           <FilterButton label="Banken" active={filter === PartnerCategory.BANK} onClick={() => setFilter(PartnerCategory.BANK)} />
           <FilterButton label="Recht" active={filter === PartnerCategory.LEGAL} onClick={() => setFilter(PartnerCategory.LEGAL)} />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map(partner => (
           <Link to={`/partner/${partner.id}`} key={partner.id} className="group block">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-full shadow-sm hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all flex flex-col">
                 <div className="flex justify-between items-start mb-4">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-400 border border-slate-100 dark:border-slate-700">
                       {partner.logoUrl ? <img src={partner.logoUrl} alt={partner.name} className="w-full h-full object-contain rounded-xl" /> : partner.name.substring(0,2).toUpperCase()}
                    </div>
                    {getStatusBadge(partner.status)}
                 </div>
                 
                 <div className="mb-4 flex-1">
                    <div className="flex items-center gap-2 mb-2 text-brand-600 dark:text-brand-400 text-xs font-semibold uppercase tracking-wide">
                        {getCategoryIcon(partner.category)}
                        {partner.category}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-brand-600 transition-colors">
                        {partner.name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                        {partner.description}
                    </p>
                 </div>

                 <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-400">{partner.products.length} Produkte verfügbar</span>
                    <span className="p-2 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <ArrowRight size={16} />
                    </span>
                 </div>
              </div>
           </Link>
        ))}
      </div>
    </Layout>
  );
};

const FilterButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
            active 
            ? 'bg-brand-600 border-brand-600 text-white shadow-md shadow-brand-500/20' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
        {label}
    </button>
);