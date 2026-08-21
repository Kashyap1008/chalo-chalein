import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tokens = JSON.parse(localStorage.getItem('tokens'));
    if (tokens?.access) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/auth/profile/');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login/', { email, password });
    const tokens = { access: data.access, refresh: data.refresh };
    localStorage.setItem('tokens', JSON.stringify(tokens));
    await fetchProfile();
    return data;
  };

  const register = async (username, email, password, password2) => {
    const { data } = await api.post('/auth/register/', {
      username,
      email,
      password,
      password2,
    });
    localStorage.setItem('tokens', JSON.stringify(data.tokens));
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  };

  const logout = async () => {
    try {
      const tokens = JSON.parse(localStorage.getItem('tokens'));
      if (tokens?.refresh) {
        await api.post('/auth/logout/', { refresh: tokens.refresh });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('tokens');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    fetchProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
