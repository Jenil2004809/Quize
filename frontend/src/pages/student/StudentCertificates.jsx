import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaAward, FaDownload, FaCertificate } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const StudentCertificates = () => {
  const { user } = useSelector(state => state.auth);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await api.get(`/results/student/${user._id}`);
        if (res.data.success) {
          // Filter only passed attempts which have certificate IDs
          const certResults = res.data.results.filter(r => r.passed && r.certificateId);
          setResults(certResults);
        }
      } catch (err) {
        console.error('Error fetching certificates', err);
      } finally {
        setLoading(false);
      }
    };
    if (user?._id) fetchCertificates();
  }, [user]);

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><FaAward className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black">My Certificates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and download your earned credentials</p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <FaCertificate className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold">No Certificates Earned Yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">You will receive a certificate when you pass a quiz with scores exceeding its passing threshold.</p>
          <Link to="/quizzes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl hover-scale">
            Explore Quizzes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {results.map((r) => (
            <div key={r._id} className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all border-l-4 border-purple-500">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><FaCertificate className="w-6 h-6" /></div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-900 text-slate-400 font-bold px-2 py-0.5 rounded">
                    ID: {r.certificateId}
                  </span>
                </div>
                <div>
                  <h3 className="font-black text-lg leading-snug">{r.quizId?.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">Issued: {new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex justify-between items-center text-xs pt-2">
                  <span className="text-slate-400">Score: <strong className="text-slate-800 dark:text-slate-100">{r.score}</strong></span>
                  <span className="text-purple-500 font-bold bg-purple-500/10 px-2 py-0.5 rounded">{r.percentage}% Marks</span>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => navigate(`/quiz-result/${r._id}`)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center justify-center space-x-2 transition-colors text-sm hover-scale"
                >
                  <FaDownload />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCertificates;
