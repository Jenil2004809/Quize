import React, { useState, useEffect, useCallback } from 'react';
import { FaUsers, FaTrash, FaFilter, FaUserCheck, FaSync, FaShieldAlt, FaTimesCircle } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';
import { io } from 'socket.io-client';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoApproveTeachers, setAutoApproveTeachers] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data.success && res.data.settings) {
        setAutoApproveTeachers(!!res.data.settings.autoApproveTeachers);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchUsers = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [roleFilter]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchUsers(false), fetchSettings()]);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggleAutoApprove = async () => {
    const newValue = !autoApproveTeachers;
    setAutoApproveTeachers(newValue);
    try {
      const res = await api.put('/settings', { autoApproveTeachers: newValue });
      if (res.data.success) {
        Swal.fire({
          title: newValue ? 'Auto-Approve Enabled ⚡' : 'Auto-Approve Disabled 🔒',
          text: newValue
            ? 'New educator registrations will be automatically approved. Approval action buttons hidden.'
            : 'New educator registrations require manual admin approval. Approval action buttons are now shown.',
          icon: 'info',
          timer: 2000,
          showConfirmButton: false
        });
        fetchUsers(false);
      }
    } catch (err) {
      console.error(err);
      setAutoApproveTeachers(!newValue);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchUsers(true);
  }, [fetchSettings, fetchUsers]);

  useEffect(() => {
    const backendUrl = ASSET_BASE_URL || window.location.origin;
    const socket = io(backendUrl);

    socket.on('analytics_updated', () => {
      fetchUsers(false);
      fetchSettings();
    });

    const interval = setInterval(() => {
      fetchUsers(false);
      fetchSettings();
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, [fetchUsers, fetchSettings]);

  const handleDelete = async (id, name) => {
    Swal.fire({
      title: `Delete Account of ${name}?`,
      text: 'This will completely erase the user profile, quizzes authored, attempt scores, and earned certifications. This action is irreversible!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete user!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/users/${id}`);
          if (res.data.success) {
            setUsers(prev => prev.filter(u => u._id !== id));
            Swal.fire('Deleted!', 'User account and details have been removed.', 'success');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleApprove = async (id, name, targetState) => {
    try {
      const res = await api.put(`/users/${id}/approve`, { isApproved: targetState });
      if (res.data.success) {
        Swal.fire({
          title: targetState ? 'Account Activated! 🔓' : 'Account Revoked 🔒',
          text: `${name}'s account status has been updated.`,
          icon: 'success'
        });
        fetchUsers(false);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Could not update user approval status.', 'error');
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaUsers className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Manage Users</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View active student or educator accounts and manage approvals</p>
          </div>
        </div>

        {/* Actions: Refresh, Auto-Approve Toggle & Role Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-500/20 text-xs transition-all hover-scale disabled:opacity-50"
            title="Reload latest user records from database"
          >
            <FaSync className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Records'}</span>
          </button>

          <button
            onClick={handleToggleAutoApprove}
            className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all border shadow-sm ${
              autoApproveTeachers
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20'
            }`}
            title="Click to toggle auto-approval for educator registrations"
          >
            <FaShieldAlt className="w-3.5 h-3.5" />
            <span>Auto-Approve: {autoApproveTeachers ? 'ON' : 'OFF'}</span>
          </button>

          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
            <FaFilter className="text-slate-400 text-xs" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none pr-6 cursor-pointer text-slate-800 dark:text-slate-100"
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Users (Students & Teachers)</option>
              <option value="student" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Students Only</option>
              <option value="teacher" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">Teachers Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users table */}
      <div className="glass-card rounded-3xl p-6">
        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : users.length === 0 ? (
          <p className="text-sm text-slate-450 py-12 text-center">No active users logged in this category.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">User Profile</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Activated / Approved</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-bold">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar ? `${ASSET_BASE_URL}${u.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                          alt="avatar"
                          className="w-9 h-9 rounded-full border border-blue-500/20 object-cover"
                        />
                        <div>
                          <p>{u.name}</p>
                          <p className="text-xs text-slate-400 font-normal">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`inline-block text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        u.role === 'teacher' ? 'bg-indigo-500/10 text-indigo-500' :
                        u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`font-semibold ${u.isApproved ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {u.isApproved ? 'Approved' : 'Pending Approval'}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {u.role !== 'admin' && (!autoApproveTeachers || !u.isApproved) && (
                          <button
                            onClick={() => handleApprove(u._id, u.name, !u.isApproved)}
                            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                              u.isApproved
                                ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white'
                                : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                            }`}
                            title={u.isApproved ? 'Revoke Approval' : 'Approve User Account'}
                          >
                            {u.isApproved ? <FaTimesCircle className="w-3.5 h-3.5" /> : <FaUserCheck className="w-3.5 h-3.5" />}
                            <span>{u.isApproved ? 'Unapprove' : 'Approve'}</span>
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            title="Delete Account"
                          >
                            <FaTrash className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
