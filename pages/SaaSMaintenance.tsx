
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSecurity } from '../contexts/SecurityContext';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate } from 'react-router-dom';
import { 
    AlertTriangle, 
    Settings, 
    Power, 
    MessageSquare, 
    Eye, 
    Clock, 
    ShieldAlert,
    RefreshCw,
    Save
} from 'lucide-react';
import { MaintenanceView } from '../components/MaintenanceView';

export const SaaSMaintenance: React.FC = () => {
    const { role } = useAuth();
    const { isMaintenanceMode, toggleMaintenance, maintenanceMessage, setMaintenanceMessage } = useSecurity();
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [localMessage, setLocalMessage] = useState(maintenanceMessage);
    const [isSaving, setIsSaving] = useState(false);

    if (role !== UserRole.SAAS_SUPER_ADMIN) {
        return <Navigate to="/dashboard" />;
    }

    const handleSaveMessage = () => {
        setIsSaving(true);
        setMaintenanceMessage(localMessage);
        setTimeout(() => setIsSaving(false), 800);
    };

    const handleToggle = () => {
        const newState = !isMaintenanceMode;
        if (newState) {
            const confirmed = window.confirm("ACHTUNG: Dies wird das System für ALLE Makler und Klienten sperren. Nur SaaS-Administratoren behalten Zugriff. Fortfahren?");
            if (confirmed) toggleMaintenance(true);
        } else {
            toggleMaintenance(false);
        }
    };

    return (
        <Layout>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="text-red-600" />
                    System Wartung
                </h1>
                <p className="text-slate-500 dark:text-slate-400">Verwalten Sie den globalen Maintenance-Status der Plattform.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Control */}
                <div className="lg:col-span-2 space-y-6">
                    <div className={`p-8 rounded-2xl border-2 transition-all ${isMaintenanceMode ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30' : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30'}`}>
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isMaintenanceMode ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'}`}>
                                    <Power size={32} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        Status: {isMaintenanceMode ? 'Wartungsmodus Aktiv' : 'System Online'}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        {isMaintenanceMode 
                                            ? 'Die Plattform ist aktuell für Endnutzer gesperrt.' 
                                            : 'Alle Dienste laufen normal. Makler und Klienten haben Zugriff.'}
                                    </p>
                                </div>
                            </div>
                            <Button 
                                variant={isMaintenanceMode ? 'primary' : 'danger'} 
                                size="lg" 
                                className="px-10 py-6 text-lg font-black"
                                onClick={handleToggle}
                            >
                                {isMaintenanceMode ? 'System Live schalten' : 'Wartung aktivieren'}
                            </Button>
                        </div>
                    </div>

                    <Card title="Maintenance Nachricht anpassen">
                        <div className="space-y-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg flex gap-3 text-sm">
                                <MessageSquare size={20} className="shrink-0" />
                                <p>Diese Nachricht wird allen Nutzern auf der Sperrseite angezeigt.</p>
                            </div>
                            <textarea 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm h-32 focus:ring-2 focus:ring-brand-500 outline-none"
                                value={localMessage}
                                onChange={(e) => setLocalMessage(e.target.value)}
                                placeholder="Erläutern Sie den Grund der Wartung..."
                            />
                            <div className="flex justify-between items-center">
                                <Button variant="outline" icon={<Eye size={18}/>} onClick={() => setIsPreviewOpen(true)}>Vorschau</Button>
                                <Button 
                                    onClick={handleSaveMessage} 
                                    disabled={isSaving || localMessage === maintenanceMessage}
                                    icon={isSaving ? <RefreshCw className="animate-spin" /> : <Save />}
                                >
                                    {isSaving ? 'Speichere...' : 'Nachricht aktualisieren'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card title="Wichtige Hinweise">
                        <div className="space-y-4">
                            <div className="flex gap-3 text-sm">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg h-fit text-slate-500">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="font-bold">Zeitplanung</p>
                                    <p className="text-xs text-slate-500">Es gibt aktuell keine automatische Deaktivierung. Vergessen Sie nicht, den Modus manuell zu beenden.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg h-fit text-slate-500">
                                    <AlertTriangle size={18} />
                                </div>
                                <div>
                                    <p className="font-bold">Ausnahmen</p>
                                    <p className="text-xs text-slate-500">Nur Rollen mit dem Präfix SAAS_* können sich weiterhin einloggen.</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
                         <div className="relative z-10">
                            <h4 className="font-bold mb-2 flex items-center gap-2"><Settings size={18} className="text-brand-400" /> System-Log</h4>
                            <div className="space-y-2 text-[10px] font-mono text-slate-400">
                                <p>[08:45] Admin global logged in</p>
                                <p>[08:42] DB Backup completed (CH-ZH-1)</p>
                                <p>[08:30] Health Check: Success</p>
                            </div>
                         </div>
                         <ShieldAlert className="absolute -right-6 -bottom-6 w-32 h-32 text-white/5" />
                    </div>
                </div>
            </div>

            {/* FULLSCREEN PREVIEW MODAL */}
            {isPreviewOpen && (
                <div className="fixed inset-0 z-[200] overflow-hidden">
                    <div className="absolute top-8 right-8 z-[210]">
                        <Button variant="secondary" onClick={() => setIsPreviewOpen(false)} icon={<XIcon size={18}/>}>Vorschau schliessen</Button>
                    </div>
                    <MaintenanceView />
                </div>
            )}
        </Layout>
    );
};

const XIcon = ({size}: any) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
