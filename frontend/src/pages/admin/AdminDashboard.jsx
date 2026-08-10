import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaUserShield, FaGamepad, FaHistory, FaQuestionCircle, FaDatabase, FaHeartbeat } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import TabViolationAuthorizations from '../../components/admin/TabViolationAuthorizations';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching admin analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  const stats = data?.stats || {
    totalStudents: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    totalQuizzes: 0,
    totalQuestions: 0,
    totalResults: 0,
    totalSubjects: 0,
    activeUsers: 0,
    averagePercentage: 0,
    systemStatus: 'Unknown'
  };

  // Signups Chart configuration
  const signupChartData = {
    labels: data?.timelineData?.map(t => t.month) || [],
    datasets: [
      {
        label: 'User Signups',
        data: data?.timelineData?.map(t => t.registrations) || [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.3
      }
    ]
  };

  // Attempt performance chart configuration
  const performanceChartData = {
    labels: data?.performanceData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'Average Score (%)',
        data: data?.performanceData?.map(d => d.averagePercentage) || [],
        backgroundColor: '#10b981',
        borderRadius: 6
      }
    ]
  };

  const recentUsersList = Array.isArray(data?.recentUsers)
    ? data.recentUsers
    : [
        ...(data?.recentUsers?.students || []),
        ...(data?.recentUsers?.teachers || [])
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black">Admin Panel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Website configurations, approvals, and user standings.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { icon: <FaUsers className="text-blue-500" />, title: 'Students Active', val: stats.totalStudents },
          { icon: <FaUsers className="text-indigo-500" />, title: 'Teachers Active', val: stats.totalTeachers },
          { icon: <FaUserShield className="text-amber-500 font-bold" />, title: 'Pending Licences', val: stats.pendingTeachers, link: '/admin-dashboard/users' },
          { icon: <FaGamepad className="text-purple-500" />, title: 'Quizzes Created', val: stats.totalQuizzes },
          { icon: <FaQuestionCircle className="text-cyan-500" />, title: 'Questions', val: stats.totalQuestions },
          { icon: <FaHistory className="text-emerald-500" />, title: 'Attempts', val: stats.totalResults },
          { icon: <FaDatabase className="text-teal-500" />, title: 'Subjects', val: stats.totalSubjects, link: '/admin-dashboard/database' },
          { icon: <FaUsers className="text-pink-500" />, title: 'Active Users', val: stats.activeUsers },
          { icon: <FaHeartbeat className="text-red-500" />, title: 'Avg Score', val: `${stats.averagePercentage}%` },
          { icon: <FaHeartbeat className="text-green-500" />, title: 'System', val: stats.systemStatus }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-5 flex items-center space-x-3">
            <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl text-lg">{card.icon}</div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{card.title}</p>
              {card.link ? (
                <Link to={card.link} className="text-xl font-black hover:underline hover:text-blue-500 flex items-center space-x-1.5">
                  <span>{card.val}</span>
                  {card.val > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>}
                </Link>
              ) : (
                <h3 className="text-xl font-black">{card.val}</h3>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">User Registration Growth</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.timelineData?.length > 0 ? (
              <Line data={signupChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <span className="text-slate-400 text-sm">No timeline registration logs available yet.</span>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">Attempt Performance</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.performanceData?.length > 0 ? (
              <Bar data={performanceChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <span className="text-slate-400 text-sm">No attempt performance records available yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Admin Concern & Tab Violation Authorizations Section */}
      <TabViolationAuthorizations />

      {/* Bottom widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Recent users list */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">Recently Joined Users</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">User Details</th>
                  <th className="pb-3">Account Role</th>
                  <th className="pb-3">Activated</th>
                  <th className="pb-3 text-right">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {recentUsersList.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-3 font-semibold">
                      <div className="flex items-center space-x-2">
                        <img
                          src={u.avatar ? `${ASSET_BASE_URL}${u.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'}
                          alt="avatar"
                          className="w-6 h-6 rounded-full border object-cover"
                        />
                        <div>
                          <p className="font-bold">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`inline-block text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                        u.role === 'teacher' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{u.isApproved ? 'YES' : 'PENDING'}</td>
                    <td className="py-3 text-slate-400 text-right">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category overview */}
        <div className="glass-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg">Category Distribution</h3>
            <p className="text-slate-400 text-xs mt-0.5">Total quizzes nested per category</p>
          </div>

          <div className="flex-1 mt-4 space-y-3">
            {data?.categoryReport?.map((cat, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
                <span className="font-bold">{cat.category}</span>
                <span className="font-extrabold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded">{cat.count} quizzes</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
