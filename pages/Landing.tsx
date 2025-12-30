
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroScene } from '../components/3d/HeroScene';
import { 
  ShieldCheck, 
  TrendingUp, 
  FileCheck, 
  Server, 
  ChevronLeft, 
  ChevronRight, 
  Mail, 
  Linkedin, 
  Twitter,
  MapPin,
  ShieldHalf,
  ArrowRight,
  Sun,
  Moon,
  ChevronDown,
  Users,
  BrainCircuit,
  Calculator,
  Database,
  Blocks,
  Handshake,
  Info,
  Briefcase,
  DollarSign,
  Menu,
  X,
  ShieldAlert,
  UserCheck,
  // Fixed: added missing Building2 icon import
  Building2
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BackToTop } from '../components/ui/BackToTop';
import { Testimonial } from '../components/Testimonial';
import { MOCK_STATIC_PAGES, MOCK_NAVIGATION } from '../constants';
import { StaticPage, MegaMenuCategory } from '../types';

// Helper to map icon names to Lucide components
const IconMap: Record<string, any> = {
  Users, BrainCircuit, Calculator, ShieldCheck, Database, Blocks, Handshake, Info, Briefcase, DollarSign
};

export const Landing: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDark, setIsDark] = useState(true);
  const [staticPages, setStaticPages] = useState<StaticPage[]>(MOCK_STATIC_PAGES);
  const [navigation, setNavigation] = useState<MegaMenuCategory[]>(MOCK_NAVIGATION);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const slides = [
    {
        title: "Das Betriebssystem für moderne Makler.",
        subtitle: "Verwalten Sie Versicherungen, Steuern, Hypotheken und Vermögen Ihrer Klienten auf einer einzigen, sicheren Plattform.",
        tag: "Neu: KI-gestützte Risikoanalyse",
        tagColor: "brand"
    },
    {
        title: "Vorsorge & Vermögen visualisieren.",
        subtitle: "Beeindrucken Sie Ihre Klienten mit interaktiven 3D-Analysen ihrer Vermögenssituation und Vorsorgelücken.",
        tag: "Sales-Booster",
        tagColor: "emerald"
    },
    {
        title: "Swiss Vault Sicherheit.",
        subtitle: "Ihre Daten bleiben in der Schweiz. Tier IV Datacenter in Zürich, Ende-zu-Ende verschlüsselt.",
        tag: "100% Swiss Hosted",
        tagColor: "red"
    }
  ];

  useEffect(() => {
    if (localStorage.theme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }

    const storedPages = localStorage.getItem('app_static_pages');
    if (storedPages) setStaticPages(JSON.parse(storedPages));
    
    const storedNav = localStorage.getItem('app_navigation');
    if (storedNav) setNavigation(JSON.parse(storedNav));
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const getStaticLink = (slug: string) => {
      const page = staticPages.find(p => p.slug === slug);
      if (page && page.isPublished) {
          return <Link to={`/p/${page.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{page.title.de}</Link>;
      }
      return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:white overflow-x-hidden transition-colors duration-500">
      <BackToTop />
      
      {/* Navbar */}
      <nav 
        className="fixed w-full z-[100] border-b border-slate-200 dark:border-white/10 backdrop-blur-md bg-white/70 dark:bg-slate-950/70"
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link to="/" className="font-bold text-2xl tracking-tight flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">+</div>
                <span className="text-slate-900 dark:text-white">SwissBroker</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
                {navigation.map((cat) => (
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
              title="Theme umschalten"
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

        {/* Mega Menu Dropdown */}
        <div className={`hidden lg:block absolute left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 shadow-2xl transition-all duration-300 origin-top ${activeMenu ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible'}`}>
            <div className="max-w-7xl mx-auto px-8 py-10">
                {navigation.map((cat) => (
                    <div key={cat.id} className={activeMenu === cat.id ? 'block animate-in fade-in slide-in-from-top-2 duration-300' : 'hidden'}>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {cat.links.map((link) => {
                                const IconComp = IconMap[link.iconName] || Info;
                                return (
                                    <Link 
                                        key={link.id} 
                                        to={link.path}
                                        className="group p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                                                <IconComp size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors">{link.title}</h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{link.description}</p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="lg:hidden absolute top-20 left-0 w-full h-[calc(100vh-80px)] bg-white dark:bg-slate-950 p-6 overflow-y-auto z-[99]">
                <div className="space-y-8">
                    {navigation.map((cat) => (
                        <div key={cat.id}>
                            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{cat.title}</h3>
                            <div className="grid grid-cols-1 gap-4">
                                {cat.links.map((link) => {
                                    const IconComp = IconMap[link.iconName] || Info;
                                    return (
                                        <Link 
                                            key={link.id} 
                                            to={link.path} 
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-4 p-2"
                                        >
                                            <div className="w-10 h-10 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center text-slate-500">
                                                <IconComp size={20} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{link.title}</p>
                                                <p className="text-xs text-slate-500">{link.description}</p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                    <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-4">
                         <Link to="/login/broker" onClick={() => setMobileMenuOpen(false)} className="text-center font-bold text-slate-600 dark:text-slate-400">Login</Link>
                         <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                            <Button className="w-full">Jetzt starten</Button>
                         </Link>
                    </div>
                </div>
            </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        <HeroScene currentSlide={currentSlide} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full flex flex-col items-center">
            <div className="text-center min-h-[320px] flex flex-col items-center justify-center">
                {slides.map((slide, index) => (
                    <div 
                        key={index} 
                        className={`absolute transition-all duration-700 ease-out transform ${
                            index === currentSlide 
                            ? 'opacity-100 translate-y-0 relative' 
                            : 'opacity-0 translate-y-8 absolute pointer-events-none top-0 left-0 w-full'
                        }`}
                    >
                         <div className={`inline-block px-4 py-1.5 rounded-full border text-sm font-bold mb-6 backdrop-blur-sm 
                            ${slide.tagColor === 'brand' ? 'bg-brand-500/10 border-brand-500/30 text-brand-700 dark:text-brand-300' : ''}
                            ${slide.tagColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300' : ''}
                            ${slide.tagColor === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-300' : ''}
                         `}>
                            {slide.tag}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                            {slide.title}
                        </h1>
                        <p className="text-xl text-slate-600 dark:text-slate-300 mb-2 max-w-2xl mx-auto font-medium">
                            {slide.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 mb-24">
                <Link to="/register">
                    <Button size="lg" className="w-full sm:w-auto px-12 py-4 text-lg shadow-2xl shadow-brand-600/10" icon={<ArrowRight size={20}/>}>Gratis Registrieren</Button>
                </Link>
                <Link to="/login/broker">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-800 px-12">
                        Demo ansehen
                    </Button>
                </Link>
            </div>
        </div>

        <div className="absolute bottom-8 left-0 w-full z-20 flex items-center justify-center gap-8">
            <button 
                onClick={prevSlide}
                className="p-3 rounded-full bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
            >
                <ChevronLeft size={24} />
            </button>
            <div className="flex gap-3">
                {slides.map((_, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`transition-all duration-300 ${
                            idx === currentSlide ? 'w-10 bg-brand-500' : 'w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                        } h-1.5 rounded-full`}
                    />
                ))}
            </div>
            <button 
                onClick={nextSlide}
                className="p-3 rounded-full bg-white/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-700/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white transition-all backdrop-blur-sm hover:scale-110 active:scale-95"
            >
                <ChevronRight size={24} />
            </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-900 relative z-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-brand-600 dark:text-brand-400" />}
              title="360° Versicherung"
              description="Vollständige Übersicht aller Policen, Fristen und Deckungen. Automatische Mutationen."
            />
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />}
              title="Steuer-Vorbereitung"
              description="Automatisierte Aufbereitung relevanter Daten für die Steuererklärung Ihrer Klienten."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
              title="Hypotheken & Vermögen"
              description="Szenario-Rechner für Eigenheimfinanzierung und integrierte Vermögensübersicht."
            />
            <FeatureCard 
              icon={<Server className="h-8 w-8 text-red-600 dark:text-red-500" />}
              title="100% Swiss Hosted"
              description="Physische Datenhaltung in Zürich (Tier IV). Konform mit nDSG und FINMA-Standards."
            />
          </div>
        </div>
      </section>

      <Testimonial />

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-white/10 pt-16 pb-8 relative z-10 transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="space-y-6 lg:col-span-2">
              <div className="font-bold text-2xl tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm">+</div>
                SwissBroker
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-medium max-w-sm">
                Das erste ganzheitliche Betriebssystem für den Schweizer Finanz- und Versicherungsmarkt. Entwickelt für Wachstum und kompromisslose Sicherheit.
              </p>
              <div className="flex gap-4">
                <a href="#" className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5 shadow-sm"><Linkedin size={18} /></a>
                <a href="#" className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5 shadow-sm"><Twitter size={18} /></a>
                <a href="mailto:info@swissbroker-os.ch" className="p-2 bg-white dark:bg-slate-900 rounded-lg text-slate-400 hover:text-brand-600 dark:hover:text-white transition-colors border border-slate-200 dark:border-white/5 shadow-sm"><Mail size={18} /></a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-6">Plattform</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li><Link to="/features/crm" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">CRM für Makler</Link></li>
                <li><Link to="/features/ai-risk" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">KI-Risikoanalyse</Link></li>
                <li><Link to="/features/mortgage-calc" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Hypothekenrechner</Link></li>
                <li><Link to="/features/tax-module" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Steuermodul</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-6">Portal Logins</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li><Link to="/login/broker" className="flex items-center gap-2 hover:text-brand-600 transition-colors"><Building2 size={14}/> Makler Login</Link></li>
                <li><Link to="/login/client" className="flex items-center gap-2 hover:text-emerald-600 transition-colors"><UserCheck size={14}/> Kunden Portal</Link></li>
                <li><Link to="/login/saas" className="flex items-center gap-2 hover:text-purple-600 transition-colors"><ShieldAlert size={14}/> SaaS Admin</Link></li>
                <li><Link to="/faq" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Hilfe & FAQ</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-6">Vertrauen</h4>
              <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                <li className="flex items-center gap-2">
                    <ShieldHalf size={16} className="text-emerald-600 dark:text-emerald-500" />
                    <span>nDSG Konform (CH)</span>
                </li>
                <li className="flex items-center gap-2">
                    <Server size={16} className="text-emerald-600 dark:text-emerald-500" />
                    <span>ISO 27001 Datacenter</span>
                </li>
                <li className="flex items-center gap-2 text-xs pt-2">
                    <div className="w-3 h-3 bg-red-600 rounded-sm"></div>
                    <span>Made in Switzerland</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap gap-6 font-medium">
                {getStaticLink('impressum')}
                {getStaticLink('datenschutz')}
                <Link to="/legal/terms" className="hover:text-brand-600 dark:hover:text-slate-300">AGB</Link>
            </div>
            <p className="font-medium">© {new Date().getFullYear()} SwissBroker OS (Fintech Switzerland AG). Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 transition-all shadow-sm hover:shadow-md">
    <div className="mb-6">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">{title}</h3>
    <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{description}</p>
  </div>
);
