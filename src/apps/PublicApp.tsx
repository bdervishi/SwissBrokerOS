
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { Landing } from '../../pages/Landing';
import { Login } from '../../pages/Login';
import { OnboardingWizard } from '../../pages/OnboardingWizard';
import { FeatureInfo } from '../../pages/FeatureInfo';
import { Legal } from '../../pages/Legal';
import { Career } from '../../pages/Career';
import { AffiliateProgram } from '../../pages/AffiliateProgram';
import { FAQPage } from '../../pages/FAQ';
import { PublicPlans } from '../../pages/PublicPlans';
import { PublicCaseStudies } from '../../pages/PublicCaseStudies';
import { PublicBlog } from '../../pages/PublicBlog';
import { AboutUs } from '../../pages/AboutUs';
import { SolutionBroker } from '../../pages/solutions/SolutionBroker';
import { SolutionEnterprise } from '../../pages/solutions/SolutionEnterprise';
import { SolutionSales } from '../../pages/solutions/SolutionSales';
import { PublicPage } from '../../pages/PublicPage';
import { ScrollToTop } from '../../components/ScrollToTop';

export const PublicApp = () => {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<OnboardingWizard />} />
            <Route path="/login/:role" element={<Login />} />
            <Route path="/login" element={<Navigate to="/login/broker" />} />
            
            <Route path="/features/:slug" element={<FeatureInfo />} />
            <Route path="/legal/:type" element={<Legal />} />
            <Route path="/career" element={<Career />} />
            <Route path="/affiliate" element={<AffiliateProgram />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/public/plans" element={<PublicPlans />} />
            <Route path="/public/success-stories" element={<PublicCaseStudies />} />
            <Route path="/public/blog" element={<PublicBlog />} />
            
            <Route path="/p/about" element={<AboutUs />} />
            <Route path="/p/solutions-broker" element={<SolutionBroker />} />
            <Route path="/p/solutions-enterprise" element={<SolutionEnterprise />} />
            <Route path="/p/solutions-sales" element={<SolutionSales />} />
            <Route path="/p/:slug" element={<PublicPage />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
};
