import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
import RFQCreatePage from './pages/RFQCreatePage';
import QuotationSubmitPage from './pages/QuotationSubmitPage';
import QuotationComparePage from './pages/QuotationComparePage';
import ApprovalPage from './pages/ApprovalPage';
import POInvoicePage from './pages/POInvoicePage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import { initStorage } from './data/mockData';
import { SCREEN_ACCESS } from './data/roles';

// Route guard component with role visibility checking
function ProtectedRoute({ allowedRoles, children }: { allowedRoles: string[]; children: React.ReactNode }) {
  const isLoggedIn = localStorage.getItem('vb_logged_in') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userStr = localStorage.getItem('vb_current_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Redirect logic based on role landing page requirements
function RootRedirect() {
  const isLoggedIn = localStorage.getItem('vb_logged_in') === 'true';
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const userStr = localStorage.getItem('vb_current_user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'procurement_officer':
      return <Navigate to="/dashboard" replace />;
    case 'vendor':
      return <Navigate to="/dashboard" replace />;
    case 'manager':
      return <Navigate to="/approval" replace />; // Manager's primary screen is approvals
    case 'admin':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/dashboard" replace />;
  }
}

// Debug route to completely reset all localStorage data
function ResetData() {
  useEffect(() => {
    localStorage.clear();
    window.location.href = '/login';
  }, []);
  return null;
}

export default function App() {
  // Bootstrap the LocalStorage mock database on application load
  useEffect(() => {
    initStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Portals Routing */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/reset" element={<ResetData />} />

        {/* Protected Procurement ERP Workspaces */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.dashboard}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.vendors}>
              <VendorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfq-create"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.rfqMgmt}>
              <RFQCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation-submit"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.quotations}>
              <QuotationSubmitPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quotation-compare"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.compareQts}>
              <QuotationComparePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/approval"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.approvals}>
              <ApprovalPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/po-invoice"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.poInvoice}>
              <POInvoicePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity-logs"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.activityLogs}>
              <ActivityLogsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.reports}>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={SCREEN_ACCESS.userManagement}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* Root Fallback Redirect Rules */}
        <Route path="/" element={<RootRedirect />} />

        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
