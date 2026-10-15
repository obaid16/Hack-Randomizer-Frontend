'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.admin) {
        setAdmin(res.admin);
        setBackendOnline(true);
      } else {
        setAdmin(null);
      }
    } catch (err) {
      if (err.isOffline || err.status === 503) {
        setBackendOnline(false);
      }
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success && res.admin) {
      setAdmin(res.admin);
      setBackendOnline(true);
    }
    return res;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setAdmin(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        isAuthenticated: Boolean(admin),
        backendOnline,
        setBackendOnline,
        login,
        logout,
        refreshAdmin: checkSession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
