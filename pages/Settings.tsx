import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Server, FileText, Lock, Download, Palette, Type, Image, Sparkles } from 'lucide-react';
import { useBranding } from '../contexts/BrandingContext';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { UserRole } from '../types';

export const Settings: React.FC = () => {
  const { branding, updateBranding, tenant } = useBranding();
  const { role } = useAuth();
  const { isAIEnabled, toggleAI } = useSecurity();

  const isBrokerAdmin = role === UserRole.BROKER_ADMIN;

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Einstellungen</h1>
      
      <div className="max-w-3xl space-y-6">

        {/* White Labeling Settings (Only for Broker Admins) */}
        {isBrokerAdmin && tenant && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm border-l-4 border-l-brand-500">
                <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <Palette className="text-brand-600" />
                            White Labeling & Branding
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Passen Sie das Erscheinungsbild für Ihre Mitarbeiter und Kunden an.
                        </p>
                     </div>
                     <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 font-mono">
                        {tenant.plan}
                     </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full" style={{backgroundColor: branding.primaryColor}}></div>
                            Primärfarbe (Hex)
                        </label>
                        <div className="flex gap-2">
                             <input 
                                type="color" 
                                value={branding.primaryColor}
                                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                                className="h-10 w-10 p-0 border-0 rounded cursor-pointer"
                            />
                            <input 
                                type="text" 
                                value={branding.primaryColor}
                                onChange={(e) => updateBranding({ primaryColor: e.target.value })}
                                className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono"
                            />
                        </div>
                        <p className="text-xs text-slate-500">Beeinflusst Buttons, Links und Charts.</p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <Type size={16} />
                            Firmenname (Logo Text)
                        </label>
                        <input 
                            type="text" 
                            value={branding.logoText}
                            onChange={(e) => updateBranding({ logoText: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
                        />
                         <p className="text-xs text-slate-500">Erscheint oben links in der Navigation.</p>
                    </div>
                </div>
            </div>
        )}
        
        {/* Compliance Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" />
                Compliance & Datenschutz
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Server size={18} className="text-brand-600" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Data Residency</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Ihre Daten werden ausschliesslich in ISO-27001 zertifizierten Rechenzentren in der Schweiz gespeichert.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 w-fit">
                        <div className="w-4 h-4 bg-red-600 rounded-sm flex items-center justify-center text-white text-[10px]">+</div>
                        Region: Zürich (CH-ZH-1)
                    </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                        <Lock size={18} className="text-brand-600" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">Verschlüsselung</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Datenübertragung via TLS 1.3. Ruhende Daten (At-Rest) sind AES-256 verschlüsselt.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium">
                        <ShieldCheck size={14} />
                        Status: Aktiv
                    </div>
                </div>
            </div>

            {/* AI Settings Section - Specifically for Clients */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                            <Sparkles size={16} className="text-purple-500" />
                            KI-Assistenzsysteme
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                            Erlauben Sie die automatisierte Analyse Ihrer Policen zur Erstellung von Zusammenfassungen. 
                            Daten werden nur temporär zur Verarbeitung an das LLM gesendet.
                        </p>
                    </div>
                    <div 
                        onClick={toggleAI}
                        className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer shrink-0 ml-4 ${isAIEnabled ? 'bg-purple-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${isAIEnabled ? 'left-6' : 'left-1'}`} />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Dokumente für Ihre Compliance-Akten:</p>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm" icon={<FileText size={14}/>}>
                        Auftragsdatenverarbeitung (AVV)
                    </Button>
                    <Button variant="outline" size="sm" icon={<Download size={14}/>}>
                        Datenschutzbestimmungen (PDF)
                    </Button>
                </div>
            </div>
        </div>

        <Card title="Profil Einstellungen">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl font-bold text-slate-500">MM</div>
                    <div>
                        <Button variant="outline" size="sm">Bild ändern</Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Vorname</label>
                        <input type="text" defaultValue="Max" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Nachname</label>
                        <input type="text" defaultValue="Muster" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                    </div>
                     <div className="space-y-1 col-span-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                        <input type="email" defaultValue="max.muster@swissbroker.ch" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg" />
                    </div>
                </div>
                <div className="pt-2">
                    <Button>Speichern</Button>
                </div>
            </div>
        </Card>

        <Card title="Benachrichtigungen">
            <div className="space-y-4">
                <ToggleRow label="Neue Policen-Dokumente" description="Benachrichtigung wenn Klienten Dokumente hochladen." active />
                <ToggleRow label="Fristen-Alarm" description="Erinnerung 30 Tage vor Ablauf von Kündigungsfristen." active />
                <ToggleRow label="Wöchentlicher Report" description="Zusammenfassung der Aktivitäten per Email." active={false} />
            </div>
        </Card>
      </div>
    </Layout>
  );
};

const ToggleRow = ({ label, description, active }: { label: string, description: string, active: boolean }) => (
    <div className="flex items-center justify-between py-2">
        <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">{label}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className={`w-11 h-6 rounded-full relative transition-colors cursor-pointer ${active ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${active ? 'left-6' : 'left-1'}`} />
        </div>
    </div>
);