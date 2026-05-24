import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    outline: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: ${({ theme }) => theme.colors.bgColor};
    color: ${({ theme }) => theme.colors.text.light.medium};
    transition: background 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  body, input, button, textarea, select {
    font: 400 14px/1.6 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  }

  code, pre, .mono {
    font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;
  }

  *:focus {
    outline: 0;
  }

  a {
    text-decoration: none;
    color: ${({ theme }) => theme.colors.primary.light};
    transition: color 0.2s ease;
  }

  a:hover {
    color: ${({ theme }) => theme.colors.primary.lightest};
  }

  ul {
    list-style: none;
  }

  button {
    cursor: pointer;
    border: none;
    background: none;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border.strong};
    border-radius: 8px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${({ theme }) => theme.colors.text.light.faint};
  }

  /* Selection */
  ::selection {
    background: ${({ theme }) => theme.colors.primary.main};
    color: white;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInDown {
    from { opacity: 0; transform: translateY(-16px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(24px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-24px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.1); }
    50% { box-shadow: 0 0 40px rgba(124, 58, 237, 0.25); }
  }

  @keyframes meshMove {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
    100% { transform: translate(0, 0) rotate(360deg); }
  }

  /* Page transition wrapper */
  .page-enter {
    opacity: 0;
    transform: translateY(12px);
  }
  .page-enter-active {
    opacity: 1;
    transform: translateY(0);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Tooltip base */
  [data-tooltip] {
    position: relative;
  }
  [data-tooltip]::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.9);
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.text.light.pure};
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 12px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    border: 1px solid ${({ theme }) => theme.colors.border.subtle};
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  }
  [data-tooltip]:hover::after {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
`;
