import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../redux/authSlice';
import api from '../services/api';
import Swal from 'sweetalert2';
import { FaUnlockAlt } from 'react-icons/fa';

const OtpPage = () => {
  const { user } = useSelector(state => state.auth);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return Swal.fire({ title: 'Invalid Length', text: 'OTP must be exactly 6 digits.', icon: 'warning' });
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { otp });
      if (res.data.success) {
        // Update user state to email verified
        dispatch(updateProfileSuccess({ isEmailVerified: true }));

        Swal.fire({
          title: 'Account Activated! 🔓',
          text: res.data.message || 'Your email address is verified.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });

        // Navigate based on role
        if (res.data.user.role === 'teacher' && !res.data.user.isApproved) {
          // If teacher pending approval
          Swal.fire({
            title: 'OTP Verified',
            text: 'Your email has been verified. However, teacher accounts require administrator approval before authoring quizzes. Please check back later.',
            icon: 'info',
            confirmButtonColor: '#3b82f6'
          });
          navigate('/login');
        } else {
          navigate(`/${res.data.user.role}-dashboard`);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Verification Failed',
        text: err.response?.data?.message || 'Invalid or expired OTP. Please try again.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await api.post('/auth/resend-otp');
      if (res.data.success) {
        Swal.fire({
          title: 'OTP Sent! ✉️',
          text: res.data.message || 'A fresh code has been sent to your email.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error Resending',
        text: err.response?.data?.message || 'Failed to resend code.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 px-4">
      <div className="glass-card rounded-3xl p-8 space-y-6 text-left">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Verify Email
          </h1>
          <p className="text-slate-400 text-sm">We have sent a 6-digit OTP code to {user?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase text-slate-400 text-center">Enter Verification Code</label>
            <input
              type="text"
              maxLength="6"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456"
              className="w-full text-center text-2xl tracking-widest font-mono py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors disabled:bg-blue-500/50"
          >
            <FaUnlockAlt />
            <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
          </button>
        </form>

        <div className="flex justify-between items-center text-sm pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-blue-500 hover:underline font-semibold disabled:text-slate-400"
          >
            {resending ? 'Resending...' : 'Resend Code'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-slate-500 hover:underline"
          >
            Sign in portal
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpPage;
