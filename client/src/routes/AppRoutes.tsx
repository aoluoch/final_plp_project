import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Layouts
import AuthLayout from '../layouts/AuthLayout'
import AdminLayout from '../layouts/AdminLayout'
import CollectorLayout from '../layouts/CollectorLayout'
import ResidentLayout from '../layouts/ResidentLayout'

// Auth Pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard'
import AdminReports from '../pages/admin/Reports'
import AdminUsers from '../pages/admin/Users'
import AdminAnalytics from '../pages/admin/Analytics'

// Collector Pages
import CollectorDashboard from '../pages/collector/Dashboard'
import TaskDetails from '../pages/collector/TaskDetails'
import CollectorChat from '../pages/collector/Chat'

// Resident Pages
import ResidentDashboard from '../pages/resident/Dashboard'
import ReportForm from '../pages/resident/ReportForm'
import PickupSchedule from '../pages/resident/PickupSchedule'
import Notifications from '../pages/resident/Notifications'
import Feed from '../pages/reports/Feed'
import ReportDetail from '../pages/reports/ReportDetail'

// Public Pages
import Home from '../pages/Home'
import NotFound from '../pages/NotFound'

// Components
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'

const AppRoutes: React.FC = () => {
  const { isAuthenticated, user } = useAuth()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      
      {/* Direct login route for convenience */}
      <Route path="/login" element={<Navigate to="/auth/login" replace />} />

      {/* Auth Routes (public only) */}
      <Route path="/auth" element={<PublicRoute><AuthLayout /></PublicRoute>}>
        <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
      </Route>

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Collector Routes */}
      <Route 
        path="/collector" 
        element={
          <ProtectedRoute requiredRole="collector">
            <CollectorLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CollectorDashboard />} />
        <Route path="tasks/:id" element={<TaskDetails />} />
        <Route path="chat" element={<CollectorChat />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Resident Routes */}
      <Route 
        path="/resident" 
        element={
          <ProtectedRoute requiredRole="resident">
            <ResidentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ResidentDashboard />} />
        <Route path="report" element={<ReportForm />} />
        <Route path="schedule" element={<PickupSchedule />} />
        <Route path="notifications" element={<Notifications />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Authenticated Reports Feed and Detail */}
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />
      <Route 
        path="/reports/:id" 
        element={
          <ProtectedRoute>
            <ReportDetail />
          </ProtectedRoute>
        }
      />

      {/* Redirect authenticated users to their dashboard */}
      <Route 
        path="/dashboard" 
        element={
          isAuthenticated && user && user.role ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
