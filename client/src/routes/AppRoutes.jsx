import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import StudentManagement from '../pages/admin/StudentManagement';
import CompanyManagement from '../pages/admin/CompanyManagement';
import JobManagement from '../pages/admin/JobManagement';
import ApplicationManagement from '../pages/admin/ApplicationManagement';
import UserManagement from '../pages/admin/UserManagement';
import PlacementReports from '../pages/admin/PlacementReports';

// Recruiter Pages
import RecruiterDashboard from '../pages/recruiter/RecruiterDashboard';
import RecruiterJobs from '../pages/recruiter/RecruiterJobs';
import CreateEditJob from '../pages/recruiter/CreateEditJob';
import RecruiterApplicants from '../pages/recruiter/RecruiterApplicants';
import CompanyProfile from '../pages/recruiter/CompanyProfile';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import AvailableJobs from '../pages/student/AvailableJobs';
import MyApplications from '../pages/student/MyApplications';
import StudentProfile from '../pages/student/StudentProfile';

// Common Pages
import Unauthorized from '../pages/common/Unauthorized';
import NotFound from '../pages/common/NotFound';

// Root redirect component
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'recruiter') return <Navigate to="/recruiter/dashboard" replace />;
  return <Navigate to="/student/dashboard" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected App Layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute roles={['admin']}>
              <AdminDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <RoleRoute roles={['admin']}>
              <StudentManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/companies"
          element={
            <RoleRoute roles={['admin']}>
              <CompanyManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/jobs"
          element={
            <RoleRoute roles={['admin']}>
              <JobManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <RoleRoute roles={['admin']}>
              <ApplicationManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <RoleRoute roles={['admin']}>
              <UserManagement />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <RoleRoute roles={['admin']}>
              <PlacementReports />
            </RoleRoute>
          }
        />

        {/* Recruiter Routes */}
        <Route
          path="/recruiter/dashboard"
          element={
            <RoleRoute roles={['recruiter']}>
              <RecruiterDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/recruiter/jobs"
          element={
            <RoleRoute roles={['recruiter']}>
              <RecruiterJobs />
            </RoleRoute>
          }
        />
        <Route
          path="/recruiter/jobs/create"
          element={
            <RoleRoute roles={['recruiter']}>
              <CreateEditJob />
            </RoleRoute>
          }
        />
        <Route
          path="/recruiter/jobs/edit/:id"
          element={
            <RoleRoute roles={['recruiter']}>
              <CreateEditJob />
            </RoleRoute>
          }
        />
        <Route
          path="/recruiter/applicants"
          element={
            <RoleRoute roles={['recruiter']}>
              <RecruiterApplicants />
            </RoleRoute>
          }
        />
        <Route
          path="/recruiter/company"
          element={
            <RoleRoute roles={['recruiter']}>
              <CompanyProfile />
            </RoleRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/student/dashboard"
          element={
            <RoleRoute roles={['student']}>
              <StudentDashboard />
            </RoleRoute>
          }
        />
        <Route
          path="/student/jobs"
          element={
            <RoleRoute roles={['student']}>
              <AvailableJobs />
            </RoleRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <RoleRoute roles={['student']}>
              <MyApplications />
            </RoleRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <RoleRoute roles={['student']}>
              <StudentProfile />
            </RoleRoute>
          }
        />
      </Route>

      {/* 404 Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
