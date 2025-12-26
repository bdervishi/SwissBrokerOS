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
  PhoneCall
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
  const [showMobileRoleSwitcher, setShowMobileRoleSwitcher] = useState(false);
  const [showLangSwitcher, setShowLangSwitcher] = useState(false);
  
  // Theme State
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme
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

  // Define Navigation Items based on Role
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

        // Add Lead Radar for Acquisition, Sales and Super Admin
        if (role !== UserRole.SAAS_FINANCE) {
            saasItems.push({ name: 'Broker Radar', path: '/leads', icon: <Target size={20} /> });
            saasItems.push({ name: 'Call Agent', path: '/saas/call-agent', icon: <PhoneCall size={20} /> });
        }

        saasItems.push(
            { name: t('nav.plans'), path: '/plans', icon: <Package size={20} /> },
            { name: 'Tax Config', path: '/saas/tax-config', icon: <Calculator size={20} /> },
            { name: 'Email Config', path: '/saas/email-config', icon: <Mail size={20} /> },
            { name: 'Daten Import', path: '/import', icon: <Database size={20} /> }, // SaaS Import
            { name: t('nav.revenue'), path: '/commissions', icon: <Wallet size={20} /> },
            { name: t('nav.analytics'), path: '/analytics', icon: <PieChart size={20} /> },
            { name: t('nav.languages'), path: '/saas/languages', icon: <Globe size={20} /> },
            { name: t('nav.settings'), path: '/settings', icon: <Settings size={20} /> }
        );
        return saasItems;
    }

    // Default Broker View
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

    // Only Admins see Team/HR
    if (role === UserRole.BROKER_ADMIN || role === UserRole.BROKER_ADMINISTRATION) {
        brokerItems.push({ name: 'Team & HR', path: '/team', icon: <Briefcase size={20} /> });
    }

    // Only Broker Owner (Admin) sees AI Studio & Data Import
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
    setShowMobileRoleSwitcher(false);
    setSidebarOpen(false);
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
              label = 'Agent / Vermittler';
              color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
              break;
          case UserRole.SAAS_SUPER_ADMIN:
              label = t('role.saas');
              color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
              break;
          case UserRole.SAAS_FINANCE:
              label = 'SaaS Finance';
              color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
              break;
          case UserRole.SAAS_ACQUISITION:
              label = 'SaaS Hunter';
              color = 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
              break;
          case UserRole.BROKER_MARKETING:
              label = 'Marketing';
              break;
          case UserRole.BROKER_ADMINISTRATION:
              label = 'Backoffice';
              break;
          default:
             if (role?.includes('SAAS')) {
                 label = 'SaaS';
                 color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
             }
      }

      return (
          <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${color}`}>
              {label}
          </span>
      );
  };

  const getCurrentLangLabel = () => {
      const current = availableLanguages.find(l => l.code === language);
      return current ? current.label : language;
  }

  // --- Branding Logo Component ---
  const BrandLogo = () => (
      <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
        {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
                <Globe size={18} />
            </div>
        )}
        <span>{branding.logoText || 'SwissBroker'}</span>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-300">
      
      {/* IMPERSONATION BANNER */}
      {isImpersonating && (
          <div className="bg-orange-600 text-white px-4 py-2 flex items-center justify-between text-sm font-medium z-50 sticky top-0 shadow-md">
              <div className="flex items-center gap-2">
                  <Play size={16} fill="currentColor" />
                  <span>DEMO MODE: Viewing as {user?.firstName} {user?.lastName} ({user?.organizationName})</span>
              </div>
              <button 
                onClick={stopImpersonation}
                className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-bold hover:bg-orange-50 transition-colors flex items-center gap-1"
              >
                  <XCircle size={14} /> Beenden
              </button>
          </div>
      )}

      <div className="flex flex-1">
      {/* Sidebar Desktop */}
      <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-30 transition-colors duration-300 ${isImpersonating ? 'top-[40px]' : 'top-0'}`} style={{height: isImpersonating ? 'calc(100% - 40px)' : '100%'}}>
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            
            {/* Language Switcher */}
            <div className="relative">
                <button 
                    onClick={() => setShowLangSwitcher(!showLangSwitcher)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                     <div className="flex items-center gap-3">
                        <Languages size={18} />
                        <span>{getCurrentLangLabel()}</span>
                    </div>
                    <span className="uppercase text-xs font-bold text-slate-400">{language}</span>
                </button>
                {showLangSwitcher && (
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 max-h-48 overflow-y-auto">
                        {availableLanguages.map(l => (
                            <button 
                                key={l.code}
                                onClick={() => { setLanguage(l.code); setShowLangSwitcher(false); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${
                                    language === l.code 
                                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300 font-bold' 
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                            >
                                <span>{l.label}</span>
                                <span className="uppercase text-xs text-slate-400 font-mono">{l.code}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Privacy Toggle */}
            <button 
                onClick={togglePrivacyMode}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isPrivacyMode ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
                <div className="flex items-center gap-3">
                    {isPrivacyMode ? <EyeOff size={18} /> : <Eye size={18} />}
                    <span>{t('ui.privacy_mode')}</span>
                </div>
                {isPrivacyMode && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>}
            </button>

            {/* Theme Toggle */}
            <button 
                onClick={toggleTheme}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
                <div className="flex items-center gap-3">
                    {isDark ? <Moon size={18} /> : <Sun size={18} />}
                    <span>{isDark ? t('ui.dark_mode') : t('ui.light_mode')}</span>
                </div>
                <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative">
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${isDark ? 'left-4.5' : 'left-0.5'}`} style={{ left: isDark ? '18px' : '2px' }} />
                </div>
            </button>

            {/* Role Switcher (Desktop) - Disabled during Impersonation */}
            {!isImpersonating && (
                <div className="relative">
                    <button 
                        onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <UserCheck size={18} />
                        <span>{t('ui.switch_role')}</span>
                    </button>
                    
                    {showRoleSwitcher && (
                        <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 max-h-80 overflow-y-auto">
                            <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase">{t('role.broker')}</div>
                            <button onClick={() => handleRoleSwitch(UserRole.BROKER_ADMIN)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Admin (Inhaber)</button>
                            <button onClick={() => handleRoleSwitch(UserRole.BROKER_AGENT)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Vermittler (Agent)</button>
                            <button onClick={() => handleRoleSwitch(UserRole.BROKER_ADMINISTRATION)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Administration</button>
                            
                            <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                            <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase">{t('role.client')}</div>
                            <button onClick={() => handleRoleSwitch(UserRole.CLIENT)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">Client</button>

                            <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                            <div className="text-xs font-bold text-slate-400 px-2 py-1 uppercase">{t('role.saas')}</div>
                            <button onClick={() => handleRoleSwitch(UserRole.SAAS_SUPER_ADMIN)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">SaaS Admin</button>
                            <button onClick={() => handleRoleSwitch(UserRole.SAAS_FINANCE)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">SaaS Finanzen</button>
                            <button onClick={() => handleRoleSwitch(UserRole.SAAS_ACQUISITION)} className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300">SaaS Acquisition</button>
                        </div>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 px-3 py-2">
                <img src={user?.avatarUrl || "https://ui-avatars.com/api/?name=User"} alt="" className="w-9 h-9 rounded-full bg-slate-200" />
                <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user?.firstName} {user?.lastName}</p>
                    <RoleBadge />
                </div>
                {!isImpersonating && (
                    <button onClick={() => { logout(); navigate('/'); }} className="text-slate-400 hover:text-red-500 transition-colors">
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className={`md:hidden fixed w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-30 px-4 h-16 flex items-center justify-between ${isImpersonating ? 'top-[40px]' : 'top-0'}`}>
         <div className="flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
            <BrandLogo />
         </div>
         <div className="flex items-center gap-3">
             <button onClick={togglePrivacyMode} className={isPrivacyMode ? "text-amber-500" : "text-slate-500"}>
                 {isPrivacyMode ? <EyeOff size={22} /> : <Eye size={22} />}
             </button>
             <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300">
                 <Menu size={24} />
             </button>
         </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
           <div className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-slate-900 p-4 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{t('nav.dashboard')}</h3>
                  <button onClick={() => setSidebarOpen(false)}><X size={24} /></button>
              </div>
              <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-6 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <img src={user?.avatarUrl} alt="" className="w-10 h-10 rounded-full" />
                      <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{user?.firstName}</p>
                          <RoleBadge />
                      </div>
                  </div>

                  {/* Mobile Role Switcher */}
                  <button 
                        onClick={() => setShowMobileRoleSwitcher(!showMobileRoleSwitcher)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                        <div className="flex items-center gap-2"><UserCheck size={16}/> Rolle wechseln</div>
                        <span className="text-xs text-slate-400">▼</span>
                  </button>
                  {showMobileRoleSwitcher && (
                      <div className="pl-4 space-y-2 border-l-2 border-slate-100 dark:border-slate-800">
                          <button onClick={() => handleRoleSwitch(UserRole.BROKER_ADMIN)} className="block text-sm text-slate-600 dark:text-slate-400">Broker Admin</button>
                          <button onClick={() => handleRoleSwitch(UserRole.CLIENT)} className="block text-sm text-slate-600 dark:text-slate-400">Client</button>
                          <button onClick={() => handleRoleSwitch(UserRole.SAAS_SUPER_ADMIN)} className="block text-sm text-slate-600 dark:text-slate-400">SaaS Admin</button>
                      </div>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

                  <nav className="space-y-2">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium ${
                            location.pathname === item.path
                              ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/20 dark:text-brand-300'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.icon}
                          {item.name}
                        </Link>
                      ))}
                  </nav>

                  <div className="border-t border-slate-100 dark:border-slate-800 my-4 pt-4">
                      <button onClick={toggleTheme} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 w-full">
                          {isDark ? <Sun size={20}/> : <Moon size={20}/>}
                          {isDark ? 'Light Mode' : 'Dark Mode'}
                      </button>
                      <button onClick={logout} className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 w-full mt-2">
                          <LogOut size={20} />
                          {t('ui.logout')}
                      </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 p-4 md:p-8 pt-20 md:ml-64 ${isImpersonating ? 'mt-[40px]' : ''}`}>
        {children}
      </main>
      </div>
    </div>
  );
};