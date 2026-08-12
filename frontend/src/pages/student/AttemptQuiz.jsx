import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Swal from 'sweetalert2';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import BiometricIntegrityRadar from '../../components/BiometricIntegrityRadar';
import { 
  FaClock, 
  FaExclamationTriangle, 
  FaChevronLeft, 
  FaChevronRight, 
  FaBookmark, 
  FaFlag, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaQuestionCircle, 
  FaDesktop, 
  FaShieldAlt 
} from 'react-icons/fa';

const AttemptQuiz = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // User state responses
  const [userAnswers, setUserAnswers] = useState({}); // questionId -> selectedAnswers: []
  const [flagged, setFlagged] = useState({}); // questionId -> boolean
  const [visited, setVisited] = useState({}); // questionId -> boolean
  const [integrityScore, setIntegrityScore] = useState(100);

  // Timer States
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  // Fullscreen & Violation States
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [warningsCount, setWarningsCount] = useState(0);
  const lastViolationReasonRef = useRef('');

  // Initialize violation count from LocalStorage to prevent bypass by refresh
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem(`quiz_violations_${quizId}`) || '0', 10);
    setWarningsCount(savedCount);
  }, [quizId]);

  // Handle Cheating / Off-Screen Focus Violations
  const handleProctorViolation = (violationMsg) => {
    if (violationMsg) lastViolationReasonRef.current = violationMsg;
    const savedCount = parseInt(localStorage.getItem(`quiz_violations_${quizId}`) || '0', 10);
    const currentCount = savedCount + 1;
    localStorage.setItem(`quiz_violations_${quizId}`, currentCount.toString());
    setWarningsCount(currentCount);

    if (currentCount === 1) {
      Swal.fire({
        title: '⚠ Policy Violation Warning (1/3)',
        text: violationMsg || 'You looked away from the exam screen or switched tabs. Please keep your eyes focused on the screen. (Violation 1 of 3)',
        icon: 'warning',
        confirmButtonColor: '#f59e0b',
        confirmButtonText: 'I Understand & Continue',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    } else if (currentCount === 2) {
      Swal.fire({
        title: '⚠ Second Warning (2/3)',
        text: violationMsg || 'Second policy violation detected! One more off-screen eye gaze or tab switch will terminate your exam permanently.',
        icon: 'warning',
        confirmButtonColor: '#ef4444',
        confirmButtonText: 'Resume Exam',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    } else if (currentCount >= 3) {
      Swal.fire({
        title: 'Error Submitting ⚠️',
        text: 'Failed to record attempts. You exceeded the maximum allowed policy violations (off-screen eye gaze / tab change). Please contact admin.',
        icon: 'error',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        submitExamPayload(true);
      });
    }
  };

  // Fetch Quiz & Questions Details
  useEffect(() => {
    const startQuiz = async () => {
      try {
        setLoading(true);
        setLoadError('');

        // Security check: verify if student is blocked/terminated for this quiz
        try {
          const statusRes = await api.get(`/student/quiz-status/${quizId}`);
          if (statusRes.data && statusRes.data.canAttempt === false) {
            Swal.fire({
              title: 'Access Denied',
              text: statusRes.data.message || 'You exceeded the allowed tab change limit. Please wait until the administrator reviews your request.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'Return Home'
            }).then(() => {
              navigate('/', { replace: true });
            });
            return;
          }
        } catch (statusErr) {
          if (statusErr.response && statusErr.response.status === 403) {
            Swal.fire({
              title: 'Access Denied',
              text: statusErr.response.data?.message || 'You exceeded the allowed tab change limit. Please wait until the administrator reviews your request.',
              icon: 'error',
              confirmButtonColor: '#ef4444',
              confirmButtonText: 'Return Home'
            }).then(() => {
              navigate('/', { replace: true });
            });
            return;
          }
        }

        const quizRes = await api.get(`/quizzes/${quizId}`);
        const qRes = await api.get(`/quizzes/${quizId}/questions`);

        if (quizRes.data.success && qRes.data.success) {
          setQuiz(quizRes.data.quiz);
          const fetchedQuestions = Array.isArray(qRes.data.questions) ? qRes.data.questions : [];
          setQuestions(fetchedQuestions);
          setTimeLeft((quizRes.data.quiz?.timeLimit || 15) * 60);

          // Mark first question as visited
          if (fetchedQuestions.length > 0) {
            setVisited({ [fetchedQuestions[0]._id || 'q0']: true });
          }

          // Recover autosave from localStorage if matching
          const saved = localStorage.getItem(`autosave_${quizId}`);
          if (saved) {
            try {
              setUserAnswers(JSON.parse(saved));
            } catch (e) {
              console.error('Autosave parse error:', e);
            }
          }
        }
      } catch (err) {
        console.error('Start quiz fetch error:', err);
        const errorMsg = err.response?.data?.message || 'Could not load this quiz attempt.';
        setLoadError(errorMsg);
        if (err.response?.status === 403 || err.response?.data?.isPendingAdminApproval) {
          Swal.fire({
            title: 'Access Denied',
            text: errorMsg,
            icon: 'error',
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Return Home'
          }).then(() => {
            navigate('/', { replace: true });
          });
        }
      } finally {
        setLoading(false);
      }
    };
    startQuiz();
  }, [quizId, navigate]);

  // Non-blocking Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [loading, quiz]);

  // Start timer on successful load
  useEffect(() => {
    if (loading || !quiz || questions.length === 0 || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmitTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loading, quiz, questions.length]);

  // Auto-save active answers state to localStorage
  useEffect(() => {
    if (Object.keys(userAnswers).length > 0) {
      localStorage.setItem(`autosave_${quizId}`, JSON.stringify(userAnswers));
    }
  }, [userAnswers, quizId]);

  // Handle Option Select (Single vs Multiple)
  const handleOptionSelect = (qId, optionVal, isMultiple = false) => {
    setUserAnswers(prev => {
      const current = prev[qId] || [];
      let updated = [];

      if (isMultiple) {
        if (current.includes(optionVal)) {
          updated = current.filter(o => o !== optionVal);
        } else {
          updated = [...current, optionVal];
        }
      } else {
        updated = [optionVal];
      }

      return { ...prev, [qId]: updated };
    });
  };

  // Handle Fill-In-The-Blank Input
  const handleTextAnswerChange = (qId, textVal) => {
    setUserAnswers(prev => ({
      ...prev,
      [qId]: [textVal]
    }));
  };

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextId = questions[nextIdx]?._id;
      if (nextId) setVisited(prev => ({ ...prev, [nextId]: true }));
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      const prevId = questions[prevIdx]?._id;
      if (prevId) setVisited(prev => ({ ...prev, [prevId]: true }));
    }
  };

  const handleJumpToQuestion = (index) => {
    setCurrentIndex(index);
    const targetId = questions[index]?._id;
    if (targetId) setVisited(prev => ({ ...prev, [targetId]: true }));
  };

  const toggleFlag = (qId) => {
    setFlagged(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Auto submit when countdown timer expires
  const handleAutoSubmitTimeUp = () => {
    Swal.fire({
      title: 'Time is Up! ⏰',
      text: 'Your examination time limit has expired. Autosaving and submitting your responses.',
      icon: 'info',
      confirmButtonText: 'View My Result',
      confirmButtonColor: '#3b82f6',
      allowOutsideClick: false
    }).then(() => {
      submitExamPayload(false);
    });
  };

  // Submit Exam API Call Payload
  const submitExamPayload = async (isDisqualified = false) => {
    try {
      clearInterval(timerRef.current);
      const totalTime = (quiz?.timeLimit || 15) * 60;
      const timeTaken = Math.max(0, totalTime - timeLeft);

      const formattedAnswers = Object.keys(userAnswers).map(qId => ({
        questionId: qId,
        selectedAnswers: userAnswers[qId] || []
      }));

      const payload = {
        quizId,
        answers: isDisqualified ? [] : formattedAnswers,
        timeTaken,
        integrityScore: isDisqualified ? 0 : integrityScore,
        wasDisqualified: isDisqualified,
        disqualificationReason: isDisqualified ? (lastViolationReasonRef.current || 'Exceeded Tab / Eye-Gaze Policy Violations') : '',
        tabChangeCount: warningsCount,
        status: isDisqualified ? 'TERMINATED' : 'COMPLETED'
      };

      const res = await api.post('/results/submit', payload);

      // Clean autosave state
      localStorage.removeItem(`autosave_${quizId}`);
      localStorage.removeItem(`quiz_violations_${quizId}`);

      if (isDisqualified) {
        navigate('/', { replace: true });
      } else if (res.data.success) {
        navigate(`/quiz-result/${res.data.resultId}`, { replace: true });
      }
    } catch (error) {
      console.error('Submission Error:', error);
      if (isDisqualified) {
        navigate('/', { replace: true });
      } else {
        Swal.fire({
          title: 'Error Submitting ⚠️',
          text: error.response?.data?.message || 'Failed to record attempts. Please contact admin.',
          icon: 'error'
        });
      }
    }
  };

  // Confirm manual submission click
  const handleSubmitConfirmation = () => {
    const totalAnswered = Object.keys(userAnswers).filter(k => userAnswers[k]?.length > 0).length;
    const totalSkipped = questions.length - totalAnswered;
    const totalFlagged = Object.keys(flagged).filter(k => flagged[k]).length;

    Swal.fire({
      title: 'Submit Examination?',
      html: `
        <div class="text-left space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <p>• Total Questions: <strong>${questions.length}</strong></p>
          <p>• Answered: <strong>${totalAnswered}</strong></p>
          <p>• Skipped / Blank: <strong>${totalSkipped}</strong></p>
          <p>• Flagged for review: <strong>${totalFlagged}</strong></p>
          <p>• AI Integrity Rating: <strong>${integrityScore}% Trust Score</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Submit!'
    }).then((result) => {
      if (result.isConfirmed) {
        submitExamPayload(false);
      }
    });
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  if (loadError || !quiz || questions.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 px-4 text-center space-y-5">
        <FaTimesCircle className="w-14 h-14 text-red-500 mx-auto" />
        <h2 className="text-2xl font-black">Quiz Attempt Unavailable</h2>
        <p className="text-slate-500 text-sm">
          {loadError || 'This quiz does not have any questions available yet.'}
        </p>
        <button
          onClick={() => navigate(`/quizzes/${quizId}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm"
        >
          Back to Quiz Details
        </button>
      </div>
    );
  }

  // Safe question object extraction
  const currentQuestion = questions[currentIndex] || {};
  const qId = currentQuestion._id || `q_${currentIndex}`;
  const currentAnswers = userAnswers[qId] || [];

  // Allow all Question Type variations cleanly (mcq, single, single-select, multiple, multiple-correct, true-false, fill-in-the-blank)
  const isMultipleChoice = ['multiple-correct', 'multiple', 'multiple-select'].includes(currentQuestion.type);
  const isTrueFalse = ['true-false', 'boolean'].includes(currentQuestion.type);
  const isFillBlank = ['fill-in-the-blank', 'short-answer'].includes(currentQuestion.type);
  const isSingleChoice = !isMultipleChoice && !isTrueFalse && !isFillBlank;

  const optionsList = Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0
    ? currentQuestion.options
    : (isTrueFalse ? ['True', 'False'] : []);

  const totalAnsweredCount = Object.keys(userAnswers).filter(k => userAnswers[k]?.length > 0).length;
  const progressPercent = (totalAnsweredCount / (questions.length || 1)) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPaletteBtnClass = (idx) => {
    const qItem = questions[idx];
    if (!qItem) return 'w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center border transition-all bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400';
    const id = qItem._id;
    const isCurrent = idx === currentIndex;
    const isAns = userAnswers[id]?.length > 0;
    const isFlg = flagged[id];
    const isVst = visited[id];

    let base = 'w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center border transition-all ';

    if (isCurrent) {
      base += 'border-blue-600 ring-2 ring-blue-500/20 ';
    }

    if (isAns) {
      base += 'bg-emerald-500 text-white border-emerald-500 ';
    } else if (isFlg) {
      base += 'bg-amber-500 text-white border-amber-500 ';
    } else if (isVst) {
      base += 'bg-blue-500/10 text-blue-500 border-blue-300 ';
    } else {
      base += 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 ';
    }

    return base;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 text-left">
      
      {/* Top Banner Header */}
      <header className="glass-navbar border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex justify-between items-center h-16">
        <div className="flex items-center space-x-3">
          {quiz?.isSystemQuiz && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
              System Curriculum Quiz
            </span>
          )}
          <div>
            <h2 className="font-black text-sm md:text-base text-slate-900 dark:text-white line-clamp-1">
              {quiz?.title}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">
              Time Allowed: {quiz?.timeLimit} Mins | Total Questions: {questions.length}
            </p>
          </div>
        </div>

        {/* Live Countdown Timer */}
        <div className={`px-4 py-2 rounded-2xl border font-mono font-black text-xs md:text-sm flex items-center space-x-2 ${
          timeLeft < 300 
            ? 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse' 
            : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
        }`}>
          <FaClock />
          <span>{formatTime(timeLeft)}</span>
        </div>

        <button
          onClick={handleSubmitConfirmation}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl hover-scale shadow shadow-emerald-500/10"
        >
          Submit Exam
        </button>
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-900 h-1 relative">
        <div className="bg-blue-500 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      {/* Main Content Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 p-3 sm:p-6">
        
        {/* Left Area - Active Question Panel */}
        <div className="md:col-span-3 flex flex-col justify-between glass-card rounded-3xl p-6 md:p-8 space-y-6 min-h-[400px]">
          
          <div className="space-y-4">
            {/* Header properties */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-extrabold text-blue-500">QUESTION {currentIndex + 1} OF {questions.length}</span>
              <div className="flex items-center space-x-2 text-[10px] font-bold text-slate-400">
                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">+{currentQuestion.marks || 1} Marks</span>
                {(currentQuestion.negativeMarks || 0) > 0 && (
                  <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">-{currentQuestion.negativeMarks} Negative</span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Question choices wrapper */}
            <div className="pt-4 space-y-3">
              
              {/* Single Choice Options */}
              {isSingleChoice && optionsList.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOptionSelect(qId, opt, false)}
                  className={`w-full p-4 rounded-2xl border text-sm text-left flex items-center space-x-3 transition-all ${
                    currentAnswers.includes(opt)
                      ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[10px] ${
                    currentAnswers.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-800 text-slate-400'
                  }`}>{String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </button>
              ))}

              {/* Multiple Correct Options */}
              {isMultipleChoice && optionsList.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleOptionSelect(qId, opt, true)}
                  className={`w-full p-4 rounded-2xl border text-sm text-left flex items-center space-x-3 transition-all ${
                    currentAnswers.includes(opt)
                      ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                  }`}
                >
                  <span className={`w-5 h-5 rounded flex items-center justify-center border font-bold text-[10px] ${
                    currentAnswers.includes(opt) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-300 dark:border-slate-800 text-slate-400'
                  }`}>{currentAnswers.includes(opt) ? '✓' : String.fromCharCode(65 + i)}</span>
                  <span>{opt}</span>
                </button>
              ))}

              {/* True / False Option Buttons */}
              {isTrueFalse && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {optionsList.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleOptionSelect(qId, opt, false)}
                      className={`flex-1 p-5 rounded-2xl border text-sm font-bold text-center flex justify-center items-center space-x-2 transition-all ${
                        currentAnswers[0] === opt
                          ? 'border-blue-500 bg-blue-500/5 text-blue-600 dark:text-blue-400 font-black'
                          : 'border-slate-200 dark:border-slate-800 hover:border-blue-500/50 hover:bg-slate-50 dark:hover:bg-slate-900/30'
                      }`}
                    >
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Fill in the blank Input Area */}
              {isFillBlank && (
                <div>
                  <input
                    type="text"
                    value={currentAnswers[0] || ''}
                    onChange={e => handleTextAnswerChange(qId, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-slate-900 dark:text-white"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 font-normal">Answers are evaluated case-insensitively.</p>
                </div>
              )}

            </div>
          </div>

          {/* Question card footer buttons */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-3">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-800 hover:text-blue-500 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-40"
              >
                <FaChevronLeft /> <span>Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={currentIndex === questions.length - 1}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-40"
              >
                <span>Next Question</span> <FaChevronRight />
              </button>
            </div>

            <button
              type="button"
              onClick={() => toggleFlag(qId)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                flagged[qId]
                  ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 font-black'
                  : 'border-slate-200 dark:border-slate-800 text-slate-400 hover:text-amber-500'
              }`}
            >
              <FaFlag className="w-3 h-3" />
              <span>{flagged[qId] ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar - AI Camera Proctor & Question Palette */}
        <div className="space-y-4">
          
          {/* AI Eye-Gaze Camera Proctoring Card */}
          <BiometricIntegrityRadar 
            isExamActive={!loading && !!quiz}
            onViolation={handleProctorViolation}
            onIntegrityChange={setIntegrityScore}
          />

          {/* Palette Card */}
          <div className="glass-card rounded-2xl p-4 space-y-3 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
              Question Navigator ({totalAnsweredCount}/{questions.length})
            </h4>

            <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
              {questions.map((q, idx) => (
                <button
                  key={q._id || idx}
                  type="button"
                  onClick={() => handleJumpToQuestion(idx)}
                  className={getPaletteBtnClass(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-[9px] text-slate-400 font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Answered</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Flagged</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Visited</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>Unattempted</span>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AttemptQuiz;
