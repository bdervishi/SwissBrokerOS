
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StaticPage, LocalizedContent } from '../types';
import { MOCK_STATIC_PAGES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/Button';
import { BackToTop } from '../components/ui/BackToTop';
import { PublicNavigation } from '../components/PublicNavigation';
import { Modal } from '../components/ui/Modal';
import { MessageSquare, LifeBuoy, Handshake, CheckCircle2, ArrowRight } from 'lucide-react';

export const PublicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { language } = useLanguage();
    const [page, setPage] = useState<StaticPage | null>(null);
    
    // Contact Wizard State
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
    const [contactType, setContactType] = useState<'SUPPORT' | 'SALES' | 'PARTNER' | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });

    useEffect(() => {
        // Load pages from local storage if available (admin edits), else use mock
        const stored = localStorage.getItem('app_static_pages');
        const allPages: StaticPage[] = stored ? JSON.parse(stored) : MOCK_STATIC_PAGES;
        const found = allPages.find(p => p.slug === slug && p.isPublished);
        setPage(found || null);
    }, [slug]);

    const handleWizardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setWizardStep(3);
        // Simulate API call
        console.log("Contact Form Submitted:", { contactType, ...formData });
    };

    if (!page) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                <PublicNavigation />
                <div className="pt-32 text-center">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-slate-500 mb-8">Seite nicht gefunden.</p>
                    <Link to="/"><Button>Zurück zur Startseite</Button></Link>
                </div>
            </div>
        );
    }

    // Language Fallback Logic
    const contentLang = (language as keyof LocalizedContent) in page.title 
        ? (language as keyof LocalizedContent) 
        : 'de';

    const title = page.title[contentLang];
    const content = page.content[contentLang];
    const isContactPage = slug === 'contact';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
            <BackToTop />
            <PublicNavigation />

            <main className="max-w-6xl mx-auto px-4 pb-20 pt-8">
                <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-12 text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    
                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-500"
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />

                    {/* Specifically inject the Wizard Button if it's the Contact Page */}
                    {isContactPage && (
                        <div className="mt-8">
                            <Button 
                                size="lg" 
                                className="w-full md:w-auto px-8 py-6 text-lg font-bold shadow-xl shadow-brand-500/20"
                                onClick={() => setIsWizardOpen(true)}
                                icon={<MessageSquare size={20} />}
                            >
                                Anfrage starten
                            </Button>
                        </div>
                    )}
                </article>
            </main>

            {/* Contact Wizard Modal */}
            {isContactPage && (
                <Modal
                    isOpen={isWizardOpen}
                    onClose={() => { setIsWizardOpen(false); setWizardStep(1); }}
                    title="Kontakt Assistent"
                    maxWidth="max-w-xl"
                >
                    <div className="p-4">
                        {/* Progress Bar */}
                        <div className="flex gap-2 mb-8">
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${wizardStep >= 1 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${wizardStep >= 2 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                            <div className={`h-1.5 flex-1 rounded-full transition-colors ${wizardStep >= 3 ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                        </div>

                        {wizardStep === 1 && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Worum geht es?</h3>
                                <p className="text-slate-500 mb-6 text-sm">Wählen Sie einen Bereich, damit wir Sie direkt verbinden können.</p>
                                
                                <button 
                                    onClick={() => { setContactType('SALES'); setWizardStep(2); }}
                                    className="w-full p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/10 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-brand-600 shadow-sm group-hover:scale-110 transition-transform">
                                        <ArrowRight size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Interessiert am Produkt</div>
                                        <div className="text-xs text-slate-500 mt-1">Demo, Preise, Features</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => { setContactType('SUPPORT'); setWizardStep(2); }}
                                    className="w-full p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                        <LifeBuoy size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Hilfe & Support</div>
                                        <div className="text-xs text-slate-500 mt-1">Technische Fragen, Login-Probleme</div>
                                    </div>
                                </button>

                                <button 
                                    onClick={() => { setContactType('PARTNER'); setWizardStep(2); }}
                                    className="w-full p-4 flex items-center gap-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all text-left group"
                                >
                                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                                        <Handshake size={24} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900 dark:text-white">Partnerschaft</div>
                                        <div className="text-xs text-slate-500 mt-1">Affiliate, Integrationen, Presse</div>
                                    </div>
                                </button>
                            </div>
                        )}

                        {wizardStep === 2 && (
                            <form onSubmit={handleWizardSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Ihre Details</h3>
                                    <p className="text-slate-500 text-sm">Bereich: <span className="font-bold text-brand-600">{contactType}</span></p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Name</label>
                                        <input 
                                            required
                                            type="text" 
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="Ihr Name"
                                            value={formData.name}
                                            onChange={e => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">E-Mail</label>
                                        <input 
                                            required
                                            type="email" 
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="ihre@email.ch"
                                            value={formData.email}
                                            onChange={e => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nachricht</label>
                                        <textarea 
                                            required
                                            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none h-32 resize-none"
                                            placeholder="Wie können wir helfen?"
                                            value={formData.message}
                                            onChange={e => setFormData({...formData, message: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="ghost" onClick={() => setWizardStep(1)}>Zurück</Button>
                                    <Button type="submit" className="flex-1">Absenden</Button>
                                </div>
                            </form>
                        )}

                        {wizardStep === 3 && (
                            <div className="text-center py-8 animate-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
                                    <CheckCircle2 size={40} strokeWidth={3} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Nachricht gesendet!</h3>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">
                                    Vielen Dank, {formData.name}. Unser Team meldet sich in Kürze unter {formData.email} bei Ihnen.
                                </p>
                                <Button className="w-full" onClick={() => setIsWizardOpen(false)}>Schliessen</Button>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Ein Produkt der <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="font-bold hover:text-brand-600 dark:hover:text-slate-300 transition-colors">Trifti GmbH</a>. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};
