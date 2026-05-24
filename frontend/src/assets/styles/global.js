import { createGlobalStyle } from 'styled-components';
import colors from './variables/colors';

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
    background: ${colors.bgColor};
    color: ${colors.text.light.medium};
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
    color: ${colors.primary.light};
    transition: color 0.2s ease;
  }

  a:hover {
    color: ${colors.primary.lightest};
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
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.bgSecondary};
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.text.light.faint};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.text.light.little};
  }

  /* Selection */
  ::selection {
    background: ${colors.primary.main};
    color: white;
  }

  /* Animations */
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(20px); }
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
`;
