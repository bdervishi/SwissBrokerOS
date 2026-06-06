import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Testimonial } from '../types';
import { MOCK_TESTIMONIALS } from '../constants';
import { 
    MessageSquareQuote, 
    Plus, 
    Trash2, 
    Save, 
    User, 
    Building2, 
    Type, 
    Image as ImageIcon,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';

export const SaaSTestimonials: React.FC = () => {
    const { role } = useAuth();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('app_testimonials');
        if (saved) {
            setTestimonials(JSON.parse(saved));
        } else {
            setTestimonials(MOCK_TESTIMONIALS);
        }
    }, []);

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_MARKETING) {
        return <Navigate to="/dashboard" />;
    }

    const handleSave = () => {
        setIsSaving(true);
        localStorage.setItem('app_testimonials', JSON.stringify(testimonials));
        setTimeout(() => setIsSaving(false), 800);
    };

    const addTestimonial = () => {
        const newT: Testimonial = {
            id: Date.now().toString(),
            quote: "Neues Zitat hier eingeben...",
            author: "Max Mustermann",
            role: "Position",
            company: "Firma",
            avatar: "https://i.pravatar.cc/150?u=" + Date.now()
        };
        setTestimonials([...testimonials, newT]);
    };

    const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    };

    const deleteTestimonial = (id: string) => {
        setTestimonials(prev => prev.filter(t => t.id !== id));
    };

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <MessageSquareQuote className="text-brand-600" />
                        Landingpage Testimonials
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwalten Sie das Feedback der Makler auf der Startseite.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" icon={<Plus size={18} />} onClick={addTestimonial}>Hinzufügen</Button>
                    <Button icon={isSaving ? <RefreshCw className="animate-spin" size={18}/> : <Save size={18} />} onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Speichere...' : 'Änderungen publizieren'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {testimonials.map((t, index) => (
                    <Card key={t.id} className="relative overflow-visible">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-lg">
                            {index + 1}
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-4">
                                <div>
                                    <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Zitat / Feedback</label>
                                    <textarea 
                                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm"
                                        value={t.quote}
                                        rows={4}
                                        onChange={(e) => updateTestimonial(t.id, { quote: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><User size={10}/> Autor</label>
                                        <input 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                            value={t.author}
                                            onChange={(e) => updateTestimonial(t.id, { author: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><Type size={10}/> Rolle</label>
                                        <input 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                            value={t.role}
                                            onChange={(e) => updateTestimonial(t.id, { role: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><Building2 size={10}/> Firma</label>
                                        <input 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                            value={t.company}
                                            onChange={(e) => updateTestimonial(t.id, { company: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-1"><ImageIcon size={10}/> Avatar URL</label>
                                        <input 
                                            className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                            value={t.avatar}
                                            onChange={(e) => updateTestimonial(t.id, { avatar: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-between items-center">
                                    <img src={t.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-brand-500" alt="" />
                                    <button 
                                        onClick={() => deleteTestimonial(t.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </Layout>
    );
};