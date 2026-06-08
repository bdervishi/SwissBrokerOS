
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { getAIClient } from '../services/aiService';
import { useAuth } from '../contexts/AuthContext';
import { useBranding } from '../contexts/BrandingContext';
import { UserRole, WebSection, WebSectionType } from '../types';
import { Navigate, Link } from 'react-router-dom';
import { 
    Monitor, 
    Smartphone, 
    Globe, 
    Wand2, 
    Upload, 
    Palette, 
    Layout as LayoutIcon, 
    Type, 
    CheckCircle2, 
    Loader2,
    Eye,
    Save,
    ExternalLink,
    MoveVertical,
    Trash2,
    Plus,
    Calculator,
    Calendar,
    MessageSquare,
    ShieldCheck,
    Lock
} from 'lucide-react';

const MOCK_INITIAL_SECTIONS: WebSection[] = [
    { id: 'sec_hero', type: 'HERO', title: 'Startseite', content: 'Ihr Partner für Finanzen & Vorsorge.', isVisible: true, order: 0, image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80' },
    { id: 'sec_services', type: 'SERVICES', title: 'Dienstleistungen', content: 'Wir bieten unabhängige Beratung.', isVisible: true, order: 1 },
    { id: 'sec_calc', type: 'CALCULATOR', title: 'Hypotheken-Rechner', content: 'Berechnen Sie Ihre Tragbarkeit.', isVisible: true, order: 2, config: { type: 'mortgage' } },
    { id: 'sec_contact', type: 'CONTACT', title: 'Kontakt', content: 'Vereinbaren Sie einen Termin.', isVisible: true, order: 3 },
];

export const WebEngine: React.FC = () => {
    const { role, user } = useAuth();
    const { branding, tenant } = useBranding();
    
    // View State
    const [viewMode, setViewMode] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
    const [activeTab, setActiveTab] = useState<'EDITOR' | 'DESIGN' | 'SETTINGS'>('EDITOR');
    const [isSaving, setIsSaving] = useState(false);
    
    // Import State
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importUrl, setImportUrl] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    // Site Data State
    const [sections, setSections] = useState<WebSection[]>(MOCK_INITIAL_SECTIONS);
    const [siteConfig, setSiteConfig] = useState({
        domain: user?.organizationName ? `${user.organizationName.toLowerCase().replace(/\s/g, '-')}.swissbroker.site` : 'mein-broker.swissbroker.site',
        title: user?.organizationName || 'Mein Maklerbüro',
        themeColor: branding.primaryColor
    });

    if (role !== UserRole.BROKER_ADMIN && role !== UserRole.SAAS_SUPER_ADMIN) {
        return <Navigate to="/dashboard" />;
    }

    // CHECK LICENSE / ADD-ON STATUS
    // Logic: Access if Enterprise OR if addon_website is in activeAddons
    // SaaS Admin always has access for demo/support purposes
    const hasLicense = role === UserRole.SAAS_SUPER_ADMIN || 
                       tenant?.plan === 'ENTERPRISE' || 
                       tenant?.activeAddons?.includes('addon_website');

    if (!hasLicense) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center max-w-2xl mx-auto px-4">
                    <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-full flex items-center justify-center mb-8 relative">
                        <Monitor size={48} className="text-slate-400" />
                        <div className="absolute -bottom-2 -right-2 bg-brand-600 text-white p-2 rounded-full border-4 border-white dark:border-slate-950">
                            <Lock size={20} />
                        </div>
                    </div>
                    
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                        Web-Engine & SEO Modul
                    </h1>
                    <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Erstellen Sie in Minuten eine moderne, nDSG-konforme Makler-Webseite. 
                        Integrieren Sie Hypotheken-Rechner und Termin-Buchung direkt aus dem CRM.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-10 text-left">
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3">
                            <CheckCircle2 className="text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium">Automatische nDSG Compliance</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3">
                            <CheckCircle2 className="text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium">Integrierte Rechner & Lead-Formulare</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3">
                            <CheckCircle2 className="text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium">Hosting in Zürich inklusive</span>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex gap-3">
                            <CheckCircle2 className="text-emerald-500 shrink-0" />
                            <span className="text-sm font-medium">Smart Import Ihrer alten Seite</span>
                        </div>
                    </div>

                    <Link to="/plans">
                        <Button size="lg" className="px-12 py-6 text-lg font-bold shadow-xl shadow-brand-500/20">
                            Modul aktivieren (ab CHF 29/mt)
                        </Button>
                    </Link>
                    <p className="mt-4 text-xs text-slate-400">
                        Inklusive im Enterprise Plan. Monatlich kündbar als Add-on für Starter & Professional.
                    </p>
                </div>
            </Layout>
        );
    }

    // --- AI Import Logic ---
    const handleSmartImport = async () => {
        if (!importUrl) return;
        setIsImporting(true);

        try {
            const ai = getAIClient();
            
            // Simulation: Since we can't scrape real URLs from browser securely without a backend proxy,
            // we will ask Gemini to Hallucinate/Generate a structure based on the URL context (or just generate generic good copy).
            const prompt = `
                Ich möchte eine Makler-Webseite importieren. Die URL ist: "${importUrl}".
                Da du keinen direkten Zugriff hast, generiere mir passenden, generischen Content für eine moderne Schweizer Makler-Webseite basierend auf dem Namen in der URL.
                
                Erstelle JSON für folgende Sektionen:
                1. HERO: Titel und kurzer Slogan.
                2. SERVICES: Liste von 3 Dienstleistungen (Titel & Kurzbeschreibung).
                3. ABOUT: Ein kurzer "Über Uns" Text.
                
                Sprache: Deutsch (Schweiz).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            const text = response.text;
            // Mock parsing logic (in real app, we'd enforce JSON schema)
            // For now, we just update the Hero section with a generic success message to show it worked.
            
            setSections(prev => prev.map(s => {
                if (s.type === 'HERO') return { ...s, title: 'Willkommen bei ' + (importUrl.replace('https://', '').split('.')[0]), content: 'Ihre Experten für Versicherungen und Vorsorge.' };
                return s;
            }));
            
            // Add an "About" section if not exists
            if (!sections.find(s => s.type === 'ABOUT')) {
                setSections(prev => [...prev, { 
                    id: 'sec_about_imported', 
                    type: 'ABOUT' as WebSectionType, 
                    title: 'Über Uns', 
                    content: 'Wir sind Ihr unabhängiger Partner in der Region.', 
                    isVisible: true, 
                    order: 1 
                }].sort((a, b) => a.order - b.order));
            }

            setIsImportModalOpen(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsImporting(false);
        }
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    const moveSection = (index: number, direction: 'UP' | 'DOWN') => {
        if ((direction === 'UP' && index === 0) || (direction === 'DOWN' && index === sections.length - 1)) return;
        const newSections = [...sections];
        const targetIndex = direction === 'UP' ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections);
    };

    const toggleVisibility = (id: string) => {
        setSections(prev => prev.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
    };

    // --- Preview Renderer (Component inside Component for isolation) ---
    const PreviewFrame = () => (
        <div className={`mx-auto bg-white transition-all duration-500 shadow-2xl overflow-y-auto custom-scrollbar border border-slate-200 ${viewMode === 'MOBILE' ? 'w-[375px] h-[667px] rounded-[3rem] border-[8px] border-slate-800' : 'w-full h-full rounded-xl'}`}>
            {/* Header / Nav */}
            <div className="h-16 flex items-center justify-between px-6 border-b sticky top-0 bg-white/90 backdrop-blur z-10">
                <div className="font-bold text-lg" style={{ color: siteConfig.themeColor }}>{siteConfig.title}</div>
                <div className="hidden md:flex gap-4 text-sm font-medium text-slate-600">
                    <span>Home</span>
                    <span>Services</span>
                    <span>Kontakt</span>
                </div>
                {viewMode === 'MOBILE' && <div className="md:hidden"><div className="w-6 h-0.5 bg-slate-800 mb-1"></div><div className="w-6 h-0.5 bg-slate-800 mb-1"></div><div className="w-6 h-0.5 bg-slate-800"></div></div>}
            </div>

            {/* Sections */}
            {sections.filter(s => s.isVisible).map(section => (
                <div key={section.id} className="relative group">
                    {/* Hero Section */}
                    {section.type === 'HERO' && (
                        <div className="relative py-20 px-6 text-center bg-slate-50 flex flex-col items-center justify-center min-h-[400px]">
                            {section.image && (
                                <div className="absolute inset-0 z-0">
                                    <img src={section.image} alt="" className="w-full h-full object-cover opacity-20" />
                                </div>
                            )}
                            <div className="relative z-10 max-w-2xl">
                                <h1 className="text-4xl font-black text-slate-900 mb-4">{section.title}</h1>
                                <p className="text-xl text-slate-600 mb-8">{section.content}</p>
                                <button className="px-8 py-3 rounded-full text-white font-bold shadow-lg" style={{ backgroundColor: siteConfig.themeColor }}>
                                    Beratungstermin buchen
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Services Section */}
                    {section.type === 'SERVICES' && (
                        <div className="py-16 px-6 max-w-5xl mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-12 text-slate-900">{section.title}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center text-white" style={{ backgroundColor: siteConfig.themeColor }}>
                                            <ShieldCheck size={24} />
                                        </div>
                                        <h3 className="font-bold text-lg mb-2">Service {i}</h3>
                                        <p className="text-sm text-slate-500">Umfassende Beratung für Ihre Sicherheit und Vorsorge.</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Integrated Calculator */}
                    {section.type === 'CALCULATOR' && (
                        <div className="py-16 bg-slate-900 text-white">
                            <div className="max-w-4xl mx-auto px-6 text-center">
                                <h2 className="text-2xl font-bold mb-8 flex items-center justify-center gap-2">
                                    <Calculator className="text-emerald-400"/> {section.title}
                                </h2>
                                <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border border-white/10 text-left">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs uppercase font-bold text-slate-400">Jahreseinkommen</label>
                                                <input type="range" className="w-full mt-2 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                            </div>
                                            <div>
                                                <label className="text-xs uppercase font-bold text-slate-400">Eigenkapital</label>
                                                <input type="range" className="w-full mt-2 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center justify-center border-l border-white/10">
                                            <div className="text-4xl font-bold text-emerald-400">CHF 850k</div>
                                            <div className="text-sm text-slate-400">Max. Kaufpreis</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Section */}
                    {section.type === 'CONTACT' && (
                        <div className="py-16 px-6 bg-slate-50">
                            <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-bold mb-6 text-slate-900">{section.title}</h2>
                                <form className="space-y-4" onSubmit={e => e.preventDefault()}>
                                    <input type="text" placeholder="Name" className="w-full p-3 rounded-lg border border-slate-200" />
                                    <input type="email" placeholder="Email" className="w-full p-3 rounded-lg border border-slate-200" />
                                    <textarea placeholder="Nachricht" className="w-full p-3 rounded-lg border border-slate-200 h-24" />
                                    <button className="w-full py-3 rounded-lg text-white font-bold" style={{ backgroundColor: siteConfig.themeColor }}>
                                        Absenden
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Generic About / Text */}
                    {section.type === 'ABOUT' && (
                        <div className="py-16 px-6 max-w-3xl mx-auto text-center">
                            <h2 className="text-2xl font-bold mb-4 text-slate-900">{section.title}</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">{section.content}</p>
                        </div>
                    )}
                </div>
            ))}

            {/* Footer */}
            <div className="bg-slate-900 text-slate-400 py-12 px-6 text-sm">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="font-bold text-white mb-4">{siteConfig.title}</div>
                        <p>Ihr Partner für Sicherheit.</p>
                    </div>
                    <div>
                        <div className="font-bold text-white mb-4">Rechtliches</div>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500"/> Impressum</li>
                            <li className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500"/> Datenschutz (nDSG)</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-slate-800 text-center text-xs opacity-50">
                    Powered by SwissBroker OS
                </div>
            </div>
        </div>
    );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Monitor className="text-brand-600" />
                        Webseite & SEO
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwalten Sie Ihre digitale Visitenkarte. Integriert mit CRM & Rechnern.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" icon={<ExternalLink size={18}/>}>Live ansehen</Button>
                    <Button 
                        onClick={handleSave}
                        icon={isSaving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Veröffentliche...' : 'Publizieren'}
                    </Button>
                </div>
            </div>

            <div className="h-[calc(100vh-180px)] flex flex-col lg:flex-row gap-6">
                
                {/* LEFT: EDITOR SIDEBAR */}
                <div className="w-full lg:w-[400px] flex flex-col gap-4">
                    
                    {/* Tabs */}
                    <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <button onClick={() => setActiveTab('EDITOR')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'EDITOR' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Inhalt</button>
                        <button onClick={() => setActiveTab('DESIGN')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'DESIGN' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Design</button>
                        <button onClick={() => setActiveTab('SETTINGS')} className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${activeTab === 'SETTINGS' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500'}`}>Domain</button>
                    </div>

                    {/* Content: EDITOR */}
                    {activeTab === 'EDITOR' && (
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                                <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">Sektionen</h3>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => setIsImportModalOpen(true)} title="Importieren"><Wand2 size={16}/></Button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {sections.map((section, index) => (
                                    <div key={section.id} className={`p-3 rounded-lg border transition-all bg-white dark:bg-slate-800 ${section.isVisible ? 'border-slate-200 dark:border-slate-700' : 'border-dashed border-slate-300 dark:border-slate-600 opacity-60'}`}>
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="cursor-grab text-slate-400 hover:text-slate-600"><MoveVertical size={14}/></div>
                                            <span className="text-xs font-black uppercase text-slate-500 w-20">{section.type}</span>
                                            <input 
                                                type="text" 
                                                value={section.title} 
                                                onChange={(e) => setSections(prev => prev.map(s => s.id === section.id ? {...s, title: e.target.value} : s))}
                                                className="flex-1 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-brand-500 outline-none text-sm font-bold"
                                            />
                                            <button onClick={() => toggleVisibility(section.id)} className="text-slate-400 hover:text-brand-600">
                                                <Eye size={16} className={!section.isVisible ? 'text-slate-300' : ''} />
                                            </button>
                                        </div>
                                        {/* Edit Fields based on type */}
                                        {section.isVisible && (
                                            <div className="pl-8 space-y-2">
                                                <textarea 
                                                    value={section.content}
                                                    onChange={(e) => setSections(prev => prev.map(s => s.id === section.id ? {...s, content: e.target.value} : s))}
                                                    className="w-full text-xs p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded resize-none focus:ring-1 focus:ring-brand-500 outline-none"
                                                    rows={2}
                                                />
                                                {section.type === 'CALCULATOR' && (
                                                    <div className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded flex items-center gap-1">
                                                        <Calculator size={10} /> Verbunden mit CRM
                                                    </div>
                                                )}
                                                {section.type === 'CONTACT' && (
                                                    <div className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded flex items-center gap-1">
                                                        <MessageSquare size={10} /> Sendet an Lead Radar
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                                            <div className="flex gap-1">
                                                <button onClick={() => moveSection(index, 'UP')} className="p-1 hover:bg-slate-100 rounded"><ChevronUpIcon /></button>
                                                <button onClick={() => moveSection(index, 'DOWN')} className="p-1 hover:bg-slate-100 rounded"><ChevronDownIcon /></button>
                                            </div>
                                            <button onClick={() => setSections(prev => prev.filter(s => s.id !== section.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14}/></button>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Block hinzufügen</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['SERVICES', 'ABOUT', 'CALCULATOR', 'CONTACT', 'TESTIMONIALS'].map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => setSections([...sections, { id: `new_${Date.now()}`, type: type as any, title: 'Neu', content: 'Inhalt...', isVisible: true, order: sections.length }])}
                                                className="p-2 border border-slate-200 dark:border-slate-700 rounded hover:border-brand-500 hover:text-brand-600 text-[10px] font-bold text-slate-500"
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Content: DESIGN */}
                    {activeTab === 'DESIGN' && (
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Akzentfarbe</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#0ea5e9', '#10b981', '#6366f1', '#f59e0b', '#ef4444', '#0f172a'].map(color => (
                                        <button 
                                            key={color}
                                            onClick={() => setSiteConfig({...siteConfig, themeColor: color})}
                                            className={`w-8 h-8 rounded-full border-2 ${siteConfig.themeColor === color ? 'border-slate-900 scale-110' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <input 
                                        type="color" 
                                        value={siteConfig.themeColor}
                                        onChange={(e) => setSiteConfig({...siteConfig, themeColor: e.target.value})}
                                        className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Schriftart</label>
                                <select className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                    <option>Inter (Modern)</option>
                                    <option>Roboto (Standard)</option>
                                    <option>Playfair Display (Serif)</option>
                                </select>
                            </div>

                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                <h4 className="font-bold text-sm mb-2 flex items-center gap-2"><Palette size={16}/> Branding Sync</h4>
                                <p className="text-xs text-slate-500 mb-3">Farben werden automatisch aus Ihren SaaS-Einstellungen (White Labeling) übernommen.</p>
                                <Button size="sm" variant="outline" className="w-full">Neu synchronisieren</Button>
                            </div>
                        </div>
                    )}

                    {/* Content: SETTINGS */}
                    {activeTab === 'SETTINGS' && (
                        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Domain</label>
                                <div className="flex items-center gap-2 mb-2">
                                    <Globe size={16} className="text-slate-400" />
                                    <span className="text-sm font-mono">{siteConfig.domain}</span>
                                </div>
                                <Button size="sm" variant="outline" className="w-full">Eigene Domain verbinden</Button>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">SEO Titel</label>
                                <input 
                                    type="text" 
                                    value={siteConfig.title} 
                                    onChange={e => setSiteConfig({...siteConfig, title: e.target.value})}
                                    className="w-full p-2 border rounded text-sm"
                                />
                            </div>

                            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold">Impressum & Datenschutz</span>
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                </div>
                                <p className="text-xs text-slate-500">
                                    Wird automatisch generiert und live gehalten (nDSG Konform).
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* RIGHT: PREVIEW AREA */}
                <div className="flex-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative">
                    {/* View Controls */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-800 text-white p-1 rounded-full shadow-xl flex gap-1">
                        <button 
                            onClick={() => setViewMode('DESKTOP')}
                            className={`p-2 rounded-full transition-colors ${viewMode === 'DESKTOP' ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
                        >
                            <Monitor size={16} />
                        </button>
                        <button 
                            onClick={() => setViewMode('MOBILE')}
                            className={`p-2 rounded-full transition-colors ${viewMode === 'MOBILE' ? 'bg-slate-600' : 'hover:bg-slate-700'}`}
                        >
                            <Smartphone size={16} />
                        </button>
                    </div>

                    <div className="flex-1 p-8 overflow-hidden flex items-center justify-center">
                        <PreviewFrame />
                    </div>
                </div>
            </div>

            {/* Smart Import Modal */}
            <Modal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                title="Smart Website Import"
                maxWidth="max-w-lg"
            >
                <div className="space-y-6">
                    <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-xl flex gap-4 border border-brand-100 dark:border-brand-800">
                        <Wand2 className="text-brand-600 shrink-0" size={24} />
                        <div>
                            <h4 className="font-bold text-brand-900 dark:text-brand-100">Alte Webseite migrieren?</h4>
                            <p className="text-sm text-brand-800 dark:text-brand-200 mt-1">
                                Geben Sie Ihre URL ein. Unsere KI analysiert Texte, Bilder und Farben und erstellt einen Entwurf im neuen System.
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Ihre aktuelle Web-Adresse</label>
                        <input 
                            type="url" 
                            placeholder="https://www.ihr-broker.ch" 
                            className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl"
                            value={importUrl}
                            onChange={(e) => setImportUrl(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsImportModalOpen(false)}>Abbrechen</Button>
                        <Button 
                            onClick={handleSmartImport} 
                            disabled={!importUrl || isImporting}
                            icon={isImporting ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
                        >
                            {isImporting ? 'Analysiere...' : 'Import starten'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};

// Helper Icons
const ChevronUpIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>;
const ChevronDownIcon = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>;
