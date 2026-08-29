import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Swal from 'sweetalert2';
import { 
  FaEnvelope, 
  FaLock, 
  FaKey, 
  FaArrowLeft, 
  FaEye, 
  FaEyeSlash, 
  FaShieldAlt,
  FaCheckCircle, 
  FaTimesCircle,
  FaRedo
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const ResetPasswordPage = () => {
  const navigate = useNavigate();

  // Workflow Steps: 1 = Email Input, 2 = 6-Digit OTP & New Password
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Focus references for 6-Digit OTP Pin Input Boxes
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Resend Countdown Timer Effect
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle OTP Box Typing & Auto-Advance Focus
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1); // Only keep single digit
    setOtpDigits(newOtp);

    // Auto-advance to next box if digit typed
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // Handle Backspace Key Navigation between OTP Boxes
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Handle Copy-Paste 6-Digit Code
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtpDigits(digits);
      otpRefs[5].current.focus();
    }
  };

  // Calculate Password Strength Score (0 to 100%)
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-slate-200 dark:bg-slate-800' };
    if (pass.length >= 6) score += 40;
    if (pass.length >= 10) score += 20;
    if (/[A-Z]/.test(pass)) score += 20;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 20;

    if (score <= 40) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score <= 80) return { score, label: 'Medium', color: 'bg-amber-500' };
    return { score, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  // Step 1: Request Password Reset Code
  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      if (res.data.success) {
        setResendTimer(45); // 45 second resend cooldown
        
        // Auto-fill OTP digit boxes if returned in response for seamless testing
        if (res.data.otpCode && res.data.otpCode.length === 6) {
          setOtpDigits(res.data.otpCode.split(''));
        }

        Swal.fire({
          title: 'Reset Code Sent! ✉️',
          text: `A 6-digit verification code has been dispatched to ${email.trim()}.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Account Not Found',
        text: err.response?.data?.message || 'No account registered with that email address.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Submit Reset Password with OTP Verification
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otpDigits.join('');

    if (otpCode.length < 6) {
      return Swal.fire({
        title: 'Incomplete Code',
        text: 'Please enter the complete 6-digit verification code.',
        icon: 'warning'
      });
    }

    if (newPassword.length < 6) {
      return Swal.fire({
        title: 'Weak Password',
        text: 'New password must be at least 6 characters long.',
        icon: 'warning'
      });
    }

    if (newPassword !== confirmPassword) {
      return Swal.fire({
        title: 'Passwords Mismatch',
        text: 'New password and confirm password fields do not match.',
        icon: 'warning'
      });
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otpCode,
        newPassword
      });

      if (res.data.success) {
        await Swal.fire({
          title: 'Password Updated! 🎉',
          text: 'Your password has been reset successfully. You can now sign in.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        navigate('/login');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Reset Failed',
        text: err.response?.data?.message || 'Invalid or expired verification code.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4 text-left">
      <div className="glass-card rounded-3xl p-8 space-y-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
        
        {/* Top Back Navigation Button */}
        <button
          onClick={() => {
            if (step === 2) setStep(1);
            else navigate('/login');
          }}
          className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
        >
          <FaArrowLeft className="w-3 h-3" />
          <span>{step === 2 ? 'Back to email request' : 'Back to sign in'}</span>
        </button>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* ──────────────── STEP 1: ENTER EMAIL ──────────────── */
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 text-blue-500 mb-1">
                  <FaShieldAlt className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                  Forgot Password?
                </h1>
                <p className="text-slate-400 text-xs leading-relaxed">
                  Enter your registered account email address. We will issue a 6-digit verification code to reset your credentials.
                </p>
              </div>

              <form onSubmit={handleRequestResetCode} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-400">Account Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                      <FaEnvelope className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-sm pl-10 pr-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center space-x-2 transition-all hover-scale shadow-lg shadow-blue-500/20 disabled:opacity-50"
                >
                  <FaKey />
                  <span>{loading ? 'Sending Code...' : 'Send Verification Code'}</span>
                </button>
              </form>
            </motion.div>
          ) : (
            /* ──────────────── STEP 2: 6-DIGIT OTP & NEW PASSWORD ──────────────── */
            <motion.div
              key="step-2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 mb-1">
                  <FaKey className="w-7 h-7" />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  Reset Password
                </h1>
                <p className="text-slate-400 text-xs">
                  Verification code dispatched for <strong className="text-slate-200">{email}</strong>
                </p>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                
                {/* Modern 6-Digit OTP Box Grid (SaaS Standard) */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold uppercase text-slate-400">6-Digit Code</label>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleRequestResetCode}
                      className="text-[11px] font-bold text-blue-500 hover:underline disabled:text-slate-500 flex items-center space-x-1 focus:outline-none"
                    >
                      <FaRedo className="w-2.5 h-2.5" />
                      <span>{resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={otpRefs[idx]}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className="w-full h-12 text-center text-xl font-black rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-indigo-500 dark:text-indigo-400"
                      />
                    ))}
                  </div>
                </div>

                {/* New Password Input */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase text-slate-400">New Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 pointer-events-none z-10">
                      <FaLock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full text-sm pl-10 pr-12 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowPassword((prev) => !prev);
                      }}
                      className="absolute right-2 p-2 text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none z-20 cursor-pointer pointer-events-auto"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash className="w-4 h-4 text-indigo-500" /> : <FaEye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {newPassword && (
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                        <span>Strength</span>
                        <span className={strength.label === 'Strong' ? 'text-emerald-500' : strength.label === 'Medium' ? 'text-amber-500' : 'text-red-500'}>
                          {strength.label}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${strength.score}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm New Password Input */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase text-slate-400">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 pointer-events-none z-10">
                      <FaLock className="w-4 h-4" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full text-sm pl-10 pr-10 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                    {confirmPassword && (
                      <span className="absolute right-3 text-slate-400">
                        {newPassword === confirmPassword ? (
                          <FaCheckCircle className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <FaTimesCircle className="w-4 h-4 text-red-500" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Reset Button */}
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length < 6 || !newPassword || newPassword !== confirmPassword}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold flex items-center justify-center space-x-2 transition-all hover-scale shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                >
                  <FaKey />
                  <span>{loading ? 'Resetting Password...' : 'Update Password'}</span>
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
