import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaEnvelope, FaLock, FaKey, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPasswordPage = () => {
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onRequestOtp = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: data.email });
      if (res.data.success) {
        setEmail(data.email);
        Swal.fire({
          title: 'OTP Code Emailed! ✉️',
          text: res.data.message || 'Check your inbox for the reset code.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error Requesting',
        text: err.response?.data?.message || 'Failed to request reset OTP. Check your email.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        otp: data.otp,
        newPassword: data.newPassword
      });

      if (res.data.success) {
        Swal.fire({
          title: 'Password Updated! 🎉',
          text: res.data.message || 'You can now sign in with your new password.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Reset Failed',
        text: err.response?.data?.message || 'Invalid or expired OTP. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass-card rounded-3xl p-8 space-y-6 text-left relative overflow-hidden">
        
        {/* Back navigation button */}
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else navigate('/login');
          }}
          className="flex items-center space-x-1 text-xs text-slate-500 hover:text-blue-500 transition-colors focus:outline-none"
        >
          <FaArrowLeft />
          <span>{step === 2 ? 'Back to email request' : 'Back to login'}</span>
        </button>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Forgot Password
                </h1>
                <p className="text-slate-400 text-sm">Provide your registered email to request a reset code</p>
              </div>

              <form onSubmit={handleSubmit(onRequestOtp)} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FaKey />
                  <span>{loading ? 'Requesting OTP...' : 'Send Reset Code'}</span>
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <p className="text-slate-400 text-sm">Provide the OTP code and establish your new password</p>
              </div>

              <form onSubmit={handleSubmit(onResetPassword)} className="space-y-4">
                {/* OTP code */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">6-Digit Code</label>
                  <input
                    type="text"
                    maxLength="6"
                    {...register('otp', { required: 'OTP code is required' })}
                    placeholder="123456"
                    className="w-full text-center text-xl font-bold tracking-widest py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  {errors.otp && <span className="text-xs text-red-500">{errors.otp.message}</span>}
                </div>

                {/* New Password */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">New Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaLock className="w-4 h-4" /></span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('newPassword', {
                        required: 'New password is required',
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
                  {errors.newPassword && <span className="text-xs text-red-500">{errors.newPassword.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors"
                >
                  <FaKey />
                  <span>{loading ? 'Resetting...' : 'Update Password'}</span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
