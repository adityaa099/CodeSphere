// ─── Dark Theme ──────────────────────────────────────────────
const darkColors = {
  // Base backgrounds
  bgColor: '#07070d',
  bgSecondary: '#0e0e18',
  bgTertiary: '#161628',
  bgCard: '#111122',
  bgElevated: '#1a1a34',
  bgInput: '#0b0b16',
  bgOverlay: 'rgba(0, 0, 0, 0.75)',

  // Glass effect
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.07)',
  glassHover: 'rgba(255, 255, 255, 0.06)',
  glassSolid: 'rgba(14, 14, 24, 0.85)',

  // Primary - Electric violet/blue
  primary: {
    lightest: '#c4b5fd',
    light: '#a78bfa',
    main: '#7c3aed',
    dark: '#6d28d9',
    darkest: '#4c1d95',
    glow: 'rgba(124, 58, 237, 0.3)',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
  },

  // Secondary - Cyan/Teal
  secondary: {
    lightest: '#a7f3d0',
    light: '#6ee7b7',
    main: '#10b981',
    dark: '#059669',
    darkest: '#064e3b',
    glow: 'rgba(16, 185, 129, 0.3)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },

  // Accent - Hot pink
  accent: {
    light: '#f9a8d4',
    main: '#ec4899',
    dark: '#be185d',
    glow: 'rgba(236, 72, 153, 0.3)',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  },

  // Status
  auxiliar: {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    infoGlow: 'rgba(59, 130, 246, 0.2)',
    successGlow: 'rgba(16, 185, 129, 0.2)',
    warningGlow: 'rgba(245, 158, 11, 0.2)',
    dangerGlow: 'rgba(239, 68, 68, 0.2)',
  },

  // Text
  text: {
    dark: {
      little: '#666',
      medium: '#333',
      very: '#111',
    },
    light: {
      faint: '#44446a',
      little: '#8080a8',
      medium: '#a8a8cc',
      very: '#dcdcf0',
      pure: '#f0f0ff',
    },
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.05)',
    default: 'rgba(255, 255, 255, 0.09)',
    strong: 'rgba(255, 255, 255, 0.14)',
    focus: 'rgba(124, 58, 237, 0.5)',
  },

  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, #07070d 0%, #161638 50%, #07070d 100%)',
    card: 'linear-gradient(145deg, rgba(17, 17, 34, 0.9) 0%, rgba(7, 7, 13, 0.95) 100%)',
    shine: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)',
    warmGlow: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 50%, #3b82f6 100%)',
    sidebar: 'linear-gradient(180deg, #0e0e18 0%, #07070d 100%)',
    mesh: 'radial-gradient(at 30% 20%, rgba(124,58,237,0.12) 0%, transparent 50%), radial-gradient(at 70% 60%, rgba(59,130,246,0.08) 0%, transparent 50%), radial-gradient(at 50% 80%, rgba(236,72,153,0.06) 0%, transparent 50%)',
  },
};

// ─── Light Theme ─────────────────────────────────────────────
const lightColors = {
  // Base backgrounds
  bgColor: '#f4f4f9',
  bgSecondary: '#eaeaf2',
  bgTertiary: '#e0e0ed',
  bgCard: '#ffffff',
  bgElevated: '#f8f8fc',
  bgInput: '#ffffff',
  bgOverlay: 'rgba(0, 0, 0, 0.4)',

  // Glass effect
  glass: 'rgba(255, 255, 255, 0.6)',
  glassBorder: 'rgba(0, 0, 0, 0.08)',
  glassHover: 'rgba(255, 255, 255, 0.8)',
  glassSolid: 'rgba(255, 255, 255, 0.92)',

  // Primary
  primary: {
    lightest: '#ede9fe',
    light: '#8b5cf6',
    main: '#7c3aed',
    dark: '#6d28d9',
    darkest: '#ede9fe',
    glow: 'rgba(124, 58, 237, 0.15)',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
  },

  // Secondary
  secondary: {
    lightest: '#d1fae5',
    light: '#34d399',
    main: '#10b981',
    dark: '#059669',
    darkest: '#d1fae5',
    glow: 'rgba(16, 185, 129, 0.15)',
    gradient: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
  },

  // Accent
  accent: {
    light: '#fbcfe8',
    main: '#ec4899',
    dark: '#be185d',
    glow: 'rgba(236, 72, 153, 0.15)',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
  },

  // Status
  auxiliar: {
    info: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    infoGlow: 'rgba(59, 130, 246, 0.1)',
    successGlow: 'rgba(16, 185, 129, 0.1)',
    warningGlow: 'rgba(245, 158, 11, 0.1)',
    dangerGlow: 'rgba(239, 68, 68, 0.1)',
  },

  // Text
  text: {
    dark: {
      little: '#94a3b8',
      medium: '#64748b',
      very: '#334155',
    },
    light: {
      faint: '#94a3b8',
      little: '#64748b',
      medium: '#475569',
      very: '#1e293b',
      pure: '#0f172a',
    },
  },

  // Borders
  border: {
    subtle: 'rgba(0, 0, 0, 0.06)',
    default: 'rgba(0, 0, 0, 0.1)',
    strong: 'rgba(0, 0, 0, 0.15)',
    focus: 'rgba(124, 58, 237, 0.4)',
  },

  // Gradients
  gradients: {
    hero: 'linear-gradient(135deg, #f4f4f9 0%, #e8e8f8 50%, #f4f4f9 100%)',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(244,244,249,0.98) 100%)',
    shine: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 50%, #06b6d4 100%)',
    warmGlow: 'linear-gradient(135deg, #ec4899 0%, #7c3aed 50%, #3b82f6 100%)',
    sidebar: 'linear-gradient(180deg, #eaeaf2 0%, #f4f4f9 100%)',
    mesh: 'radial-gradient(at 30% 20%, rgba(124,58,237,0.06) 0%, transparent 50%), radial-gradient(at 70% 60%, rgba(59,130,246,0.04) 0%, transparent 50%), radial-gradient(at 50% 80%, rgba(236,72,153,0.03) 0%, transparent 50%)',
  },
};

export { darkColors, lightColors };
export default darkColors;
