
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    X, 
    User, 
    Shield, 
    FileText, 
    FileSignature, 
    ChevronRight, 
    LayoutDashboard,
    CreditCard,
    Building2,
    Calendar
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { MOCK_CLIENTS, MOCK_POLICIES, MOCK_DOCUMENTS, MOCK_LEAD_OFFERS } from '../../constants';

interface SearchResult {
    id: string;
    type: 'CLIENT' | 'POLICY' | 'DOCUMENT' | 'PAGE' | 'LEAD';
    title: string;
    subtitle?: string;
    path: string;
    icon: React.ReactNode;
}

export const CommandPalette: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // --- DATA AGGREGATION & SECURITY FILTERING ---
    const results = useMemo(() => {
        if (!user || !query.trim()) return [];

        let allResults: SearchResult[] = [];
        const q = query.toLowerCase();

        // 1. NAVIGATION (Global)
        const navItems: SearchResult[] = [
            { id: 'nav_dash', type: 'PAGE', title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={16}/> },
            { id: 'nav_cal', type: 'PAGE', title: 'Kalender', path: '/calendar', icon: <Calendar size={16}/> },
        ];
        allResults.push(...navItems);

        // 2. CLIENTS (Broker Only)
        if (role !== UserRole.CLIENT) {
            const clients = MOCK_CLIENTS
                .filter(c => 
                    // Security: Only show clients assigned to this broker (or all if Admin)
                    (c.advisorId === user.id || role === UserRole.BROKER_ADMIN) &&
                    (c.firstName.toLowerCase().includes(q) || c.lastName.toLowerCase().includes(q) || c.companyName?.toLowerCase().includes(q))
                )
                .map(c => ({
                    id: `c_${c.id}`,
                    type: 'CLIENT' as const,
                    title: `${c.firstName} ${c.lastName}`,
                    subtitle: c.companyName || c.zipCity,
                    path: `/client/${c.id}`,
                    icon: <User size={16}/>
                }));
            allResults.push(...clients);
        }

        // 3. POLICIES (Context Aware)
        const policies = MOCK_POLICIES
            .filter(p => {
                // Security: Client sees only own, Broker sees assigned clients
                const isOwn = role === UserRole.CLIENT ? p.clientId === MOCK_CLIENTS.find(c => c.username === user.username)?.id : true; // Simplification for mock
                // In real app: Check if p.clientId belongs to advisor
                const matches = p.policyNumber.toLowerCase().includes(q) || p.insurer.toLowerCase().includes(q) || p.type.toLowerCase().includes(q);
                return isOwn && matches;
            })
            .map(p => ({
                id: `p_${p.id}`,
                type: 'POLICY' as const,
                title: `${p.type} (${p.insurer})`,
                subtitle: `Nr. ${p.policyNumber}`,
                path: `/policy/${p.id}`,
                icon: <Shield size={16}/>
            }));
        allResults.push(...policies);

        // 4. DOCUMENTS & SIGNED CONTRACTS (Context Aware)
        // Mocking some "Signed Protocols" to demonstrate the feature
        const signedDocs: SearchResult[] = [
            { id: 'doc_signed_1', type: 'DOCUMENT', title: 'Beratungsprotokoll_Signiert.pdf', subtitle: 'Digital unterschrieben am 12.05.2024', path: '/dashboard', icon: <FileSignature size={16} className="text-emerald-500"/> }
        ];
        
        const standardDocs = MOCK_DOCUMENTS
            .filter(d => d.title.toLowerCase().includes(q))
            .map(d => ({
                id: `d_${d.id}`,
                type: 'DOCUMENT' as const,
                title: d.title,
                subtitle: `${d.type} • ${d.date}`,
                path: `/policy/${d.policyId}`, // Navigate to policy to see doc
                icon: <FileText size={16}/>
            }));
        
        if (q.includes('protokoll') || q.includes('signiert') || q.includes('pdf')) {
             allResults.push(...signedDocs);
        }
        allResults.push(...standardDocs);

        return allResults;

    }, [query, user, role]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % results.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (results[selectedIndex]) {
                    handleSelect(results[selectedIndex]);
                }
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, results, selectedIndex]);

    const handleSelect = (result: SearchResult) => {
        onClose();
        navigate(result.path);
        setQuery('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
            
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                    <Search className="text-slate-400 w-5 h-5 mr-3" />
                    <input 
                        className="flex-1 bg-transparent border-none outline-none text-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                        placeholder="Suchen Sie nach Klienten, Policen, Dokumenten..."
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        autoFocus
                    />
                    <div className="hidden sm:flex items-center gap-2">
                        <kbd className="hidden sm:inline-flex items-center h-5 px-2 text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">ESC</kbd>
                    </div>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <div className="py-12 text-center text-slate-500">
                            {query ? 'Keine Ergebnisse gefunden.' : 'Tippen Sie los...'}
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {results.map((result, index) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-colors ${
                                        index === selectedIndex 
                                        ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-900 dark:text-brand-100' 
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                                >
                                    <div className={`p-2 rounded-md ${index === selectedIndex ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                        {result.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{result.title}</div>
                                        {result.subtitle && <div className="text-xs opacity-70 truncate">{result.subtitle}</div>}
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-wider opacity-50">
                                        {result.type}
                                    </div>
                                    {index === selectedIndex && <ChevronRight size={16} className="text-brand-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                
                {query && (
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between">
                        <span><strong>{results.length}</strong> Treffer</span>
                        <span>Nutzen Sie Pfeiltasten zum Navigieren</span>
                    </div>
                )}
            </div>
        </div>
    );
};
