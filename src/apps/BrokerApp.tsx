
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { SecurityProvider } from '../../contexts/SecurityContext';
import { BrandingProvider } from '../../contexts/BrandingContext';
import { ScrollToTop } from '../../components/ScrollToTop';
import { MaintenanceView } from '../../components/MaintenanceView';

import { Dashboard } from '../../pages/Dashboard';
import { AgentDashboard } from '../../pages/AgentDashboard';
import { Clients } from '../../pages/Clients';
import { ClientDetail } from '../../pages/ClientDetail';
import { Policies } from '../../pages/Policies';
import { PolicyDetail } from '../../pages/PolicyDetail';
import { Mortgages } from '../../pages/Mortgages';
import { MortgageDetail } from '../../pages/MortgageDetail';
import { Integrations } from '../../pages/Integrations';
import { PartnerHub } from '../../pages/PartnerHub';
import { PartnerDetail } from '../../pages/PartnerDetail';
import { CalendarPage } from '../../pages/Calendar';
import { Commissions } from '../../pages/Commissions';
import { Inbox } from '../../pages/Inbox';
import { TaxManagement } from '../../pages/TaxManagement';
import { CreditSimulation } from '../../pages/CreditSimulation';
import { LeadMarketplace } from '../../pages/LeadMarketplace';
import { TeamOverview } from '../../pages/TeamOverview';
import { TeamDetail } from '../../pages/TeamDetail';
import { EmployeeDetail } from '../../pages/EmployeeDetail';
import { MyProfile } from '../../pages/MyProfile';
import { WebEngine } from '../../pages/WebEngine';
import { BrokerAIConfig } from '../../pages/BrokerAIConfig';
import { Settings } from '../../pages/Settings';
import { SaaSPlans } from '../../pages/SaaSPlans'; // Brokers see Plan selection
import { DataImport } from '../../pages/DataImport';

export const BrokerApp = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrandingProvider>
          <SecurityProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                {/* Default to Dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                {/* Specific Agent Dashboard Route (can also be handled in Dashboard comp) */}
                <Route path="/agent-dashboard" element={<AgentDashboard />} />

                <Route path="/clients" element={<Clients />} />
                <Route path="/client/:id" element={<ClientDetail />} />
                
                <Route path="/policies" element={<Policies />} />
                <Route path="/policy/:id" element={<PolicyDetail />} />
                
                <Route path="/mortgages" element={<Mortgages />} />
                <Route path="/mortgage/:id" element={<MortgageDetail />} />
                
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/commissions" element={<Commissions />} />
                <Route path="/tax" element={<TaxManagement />} />
                <Route path="/credit" element={<CreditSimulation />} />
                
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/partners" element={<PartnerHub />} />
                <Route path="/partner/:id" element={<PartnerDetail />} />
                <Route path="/marketplace" element={<LeadMarketplace />} />
                <Route path="/import" element={<DataImport />} />
                
                <Route path="/team" element={<TeamOverview />} />
                <Route path="/team/:id" element={<TeamDetail />} />
                <Route path="/team/member/:id" element={<EmployeeDetail />} />
                <Route path="/profile" element={<MyProfile />} />
                
                <Route path="/settings" element={<Settings />} />
                <Route path="/plans" element={<SaaSPlans />} />
                
                {/* Broker Admin Tools */}
                <Route path="/web-engine" element={<WebEngine />} />
                <Route path="/broker/ai-config" element={<BrokerAIConfig />} />

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </SecurityProvider>
        </BrandingProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};
