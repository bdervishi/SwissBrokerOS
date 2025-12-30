
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login'; // NEW
import { Dashboard } from './pages/Dashboard';
import { ClientDetail } from './pages/ClientDetail';
import { Clients } from './pages/Clients';
import { Policies } from './pages/Policies';
import { PolicyDetail } from './pages/PolicyDetail';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { Mortgages } from './pages/Mortgages';
import { MortgageDetail } from './pages/MortgageDetail';
import { Integrations } from './pages/Integrations';
import { PartnerHub } from './pages/PartnerHub';
import { PartnerDetail } from './pages/PartnerDetail';
import { CalendarPage } from './pages/Calendar';
import { Commissions } from './pages/Commissions';
import { Inbox } from './pages/Inbox';
import { TaxManagement } from './pages/TaxManagement';
import { CreditSimulation } from './pages/CreditSimulation';
import { LeadMarketplace } from './pages/LeadMarketplace';
import { SaaSPlans } from './pages/SaaSPlans';
import { SaaSLanguages } from './pages/SaaSLanguages';
import { SaaSDemo } from './pages/SaaSDemo';
import { SaaSPitch } from './pages/SaaSPitch'; 
import { SaaSTaxConfig } from './pages/SaaSTaxConfig';
import { SaaSEmailConfig } from './pages/SaaSEmailConfig';
import { SaaSNewsletter } from './pages/SaaSNewsletter';
import { SaaSTestimonials } from './pages/SaaSTestimonials';
import { SaaSEmbeddedFinance } from './pages/SaaSEmbeddedFinance';
import { SaaSTeams } from './pages/SaaSTeams';
import { SaaSPages } from './pages/SaaSPages';
import { BrokerAIConfig } from './pages/BrokerAIConfig';
import { AgentDashboard } from './pages/AgentDashboard';
import { TeamOverview } from './pages/TeamOverview';
import { TeamDetail } from './pages/TeamDetail';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { LeadFinder } from './pages/LeadFinder';
import { DataImport } from './pages/DataImport';
import { WebEngine } from './pages/WebEngine'; 
import { CallAgent } from './pages/CallAgent';
import { FeatureInfo } from './pages/FeatureInfo';
import { Legal } from './pages/Legal';
import { PublicPage } from './pages/PublicPage';
import { Career } from './pages/Career';
import { AffiliateProgram } from './pages/AffiliateProgram';
import { FAQPage } from './pages/FAQ'; 
import { OnboardingWizard } from './pages/OnboardingWizard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { UserRole } from './types';

// Helper Wrapper to route agents to their specific dashboard
// Use a standard function component to avoid React.FC child-requirement issues
const DashboardRouter = () => {
    const { role } = useAuth();
    if (role === UserRole.BROKER_AGENT) {
        return <AgentDashboard />;
    }
    return <Dashboard />;
}

// Protected Route Simulation
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login/broker" />;
    return <>{children}</>;
};

// Use a standard function component to avoid React.FC child-requirement issues
const App = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrandingProvider>
          <SecurityProvider>
            {/* Standard Router components wrapped with children as required by some TS environments */}
            <Router>
              <Routes>
                {/* Fixed: ensuring all Route components have explicit children (even if null) to satisfy strict types */}
                <Route path="/" element={<Landing />}>{null}</Route>
                <Route path="/register" element={<OnboardingWizard />}>{null}</Route>
                <Route path="/login/:role" element={<Login />}>{null}</Route>
                <Route path="/login" element={<Navigate to="/login/broker" />}>{null}</Route>

                {/* All Dashboard routes should be protected in production */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>}>{null}</Route>
                
                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>}>{null}</Route>
                <Route path="/leads" element={<ProtectedRoute><LeadFinder /></ProtectedRoute>}>{null}</Route>
                <Route path="/import" element={<ProtectedRoute><DataImport /></ProtectedRoute>}>{null}</Route>
                <Route path="/marketplace" element={<ProtectedRoute><LeadMarketplace /></ProtectedRoute>}>{null}</Route>
                
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>}>{null}</Route>
                <Route path="/client/:id" element={<ProtectedRoute><ClientDetail /></ProtectedRoute>}>{null}</Route>
                <Route path="/policies" element={<ProtectedRoute><Policies /></ProtectedRoute>}>{null}</Route>
                <Route path="/policy/:id" element={<ProtectedRoute><PolicyDetail /></ProtectedRoute>}>{null}</Route>
                <Route path="/mortgages" element={<ProtectedRoute><Mortgages /></ProtectedRoute>}>{null}</Route>
                <Route path="/mortgage/:id" element={<ProtectedRoute><MortgageDetail /></ProtectedRoute>}>{null}</Route>
                
                <Route path="/credit" element={<ProtectedRoute><CreditSimulation /></ProtectedRoute>}>{null}</Route>
                
                <Route path="/tax" element={<ProtectedRoute><TaxManagement /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/tax-config" element={<ProtectedRoute><SaaSTaxConfig /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/email-config" element={<ProtectedRoute><SaaSEmailConfig /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/newsletter" element={<ProtectedRoute><SaaSNewsletter /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/testimonials" element={<ProtectedRoute><SaaSTestimonials /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/call-agent" element={<ProtectedRoute><CallAgent /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/embedded-finance" element={<ProtectedRoute><SaaSEmbeddedFinance /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/teams" element={<ProtectedRoute><SaaSTeams /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/cms" element={<ProtectedRoute><SaaSPages /></ProtectedRoute>}>{null}</Route>

                <Route path="/partners" element={<ProtectedRoute><PartnerHub /></ProtectedRoute>}>{null}</Route>
                <Route path="/partner/:id" element={<ProtectedRoute><PartnerDetail /></ProtectedRoute>}>{null}</Route>
                <Route path="/commissions" element={<ProtectedRoute><Commissions /></ProtectedRoute>}>{null}</Route>
                <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>}>{null}</Route>
                <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>}>{null}</Route>
                <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>}>{null}</Route>
                
                <Route path="/team" element={<ProtectedRoute><TeamOverview /></ProtectedRoute>}>{null}</Route>
                <Route path="/team/:id" element={<ProtectedRoute><TeamDetail /></ProtectedRoute>}>{null}</Route>
                <Route path="/team/member/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>}>{null}</Route>

                <Route path="/broker/ai-config" element={<ProtectedRoute><BrokerAIConfig /></ProtectedRoute>}>{null}</Route>
                <Route path="/web-engine" element={<ProtectedRoute><WebEngine /></ProtectedRoute>}>{null}</Route> 

                <Route path="/plans" element={<ProtectedRoute><SaaSPlans /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/languages" element={<ProtectedRoute><SaaSLanguages /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/demo" element={<ProtectedRoute><SaaSDemo /></ProtectedRoute>}>{null}</Route>
                <Route path="/saas/pitch" element={<ProtectedRoute><SaaSPitch /></ProtectedRoute>}>{null}</Route>
                
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>}>{null}</Route>
                
                {/* Content Routes */}
                <Route path="/features/:slug" element={<FeatureInfo />}>{null}</Route>
                <Route path="/legal/:type" element={<Legal />}>{null}</Route>
                <Route path="/career" element={<Career />}>{null}</Route>
                <Route path="/affiliate" element={<AffiliateProgram />}>{null}</Route>
                <Route path="/faq" element={<FAQPage />}>{null}</Route>
                <Route path="/p/:slug" element={<PublicPage />}>{null}</Route>

                <Route path="*" element={<Navigate to="/" />}>{null}</Route>
              </Routes>
            </Router>
          </SecurityProvider>
        </BrandingProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
