import React, { createContext, useContext, useState, useCallback } from 'react';
import { adminAuthApi } from '../api/adminEndpoints';

// Founder ruling W-2 (2026-09-02): a separate provider/token space from
// AuthContext (Company Console) — deliberately not a generalization of
// it, so an Admin session and a Company session can coexist in the same
// browser (e.g. one tab testing Company Console, another the Admin
// Control Center) without either clobbering the other.
interface AdminAuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('adminAccessToken'),
  );

  const login = useCallback(async (email: string, password: string) => {
    const result = await adminAuthApi.login(email, password);
    localStorage.setItem('adminAccessToken', result.accessToken);
    localStorage.setItem('adminRefreshToken', result.refreshToken);
    setAccessToken(result.accessToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('adminAccessToken');
    localStorage.removeItem('adminRefreshToken');
    setAccessToken(null);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ accessToken, isAuthenticated: !!accessToken, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be inside AdminAuthProvider');
  return ctx;
}
