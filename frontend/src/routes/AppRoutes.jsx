import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layouts
import DashboardLayout from '../layouts/DashboardLayout';

// Public Pages
import LandingPage from '../pages/LandingPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';
import QuizzesPage from '../pages/QuizzesPage';
import QuizDetails from '../pages/QuizDetails';

// Shared Pages
import ProfilePage from '../pages/ProfilePage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentHistory from '../pages/student/StudentHistory';
import StudentCertificates from '../pages/student/StudentCertificates';
import StudentBookmarks from '../pages/student/StudentBookmarks';
import StudentLeaderboard from '../pages/student/StudentLeaderboard';
import AttemptQuiz from '../pages/student/AttemptQuiz';
import QuizResult from '../pages/student/QuizResult';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import ManageQuizzes from '../pages/teacher/ManageQuizzes';
import ManageQuestions from '../pages/teacher/ManageQuestions';
import StudentAttempts from '../pages/teacher/StudentAttempts';
import TeacherCategories from '../pages/teacher/TeacherCategories';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ContactMessages from '../pages/admin/ContactMessages';
import AdminSettings from '../pages/admin/AdminSettings';
import DatabaseManagement from '../pages/admin/DatabaseManagement';

import PolicyViolations from '../pages/admin/PolicyViolations';

// Route Guards
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const RoleRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={`/${user?.role}-dashboard`} replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ResetPasswordPage />} />
      
      {/* Quizzes Public Browsing */}
      <Route path="/quizzes" element={<QuizzesPage />} />
      <Route path="/quizzes/:id" element={<QuizDetails />} />
      <Route path="/quiz-result/:id" element={<PrivateRoute><QuizResult /></PrivateRoute>} />

      {/* Secure Fullscreen Quiz Taking environment */}
      <Route
        path="/quizzes/:id/attempt"
        element={
          <RoleRoute allowedRoles={['student']}>
            <AttemptQuiz />
          </RoleRoute>
        }
      />

      {/* STUDENT DASHBOARD ROUTES */}
      <Route
        path="/student-dashboard"
        element={
          <RoleRoute allowedRoles={['student']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="history" element={<StudentHistory />} />
        <Route path="certificates" element={<StudentCertificates />} />
        <Route path="bookmarks" element={<StudentBookmarks />} />
        <Route path="leaderboard" element={<StudentLeaderboard />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* TEACHER DASHBOARD ROUTES */}
      <Route
        path="/teacher-dashboard"
        element={
          <RoleRoute allowedRoles={['teacher']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<TeacherDashboard />} />
        <Route path="quizzes" element={<ManageQuizzes />} />
        <Route path="quizzes/:id/questions" element={<ManageQuestions />} />
        <Route path="categories" element={<TeacherCategories />} />
        <Route path="attempts" element={<StudentAttempts />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* ADMIN DASHBOARD ROUTES */}
      <Route
        path="/admin-dashboard"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <DashboardLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="policy-violations" element={<PolicyViolations />} />
        <Route path="categories" element={<TeacherCategories />} />
        <Route path="database" element={<DatabaseManagement />} />
        <Route path="messages" element={<ContactMessages />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
