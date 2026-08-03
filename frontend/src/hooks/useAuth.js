import { useSelector, useDispatch } from 'react-redux';
import { authStart, authSuccess, authFailure, logout } from '../redux/authSlice';
import authService from '../services/authService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const requestOTP = async (email) => {
    dispatch(authStart());
    try {
      const data = await authService.sendOTP(email);
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to send OTP';
      dispatch(authFailure(message));
      throw new Error(message);
    }
  };

  const confirmOTP = async (email, otp) => {
    dispatch(authStart());
    try {
      const data = await authService.verifyOTP(email, otp);
      if (data.success && data.token && data.user) {
        dispatch(authSuccess({ token: data.token, user: data.user }));
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired OTP';
      dispatch(authFailure(message));
      throw new Error(message);
    }
  };

  const loginPassword = async (email, password) => {
    dispatch(authStart());
    try {
      const data = await authService.loginWithPassword(email, password);
      if (data.success && data.token && data.user) {
        dispatch(authSuccess({ token: data.token, user: data.user }));
      }
      return data;
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      dispatch(authFailure(message));
      throw new Error(message);
    }
  };

  const handleLogout = () => {
    authService.logoutUser();
    dispatch(logout());
  };

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    role: auth.user?.role,
    loading: auth.loading,
    error: auth.error,
    requestOTP,
    confirmOTP,
    loginPassword,
    logout: handleLogout
  };
};

export default useAuth;
