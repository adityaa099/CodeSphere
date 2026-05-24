import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { darkColors, lightColors } from '../assets/styles/variables/colors';
import metrics from '../assets/styles/variables/metrics';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Persist mode in localStorage
  const [mode, setMode] = useState(() => {
    const saved = localStorage.getItem('codesphere_theme');
    return saved || 'dark';
  });

  const colors = mode === 'dark' ? darkColors : lightColors;

  const theme = {
    colors,
    metrics,
    mode,
  };

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('codesphere_theme', next);
      return next;
    });
  }, []);

  const isDark = mode === 'dark';

  // Apply to document for any CSS that needs it
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, toggleTheme }}>
      <StyledThemeProvider theme={theme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
