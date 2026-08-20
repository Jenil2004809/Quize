import React, { useState, useEffect } from 'react';
import { 
  FaShieldAlt, FaExclamationTriangle, FaCheckCircle, FaTimesCircle, 
  FaSearch, FaFilter, FaEye, FaUnlock, FaBan, FaSync, FaClock, 
  FaDesktop, FaGlobe, FaUser, FaBook, FaTimes, FaTrash
} from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const PolicyViolations = () => {
  const [violations, setViolations] = useState([]);
  const [stats, setStats] = useState({
    totalViolations: 0,
    pendingApproval: 0,
    approved: 0,
    rejected: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // View Details Modal State
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const fetchViolations = async () => {
    setLoading(true);
    try {
      let url = '/admin/policy-violations';
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get(url);
      if (res.data.success) {
        setViolations(res.data.violations);
        if (res.data.stats) {
          setStats(res.data.stats);
        }
      }
    } catch (err) {
      console.error('Error fetching policy violations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolations();
  }, [statusFilter, searchQuery]);

  // Handle Approve Action (Section 8)
  const handleApprove = async (violationId, studentName, quizTitle) => {
    Swal.fire({
      title: `Approve Access for ${studentName}?`,
      text: `Grant permission for ${studentName} to re-attempt "${quizTitle}". Admin notification will be sent automatically.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Approve & Allow Retake'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.put(`/admin/policy-violations/${violationId}/approve`, { adminNotes });
          if (res.data.success) {
            Swal.fire({
              title: 'Access Approved! 🎉',
              text: `Admin approved quiz access for ${studentName}. Notification sent to student!`,
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            setDetailModalOpen(false);
            fetchViolations();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Could not complete approval.', 'error');
        }
      }
    });
  };

  // Handle Reject Action (Section 9)
  const handleReject = async (violationId, studentName) => {
    Swal.fire({
      title: `Reject Request for ${studentName}?`,
      text: `Student will remain blocked from attempting this quiz. A rejection notice will be sent.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Reject Request'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.put(`/admin/policy-violations/${violationId}/reject`, { adminNotes });
          if (res.data.success) {
            Swal.fire({
              title: 'Request Rejected',
              text: `Policy violation request for ${studentName} has been rejected. Student remains blocked.`,
              icon: 'error',
              confirmButtonColor: '#ef4444'
            });
            setDetailModalOpen(false);
            fetchViolations();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', 'Could not process rejection.', 'error');
        }
      }
    });
  };

  // Handle Delete Policy Violation Record Action
  const handleDelete = async (violationId, studentName) => {
    Swal.fire({
      title: `Delete Policy Record for ${studentName}?`,
      text: `This will permanently delete this policy violation record from the database.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Record!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/admin/policy-violations/${violationId}`);
          if (res.data.success) {
            Swal.fire({
              title: 'Deleted! 🗑️',
              text: res.data.message || `Policy violation record for ${studentName} deleted successfully.`,
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            setDetailModalOpen(false);
            fetchViolations();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Delete Error', 'Could not delete policy violation record.', 'error');
        }
      }
    });
  };

  // Handle Delete ALL Policy Violations Action
  const handleDeleteAll = () => {
    Swal.fire({
      title: 'Delete ALL Policy Violations?',
      text: 'This will permanently delete ALL policy violation records and audit logs from the database. This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete All Records!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete('/admin/policy-violations/delete-all');
          if (res.data.success) {
            Swal.fire({
              title: 'All Violations Deleted! 🗑️',
              text: res.data.message || 'All policy violation records cleared from database.',
              icon: 'success',
              confirmButtonColor: '#10b981'
            });
            fetchViolations();
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Delete Error', 'Could not delete all policy violation records.', 'error');
        }
      }
    });
  };

  // Open View Details Modal (Section 7)
  const handleViewDetails = async (violationId) => {
    try {
      const res = await api.get(`/admin/policy-violations/${violationId}`);
      if (res.data.success) {
        setSelectedViolation(res.data.violation);
        setAdminNotes(res.data.violation.adminNotes || '');
        setDetailModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Could not fetch violation details.', 'error');
    }
  };

  const getStatusBadge = (approvalStatus, status) => {
    const s = (approvalStatus || status || '').toUpperCase();
    if (s === 'APPROVED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Approved</span>;
    }
    if (s === 'REJECTED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20">Rejected</span>;
    }
    if (s === 'TERMINATED') {
      return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">Terminated</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>;
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
            <FaShieldAlt className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Policy Violations</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage anti-cheating tab change locks, review audit logs, and authorize retakes
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={fetchViolations}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl hover-scale shadow-sm"
          >
            <FaSync className={`w-3.5 h-3.5 text-blue-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDeleteAll}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 px-4 py-2.5 rounded-xl transition-all hover-scale shadow-lg shadow-red-500/20"
          >
            <FaTrash className="w-3.5 h-3.5" />
            <span>Delete All Violations</span>
          </button>
        </div>
      </div>

      {/* Dashboard Metrics Cards (Section 6) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Violations */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-blue-500">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Violations</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.totalViolations}</p>
        </div>

        {/* Pending Approval (Orange) */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-amber-500">
          <p className="text-xs font-bold text-amber-500 uppercase">Pending Approval</p>
          <p className="text-2xl font-black text-amber-500 mt-1">{stats.pendingApproval}</p>
        </div>

        {/* Approved (Green) */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-emerald-500">
          <p className="text-xs font-bold text-emerald-500 uppercase">Approved</p>
          <p className="text-2xl font-black text-emerald-500 mt-1">{stats.approved}</p>
        </div>

        {/* Rejected (Red) */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-red-500">
          <p className="text-xs font-bold text-red-500 uppercase">Rejected</p>
          <p className="text-2xl font-black text-red-500 mt-1">{stats.rejected}</p>
        </div>

        {/* Completed (Dark Red) */}
        <div className="glass-card p-4 rounded-2xl border-l-4 border-l-rose-900">
          <p className="text-xs font-bold text-rose-800 dark:text-rose-400 uppercase">Completed</p>
          <p className="text-2xl font-black text-rose-800 dark:text-rose-400 mt-1">{stats.completed}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <FaSearch className="absolute left-3.5 top-3 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search student or quiz..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <FaFilter className="text-slate-400 text-xs" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">All Policy Statuses</option>
            <option value="PENDING">Pending Approval (Orange)</option>
            <option value="APPROVED">Approved (Green)</option>
            <option value="REJECTED">Rejected (Red)</option>
          </select>
        </div>
      </div>

      {/* Policy Violations Table (Section 6) */}
      <div className="glass-card rounded-3xl p-6">
        {loading ? (
          <LoadingSkeleton type="table" count={5} />
        ) : violations.length === 0 ? (
          <div className="py-12 text-center">
            <FaShieldAlt className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">No Policy Violations Found</p>
            <p className="text-xs text-slate-400 mt-1">All quiz attempt records are clean or match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Student ID</th>
                  <th className="pb-3">Quiz Name</th>
                  <th className="pb-3">Violation Count</th>
                  <th className="pb-3">Violation Date</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                {violations.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                    <td className="py-3.5 font-bold">
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={v.studentId?.avatar ? `${ASSET_BASE_URL}${v.studentId.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border border-blue-500/20 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100">{v.studentId?.name || 'Student'}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{v.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-400 font-mono text-[10px]">
                      {v.studentId?._id?.slice(-8) || 'N/A'}
                    </td>
                    <td className="py-3.5 font-bold text-blue-600 dark:text-blue-400 max-w-[180px] truncate">
                      {v.quizId?.title || 'Quiz'}
                    </td>
                    <td className="py-3.5 font-black">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-red-500/10 text-red-500">
                        {v.tabChangeCount || (v.wasDisqualified ? 3 : 0)} / 3
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400 text-[11px]">
                      {new Date(v.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 text-slate-500 font-medium max-w-[200px] truncate">
                      {v.terminationReason || v.disqualificationReason || 'TAB_CHANGE_LIMIT_EXCEEDED'}
                    </td>
                    <td className="py-3.5">
                      {getStatusBadge(v.approvalStatus, v.status)}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* View Details Button */}
                        <button
                          onClick={() => handleViewDetails(v._id)}
                          className="inline-flex items-center space-x-1 p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                          title="View Violation Details"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                        </button>

                        {/* Approve Button */}
                        {v.approvalStatus !== 'APPROVED' && (
                          <button
                            onClick={() => handleApprove(v._id, v.studentId?.name || 'Student', v.quizId?.title || 'Quiz')}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-600 hover:text-white font-bold transition-all"
                            title="Approve & Unlock Retake"
                          >
                            <FaUnlock className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {v.approvalStatus !== 'REJECTED' && (
                          <button
                            onClick={() => handleReject(v._id, v.studentId?.name || 'Student')}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white font-bold transition-all"
                            title="Reject Access Request"
                          >
                            <FaBan className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        )}

                        {/* Delete Record Button */}
                        <button
                          onClick={() => handleDelete(v._id, v.studentId?.name || 'Student')}
                          className="inline-flex items-center space-x-1 p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors"
                          title="Delete Policy Violation Record"
                        >
                          <FaTrash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Details Modal (Section 7) */}
      {detailModalOpen && selectedViolation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-card max-w-3xl w-full rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-xl">
                  <FaShieldAlt className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Violation Audit Details</h2>
                  <p className="text-xs text-slate-400">Comprehensive anti-cheating timeline & candidate diagnostics</p>
                </div>
              </div>
              <button
                onClick={() => setDetailModalOpen(false)}
                className="p-2 text-slate-400 hover:text-red-500 rounded-lg"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Grid 1: Student & Quiz Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Information */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                <h4 className="font-extrabold text-xs text-blue-500 uppercase flex items-center">
                  <FaUser className="mr-1.5" /> Student Information
                </h4>
                <div className="text-xs space-y-1">
                  <p><span className="text-slate-400 font-medium">Name:</span> <strong className="text-slate-800 dark:text-slate-100">{selectedViolation.studentId?.name}</strong></p>
                  <p><span className="text-slate-400 font-medium">Email:</span> {selectedViolation.studentId?.email}</p>
                  <p><span className="text-slate-400 font-medium">Student ID:</span> <code className="text-[11px]">{selectedViolation.studentId?._id}</code></p>
                  <p><span className="text-slate-400 font-medium">Account Approved:</span> {selectedViolation.studentId?.isApproved ? 'YES' : 'NO'}</p>
                </div>
              </div>

              {/* Quiz Information */}
              <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
                <h4 className="font-extrabold text-xs text-indigo-500 uppercase flex items-center">
                  <FaBook className="mr-1.5" /> Quiz Information
                </h4>
                <div className="text-xs space-y-1">
                  <p><span className="text-slate-400 font-medium">Quiz Title:</span> <strong className="text-slate-800 dark:text-slate-100">{selectedViolation.quizId?.title}</strong></p>
                  <p><span className="text-slate-400 font-medium">Time Limit:</span> {selectedViolation.quizId?.timeLimit} Minutes</p>
                  <p><span className="text-slate-400 font-medium">Passing Marks:</span> {selectedViolation.quizId?.passingMarks}</p>
                  <p><span className="text-slate-400 font-medium">Max Attempts:</span> {selectedViolation.quizId?.maxAttempts}</p>
                </div>
              </div>
            </div>

            {/* Grid 2: Violation Diagnostics */}
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 space-y-3">
              <h4 className="font-extrabold text-xs text-red-500 uppercase flex items-center">
                <FaExclamationTriangle className="mr-1.5" /> Termination & Diagnostics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Reason</span>
                  <strong className="text-red-500">{selectedViolation.terminationReason || selectedViolation.disqualificationReason || 'TAB_CHANGE_LIMIT_EXCEEDED'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Attempt Duration</span>
                  <strong>{Math.floor((selectedViolation.timeTaken || 0) / 60)}m {(selectedViolation.timeTaken || 0) % 60}s</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Termination Time</span>
                  <strong>{selectedViolation.terminatedAt ? new Date(selectedViolation.terminatedAt).toLocaleString() : new Date(selectedViolation.createdAt).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Violation History Timeline */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs text-slate-400 uppercase flex items-center">
                <FaClock className="mr-1.5 text-blue-500" /> Tab Switch Violation Timeline
              </h4>
              {selectedViolation.violationHistory?.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs text-slate-400">
                  3 Off-screen tab switch events detected during active exam.
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {selectedViolation.violationHistory?.map((log, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-amber-500 mr-2">Violation #{idx + 1}</span>
                        <span className="text-slate-400">{log.eventType || 'TAB_CHANGE'}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Notes Input */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400">Admin Resolution Notes</label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Enter custom administrative notes or reasoning for approval/rejection..."
                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end items-center space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setDetailModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(selectedViolation._id, selectedViolation.studentId?.name || 'Student')}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1"
              >
                <FaTrash className="w-3 h-3" />
                <span>Delete Record</span>
              </button>
              {selectedViolation.approvalStatus !== 'REJECTED' && (
                <button
                  onClick={() => handleReject(selectedViolation._id, selectedViolation.studentId?.name || 'Student')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Reject Request
                </button>
              )}
              {selectedViolation.approvalStatus !== 'APPROVED' && (
                <button
                  onClick={() => handleApprove(selectedViolation._id, selectedViolation.studentId?.name || 'Student', selectedViolation.quizId?.title || 'Quiz')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Approve & Allow Retake
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyViolations;
