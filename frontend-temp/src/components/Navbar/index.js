import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  FiCode, FiLogOut, FiMenu, FiX, FiActivity, FiBookOpen, 
  FiSun, FiMoon, FiChevronRight 
} from 'react-icons/fi';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Header = styled.header`
  height: 64px;
  background: ${({ theme }) => theme.colors.glassSolid};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  transition: background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: ${({ theme }) => theme.colors.primary.gradient};
    opacity: 0.15;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 19px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.light.pure};
  text-decoration: none;
  letter-spacing: -0.5px;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.02);
    color: ${({ theme }) => theme.colors.text.light.pure};
  }
  
  svg {
    color: ${({ theme }) => theme.colors.primary.main};
    font-size: 22px;
    filter: drop-shadow(0 0 8px ${({ theme }) => theme.colors.primary.glow});
  }
  
  span {
    background: ${({ theme }) => theme.colors.primary.gradient};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme, $active }) => $active ? theme.colors.text.light.pure : theme.colors.text.light.little};
  font-size: 13.5px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 10px;
  background: ${({ $active, theme }) => $active ? theme.colors.bgElevated : 'transparent'};
  position: relative;
  text-decoration: none;

  ${({ $active, theme }) => $active && css`
    color: ${theme.colors.primary.light};
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 2px;
      border-radius: 2px;
      background: ${theme.colors.primary.main};
    }
  `}

  &:hover {
    color: ${({ theme }) => theme.colors.text.light.pure};
    background: ${({ theme }) => theme.colors.bgElevated};
  }

  svg {
    font-size: 15px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border.default};
  margin: 0 8px;
`;

/* ─── Theme Toggle ──────────────────────────────────────────── */
const ToggleTrack = styled.button`
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background: ${({ theme, $isDark }) => $isDark 
    ? 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)' 
    : 'linear-gradient(135deg, #bfdbfe 0%, #93c5fd 100%)'};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  padding: 0 4px;
  flex-shrink: 0;
  overflow: hidden;

  &:hover {
    box-shadow: 0 0 16px ${({ theme, $isDark }) => $isDark 
      ? 'rgba(124, 58, 237, 0.3)' 
      : 'rgba(59, 130, 246, 0.3)'};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.97);
  }
`;

const ToggleThumb = styled.div`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${({ $isDark }) => $isDark ? '#1e1b4b' : '#fef3c7'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(${({ $isDark }) => $isDark ? '0px' : '23px'});
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  svg {
    font-size: 12px;
    color: ${({ $isDark }) => $isDark ? '#c4b5fd' : '#f59e0b'};
    transition: color 0.3s ease;
  }
`;

/* ─── Auth Buttons ──────────────────────────────────────────── */
const PrimaryButton = styled(Link)`
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: white !important;
  border: none;
  padding: 7px 18px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.25s ease;
  box-shadow: 0 0 20px ${({ theme }) => theme.colors.primary.glow};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 4px 24px ${({ theme }) => theme.colors.primary.glow};
    color: white !important;
  }

  svg { font-size: 14px; }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.primary.gradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.25s ease;
  cursor: default;
  box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.bgCard};

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 16px ${({ theme }) => theme.colors.primary.glow};
  }
`;

const LogoutBtn = styled.button`
  color: ${({ theme }) => theme.colors.text.light.little};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  transition: all 0.2s ease;
  padding: 6px;
  border-radius: 8px;

  &:hover {
    color: ${({ theme }) => theme.colors.auxiliar.danger};
    background: ${({ theme }) => theme.colors.auxiliar.dangerGlow};
    transform: scale(1.1);
  }
`;

/* ─── Mobile Menu ───────────────────────────────────────────── */
const MobileToggle = styled.button`
  display: none;
  font-size: 22px;
  color: ${({ theme }) => theme.colors.text.light.pure};
  padding: 6px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
  }

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    display: flex;
    align-items: center;
  }
`;

const MobileMenu = styled.div`
  display: none;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    display: ${({ open }) => open ? 'flex' : 'none'};
    position: absolute;
    top: 64px;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.glassSolid};
    backdrop-filter: blur(20px);
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    flex-direction: column;
    padding: 16px 24px;
    gap: 4px;
    animation: ${slideDown} 0.25s ease-out;
    box-shadow: 0 12px 40px rgba(0,0,0,0.2);
    z-index: 99;
  }
`;

