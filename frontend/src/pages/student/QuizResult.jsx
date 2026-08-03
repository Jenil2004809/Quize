import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaHourglass, FaDownload, FaShareAlt, FaTrophy, FaArrowLeft } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
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
  const [downloading, setDownloading] = useState(false);

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

  // Chart configuration
  const chartData = {
    labels: ['Correct', 'Wrong', 'Skipped'],
    datasets: [
      {
        data: [result.correctAnswers, result.wrongAnswers, result.skippedAnswers],
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
        text: 'You can share this URL to display your quiz solutions.',
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

  // Convert HTML certificate to PDF
  const handleDownloadCertificate = async () => {
    setDownloading(true);
    const input = document.getElementById('certificate-template');

    // Force style visibility for rendering
    input.style.display = 'block';

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);
      const canvas = await html2canvas(input, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Quizzy_Certificate_${certificateId}.pdf`);
      
      // Hide template again
      input.style.display = 'none';
      setDownloading(false);
      
      Swal.fire({
        title: 'Downloaded! 🎓',
        text: 'Your PDF Certificate has been saved.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (err) {
      console.error(err);
      input.style.display = 'none';
      setDownloading(false);
      Swal.fire('Error', 'Certificate PDF generation failed.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8 relative">
      
      {/* Return link */}
      <button onClick={() => navigate('/student-dashboard')} className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-500 transition-colors">
        <FaArrowLeft />
        <span>Return to Student Dashboard</span>
      </button>

      {/* Hero Banner */}
      <div className={`glass-card rounded-3xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between border-l-8 ${
        result.passed ? 'border-emerald-500' : 'border-red-500'
      }`}>
        <div className="space-y-3 text-center md:text-left">
          <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">
            {quiz?.category?.name}
          </span>
          <h1 className="text-3xl font-black">{quiz?.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {result.passed ? (
              <span className="text-emerald-500 font-bold">Congratulations! You passed the quiz and cleared the threshold!</span>
            ) : (
              <span className="text-red-500 font-bold">You did not meet the passing marks threshold of {quiz?.passingMarks}. Try again!</span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
          {certificateId && (
            <button
              onClick={handleDownloadCertificate}
              disabled={downloading}
              className="flex items-center space-x-1.5 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover-scale shadow shadow-purple-500/10"
            >
              <FaDownload />
              <span>{downloading ? 'Downloading...' : 'PDF Certificate'}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            disabled={sharing}
            className="flex items-center space-x-1.5 border border-slate-300 dark:border-slate-800 text-slate-500 hover:text-blue-500 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover-scale"
          >
            <FaShareAlt />
            <span>Share Result</span>
          </button>
        </div>
      </div>

      {/* Grid: Charts vs Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Summary stats */}
        <div className="md:col-span-2 glass-card rounded-3xl p-6 grid grid-cols-2 gap-4">
          {[
            { icon: <FaTrophy className="text-yellow-500" />, title: 'Marks Obtained', val: `${result.score}` },
            { icon: <FaCheckCircle className="text-emerald-500" />, title: 'Percentage', val: `${result.percentage}%` },
            { icon: <FaHourglass className="text-blue-500" />, title: 'Time taken', val: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` },
            { icon: <FaCheckCircle className="text-indigo-500" />, title: 'Questions Passed', val: `${result.correctAnswers} / ${result.totalQuestions}` }
          ].map((stat, i) => (
            <div key={i} className="p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl flex items-center space-x-3">
              <div className="p-3 bg-white dark:bg-slate-950 rounded-xl text-lg">{stat.icon}</div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{stat.title}</p>
                <h4 className="text-lg font-black">{stat.val}</h4>
              </div>
            </div>
          ))}
        </div>

        {/* Doughnut Chart */}
        <div className="glass-card rounded-3xl p-6 flex flex-col justify-between items-center text-center">
          <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wide">Answers Ratio</h3>
          <div className="w-40 h-40 mt-4">
            <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
          <div className="flex space-x-3 mt-4 text-[10px] font-bold">
            <span className="text-emerald-500">✓ {result.correctAnswers} Correct</span>
            <span className="text-red-500">✗ {result.wrongAnswers} Wrong</span>
          </div>
        </div>

      </div>

      {/* Detailed Solutions Review */}
      <div className="space-y-4">
        <h3 className="font-black text-xl">Review Solutions</h3>
        <p className="text-slate-400 text-xs mt-0.5">Examine the correct answer keys and descriptions for each question</p>

        <div className="space-y-4 pt-2">
          {questions.map((q, idx) => {
            const studentAnsObj = result.answers.find(a => a.questionId === q._id);
            const studentSelected = studentAnsObj?.selectedAnswers || [];
            const isCorrect = studentAnsObj?.isCorrect;

            return (
              <div key={q._id} className="glass-card rounded-3xl p-6 space-y-4">
                <div className="flex justify-between items-start pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-blue-500">Q{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold uppercase">{q.type}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {isCorrect ? `Correct (+${q.marks})` : `Incorrect (-${q.negativeMarks})`}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white leading-relaxed">{q.text}</h4>

                {/* Display options if MCQ */}
                {q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const wasSelected = studentSelected.includes(opt);
                      const isCorrectOpt = q.correctAnswers.includes(opt);

                      let borderClass = 'border-slate-200 dark:border-slate-800 ';
                      let badge = '';

                      if (isCorrectOpt) {
                        borderClass = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold ';
                        badge = '✓ Correct Key';
                      } else if (wasSelected && !isCorrectOpt) {
                        borderClass = 'border-red-500/40 bg-red-500/5 text-red-500 font-bold ';
                        badge = '✗ Your Choice';
                      }

                      if (wasSelected && isCorrectOpt) {
                        badge = '✓ Correct Choice';
                      }

                      return (
                        <div key={oIdx} className={`p-3 rounded-xl border flex justify-between items-center ${borderClass}`}>
                          <div className="flex items-center space-x-2">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-[9px]">{oIdx + 1}</span>
                            <span>{opt}</span>
                          </div>
                          {badge && <span className="text-[9px] uppercase font-bold tracking-wider">{badge}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* If blank question */}
                {q.options.length === 0 && (
                  <div className="space-y-2 text-xs">
                    <p className="p-3 bg-slate-100 dark:bg-slate-900 rounded-xl">
                      Your answer: <strong className={isCorrect ? 'text-emerald-500' : 'text-red-500'}>{studentSelected[0] || '(Blank)'}</strong>
                    </p>
                    <p className="p-3 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold">
                      Correct Key: {q.correctAnswers.join(', ')}
                    </p>
                  </div>
                )}

                {q.explanation && (
                  <div className="p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Hidden Corporate PDF Certificate Template Container */}
      <div
        id="certificate-template"
        style={{
          display: 'none',
          width: '800px',
          height: '565px', // Landscape aspect ratio
          padding: '40px',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          fontFamily: 'serif',
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          boxSizing: 'border-box'
        }}
      >
        <div style={{
          border: '10px double #b45309', // gold border
          height: '100%',
          padding: '30px',
          boxSizing: 'border-box',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundImage: 'radial-gradient(circle, #fefbf3 0%, #fff 100%)'
        }}>
          <div>
            <h2 style={{ color: '#b45309', fontSize: '32px', margin: '0 0 5px 0', letterSpacing: '2px', fontWeight: 'bold' }}>CERTIFICATE OF COMPLETION</h2>
            <p style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', margin: '0' }}>This credential is officially issued by Quizzy International Academy</p>
          </div>

          <div style={{ margin: '20px 0' }}>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 10px 0' }}>This is to certify that</p>
            <h3 style={{ fontSize: '30px', fontWeight: 'bold', textTransform: 'uppercase', margin: '0 0 10px 0', borderBottom: '2px solid #b45309', display: 'inline-block', paddingBottom: '5px', color: '#1e3a8a' }}>
              {result.studentId?.name}
            </h3>
            <p style={{ fontSize: '13px', color: '#64748b', width: '80%', margin: '10px auto 0 auto', lineHeight: '1.6' }}>
              has successfully completed and passed the online assessment for <br />
              <strong style={{ color: '#1e293b', fontSize: '15px' }}>"{quiz?.title}"</strong> <br />
              earning a final score of <strong style={{ color: '#1e293b' }}>{result.score}</strong> points, representing a total passing grade of <strong style={{ color: '#b45309', fontSize: '16px' }}>{result.percentage}%</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', padding: '0 40px' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '0' }}>Verification ID: {certificateId}</p>
              <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0' }}>Date Issued: {new Date(result.createdAt).toLocaleDateString()}</p>
            </div>
            
            {/* Institute signature logo mock */}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontStyle: 'italic', fontFamily: 'cursive', fontSize: '18px', color: '#1e3a8a', borderBottom: '1px solid #94a3b8', paddingBottom: '3px' }}>
                System Verification
              </div>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '5px 0 0 0' }}>Quizzy Assessment Director</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default QuizResult;
