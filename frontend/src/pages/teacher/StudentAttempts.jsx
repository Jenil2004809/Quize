import React, { useState, useEffect } from 'react';
import { FaCheckDouble, FaExclamationCircle, FaCheckCircle, FaFilter } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const StudentAttempts = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // Fetch teacher quizzes first
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes/creator');
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
          if (res.data.quizzes.length > 0) {
            setSelectedQuizId(res.data.quizzes[0]._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setQuizzesLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Fetch attempts whenever selected quiz changes
  useEffect(() => {
    const fetchAttempts = async () => {
      if (!selectedQuizId) return;
      setAttemptsLoading(true);
      try {
        const res = await api.get(`/results/quiz/${selectedQuizId}`);
        if (res.data.success) {
          setAttempts(res.data.results);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setAttemptsLoading(false);
      }
    };
    fetchAttempts();
  }, [selectedQuizId]);

  if (quizzesLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaCheckDouble className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Student Attempts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Review student results and completion stats for your exams</p>
          </div>
        </div>

        {/* Quiz Filter Dropdown */}
        <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl">
          <FaFilter className="text-slate-400 text-xs" />
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none pr-6 cursor-pointer"
          >
            {quizzes.length === 0 ? (
              <option value="">No Quizzes Found</option>
            ) : (
              quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)
            )}
          </select>
        </div>
      </div>

      {/* Attempts Table Card */}
      <div className="glass-card rounded-3xl p-6">
        {!selectedQuizId ? (
          <p className="text-sm text-slate-400 text-center py-12">Create a quiz draft first to observe student attempt submissions.</p>
        ) : attemptsLoading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : attempts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">No submissions recorded for this quiz yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Marks Obtained</th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Time Taken</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-bold">
                      <div className="flex items-center space-x-3">
                        <img
                          src={attempt.studentId?.avatar ? `${ASSET_BASE_URL}${attempt.studentId.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=student'}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border border-blue-500/30 object-cover"
                        />
                        <div>
                          <p>{attempt.studentId?.name}</p>
                          <p className="text-xs text-slate-450 font-normal">{attempt.studentId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold">{attempt.score}</td>
                    <td className="py-4 font-bold text-blue-500">{attempt.percentage}%</td>
                    <td className="py-4 text-slate-500">
                      {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        attempt.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {attempt.passed ? <FaCheckCircle className="text-[10px]" /> : <FaExclamationCircle className="text-[10px]" />}
                        <span>{attempt.passed ? 'PASSED' : 'FAILED'}</span>
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-right">{new Date(attempt.createdAt).toLocaleDateString()}</td>
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

export default StudentAttempts;
