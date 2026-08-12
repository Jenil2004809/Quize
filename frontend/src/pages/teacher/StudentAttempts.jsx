import React, { useState, useEffect } from 'react';
import { FaCheckDouble, FaExclamationCircle, FaCheckCircle, FaFilter, FaSearch, FaEye, FaTimes, FaUser, FaClock, FaTrophy, FaAward, FaFileExcel } from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const StudentAttempts = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [attempts, setAttempts] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // Modal State for detailed student breakdown
  const [selectedAttemptId, setSelectedAttemptId] = useState(null);
  const [attemptDetail, setAttemptDetail] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Fetch teacher quizzes first
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes/creator');
        if (res.data.success) {
          setQuizzes(res.data.quizzes);
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
      setAttemptsLoading(true);
      try {
        const url = selectedQuizId === 'all'
          ? '/results/teacher/all'
          : `/results/quiz/${selectedQuizId}`;
        const res = await api.get(url);
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

  // Open detail breakdown modal
  const openDetailModal = async (attemptId) => {
    setSelectedAttemptId(attemptId);
    setModalLoading(true);
    try {
      const res = await api.get(`/results/${attemptId}`);
      if (res.data.success) {
        setAttemptDetail(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedAttemptId(null);
    setAttemptDetail(null);
  };

  // Filter attempts based on search and status
  const filteredAttempts = attempts.filter(a => {
    const studentName = a.studentId?.name || '';
    const studentEmail = a.studentId?.email || '';
    const quizTitle = a.quizId?.title || '';
    const matchesSearch = studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          quizTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                          (statusFilter === 'passed' && a.passed) ||
                          (statusFilter === 'failed' && !a.passed);
    return matchesSearch && matchesStatus;
  });

  // Calculate summary stats
  const totalAttempts = filteredAttempts.length;
  const passedAttempts = filteredAttempts.filter(a => a.passed).length;
  const avgPercentage = totalAttempts > 0
    ? (filteredAttempts.reduce((acc, curr) => acc + (curr.percentage || 0), 0) / totalAttempts).toFixed(1)
    : 0;
  const passRate = totalAttempts > 0
    ? ((passedAttempts / totalAttempts) * 100).toFixed(1)
    : 0;

  // Export Class Results to Excel Spreadsheet with Student Email IDs
  const handleExportExcel = async () => {
    if (filteredAttempts.length === 0) {
      return Swal.fire('No Records', 'There are no student attempt records to export.', 'warning');
    }

    try {
      const XLSX = await import('xlsx');

      const excelRows = filteredAttempts.map((a, idx) => ({
        'S.No': idx + 1,
        'Student Name': a.studentId?.name || 'N/A',
        'Student Email ID': a.studentId?.email || 'N/A',
        'Student ID': a.studentId?._id ? a.studentId._id.toString() : 'N/A',
        'Quiz Title': a.quizId?.title || 'N/A',
        'Subject / Category': a.quizId?.subject || a.quizId?.category?.name || 'N/A',
        'Score (Marks)': a.score || 0,
        'Percentage (%)': `${a.percentage || 0}%`,
        'Correct Answers': a.correctAnswers || 0,
        'Wrong Answers': a.wrongAnswers || 0,
        'Skipped Answers': a.skippedAnswers || 0,
        'Time Taken': `${Math.floor((a.timeTaken || 0) / 60)}m ${(a.timeTaken || 0) % 60}s`,
        'Result Status': a.passed ? 'PASSED' : 'FAILED',
        'Tab Switch Disqualified': a.wasDisqualified ? 'YES' : 'NO',
        'Integrity Score': `${a.integrityScore || 100}%`,
        'Attempt Date & Time': new Date(a.createdAt).toLocaleString()
      }));

      const ws = XLSX.utils.json_to_sheet(excelRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Student Class Results');

      const filename = `Class_Quiz_Results_Report_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename);

      Swal.fire({
        title: 'Excel Report Downloaded! 📊',
        text: `Exported ${filteredAttempts.length} student records with Email IDs to ${filename}`,
        icon: 'success',
        confirmButtonColor: '#10b981'
      });
    } catch (err) {
      console.error('Error exporting Excel:', err);
      Swal.fire('Export Error', 'Could not generate Excel spreadsheet.', 'error');
    }
  };

  if (quizzesLoading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6 text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaCheckDouble className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Student Exam Attempts</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Track student information, performance, and answer breakdowns</p>
          </div>
        </div>

        {/* Filter controls & Excel Export Button */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-500/20 hover-scale"
          >
            <FaFileExcel className="w-3.5 h-3.5" />
            <span>Export Results (Excel)</span>
          </button>

          {/* Quiz selector */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold">
            <FaFilter className="text-slate-400" />
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Quizzes</option>
              {quizzes.map(q => <option key={q._id} value={q._id}>{q.title}</option>)}
            </select>
          </div>

          {/* Status selector */}
          <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl text-xs font-semibold">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaUser className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Submissions</p>
            <h3 className="text-2xl font-black">{totalAttempts}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl"><FaCheckCircle className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Passed Students</p>
            <h3 className="text-2xl font-black text-emerald-500">{passedAttempts}</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl"><FaTrophy className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-black">{avgPercentage}%</h3>
          </div>
        </div>

        <div className="glass-card p-5 rounded-3xl flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-500 rounded-2xl"><FaAward className="w-5 h-5" /></div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pass Rate</p>
            <h3 className="text-2xl font-black text-purple-500">{passRate}%</h3>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative glass-card p-3 rounded-2xl">
        <FaSearch className="absolute left-6 top-5 text-slate-400 text-sm" />
        <input
          type="text"
          placeholder="Filter by student name, email address, or quiz title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
        />
      </div>

      {/* Attempts Table Card */}
      <div className="glass-card rounded-3xl p-6">
        {attemptsLoading ? (
          <LoadingSkeleton type="list" count={4} />
        ) : filteredAttempts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-12">No student attempt records match your current parameters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Student Information</th>
                  <th className="pb-3">Quiz Name</th>
                  <th className="pb-3">Score & Percentage</th>
                  <th className="pb-3">Time Taken</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Attempt Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-bold">
                      <div className="flex items-center space-x-3">
                        <img
                          src={attempt.studentId?.avatar ? `${ASSET_BASE_URL}${attempt.studentId.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (attempt.studentId?.name || 'student')}
                          alt="avatar"
                          className="w-9 h-9 rounded-full border border-blue-500/30 object-cover flex-shrink-0"
                        />
                        <div>
                          <p className="text-slate-900 dark:text-white font-extrabold">{attempt.studentId?.name || 'Student User'}</p>
                          <p className="text-xs text-slate-400 font-medium">{attempt.studentId?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {attempt.quizId?.title || 'Quiz'}
                      </span>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-blue-500">{attempt.percentage}%</span>
                        <span className="text-xs text-slate-400 font-semibold">{attempt.score} marks ({attempt.correctAnswers || 0}/{attempt.totalQuestions || 0} correct)</span>
                      </div>
                    </td>

                    <td className="py-4 text-slate-500 font-semibold">
                      <span className="flex items-center space-x-1">
                        <FaClock className="text-xs text-slate-400" />
                        <span>{Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s</span>
                      </span>
                    </td>

                    <td className="py-4">
                      <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black ${
                        attempt.passed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {attempt.passed ? <FaCheckCircle className="text-[10px]" /> : <FaExclamationCircle className="text-[10px]" />}
                        <span>{attempt.passed ? 'PASSED' : 'FAILED'}</span>
                      </span>
                    </td>

                    <td className="py-4 text-slate-400 text-xs font-semibold">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-4 text-right">
                      <button
                        onClick={() => openDetailModal(attempt._id)}
                        className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white font-bold text-xs transition-all hover-scale"
                        title="View Detailed Breakdown"
                      >
                        <FaEye />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Attempt Breakdown Modal */}
      {selectedAttemptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 overflow-y-auto space-y-6 relative border border-slate-200 dark:border-slate-800 shadow-2xl">
            <button
              onClick={closeModal}
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>

            {modalLoading || !attemptDetail ? (
              <div className="py-16 text-center space-y-4">
                <LoadingSkeleton type="card" count={1} />
                <p className="text-xs text-slate-400 font-bold">Loading attempt detailed response payload...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={attemptDetail.result.studentId?.avatar ? `${ASSET_BASE_URL}${attemptDetail.result.studentId.avatar}` : 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (attemptDetail.result.studentId?.name || 'student')}
                      alt="avatar"
                      className="w-12 h-12 rounded-full border-2 border-blue-500 object-cover"
                    />
                    <div>
                      <h2 className="text-xl font-black">{attemptDetail.result.studentId?.name}</h2>
                      <p className="text-xs text-slate-400 font-medium">{attemptDetail.result.studentId?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase font-bold">Exam Title</p>
                      <p className="text-sm font-extrabold text-blue-500">{attemptDetail.result.quizId?.title}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-black ${
                      attemptDetail.result.passed ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {attemptDetail.result.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {/* Performance Metrics summary */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Percentage</p>
                    <p className="text-lg font-black text-blue-500">{attemptDetail.result.percentage}%</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Score</p>
                    <p className="text-lg font-black">{attemptDetail.result.score} marks</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Correct / Total</p>
                    <p className="text-lg font-black text-emerald-500">{attemptDetail.result.correctAnswers || 0} / {attemptDetail.result.totalQuestions}</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Time Spent</p>
                    <p className="text-lg font-black text-purple-500">{Math.floor(attemptDetail.result.timeTaken / 60)}m {attemptDetail.result.timeTaken % 60}s</p>
                  </div>
                </div>

                {/* Answer breakdown list */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-extrabold text-base border-b border-slate-100 dark:border-slate-800 pb-2">Question-by-Question Response Log</h3>
                  {attemptDetail.questions.map((q, idx) => {
                    const studentAnsObj = attemptDetail.result.answers?.find(a => a.questionId === q._id || a.questionId?._id === q._id);
                    const isCorrect = studentAnsObj ? studentAnsObj.isCorrect : false;
                    const selectedAnswers = studentAnsObj ? studentAnsObj.selectedAnswers : [];

                    return (
                      <div key={q._id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-black text-blue-500">Q{idx + 1}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-500 font-bold uppercase">{q.type}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {isCorrect ? 'Correct (+Marks)' : 'Incorrect'}
                          </span>
                        </div>

                        <p className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed">{q.text}</p>

                        {/* Options */}
                        {q.options && q.options.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, oIdx) => {
                              const isSelected = selectedAnswers.includes(opt);
                              const isKey = q.correctAnswers.includes(opt);

                              let style = 'border-slate-200 dark:border-slate-800';
                              if (isSelected && isKey) style = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold';
                              else if (isSelected && !isKey) style = 'border-red-500 bg-red-500/10 text-red-500 font-bold';
                              else if (isKey) style = 'border-emerald-500/50 bg-emerald-500/5 text-emerald-600 font-semibold';

                              return (
                                <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center justify-between ${style}`}>
                                  <span>{opt}</span>
                                  {isSelected && <span className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Selected</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Text matching / correct key */}
                        {(!q.options || q.options.length === 0) && (
                          <div className="text-xs space-y-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-900">
                            <p><strong>Student Entered:</strong> <span className={isCorrect ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{selectedAnswers.join(', ') || '(No Answer Submitted)'}</span></p>
                            <p><strong>Correct Key:</strong> <span className="text-emerald-500 font-bold">{q.correctAnswers.join(', ')}</span></p>
                          </div>
                        )}

                        {q.explanation && (
                          <p className="text-xs text-slate-400 pt-1 leading-relaxed"><strong>Explanation:</strong> {q.explanation}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentAttempts;
