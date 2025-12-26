
import React, { useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
// Fix: Imported Modal component
import { Modal } from '../components/ui/Modal';
import { MOCK_TEAMS, MOCK_USERS } from '../constants';
import { UserRole, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { 
    ArrowLeft, 
    Users, 
    UserPlus, 
    Crown, 
    MoreVertical, 
    Trash2, 
    Search,
    Shield,
    Clock,
    TrendingUp,
    ChevronRight,
    X,
    // Fix: Imported Plus icon
    Plus
} from 'lucide-react';

export const TeamDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { role } = useAuth();
    const navigate = useNavigate();

    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Access Control
    if (role !== UserRole.BROKER_ADMIN && role !== UserRole.BROKER_ADMINISTRATION) {
        return <Navigate to="/dashboard" />;
    }

    const team = MOCK_TEAMS.find(t => t.id === id);
    if (!team) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-96">
                    <p className="text-slate-500 mb-4">Team nicht gefunden</p>
                    <Button onClick={() => navigate('/team')}>Zurück zur Übersicht</Button>
                </div>
            </Layout>
        );
    }

    const members = MOCK_USERS.filter(u => u.teamId === team.id);
    const leader = MOCK_USERS.find(u => u.id === team.leaderId);
    
    // Employees who could be added (not in this team)
    const candidates = MOCK_USERS.filter(u => 
        u.teamId !== team.id && 
        (u.role === UserRole.BROKER_AGENT || u.role === UserRole.BROKER_ADMINISTRATION || u.role === UserRole.BROKER_MARKETING)
    ).filter(u => `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleRemoveFromTeam = (userId: string) => {
        console.log("Removing user from team:", userId);
        // In real app: hit API
    };

    const handleAddToTeam = (userId: string) => {
        console.log("Adding user to team:", userId);
        // In real app: hit API
    };

    return (
        <Layout>
            {/* Header */}
            <div className="mb-8">
                <Link to="/team" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Zurück zur Team-Übersicht
                </Link>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-800">
                            <Users size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{team.name}</h1>
                            <p className="text-slate-500 dark:text-slate-400">{team.description || 'Abteilung im Maklerbüro'}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" icon={<UserPlus size={18}/>} onClick={() => setIsAddMemberModalOpen(true)}>Mitglieder hinzufügen</Button>
                        <Button variant="danger" icon={<Trash2 size={18}/>}>Team auflösen</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Main: Members List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Team-Mitglieder" noPadding>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {members.map(member => {
                                const isLeader = member.id === team.leaderId;
                                return (
                                    <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <img 
                                                    src={member.avatarUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}`} 
                                                    className="w-12 h-12 rounded-full object-cover bg-slate-200" 
                                                    alt="" 
                                                />
                                                {isLeader && (
                                                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-1 rounded-full border-2 border-white dark:border-slate-900" title="Teamleiter">
                                                        <Crown size={10} fill="currentColor" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-slate-900 dark:text-slate-100">{member.firstName} {member.lastName}</p>
                                                    {isLeader && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-black uppercase tracking-wider">Lead</span>}
                                                </div>
                                                <p className="text-xs text-slate-500">{member.position || member.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden sm:block text-right">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Status</p>
                                                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div> Aktiv
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Link to={`/team/member/${member.id}`}>
                                                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-brand-600">Details</Button>
                                                </Link>
                                                <button 
                                                    onClick={() => handleRemoveFromTeam(member.id)}
                                                    className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Aus Team entfernen"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {members.length === 0 && (
                                <div className="p-12 text-center text-slate-500">
                                    <Users size={40} className="mx-auto mb-3 opacity-20" />
                                    <p>Dieses Team hat noch keine Mitglieder.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar: Context & Actions */}
                <div className="space-y-6">
                    <Card title="Team Insights">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">142h</p>
                                    <p className="text-xs text-slate-500">Gesamtstunden (aktuelle Woche)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">CHF 12k</p>
                                    <p className="text-xs text-slate-500">Provisionen (Szenario Prognose)</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card title="Teamleitung">
                        {leader ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <img src={leader.avatarUrl} className="w-10 h-10 rounded-full" alt="" />
                                    <div>
                                        <p className="font-bold text-sm">{leader.firstName} {leader.lastName}</p>
                                        <p className="text-xs text-slate-500">Verantwortlich für das Team</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full">Leiter ändern</Button>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs text-slate-500 mb-3 italic">Kein Teamleiter festgelegt.</p>
                                <Button size="sm" variant="outline">Zuweisen</Button>
                            </div>
                        )}
                    </Card>

                    <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2 flex items-center gap-2">
                                <Shield size={16} className="text-brand-400" /> Compliance
                            </h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                Team-Mitglieder haben standardmässig nur Zugriff auf Kundenakten, die diesem Team zugewiesen sind (Shared Team Box).
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            <Modal
                isOpen={isAddMemberModalOpen}
                onClose={() => setIsAddMemberModalOpen(false)}
                title="Mitarbeiter zum Team hinzufügen"
                maxWidth="max-w-md"
            >
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Mitarbeiter suchen..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2 pr-2">
                        {candidates.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-brand-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatarUrl} className="w-8 h-8 rounded-full" alt="" />
                                    <div>
                                        <p className="text-sm font-bold">{user.firstName} {user.lastName}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-tighter">{user.position || user.role}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="ghost" className="text-brand-600" onClick={() => handleAddToTeam(user.id)}>
                                    <Plus size={16} />
                                </Button>
                            </div>
                        ))}
                        {candidates.length === 0 && (
                            <p className="text-center py-8 text-sm text-slate-500 italic">Keine passenden Mitarbeiter gefunden.</p>
                        )}
                    </div>
                    
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button variant="ghost" className="w-full" onClick={() => setIsAddMemberModalOpen(false)}>Fertig</Button>
                    </div>
                </div>
            </Modal>
        </Layout>
    );
};
