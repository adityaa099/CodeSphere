import React from 'react';
import styled from 'styled-components';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../Navbar';
import Footer from '../Footer';
import LoadingSpinner from '../LoadingSpinner';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

// Pages where the footer should NOT be shown (full-height pages)
const NO_FOOTER_PAGES = ['/editor'];

export function MainLayout() {
  const location = useLocation();
  const showFooter = !NO_FOOTER_PAGES.includes(location.pathname);

  return (
    <LayoutContainer>
      <Navbar />
      <MainContent>
        <Outlet />
      </MainContent>
      {showFooter && <Footer />}
    </LayoutContainer>
  );
}

export function EditorLayout() {
  // Editor layout might not have the main navbar to save space
  return (
    <LayoutContainer>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
}

export function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Authenticating..." fullPage />;

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}

export function PublicRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner label="Loading..." fullPage />;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/dashboard" />;
}
