import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaHistory, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const StudentHistory = () => {
  const { user } = useSelector(state => state.auth);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await api.get(`/results/student/${user._id}`);
        if (res.data.success) {
          setResults(res.data.results);
        }
      } catch (err) {
        console.error('Error fetching quiz history', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchResults();
  }, [user]);

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaHistory className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black">Quiz Attempt History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review all your previous quiz scores and details</p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-6">
        {results.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-slate-400">You haven't attempted any quizzes yet.</p>
            <Link to="/quizzes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl hover-scale">
              Browse Quizzes
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Quiz Title</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Score Obtained</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Passing Marks</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-bold">{r.quizId?.title}</td>
                    <td className="py-4">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        r.quizId?.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-500' :
                        r.quizId?.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {r.quizId?.difficulty}
                      </span>
                    </td>
                    <td className="py-4">{r.score} / {r.totalQuestions * 1}</td>
                    <td className="py-4 font-semibold">{r.percentage}%</td>
                    <td className="py-4 text-slate-400">{r.quizId?.passingMarks}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        r.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {r.passed ? <FaCheckCircle className="text-[10px]" /> : <FaExclamationCircle className="text-[10px]" />}
                        <span>{r.passed ? 'PASSED' : 'FAILED'}</span>
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/quiz-result/${r._id}`)}
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

export default StudentHistory;
