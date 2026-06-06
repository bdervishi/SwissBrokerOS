import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CaseStudy } from '../types';
import { BackToTop } from '../components/ui/BackToTop';
import { PublicNavigation } from '../components/PublicNavigation';
import { ArrowLeft, Award } from 'lucide-react';

export const PublicCaseStudies: React.FC = () => {
    const [stories, setStories] = useState<CaseStudy[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('app_case_studies');
        if (saved) {
            setStories(JSON.parse(saved));
        } else {
            // Fallback Mock Data if none generated yet
            setStories([
                {
                    id: 'mock-1',
                    title: 'Digitalisierung einer Traditions-Kanzlei',
                    title_de: 'Digitalisierung einer Traditions-Kanzlei',
                    client: 'Muster Finanz AG',
                    category: 'Transformation',
                    year: '2023',
                    description: 'Wie wir papierlose Prozesse einführten.',
                    description_de: 'Wie wir papierlose Prozesse einführten.',
                    challenge: 'Veraltete IT',
                    challenge_de: 'Veraltete IT',
                    solution: 'SwissBroker OS Enterprise',
                    solution_de: 'SwissBroker OS Enterprise',
                    result: 'Effizienz +50%',
                    result_de: 'Effizienz +50%',
                    technologies: ['SaaS', 'Cloud'],
                    stats: [{label: 'ROI', label_de: 'ROI', value: '300%'}],
                    image_prompt: '',
                    createdAt: new Date().toISOString()
                }
            ]);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            <BackToTop />
            <PublicNavigation />

            <main className="pb-20 px-4 pt-8">
                <div className="max-w-5xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
                        <ArrowLeft size={16} /> Zurück zur Startseite
                    </Link>

                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <Award size={14} /> Success Stories
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Erfolge, die sprechen.</h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Sehen Sie, wie führende Schweizer Broker mit unserer Technologie wachsen.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-12">
                        {stories.map((story) => (
                            <div key={story.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all group">
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-6">
                                            <span className="text-xs font-black uppercase tracking-widest text-brand-600">{story.client}</span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-xs font-bold text-slate-500">{story.category}</span>
                                        </div>
                                        <h2 className="text-3xl font-black mb-6 leading-tight group-hover:text-brand-600 transition-colors">
                                            {story.title_de || story.title}
                                        </h2>
                                        <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                                            {story.description_de || story.description}
                                        </p>
                                        
                                        <div className="grid grid-cols-2 gap-6 mb-8">
                                            <div>
                                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Herausforderung</h4>
                                                <p className="font-medium">{story.challenge_de || story.challenge}</p>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold uppercase text-slate-400 mb-1">Lösung</h4>
                                                <p className="font-medium text-emerald-600">{story.solution_de || story.solution}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-8">
                                            {story.technologies.map(tech => (
                                                <span key={tech} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats Column */}
                                    <div className="w-full md:w-64 flex flex-col gap-4">
                                        {story.stats.map((stat, i) => (
                                            <div key={i} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                                                <div className="text-3xl font-black text-brand-600 dark:text-white mb-1">{stat.value}</div>
                                                <div className="text-xs font-bold uppercase text-slate-400">{stat.label_de || stat.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </main>

            <footer className="py-12 border-t border-slate-200 dark:border-white/5 text-center text-slate-500 dark:text-slate-600 text-xs">
                &copy; {new Date().getFullYear()} SwissBroker OS. Alle Rechte vorbehalten.
            </footer>
        </div>
    );
};