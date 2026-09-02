import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import AcceptInvitation from '../pages/AcceptInvitation';
import UserManagement from '../pages/UserManagement';
import Dashboard from '../pages/Dashboard';
import Leads from '../pages/Leads';
import CreateLead from '../pages/leads/CreateLead';
import LeadDetails from '../pages/leads/LeadDetails';
import EditLead from '../pages/leads/EditLead';
import Pipeline from '../pages/Pipeline';
import Analytics from '../pages/Analytics';
import Campaigns from '../pages/Campaigns';
import Settings from '../pages/Settings';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import ProtectedRoute from './ProtectedRoute';

// Admin Panel Dedicated Imports
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminLeads from '../pages/admin/AdminLeads';
import AdminPipeline from '../pages/admin/AdminPipeline';
import AdminMlCenter from '../pages/admin/AdminMlCenter';
import AdminDatasets from '../pages/admin/AdminDatasets';
import AdminAnalytics from '../pages/admin/AdminAnalytics';
import AdminNotifications from '../pages/admin/AdminNotifications';
import AdminEmailTemplates from '../pages/admin/AdminEmailTemplates';
import AdminAuditLogs from '../pages/admin/AdminAuditLogs';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminProfile from '../pages/admin/AdminProfile';

// Manager Dedicated Imports
import AiLeadAssignment from '../pages/manager/AiLeadAssignment';
import AtRiskLeads from '../pages/manager/AtRiskLeads';
import ManagerGoals from '../pages/manager/ManagerGoals';
import RevenueForecast from '../pages/manager/RevenueForecast';
import ManagerReports from '../pages/manager/ManagerReports';

// Sales Representative Dedicated Imports
import SalesRepDashboard from '../pages/sales-rep/SalesRepDashboard';
import SalesRepLeads from '../pages/sales-rep/SalesRepLeads';
import SalesRepPriorityLeads from '../pages/sales-rep/SalesRepPriorityLeads';
import SalesRepLeadDetails from '../pages/sales-rep/SalesRepLeadDetails';
import SalesRepActivities from '../pages/sales-rep/SalesRepActivities';
import SalesRepFollowUps from '../pages/sales-rep/SalesRepFollowUps';
import SalesRepPipeline from '../pages/sales-rep/SalesRepPipeline';
import SalesRepEmailCenter from '../pages/sales-rep/SalesRepEmailCenter';
import SalesRepAnalytics from '../pages/sales-rep/SalesRepAnalytics';
import SalesRepGoals from '../pages/sales-rep/SalesRepGoals';
import SalesRepNotifications from '../pages/sales-rep/SalesRepNotifications';
import SalesRepProfile from '../pages/sales-rep/SalesRepProfile';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/accept-invitation" element={<AcceptInvitation />} />

      {/* Admin Panel Routes (Protected strictly for ADMIN role) */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/leads"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/pipeline"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ml"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminMlCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ml/training"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminMlCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ml/feature-importance"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminMlCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/ml/predictions"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminMlCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/datasets"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDatasets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/notifications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/email-templates"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminEmailTemplates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminAuditLogs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminProfile />
          </ProtectedRoute>
        }
      />

      {/* Role-Specific Dashboards */}
      <Route
        path="/manager/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Manager Dedicated Feature Routes */}
      <Route
        path="/manager/ai-assignment"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <AiLeadAssignment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/at-risk-leads"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <AtRiskLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/goals"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <ManagerGoals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/revenue-forecast"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <RevenueForecast />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/reports"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <ManagerReports />
          </ProtectedRoute>
        }
      />
      {/* Sales Representative Dedicated Routes */}
      <Route
        path="/sales-rep/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/leads"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/leads/:id"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepLeadDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/priority-leads"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepPriorityLeads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/activities"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepActivities />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/follow-ups"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepFollowUps />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/pipeline"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepPipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/emails"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepEmailCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/analytics"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepAnalytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/goals"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepGoals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/notifications"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepNotifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales-rep/profile"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER', 'SALES_REP']}>
            <SalesRepProfile />
          </ProtectedRoute>
        }
      />

      {/* Default Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* User Management */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'SALES_MANAGER']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* CRM Operational Routes */}
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/new"
        element={
          <ProtectedRoute>
            <CreateLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/:id"
        element={
          <ProtectedRoute>
            <LeadDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leads/:id/edit"
        element={
          <ProtectedRoute>
            <EditLead />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pipeline"
        element={
          <ProtectedRoute>
            <Pipeline />
          </ProtectedRoute>
        }
      />
      <Route
        path="/activities"
        element={
          <ProtectedRoute>
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Campaigns />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
