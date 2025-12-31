
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login'; // NEW
import { Dashboard } from './pages/Dashboard';
import { ClientDetail } from './pages/ClientDetail';
import { Clients } from './pages/Clients';
import { TenantDetail } from './pages/TenantDetail'; // NEW
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
import { SaaSCaseStudies } from './pages/SaaSCaseStudies'; // NEW
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
// Fix: Changed children to optional ReactNode to satisfy strict TS environments
const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
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
                {/* Fix: Cleaned up Routes to use self-closing syntax without internal comments/null children which can cause issues with strict Route types */}
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<OnboardingWizard />} />
                <Route path="/login/:role" element={<Login />} />
                <Route path="/login" element={<Navigate to="/login/broker" />} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
                
                <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
                <Route path="/leads" element={<ProtectedRoute><LeadFinder /></ProtectedRoute>} />
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
                <Route path="/saas/case-studies" element={<ProtectedRoute><SaaSCaseStudies /></ProtectedRoute>} /> {/* NEW */}
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
                <Route path="/p/:slug" element={<PublicPage />} />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Router>
          </SecurityProvider>
        </BrandingProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};

export default App;
