
import React, { createContext, useContext, useState, useEffect } from 'react';

interface SecurityContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  isAIEnabled: boolean;
  toggleAI: () => void;
  isMaintenanceMode: boolean;
  toggleMaintenance: (active: boolean) => void;
  maintenanceMessage: string;
  setMaintenanceMessage: (msg: string) => void;
}

const SecurityContext = createContext<SecurityContextType>({
  isPrivacyMode: false,
  togglePrivacyMode: () => {},
  isAIEnabled: false,
  toggleAI: () => {},
  isMaintenanceMode: false,
  toggleMaintenance: () => {},
  maintenanceMessage: '',
  setMaintenanceMessage: () => {},
});

export const useSecurity = () => useContext(SecurityContext);

export const SecurityProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  
  const [isAIEnabled, setIsAIEnabled] = useState(() => {
      return localStorage.getItem('app_ai_enabled') === 'true';
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState(() => {
      return localStorage.getItem('app_maintenance_mode') === 'true';
  });

  const [maintenanceMessage, setMaintenanceMessageState] = useState(() => {
      return localStorage.getItem('app_maintenance_msg') || 'Wir führen aktuell geplante Wartungsarbeiten durch, um SwissBroker OS noch besser zu machen.';
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

  const toggleMaintenance = (active: boolean) => {
      setIsMaintenanceMode(active);
      localStorage.setItem('app_maintenance_mode', String(active));
  };

  const setMaintenanceMessage = (msg: string) => {
      setMaintenanceMessageState(msg);
      localStorage.setItem('app_maintenance_msg', msg);
  };

  return (
    <SecurityContext.Provider value={{ 
        isPrivacyMode, 
        togglePrivacyMode, 
        isAIEnabled, 
        toggleAI,
        isMaintenanceMode,
        toggleMaintenance,
        maintenanceMessage,
        setMaintenanceMessage
    }}>
      {children}
    </SecurityContext.Provider>
  );
};
