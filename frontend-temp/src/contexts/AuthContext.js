import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('codesphere_token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authAPI.getMe();
      setUser(res.data.user);
    } catch (err) {
      console.error('Failed to load user:', err);
      localStorage.removeItem('codesphere_token');
      localStorage.removeItem('codesphere_user');
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('codesphere_token', newToken);
    localStorage.setItem('codesphere_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    const res = await authAPI.register({ username, email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('codesphere_token', newToken);
    localStorage.setItem('codesphere_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('codesphere_token');
    localStorage.removeItem('codesphere_user');
    setToken(null);
    setUser(null);
  };

  const updatePreferences = async (prefs) => {
    const res = await authAPI.updatePreferences(prefs);
    setUser(prev => ({ ...prev, preferences: res.data.preferences }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      updatePreferences,
      refreshUser: loadUser,
    }}>
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

export default AuthContext;
