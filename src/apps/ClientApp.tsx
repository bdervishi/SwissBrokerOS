
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import { SecurityProvider } from '../../contexts/SecurityContext';
import { BrandingProvider } from '../../contexts/BrandingContext';
import { ScrollToTop } from '../../components/ScrollToTop';

import { Dashboard } from '../../pages/Dashboard'; // Client View
import { Policies } from '../../pages/Policies'; // Client View
import { PolicyDetail } from '../../pages/PolicyDetail';
import { Mortgages } from '../../pages/Mortgages'; // Client View
import { MortgageDetail } from '../../pages/MortgageDetail';
import { Settings } from '../../pages/Settings'; // Minimal settings

export const ClientApp = () => {
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
                
                <Route path="/policies" element={<Policies />} />
                <Route path="/policy/:id" element={<PolicyDetail />} />
                
                <Route path="/mortgages" element={<Mortgages />} />
                <Route path="/mortgage/:id" element={<MortgageDetail />} />
                
                <Route path="/settings" element={<Settings />} />
                
                <Route path="*" element={<Navigate to="/dashboard" />} />
              </Routes>
            </Router>
          </SecurityProvider>
        </BrandingProvider>
      </LanguageProvider>
    </AuthProvider>
  );
};
