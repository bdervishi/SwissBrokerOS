import React from 'react';
import { Link } from 'react-router-dom';
import { BackToTop } from '../components/ui/BackToTop';
import { PublicNavigation } from '../components/PublicNavigation';
import { ArrowLeft, BookOpen, Clock, Calendar } from 'lucide-react';

const BLOG_POSTS = [
    {
        id: 1,
        title: "nDSG Compliance für Makler: Was Sie wissen müssen",
        excerpt: "Das neue Datenschutzgesetz bringt Pflichten für Finanzberater. Wir fassen die wichtigsten Punkte zusammen.",
        date: "12. Mai 2024",
        readTime: "5 Min",
        category: "Recht & Compliance",
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "KI in der Vorsorgeberatung",
        excerpt: "Wie künstliche Intelligenz hilft, Deckungslücken zu finden und die Beratung emotionaler zu gestalten.",
        date: "28. April 2024",
        readTime: "3 Min",
        category: "Technologie",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "Hypotheken-Zinsen: Ausblick Q3 2024",
        excerpt: "Eine Analyse der aktuellen SARON-Entwicklung und Empfehlungen für Festhypotheken.",
        date: "10. April 2024",
        readTime: "7 Min",
        category: "Markt",
        image: "https://images.unsplash.com/photo-1560518883-ce09059ee971?auto=format&fit=crop&q=80&w=800"
    }
];

export const PublicBlog: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 font-sans">
            <BackToTop />
            <PublicNavigation />

            <main className="pb-20 px-4 pt-8">
                <div className="max-w-6xl mx-auto">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-white transition-colors mb-12 font-medium">
                        <ArrowLeft size={16} /> Zurück zur Startseite
                    </Link>

                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                            <BookOpen size={14} /> Blog & Insights
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Wissen für Finanzprofis.</h1>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {BLOG_POSTS.map(post => (
                            <article key={post.id} className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className="h-48 overflow-hidden">
                                    <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                                        <span className="font-bold text-brand-600 uppercase tracking-wider">{post.category}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12}/> {post.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={12}/> {post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">{post.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <button className="text-sm font-bold text-brand-600 hover:text-brand-500">Mehr lesen →</button>
                                </div>
                            </article>
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