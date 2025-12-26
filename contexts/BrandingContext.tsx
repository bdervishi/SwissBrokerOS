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

// Helper to convert Hex to HSL for shade generation
const hexToHSL = (hex: string) => {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h: number = 0, s: number = 0, l: number = (max + min) / 2;
    if (max !== min) {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
};

// Helper to convert HSL back to RGB string for Tailwind
const hslToRGBString = (h: number, s: number, l: number) => {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2, r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    return `${Math.round((r + m) * 255)} ${Math.round((g + m) * 255)} ${Math.round((b + m) * 255)}`;
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);

  useEffect(() => {
    if (user?.tenantId) {
        const foundTenant = MOCK_TENANTS.find(t => t.id === user.tenantId);
        if (foundTenant) {
            setTenant(foundTenant);
            setBranding(foundTenant.branding || defaultBranding);
        }
    } else {
        setTenant(null);
        setBranding(defaultBranding);
    }
  }, [user]);

  useEffect(() => {
    const root = document.documentElement;
    const baseColor = branding.primaryColor;
    const hsl = hexToHSL(baseColor);

    // Generate accurate shades using HSL manipulation
    root.style.setProperty('--color-brand-50', hslToRGBString(hsl.h, hsl.s, 97));
    root.style.setProperty('--color-brand-100', hslToRGBString(hsl.h, hsl.s, 92));
    root.style.setProperty('--color-brand-500', hslToRGBString(hsl.h, hsl.s, hsl.l));
    root.style.setProperty('--color-brand-600', hslToRGBString(hsl.h, hsl.s, Math.max(0, hsl.l - 8)));
    root.style.setProperty('--color-brand-700', hslToRGBString(hsl.h, hsl.s, Math.max(0, hsl.l - 18)));
    root.style.setProperty('--color-brand-900', hslToRGBString(hsl.h, hsl.s, Math.max(0, hsl.l - 35)));

  }, [branding]);

  const updateBranding = (config: Partial<BrandingConfig>) => {
      setBranding(prev => ({ ...prev, ...config }));
  };

  return (
    <BrandingContext.Provider value={{ tenant, branding, updateBranding }}>
      {children}
    </BrandingContext.Provider>
  );
};