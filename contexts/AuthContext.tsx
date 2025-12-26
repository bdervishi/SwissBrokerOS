import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  switchRole: (role: UserRole) => void;
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isImpersonating: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  switchRole: () => {},
  impersonateUser: () => {},
  stopImpersonation: () => {},
  logout: () => {},
  isAuthenticated: false,
  isImpersonating: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to Broker Admin for dev, but conceptually starts as null in prod
  const [user, setUser] = useState<User | null>(MOCK_USERS.find(u => u.role === UserRole.BROKER_ADMIN) || null);
  
  // Store the original admin user when impersonating
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const switchRole = (newRole: UserRole) => {
    // Standard role switching for development/testing
    const mockUser = MOCK_USERS.find(u => u.role === newRole);
    if (mockUser) {
        setUser(mockUser);
        setOriginalUser(null); // Reset impersonation if we manually switch roles
    }
  };

  const impersonateUser = (userId: string) => {
      const targetUser = MOCK_USERS.find(u => u.id === userId);
      if (targetUser && user) {
          setOriginalUser(user); // Save current SaaS admin
          setUser(targetUser); // Switch to target
      }
  };

  const stopImpersonation = () => {
      if (originalUser) {
          setUser(originalUser);
          setOriginalUser(null);
      }
  };

  const logout = () => {
    setUser(null);
    setOriginalUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        role: user?.role || null, 
        switchRole, 
        impersonateUser,
        stopImpersonation,
        logout,
        isAuthenticated: !!user,
        isImpersonating: !!originalUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};