import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../redux/authSlice';
import api, { ASSET_BASE_URL } from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaLock, FaCamera, FaEnvelope, FaTrashAlt, FaEye, FaEyeSlash, FaPhoneAlt } from 'react-icons/fa';

const ProfilePage = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Profile Avatar Upload Handler
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        dispatch(updateProfileSuccess(res.data.user));
        Swal.fire({ title: 'Avatar Updated!', text: 'Your profile picture has been changed.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Upload Failed', text: err.response?.data?.message || 'File size exceeds limit or format is not supported.', icon: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Name & Mobile Phone Update Handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { name, phone });
      if (res.data.success) {
        dispatch(updateProfileSuccess(res.data.user));
        Swal.fire({ title: 'Profile Saved!', text: 'Your profile details have been updated.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error Saving', text: err.response?.data?.message || 'Could not update profile details.', icon: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Password Modification Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return Swal.fire({ title: 'Mismatched Passwords', text: 'New password and confirm password fields must match.', icon: 'warning' });
    }
    if (passwordData.newPassword.length < 6) {
      return Swal.fire({ title: 'Weak Password', text: 'New password must be at least 6 characters long.', icon: 'warning' });
    }

    setPasswordLoading(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (res.data.success) {
        Swal.fire({ title: 'Password Modified!', text: res.data.message || 'Your login credentials have been changed.', icon: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error Modifying', text: err.response?.data?.message || 'Current password is incorrect.', icon: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      <div>
        <h1 className="text-3xl font-black">Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile details and authentication passwords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Avatar display */}
        <div className="md:col-span-1 glass-card rounded-3xl p-6 text-center flex flex-col items-center justify-center space-y-4">
          <div className="relative group">
            <img
              src={user?.avatar ? `${ASSET_BASE_URL}${user.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-2 border-blue-500 object-cover"
            />
            <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-colors hover-scale">
              <FaCamera className="w-4 h-4" />
              <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
            </label>
          </div>

          <div>
            <h3 className="font-bold text-lg">{user?.name}</h3>
            <span className="inline-block text-[10px] bg-blue-500/10 text-blue-500 font-bold px-2 py-0.5 rounded uppercase tracking-wider mt-1">
              {user?.role}
            </span>
          </div>

          <p className="text-xs text-slate-400">Accepted formats: JPEG, PNG, WEBP. Max size: 5MB.</p>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Name Form */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <FaUser className="text-blue-500" />
              <span>Personal Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address (Non-editable)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaEnvelope className="w-4 h-4" /></span>
                  <input
                    type="email"
                    disabled
                    value={user?.email || ''}
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full text-sm px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Mobile Number (For Mobile OTP Verification)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FaPhoneAlt className="w-4 h-4" /></span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full text-sm pl-10 pr-4 py-3 rounded-xl border border-slate-350 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:bg-blue-500/50 hover-scale"
              >
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
              <FaLock className="text-indigo-500" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full text-sm pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showCurrentPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-sm pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showNewPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full text-sm pl-4 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors disabled:bg-indigo-500/50 hover-scale"
              >
                {passwordLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
