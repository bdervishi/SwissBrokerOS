
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  loginStep: 'IDENTIFY' | 'AWAIT_OTL' | 'PASSWORD';
  requestOtl: (username: string) => Promise<boolean>;
  verifyOtl: (token: string) => Promise<boolean>;
  completeLogin: (password: string) => Promise<boolean>;
  logout: () => void;
  resetPasswordRequest: (username: string) => Promise<void>;
  adminResetPassword: (userId: string) => Promise<string>;
  switchRole: (role: UserRole) => void;
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [loginStep, setLoginStep] = useState<'IDENTIFY' | 'AWAIT_OTL' | 'PASSWORD'>('IDENTIFY');
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from LocalStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('sb_user_id');
    const storedOrigId = localStorage.getItem('sb_orig_user_id');
    
    if (storedUserId) {
        const foundUser = MOCK_USERS.find(u => u.id === storedUserId);
        if (foundUser) setUser(foundUser);
    }
    
    if (storedOrigId) {
        const foundOrig = MOCK_USERS.find(u => u.id === storedOrigId);
        if (foundOrig) setOriginalUser(foundOrig);
    }
    setIsLoading(false);
  }, []);

  // Persist session
  useEffect(() => {
      if (user) localStorage.setItem('sb_user_id', user.id);
      else localStorage.removeItem('sb_user_id');

      if (originalUser) localStorage.setItem('sb_orig_user_id', originalUser.id);
      else localStorage.removeItem('sb_orig_user_id');
  }, [user, originalUser]);

  const requestOtl = async (username: string): Promise<boolean> => {
    const foundUser = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (foundUser) {
      setPendingUsername(username);
      setLoginStep('AWAIT_OTL');
      return true;
    }
    return false;
  };

  const verifyOtl = async (token: string): Promise<boolean> => {
    if (token === 'valid-demo-token' && pendingUsername) {
      setLoginStep('PASSWORD');
      return true;
    }
    return false;
  };

  const completeLogin = async (password: string): Promise<boolean> => {
    const foundUser = MOCK_USERS.find(u => u.username === pendingUsername);
    if (foundUser && password === 'password123') { 
      setUser(foundUser);
      setLoginStep('IDENTIFY'); 
      setPendingUsername(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setOriginalUser(null);
    localStorage.removeItem('sb_user_id');
    localStorage.removeItem('sb_orig_user_id');
    // Force redirect to public login
    window.location.href = '/';
  };

  // ... (Keep existing helpers)
  const resetPasswordRequest = async (username: string) => { console.log("Reset requested", username); };
  const adminResetPassword = async (userId: string) => { return "temp-123"; };
  
  const switchRole = (newRole: UserRole) => {
    const mockUser = MOCK_USERS.find(u => u.role === newRole);
    if (mockUser) { setUser(mockUser); setOriginalUser(null); }
  };

  const impersonateUser = (userId: string) => {
    const targetUser = MOCK_USERS.find(u => u.id === userId);
    if (targetUser && user) { setOriginalUser(user); setUser(targetUser); }
  };

  const stopImpersonation = () => {
    if (originalUser) { setUser(originalUser); setOriginalUser(null); }
  };

  if (isLoading) return null; // Prevent flash of unauthenticated content

  return (
    <AuthContext.Provider value={{ 
      user, role: user?.role || null, isAuthenticated: !!user, isImpersonating: !!originalUser,
      loginStep, requestOtl, verifyOtl, completeLogin, logout,
      resetPasswordRequest, adminResetPassword, switchRole, impersonateUser, stopImpersonation
    }}>
      {children}
    </AuthContext.Provider>
  );
};
