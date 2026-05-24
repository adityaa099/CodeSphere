import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import colors from '../assets/styles/variables/colors';
import metrics from '../assets/styles/variables/metrics';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  
  // Base theme structure
  const [theme, setTheme] = useState({
    colors,
    metrics,
    mode: 'dark', // Always dark for this premium look
  });

  // Apply user preferences if they exist
  useEffect(() => {
    if (user?.preferences) {
      // In a real app we might merge specific theme overrides here
      // For now, we stick to the premium dark theme
    }
  }, [user]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
