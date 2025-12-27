
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, StaticPage, LocalizedContent, MegaMenuCategory, MegaMenuLink } from '../types';
import { MOCK_STATIC_PAGES, MOCK_NAVIGATION, FAQS as MOCK_FAQS } from '../constants';
import { Navigate } from 'react-router-dom';
import { 
    FileText, 
    Plus, 
    Edit, 
    Trash2, 
    Save, 
    Globe, 
    Eye,
    ChevronLeft,
    Bold,
    Italic,
    List,
    Type,
    Code,
    Settings,
    MoreVertical,
    Navigation2,
    ArrowRight,
    HelpCircle,
    MessageSquare,
    Tag,
    RefreshCw
} from 'lucide-react';

export const SaaSPages: React.FC = () => {
    const { role } = useAuth();
    const [activeMainTab, setActiveMainTab] = useState<'CMS' | 'NAV' | 'FAQ'>('CMS');
    
    // CMS State
    const [pages, setPages] = useState<StaticPage[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPage, setCurrentPage] = useState<StaticPage | null>(null);
    const [activeLang, setActiveLang] = useState<keyof LocalizedContent>('de');
    const [isSaving, setIsSaving] = useState(false);

    // Nav State
    const [navigation, setNavigation] = useState<MegaMenuCategory[]>([]);

    // FAQ State
    const [faqs, setFaqs] = useState<{category: string, question: string, answer: string}[]>([]);

    // Initial Load
    useEffect(() => {
        const savedPages = localStorage.getItem('app_static_pages');
        setPages(savedPages ? JSON.parse(savedPages) : MOCK_STATIC_PAGES);
        
        const savedNav = localStorage.getItem('app_navigation');
        setNavigation(savedNav ? JSON.parse(savedNav) : MOCK_NAVIGATION);

        const savedFaqs = localStorage.getItem('app_faqs');
        setFaqs(savedFaqs ? JSON.parse(savedFaqs) : MOCK_FAQS);
    }, []);

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_MARKETING) {
        return <Navigate to="/dashboard" />;
    }

    // --- CMS Actions ---
    const handleSavePage = () => {
        if (!currentPage) return;
        setIsSaving(true);
        const updatedPage = { ...currentPage, lastUpdated: new Date().toLocaleDateString('de-CH') };
        const updatedPages = pages.find(p => p.id === updatedPage.id) 
            ? pages.map(p => p.id === updatedPage.id ? updatedPage : p)
            : [...pages, updatedPage];
        setPages(updatedPages);
        localStorage.setItem('app_static_pages', JSON.stringify(updatedPages));
        setTimeout(() => { setIsSaving(false); setIsEditing(false); setCurrentPage(null); }, 800);
    };

    const handleEditPage = (page: StaticPage) => {
        setCurrentPage(page);
        setIsEditing(true);
    };

    // --- Nav Actions ---
    const handleSaveNav = () => {
        setIsSaving(true);
        localStorage.setItem('app_navigation', JSON.stringify(navigation));
        setTimeout(() => setIsSaving(false), 800);
    };

    const addNavLink = (catId: string) => {
        const newLink: MegaMenuLink = {
            id: Date.now().toString(),
            title: 'Neuer Link',
            description: 'Beschreibung...',
            path: '/',
            iconName: 'Info'
        };
        setNavigation(prev => prev.map(c => c.id === catId ? { ...c, links: [...c.links, newLink] } : c));
    };

    const updateLink = (catId: string, linkId: string, updates: Partial<MegaMenuLink>) => {
        setNavigation(prev => prev.map(c => c.id === catId ? {
            ...c,
            links: c.links.map(l => l.id === linkId ? { ...l, ...updates } : l)
        } : c));
    };

    const deleteLink = (catId: string, linkId: string) => {
        setNavigation(prev => prev.map(c => c.id === catId ? {
            ...c,
            links: c.links.filter(l => l.id !== linkId)
        } : c));
    };

    // --- FAQ Actions ---
    const handleSaveFaqs = () => {
        setIsSaving(true);
        localStorage.setItem('app_faqs', JSON.stringify(faqs));
        setTimeout(() => setIsSaving(false), 800);
    };

    const addFaq = () => {
        setFaqs([...faqs, { category: 'Allgemein', question: 'Neue Frage?', answer: 'Antwort hier...' }]);
    };

    const updateFaq = (index: number, updates: any) => {
        const newFaqs = [...faqs];
        newFaqs[index] = { ...newFaqs[index], ...updates };
        setFaqs(newFaqs);
    };

    const deleteFaq = (index: number) => {
        setFaqs(faqs.filter((_, i) => i !== index));
    };

    // --- Simple Editor ---
    const Editor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
        const insertTag = (tag: string) => {
            const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
            if (!textarea) return;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            const before = text.substring(0, start);
            const selection = text.substring(start, end);
            const after = text.substring(end);
            let newText = '';
            if (tag === 'b') newText = `${before}<strong>${selection}</strong>${after}`;
            else if (tag === 'i') newText = `${before}<em>${selection}</em>${after}`;
            else if (tag === 'h2') newText = `${before}<h2>${selection}</h2>${after}`;
            else if (tag === 'ul') newText = `${before}<ul>\n<li>${selection}</li>\n</ul>${after}`;
            else if (tag === 'li') newText = `${before}<li>${selection}</li>${after}`;
            else if (tag === 'p') newText = `${before}<p>${selection}</p>${after}`;
            onChange(newText);
        };
        return (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <div className="bg-slate-50 dark:bg-slate-800 p-2 flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
                    <ToolbarBtn icon={<Bold size={16}/>} onClick={() => insertTag('b')} title="Fett" />
                    <ToolbarBtn icon={<Italic size={16}/>} onClick={() => insertTag('i')} title="Kursiv" />
                    <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>
                    <ToolbarBtn icon={<Type size={16}/>} onClick={() => insertTag('h2')} title="Überschrift H2" />
                    <ToolbarBtn icon={<Code size={16}/>} onClick={() => insertTag('p')} title="Absatz" />
                    <ToolbarBtn icon={<List size={16}/>} onClick={() => insertTag('ul')} title="Liste" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 h-[450px]">
                    <textarea id="content-editor" className="w-full h-full p-4 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 resize-none focus:outline-none font-mono text-sm" value={value} onChange={(e) => onChange(e.target.value)} />
                    <div className="w-full h-full p-8 bg-white dark:bg-slate-950 overflow-y-auto prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: value }} />
                </div>
            </div>
        );
    };

    const ToolbarBtn = ({ icon, onClick, title }: any) => (
        <button type="button" onClick={onClick} title={title} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300 transition-colors">
            {icon}
        </button>
    );

    if (isEditing && currentPage) {
        return (
            <Layout>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"><ChevronLeft size={20} /></button>
                        <h1 className="text-2xl font-bold">Seite bearbeiten</h1>
                    </div>
                    <Button icon={isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18}/>} onClick={handleSavePage} disabled={isSaving}>Speichern</Button>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Card title="Inhalt">
                            <div className="flex gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                                {['de', 'en', 'fr', 'it'].map((l) => (
                                    <button key={l} onClick={() => setActiveLang(l as any)} className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-colors ${activeLang === l ? 'bg-brand-100 text-brand-700' : 'text-slate-500'}`}>{l}</button>
                                ))}
                            </div>
                            <div className="space-y-4">
                                <input type="text" className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-lg font-bold" value={currentPage.title[activeLang]} onChange={(e) => setCurrentPage({ ...currentPage, title: { ...currentPage.title, [activeLang]: e.target.value } })} />
                                <Editor value={currentPage.content[activeLang]} onChange={(val) => setCurrentPage({ ...currentPage, content: { ...currentPage.content, [activeLang]: val } })} />
                            </div>
                        </Card>
                    </div>
                    <Card title="URL & Status">
                        <div className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Slug</label><input type="text" className="w-full p-2 border rounded mt-1" value={currentPage.slug} onChange={(e) => setCurrentPage({ ...currentPage, slug: e.target.value })} /></div>
                            <div className="flex justify-between p-3 bg-slate-50 rounded-lg"><span>Status</span><button onClick={() => setCurrentPage({...currentPage, isPublished: !currentPage.isPublished})} className={`px-2 py-1 rounded text-xs font-bold ${currentPage.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200'}`}>{currentPage.isPublished ? 'Live' : 'Draft'}</button></div>
                        </div>
                    </Card>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold">Content & Navigation</h1>
                    <p className="text-slate-500">Verwalten Sie Landingpage-Inhalte, Mega-Menu und FAQs.</p>
                </div>
                <div className="flex gap-2">
                    {activeMainTab === 'NAV' && (
                        <Button icon={<Save size={18}/>} onClick={handleSaveNav} disabled={isSaving}>{isSaving ? 'Speichere...' : 'Navi Speichern'}</Button>
                    )}
                    {activeMainTab === 'FAQ' && (
                        <Button icon={<Save size={18}/>} onClick={handleSaveFaqs} disabled={isSaving}>{isSaving ? 'Speichere...' : 'FAQs Speichern'}</Button>
                    )}
                </div>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mb-8 overflow-x-auto no-scrollbar max-w-full">
                <button onClick={() => setActiveMainTab('CMS')} className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeMainTab === 'CMS' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}><FileText size={18}/> Statische Seiten</button>
                <button onClick={() => setActiveMainTab('NAV')} className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeMainTab === 'NAV' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}><Navigation2 size={18}/> Header Navigation</button>
                <button onClick={() => setActiveMainTab('FAQ')} className={`px-4 md:px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${activeMainTab === 'FAQ' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-500'}`}><HelpCircle size={18}/> FAQ Manager</button>
            </div>

            {activeMainTab === 'CMS' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {pages.map(page => (
                        <Card key={page.id} className="group">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="font-bold">{page.title.de}</h3>
                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${page.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{page.isPublished ? 'Live' : 'Draft'}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-mono">/p/{page.slug}</p>
                            <div className="mt-6 flex justify-end gap-2">
                                <button onClick={() => window.open(`#/p/${page.slug}`)} className="p-2 text-slate-400 hover:text-brand-600"><Eye size={18} /></button>
                                <button onClick={() => handleEditPage(page)} className="p-2 text-slate-400 hover:text-brand-600"><Edit size={18} /></button>
                            </div>
                        </Card>
                    ))}
                    <button onClick={() => {/* logic to create empty page */}} className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 hover:border-brand-300 hover:text-brand-600 transition-all"><Plus size={32} className="mb-2" /> Neue Seite</button>
                </div>
            )}

            {activeMainTab === 'NAV' && (
                <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                    {navigation.map(cat => (
                        <div key={cat.id} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2"><Navigation2 size={24} className="text-brand-600" /> {cat.title}</h2>
                                <Button size="sm" variant="outline" icon={<Plus size={14}/>} onClick={() => addNavLink(cat.id)}>Link hinzufügen</Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cat.links.map(link => (
                                    <div key={link.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative group">
                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <div className="space-y-1 flex-1">
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Titel</label>
                                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-1 text-sm font-bold" value={link.title} onChange={e => updateLink(cat.id, link.id, {title: e.target.value})} />
                                                </div>
                                                <div className="space-y-1 w-24">
                                                    <label className="text-[10px] font-black uppercase text-slate-400">Icon</label>
                                                    <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-1 text-xs" value={link.iconName} onChange={e => updateLink(cat.id, link.id, {iconName: e.target.value})} />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400">Beschreibung</label>
                                                <textarea className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-1 text-xs h-16" value={link.description} onChange={e => updateLink(cat.id, link.id, {description: e.target.value})} />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black uppercase text-slate-400">URL / Path</label>
                                                <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-1 text-xs font-mono" value={link.path} onChange={e => updateLink(cat.id, link.id, {path: e.target.value})} />
                                            </div>
                                        </div>
                                        <button onClick={() => deleteLink(cat.id, link.id)} className="absolute -top-2 -right-2 bg-red-100 text-red-600 p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeMainTab === 'FAQ' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-center px-2">
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2"><HelpCircle size={24} className="text-brand-600" /> FAQ Einträge</h2>
                        <Button variant="outline" icon={<Plus size={16}/>} onClick={addFaq}>Frage hinzufügen</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {faqs.map((faq, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm group">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-3 space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><Tag size={10}/> Kategorie</label>
                                            <input 
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-2 text-xs font-bold" 
                                                value={faq.category} 
                                                onChange={e => updateFaq(idx, { category: e.target.value })}
                                            />
                                        </div>
                                        <div className="pt-4 hidden lg:block">
                                            <button onClick={() => deleteFaq(idx)} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={14}/> Frage löschen
                                            </button>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-9 space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><HelpCircle size={10}/> Frage</label>
                                            <input 
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-2 text-sm font-bold" 
                                                value={faq.question} 
                                                onChange={e => updateFaq(idx, { question: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><MessageSquare size={10}/> Antwort</label>
                                            <textarea 
                                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded p-2 text-sm min-h-[80px]" 
                                                value={faq.answer} 
                                                onChange={e => updateFaq(idx, { answer: e.target.value })}
                                            />
                                        </div>
                                        <div className="lg:hidden">
                                            <button onClick={() => deleteFaq(idx)} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-600 transition-colors">
                                                <Trash2 size={14}/> Frage löschen
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Layout>
    );
};
