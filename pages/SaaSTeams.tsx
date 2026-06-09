
import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
    Users2, 
    Plus, 
    Trash2, 
    Settings, 
    UserPlus, 
    MoreVertical, 
    Search,
    ShieldCheck,
    Cpu,
    Target,
    Coins,
    ChevronRight,
    UserCircle,
    Zap,
    Briefcase
} from 'lucide-react';
import { useProfiles } from '../src/hooks/useData';

// Mock Internal SaaS Teams
const INITIAL_SAAS_TEAMS = [
    { id: 'saas_team_dev', name: 'Core Engineering', description: 'Plattform-Entwicklung & AI-Integration', memberCount: 12, icon: <Cpu className="text-blue-500" /> },
    { id: 'saas_team_sales', name: 'Global Sales', description: 'Makler-Akquise & Partnerschaften', memberCount: 8, icon: <Target className="text-emerald-500" /> },
    { id: 'saas_team_finance', name: 'Finance & Operations', description: 'Billing, MRR & Embedded Finance Ops', memberCount: 4, icon: <Coins className="text-amber-500" /> },
    { id: 'saas_team_support', name: 'Customer Success', description: 'L2 Support & Onboarding Assistance', memberCount: 6, icon: <UserPlus className="text-purple-500" /> },
];

export const SaaSTeams: React.FC = () => {
    const { role } = useAuth();
    const { data: users } = useProfiles();
    const navigate = useNavigate();
    const [teams, setTeams] = useState(INITIAL_SAAS_TEAMS);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<typeof INITIAL_SAAS_TEAMS[0] | null>(null);
    
    // Form States
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');

    if (role !== UserRole.SAAS_SUPER_ADMIN && role !== UserRole.SAAS_FINANCE && role !== UserRole.SAAS_SALES) {
        return <Navigate to="/dashboard" />;
    }

    const saasUsers = users.filter(u => u.role.startsWith('SAAS_'));

    const handleDelete = (id: string) => {
        if(window.confirm("Sind Sie sicher, dass Sie dieses Team löschen möchten?")) {
            setTeams(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleCreateTeam = () => {
        if (!newTeamName.trim()) return;
        
        const newTeam = {
            id: `saas_team_${Date.now()}`,
            name: newTeamName,
            description: newTeamDesc,
            memberCount: 0,
            icon: <Briefcase className="text-slate-500" />
        };
        
        setTeams([...teams, newTeam]);
        setNewTeamName('');
        setNewTeamDesc('');
        setIsCreateModalOpen(false);
    };

    const handleOpenEdit = (team: typeof INITIAL_SAAS_TEAMS[0]) => {
        setSelectedTeam(team);
        setIsEditModalOpen(true);
    }

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users2 className="text-brand-600" />
                        SaaS Team Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Verwalten Sie interne Abteilungen der SwissBroker OS Organisation.</p>
                </div>
                <Button icon={<Plus size={18}/>} onClick={() => setIsCreateModalOpen(true)}>Neues Team erstellen</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* MAIN LIST */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {teams.map(team => (
                            <div key={team.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                                        {team.icon}
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleOpenEdit(team)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                            <Settings size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(team.id)} className="p-2 text-slate-400 hover:text-red-500">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">{team.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2">{team.description}</p>
                                
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex -space-x-2">
                                        {[...Array(Math.min(4, team.memberCount))].map((_, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                                {i === 3 ? `+${team.memberCount - 3}` : <UserCircle size={14} />}
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-xs group-hover:text-brand-600" onClick={() => handleOpenEdit(team)}>Team-Details <ChevronRight size={14} /></Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Card title="SaaS Mitarbeiter (Global)" noPadding>
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    type="text" 
                                    placeholder="Interne Mitarbeiter suchen..." 
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {saasUsers.filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                <div 
                                    key={user.id} 
                                    onClick={() => navigate(`/team/member/${user.id}`)}
                                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3">
                                        <img src={user.avatarUrl} className="w-10 h-10 rounded-full bg-slate-200 object-cover" alt="" />
                                        <div>
                                            <p className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-brand-600 transition-colors">{user.firstName} {user.lastName}</p>
                                            <p className="text-xs text-slate-500">{user.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-[10px] px-2 py-1 rounded bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 font-black uppercase">Core Admin</span>
                                        <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* SIDEBAR */}
                <div className="space-y-6">
                    <Card title="Berechtigungs-Matrix">
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500 leading-relaxed italic">
                                SaaS Teams definieren den Zugriff auf Support-Tickets, Tenant-Daten (Read-only) und globale Finanz-Parameter.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <ShieldCheck className="text-emerald-500" size={18} />
                                    <div>
                                        <p className="text-sm font-bold">Impersonation Power</p>
                                        <p className="text-[10px] text-slate-500">Nur Super-Admin & Customer Success</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                    <Coins className="text-amber-500" size={18} />
                                    <div>
                                        <p className="text-sm font-bold">Revenue Insights</p>
                                        <p className="text-[10px] text-slate-500">Global Finance & Super-Admin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-xl">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <Zap className="text-yellow-400" size={18} fill="currentColor" />
                                Onboarding Tipp
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">
                                Neue SaaS-Mitarbeiter sollten immer einem Team zugewiesen werden, um automatische Benachrichtigungen für ihren Fachbereich zu erhalten.
                            </p>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4">
                            <Users2 size={120} />
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE TEAM MODAL */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Neues SaaS Team erstellen"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Team Name</label>
                        <input 
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                            placeholder="z.B. Marketing & Growth"
                            value={newTeamName}
                            onChange={e => setNewTeamName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-slate-400 mb-1 block">Beschreibung</label>
                        <textarea 
                            className="w-full p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm h-24"
                            placeholder="Aufgabenbereich..."
                            value={newTeamDesc}
                            onChange={e => setNewTeamDesc(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleCreateTeam} disabled={!newTeamName}>Erstellen</Button>
                    </div>
                </div>
            </Modal>

            {/* DETAILS / EDIT MODAL */}
            {selectedTeam && (
                <Modal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    title={`Team verwalten: ${selectedTeam.name}`}
                    maxWidth="max-w-lg"
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-600 dark:text-slate-300">
                                {selectedTeam.icon}
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-slate-100">{selectedTeam.name}</h3>
                                <p className="text-sm text-slate-500">{selectedTeam.description}</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">Mitglieder (Mock)</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {[...Array(selectedTeam.memberCount)].map((_, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {String.fromCharCode(65 + i)}
                                            </div>
                                            <div className="text-sm font-medium">SaaS User {i + 1}</div>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-xs">Entfernen</Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>Schliessen</Button>
                            <Button>Mitglied hinzufügen</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </Layout>
    );
};
