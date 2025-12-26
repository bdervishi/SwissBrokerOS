import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
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
import { SaaSPlans } from './pages/SaaSPlans';
import { SaaSLanguages } from './pages/SaaSLanguages';
import { SaaSDemo } from './pages/SaaSDemo';
import { SaaSTaxConfig } from './pages/SaaSTaxConfig';
import { SaaSEmailConfig } from './pages/SaaSEmailConfig';
import { SaaSNewsletter } from './pages/SaaSNewsletter';
import { SaaSTestimonials } from './pages/SaaSTestimonials';
import { BrokerAIConfig } from './pages/BrokerAIConfig';
import { AgentDashboard } from './pages/AgentDashboard';
import { TeamOverview } from './pages/TeamOverview';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { LeadFinder } from './pages/LeadFinder';
import { DataImport } from './pages/DataImport';
import { CallAgent } from './pages/CallAgent';
import { FeatureInfo } from './pages/FeatureInfo';
import { Legal } from './pages/Legal';
import { OnboardingWizard } from './pages/OnboardingWizard';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SecurityProvider } from './contexts/SecurityContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { BrandingProvider } from './contexts/BrandingContext';
import { UserRole } from './types';

// Helper Wrapper to route agents to their specific dashboard
const DashboardRouter: React.FC = () => {
    const { role } = useAuth();
    if (role === UserRole.BROKER_AGENT) {
        return <AgentDashboard />;
    }
    return <Dashboard />;
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrandingProvider>
          <SecurityProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/register" element={<OnboardingWizard />} />
                
                {/* Marketing & Content Routes */}
                <Route path="/features/:slug" element={<FeatureInfo />} />
                <Route path="/legal/:type" element={<Legal />} />
                
                {/* Dynamic Dashboard based on Role */}
                <Route path="/dashboard" element={<DashboardRouter />} />
                
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/leads" element={<LeadFinder />} />
                <Route path="/import" element={<DataImport />} />
                
                <Route path="/clients" element={<Clients />} />
                <Route path="/client/:id" element={<ClientDetail />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/policy/:id" element={<PolicyDetail />} />
                <Route path="/mortgages" element={<Mortgages />} />
                <Route path="/mortgage/:id" element={<MortgageDetail />} />
                
                {/* Credit & Leasing */}
                <Route path="/credit" element={<CreditSimulation />} />
                
                {/* TAX ROUTES */}
                <Route path="/tax" element={<TaxManagement />} />
                <Route path="/saas/tax-config" element={<SaaSTaxConfig />} />
                <Route path="/saas/email-config" element={<SaaSEmailConfig />} />
                <Route path="/saas/newsletter" element={<SaaSNewsletter />} />
                <Route path="/saas/testimonials" element={<SaaSTestimonials />} />
                <Route path="/saas/call-agent" element={<CallAgent />} />

                <Route path="/partners" element={<PartnerHub />} />
                <Route path="/partner/:id" element={<PartnerDetail />} />
                <Route path="/commissions" element={<Commissions />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<Integrations />} />
                
                {/* Team & HR Routes */}
                <Route path="/team" element={<TeamOverview />} />
                <Route path="/team/member/:id" element={<EmployeeDetail />} />

                {/* Broker AI Studio */}
                <Route path="/broker/ai-config" element={<BrokerAIConfig />} />

                <Route path="/plans" element={<SaaSPlans />} />
                <Route path="/saas/languages" element={<SaaSLanguages />} />
                <Route path="/saas/demo" element={<SaaSDemo />} />
                <Route path="/settings" element={<Settings />} />
                
                {/* Fallback routes */}
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