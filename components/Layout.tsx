
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSecurity } from '../contexts/SecurityContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBranding } from '../contexts/BrandingContext';
import { CommandPalette } from './ui/CommandPalette'; // NEW Import
import { NotificationBell } from './NotificationBell';
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
  Crosshair,
  CreditCard,
  Zap,
  Coins,
  Users2,
  FileText,
  Monitor,
  ShoppingBag,
  Rocket,
  Power,
  User,
  Linkedin,
  Search // Added Search Icon
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false); // NEW State for Command Palette
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, switchRole, logout, isImpersonating, stopImpersonation } = useAuth();
  const { t } = useLanguage();
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

  // --- NEW: Keyboard Listener for Ctrl+K ---
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
              e.preventDefault();
              setSearchOpen(prev => !prev);
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
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

  const getNavSections = (): NavSection[] => {
    // --- CLIENT VIEW ---
    if (role === UserRole.CLIENT) {
        return [{
            items: [
                { name: t('nav.dashboard'), path: '/dashboard', icon: <LayoutDashboard size={20} /> },
                { name: t('nav.my_policies'), path: '/policies', icon: <ShieldAlert size={20} /> },
                { name: t('nav.mortgages'), path: '/mortgages', icon: <Home size={20} /> },
                { name: t('nav.settings'), path: '/settings', icon: <Settings size={20} /> },
            ]
        }];
    }

    // --- HUNTER VIEW ---
    if (role === UserRole.SAAS_ACQUISITION) {
        return [
            {
                title: "Overview",
                items: [
                    { name: 'Hunter Dashboard', path: '/dashboard', icon: <Crosshair size={20} /> },
                ]
            },
            {
                title: "Sales Tools",
                items: [
                    { name: 'Lead Radar (B2B)', path: '/leads', icon: <Target size={20} /> },
                    { name: 'Social Selling (LI)', path: '/social-selling', icon: <Linkedin size={20} /> }, // NEW LINK
                    { name: 'Onboarding Links', path: '/saas/demo', icon: <Play size={20} /> },
                ]
            },
            {
                title: "Personal",
                items: [
                    { name: 'Meine Provisionen', path: '/commissions', icon: <Wallet size={20} /> },
                ]
            }
        ];
    }

    // --- SAAS ADMIN VIEW (REORGANIZED) ---
    if (role === UserRole.SAAS_SUPER_ADMIN || role === UserRole.SAAS_FINANCE || role === UserRole.SAAS_SALES) {
        const sections: NavSection[] = [
            {
                title: "Management",
                items: [
                    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
                    { name: 'Demo Hub', path: '/saas/demo', icon: <Play size={20} /> },
                    { name: 'Tenants (Makler)', path: '/clients', icon: <Building size={20} /> },
                    { name: 'SaaS Teams', path: '/saas/teams', icon: <Users2 size={20} /> },
                ]
            }
        ];

        if (role !== UserRole.SAAS_FINANCE) {
            sections.push({
                title: "Growth & Marketing",
                items: [
                    { name: 'Broker Radar', path: '/leads', icon: <Target size={20} /> },
                    { name: 'Social Selling', path: '/social-selling', icon: <Linkedin size={20} /> }, // NEW LINK
                    { name: 'AI Call Agent', path: '/saas/call-agent', icon: <PhoneCall size={20} /> },
                    { name: 'Newsletter', path: '/saas/newsletter', icon: <MailCheck size={20} /> },
                    { name: 'Success Stories', path: '/saas/case-studies', icon: <Rocket size={20} /> }, 
                    { name: 'Testimonials', path: '/saas/testimonials', icon: <MessageSquareQuote size={20} /> },
                    { name: 'CMS / Seiten', path: '/saas/cms', icon: <FileText size={20} /> }, 
                ]
            });
        }

        sections.push({
            title: "Finance Operations",
            items: [
                { name: 'Abrechnungen (MRR)', path: '/commissions', icon: <Wallet size={20} /> },
                { name: 'Embedded Finance', path: '/saas/embedded-finance', icon: <Coins size={20} className="text-emerald-500" /> },
                { name: 'Analytics', path: '/analytics', icon: <PieChart size={20} /> },
            ]
        });

        sections.push({
            title: "Platform Infrastructure",
            items: [
                { name: 'Pakete & Pricing', path: '/plans', icon: <Package size={20} /> },
                { name: 'Tax Engine Config', path: '/saas/tax-config', icon: <Calculator size={20} /> },
                { name: 'Email & AI Config', path: '/saas/email-config', icon: <Mail size={20} /> },
                { name: 'Sprachen & L10n', path: '/saas/languages', icon: <Globe size={20} /> },
                { name: 'Bulk Data Import', path: '/import', icon: <Database size={20} /> },
            ]
        });

        sections.push({
            title: "System",
            items: [
                { name: 'Maintenance', path: '/saas/maintenance', icon: <Power size={20} className="text-red-500" /> },
                { name: 'Global Settings', path: '/settings', icon: <Settings size={20} /> },
            ]
        });

        return sections;
    }

    // --- BROKER VIEW ---
    const brokerSections: NavSection[] = [
        {
            title: "Daily Business",
            items: [
                { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
                { name: 'Posteingang', path: '/inbox', icon: <Mail size={20} /> },
                { name: 'Termine', path: '/calendar', icon: <Calendar size={20} /> },
            ]
        },
        {
            title: "Clients & Assets",
            items: [
                { name: 'Klienten', path: '/clients', icon: <Users size={20} /> },
                { name: 'Versicherungen', path: '/policies', icon: <ShieldAlert size={20} /> },
                { name: 'Hypotheken', path: '/mortgages', icon: <Home size={20} /> },
                { name: 'Kredit & Leasing', path: '/credit', icon: <CreditCard size={20} /> },
                { name: 'Steuern', path: '/tax', icon: <Calculator size={20} /> }, 
            ]
        },
        {
            title: "Growth & Network",
            items: [
                { name: 'Lead Radar', path: '/leads', icon: <Target size={20} /> },
                { name: 'Lead Exchange', path: '/marketplace', icon: <ShoppingBag size={20} className="text-purple-500" /> }, // NEW Marketplace
                { name: 'Partner Hub', path: '/partners', icon: <Handshake size={20} /> },
            ]
        },
        {
            title: "Performance",
            items: [
                { name: 'Provisionen', path: '/commissions', icon: <Wallet size={20} /> },
                { name: 'Analytics', path: '/analytics', icon: <PieChart size={20} /> },
            ]
        }
    ];

    if (role === UserRole.BROKER_ADMIN || role === UserRole.BROKER_ADMINISTRATION) {
        brokerSections.push({
            title: "Organization",
            items: [
                { name: 'Team & HR', path: '/team', icon: <Briefcase size={20} /> },
                { name: 'Webseite & SEO', path: '/web-engine', icon: <Monitor size={20} /> }, 
                { name: 'AI Studio', path: '/broker/ai-config', icon: <BrainCircuit size={20} /> },
                { name: 'Daten Import', path: '/import', icon: <Database size={20} /> },
            ]
        });
    }

    brokerSections.push({
        title: "Settings",
        items: [
            { name: 'Mein Profil & HR', path: '/profile', icon: <User size={20} /> }, // NEW for Agents
            { name: 'Mein Abo', path: '/plans', icon: <Package size={20} /> },
            { name: 'Integrationen', path: '/integrations', icon: <Blocks size={20} /> },
            { name: 'Einstellungen', path: '/settings', icon: <Settings size={20} /> },
        ]
    });

    return brokerSections;
  };

  const navSections = getNavSections();

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole);
    setShowRoleSwitcher(false);
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
              label = 'Vermittler';
              color = 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
              break;
          case UserRole.SAAS_SUPER_ADMIN:
              label = 'SaaS Admin';
              color = 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
              break;
          case UserRole.SAAS_ACQUISITION:
              label = 'Hunter (Sales)';
              color = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
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

  const NavLinks = ({ mobile }: { mobile?: boolean }) => (
      <div className={`flex-1 overflow-y-auto py-6 px-4 space-y-8 ${mobile ? '' : 'flex-1'}`}>
          
          {/* SEARCH BUTTON IN SIDEBAR */}
          <button 
            onClick={() => { setSearchOpen(true); if(mobile) setSidebarOpen(false); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 mb-6"
          >
              <Search size={16} />
              <span>Suche...</span>
              <kbd className="hidden md:inline-flex ml-auto items-center h-5 px-1.5 text-[10px] font-medium text-slate-400 border border-slate-300 dark:border-slate-700 rounded bg-white dark:bg-slate-900">Ctrl K</kbd>
          </button>

          {/* In-app notifications (handovers, lead assignments, …) */}
          {role !== UserRole.CLIENT && (
            <div className="-mt-4 mb-6"><NotificationBell /></div>
          )}

          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
                {section.title && (
                    <div className="px-3 mb-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        {section.title}
                    </div>
                )}
                {section.items.map((item) => (
                    <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => mobile && setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
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
          ))}
      </div>
  );

  const UserMenu = () => (
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2 bg-white dark:bg-slate-900">
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
                        <RoleOption label="SaaS Super Admin" role={UserRole.SAAS_SUPER_ADMIN} currentRole={role} onClick={handleRoleSwitch} />
                        <RoleOption label="Hunter (SaaS Sales)" role={UserRole.SAAS_ACQUISITION} currentRole={role} onClick={handleRoleSwitch} />
                        <RoleOption label="Broker Inhaber" role={UserRole.BROKER_ADMIN} currentRole={role} onClick={handleRoleSwitch} />
                        <RoleOption label="Vermittler (Agent)" role={UserRole.BROKER_AGENT} currentRole={role} onClick={handleRoleSwitch} />
                        <RoleOption label="End-Klient" role={UserRole.CLIENT} currentRole={role} onClick={handleRoleSwitch} />
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
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col transition-colors duration-500">
      
      {/* Command Palette Overlay */}
      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Impersonation Banner */}
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

      {/* Mobile Header */}
      <header className={`md:hidden fixed w-full z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between transition-colors duration-500 ${isImpersonating ? 'top-[40px]' : 'top-0'}`}>
          <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className="text-slate-600 dark:text-slate-300 p-1">
                  <Menu size={24} />
              </button>
              <BrandLogo />
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
                <Search size={20} />
             </button>
             <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-300">
                {isDark ? <Moon size={20} /> : <Sun size={20} />}
             </button>
          </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
           <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-left duration-200">
               <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                  <BrandLogo />
                  <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
                      <X size={24} />
                  </button>
               </div>
               <NavLinks mobile />
               <UserMenu />
           </aside>
        </div>
      )}

      <div className="flex flex-1 pt-16 md:pt-0">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full z-30 transition-colors duration-500 ${isImpersonating ? 'top-[40px]' : 'top-0'}`} style={{height: isImpersonating ? 'calc(100% - 40px)' : '100%'}}>
            <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800">
                <Link to="/dashboard"><BrandLogo /></Link>
            </div>
            <NavLinks />
            <UserMenu />
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-500 p-4 md:p-8 md:ml-64 ${isImpersonating ? 'mt-[40px]' : ''}`}>
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
