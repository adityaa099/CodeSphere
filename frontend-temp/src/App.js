import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GlobalStyles from './assets/styles/global';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import AppRoutes from './routes';

function ThemedToaster() {
  const { isDark } = useTheme();
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: {
          background: isDark ? '#16162a' : '#ffffff',
          color: isDark ? '#f0f0ff' : '#0f172a',
          border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.08)',
          minWidth: '250px',
          borderRadius: '12px',
          boxShadow: isDark 
            ? '0 8px 32px rgba(0,0,0,0.4)' 
            : '0 8px 32px rgba(0,0,0,0.08)',
          backdropFilter: 'blur(12px)',
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: isDark ? '#fff' : '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: isDark ? '#fff' : '#fff',
          },
        },
        duration: 3000,
      }}
    />
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <GlobalStyles />
          <ThemedToaster />
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
