import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfileSuccess } from '../redux/authSlice';
import api, { ASSET_BASE_URL } from '../services/api';
import Swal from 'sweetalert2';
import { FaUser, FaLock, FaCamera, FaEnvelope, FaTrashAlt, FaEye, FaEyeSlash, FaPhoneAlt, FaImage } from 'react-icons/fa';

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

  // Remove Avatar Handler
  const handleRemoveAvatar = async () => {
    const result = await Swal.fire({
      title: 'Remove Profile Picture?',
      text: 'Are you sure you want to remove your profile picture?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Remove Avatar'
    });

    if (!result.isConfirmed) return;

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { removeAvatar: true });
      if (res.data.success) {
        dispatch(updateProfileSuccess(res.data.user));
        Swal.fire({ title: 'Profile Picture Removed!', text: 'Profile picture reset to default.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Could not remove profile picture.', icon: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Profile Cover Photo Upload Handler
  const handleCoverPhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('coverPhoto', file);

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        dispatch(updateProfileSuccess(res.data.user));
        Swal.fire({ title: 'Cover Photo Updated! 🎨', text: 'Your cover banner has been saved.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Upload Failed', text: err.response?.data?.message || 'File upload failed.', icon: 'error' });
    } finally {
      setProfileLoading(false);
    }
  };

  // Remove Cover Photo Handler
  const handleRemoveCoverPhoto = async () => {
    const result = await Swal.fire({
      title: 'Remove Cover Photo?',
      text: 'Are you sure you want to remove your cover photo banner?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Remove Cover'
    });

    if (!result.isConfirmed) return;

    setProfileLoading(true);
    try {
      const res = await api.put('/auth/profile', { removeCoverPhoto: true });
      if (res.data.success) {
        dispatch(updateProfileSuccess(res.data.user));
        Swal.fire({ title: 'Cover Photo Removed! 🗑️', text: 'Cover photo reset to default.', icon: 'success', timer: 1500, showConfirmButton: false });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error', text: err.response?.data?.message || 'Could not remove cover photo.', icon: 'error' });
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
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile avatar, cover banner, and passwords.</p>
      </div>

      {/* Top Banner & Profile Overview Card */}
      <div className="glass-card rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-800/60 relative">
        {/* Cover Photo Banner */}
        <div className="h-44 sm:h-56 w-full relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 overflow-hidden">
          {user?.coverPhoto ? (
            <img
              src={`${ASSET_BASE_URL}${user.coverPhoto}`}
              alt="Cover Banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center opacity-25 text-white font-black text-2xl tracking-widest uppercase select-none">
              PROFILE BANNER
            </div>
          )}

          {/* Cover Photo Action Buttons */}
          <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
            <label className="flex items-center space-x-1.5 bg-slate-900/80 hover:bg-slate-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md cursor-pointer transition-all hover-scale shadow-md">
              <FaCamera className="w-3.5 h-3.5" />
              <span>{user?.coverPhoto ? 'Change Cover' : 'Upload Cover'}</span>
              <input type="file" onChange={handleCoverPhotoChange} className="hidden" accept="image/*" />
            </label>

            {user?.coverPhoto && (
              <button
                type="button"
                onClick={handleRemoveCoverPhoto}
                className="flex items-center space-x-1.5 bg-red-600/90 hover:bg-red-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold backdrop-blur-md transition-all hover-scale shadow-md"
                title="Remove Cover Photo"
              >
                <FaTrashAlt className="w-3.5 h-3.5" />
                <span>Remove Cover</span>
              </button>
            )}
          </div>
        </div>

        {/* User Info & Avatar Overlay */}
        <div className="px-6 pb-6 pt-0 flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 gap-4 relative z-20">
          <div className="flex flex-col sm:flex-row items-center sm:items-end space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative group">
              <img
                src={user?.avatar ? `${ASSET_BASE_URL}${user.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                alt="Profile Avatar"
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-slate-900 shadow-xl object-cover bg-white dark:bg-slate-900"
              />
              <label className="absolute bottom-1 right-1 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 shadow-md transition-colors hover-scale">
                <FaCamera className="w-3.5 h-3.5" />
                <input type="file" onChange={handleAvatarChange} className="hidden" accept="image/*" />
              </label>
            </div>

            <div className="text-center sm:text-left mb-1">
              <h2 className="text-2xl font-black">{user?.name}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1.5">
                <span className="inline-block text-[10px] bg-blue-500/10 text-blue-500 font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {user?.role}
                </span>
                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-red-500 hover:text-red-600 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-0.5 rounded-full transition-all hover-scale"
                  >
                    <FaTrashAlt className="w-2.5 h-2.5" />
                    <span>Remove Avatar</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
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
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 pointer-events-none z-10">
                    <FaLock className="w-4 h-4" />
                  </span>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full text-sm pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCurrentPassword((prev) => !prev);
                    }}
                    className="absolute right-2 p-2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none z-20 cursor-pointer pointer-events-auto"
                    title={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    {showCurrentPassword ? <FaEyeSlash className="w-4 h-4 text-blue-500" /> : <FaEye className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">New Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 pointer-events-none z-10">
                      <FaLock className="w-4 h-4" />
                    </span>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                      className="w-full text-sm pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowNewPassword((prev) => !prev);
                      }}
                      className="absolute right-2 p-2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none z-20 cursor-pointer pointer-events-auto"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? <FaEyeSlash className="w-4 h-4 text-blue-500" /> : <FaEye className="w-4 h-4 text-slate-400" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Confirm New Password</label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-slate-400 pointer-events-none z-10">
                      <FaLock className="w-4 h-4" />
                    </span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                      className="w-full text-sm pl-10 pr-12 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowConfirmPassword((prev) => !prev);
                      }}
                      className="absolute right-2 p-2 text-slate-400 hover:text-blue-500 transition-colors focus:outline-none z-20 cursor-pointer pointer-events-auto"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <FaEyeSlash className="w-4 h-4 text-blue-500" /> : <FaEye className="w-4 h-4 text-slate-400" />}
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
  );
};

export default ProfilePage;
