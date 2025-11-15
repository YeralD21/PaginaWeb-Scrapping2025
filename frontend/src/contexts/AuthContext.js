import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_BASE = 'http://localhost:8000';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar si hay token guardado al cargar la app
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
      // Verificar si el token sigue siendo válido
      verifyToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${tokenToVerify}`
        }
      });
      setUser(response.data);
      setToken(tokenToVerify);
      await fetchSubscription(tokenToVerify);
    } catch (error) {
      console.error('Token inválido:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });
      
      const { access_token, user: userData } = response.data;
      
      // Guardar token en localStorage
      localStorage.setItem('access_token', access_token);
      
      setToken(access_token);
      setUser(userData);
      await fetchSubscription(access_token);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE}/auth/register`, {
        email,
        password
      });
      
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Error al registrarse' 
      };
    }
  };

  const logout = () => {
    // Limpiar completamente el estado antes de eliminar del localStorage
    setToken(null);
    setUser(null);
    setSubscription(null);
    // Limpiar localStorage después de limpiar el estado
    localStorage.removeItem('access_token');
    // Forzar un pequeño delay para asegurar que el estado se limpia completamente
    // Esto evita problemas de timing cuando se cambia de usuario rápidamente
  };

  const isAdmin = () => {
    return user?.role === 'admin' || user?.role === 'ADMIN';
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const fetchSubscription = async (tokenValue = token) => {
    if (!tokenValue) {
      setSubscription(null);
      return;
    }
    setSubscriptionLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/subscriptions/me`, {
        headers: {
          Authorization: `Bearer ${tokenValue}`
        }
      });
      setSubscription(response.data || null);
    } catch (error) {
      console.error('Error obteniendo suscripción:', error.response?.data || error.message);
      setSubscription(null);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchSubscriptionStatus = async (tokenValue = token) => {
    if (!tokenValue) {
      return null;
    }
    try {
      const response = await axios.get(`${API_BASE}/subscriptions/status`, {
        headers: {
          Authorization: `Bearer ${tokenValue}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estado de suscripción:', error.response?.data || error.message);
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    subscription,
    subscriptionLoading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated,
    refreshSubscription: fetchSubscription,
    fetchSubscriptionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
