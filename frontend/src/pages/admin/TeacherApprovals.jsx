import React, { useState, useEffect } from 'react';
import { FaUserShield, FaCheck } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const TeacherApprovals = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users?role=teacher');
      if (res.data.success) {
        // Filter only those who are not approved
        const pending = res.data.users.filter(u => !u.isApproved);
        setTeachers(pending);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTeachers();
  }, []);

  const handleApprove = async (id, name) => {
    try {
      const res = await api.put(`/users/approve-teacher/${id}`);
      if (res.data.success) {
        Swal.fire({
          title: 'Approved! 🔓',
          text: `Educator account for ${name} has been activated.`,
          icon: 'success'
        });
        fetchPendingTeachers();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Could not complete approval step.', 'error');
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={4} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl"><FaUserShield className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black">Teacher Approvals</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review teacher sign-up applications and grant access licenses</p>
        </div>
      </div>

      {/* Pending list */}
      <div className="glass-card rounded-3xl p-6">
        {teachers.length === 0 ? (
          <div className="text-center py-12 space-y-2 text-slate-400">
            <FaUserShield className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <h3 className="font-bold text-lg">No Pending Applications</h3>
            <p className="text-xs">Educators are all verified and active on the platform.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Educator Details</th>
                  <th className="pb-3">Joined Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-bold">
                      <div className="flex items-center space-x-3">
                        <img
                          src={t.avatar ? `${ASSET_BASE_URL}${t.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                          alt="avatar"
                          className="w-9 h-9 rounded-full border object-cover"
                        />
                        <div>
                          <p>{t.name}</p>
                          <p className="text-xs text-slate-400 font-normal">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleApprove(t._id, t.name)}
                        className="inline-flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors hover-scale"
                      >
                        <FaCheck />
                        <span>Approve License</span>
                      </button>
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

export default TeacherApprovals;
