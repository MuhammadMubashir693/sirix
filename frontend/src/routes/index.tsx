import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';

import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ProfilePage from '../features/auth/pages/ProfilePage';
import ChangePasswordPage from '../features/auth/pages/ChangePasswordPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { DiagnosticsPage } from '../features/diagnostics/pages/DiagnosticsPage';
import { AccountingPage } from '../features/accounting/pages/AccountingPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import AdminLayout from '../features/admin/pages/AdminLayout';
import AdminUsersPage from '../features/admin/pages/AdminUsersPage';
import AdminRolesPage from '../features/admin/pages/AdminRolesPage';
import AdminPermissionsPage from '../features/admin/pages/AdminPermissionsPage';
import AdminSessionsPage from '../features/admin/pages/AdminSessionsPage';
import AdminSettingsPage from '../features/admin/pages/AdminSettingsPage';
import AdminAuditLogsPage from '../features/admin/pages/AdminAuditLogsPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route
          element={
            <AuthLayout eyebrow="Carrier Operations Platform" title="Every carrier relationship, in one signal." description="Monitor traffic, reconcile revenue, and manage vendor and customer relationships from a single, unified control plane.">
              <Outlet />
            </AuthLayout>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings/change-password" element={<ChangePasswordPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="roles" element={<AdminRolesPage />} />
            <Route path="permissions" element={<AdminPermissionsPage />} />
            <Route path="sessions" element={<AdminSessionsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
