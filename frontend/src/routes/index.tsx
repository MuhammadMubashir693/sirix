import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import { LoginPage } from '../features/auth/pages/LoginPage';
import { RegisterPage } from '../features/auth/pages/RegisterPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DiagnosticsPage } from '../features/diagnostics/pages/DiagnosticsPage';
import { AdminUsersPage } from '../features/admin/pages/AdminUsersPage';
import { AdminRolesPage } from '../features/admin/pages/AdminRolesPage';
import { AdminPermissionsPage } from '../features/admin/pages/AdminPermissionsPage';
import { AdminSessionsPage } from '../features/admin/pages/AdminSessionsPage';
import { AdminSettingsPage } from '../features/admin/pages/AdminSettingsPage';
import { AdminAuditLogsPage } from '../features/admin/pages/AdminAuditLogsPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/roles" element={<AdminRolesPage />} />
          <Route path="/admin/permissions" element={<AdminPermissionsPage />} />
          <Route path="/admin/sessions" element={<AdminSessionsPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};