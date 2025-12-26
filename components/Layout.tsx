import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useLanguage, LanguageDefinition } from '../contexts/LanguageContext';
import { useBranding } from '../contexts/BrandingContext';
import { UserRole } from '../types';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  ShieldAlert,
  Home,
  Blocks,
  Handshake,
  Calendar,
  Wallet,
  Globe,
  Building,
  UserCheck,
  PieChart,
  Sun,
  Moon,
  Package,
  Eye,
  EyeOff,
  Languages,
  Play,
  XCircle,
  Mail,
  Target,
  Briefcase,
  Calculator,
  BrainCircuit,
  Database,
  PhoneCall,
  MailCheck,
  MessageSquareQuote,
  ChevronUp,
  User as UserIcon
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, switchRole, logout, isImpersonating, stopImpersonation } = useAuth();
  const { isPrivacyMode, togglePrivacyMode } = useSecurity();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { branding } = useBranding();

  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const getNavItems = () => {
    const common = [
        { name: t('nav.dashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    ];

    if (role === UserRole.CLIENT) {
        return [
            ...common,
            { name: t('nav.my_policies'), path: '/policies', icon: <ShieldAlert size={20} /> },
            { name: t('nav.mortgages'), path: '/mortgages', icon: <Home size={20} /> },
            { name: t('nav.settings'), path: '/settings', icon: <Settings size={20} /> },
        ];
    }

    if (role === UserRole.BROKER_AGENT) {
        return [
            ...common,
            { name: 'Lead Radar', path: '/leads', icon: <Target size={20} /> },
            { name: 'Meine Kunden', path: '/clients', icon: <Users size={20} /> },
            { name: 'Meine Deals', path: '/dashboard', icon: <Briefcase size={20} /> },
            { name: 'Termine', path: '/calendar', icon: <Calendar size={20} /> },
        ]
    }

    if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_FINANCE || role === UserRole.SAAS_SALES || role === UserRole.SAAS_ACQUISITION) {
        const saasItems = [
            ...common,
            { name: 'Demo Hub', path: '/saas/demo', icon: <Play size={20} /> },
            { name: t('nav.tenants'), path: '/clients', icon: <Building size={20} /> },
        ];

        if (role !== UserRole.SAAS_FINANCE) {
            saasItems.push({ name: 'Broker Radar', path: '/leads', icon: <Target size={20} /> });
            saasItems.push({ name: 'Call Agent', path: '/saas/call-agent', icon: <PhoneCall size={20} /> });
        }

        saasItems.push(
            { name: 'Newsletter', path: '/saas/newsletter', icon: <MailCheck size={20} /> },
            { name: 'Testimonials', path: '/saas/testimonials', icon: <MessageSquareQuote size={20} /> },
            { name: t('nav.plans'), path: '/plans', icon: <Package size={20} /> },
            { name: 'Tax Config', path: '/saas/tax-config', icon: <Calculator size={20} /> },
            { name: 'Email Config', path: '/saas/email-config', icon: <Mail size={20} /> },
            { name: 'Daten Import', path: '/import', icon: <Database size={20} /> },
            { name: t('nav.revenue'), path: '/commissions', icon: <Wallet size={20} /> },
            { name: t('nav.analytics'), path: '/analytics', icon: <PieChart size={20} /> },
            { name: t('nav.languages'), path: '/saas/languages', icon: <Globe size={20} /> },
            { name: t('nav.settings'), path: '/settings', icon: <Settings size={20} /> }
        );
        return saasItems;
    }

    const brokerItems = [
        ...common,
        { name: 'Posteingang', path: '/inbox', icon: <Mail size={20} /> },
        { name: 'Lead Radar', path: '/leads', icon: <Target size={20} /> },
        { name: t('nav.clients'), path: '/clients', icon: <Users size={20} /> },
        { name: t('nav.policies'), path: '/policies', icon: <ShieldAlert size={20} /> },
        { name: t('nav.mortgages'), path: '/mortgages', icon: <Home size={20} /> },
        { name: 'Steuern', path: '/tax', icon: <Calculator size={20} /> }, 
        { name: t('nav.commissions'), path: '/commissions', icon: <Wallet size={20} /> },
        { name: t('nav.calendar'), path: '/calendar', icon: <Calendar size={20} /> },
        { name: t('nav.partners'), path: '/partners', icon: <Handshake size={20} /> },
        { name: t('nav.analytics'), path: '/analytics', icon: <PieChart size={20} /> },
    ];

    if (role === UserRole.BROKER_ADMIN || role === UserRole.BROKER_ADMINISTRATION) {
        brokerItems.push({ name: 'Team & HR', path: '/team', icon: <Briefcase size={20} /> });
    }

    if (role === UserRole.BROKER_ADMIN) {
        brokerItems.push({ name: 'AI Studio', path: '/broker/ai-config', icon: <BrainCircuit size={20} /> });
        brokerItems.push({ name: 'Daten Import', path: '/import', icon: <Database size={20} /> });
    }

    return [
        ...brokerItems,
        { name: t('nav.plans'), path: '/plans', icon: <Package size={20} /> },
        { name: t('nav.integrations'), path: '/integrations', icon: <Blocks size={20} /> },
        { name: t('nav.settings'), path: '/settings', icon: <Settings size={20} /> },
    ];
  };

  const navItems = getNavItems();

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleSwitcher(false);
    navigate('/dashboard');
  };

  const RoleBadge = () => {
      let label = t('role.broker');
      let color = 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300';
      
      switch (role) {
          case UserRole.CLIENT:
              label = t('role.client');
              color = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
              break;
          case UserRole.BROKER_AGENT:
              label = 'Vermittler';
              color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
              break;
          case UserRole.SAAS_SUPER_ADMIN:
              label = 'SaaS Admin';
              color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
              break;
          default:
             if (role?.includes('SAAS')) {
                 label = 'SaaS';
                 color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
             }
      }

      return (
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${color}`}>
              {label}
          </span>
      );
  };

  const BrandLogo = () => (
      <div className="flex items-center gap-2 font-black text-xl text-slate-900 dark:text-white">
        {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center text-white shadow-sm">
                <div className="font-serif font-bold text-lg">+</div>
            </div>
        )}
        <span>{branding.logoText || 'SwissBroker'}</span>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
      
      {isImpersonating && (
          <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-sm font-black z-50 sticky top-0 shadow-md">
              <div className="flex items-center gap-2">
                  <Play size={16} fill="currentColor" />
                  <span>DEMO MODE: Viewing as {user?.firstName} {user?.lastName} ({user?.organizationName})</span>
              </div>
              <button 
                onClick={stopImpersonation}
                className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-black hover:bg-orange-50 transition-colors flex items-center gap-1"
              >
                  <XCircle size={14} /> Beenden
              </button>
          </div>
      )}

      <div className="flex flex-1">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-30 transition-colors duration-500 ${isImpersonating ? 'top-[40px]' : 'top-0'}`} style={{height: isImpersonating ? 'calc(100% - 40px)' : '100%'}}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
          <Link to="/dashboard">
             <BrandLogo />
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                location.pathname === item.path
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 shadow-sm border border-brand-100 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              <span className={`${location.pathname === item.path ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-transparent"
            >
                <div className="flex items-center gap-3">
                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                    <span>{isDark ? t('ui.dark_mode') : t('ui.light_mode')}</span>
                </div>
            </button>

            {/* Role Switcher Popover Trigger */}
            <div className="relative">
                {showRoleSwitcher && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 p-2 animate-in slide-in-from-bottom-2 duration-200">
                        <div className="text-[10px] font-black text-slate-400 uppercase px-3 py-2 tracking-widest">Entwickler-Rollen</div>
                        <RoleOption 
                            label="SaaS Super Admin" 
                            role={UserRole.SAAS_SUPER_ADMIN} 
                            currentRole={role} 
                            onClick={handleRoleSwitch} 
                        />
                        <RoleOption 
                            label="Broker Inhaber" 
                            role={UserRole.BROKER_ADMIN} 
                            currentRole={role} 
                            onClick={handleRoleSwitch} 
                        />
                        <RoleOption 
                            label="Vermittler (Agent)" 
                            role={UserRole.BROKER_AGENT} 
                            currentRole={role} 
                            onClick={handleRoleSwitch} 
                        />
                        <RoleOption 
                            label="End-Klient" 
                            role={UserRole.CLIENT} 
                            currentRole={role} 
                            onClick={handleRoleSwitch} 
                        />
                    </div>
                )}
                
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 relative group">
                    <img src={user?.avatarUrl || "https://ui-avatars.com/api/?name=User"} alt="" className="w-9 h-9 rounded-full bg-slate-200 object-cover border-2 border-white dark:border-slate-700" />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{user?.firstName} {user?.lastName}</p>
                        <RoleBadge />
                    </div>
                    <div className="flex flex-col gap-1">
                        <button 
                            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                            className="text-slate-400 hover:text-brand-600 transition-colors p-1"
                            title="Rolle wechseln"
                        >
                            <ChevronUp size={16} className={`transition-transform ${showRoleSwitcher ? 'rotate-180' : ''}`} />
                        </button>
                        {!isImpersonating && (
                            <button onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                                <LogOut size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-500 p-4 md:p-8 pt-20 md:ml-64 ${isImpersonating ? 'mt-[40px]' : ''}`}>
        {children}
      </main>
      </div>
    </div>
  );
};

const RoleOption = ({ label, role, currentRole, onClick }: any) => (
    <button 
        onClick={() => onClick(role)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all ${
            currentRole === role 
            ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
        }`}
    >
        {label}
        {currentRole === role && <UserCheck size={14} />}
    </button>
);
