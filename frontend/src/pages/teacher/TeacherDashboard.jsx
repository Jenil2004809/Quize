import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaFolderOpen, FaCheckDouble, FaAward, FaChartBar, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import { io } from 'socket.io-client';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TeacherDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchAnalytics = async (isInitial = false) => {
    try {
      const res = await api.get('/analytics/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching teacher analytics', err);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);

    const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:5005' : window.location.origin;
    const socket = io(backendUrl);

    socket.on('analytics_updated', () => {
      fetchAnalytics(false);
    });

    const interval = setInterval(() => {
      fetchAnalytics(false);
    }, 5000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  const stats = data?.stats || {
    totalQuizzes: 0,
    publishedQuizzes: 0,
    draftQuizzes: 0,
    totalAttempts: 0,
    passedAttempts: 0,
    failedAttempts: 0,
    averageScore: 0
  };

  // Categories Chart configuration
  const categoryChartData = {
    labels: data?.categoryData?.map(c => c.category) || [],
    datasets: [
      {
        label: 'Number of Quizzes',
        data: data?.categoryData?.map(c => c.quizzes) || [],
        backgroundColor: '#4f46e5',
        borderRadius: 8
      }
    ]
  };

  return (
    <div className="space-y-8 text-left">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black">Educator Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back, {user?.name}. Manage your classroom curriculum.</p>
        </div>
        <Link
          to="/teacher-dashboard/quizzes"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl hover-scale shadow-lg shadow-blue-500/20"
        >
          Create New Quiz
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {[
          { icon: <FaFolderOpen className="text-blue-500" />, title: 'Total Quizzes', val: stats.totalQuizzes },
          { icon: <FaCheckDouble className="text-indigo-500" />, title: 'Student Attempts', val: stats.totalAttempts },
          { icon: <FaAward className="text-emerald-500" />, title: 'Pass Ratio', val: stats.totalAttempts > 0 ? `${((stats.passedAttempts / stats.totalAttempts) * 100).toFixed(1)}%` : '0%' },
          { icon: <FaChartBar className="text-purple-500" />, title: 'Average Score', val: stats.averageScore }
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

      {/* Analytics chart and Popular quizzes list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Category distribution */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-lg">Quizzes Created by Category</h3>
          <div className="h-64 flex items-center justify-center">
            {data?.categoryData?.length > 0 ? (
              <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            ) : (
              <span className="text-slate-400 text-sm">Create quizzes under categories to build this report.</span>
            )}
          </div>
        </div>

        {/* Popular quizzes */}
        <div className="glass-card rounded-3xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-lg">Top Quizzes by Attempts</h3>
            <p className="text-slate-400 text-xs mt-0.5">Most active exams authored by you</p>
          </div>

          <div className="flex-1 mt-4 space-y-3">
            {data?.popularQuizzes?.length === 0 ? (
              <p className="text-slate-400 text-sm py-12 text-center">No quiz attempts logged yet.</p>
            ) : (
              data?.popularQuizzes?.map((quiz, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs">
                  <span className="font-bold truncate max-w-[150px]">{quiz.title}</span>
                  <span className="font-extrabold text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">{quiz.attempts} attempts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
