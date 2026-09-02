import React, { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints';

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  // Founder ruling W-1 (2026-09-02): Company Employee identity — a
  // separate endpoint/credential space from the Company owner's own
  // login above, but the resulting session is stored and used exactly
  // the same way (both resolve to the same Company-scoped Console access
  // server-side — see company-scope.util.ts on the API).
  loginEmployee: (email: string, password: string) => Promise<void>;
  // Used by EmployeeSignup.tsx — registration already returns a token pair
  // (same as login), so signup just needs to adopt it as the active
  // session rather than making a second network call.
  applyTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken'),
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setAccessToken(result.accessToken);
  }, []);

  const loginEmployee = useCallback(async (email: string, password: string) => {
    const result = await authApi.employeeLogin(email, password);
    localStorage.setItem('accessToken', result.accessToken);
    localStorage.setItem('refreshToken', result.refreshToken);
    setAccessToken(result.accessToken);
  }, []);

  const applyTokens = useCallback((newAccessToken: string, newRefreshToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    setAccessToken(newAccessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ accessToken, isAuthenticated: !!accessToken, login, loginEmployee, applyTokens, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
