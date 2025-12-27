import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { StaticPage, LocalizedContent } from '../types';
import { MOCK_STATIC_PAGES } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BackToTop } from '../components/ui/BackToTop';

export const PublicPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const { language } = useLanguage();
    const [page, setPage] = useState<StaticPage | null>(null);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Load pages from local storage if available (admin edits), else use mock
        const stored = localStorage.getItem('app_static_pages');
        const allPages: StaticPage[] = stored ? JSON.parse(stored) : MOCK_STATIC_PAGES;
        const found = allPages.find(p => p.slug === slug && p.isPublished);
        setPage(found || null);
    }, [slug]);

    useEffect(() => {
        if (localStorage.theme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    if (!page) {
        // Simple 404 for this view
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-slate-500 mb-8">Seite nicht gefunden.</p>
                <Link to="/"><Button>Zurück zur Startseite</Button></Link>
            </div>
        );
    }

    // Language Fallback Logic
    const contentLang = (language as keyof LocalizedContent) in page.title 
        ? (language as keyof LocalizedContent) 
        : 'de';

    const title = page.title[contentLang];
    const content = page.content[contentLang];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500">
            <BackToTop />
            <nav className="fixed w-full z-50 border-b border-slate-200 dark:border-white/10 backdrop-blur-md bg-white/70 dark:bg-slate-950/70">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">+</div>
                        <span className="text-slate-900 dark:text-white">SwissBroker</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 pt-32 pb-20">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
                    <ArrowLeft size={16} /> Zurück zur Startseite
                </Link>
                
                <article className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-slate-900 dark:text-white tracking-tight">
                        {title}
                    </h1>
                    
                    <div 
                        className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-brand-600 hover:prose-a:text-brand-500"
                        dangerouslySetInnerHTML={{ __html: content }} 
                    />
                </article>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};