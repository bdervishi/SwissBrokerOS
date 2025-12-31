
import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ShieldCheck, Mail, Send, Clock, AlertCircle } from 'lucide-react';
import { useSecurity } from '../contexts/SecurityContext';

export const MaintenanceView: React.FC = () => {
    const { maintenanceMessage } = useSecurity();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500">
            <div className="max-w-2xl w-full">
                {/* Branding */}
                <div className="flex justify-center items-center gap-3 mb-12">
                    <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-lg">+</div>
                    <span className="font-black text-2xl tracking-tighter uppercase dark:text-white">SwissBroker <span className="text-slate-400">OS</span></span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    {/* Message Area */}
                    <div className="md:col-span-7 space-y-6">
                        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-amber-200 dark:border-amber-800">
                            <Clock size={14} className="animate-spin-slow" /> Wartungsmodus Aktiv
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-tight">
                            Gleich sind wir wieder für Sie da.
                        </h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                            {maintenanceMessage}
                        </p>
                        
                        <div className="flex flex-col gap-4 pt-4">
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <ShieldCheck size={18} className="text-emerald-500" />
                                <span>Ihre Daten sind währenddessen sicher verschlüsselt.</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                <AlertCircle size={18} className="text-brand-500" />
                                <span>Geplante Rückkehr: Heute, ca. 14:00 Uhr.</span>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form Area */}
                    <div className="md:col-span-5">
                        <Card className="p-6 border-slate-200 dark:border-slate-800 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
                            {submitted ? (
                                <div className="text-center py-8 animate-in zoom-in duration-300">
                                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShieldCheck size={32} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Nachricht gesendet</h3>
                                    <p className="text-xs text-slate-500 mt-2">Wir melden uns, sobald das System wieder online ist.</p>
                                    <Button variant="ghost" size="sm" className="mt-6" onClick={() => setSubmitted(false)}>Noch etwas melden</Button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                        <Mail size={18} className="text-brand-600" /> Support-Kontakt
                                    </h3>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Ihr Name</label>
                                        <input required type="text" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="Max Muster" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">E-Mail</label>
                                        <input required type="email" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm" placeholder="kontakt@firma.ch" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-1">Dringendes Anliegen</label>
                                        <textarea required className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm h-24" placeholder="Wie können wir helfen?" />
                                    </div>
                                    <Button className="w-full" icon={<Send size={16}/>}>Senden</Button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 8s linear infinite;
                }
            `}</style>
        </div>
    );
};
