import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { authStart, authSuccess, authFailure } from '../redux/authSlice';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaEnvelope, FaLock, FaUserPlus, FaGraduationCap, FaChalkboardTeacher, FaEye, FaEyeSlash, FaPhoneAlt } from 'react-icons/fa';
import PageTransition from '../components/PageTransition';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'teacher' ? 'teacher' : 'student';
  
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    dispatch(authStart());
    try {
      const res = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: selectedRole
      });

      if (res.data.success) {
        dispatch(authSuccess({
          token: res.data.token,
          user: res.data.user
        }));

        if (selectedRole === 'teacher') {
          Swal.fire({
            title: 'Account Created! 🎉',
            text: 'Registration successful! Educator accounts require manual review and verification by the administrator. Please try logging in once approved.',
            icon: 'info',
            confirmButtonColor: '#3b82f6'
          });
          navigate('/login');
        } else {
          Swal.fire({
            title: 'Registration Successful! 🎉',
            text: 'Your account has been created successfully.',
            icon: 'success',
            confirmButtonColor: '#3b82f6',
            timer: 2000,
            showConfirmButton: false
          });
          navigate('/student-dashboard');
        }
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Registration failed. Try a different email address.';
      dispatch(authFailure(msg));
      Swal.fire({
        title: 'Registration Error',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="max-w-md mx-auto my-12 px-4">
      <div className="glass-card rounded-3xl p-8 space-y-6 text-left">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-slate-400 text-sm">Join Quizzy to take assessments or create exams</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-3 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setSelectedRole('student')}
            className={`py-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-semibold transition-all ${selectedRole === 'student' ? 'bg-white dark:bg-slate-800 text-blue-500 shadow-md' : 'text-slate-500'}`}
          >
            <FaGraduationCap />
            <span>Student</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedRole('teacher')}
            className={`py-3 rounded-xl flex items-center justify-center space-x-2 text-sm font-semibold transition-all ${selectedRole === 'teacher' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-md' : 'text-slate-500'}`}
          >
            <FaChalkboardTeacher />
            <span>Educator</span>
          </button>
        </div>

        {selectedRole === 'teacher' && (
          <div className="p-3 bg-amber-500/10 border-l-4 border-amber-500 rounded-lg text-xs text-amber-600 leading-relaxed">
            <strong>Important:</strong> Educator accounts require manual review and verification by the site administrator. You will be able to construct and manage quizzes once approved.
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-400">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaUser className="w-4 h-4" /></span>
              <input
                type="text"
                {...register('name', { required: 'Full name is required' })}
                placeholder="John Doe"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          {/* Email field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-400">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaEnvelope className="w-4 h-4" /></span>
              <input
                type="email"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address format' }
                })}
                placeholder="john@example.com"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
          </div>

          {/* Mobile Number field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-400">Mobile Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaPhoneAlt className="w-4 h-4" /></span>
              <input
                type="tel"
                {...register('phone', {
                  required: 'Mobile number is required'
                })}
                placeholder="+91 9876543210"
                className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {errors.phone && <span className="text-xs text-red-500">{errors.phone.message}</span>}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaLock className="w-4 h-4" /></span>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                placeholder="••••••••"
                className="w-full text-sm pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors disabled:bg-blue-500/50 hover-scale shadow-lg shadow-blue-500/20"
          >
            <FaUserPlus />
            <span>{loading ? 'Registering...' : 'Register'}</span>
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default RegisterPage;
