
import React, { useState, useMemo } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useLeadOffers, useClients, useMortgages, usePolicies } from '../src/hooks/useData';
import { leadOffersService } from '../src/services/leadOffers';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, LeadOffer } from '../types';
import { Navigate } from 'react-router-dom';
import { 
    ShoppingBag, 
    Filter, 
    Plus, 
    MapPin, 
    CheckCircle, 
    AlertCircle, 
    DollarSign, 
    Briefcase,
    Shield,
    TrendingUp,
    Search,
    BadgeCheck,
    Star,
    ShieldCheck,
    Phone,
    Mail,
    UserCheck,
    Info,
    Users,
    FileText,
    Home,
    Calculator
} from 'lucide-react';
import { SensitiveData } from '../components/ui/SensitiveData';

export const LeadMarketplace: React.FC = () => {
    const { role, user } = useAuth();
    const { data: offers, refetch: refetchOffers } = useLeadOffers();
    const { data: clients } = useClients();
    const { data: mortgages } = useMortgages();
    const { data: policies } = usePolicies();

    const [filterType, setFilterType] = useState<'ALL' | 'MORTGAGE' | 'INSURANCE' | 'INVESTMENT'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [minQuality, setMinQuality] = useState(0);
    
    // Purchase Flow
    const [selectedLead, setSelectedLead] = useState<LeadOffer | null>(null);
    const [purchaseStep, setPurchaseStep] = useState<'DETAILS' | 'CONFIRM' | 'SUCCESS'>('DETAILS');

    // Sell Flow
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const [sellMode, setSellMode] = useState<'MANUAL' | 'CRM'>('MANUAL');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    
    const [newOffer, setNewOffer] = useState({
        title: '',
        type: 'INSURANCE',
        volume: 0,
        price: 0,
        canton: 'Zürich',
        description: ''
    });

    if (role === UserRole.CLIENT) {
        return <Navigate to="/dashboard" />;
    }

    // --- DERIVED STATE FOR SELL FLOW ---
    
    // 1. Available Clients (Mock: Filter by advisorId or just all for demo)
    const myClients = useMemo(() => {
        if (!user) return [];
        // In real app: filter by advisorId === user.id. 
        // For demo, we just return all MOCK_CLIENTS so you can see data.
        return clients; 
    }, [user]);

    // 2. Open Deals for Selected Client
    const openDeals = useMemo(() => {
        if (!selectedClientId) return [];
        
        const clientMortgages = mortgages
            .filter(m => m.clientId === selectedClientId)
            .map(m => ({
                id: m.id,
                category: 'MORTGAGE',
                title: `Hypothek: ${m.propertyName}`,
                volume: m.loanAmount,
                description: `Finanzierung ${m.type === 'FIXED' ? 'Festhypothek' : 'SARON'}. Objektwert: CHF ${m.propertyValue.toLocaleString()}.`,
                sourceObj: m
            }));

        const clientPolicies = policies
            .filter(p => p.clientId === selectedClientId && p.status === 'PENDING') // Only pending policies usually sold as leads
            .map(p => ({
                id: p.id,
                category: 'INSURANCE',
                title: `Versicherung: ${p.type}`,
                volume: p.premiumAmount * 5, // Approx 5 years value
                description: `Antrag für ${p.type} bei ${p.insurer}. Jährliche Prämie: CHF ${p.premiumAmount}.`,
                sourceObj: p
            }));

        return [...clientMortgages, ...clientPolicies];
    }, [selectedClientId]);

    const handleSelectDeal = (deal: any) => {
        // Auto-fill form based on deal
        const client = myClients.find(c => c.id === selectedClientId);
        const cityParts = client?.zipCity.split(' ');
        const cantonOrCity = cityParts && cityParts.length > 1 ? cityParts[1] : 'Schweiz';

        setNewOffer({
            title: deal.title,
            type: deal.category as any,
            volume: deal.volume,
            price: Math.round(deal.volume * 0.005), // Auto-calc price suggestion (0.5% of volume)
            canton: cantonOrCity,
            description: deal.description + " (Verifizierter CRM-Datensatz)"
        });
        // Switch back to manual view so user can edit before submitting
        setSellMode('MANUAL'); 
    };

    const filteredLeads = offers.filter(lead => {
        const matchesType = filterType === 'ALL' || lead.type === filterType;
        const matchesSearch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              lead.canton.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesQuality = lead.qualityScore >= minQuality;
        return matchesType && matchesSearch && matchesQuality;
    });

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'MORTGAGE': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
            case 'INSURANCE': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
            case 'INVESTMENT': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getQualityColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 70) return 'text-brand-500';
        return 'text-amber-500';
    };

    const handleBuyClick = (lead: LeadOffer) => {
        setSelectedLead(lead);
        setPurchaseStep('DETAILS');
    };

    const confirmPurchase = async () => {
        setPurchaseStep('SUCCESS');
        if (selectedLead) {
            try { await leadOffersService.markSold(selectedLead.id); refetchOffers(); } catch { /* ignore */ }
        }
    };

    const handleCreateOffer = async () => {
        if (!newOffer.title.trim()) return;
        await leadOffersService.create({
            type: newOffer.type as LeadOffer['type'],
            title: newOffer.title.trim(),
            description: newOffer.description,
            volume: Number(newOffer.volume) || 0,
            price: Number(newOffer.price) || 0,
            canton: newOffer.canton,
            datePosted: new Date().toISOString().slice(0, 10),
            status: 'AVAILABLE',
            sellerTenantId: user?.tenantId,
            sellerName: user ? `${user.firstName} ${user.lastName}` : 'Broker',
            sellerRating: 5,
            sellerDealCount: 0,
            qualityScore: 80,
            verificationStatus: { phoneVerified: false, emailVerified: true, intentVerified: false },
            guaranteeIncluded: false,
        } as any);
        setIsSellModalOpen(false);
        setNewOffer({ title: '', type: 'INSURANCE', volume: 0, price: 0, canton: 'Zürich', description: '' });
        setSellMode('MANUAL');
        setSelectedClientId('');
        refetchOffers();
    };

    return (
        <Layout>
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <ShoppingBag className="text-purple-600" />
                        Lead Exchange
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Der Marktplatz für verifizierte Premium-Leads.
                    </p>
                </div>
                <Button icon={<Plus size={18} />} onClick={() => setIsSellModalOpen(true)}>Lead verkaufen</Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Suchen nach Kanton, Thema..." 
                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 items-center">
                    <FilterButton label="Alle" active={filterType === 'ALL'} onClick={() => setFilterType('ALL')} />
                    <FilterButton label="Hypotheken" active={filterType === 'MORTGAGE'} onClick={() => setFilterType('MORTGAGE')} />
                    <FilterButton label="Versicherung" active={filterType === 'INSURANCE'} onClick={() => setFilterType('INSURANCE')} />
                    
                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                    
                    <button 
                        onClick={() => setMinQuality(minQuality === 90 ? 0 : 90)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 transition-all border ${
                            minQuality === 90 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400' 
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                        }`}
                    >
                        <ShieldCheck size={14} /> Nur Premium (90+)
                    </button>
                </div>
            </div>

            {/* Leads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLeads.map(lead => (
                    <div key={lead.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-900 transition-all flex flex-col relative overflow-hidden group">
                        {lead.status === 'SOLD' && (
                            <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-[1px] flex items-center justify-center z-10">
                                <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">Verkauft</span>
                            </div>
                        )}
                        
                        {/* Header: Type & Quality */}
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider ${getTypeColor(lead.type)}`}>
                                {lead.type}
                            </span>
                            <div className="flex items-center gap-1" title="Quality Score (0-100)">
                                <div className={`font-black text-sm ${getQualityColor(lead.qualityScore)}`}>{lead.qualityScore}</div>
                                <div className="h-1.5 w-8 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${getQualityColor(lead.qualityScore).replace('text-', 'bg-')}`} 
                                        style={{ width: `${lead.qualityScore}%` }} 
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">{lead.title}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 flex-1">{lead.description}</p>

                        {/* Trust Factors */}
                        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-1 text-amber-400" title={`Verkäufer Rating: ${lead.sellerRating}/5`}>
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{lead.sellerRating}</span>
                            </div>
                            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700"></div>
                            <div className="flex gap-2">
                                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${lead.verificationStatus.phoneVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300'}`} title="Telefonnummer geprüft">
                                    <Phone size={10} fill="currentColor" /> Tel
                                </span>
                                <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${lead.verificationStatus.emailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300'}`} title="Email geprüft">
                                    <Mail size={10} fill="currentColor" /> Mail
                                </span>
                                {lead.verificationStatus.intentVerified && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400" title="Kaufabsicht geprüft">
                                        <UserCheck size={10} fill="currentColor" /> Intent
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <MapPin size={14} /> Kanton {lead.canton}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Volumen (Est.)</span>
                                <span className="font-mono font-bold"><SensitiveData>CHF {lead.volume.toLocaleString()}</SensitiveData></span>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                            <div className="flex flex-col">
                                <div className="text-xl font-black text-slate-900 dark:text-white">
                                    CHF {lead.price}
                                </div>
                                {lead.guaranteeIncluded && (
                                    <span className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
                                        <ShieldCheck size={10} /> Geld-Zurück
                                    </span>
                                )}
                            </div>
                            <Button size="sm" onClick={() => handleBuyClick(lead)} disabled={lead.status === 'SOLD'}>
                                Kaufen
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* BUY MODAL */}
            <Modal
                isOpen={!!selectedLead}
                onClose={() => setSelectedLead(null)}
                title={purchaseStep === 'SUCCESS' ? 'Lead erfolgreich erworben!' : 'Lead Details & Kauf'}
                maxWidth="max-w-lg"
            >
                {purchaseStep === 'DETAILS' && selectedLead && (
                    <div className="space-y-6">
                        {/* Quality Badge Header */}
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                            <div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Quality Score</div>
                                <div className="text-3xl font-black text-slate-900 dark:text-white">{selectedLead.qualityScore}<span className="text-sm text-slate-400 font-medium">/100</span></div>
                            </div>
                            {selectedLead.qualityScore >= 90 ? (
                                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                    <BadgeCheck size={24} />
                                </div>
                            ) : (
                                <div className="h-12 w-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
                                    <Shield size={24} />
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{selectedLead.title}</h3>
                                <p className="text-sm text-slate-500 mt-1">{selectedLead.description}</p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 mb-1">Verkäufer</p>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-sm">{selectedLead.sellerName}</span>
                                        <div className="flex text-amber-400 text-xs">
                                            <Star size={10} fill="currentColor" /> {selectedLead.sellerRating}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 mb-1">Standort</p>
                                    <p className="font-bold text-sm">{selectedLead.canton}</p>
                                </div>
                            </div>

                            {/* Trust Guarantee Block */}
                            {selectedLead.guaranteeIncluded ? (
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-xl flex gap-3">
                                    <ShieldCheck className="text-purple-600 shrink-0" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-purple-900 dark:text-purple-200">No-Risk Garantie</h4>
                                        <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                                            Ist die Telefonnummer ungültig oder der Kunde nicht erreichbar? Melden Sie den Lead innerhalb von 48h und erhalten Sie 100% zurück.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3">
                                    <Info className="text-slate-400 shrink-0" size={20} />
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Standard Kauf</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Dieser Lead wird "wie gesehen" verkauft. Keine automatische Rückerstattung.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <span>Preis</span>
                                <span className="font-black text-xl">CHF {selectedLead.price.toFixed(2)}</span>
                            </div>
                            <Button className="w-full" size="lg" onClick={confirmPurchase}>
                                Jetzt zahlungspflichtig kaufen
                            </Button>
                            <p className="text-center text-xs text-slate-400 mt-2">
                                Sichere Transaktion via SwissBroker Pay.
                            </p>
                        </div>
                    </div>
                )}

                {purchaseStep === 'SUCCESS' && selectedLead && (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in">
                            <CheckCircle size={40} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Lead gehört Ihnen!</h3>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                            Die Kontaktdaten wurden entschlüsselt und in Ihre Pipeline übertragen.
                        </p>
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-left mb-6">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Kontaktdaten</p>
                            <p className="font-bold">Max Muster</p>
                            <p className="font-mono text-sm">+41 79 123 45 67</p>
                            <p className="text-sm text-blue-600">max.muster@example.com</p>
                        </div>
                        <Button className="w-full" onClick={() => setSelectedLead(null)}>Zur Pipeline</Button>
                    </div>
                )}
            </Modal>

            {/* SELL MODAL */}
            <Modal
                isOpen={isSellModalOpen}
                onClose={() => setIsSellModalOpen(false)}
                title="Lead verkaufen"
                maxWidth="max-w-lg"
            >
                <div className="space-y-4">
                    {/* Header: Mode Switcher */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mb-2">
                        <button 
                            onClick={() => setSellMode('MANUAL')} 
                            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${sellMode === 'MANUAL' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Manuell
                        </button>
                        <button 
                            onClick={() => setSellMode('CRM')} 
                            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${sellMode === 'CRM' ? 'bg-white dark:bg-slate-700 shadow text-brand-600 dark:text-brand-400' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Aus CRM wählen
                        </button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-200 border border-blue-100 dark:border-blue-900/30 mb-4">
                        <p><strong>Qualitäts-Check:</strong> Wir prüfen Ihren Lead automatisch auf Validität (HLR Lookup). Je mehr Daten Sie liefern, desto höher der Quality Score und Ihr Verkaufspreis.</p>
                    </div>

                    {sellMode === 'CRM' ? (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Klient auswählen</label>
                                <select 
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    value={selectedClientId}
                                    onChange={(e) => setSelectedClientId(e.target.value)}
                                >
                                    <option value="">-- Klienten wählen --</option>
                                    {myClients.map(c => (
                                        <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
                                    ))}
                                </select>
                            </div>

                            {selectedClientId && (
                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 uppercase">Gefundene Assets / Deals</p>
                                    <div className="space-y-2">
                                        {openDeals.map(deal => (
                                            <div 
                                                key={deal.id} 
                                                onClick={() => handleSelectDeal(deal)}
                                                className="p-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-500 cursor-pointer bg-white dark:bg-slate-900 group transition-all"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        {deal.category === 'MORTGAGE' ? <Home size={16} className="text-brand-500" /> : <FileText size={16} className="text-brand-500" />}
                                                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{deal.title}</span>
                                                    </div>
                                                    <div className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">
                                                        CHF {deal.volume.toLocaleString()}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 line-clamp-1">{deal.description}</p>
                                            </div>
                                        ))}
                                        {openDeals.length === 0 && (
                                            <div className="p-4 text-center text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                                Keine offenen Geschäfte für diesen Klienten gefunden.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in">
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Titel / Betreff</label>
                                <input 
                                    type="text" 
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                    placeholder="z.B. KMU Haftpflicht Metallbau"
                                    value={newOffer.title}
                                    onChange={e => setNewOffer({...newOffer, title: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Kategorie</label>
                                    <select 
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={newOffer.type}
                                        onChange={e => setNewOffer({...newOffer, type: e.target.value as any})}
                                    >
                                        <option value="INSURANCE">Versicherung</option>
                                        <option value="MORTGAGE">Hypothek</option>
                                        <option value="INVESTMENT">Anlage</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Kanton</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={newOffer.canton}
                                        onChange={e => setNewOffer({...newOffer, canton: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Gesch. Volumen (CHF)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                                        value={newOffer.volume}
                                        onChange={e => setNewOffer({...newOffer, volume: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Verkaufspreis (CHF)</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-emerald-600"
                                        value={newOffer.price}
                                        onChange={e => setNewOffer({...newOffer, price: Number(e.target.value)})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-1">Beschreibung (Anonym)</label>
                                <textarea 
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm h-24"
                                    placeholder="Beschreiben Sie den Lead ohne Namen zu nennen..."
                                    value={newOffer.description}
                                    onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsSellModalOpen(false)}>Abbrechen</Button>
                        <Button onClick={handleCreateOffer}>Angebot prüfen & erstellen</Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

const FilterButton = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
            active 
            ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-500/20' 
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
    >
        {label}
    </button>
);
