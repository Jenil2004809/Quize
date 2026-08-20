import React, { useState, useEffect } from 'react';
import { FaUnlock, FaExclamationTriangle, FaCheckCircle, FaUserShield, FaSync, FaTrash } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import Swal from 'sweetalert2';

const TabViolationAuthorizations = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/tab-violations');
      if (res.data.success) {
        setViolations(res.data.violations);
      }
    } catch (err) {
      console.error('Error fetching tab violations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, []);

  const handleAuthorize = async (resultId, studentName, quizTitle) => {
    Swal.fire({
      title: `Authorize Retake for ${studentName}?`,
      text: `Grant concern and permission for ${studentName} to re-attempt "${quizTitle}" a second time.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Authorize Retake 🔓'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.put(`/admin/tab-violations/${resultId}/authorize`);
          if (res.data.success) {
            Swal.fire({
              title: 'Authorized Successfully! 🔓',
              text: `${studentName} has been granted Admin concern and can now attempt "${quizTitle}" a second time.`,
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            fetchViolations();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Could not authorize student retake.', 'error');
        }
      }
    });
  };

  const handleDeleteAll = () => {
    Swal.fire({
      title: 'Delete All Violation Records?',
      text: 'This will permanently delete all policy violation and lock records from the website and database at the same time.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete All!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete('/admin/policy-violations/delete-all');
          if (res.data.success) {
            Swal.fire({
              title: 'Deleted All Records! 🗑️',
              text: res.data.message || 'All records deleted permanently.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            fetchViolations();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Could not delete all records.', 'error');
        }
      }
    });
  };

  return (
    <div className="glass-card rounded-3xl p-6 space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
            <FaExclamationTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-800 dark:text-slate-100">
              Student Tab Change Concern & Retake Authorizations
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grant Admin concern to students locked out due to tab change violations so they can attempt the quiz a second time
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchViolations}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-blue-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl transition-all"
          >
            <FaSync className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDeleteAll}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl transition-all hover-scale shadow-md shadow-red-500/20"
          >
            <FaTrash className="w-3 h-3" />
            <span>Delete All</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-6 text-center">Loading tab change violation logs...</p>
      ) : violations.length === 0 ? (
        <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <FaCheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300">No Pending Tab Violation Locks</p>
          <p className="text-xs text-slate-400 mt-0.5">All student exam attempts are clear and authorized.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3">Student Profile</th>
                <th className="pb-3">Quiz Title</th>
                <th className="pb-3">Lock Reason</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Admin Concern Action</th>
              </tr>
            </thead>
            <tbody>
              {violations.map((v) => (
                <tr key={v._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                  <td className="py-3 font-semibold">
                    <div className="flex items-center space-x-2">
                      <img
                        src={v.studentId?.avatar ? `${ASSET_BASE_URL}${v.studentId.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                        alt="avatar"
                        className="w-7 h-7 rounded-full border object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100">{v.studentId?.name || 'Student'}</p>
                        <p className="text-[10px] text-slate-400 font-normal">{v.studentId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-blue-600 dark:text-blue-400 max-w-[180px] truncate">
                    {v.quizId?.title || 'Quiz'}
                  </td>
                  <td className="py-3 text-slate-500 font-medium max-w-[200px] truncate">
                    {v.disqualificationReason || 'Failed to record attempts. Please contact admin.'}
                  </td>
                  <td className="py-3">
                    {v.isAuthorizedForRetake ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                        <FaCheckCircle className="mr-1 w-2.5 h-2.5" /> Authorized for Retake
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 animate-pulse">
                        <FaExclamationTriangle className="mr-1 w-2.5 h-2.5" /> Locked (Tab Switch)
                      </span>
                    )}
                  </td>
                  <td className="py-3 text-slate-400 text-[10px]">{new Date(v.createdAt).toLocaleString()}</td>
                  <td className="py-3 text-right">
                    {!v.isAuthorizedForRetake ? (
                      <button
                        onClick={() => handleAuthorize(v._id, v.studentId?.name || 'Student', v.quizId?.title || 'Quiz')}
                        className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl hover-scale shadow-md shadow-emerald-600/20"
                      >
                        <FaUnlock className="w-3 h-3" />
                        <span>Authorize Retake 🔓</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        Retake Unlocked ✅
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TabViolationAuthorizations;
