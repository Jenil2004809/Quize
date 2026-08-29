import React, { useState, useEffect, useRef } from 'react';
import { 
  FaVideo, FaSearch, FaFilter, FaDownload, FaTrash, FaCheckCircle, 
  FaExclamationTriangle, FaTimesCircle, FaPlay, FaClock, 
  FaShieldAlt, FaTrophy, FaUser, FaRedo, FaTimes, FaDesktop, FaEye
} from 'react-icons/fa';
import api, { ASSET_BASE_URL } from '../../services/api';
import Swal from 'sweetalert2';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import PageTransition from '../../components/PageTransition';

const QuizRecordings = ({ role = 'teacher' }) => {
  const [recordings, setRecordings] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [violationsOnly, setViolationsOnly] = useState(false);

  // Video Modal State
  const [activeRecording, setActiveRecording] = useState(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoPlayerRef = useRef(null);

  // Fetch available quizzes for filter
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const url = role === 'admin' ? '/quizzes?limit=500' : '/quizzes/creator';
        const res = await api.get(url);
        if (res.data.success) {
          setQuizzes(res.data.quizzes || []);
        }
      } catch (err) {
        console.error('Error fetching quizzes for recordings filter:', err);
      }
    };
    fetchQuizzes();
  }, [role]);

  // Fetch recordings list
  const fetchRecordings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setRefreshing(true);
    try {
      const endpoint = role === 'admin' ? '/recordings/admin' : '/recordings/teacher';
      const params = {};
      if (selectedQuizId !== 'all') params.quizId = selectedQuizId;
      if (statusFilter === 'passed') params.passed = 'true';
      if (statusFilter === 'failed') params.passed = 'false';
      if (violationsOnly) params.violationsOnly = 'true';
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get(endpoint, { params });
      if (res.data.success) {
        setRecordings(res.data.recordings || []);
      }
    } catch (err) {
      console.error('Error fetching quiz session recordings:', err);
      Swal.fire({
        title: 'Error Loading Recordings',
        text: err.response?.data?.message || 'Could not load quiz recordings.',
        icon: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecordings(true);
  }, [role, selectedQuizId, statusFilter, violationsOnly]);

  // Handle Search Debounce / Trigger
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecordings(true);
  };

  // Change video playback speed
  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoPlayerRef.current) {
      videoPlayerRef.current.playbackRate = speed;
    }
  };

  // Admin delete recording
  const handleDeleteRecording = async (resultId, studentName) => {
    if (role !== 'admin') return;

    Swal.fire({
      title: `Delete Session Recording?`,
      text: `Are you sure you want to permanently delete the proctored exam recording for ${studentName}? The video file will be removed from disk.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Video'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/recordings/${resultId}`);
          if (res.data.success) {
            setRecordings(prev => prev.filter(r => r._id !== resultId));
            if (activeRecording?._id === resultId) {
              setActiveRecording(null);
            }
            Swal.fire({
              title: 'Deleted!',
              text: 'Proctoring recording file deleted successfully.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Delete Failed', err.response?.data?.message || 'Could not delete recording.', 'error');
        }
      }
    });
  };

  // Format Duration helper
  const formatDuration = (seconds) => {
    const s = Math.round(seconds || 0);
    const mins = Math.floor(s / 60);
    const remSecs = s % 60;
    return `${mins}m ${remSecs < 10 ? '0' : ''}${remSecs}s`;
  };

  // Format File Size helper
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return 'N/A';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  // Summary Metrics
  const totalRecordings = recordings.length;
  const violationSessions = recordings.filter(r => r.wasDisqualified || r.tabViolationLocked || (r.tabChangeCount || 0) > 0 || (r.integrityScore || 100) < 80).length;
  const cleanSessions = totalRecordings - violationSessions;
  const totalMonitoredSeconds = recordings.reduce((acc, curr) => acc + (curr.recordingDuration || curr.timeTaken || 0), 0);

  return (
    <PageTransition className="space-y-8 text-left max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
              <FaVideo className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Exam Session & Window Recordings
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {role === 'admin' 
                  ? 'Platform-wide proctored exam video recordings with integrity timeline & playback review.'
                  : 'Review student quiz window recordings, candidate biometric integrity, and exam screen sessions.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => fetchRecordings(false)}
          disabled={refreshing}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all self-start sm:self-auto"
        >
          <FaRedo className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Recordings</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Recordings</span>
            <FaVideo className="text-blue-500 w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalRecordings}</p>
          <p className="text-[11px] text-slate-500">Captured Exam Sessions</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Clean Sessions</span>
            <FaCheckCircle className="text-emerald-500 w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{cleanSessions}</p>
          <p className="text-[11px] text-slate-500">High Integrity Rating (100%)</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Flagged / Violations</span>
            <FaExclamationTriangle className="text-amber-500 w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{violationSessions}</p>
          <p className="text-[11px] text-slate-500">Off-Screen / Tab Switches</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Monitored Duration</span>
            <FaClock className="text-purple-500 w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{formatDuration(totalMonitoredSeconds)}</p>
          <p className="text-[11px] text-slate-500">Total Proctored Video Time</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by student name, email, or quiz title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Quiz Selector */}
          <div className="w-full md:w-64">
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Quizzes</option>
              {quizzes.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.title}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="w-full md:w-40">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Results</option>
              <option value="passed">Passed Only</option>
              <option value="failed">Failed Only</option>
            </select>
          </div>

          {/* Violations Only Toggle */}
          <button
            type="button"
            onClick={() => setViolationsOnly(!violationsOnly)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all whitespace-nowrap ${
              violationsOnly
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FaExclamationTriangle className="w-3.5 h-3.5" />
            <span>Violations Only</span>
          </button>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Recordings List */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : recordings.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full inline-block">
            <FaVideo className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Exam Video Recordings Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            {searchTerm || selectedQuizId !== 'all' || violationsOnly
              ? 'No quiz recordings match your active search filters. Try clearing some criteria.'
              : 'As students take and submit proctored quizzes, their session video recordings will appear here automatically.'}
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-900/70 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-4">Student Candidate</th>
                  <th className="px-5 py-4">Quiz Assessment</th>
                  <th className="px-5 py-4">Score & Status</th>
                  <th className="px-5 py-4">AI Integrity Score</th>
                  <th className="px-5 py-4">Duration & Size</th>
                  <th className="px-5 py-4">Date & Time</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60">
                {recordings.map((rec) => {
                  const student = rec.studentId || {};
                  const quiz = rec.quizId || {};
                  const isViolation = rec.wasDisqualified || rec.tabViolationLocked || (rec.tabChangeCount || 0) > 0 || (rec.integrityScore || 100) < 80;

                  return (
                    <tr 
                      key={rec._id} 
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setActiveRecording(rec)}
                    >
                      {/* Student Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={student.avatar ? `${ASSET_BASE_URL}${student.avatar}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.name || 'user'}`}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full border border-slate-300 dark:border-slate-700 object-cover"
                          />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-xs">{student.name || 'Candidate Student'}</p>
                            <p className="text-[11px] text-slate-400">{student.email || 'No email'}</p>
                          </div>
                        </div>
                      </td>

                      {/* Quiz Title */}
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[200px]">{quiz.title || 'Untitled Quiz'}</p>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-500">
                            {quiz.difficulty || 'medium'}
                          </span>
                        </div>
                      </td>

                      {/* Score & Pass/Fail */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`font-black text-sm ${rec.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {rec.percentage}%
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            rec.passed 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {rec.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                        {rec.wasDisqualified && (
                          <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/20 text-red-500">
                            🚨 Disqualified
                          </span>
                        )}
                      </td>

                      {/* Integrity Score & Violations */}
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-2">
                          <div className={`px-2.5 py-1 rounded-xl text-xs font-black flex items-center space-x-1 ${
                            (rec.integrityScore || 100) >= 85
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : (rec.integrityScore || 100) >= 60
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-red-500/10 text-red-500'
                          }`}>
                            <FaShieldAlt className="w-3 h-3" />
                            <span>{rec.integrityScore ?? 100}%</span>
                          </div>

                          {(rec.tabChangeCount || 0) > 0 && (
                            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                              {rec.tabChangeCount} tab {rec.tabChangeCount === 1 ? 'alert' : 'alerts'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Duration & Size */}
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                        <p className="font-semibold flex items-center space-x-1">
                          <FaClock className="w-3 h-3 text-slate-400" />
                          <span>{formatDuration(rec.recordingDuration || rec.timeTaken)}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{formatFileSize(rec.recordingSize)}</p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-slate-500 text-[11px]">
                        {new Date(rec.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                        <br />
                        <span className="text-[10px] text-slate-400">
                          {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setActiveRecording(rec)}
                            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center space-x-1.5 transition-all shadow-md shadow-blue-500/20"
                            title="Play Recording"
                          >
                            <FaPlay className="w-2.5 h-2.5" />
                            <span>Watch</span>
                          </button>

                          {role === 'admin' && (
                            <button
                              onClick={() => handleDeleteRecording(rec._id, student.name || 'Candidate')}
                              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all text-xs"
                              title="Delete Video Recording"
                            >
                              <FaTrash className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INTERACTIVE VIDEO MODAL PLAYER */}
      {activeRecording && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl">
                  <FaVideo className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white text-base">
                    Proctored Exam Session Recording
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {activeRecording.studentId?.name} • {activeRecording.quizId?.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <a
                  href={`${ASSET_BASE_URL}${activeRecording.recordingUrl}`}
                  download={`recording_${activeRecording._id}.webm`}
                  className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all"
                  title="Download Recording File"
                >
                  <FaDownload className="w-3 h-3" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => setActiveRecording(null)}
                  className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 transition-all"
                  aria-label="Close Modal"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 overflow-y-auto">
              
              {/* Left Column - Video Player (2 cols on LG) */}
              <div className="lg:col-span-2 bg-black flex flex-col justify-center items-center relative p-3 sm:p-4 min-h-[320px]">
                <video
                  ref={videoPlayerRef}
                  src={`${ASSET_BASE_URL}${activeRecording.recordingUrl}`}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-[50vh] rounded-2xl shadow-lg object-contain bg-slate-950"
                />

                {/* Speed Controls Bar */}
                <div className="w-full flex items-center justify-between mt-3 px-2 text-white text-xs">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <FaDesktop className="w-3.5 h-3.5 text-blue-400" />
                    <span>Live Candidate Screen & Camera Stream</span>
                  </div>

                  <div className="flex items-center space-x-1 bg-slate-800/80 px-2 py-1 rounded-xl">
                    <span className="text-[11px] text-slate-400 mr-1">Speed:</span>
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${
                          playbackRate === speed ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Audit & Session Metadata */}
              <div className="p-5 space-y-5 bg-white dark:bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 text-xs">
                
                {/* Candidate Overview Card */}
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-slate-400">
                    Candidate Profile
                  </h4>
                  <div className="flex items-center space-x-3">
                    <img
                      src={activeRecording.studentId?.avatar ? `${ASSET_BASE_URL}${activeRecording.studentId.avatar}` : `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeRecording.studentId?.name || 'user'}`}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-blue-500 object-cover"
                    />
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-sm">{activeRecording.studentId?.name}</p>
                      <p className="text-slate-400 text-[11px]">{activeRecording.studentId?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Score & Integrity Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Exam Score</span>
                    <p className={`text-xl font-black ${activeRecording.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {activeRecording.score} pts ({activeRecording.percentage}%)
                    </p>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      activeRecording.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {activeRecording.passed ? 'Passed Exam' : 'Failed Exam'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">AI Integrity</span>
                    <p className={`text-xl font-black ${
                      (activeRecording.integrityScore || 100) >= 85
                        ? 'text-emerald-500'
                        : (activeRecording.integrityScore || 100) >= 60
                        ? 'text-amber-500'
                        : 'text-red-500'
                    }`}>
                      {activeRecording.integrityScore ?? 100}%
                    </p>
                    <span className="inline-block text-[10px] text-slate-400 font-semibold">
                      {activeRecording.tabChangeCount || 0} Tab Switches
                    </span>
                  </div>
                </div>

                {/* Session Timeline Details */}
                <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-slate-400">
                    Proctoring Audit Summary
                  </h4>
                  
                  <div className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Time Taken:</span>
                      <span className="font-bold">{formatDuration(activeRecording.recordingDuration || activeRecording.timeTaken)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Video File Size:</span>
                      <span className="font-bold">{formatFileSize(activeRecording.recordingSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Disqualification:</span>
                      <span className={`font-bold ${activeRecording.wasDisqualified ? 'text-red-500' : 'text-emerald-500'}`}>
                        {activeRecording.wasDisqualified ? 'Yes (Violations Exceeded)' : 'No (Compliant)'}
                      </span>
                    </div>
                    {activeRecording.disqualificationReason && (
                      <div className="p-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] leading-relaxed">
                        <strong>Reason:</strong> {activeRecording.disqualificationReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Violation Log Events */}
                {activeRecording.violationHistory && activeRecording.violationHistory.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[10px] text-amber-500 flex items-center space-x-1">
                      <FaExclamationTriangle className="w-3 h-3" />
                      <span>Detected Events Timeline</span>
                    </h4>
                    <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                      {activeRecording.violationHistory.map((v, vIdx) => (
                        <div key={vIdx} className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px]">
                          <span className="font-bold">• {v.eventType || 'TAB_CHANGE'}:</span>{' '}
                          {new Date(v.timestamp).toLocaleTimeString()} ({v.browser || 'Browser Alert'})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

    </PageTransition>
  );
};

export default QuizRecordings;
