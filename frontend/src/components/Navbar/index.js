import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiCode, FiLogOut, FiMenu, FiX, FiActivity, FiBookOpen } from 'react-icons/fi';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Header = styled.header`
  height: 70px;
  background: ${({ theme }) => theme.colors.bgCard};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.metrics.paddingHorizontal};
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: ${({ theme }) => theme.metrics.shadow.small};
  backdrop-filter: blur(12px);
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.light.pure};
  text-decoration: none;
  letter-spacing: -0.5px;
  
  svg {
    color: ${({ theme }) => theme.colors.primary.main};
    font-size: 24px;
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
  gap: 8px;

  @media (max-width: ${({ theme }) => theme.metrics.breakpoints.tablet}) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme, active }) => active ? theme.colors.text.light.pure : theme.colors.text.light.medium};
  font-size: 14px;
  font-weight: 500;
  transition: ${({ theme }) => theme.metrics.transition.fast};
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  background: ${({ active, theme }) => active ? theme.colors.bgElevated : 'transparent'};
  position: relative;

  &:hover {
    color: ${({ theme }) => theme.colors.text.light.pure};
    background: ${({ theme }) => theme.colors.bgElevated};
  }

  svg {
    font-size: 16px;
  }
`;

const Divider = styled.div`
  width: 1px;
  height: 28px;
  background: ${({ theme }) => theme.colors.border.subtle};
  margin: 0 8px;
`;

const PrimaryButton = styled(Link)`
  background: ${({ theme }) => theme.colors.primary.gradient};
  color: ${({ theme }) => theme.colors.text.light.pure};
  border: none;
  padding: 8px 20px;
  border-radius: ${({ theme }) => theme.metrics.radius.medium};
  font-weight: 600;
  font-size: 14px;
  transition: ${({ theme }) => theme.metrics.transition.fast};
  box-shadow: ${({ theme }) => theme.metrics.shadow.glow};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.metrics.shadow.large};
    color: ${({ theme }) => theme.colors.text.light.pure};
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.darkest};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.primary.lightest};
  font-weight: 700;
  font-size: 14px;
  border: 2px solid ${({ theme }) => theme.colors.primary.main};
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    box-shadow: 0 0 12px ${({ theme }) => theme.colors.primary.glow};
  }
`;

const LogoutBtn = styled.button`
  color: ${({ theme }) => theme.colors.text.light.little};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: ${({ theme }) => theme.metrics.transition.fast};
  padding: 6px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};

  &:hover {
    color: ${({ theme }) => theme.colors.auxiliar.danger};
    background: ${({ theme }) => theme.colors.auxiliar.dangerGlow};
  }
`;

/* ─── Mobile Menu ───────────────────────────────────────────── */
const MobileToggle = styled.button`
  display: none;
  font-size: 24px;
  color: ${({ theme }) => theme.colors.text.light.pure};
  padding: 4px;

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
    top: 70px;
    left: 0;
    right: 0;
    background: ${({ theme }) => theme.colors.bgCard};
    border-bottom: 1px solid ${({ theme }) => theme.colors.border.subtle};
    flex-direction: column;
    padding: 16px ${({ theme }) => theme.metrics.paddingHorizontal};
    gap: 4px;
    animation: ${slideDown} 0.2s ease-out;
    box-shadow: ${({ theme }) => theme.metrics.shadow.large};
    z-index: 99;
  }
`;

const MobileNavLink = styled(Link)`
  color: ${({ theme, active }) => active ? theme.colors.text.light.pure : theme.colors.text.light.medium};
  font-size: 15px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  display: flex;
  align-items: center;
  gap: 10px;
  transition: ${({ theme }) => theme.metrics.transition.fast};
  background: ${({ active, theme }) => active ? theme.colors.bgElevated : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.text.light.pure};
  }
`;

const MobileLogout = styled.button`
  color: ${({ theme }) => theme.colors.auxiliar.danger};
  font-size: 15px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.metrics.radius.small};
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: left;
  transition: ${({ theme }) => theme.metrics.transition.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.auxiliar.dangerGlow};
  }
`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
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
        <NavLink to="/editor" active={isActive('/editor') ? 1 : 0}>
          <FiCode /> Editor
        </NavLink>
        {isAuthenticated && (
          <>
            <NavLink to="/dashboard" active={isActive('/dashboard') ? 1 : 0}>
              Dashboard
            </NavLink>
            <NavLink to="/snippets" active={isActive('/snippets') ? 1 : 0}>
              <FiBookOpen /> Snippets
            </NavLink>
            <NavLink to="/history" active={isActive('/history') ? 1 : 0}>
              <FiActivity /> History
            </NavLink>
          </>
        )}
        
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
            <NavLink to="/login" active={isActive('/login') ? 1 : 0}>Sign In</NavLink>
            <PrimaryButton to="/register">Get Started</PrimaryButton>
          </>
        )}
      </Nav>

      {/* Mobile Toggle */}
      <MobileToggle onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <FiX /> : <FiMenu />}
      </MobileToggle>

      {/* Mobile Menu */}
      <MobileMenu open={mobileOpen}>
        <MobileNavLink to="/editor" active={isActive('/editor') ? 1 : 0} onClick={closeMobile}>
          <FiCode /> Editor
        </MobileNavLink>
        {isAuthenticated && (
          <>
            <MobileNavLink to="/dashboard" active={isActive('/dashboard') ? 1 : 0} onClick={closeMobile}>
              Dashboard
            </MobileNavLink>
            <MobileNavLink to="/snippets" active={isActive('/snippets') ? 1 : 0} onClick={closeMobile}>
              <FiBookOpen /> Snippets
            </MobileNavLink>
            <MobileNavLink to="/history" active={isActive('/history') ? 1 : 0} onClick={closeMobile}>
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
      </MobileMenu>
    </Header>
  );
}
