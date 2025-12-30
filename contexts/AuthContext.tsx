
import React, { createContext, useContext, useState } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  loginStep: 'IDENTIFY' | 'AWAIT_OTL' | 'PASSWORD';
  
  // OTL Flow
  requestOtl: (username: string) => Promise<boolean>;
  verifyOtl: (token: string) => Promise<boolean>;
  completeLogin: (password: string) => Promise<boolean>;
  
  // Management
  logout: () => void;
  resetPasswordRequest: (username: string) => Promise<void>;
  adminResetPassword: (userId: string) => Promise<string>; // Returns temp password
  
  // Dev tools
  switchRole: (role: UserRole) => void;
  impersonateUser: (userId: string) => void;
  stopImpersonation: () => void;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [loginStep, setLoginStep] = useState<'IDENTIFY' | 'AWAIT_OTL' | 'PASSWORD'>('IDENTIFY');
  const [pendingUsername, setPendingUsername] = useState<string | null>(null);
  const [associatedEmail, setAssociatedEmail] = useState<string | null>(null);

  // --- OTL LOGIN FLOW ---

  const requestOtl = async (username: string): Promise<boolean> => {
    const foundUser = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (foundUser) {
      setPendingUsername(username);
      setAssociatedEmail(foundUser.email);
      setLoginStep('AWAIT_OTL');
      console.log(`[SYS] OTL an ${foundUser.email} gesendet für User ${username}.`);
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
    if (foundUser && password === 'password123') { // Mock-Check
      setUser(foundUser);
      setLoginStep('IDENTIFY'); 
      setPendingUsername(null);
      setAssociatedEmail(null);
      return true;
    }
    return false;
  };

  const resetPasswordRequest = async (username: string) => {
    const foundUser = MOCK_USERS.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (foundUser) {
        console.log(`Passwort Reset Link an ${foundUser.email} gesendet.`);
    }
  };

  const adminResetPassword = async (userId: string): Promise<string> => {
    const tempPass = Math.random().toString(36).slice(-8);
    console.log(`Admin hat Passwort für ${userId} auf ${tempPass} zurückgesetzt.`);
    return tempPass;
  };

  const switchRole = (newRole: UserRole) => {
    const mockUser = MOCK_USERS.find(u => u.role === newRole);
    if (mockUser) {
      setUser(mockUser);
      setOriginalUser(null);
    }
  };

  const impersonateUser = (userId: string) => {
    const targetUser = MOCK_USERS.find(u => u.id === userId);
    if (targetUser && user) {
      setOriginalUser(user);
      setUser(targetUser);
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
    setLoginStep('IDENTIFY');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      role: user?.role || null, 
      isAuthenticated: !!user,
      isImpersonating: !!originalUser,
      loginStep,
      requestOtl,
      verifyOtl,
      completeLogin,
      logout,
      resetPasswordRequest,
      adminResetPassword,
      switchRole,
      impersonateUser,
      stopImpersonation
    }}>
      {children}
    </AuthContext.Provider>
  );
};
