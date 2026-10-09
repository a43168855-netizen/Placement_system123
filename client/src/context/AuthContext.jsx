import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize and verify user on mount if token exists
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res?.data) {
            setUser(res.data.user);
            setProfile(res.data.profile);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          authService.logout();
          setUser(null);
          setProfile(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await authService.login({ email, password });
      if (res?.data) {
        const { user: loggedInUser, profile: userProfile, token: jwtToken } = res.data;
        setUser(loggedInUser);
        setProfile(userProfile);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        return loggedInUser;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await authService.register(userData);
      if (res?.data) {
        const { user: registeredUser, profile: userProfile, token: jwtToken } = res.data;
        setUser(registeredUser);
        setProfile(userProfile);
        setToken(jwtToken);
        localStorage.setItem('token', jwtToken);
        localStorage.setItem('user', JSON.stringify(registeredUser));
        return registeredUser;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
    setToken(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authService.getMe();
      if (res?.data) {
        setUser(res.data.user);
        setProfile(res.data.profile);
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        error,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
        refreshUser,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
