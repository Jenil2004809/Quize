import React, { useState, useEffect } from 'react';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const StudentLeaderboard = () => {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get('/leaderboard');
        if (res.data.success) {
          setRankings(res.data.rankings);
        }
      } catch (err) {
        console.error('Error fetching global leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  const getRankBadge = (rank) => {
    switch (rank) {
      case 1:
        return <FaMedal className="text-yellow-400 text-2xl filter drop-shadow animate-bounce" />;
      case 2:
        return <FaMedal className="text-slate-300 text-2xl filter drop-shadow" />;
      case 3:
        return <FaMedal className="text-amber-600 text-2xl filter drop-shadow" />;
      default:
        return <span className="font-mono text-sm font-bold text-slate-400">{rank}</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl"><FaTrophy className="w-6 h-6 animate-pulse" /></div>
        <div>
          <h1 className="text-3xl font-black">Global Standings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compete with peer minds and secure high positions</p>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="glass-card rounded-3xl p-6 overflow-hidden">
        {rankings.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">No leaderboard entries available yet. Quizzes must be passed to accumulate points!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3 w-20 text-center">Rank</th>
                  <th className="pb-3">Student Name</th>
                  <th className="pb-3">Accumulated Points</th>
                  <th className="pb-3">Passed Quizzes</th>
                  <th className="pb-3">Avg. Percentage</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((r) => (
                  <tr key={r.student?._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 text-center flex items-center justify-center h-16">{getRankBadge(r.rank)}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={r.student?.avatar ? `${ASSET_BASE_URL}${r.student.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=student'}
                          alt="avatar"
                          className="w-8 h-8 rounded-full border border-blue-500/30 object-cover"
                        />
                        <div>
                          <p className="font-bold">{r.student?.name}</p>
                          <p className="text-xs text-slate-400">{r.student?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-extrabold text-blue-500">{r.totalPoints} pts</td>
                    <td className="py-4 font-semibold">{r.quizzesPassed}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{r.averagePercentage}%</span>
                        <div className="w-20 bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full" style={{ width: `${r.averagePercentage}%` }}></div>
                        </div>
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

export default StudentLeaderboard;
