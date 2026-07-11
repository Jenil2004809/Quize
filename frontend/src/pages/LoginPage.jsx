import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { authStart, authSuccess, authFailure } from '../redux/authSlice';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaLock, FaEnvelope, FaSignInAlt } from 'react-icons/fa';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(authStart());
    try {
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });

      if (res.data.success) {
        dispatch(authSuccess({
          token: res.data.token,
          user: res.data.user
        }));

        Swal.fire({
          title: 'Welcome Back! 👋',
          text: `Logged in as ${res.data.user.name}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        // Redirect based on role
        const role = res.data.user.role;
        navigate(`/${role}-dashboard`);
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      dispatch(authFailure(msg));
      Swal.fire({
        title: 'Authentication Failed',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass-card rounded-3xl p-8 space-y-6 text-left">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Email field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaEnvelope className="w-4 h-4" /></span>
              <input
                type="email"
                {...register('email', { required: 'Email address is required' })}
                placeholder="john@example.com"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase text-slate-400">Password</label>
              <Link to="/forgot-password" className="text-xs text-blue-500 hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaLock className="w-4 h-4" /></span>
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors disabled:bg-blue-500/50"
          >
            <FaSignInAlt />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline font-semibold">Register now</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
