import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaGraduationCap, FaAward, FaHistory, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const StudentDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/analytics/dashboard');
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard analytics', err);
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
    totalAttempts: 0,
    passedAttempts: 0,
    failedAttempts: 0,
    certificatesCount: 0,
    averagePercentage: 0
  };

  // Timeline Chart configuration
  const timelineChartData = {
    labels: data?.timelineData?.map(t => t.date) || [],
    datasets: [
      {
        label: 'Quiz Scores (%)',
        data: data?.timelineData?.map(t => t.percentage) || [],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Category Chart configuration
  const categoryChartData = {
    labels: data?.categoryData?.map(c => c.category) || [],
    datasets: [
      {
        label: 'Attempts per Category',
        data: data?.categoryData?.map(c => c.attempts) || [],
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#8b5cf6',
          '#f59e0b',
          '#ef4444'
        ],
        borderWidth: 0
      }
    ]
  };

  return (
    <div className="space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black">Student Portal</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Check your testing metrics below.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: <FaHistory className="text-blue-500" />, title: 'Total Attempts', val: stats.totalAttempts },
          { icon: <FaCheckCircle className="text-emerald-500" />, title: 'Passed Quizzes', val: stats.passedAttempts },
          { icon: <FaAward className="text-purple-500" />, title: 'Certificates Earned', val: stats.certificatesCount },
          { icon: <FaGraduationCap className="text-indigo-500" />, title: 'Average Score', val: `${stats.averagePercentage}%` }
        ].map((card, idx) => (
          <div key={idx} className="glass-card rounded-2xl p-6 flex items-center space-x-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl text-xl">{card.icon}</div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-black">{card.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">Performance Timeline</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.timelineData?.length > 0 ? (
              <Line data={timelineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <span className="text-slate-400 text-sm">Attempt quizzes to build your timeline report.</span>
            )}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">Categories attempted</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.categoryData?.length > 0 ? (
              <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <span className="text-slate-400 text-sm">No category distribution data available yet.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="glass-card rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg">Recent Quiz Attempts</h3>
          <Link to="/student-dashboard/history" className="text-blue-500 hover:underline text-sm font-semibold">View History &rarr;</Link>
        </div>

        {data?.recentAttempts?.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">You have not attempted any quizzes yet. Go to <Link to="/quizzes" className="text-blue-500 underline font-semibold">Explore Quizzes</Link> to start!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Quiz Name</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentAttempts?.map((attempt) => (
                  <tr key={attempt._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-semibold">{attempt.quizId?.title}</td>
                    <td className="py-4">{attempt.score}</td>
                    <td className="py-4">{attempt.percentage}%</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        attempt.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {attempt.passed ? <FaCheckCircle className="text-[10px]" /> : <FaExclamationCircle className="text-[10px]" />}
                        <span>{attempt.passed ? 'PASSED' : 'FAILED'}</span>
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{new Date(attempt.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/quiz-result/${attempt._id}`)}
                        className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Solutions
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

export default StudentDashboard;