const MobileNavLink = styled(Link)`
  color: ${({ theme, $active }) => $active ? theme.colors.primary.light : theme.colors.text.light.medium};
  font-size: 15px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.2s ease;
  text-decoration: none;
  background: ${({ $active, theme }) => $active ? theme.colors.bgElevated : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.text.light.pure};
    transform: translateX(4px);
  }
`;

const MobileLogout = styled.button`
  color: ${({ theme }) => theme.colors.auxiliar.danger};
  font-size: 15px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.auxiliar.dangerGlow};
  }
`;

const MobileThemeRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  color: ${({ theme }) => theme.colors.text.light.medium};
  font-size: 14px;
  border-top: 1px solid ${({ theme }) => theme.colors.border.subtle};
  margin-top: 4px;
  padding-top: 16px;
`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeMobile = () => setMobileOpen(false);

  return (
    <Header>
      <Brand to="/">
        <FiCode /> Code<span>Sphere</span>
      </Brand>

      {/* Desktop Nav */}
      <Nav>
        <NavLink to="/editor" $active={isActive('/editor')}>
          <FiCode /> Editor
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/dashboard" $active={isActive('/dashboard')}>
              Dashboard
            </NavLink>
            <NavLink to="/snippets" $active={isActive('/snippets')}>
              <FiBookOpen /> Snippets
            </NavLink>
            <NavLink to="/history" $active={isActive('/history')}>
              <FiActivity /> History
            </NavLink>
          </>
        )}
        
        <Divider />

        {/* Theme Toggle */}
        <ToggleTrack onClick={toggleTheme} $isDark={isDark} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          <ToggleThumb $isDark={isDark}>
            {isDark ? <FiMoon /> : <FiSun />}
          </ToggleThumb>
        </ToggleTrack>

        <Divider />

        {isAuthenticated ? (
          <UserMenu>
            <UserAvatar title={user?.username}>
              {user?.username?.charAt(0).toUpperCase()}
            </UserAvatar>
            <LogoutBtn onClick={logout} title="Logout">
              <FiLogOut />
            </LogoutBtn>
          </UserMenu>
        ) : (
          <>
            <NavLink to="/login" $active={isActive('/login')}>Sign In</NavLink>
            <PrimaryButton to="/register">Get Started <FiChevronRight /></PrimaryButton>
          </>
        )}
      </Nav>

      {/* Mobile Toggle */}
      <MobileToggle onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <FiX /> : <FiMenu />}
      </MobileToggle>

      {/* Mobile Menu */}
      <MobileMenu open={mobileOpen}>
        <MobileNavLink to="/editor" $active={isActive('/editor')} onClick={closeMobile}>
          <FiCode /> Editor
        </MobileNavLink>
        {isAuthenticated && (
          <>
            <MobileNavLink to="/dashboard" $active={isActive('/dashboard')} onClick={closeMobile}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/snippets" $active={isActive('/snippets')} onClick={closeMobile}>
              <FiBookOpen /> Snippets
            </MobileNavLink>
            <MobileNavLink to="/history" $active={isActive('/history')} onClick={closeMobile}>
              <FiActivity /> History
            </MobileNavLink>
          </>
        )}
        {isAuthenticated ? (
          <MobileLogout onClick={() => { logout(); closeMobile(); }}>
            <FiLogOut /> Sign Out
          </MobileLogout>
        ) : (
          <>
            <MobileNavLink to="/login" onClick={closeMobile}>Sign In</MobileNavLink>
            <MobileNavLink to="/register" onClick={closeMobile}>Get Started</MobileNavLink>
          </>
        )}
        <MobileThemeRow>
          {isDark ? 'Dark Mode' : 'Light Mode'}
          <ToggleTrack onClick={toggleTheme} $isDark={isDark}>
            <ToggleThumb $isDark={isDark}>
              {isDark ? <FiMoon /> : <FiSun />}
            </ToggleThumb>
          </ToggleTrack>
        </MobileThemeRow>
      </MobileMenu>
    </Header>
  );
}
