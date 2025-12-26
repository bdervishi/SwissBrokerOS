import React, { createContext, useContext, useState, useEffect } from 'react';

interface SecurityContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  isAIEnabled: boolean;
  toggleAI: () => void;
}

const SecurityContext = createContext<SecurityContextType>({
  isPrivacyMode: false,
  togglePrivacyMode: () => {},
  isAIEnabled: false,
  toggleAI: () => {},
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  // Initialize from localStorage or default to false (Opt-In)
  const [isAIEnabled, setIsAIEnabled] = useState(() => {
      return localStorage.getItem('app_ai_enabled') === 'true';
  });

  const togglePrivacyMode = () => {
    setIsPrivacyMode(prev => !prev);
  };

  const toggleAI = () => {
      setIsAIEnabled(prev => {
          const newVal = !prev;
          localStorage.setItem('app_ai_enabled', String(newVal));
          return newVal;
      });
  };

  return (
    <SecurityContext.Provider value={{ isPrivacyMode, togglePrivacyMode, isAIEnabled, toggleAI }}>
      {children}
    </SecurityContext.Provider>
  );
};