import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, toggleTheme } from '../redux/authSlice';
import { FaSun, FaMoon, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaTrophy } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api, { ASSET_BASE_URL } from '../services/api';

const Navbar = () => {
  const { isAuthenticated, user, theme } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Fetch notifications if logged in
  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await api.get('/notifications');
          if (res.data.success) {
            setNotifications(res.data.notifications);
          }
        } catch (err) {
          console.error('Error fetching notifications', err);
        }
      };
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // refresh every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    dispatch(logout());
    setProfileDropdownOpen(false);
    navigate('/');
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="glass-navbar border-slate-200/50 dark:border-slate-800/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
              QUIZZY
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`text-sm font-medium hover:text-blue-500 transition-colors ${location.pathname === '/' ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}>Home</Link>
            <Link to="/about" className={`text-sm font-medium hover:text-blue-500 transition-colors ${location.pathname === '/about' ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}>About</Link>
            <Link to="/contact" className={`text-sm font-medium hover:text-blue-500 transition-colors ${location.pathname === '/contact' ? 'text-blue-500' : 'text-slate-600 dark:text-slate-300'}`}>Contact</Link>

            {isAuthenticated ? (
              <Link to={`/${user?.role}-dashboard`} className="text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 px-4 py-2 rounded-lg hover-scale shadow-lg shadow-blue-500/20">
                Dashboard
              </Link>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors px-3 py-2">Login</Link>
                <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg hover-scale shadow-md shadow-blue-600/10">Register</Link>
              </div>
            )}

            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-slate-500 hover:text-blue-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <FaSun className="w-5 h-5 text-amber-500" /> : <FaMoon className="w-5 h-5" />}
            </button>

            {/* Notification Bell */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-lg text-slate-500 hover:text-blue-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all relative"
                >
                  <FaBell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 glass-card rounded-xl p-3 z-50 text-slate-800 dark:text-slate-100 max-h-96 overflow-y-auto"
                    >
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                        <span className="font-semibold text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-blue-500 hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-4">No notifications yet.</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n._id} className={`p-2 rounded-lg text-xs transition-colors ${n.isRead ? 'bg-transparent' : 'bg-blue-500/10 border-l-2 border-blue-500'}`}>
                              <p className="font-semibold">{n.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                              <span className="text-[10px] text-slate-400 block mt-1">{new Date(n.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Profile Dropdown */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <img
                    src={user?.avatar ? `${ASSET_BASE_URL}${user.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                    alt="avatar"
                    className="w-8 h-8 rounded-full border border-blue-500 object-cover"
                  />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 glass-card rounded-xl py-2 z-50 text-slate-800 dark:text-slate-100"
                    >
                      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-semibold truncate">{user?.name}</p>
                        <span className="inline-block text-[10px] px-2 py-0.5 mt-1 rounded bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">{user?.role}</span>
                      </div>
                      <Link
                        to={`/${user?.role}-dashboard`}
                        className="flex items-center px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FaUser className="mr-2 text-slate-400" /> My Portal
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <FaSignOutAlt className="mr-2" /> Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-3">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <FaSun className="w-5 h-5 text-amber-500" /> : <FaMoon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-sidebar border-b border-slate-200/50 dark:border-slate-800/40 px-4 pt-2 pb-4 space-y-2"
          >
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200">Home</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200">About</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-200">Contact</Link>
            <hr className="border-slate-200 dark:border-slate-800" />
            {isAuthenticated ? (
              <>
                <Link to={`/${user?.role}-dashboard`} onClick={() => setMobileMenuOpen(false)} className="block py-2 text-blue-500 font-semibold">Dashboard ({user?.name})</Link>
                <button onClick={handleLogout} className="w-full text-left py-2 text-red-500 flex items-center"><FaSignOutAlt className="mr-2" /> Log Out</button>
              </>
            ) : (
              <div className="flex flex-col space-y-2 pt-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-2 text-slate-700 dark:text-slate-200 text-center font-medium">Login</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="py-2 bg-blue-600 text-white rounded-lg text-center font-semibold">Register</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
