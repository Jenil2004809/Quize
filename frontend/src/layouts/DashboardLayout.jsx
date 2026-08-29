import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';
import { ASSET_BASE_URL } from '../services/api';
import {
  FaTrophy, FaAward, FaHistory, FaBookmark, FaCog, FaUser, FaSignOutAlt,
  FaPlusCircle, FaFolderOpen, FaChartPie, FaCheckDouble, FaUsers,
  FaComments, FaBars, FaTimes, FaHome, FaGamepad, FaDatabase, FaArrowLeft, 
  FaShieldAlt, FaMagic, FaVideo, FaChevronLeft, FaChevronRight, FaGraduationCap,
  FaLayerGroup, FaBookOpen, FaCircle
} from 'react-icons/fa';

const DashboardLayout = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Structured, categorized navigation groups tailored to role
  const getNavSections = () => {
    switch (user?.role) {
      case 'student':
        return [
          {
            title: 'ACADEMIC & EXAMS',
            items: [
              { to: '/student-dashboard', label: 'Dashboard Overview', icon: <FaChartPie /> },
              { to: '/quizzes', label: 'Explore Exams', icon: <FaGamepad />, badge: 'Live', badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
              { to: '/student-dashboard/history', label: 'Attempt History', icon: <FaHistory /> }
            ]
          },
          {
            title: 'ACHIEVEMENTS & VAULT',
            items: [
              { to: '/student-dashboard/certificates', label: 'My Certificates', icon: <FaAward />, badge: 'Award', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
              { to: '/student-dashboard/bookmarks', label: 'Bookmarked Exams', icon: <FaBookmark /> },
              { to: '/student-dashboard/leaderboard', label: 'Rank Leaderboard', icon: <FaTrophy />, badge: 'Top', badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }
            ]
          },
          {
            title: 'ACCOUNT & SETTINGS',
            items: [
              { to: '/student-dashboard/profile', label: 'Student Profile', icon: <FaUser /> }
            ]
          }
        ];

      case 'teacher':
        return [
          {
            title: 'FACULTY & AI CORE',
            items: [
              { to: '/teacher-dashboard', label: 'Faculty Overview', icon: <FaChartPie /> },
              { to: '/teacher-dashboard/smart-scan', label: 'AI Scan-to-Quiz', icon: <FaMagic />, badge: '⚡ AI', badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' }
            ]
          },
          {
            title: 'CURRICULUM MANAGEMENT',
            items: [
              { to: '/teacher-dashboard/quizzes', label: 'Manage Quizzes', icon: <FaFolderOpen /> },
              { to: '/teacher-dashboard/categories', label: 'Subject Categories', icon: <FaPlusCircle /> }
            ]
          },
          {
            title: 'SURVEILLANCE & AUDIT',
            items: [
              { to: '/teacher-dashboard/recordings', label: 'Quiz Recordings', icon: <FaVideo />, badge: '📹 Proctor', badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
              { to: '/teacher-dashboard/attempts', label: 'Student Attempts', icon: <FaCheckDouble /> }
            ]
          },
          {
            title: 'ACCOUNT & SETTINGS',
            items: [
              { to: '/teacher-dashboard/profile', label: 'Faculty Profile', icon: <FaUser /> }
            ]
          }
        ];

      case 'admin':
        return [
          {
            title: 'COMMAND & AI CORE',
            items: [
              { to: '/admin-dashboard', label: 'System Overview', icon: <FaChartPie /> },
              { to: '/admin-dashboard/smart-scan', label: 'AI Scan-to-Quiz', icon: <FaMagic />, badge: '⚡ AI', badgeColor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' }
            ]
          },
          {
            title: 'SURVEILLANCE & SECURITY',
            items: [
              { to: '/admin-dashboard/recordings', label: 'Quiz Recordings', icon: <FaVideo />, badge: '📹 Proctor', badgeColor: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
              { to: '/admin-dashboard/policy-violations', label: 'Policy Violations', icon: <FaShieldAlt />, badge: 'Audit', badgeColor: 'bg-amber-500/10 text-amber-500 border-amber-500/20' }
            ]
          },
          {
            title: 'ACADEMICS & DIRECTORY',
            items: [
              { to: '/admin-dashboard/users', label: 'User Directory', icon: <FaUsers /> },
              { to: '/admin-dashboard/categories', label: 'Subject Categories', icon: <FaPlusCircle /> }
            ]
          },
          {
            title: 'INFRASTRUCTURE & CONFIG',
            items: [
              { to: '/admin-dashboard/database', label: 'Database Center', icon: <FaDatabase />, badge: 'DB', badgeColor: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
              { to: '/admin-dashboard/messages', label: 'Contact Inquiries', icon: <FaComments /> },
              { to: '/admin-dashboard/settings', label: 'System Settings', icon: <FaCog /> }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const navSections = getNavSections();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'teacher':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300">
      
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 px-4 py-3 flex justify-between items-center shadow-sm">
        <Link to="/" className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <FaGraduationCap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              QUIZ MASTER
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2.5">
          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user?.role)}`}>
            {user?.role}
          </span>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:outline-none"
            aria-label="Toggle Navigation Drawer"
          >
            {sidebarOpen ? <FaTimes className="w-4 h-4 text-red-500" /> : <FaBars className="w-4 h-4" />}
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

      {/* Main Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 glass-sidebar flex flex-col justify-between transform transition-all duration-300 md:translate-x-0 md:static md:h-screen ${
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        } ${
          isCollapsed ? 'md:w-20 p-3' : 'w-72 p-5'
        }`}
      >
        <div className="space-y-5 overflow-hidden flex flex-col">
          
          {/* Brand Header with Collapse Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
            <Link to="/" className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 flex-shrink-0">
                <FaGraduationCap className="w-5 h-5" />
              </div>
              {!isCollapsed && (
                <div className="text-left overflow-hidden">
                  <h3 className="font-black text-sm tracking-tight text-slate-900 dark:text-white truncate">
                    QUIZ MASTER
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    University Portal
                  </p>
                </div>
              )}
            </Link>

            {/* Desktop Collapse / Expand Toggle Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-500 transition-colors"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <FaChevronRight className="w-3 h-3" /> : <FaChevronLeft className="w-3 h-3" />}
            </button>
          </div>

          {/* User Profile Card */}
          <div className={`rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 text-left transition-all ${
            isCollapsed ? 'p-2 flex justify-center' : 'p-3 flex items-center space-x-3'
          }`}>
            <div className="relative flex-shrink-0">
              <img
                src={user?.avatar ? `${ASSET_BASE_URL}${user.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                alt="Avatar"
                className="w-10 h-10 rounded-xl border border-blue-500/30 object-cover shadow-sm"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
            </div>

            {!isCollapsed && (
              <div className="overflow-hidden flex-1">
                <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                  {user?.name}
                </h4>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(user?.role)}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Categorized Navigation Container */}
          <nav className="overflow-y-auto max-h-[calc(100vh-270px)] pr-1 space-y-4 text-left custom-scrollbar">
            {navSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                {!isCollapsed && (
                  <h5 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">
                    {section.title}
                  </h5>
                )}

                <div className="space-y-1">
                  {section.items.map((item, iIdx) => {
                    const isActive = location.pathname === item.to;
                    return (
                      <Link
                        key={iIdx}
                        to={item.to}
                        onClick={() => setSidebarOpen(false)}
                        title={isCollapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-2xl text-xs font-bold transition-all ${
                          isCollapsed 
                            ? 'justify-center p-3' 
                            : 'justify-between px-3.5 py-2.5'
                        } ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-900/80 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        {/* Active Left Indicator Notch */}
                        {isActive && !isCollapsed && (
                          <span className="absolute left-1 top-2 bottom-2 w-1 rounded-full bg-white"></span>
                        )}

                        <div className="flex items-center space-x-3">
                          <span className={`text-base transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-500'}`}>
                            {item.icon}
                          </span>
                          {!isCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </div>

                        {/* Optional Feature Badge */}
                        {!isCollapsed && item.badge && (
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                            isActive ? 'bg-white/20 text-white border-white/30' : (item.badgeColor || 'bg-blue-500/10 text-blue-500 border-blue-500/20')
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Quick Actions */}
        <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-1.5 text-left">
          <Link
            to="/"
            title={isCollapsed ? 'Go to Main Website' : undefined}
            className={`flex items-center rounded-2xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-blue-500 transition-colors ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
            }`}
          >
            <FaHome className="text-sm flex-shrink-0" />
            {!isCollapsed && <span>Return to Portal</span>}
          </Link>
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors ${
              isCollapsed ? 'justify-center p-3' : 'space-x-3 px-3.5 py-2.5'
            }`}
          >
            <FaSignOutAlt className="text-sm flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Workspace Workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 relative">
        {/* Top Header Bar with Breadcrumb / Quick Back Link */}
        <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-200/60 dark:border-slate-800/60">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 dark:hover:text-blue-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-xl transition-all hover-scale shadow-sm"
          >
            <FaArrowLeft className="w-3 h-3 text-blue-500" />
            <span>Back to Portal</span>
          </Link>
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold capitalize hidden sm:flex">
            <span>Logged in as:</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${getRoleBadgeStyle(user?.role)}`}>
              {user?.role}
            </span>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
