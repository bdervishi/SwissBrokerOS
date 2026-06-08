
import React, { lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
const Landing = lazy(() => import('./pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const ClientDetail = lazy(() => import('./pages/ClientDetail').then(m => ({ default: m.ClientDetail })));
const Clients = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })));
const TenantDetail = lazy(() => import('./pages/TenantDetail').then(m => ({ default: m.TenantDetail })));
const Policies = lazy(() => import('./pages/Policies').then(m => ({ default: m.Policies })));
const PolicyDetail = lazy(() => import('./pages/PolicyDetail').then(m => ({ default: m.PolicyDetail })));
const Analytics = lazy(() => import('./pages/Analytics').then(m => ({ default: m.Analytics })));
const Settings = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Mortgages = lazy(() => import('./pages/Mortgages').then(m => ({ default: m.Mortgages })));
const MortgageDetail = lazy(() => import('./pages/MortgageDetail').then(m => ({ default: m.MortgageDetail })));
const Integrations = lazy(() => import('./pages/Integrations').then(m => ({ default: m.Integrations })));
const PartnerHub = lazy(() => import('./pages/PartnerHub').then(m => ({ default: m.PartnerHub })));
const PartnerDetail = lazy(() => import('./pages/PartnerDetail').then(m => ({ default: m.PartnerDetail })));
const CalendarPage = lazy(() => import('./pages/Calendar').then(m => ({ default: m.CalendarPage })));
const Commissions = lazy(() => import('./pages/Commissions').then(m => ({ default: m.Commissions })));
const Inbox = lazy(() => import('./pages/Inbox').then(m => ({ default: m.Inbox })));
const TaxManagement = lazy(() => import('./pages/TaxManagement').then(m => ({ default: m.TaxManagement })));
const CreditSimulation = lazy(() => import('./pages/CreditSimulation').then(m => ({ default: m.CreditSimulation })));
const LeadMarketplace = lazy(() => import('./pages/LeadMarketplace').then(m => ({ default: m.LeadMarketplace })));
const SaaSPlans = lazy(() => import('./pages/SaaSPlans').then(m => ({ default: m.SaaSPlans })));
const SaaSLanguages = lazy(() => import('./pages/SaaSLanguages').then(m => ({ default: m.SaaSLanguages })));
const SaaSDemo = lazy(() => import('./pages/SaaSDemo').then(m => ({ default: m.SaaSDemo })));
const SaaSPitch = lazy(() => import('./pages/SaaSPitch').then(m => ({ default: m.SaaSPitch })));
const SaaSTaxConfig = lazy(() => import('./pages/SaaSTaxConfig').then(m => ({ default: m.SaaSTaxConfig })));
const SaaSEmailConfig = lazy(() => import('./pages/SaaSEmailConfig').then(m => ({ default: m.SaaSEmailConfig })));
const SaaSNewsletter = lazy(() => import('./pages/SaaSNewsletter').then(m => ({ default: m.SaaSNewsletter })));
const SaaSTestimonials = lazy(() => import('./pages/SaaSTestimonials').then(m => ({ default: m.SaaSTestimonials })));
const SaaSEmbeddedFinance = lazy(() => import('./pages/SaaSEmbeddedFinance').then(m => ({ default: m.SaaSEmbeddedFinance })));
const SaaSTeams = lazy(() => import('./pages/SaaSTeams').then(m => ({ default: m.SaaSTeams })));
const SaaSPages = lazy(() => import('./pages/SaaSPages').then(m => ({ default: m.SaaSPages })));
const SaaSCaseStudies = lazy(() => import('./pages/SaaSCaseStudies').then(m => ({ default: m.SaaSCaseStudies })));
const SaaSMaintenance = lazy(() => import('./pages/SaaSMaintenance').then(m => ({ default: m.SaaSMaintenance })));
const BrokerAIConfig = lazy(() => import('./pages/BrokerAIConfig').then(m => ({ default: m.BrokerAIConfig })));
const AgentDashboard = lazy(() => import('./pages/AgentDashboard').then(m => ({ default: m.AgentDashboard })));
const TeamOverview = lazy(() => import('./pages/TeamOverview').then(m => ({ default: m.TeamOverview })));
const TeamDetail = lazy(() => import('./pages/TeamDetail').then(m => ({ default: m.TeamDetail })));
const EmployeeDetail = lazy(() => import('./pages/EmployeeDetail').then(m => ({ default: m.EmployeeDetail })));
const MyProfile = lazy(() => import('./pages/MyProfile').then(m => ({ default: m.MyProfile })));
const LeadFinder = lazy(() => import('./pages/LeadFinder').then(m => ({ default: m.LeadFinder })));
const SocialSelling = lazy(() => import('./pages/SocialSelling').then(m => ({ default: m.SocialSelling })));
const DataImport = lazy(() => import('./pages/DataImport').then(m => ({ default: m.DataImport })));
const WebEngine = lazy(() => import('./pages/WebEngine').then(m => ({ default: m.WebEngine })));
const CallAgent = lazy(() => import('./pages/CallAgent').then(m => ({ default: m.CallAgent })));
const FeatureInfo = lazy(() => import('./pages/FeatureInfo').then(m => ({ default: m.FeatureInfo })));
const Legal = lazy(() => import('./pages/Legal').then(m => ({ default: m.Legal })));
const PublicPage = lazy(() => import('./pages/PublicPage').then(m => ({ default: m.PublicPage })));
const Career = lazy(() => import('./pages/Career').then(m => ({ default: m.Career })));
const AffiliateProgram = lazy(() => import('./pages/AffiliateProgram').then(m => ({ default: m.AffiliateProgram })));
const FAQPage = lazy(() => import('./pages/FAQ').then(m => ({ default: m.FAQPage })));
const OnboardingWizard = lazy(() => import('./pages/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
import { MaintenanceView } from './components/MaintenanceView'; 
const PublicPlans = lazy(() => import('./pages/PublicPlans').then(m => ({ default: m.PublicPlans })));
const PublicCaseStudies = lazy(() => import('./pages/PublicCaseStudies').then(m => ({ default: m.PublicCaseStudies })));
const PublicBlog = lazy(() => import('./pages/PublicBlog').then(m => ({ default: m.PublicBlog })));
const AboutUs = lazy(() => import('./pages/AboutUs').then(m => ({ default: m.AboutUs })));
// Solution Pages
const SolutionBroker = lazy(() => import('./pages/solutions/SolutionBroker').then(m => ({ default: m.SolutionBroker })));
const SolutionEnterprise = lazy(() => import('./pages/solutions/SolutionEnterprise').then(m => ({ default: m.SolutionEnterprise })));
const SolutionSales = lazy(() => import('./pages/solutions/SolutionSales').then(m => ({ default: m.SolutionSales })));

import { ScrollToTop } from './components/ScrollToTop';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityProvider, useSecurity } from './contexts/SecurityContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { UserRole } from './types';

// Helper Wrapper to route agents to their specific dashboard
const DashboardRouter = () => {
    const { role } = useAuth();
    if (role === UserRole.BROKER_AGENT) {
        return <AgentDashboard />;
    }
    return <Dashboard />;
}

// Global Application Controller to handle Maintenance
const ApplicationController = ({ children }: { children?: React.ReactNode }) => {
    const { isMaintenanceMode } = useSecurity();
    const { role, isAuthenticated } = useAuth();

    // Bypass Maintenance for SaaS Admins (Super Admin or SaaS roles)
    const isSaasAdmin = role && (role.startsWith('SAAS_'));
    
    if (isMaintenanceMode && !isSaasAdmin) {
        // If maintenance is on and user is not an operator, show maintenance view
        // Except for the login page, so they can theoretically log in as admin
        if (window.location.hash.includes('/login/saas')) {
            return <>{children}</>;
        }
        return <MaintenanceView />;
    }

    return <>{children}</>;
};

// Protected Route Simulation
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login/broker" />;
    return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrandingProvider>
          <SecurityProvider>
            <ApplicationController>
                <Router>
                <ScrollToTop />
                <Suspense fallback={<div className="p-8 text-center text-slate-400">Lädt…</div>}>
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/register" element={<OnboardingWizard />} />
                    <Route path="/login/:role" element={<Login />} />
                    <Route path="/login" element={<Navigate to="/login/broker" />} />

                    <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
                    
                    <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                    <Route path="/leads" element={<ProtectedRoute><LeadFinder /></ProtectedRoute>} />
                    <Route path="/social-selling" element={<ProtectedRoute><SocialSelling /></ProtectedRoute>} /> 
                    <Route path="/import" element={<ProtectedRoute><DataImport /></ProtectedRoute>} />
                    <Route path="/marketplace" element={<ProtectedRoute><LeadMarketplace /></ProtectedRoute>} />
                    
                    <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                    <Route path="/client/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>} />
                    <Route path="/tenant/:id" element={<ProtectedRoute><TenantDetail /></ProtectedRoute>} />
                    <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>} />
                    <Route path="/policy/:id" element={<ProtectedRoute><PolicyDetail /></ProtectedRoute>} />
                    <Route path="/mortgages" element={<ProtectedRoute><Mortgages /></ProtectedRoute>} />
                    <Route path="/mortgage/:id" element={<ProtectedRoute><MortgageDetail /></ProtectedRoute>} />
                    
                    <Route path="/credit" element={<ProtectedRoute><CreditSimulation /></ProtectedRoute>} />
                    
                    <Route path="/tax" element={<ProtectedRoute><TaxManagement /></ProtectedRoute>} />
                    <Route path="/saas/tax-config" element={<ProtectedRoute><SaaSTaxConfig /></ProtectedRoute>} />
                    <Route path="/saas/email-config" element={<ProtectedRoute><SaaSEmailConfig /></ProtectedRoute>} />
                    <Route path="/saas/newsletter" element={<ProtectedRoute><SaaSNewsletter /></ProtectedRoute>} />
                    <Route path="/saas/testimonials" element={<ProtectedRoute><SaaSTestimonials /></ProtectedRoute>} />
                    <Route path="/saas/case-studies" element={<ProtectedRoute><SaaSCaseStudies /></ProtectedRoute>} />
                    <Route path="/saas/maintenance" element={<ProtectedRoute><SaaSMaintenance /></ProtectedRoute>} /> 
                    <Route path="/saas/call-agent" element={<ProtectedRoute><CallAgent /></ProtectedRoute>} />
                    <Route path="/saas/embedded-finance" element={<ProtectedRoute><SaaSEmbeddedFinance /></ProtectedRoute>} />
                    <Route path="/saas/teams" element={<ProtectedRoute><SaaSTeams /></ProtectedRoute>} />
                    <Route path="/saas/cms" element={<ProtectedRoute><SaaSPages /></ProtectedRoute>} />

                    <Route path="/partners" element={<ProtectedRoute><PartnerHub /></ProtectedRoute>} />
                    <Route path="/partner/:id" element={<ProtectedRoute><PartnerDetail /></ProtectedRoute>} />
                    <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>} />
                    <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
                    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
                    <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
                    
                    <Route path="/team" element={<ProtectedRoute><TeamOverview /></ProtectedRoute>} />
                    <Route path="/team/:id" element={<ProtectedRoute><TeamDetail /></ProtectedRoute>} />
                    <Route path="/team/member/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
                    
                    <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

                    <Route path="/broker/ai-config" element={<ProtectedRoute><BrokerAIConfig /></ProtectedRoute>} />
                    <Route path="/web-engine" element={<ProtectedRoute><WebEngine /></ProtectedRoute>} /> 

                    <Route path="/plans" element={<ProtectedRoute><SaaSPlans /></ProtectedRoute>} />
                    <Route path="/saas/languages" element={<ProtectedRoute><SaaSLanguages /></ProtectedRoute>} />
                    <Route path="/saas/demo" element={<ProtectedRoute><SaaSDemo /></ProtectedRoute>} />
                    <Route path="/saas/pitch" element={<ProtectedRoute><SaaSPitch /></ProtectedRoute>} />
                    
                    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    
                    <Route path="/features/:slug" element={<FeatureInfo />} />
                    <Route path="/legal/:type" element={<Legal />} />
                    <Route path="/career" element={<Career />} />
                    <Route path="/affiliate" element={<AffiliateProgram />} />
                    <Route path="/faq" element={<FAQPage />} />
                    
                    {/* Specific Routes for Solution Landing Pages */}
                    <Route path="/p/about" element={<AboutUs />} />
                    <Route path="/p/solutions-broker" element={<SolutionBroker />} />
                    <Route path="/p/solutions-enterprise" element={<SolutionEnterprise />} />
                    <Route path="/p/solutions-sales" element={<SolutionSales />} />
                    
                    {/* Fallback for other CMS pages */}
                    <Route path="/p/:slug" element={<PublicPage />} />
                    
                    {/* NEW PUBLIC ROUTES */}
                    <Route path="/public/plans" element={<PublicPlans />} />
                    <Route path="/public/success-stories" element={<PublicCaseStudies />} />
                    <Route path="/public/blog" element={<PublicBlog />} />

                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                </Suspense>
                </Router>
            </ApplicationController>
          </SecurityProvider>
        </BrandingProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
