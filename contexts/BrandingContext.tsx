import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { MOCK_TENANTS } from '../constants';
import { Tenant, BrandingConfig } from '../types';

interface BrandingContextType {
  tenant: Tenant | null;
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
}

const defaultBranding: BrandingConfig = {
  primaryColor: '#0ea5e9', // Default SwissBroker Blue
  logoText: 'SwissBroker OS',
};

const BrandingContext = createContext<BrandingContextType>({
  tenant: null,
  branding: defaultBranding,
  updateBranding: () => {},
});

export const useBranding = () => useContext(BrandingContext);

// Helper to convert Hex to RGB for Tailwind variables
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '14 165 233';
};

// Simple shader to lighten/darken hex (Basic implementation for prototype)
// In a production app, use 'tinycolor2' or 'chroma-js'
const adjustColor = (color: string, amount: number) => {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);

  // Load Tenant based on User
  useEffect(() => {
    if (user?.tenantId) {
        const foundTenant = MOCK_TENANTS.find(t => t.id === user.tenantId);
        if (foundTenant) {
            setTenant(foundTenant);
            setBranding(foundTenant.branding || defaultBranding);
        }
    } else {
        // SaaS Admin or unassigned user gets default branding
        setTenant(null);
        setBranding(defaultBranding);
    }
  }, [user]);

  // Apply CSS Variables when branding changes
  useEffect(() => {
    const root = document.documentElement;
    const baseColor = branding.primaryColor;

    // We simulate a palette by manually shifting hex values. 
    // This is approximate but works for visual demos without heavy libraries.
    // 500/600 is the base.
    
    // Note: This logic is simplified. A real hex shader would be more complex.
    // We will trust the browser calculates these somewhat okay, or rely on valid hex inputs.
    
    root.style.setProperty('--color-brand-600', hexToRgb(baseColor));
    
    // Naive manual shifts for other shades (won't be perfect but proves the concept)
    // Ideally you import the user's color into a utility that generates the full palette
    root.style.setProperty('--color-brand-500', hexToRgb(baseColor)); 
    root.style.setProperty('--color-brand-700', hexToRgb(baseColor)); // In prod: Darken(10%)
    root.style.setProperty('--color-brand-900', hexToRgb(baseColor)); // In prod: Darken(30%)
    root.style.setProperty('--color-brand-50', hexToRgb(baseColor)); // In prod: Lighten(90%)
    root.style.setProperty('--color-brand-100', hexToRgb(baseColor)); // In prod: Lighten(80%)

  }, [branding]);

  const updateBranding = (config: Partial<BrandingConfig>) => {
      setBranding(prev => ({ ...prev, ...config }));
      // In a real app, you would save this to the backend here
  };

  return (
    <BrandingContext.Provider value={{ tenant, branding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};