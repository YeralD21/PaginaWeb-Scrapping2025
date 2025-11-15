import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Obtener el tema guardado en localStorage o usar 'dark' por defecto
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'dark';
  });

  // Función para actualizar CSS variables de forma eficiente (sin requestAnimationFrame para ser más rápido)
  const updateCSSVariables = (currentTheme) => {
    const root = document.documentElement;
    
    // Actualizar todas las variables CSS de forma síncrona para máxima velocidad
    if (currentTheme === 'dark') {
      root.style.setProperty('--bg-primary', '#0a0a0a');
      root.style.setProperty('--bg-secondary', '#1a1a1a');
      root.style.setProperty('--bg-tertiary', '#2a2a2a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#cccccc');
      root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.2)');
      root.style.setProperty('--header-bg', 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)');
      root.style.setProperty('--filter-bg', '#1a1a1a');
      root.style.setProperty('--card-bg', '#2a2a2a');
    } else {
      root.style.setProperty('--bg-primary', '#f8f9fa');
      root.style.setProperty('--bg-secondary', '#ffffff');
      root.style.setProperty('--bg-tertiary', '#f8f9fa');
      root.style.setProperty('--text-primary', '#000000');
      root.style.setProperty('--text-secondary', '#666666');
      root.style.setProperty('--border-color', '#e9ecef');
      root.style.setProperty('--header-bg', 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)');
      root.style.setProperty('--filter-bg', '#ffffff');
      root.style.setProperty('--card-bg', '#ffffff');
    }
    
    // Aplicar el tema al body inmediatamente
    document.body.setAttribute('data-theme', currentTheme);
  };

  // Memoizar toggleTheme para evitar recreaciones
  const toggleTheme = useCallback(() => {
    // Actualizar CSS variables ANTES de cambiar el estado para transición instantánea
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      // Actualizar CSS variables inmediatamente (síncrono)
      updateCSSVariables(newTheme);
      return newTheme;
    });
  }, []);

  // Inicializar CSS variables al montar y cuando cambie el tema
  useEffect(() => {
    updateCSSVariables(theme);
    // Guardar el tema en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const contextValue = useMemo(() => ({
    theme,
    toggleTheme
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

