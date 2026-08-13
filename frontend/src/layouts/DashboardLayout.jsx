import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { ASSET_BASE_URL } from '../services/api';
import {
  FaTrophy, FaAward, FaHistory, FaBookmark, FaCog, FaUser, FaSignOutAlt,
  FaPlusCircle, FaFolderOpen, FaChartPie, FaCheckDouble, FaUsers,
  FaComments, FaBars, FaTimes, FaHome, FaGamepad, FaDatabase, FaArrowLeft, FaShieldAlt, FaMagic
} from 'react-icons/fa';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Define sidebar navigation link lists dynamically based on role
  const getSidebarLinks = () => {
    switch (user?.role) {
      case 'student':
        return [
          { to: '/student-dashboard', label: 'Overview', icon: <FaChartPie /> },
          { to: '/quizzes', label: 'Explore Quizzes', icon: <FaGamepad /> },
          { to: '/student-dashboard/history', label: 'Quiz History', icon: <FaHistory /> },
          { to: '/student-dashboard/certificates', label: 'My Certificates', icon: <FaAward /> },
          { to: '/student-dashboard/bookmarks', label: 'Bookmarked', icon: <FaBookmark /> },
          { to: '/student-dashboard/leaderboard', label: 'Leaderboard', icon: <FaTrophy /> },
          { to: '/student-dashboard/profile', label: 'My Profile', icon: <FaUser /> }
        ];
      case 'teacher':
        return [
          { to: '/teacher-dashboard', label: 'Overview', icon: <FaChartPie /> },
          { to: '/teacher-dashboard/smart-scan', label: '⚡ AI Scan-to-Quiz', icon: <FaMagic /> },
          { to: '/teacher-dashboard/quizzes', label: 'Manage Quizzes', icon: <FaFolderOpen /> },
          { to: '/teacher-dashboard/categories', label: 'Categories', icon: <FaPlusCircle /> },
          { to: '/teacher-dashboard/attempts', label: 'Student Attempts', icon: <FaCheckDouble /> },
          { to: '/teacher-dashboard/profile', label: 'My Profile', icon: <FaUser /> }
        ];
      case 'admin':
        return [
          { to: '/admin-dashboard', label: 'Overview', icon: <FaChartPie /> },
          { to: '/admin-dashboard/smart-scan', label: '⚡ AI Scan-to-Quiz', icon: <FaMagic /> },
          { to: '/admin-dashboard/policy-violations', label: 'Policy Violations', icon: <FaShieldAlt /> },
          { to: '/admin-dashboard/users', label: 'Manage Users', icon: <FaUsers /> },
          { to: '/admin-dashboard/categories', label: 'Categories', icon: <FaPlusCircle /> },
          { to: '/admin-dashboard/database', label: 'Database', icon: <FaDatabase /> },
          { to: '/admin-dashboard/messages', label: 'Contact Messages', icon: <FaComments /> },
          { to: '/admin-dashboard/settings', label: 'System Settings', icon: <FaCog /> }
        ];
      default:
        return [];
    }
  };

  const links = getSidebarLinks();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Mobile Top Navigation Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-3 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
            QUIZZY
          </span>
          <span className="text-[9px] uppercase bg-blue-500/10 text-blue-500 font-bold px-1.5 py-0.5 rounded">
            {user?.role}
          </span>
        </Link>

        <div className="flex items-center space-x-3">
          <img
            src={user?.avatar ? `${ASSET_BASE_URL}${user.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
            alt="Avatar"
            className="w-8 h-8 rounded-full border border-blue-500 object-cover"
          />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-none"
            aria-label="Toggle Navigation Drawer"
          >
            {sidebarOpen ? <FaTimes className="w-5 h-5 text-red-500" /> : <FaBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-45 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 glass-sidebar p-5 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2 px-2">
            <span className="text-xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
              QUIZZY
            </span>
            <span className="text-[10px] uppercase bg-blue-500/10 text-blue-500 font-bold px-1.5 py-0.5 rounded">
              Portal
            </span>
          </Link>

          {/* User Profile Summary */}
          <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center space-x-3 text-left">
            <img
              src={user?.avatar ? `${ASSET_BASE_URL}${user.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
              alt="Avatar"
              className="w-10 h-10 rounded-full border border-blue-500 object-cover"
            />
            <div className="overflow-hidden">
              <h4 className="text-sm font-bold truncate">{user?.name}</h4>
              <span className="text-[10px] text-slate-400 capitalize font-medium">{user?.role}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-left">
            {links.map((link, i) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={i}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-blue-500'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Action Footer */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800 text-left">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            <FaHome className="text-lg" />
            <span>Go to Website</span>
          </Link>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <FaSignOutAlt className="text-lg" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 relative">
        {/* Top Header Bar with Back to Main Page Link */}
        <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl transition-all hover-scale shadow-sm"
          >
            <FaArrowLeft className="w-3 h-3 text-blue-500" />
            <span>Back to Main Page</span>
          </Link>
          <div className="text-xs text-slate-400 font-semibold capitalize hidden sm:block">
            Portal Access: <span className="text-blue-500 font-bold uppercase">{user?.role}</span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
