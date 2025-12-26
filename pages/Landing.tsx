import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeroScene } from '../components/3d/HeroScene';
import { ShieldCheck, TrendingUp, FileCheck, Lock, Server, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import { Button } from '../components/ui/Button';

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
        title: "Swiss Vault Sicherheit.",
        subtitle: "Ihre Daten bleiben in der Schweiz. Tier IV Datacenter in Zürich, Ende-zu-Ende verschlüsselt.",
        tag: "100% Swiss Hosted",
        tagColor: "red"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    // Optional auto-play can be added here
    const timer = setInterval(() => {
        // setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="font-bold text-2xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white font-serif font-bold text-lg">+</div>
            SwissBroker
          </div>
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="primary">Login</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center pt-20 overflow-hidden">
        
        {/* 3D Background */}
        <HeroScene currentSlide={currentSlide} />
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full flex flex-col items-center">
          
            {/* Slider Content */}
            <div className="text-center min-h-[300px] flex flex-col items-center justify-center transition-opacity duration-500">
                {slides.map((slide, index) => (
                    <div 
                        key={index} 
                        className={`absolute transition-all duration-700 ease-out transform ${
                            index === currentSlide 
                            ? 'opacity-100 translate-y-0 relative' 
                            : 'opacity-0 translate-y-8 absolute pointer-events-none top-0 left-0 w-full'
                        }`}
                    >
                         <div className={`inline-block px-4 py-1.5 rounded-full border text-sm font-medium mb-6 backdrop-blur-sm 
                            ${slide.tagColor === 'brand' ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' : ''}
                            ${slide.tagColor === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : ''}
                            ${slide.tagColor === 'red' ? 'bg-red-500/10 border-red-500/30 text-red-300' : ''}
                         `}>
                            {slide.tag}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {slide.title}
                        </h1>
                        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                            {slide.subtitle}
                        </p>
                    </div>
                ))}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <Link to="/dashboard">
                <Button size="lg" className="w-full sm:w-auto px-8">Demo starten</Button>
                </Link>
                <Button variant="outline" size="lg" className="w-full sm:w-auto border-slate-600 text-slate-200 hover:bg-slate-800">
                Mehr erfahren
                </Button>
            </div>

            {/* Slider Controls */}
            <div className="absolute bottom-10 left-0 w-full flex items-center justify-center gap-8">
                <button 
                    onClick={prevSlide}
                    className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-white transition-colors backdrop-blur-sm"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <div className="flex gap-3">
                    {slides.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`transition-all duration-300 ${
                                idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-slate-600 hover:bg-slate-500'
                            } h-2 rounded-full`}
                        />
                    ))}
                </div>

                <button 
                    onClick={nextSlide}
                    className="p-3 rounded-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700 text-white transition-colors backdrop-blur-sm"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="h-8 w-8 text-brand-400" />}
              title="360° Versicherung"
              description="Vollständige Übersicht aller Policen, Fristen und Deckungen. Automatische Mutationen."
            />
            <FeatureCard 
              icon={<FileCheck className="h-8 w-8 text-emerald-400" />}
              title="Steuer-Vorbereitung"
              description="Automatisierte Aufbereitung relevanter Daten für die Steuererklärung Ihrer Klienten."
            />
            <FeatureCard 
              icon={<TrendingUp className="h-8 w-8 text-purple-400" />}
              title="Hypotheken & Vermögen"
              description="Szenario-Rechner für Eigenheimfinanzierung und integrierte Vermögensübersicht."
            />
            <FeatureCard 
              icon={<Server className="h-8 w-8 text-red-500" />}
              title="100% Swiss Hosted"
              description="Physische Datenhaltung in Zürich (Tier IV). Konform mit nDSG und FINMA-Standards."
            />
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors">
    <div className="mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2 text-white">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);