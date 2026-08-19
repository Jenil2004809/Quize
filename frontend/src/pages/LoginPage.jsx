import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { authStart, authSuccess, authFailure } from '../redux/authSlice';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaLock, FaSignInAlt, FaExclamationTriangle, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Loader from '../components/Loader';
import PageTransition from '../components/PageTransition';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    dispatch(authStart());

    try {
      const res = await api.post('/auth/login', {
        email: identifier.trim(),
        identifier: identifier.trim(),
        password
      });

      if (res.data.success) {
        dispatch(authSuccess({
          token: res.data.token,
          user: res.data.user
        }));

        Swal.fire({
          title: 'Welcome Back! 🎉',
          text: `Logged in successfully as ${res.data.user.name}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // Role-based redirection: Student -> /student-dashboard, Teacher -> /teacher-dashboard, Admin -> /admin-dashboard
        const role = res.data.user.role;
        navigate(`/${role}-dashboard`);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid credentials. Please check your email/mobile or password.';
      setErrorMessage(msg);
      dispatch(authFailure(msg));
      Swal.fire({
        title: 'Login Failed',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-md mx-auto my-12 px-4 text-left">
      <div className="glass-card rounded-3xl p-8 space-y-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-1 animate-pulse">
            <FaShieldAlt className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Welcome to Quizzy
          </h1>
          <p className="text-slate-400 text-xs">
            Enter your credentials to access your student or teacher dashboard
          </p>
        </div>

        {/* Quick Demo Login Pills */}
        <div className="space-y-2 pt-1">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Quick Demo Login Shortcuts:</p>
          <div className="flex flex-wrap gap-2 justify-center text-xs">
            <button
              type="button"
              onClick={() => {
                setIdentifier('admin@quizsystem.com');
                setPassword('Admin@123');
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold transition-all"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier('student@quiz.com');
                setPassword('Password@123');
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 font-bold transition-all"
            >
              🎓 Student Demo
            </button>
            <button
              type="button"
              onClick={() => {
                setIdentifier('teacher@quiz.com');
                setPassword('Password@123');
              }}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 font-bold transition-all"
            >
              👨‍🏫 Teacher Demo
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <Loader message="Signing in..." />
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Mobile Input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-slate-400">Email or Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaUser className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. john@quiz.com or 9876543210"
                  className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Password Input with Password Visibility Toggle Button */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase text-slate-400">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-blue-500 hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <FaLock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !identifier.trim() || !password}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center space-x-2 transition-all hover-scale shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <FaSignInAlt />
              <span>Log In</span>
            </button>
          </form>
        )}

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-850">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline font-bold">Register now</Link>
          </p>
        </div>

      </div>
    </PageTransition>
  );
};

export default LoginPage;
