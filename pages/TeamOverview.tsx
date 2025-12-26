import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MOCK_USERS, MOCK_TEAMS } from '../constants';
import { UserRole, EmployeeModule } from '../types';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
    Users, 
    Plus, 
    Briefcase,
    Phone,
    Mail,
    ChevronRight,
    Search,
    Shield,
    Home,
    Calculator,
    Landmark
} from 'lucide-react';

export const TeamOverview: React.FC = () => {
    const { role } = useAuth();

    // Access Control
    if (role !== UserRole.BROKER_ADMIN && role !== UserRole.BROKER_ADMINISTRATION) {
        return <Navigate to="/dashboard" />;
    }

    // Filter only broker employees (exclude SaaS admins and Clients)
    const employees = MOCK_USERS.filter(u => 
        u.role === UserRole.BROKER_ADMIN || 
        u.role === UserRole.BROKER_ADMINISTRATION || 
        u.role === UserRole.BROKER_MARKETING || 
        u.role === UserRole.BROKER_AGENT
    );

    const getModuleIcon = (mod: EmployeeModule) => {
        switch(mod) {
            case 'INSURANCE': return <Shield size={12} />;
            case 'MORTGAGE': return <Home size={12} />;
            case 'TAX': return <Calculator size={12} />;
            case 'PENSION': return <Landmark size={12} />;
        }
    }

    const getModuleLabel = (mod: EmployeeModule) => {
        switch(mod) {
            case 'INSURANCE': return 'Versicherungen';
            case 'MORTGAGE': return 'Hypotheken';
            case 'TAX': return 'Steuern';
            case 'PENSION': return 'Vorsorge';
        }
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Users className="text-brand-600" /> 
                        Team & HR
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Verwalten Sie Mitarbeiter, Abteilungen und Zugriffsrechte.
                    </p>
                </div>
                <Button icon={<Plus size={18} />}>Mitarbeiter einladen</Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left: Organization Structure (Teams) */}
                <div className="space-y-6">
                    <Card title="Abteilungen / Teams">
                        <div className="space-y-4">
                            {MOCK_TEAMS.map(team => {
                                const teamMembers = employees.filter(e => e.teamId === team.id);
                                return (
                                    <div key={team.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                                        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{team.name}</h3>
                                        <p className="text-xs text-slate-500 mb-3">{teamMembers.length} Mitglieder</p>
                                        
                                        <div className="flex -space-x-2 overflow-hidden mb-3">
                                            {teamMembers.map(m => (
                                                <img 
                                                    key={m.id} 
                                                    src={m.avatarUrl || `https://ui-avatars.com/api/?name=${m.firstName}+${m.lastName}`} 
                                                    alt={m.firstName}
                                                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900"
                                                    title={`${m.firstName} ${m.lastName}`}
                                                />
                                            ))}
                                        </div>
                                        <Button size="sm" variant="outline" className="w-full text-xs">Team verwalten</Button>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>

                {/* Right: Employee List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex gap-4 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Mitarbeiter suchen..." 
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <Button variant="outline">Filter</Button>
                    </div>

                    <Card noPadding>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {employees.map(employee => (
                                <div key={employee.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group gap-4">
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={employee.avatarUrl || `https://ui-avatars.com/api/?name=${employee.firstName}+${employee.lastName}`} 
                                            alt="" 
                                            className="w-12 h-12 rounded-full object-cover bg-slate-200" 
                                        />
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100">{employee.firstName} {employee.lastName}</h4>
                                            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                                                <Briefcase size={12} />
                                                <span>{employee.position || 'Mitarbeiter'}</span>
                                            </div>
                                            {/* Modules Badges */}
                                            <div className="flex flex-wrap gap-1">
                                                {employee.modules?.map(mod => (
                                                    <span key={mod} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                        {getModuleIcon(mod)} {getModuleLabel(mod)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 ml-16 md:ml-0">
                                        <div className="hidden lg:block text-sm text-slate-500">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Mail size={14} />
                                                {employee.email}
                                            </div>
                                            {employee.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={14} />
                                                    {employee.phone}
                                                </div>
                                            )}
                                        </div>

                                        <Link to={`/team/member/${employee.id}`}>
                                            <Button size="sm" variant="ghost" className="text-slate-400 group-hover:text-brand-600">
                                                Details <ChevronRight size={16} />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};