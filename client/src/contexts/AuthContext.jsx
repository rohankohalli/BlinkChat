import React, { createContext, useContext, useState, useEffect } from 'react';
import userService from '../services/user.service';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to restore session on load
    const loadUser = async () => {
      const token = localStorage.getItem('blink_token');
      if (token) {
        try {
          const res = await userService.getMe();
          setUser(res.data.user);
        } catch (err) {
          console.error("Session expired or invalid");
          localStorage.removeItem('blink_token');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('blink_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    localStorage.setItem('blink_token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('blink_token');
    setUser(null);
  };

  const forgotPassword = async (email) => {
    return await api.post('/auth/forgot-password', { email });
  };

  const resetPassword = async (token, password) => {
    return await api.post('/auth/reset-password', { token, password });
  };

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff' }}>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
