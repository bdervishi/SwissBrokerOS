import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { MOCK_USERS } from '../constants';
import { supabase, isSupabaseConfigured } from '../src/lib/supabase';
import { db, USE_MOCK } from '../src/services/db';

// Real Supabase auth is used only when a backend is configured AND mock data is
// not force-enabled. Otherwise the demo (mock) login flow stays active so a
// fresh checkout works with no backend.
const USE_REAL_AUTH = isSupabaseConfigured && !USE_MOCK;

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
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the profile row for an authenticated Supabase user.
  const loadProfile = async (userId: string): Promise<User | null> => {
    try {
      const profile = await db.profiles.getById(userId);
      return (profile as User) ?? null;
    } catch (err) {
      console.error('[Auth] Failed to load profile:', err);
      return null;
    }
  };

  // ----- Session bootstrap -------------------------------------------------
  useEffect(() => {
    if (USE_REAL_AUTH) {
      // Restore an existing Supabase session and subscribe to auth changes.
      supabase.auth.getSession().then(async ({ data }) => {
        if (data.session?.user) {
          const profile = await loadProfile(data.session.user.id);
          if (profile) setUser(profile);
        }
        setIsLoading(false);
      });

      const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile = await loadProfile(session.user.id);
          setUser(profile);
        } else {
          setUser(null);
          setOriginalUser(null);
        }
      });
      return () => sub.subscription.unsubscribe();
    }

    // Mock mode: restore session from localStorage.
    const storedUserId = localStorage.getItem('sb_user_id');
    const storedOrigId = localStorage.getItem('sb_orig_user_id');
    if (storedUserId) {
      const foundUser = MOCK_USERS.find((u) => u.id === storedUserId);
      if (foundUser) setUser(foundUser);
    }
    if (storedOrigId) {
      const foundOrig = MOCK_USERS.find((u) => u.id === storedOrigId);
      if (foundOrig) setOriginalUser(foundOrig);
    }
    setIsLoading(false);
  }, []);

  // Persist mock session to localStorage (real sessions are handled by Supabase).
  useEffect(() => {
    if (USE_REAL_AUTH) return;
    if (user) localStorage.setItem('sb_user_id', user.id);
    else localStorage.removeItem('sb_user_id');
    if (originalUser) localStorage.setItem('sb_orig_user_id', originalUser.id);
    else localStorage.removeItem('sb_orig_user_id');
  }, [user, originalUser]);

  // ----- Login flow --------------------------------------------------------
  const requestOtl = async (username: string): Promise<boolean> => {
    if (USE_REAL_AUTH) {
      // Resolve the email for the entered identifier, then go straight to the
      // password step (real password auth does not use the demo magic-link).
      const identifier = username.trim();
      let email = identifier.includes('@') ? identifier : null;
      if (!email) {
        // Resolve username -> email via a SECURITY DEFINER RPC, since RLS blocks
        // anonymous reads of profiles (see database_login_rpc.sql).
        try {
          const { data } = await supabase.rpc('email_for_username', { uname: identifier });
          email = (data as string | null) ?? null;
        } catch {
          email = null;
        }
      }
      if (!email) return false;
      setPendingUsername(identifier);
      setPendingEmail(email);
      setLoginStep('PASSWORD');
      return true;
    }

    const foundUser = MOCK_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
    if (foundUser) {
      setPendingUsername(username);
      setLoginStep('AWAIT_OTL');
      return true;
    }
    return false;
  };

  const verifyOtl = async (token: string): Promise<boolean> => {
    // Demo magic-link step (mock mode only).
    if (!USE_REAL_AUTH && token === 'valid-demo-token' && pendingUsername) {
      setLoginStep('PASSWORD');
      return true;
    }
    return false;
  };

  const completeLogin = async (password: string): Promise<boolean> => {
    if (USE_REAL_AUTH) {
      if (!pendingEmail) return false;
      const { data, error } = await supabase.auth.signInWithPassword({
        email: pendingEmail,
        password,
      });
      if (error || !data.user) {
        console.warn('[Auth] Sign-in failed:', error?.message);
        return false;
      }
      const profile = await loadProfile(data.user.id);
      if (profile) setUser(profile);
      setLoginStep('IDENTIFY');
      setPendingUsername(null);
      setPendingEmail(null);
      return true;
    }

    const foundUser = MOCK_USERS.find((u) => u.username === pendingUsername);
    if (foundUser && password === 'password123') {
      setUser(foundUser);
      setLoginStep('IDENTIFY');
      setPendingUsername(null);
      return true;
    }
    return false;
  };

  const logout = () => {
    if (USE_REAL_AUTH) supabase.auth.signOut();
    setUser(null);
    setOriginalUser(null);
    localStorage.removeItem('sb_user_id');
    localStorage.removeItem('sb_orig_user_id');
    window.location.href = '/';
  };

  const resetPasswordRequest = async (username: string) => {
    if (USE_REAL_AUTH && username.includes('@')) {
      await supabase.auth.resetPasswordForEmail(username);
      return;
    }
    console.log('Reset requested', username);
  };
  const adminResetPassword = async (_userId: string) => {
    return 'temp-123';
  };

  // ----- Demo admin tooling (impersonation / role switch) ------------------
  // These remain mock-driven; in a real deployment they would call privileged
  // server-side admin APIs.
  const switchRole = (newRole: UserRole) => {
    const mockUser = MOCK_USERS.find((u) => u.role === newRole);
    if (mockUser) {
      setUser(mockUser);
      setOriginalUser(null);
    }
  };

  const impersonateUser = (userId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
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

  if (isLoading) return null; // Prevent flash of unauthenticated content

  return (
    <AuthContext.Provider
      value={{
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
        stopImpersonation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
