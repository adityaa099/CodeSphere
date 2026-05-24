import React from 'react';
import { Routes as RouterRoutes, Route, Navigate } from 'react-router-dom';
import { MainLayout, PrivateRoute, PublicRoute } from '../components/Layout';

// Pages
import Welcome from '../pages/Welcome';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Dashboard from '../pages/Dashboard';
import CodeEditor from '../pages/CodeEditor';
import Snippets from '../pages/Snippets';
import History from '../pages/History';
import NotFound from '../pages/NotFound';

export default function AppRoutes() {
  return (
    <RouterRoutes>
      {/* Main Layout routes with Navbar */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Welcome />} />
        
        {/* Public only routes (if logged in, go to dashboard) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/snippets" element={<Snippets />} />
          <Route path="/history" element={<History />} />
        </Route>

        {/* The editor can be public, backend limits usage if not authenticated */}
        <Route path="/editor" element={<CodeEditor />} />

        {/* 404 */}
        <Route path="/404" element={<NotFound />} />
      </Route>

      <Route path="*" element={<Navigate to="/404" replace />} />
    </RouterRoutes>
  );
}
