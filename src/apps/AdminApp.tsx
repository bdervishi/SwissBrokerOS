
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { SecurityProvider } from '../../contexts/SecurityContext';
import { BrandingProvider } from '../../contexts/BrandingContext';
import { ScrollToTop } from '../../components/ScrollToTop';

import { Dashboard } from '../../pages/Dashboard'; // Admin View
import { Clients } from '../../pages/Clients'; // Tenants List
import { TenantDetail } from '../../pages/TenantDetail';
import { Analytics } from '../../pages/Analytics';
import { SaaSPlans } from '../../pages/SaaSPlans';
import { SaaSLanguages } from '../../pages/SaaSLanguages';
import { SaaSDemo } from '../../pages/SaaSDemo';
import { SaaSPitch } from '../../pages/SaaSPitch';
import { SaaSTaxConfig } from '../../pages/SaaSTaxConfig';
import { SaaSEmailConfig } from '../../pages/SaaSEmailConfig';
import { SaaSNewsletter } from '../../pages/SaaSNewsletter';
import { SaaSTestimonials } from '../../pages/SaaSTestimonials';
import { SaaSCaseStudies } from '../../pages/SaaSCaseStudies';
import { SaaSMaintenance } from '../../pages/SaaSMaintenance';
import { SaaSEmbeddedFinance } from '../../pages/SaaSEmbeddedFinance';
import { SaaSTeams } from '../../pages/SaaSTeams';
import { SaaSPages } from '../../pages/SaaSPages';
import { LeadFinder } from '../../pages/LeadFinder';
import { SocialSelling } from '../../pages/SocialSelling';
import { CallAgent } from '../../pages/CallAgent';
import { Settings } from '../../pages/Settings';
import { Commissions } from '../../pages/Commissions';

export const AdminApp = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrandingProvider>
          <SecurityProvider>
            <Router>
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/dashboard" element={<Dashboard />} />
                
                <Route path="/clients" element={<Clients />} />
                <Route path="/tenant/:id" element={<TenantDetail />} />
                
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/plans" element={<SaaSPlans />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/commissions" element={<Commissions />} />
                
                {/* SaaS Specific Modules */}
                <Route path="/saas/teams" element={<SaaSTeams />} />
                <Route path="/saas/tax-config" element={<SaaSTaxConfig />} />
                <Route path="/saas/email-config" element={<SaaSEmailConfig />} />
                <Route path="/saas/embedded-finance" element={<SaaSEmbeddedFinance />} />
                <Route path="/saas/languages" element={<SaaSLanguages />} />
                <Route path="/saas/cms" element={<SaaSPages />} />
                <Route path="/saas/newsletter" element={<SaaSNewsletter />} />
                <Route path="/saas/testimonials" element={<SaaSTestimonials />} />
                <Route path="/saas/case-studies" element={<SaaSCaseStudies />} />
                <Route path="/saas/maintenance" element={<SaaSMaintenance />} />
                
                {/* Sales Tools */}
                <Route path="/leads" element={<LeadFinder />} />
                <Route path="/social-selling" element={<SocialSelling />} />
                <Route path="/saas/call-agent" element={<CallAgent />} />
                <Route path="/saas/demo" element={<SaaSDemo />} />
                <Route path="/saas/pitch" element={<SaaSPitch />} />

                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </SecurityProvider>
        </BrandingProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};
