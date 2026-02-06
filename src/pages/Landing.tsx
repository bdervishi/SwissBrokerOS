
import React, { useState } from 'react';
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
  ShieldHalf,
  ArrowRight,
  Building2, 
  UserCheck, 
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { BackToTop } from '../components/ui/BackToTop';
import { Testimonial } from '../components/Testimonial';
import { PublicNavigation } from '../components/PublicNavigation';
import { MOCK_STATIC_PAGES } from '../constants';

export const Landing: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
        title: "BYOS: Ihre Daten, Ihre Regeln.",
        subtitle: "Keine Migration nötig. Verbinden Sie OneDrive oder SharePoint nahtlos und behalten Sie volle Datenhoheit.",
        tag: "Zero Lock-In",
        tagColor: "red"
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const getStaticLink = (slug: string) => {
      const page = MOCK_STATIC_PAGES.find(p => p.slug === slug);
      if (page && page.isPublished) {
          return <Link to={`/p/${page.slug}`} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">{page.title.de}</Link>;
      }
      return null;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:white overflow-x-hidden transition-colors duration-500">
      <BackToTop />
      <PublicNavigation />

      {/* Hero Section */}
      <section className="relative h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden -mt-20 pt-20">
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
              icon={<HardDrive className="h-8 w-8 text-red-600 dark:text-red-500" />}
              title="BYOS / Swiss Vault"
              description="Behalten Sie die Datenhoheit. Verbinden Sie OneDrive/SharePoint nahtlos oder nutzen Sie unseren Swiss Vault."
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
            <p className="font-medium">© {new Date().getFullYear()} SwissBroker OS. Ein Produkt der <a href="https://www.trifti.ch" target="_blank" rel="noreferrer" className="hover:text-brand-600 dark:hover:text-slate-300 transition-colors font-bold">Trifti GmbH</a>.</p>
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
