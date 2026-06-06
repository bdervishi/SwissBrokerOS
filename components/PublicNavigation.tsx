
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/Button';
import { MOCK_NAVIGATION } from '../constants';
import { 
    Sun, 
    Moon, 
    Menu, 
    X, 
    ChevronDown, 
    Info,
    ChevronRight,
    Home
} from 'lucide-react';
import { MegaMenuCategory, MegaMenuLink } from '../types';
import * as Icons from 'lucide-react';

export const PublicNavigation: React.FC = () => {
    const location = useLocation();
    const [isDark, setIsDark] = useState(true);
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Initial Theme Load
    useEffect(() => {
        if (localStorage.theme === 'light') {
            setIsDark(false);
            document.documentElement.classList.remove('dark');
        } else {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
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

    // --- BREADCRUMB LOGIC ---
    const getBreadcrumbs = () => {
        const path = location.pathname;
        if (path === '/') return null;

        let category: MegaMenuCategory | undefined;
        let link: MegaMenuLink | undefined;

        // Find the active link in navigation structure
        for (const cat of MOCK_NAVIGATION) {
            const found = cat.links.find(l => l.path === path || (path.startsWith('/p/') && l.path === path));
            if (found) {
                category = cat;
                link = found;
                break;
            }
        }

        // Manual mapping for pages not in MOCK_NAVIGATION (like Legal)
        if (!link) {
            if (path.includes('/legal/')) {
                return (
                    <>
                        <Link to="/" className="hover:text-brand-600">Startseite</Link>
                        <ChevronRight size={12} className="text-slate-400" />
                        <span className="text-slate-900 dark:text-white font-medium">Rechtliches</span>
                    </>
                );
            }
            // Fallback
            return (
                <>
                    <Link to="/" className="hover:text-brand-600">Startseite</Link>
                    <ChevronRight size={12} className="text-slate-400" />
                    <span className="text-slate-900 dark:text-white font-medium">Seite</span>
                </>
            );
        }

        return (
            <>
                <Link to="/" className="hover:text-brand-600 flex items-center gap-1"><Home size={12} /> Start</Link>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-slate-500">{category?.title}</span>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="text-slate-900 dark:text-white font-medium text-brand-600 dark:text-brand-400">{link?.title}</span>
            </>
        );
    };

    const DynamicIcon = ({ name }: { name: string }) => {
        const Icon = (Icons as any)[name] || Info;
        return <Icon size={20} />;
    };

    return (
        <>
            <nav 
                className={`fixed w-full z-[100] transition-all duration-300 border-b ${
                    scrolled || location.pathname !== '/' 
                    ? 'bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-slate-200 dark:border-white/10 shadow-sm' 
                    : 'bg-transparent border-transparent'
                }`}
                onMouseLeave={() => setActiveMenu(null)}
            >
                {/* Main Bar */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-12">
                        <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2 shrink-0">
                            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">+</div>
                            <span className="text-slate-900 dark:text-white">SwissBroker</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {MOCK_NAVIGATION.map((cat) => (
                                <div 
                                    key={cat.id} 
                                    className="relative h-20 flex items-center"
                                    onMouseEnter={() => setActiveMenu(cat.id)}
                                >
                                    <button className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${activeMenu === cat.id ? 'text-brand-600' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'}`}>
                                        {cat.title}
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${activeMenu === cat.id ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button 
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
                        >
                            {isDark ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <Link to="/login/broker" className="hidden sm:block text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors text-sm font-medium mr-2">Login</Link>
                        <Link to="/register">
                            <Button variant="primary" className="shadow-lg shadow-brand-500/20">Jetzt starten</Button>
                        </Link>
                        <button 
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-600 dark:text-slate-300"
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Breadcrumbs Bar (Visible on subpages) */}
                {location.pathname !== '/' && (
                    <div className="w-full bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5 backdrop-blur-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center text-xs text-slate-500 dark:text-slate-400 gap-2">
                            {getBreadcrumbs()}
                        </div>
                    </div>
                )}

                {/* Mega Menu Dropdown */}
                <div className={`hidden lg:block absolute left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300 origin-top ${activeMenu ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
                    <div className="max-w-7xl mx-auto px-8 py-10">
                        {MOCK_NAVIGATION.map((cat) => (
                            <div key={cat.id} className={activeMenu === cat.id ? 'block animate-in fade-in slide-in-from-top-2 duration-300' : 'hidden'}>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    {cat.links.map((link) => (
                                        <Link 
                                            key={link.id} 
                                            to={link.path}
                                            onClick={() => setActiveMenu(null)}
                                            className="group p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                    <DynamicIcon name={link.iconName} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{link.title}</h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{link.description}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden absolute top-20 left-0 w-full h-[calc(100vh-80px)] bg-white dark:bg-slate-950 p-6 overflow-y-auto z-[99] border-t border-slate-200 dark:border-slate-800">
                        <div className="space-y-8 pb-20">
                            {MOCK_NAVIGATION.map((cat) => (
                                <div key={cat.id}>
                                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{cat.title}</h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {cat.links.map((link) => (
                                            <Link 
                                                key={link.id} 
                                                to={link.path} 
                                                onClick={() => setMobileMenuOpen(false)}
                                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                                            >
                                                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                                    <DynamicIcon name={link.iconName} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{link.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-1">{link.description}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                                <Link to="/login/broker" onClick={() => setMobileMenuOpen(false)} className="text-center font-bold text-slate-600 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">Login</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                                    <Button className="w-full py-4 text-lg">Jetzt starten</Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
            {/* Spacer for fixed nav */}
            <div className={`h-20 ${location.pathname !== '/' ? 'mb-10' : ''}`}></div> 
        </>
    );
};
