import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaCheckCircle, FaTimesCircle, FaHourglass, FaDownload, FaShareAlt, 
  FaTrophy, FaArrowLeft, FaShieldAlt, FaAward, FaRobot, FaComments, 
  FaFilter, FaCheck, FaTimes, FaExternalLinkAlt, FaBookOpen
} from 'react-icons/fa';
import api from '../../services/api';
import confetti from 'canvas-confetti';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import CertificateModal from '../../components/CertificateModal';
import HolographicCertificateCard from '../../components/HolographicCertificateCard';
import AIMentorModal from '../../components/AIMentorModal';
import AIChatModal from '../../components/AIChatModal';
import Swal from 'sweetalert2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const QuizResult = () => {
  const { id: resultId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedAiQuestion, setSelectedAiQuestion] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeQuestionFilter, setActiveQuestionFilter] = useState('all'); // 'all' | 'incorrect' | 'correct'

  // Live Interactive AI Chat Modal State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatQuestionContext, setChatQuestionContext] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/results/${resultId}`);
        if (res.data.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Could not load quiz result details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [resultId]);

  // Trigger Physics-Based Confetti Blast on Passing
  useEffect(() => {
    if (data?.result?.passed) {
      // Primary confetti burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Extra fireworks celebratory cannons for honors/distinction (>= 75%)
      if (data.result.percentage >= 75) {
        const timer1 = setTimeout(() => {
          confetti({
            particleCount: 90,
            angle: 60,
            spread: 60,
            origin: { x: 0.05, y: 0.65 }
          });
          confetti({
            particleCount: 90,
            angle: 120,
            spread: 60,
            origin: { x: 0.95, y: 0.65 }
          });
        }, 300);

        const timer2 = setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899', '#3b82f6']
          });
        }, 600);

        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }
  }, [data]);

  if (loading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  if (!data?.result) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <p className="text-slate-400">Result details could not be found.</p>
        <Link to="/" className="text-blue-500 hover:underline">&larr; Back Home</Link>
      </div>
    );
  }

  const { result, questions, certificateId } = data;
  const quiz = result.quizId;
  const isDistinction = result.percentage >= 75;

  // Chart configuration
  const chartData = {
    labels: ['Correct', 'Wrong', 'Skipped'],
    datasets: [
      {
        data: [result.correctAnswers || 0, result.wrongAnswers || 0, result.skippedAnswers || 0],
        backgroundColor: ['#10b981', '#ef4444', '#94a3b8'],
        borderWidth: 0
      }
    ]
  };

  const handleShare = () => {
    setSharing(true);
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      Swal.fire({
        title: 'Copied to Clipboard! 📋',
        text: 'Share this URL to display your verified exam solutions and certificate.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      setSharing(false);
    }).catch(err => {
      console.error(err);
      setSharing(false);
    });
  };

  // Filtered Questions for Review
  const filteredQuestions = questions.filter(q => {
    const studentAnsObj = result.answers.find(a => a.questionId === q._id);
    const isCorrect = studentAnsObj?.isCorrect;
    if (activeQuestionFilter === 'incorrect') return !isCorrect;
    if (activeQuestionFilter === 'correct') return isCorrect;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8 relative">
      
      {/* Certificate Modal */}
      <CertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        result={result}
        quiz={quiz}
        student={result.studentId}
        certificateId={certificateId}
      />

      {/* AI Mentor Explanation Modal */}
      <AIMentorModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        questionData={selectedAiQuestion}
      />

      {/* Live Interactive AI Chat Modal */}
      <AIChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        questionContext={chatQuestionContext}
      />

      {/* Return link */}
      <button onClick={() => navigate('/student-dashboard')} className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-500 transition-colors">
        <FaArrowLeft />
        <span>Return to Student Dashboard</span>
      </button>

      {/* Hero Celebration Banner */}
      <div className={`glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between border-l-8 shadow-xl ${
        result.passed 
          ? (isDistinction ? 'border-amber-500 bg-gradient-to-r from-amber-500/5 via-slate-900/40 to-emerald-500/5' : 'border-emerald-500')
          : 'border-red-500'
      }`}>
        <div className="space-y-3 text-center md:text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-500 font-extrabold uppercase tracking-wider border border-blue-500/20">
              {quiz?.category?.name || 'Academic Assessment'}
            </span>
            {isDistinction && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-400 font-black uppercase tracking-wider border border-amber-500/30 flex items-center space-x-1">
                <FaTrophy className="w-2.5 h-2.5 text-amber-400" />
                <span>Honors & Distinction ({result.percentage}%)</span>
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            {quiz?.title}
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
            {result.wasDisqualified ? (
              <span className="text-red-500 font-bold">Exam Attempt Terminated due to excessive policy violations.</span>
            ) : result.passed ? (
              <span className="text-emerald-500 font-bold">🎉 Outstanding achievement! You passed the assessment and earned an accredited certificate.</span>
            ) : (
              <span className="text-red-500 font-bold">Score fell below passing threshold ({quiz?.passingMarks} marks). Review the solutions below and re-attempt.</span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2.5 mt-6 md:mt-0">
          {(certificateId || result.passed) && (
            <button
              onClick={() => setShowCertModal(true)}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 px-5 py-3 rounded-2xl text-xs font-black transition-all hover:scale-105 shadow-xl shadow-amber-500/25"
            >
              <FaAward className="w-4 h-4" />
              <span>Preview 3D Certificate</span>
            </button>
          )}

          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center space-x-2 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-500 px-4 py-3 rounded-2xl text-xs font-bold transition-all hover:scale-105 bg-white/50 dark:bg-slate-900/50"
          >
            <FaShareAlt />
            <span>Share Result</span>
          </button>
        </div>
      </div>

      {/* Embedded 3D Holographic Certificate Preview Card (Displayed directly when passed) */}
      {(result.passed || certificateId) && (
        <div className="space-y-4 pt-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center space-x-1.5">
              <FaAward className="w-3.5 h-3.5" />
              <span>Interactive 3D Holographic Certificate</span>
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Official University Credential
            </h2>
            <p className="text-xs text-slate-400">
              💡 <em>Move your cursor or touch to inspect the 3D holographic tilt & light reflection.</em>
            </p>
          </div>

          <HolographicCertificateCard
            result={result}
            quiz={quiz}
            student={result.studentId}
            certificateId={certificateId || 'CERT-UNIV-2026'}
            showActions={true}
          />
        </div>
      )}

      {/* Grid: Charts vs Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Summary stats */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 grid grid-cols-2 gap-4">
          {[
            { icon: <FaTrophy className="text-yellow-500" />, title: 'Score Obtained', val: `${result.score} / ${questions.length * 1} Marks` },
            { icon: <FaCheckCircle className="text-emerald-500" />, title: 'Percentage', val: `${result.percentage}%` },
            { icon: <FaHourglass className="text-blue-500" />, title: 'Time Elapsed', val: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` },
            { icon: <FaShieldAlt className="text-purple-500" />, title: 'AI Integrity Score', val: `${result.integrityScore || 100}% Trust` }
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-slate-100/60 dark:bg-slate-900/60 rounded-2xl flex items-center space-x-3.5 border border-slate-200/50 dark:border-slate-800/50">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl text-lg shadow-sm">{stat.icon}</div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.title}</p>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">{stat.val}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Doughnut Chart */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Answer Distribution</h3>
          <div className="w-36 h-36 mt-2">
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
          <div className="flex space-x-3 mt-3 text-[10px] font-bold">
            <span className="text-emerald-500">✓ {result.correctAnswers || 0} Correct</span>
            <span className="text-red-500">✗ {result.wrongAnswers || 0} Wrong</span>
            <span className="text-slate-400">⚪ {result.skippedAnswers || 0} Skipped</span>
          </div>
        </div>

      </div>

      {/* Detailed Solutions Review Accordion */}
      <div className="space-y-5 pt-4">
        
        {/* Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center space-x-2">
              <FaBookOpen className="text-blue-500 w-5 h-5" />
              <span>Comprehensive Solutions & Explanations</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Examine question key rationale, IEEE/ABET engineering citations, and AI mentor insights
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => setActiveQuestionFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeQuestionFilter === 'all'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-blue-500'
              }`}
            >
              All ({questions.length})
            </button>
            <button
              onClick={() => setActiveQuestionFilter('incorrect')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeQuestionFilter === 'incorrect'
                  ? 'bg-red-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-red-500'
              }`}
            >
              Incorrect ({result.wrongAnswers || 0})
            </button>
            <button
              onClick={() => setActiveQuestionFilter('correct')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeQuestionFilter === 'correct'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              }`}
            >
              Correct ({result.correctAnswers || 0})
            </button>
          </div>
        </div>

        {/* Question Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const studentAnsObj = result.answers?.find(a => String(a.questionId?._id || a.questionId) === String(q._id));
            const studentSelected = studentAnsObj?.selectedAnswers || [];
            const isCorrect = studentAnsObj?.isCorrect;
            const correctKeyStr = Array.isArray(q.correctAnswers) ? q.correctAnswers.join(', ') : q.correctAnswers;
            const studentChoiceStr = studentSelected.length > 0 ? studentSelected.join(', ') : 'No answer submitted';

            return (
              <div key={q._id} className="glass-card rounded-3xl p-6 space-y-4 border border-slate-200/70 dark:border-slate-800/70">
                <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">
                      Q{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold uppercase">
                      {q.type}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl flex items-center space-x-1 ${
                      isCorrect ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {isCorrect ? <FaCheck className="w-2.5 h-2.5" /> : <FaTimes className="w-2.5 h-2.5" />}
                      <span>{isCorrect ? `Correct (+${q.marks})` : `Incorrect (-${q.negativeMarks})`}</span>
                    </span>

                    <button
                      onClick={() => {
                        setSelectedAiQuestion({
                          text: q.text,
                          options: q.options,
                          selectedAnswers: studentSelected,
                          correctAnswers: q.correctAnswers,
                          explanation: q.explanation
                        });
                        setAiModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 hover-scale"
                    >
                      <FaRobot className="w-3 h-3" />
                      <span>AI Explanation</span>
                    </button>

                    <button
                      onClick={() => {
                        setChatQuestionContext({
                          text: q.text,
                          options: q.options,
                          selectedAnswers: studentSelected,
                          correctAnswers: q.correctAnswers,
                          explanation: q.explanation
                        });
                        setChatModalOpen(true);
                      }}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover-scale"
                    >
                      <FaComments className="w-3 h-3" />
                      <span>Ask AI Tutor</span>
                    </button>
                  </div>
                </div>

                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white leading-relaxed">
                  {q.text}
                </h4>

                {/* Display options if MCQ */}
                {q.options && q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const wasSelected = studentSelected.includes(opt);
                      const isCorrectOpt = Array.isArray(q.correctAnswers) ? q.correctAnswers.includes(opt) : q.correctAnswers === opt;

                      let borderClass = 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300';
                      let badge = '';

                      if (isCorrectOpt) {
                        borderClass = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold';
                        badge = '✓ Correct Answer';
                      } else if (wasSelected && !isCorrectOpt) {
                        borderClass = 'border-red-500/50 bg-red-500/10 text-red-500 font-bold';
                        badge = '✗ Your Selection';
                      }

                      if (wasSelected && isCorrectOpt) {
                        badge = '✓ Correct Selection';
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-2xl border flex justify-between items-center ${borderClass}`}>
                          <div className="flex items-center space-x-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-200/70 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px]">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </div>
                          {badge && <span className="text-[9px] uppercase font-black tracking-wider">{badge}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* If blank question */}
                {(!q.options || q.options.length === 0) && (
                  <div className="space-y-2 text-xs">
                    <p className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                      Your answer: <strong className={isCorrect ? 'text-emerald-500' : 'text-red-500'}>{studentSelected[0] || '(Blank)'}</strong>
                    </p>
                    <p className="p-3 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold">
                      Correct Key: {correctKeyStr}
                    </p>
                  </div>
                )}

                {/* Comprehensive Solution & Technical Explanation */}
                <div className="p-4 bg-slate-100/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-black uppercase text-[9px] tracking-wider">
                      Verified Answer Key
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {correctKeyStr}
                    </span>
                  </div>

                  {q.explanation && (
                    <div className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      <strong className="text-blue-500 font-extrabold uppercase text-[10px] tracking-wider block mb-0.5">
                        💡 Solution & Academic Concept:
                      </strong>
                      {q.explanation}
                    </div>
                  )}

                  {!isCorrect && (
                    <div className="text-[11px] text-amber-600 dark:text-amber-400 pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                      <strong>Note on Selection:</strong> You selected <em>"{studentChoiceStr}"</em>, whereas the question requires <em>"{correctKeyStr}"</em>.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default QuizResult;
