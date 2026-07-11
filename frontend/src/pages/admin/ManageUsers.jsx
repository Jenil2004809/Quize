import React, { useState, useEffect } from 'react';
import { FaUsers, FaTrash, FaFilter } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const url = roleFilter ? `/users?role=${roleFilter}` : '/users';
      const res = await api.get(url);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

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

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaUsers className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Manage Users</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">View active student or educator accounts and prune records</p>
          </div>
        </div>

        {/* Role Filter */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
          <FaFilter className="text-slate-400 text-xs" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none pr-6 cursor-pointer"
          >
            <option value="">All Users (Students & Teachers)</option>
            <option value="student">Students Only</option>
            <option value="teacher">Teachers Only</option>
          </select>
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
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(u._id, u.name)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete Account"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      )}
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
