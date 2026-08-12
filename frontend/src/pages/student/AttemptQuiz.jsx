import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaChevronLeft, FaChevronRight, FaFlag, FaTimesCircle, FaDesktop, FaShieldAlt } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import BiometricIntegrityRadar from '../../components/BiometricIntegrityRadar';
import Swal from 'sweetalert2';

const AttemptQuiz = () => {
  const { id: quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // Attempt States
  const [currentIndex, setCurrentIndex] = useState(0);
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

  // Initialize violation count from LocalStorage to prevent bypass by refresh
  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem(`quiz_violations_${quizId}`) || '0', 10);
    setWarningsCount(savedCount);
  }, [quizId]);

  // Handle Cheating / Off-Screen Focus Violations
  const handleProctorViolation = (violationMsg) => {
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

  // Load questions and verify security status
  useEffect(() => {
    const startQuiz = async () => {
      try {
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
          setQuestions(qRes.data.questions);
          setTimeLeft(quizRes.data.quiz.timeLimit * 60);

          // Mark first question as visited
          if (qRes.data.questions.length > 0) {
            setVisited({ [qRes.data.questions[0]._id]: true });
          }

          // Auto-request fullscreen environment
          try {
            if (document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen().catch(() => {});
            }
          } catch (fsErr) {
            console.warn('Fullscreen request auto-handled:', fsErr);
          }

          // Recover autosave from localStorage if matching
          const saved = localStorage.getItem(`autosave_${quizId}`);
          if (saved) {
            try {
              setUserAnswers(JSON.parse(saved));
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (err) {
        console.error(err);
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

  // Request Fullscreen on first loading click with mobile browser fallback
  const enterFullscreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else if (docElm.webkitRequestFullscreen) {
      try {
        docElm.webkitRequestFullscreen();
      } catch (e) {
        console.warn(e);
      }
    }
    setIsFullscreen(true);
  };

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);

      if (!active && !loading && quiz) {
        setWarningsCount(prev => {
          const nextVal = prev + 1;
          if (nextVal >= 2) {
            Swal.fire({
              title: 'Exam Security Violation ⛔',
              text: 'You have exited fullscreen mode multiple times. Your active progress has been automatically submitted.',
              icon: 'error',
              confirmButtonColor: '#ef4444'
            }).then(() => {
              submitExamPayload(true);
            });
          } else {
            Swal.fire({
              title: 'Security Warning! ⚠️',
              text: 'Exiting fullscreen mode violates testing rules. Returning to windowed mode again will trigger immediate submission.',
              icon: 'warning',
              confirmButtonText: 'Return to fullscreen',
              confirmButtonColor: '#3b82f6'
            }).then(() => {
              enterFullscreen();
            });
          }
          return nextVal;
        });
      }
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

  // Start timer on successful fullscreen enter
  useEffect(() => {
    if (quiz && !loading && isFullscreen) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            Swal.fire({
              title: 'Time Expired!',
              text: 'Quiz time limit reached. Submitting answers automatically...',
              icon: 'info',
              timer: 2000,
              showConfirmButton: false
            }).then(() => {
              submitExamPayload(true);
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz, loading, isFullscreen]);

  // Autosave to localStorage
  useEffect(() => {
    if (Object.keys(userAnswers).length > 0) {
      localStorage.setItem(`autosave_${quizId}`, JSON.stringify(userAnswers));
    }
  }, [userAnswers, quizId]);

  const handleOptionSelect = (qId, optionVal, isMultiple = false) => {
    const currentSelected = userAnswers[qId] || [];
    let updated = [];

    if (isMultiple) {
      const idx = currentSelected.indexOf(optionVal);
      if (idx === -1) {
        updated = [...currentSelected, optionVal];
      } else {
        updated = currentSelected.filter(o => o !== optionVal);
      }
    } else {
      updated = [optionVal];
    }

    setUserAnswers({ ...userAnswers, [qId]: updated });
  };

  const handleTextAnswerChange = (qId, val) => {
    setUserAnswers({ ...userAnswers, [qId]: val ? [val] : [] });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      const nextQId = questions[nextIdx]._id;
      setVisited({ ...visited, [nextQId]: true });
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePaletteClick = (idx) => {
    setCurrentIndex(idx);
    const qId = questions[idx]._id;
    setVisited({ ...visited, [qId]: true });
  };

  const handleFlagToggle = (qId) => {
    setFlagged({ ...flagged, [qId]: !flagged[qId] });
  };

  const handleClearAnswer = (qId) => {
    const updated = { ...userAnswers };
    delete updated[qId];
    setUserAnswers(updated);
  };

  // Evaluation submissions API trigger
  const submitExamPayload = async (force = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    // Clear autosave cache
    localStorage.removeItem(`autosave_${quizId}`);

    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }

    try {
      const isForced = force || warningsCount >= 3 || parseInt(localStorage.getItem(`quiz_violations_${quizId}`) || '0', 10) >= 3;

      // On 3rd violation, student CANNOT submit their answers (answers sent as empty array)
      const formattedAnswers = isForced ? [] : questions.map(q => ({
        questionId: q._id,
        selectedAnswers: userAnswers[q._id] || []
      }));

      const elapsedSeconds = (quiz.timeLimit * 60) - timeLeft;

      const res = await api.post('/results/submit', {
        quizId,
        answers: formattedAnswers,
        timeTaken: elapsedSeconds,
        integrityScore: isForced ? 0 : integrityScore,
        wasDisqualified: isForced,
        disqualificationReason: isForced ? 'TAB_CHANGE_LIMIT_EXCEEDED' : '',
        tabChangeCount: isForced ? 3 : warningsCount,
        status: isForced ? 'TERMINATED' : 'COMPLETED',
        terminationReason: isForced ? 'TAB_CHANGE_LIMIT_EXCEEDED' : 'NONE',
        terminatedDueToViolation: isForced,
        approvalStatus: isForced ? 'PENDING' : 'NONE'
      });

      if (res.data.success) {
        // Trigger instant Navbar Bell Icon notification refresh
        window.dispatchEvent(new Event('notification_updated'));

        if (isForced) {
          // Direct redirection to Home Screen (/) ONLY
          navigate('/', {
            replace: true,
            state: {
              tabViolationDisqualified: true,
              quizTitle: quiz?.title || 'Quiz',
              message: 'Failed to record attempts. Please contact admin.'
            }
          });
        } else {
          navigate(`/quiz-result/${res.data.resultId}`);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error Submitting ⚠️',
        text: err.response?.data?.message || 'Failed to record attempts. Please contact admin.',
        icon: 'error',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'OK'
      }).then(() => {
        navigate('/', { replace: true });
      });
    }
  };

  const handleSubmitExam = () => {
    const savedCount = parseInt(localStorage.getItem(`quiz_violations_${quizId}`) || '0', 10);
    if (warningsCount >= 3 || savedCount >= 3) {
      return Swal.fire({
        title: 'Error Submitting ⚠️',
        text: 'Failed to record attempts. You exceeded the maximum allowed tab changes. Please contact admin.',
        icon: 'error',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'OK',
        allowOutsideClick: false,
        allowEscapeKey: false
      }).then(() => {
        submitExamPayload(true);
      });
    }

    const totalAnswered = Object.keys(userAnswers)
      .filter(k => userAnswers[k].length > 0).length;
    const totalSkipped = questions.length - totalAnswered;
    const totalFlagged = Object.keys(flagged).filter(k => flagged[k]).length;

    Swal.fire({
      title: 'Submit Exam Paper?',
      html: `
        <div class="text-left text-xs space-y-2 p-3 bg-slate-100 rounded-xl">
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
        submitExamPayload();
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

  // If not fullscreen, display entrance block
  if (!isFullscreen) {
    return (
      <div className="max-w-md mx-auto my-20 px-4 text-center space-y-6">
        <FaDesktop className="w-16 h-16 text-blue-500 mx-auto animate-bounce" />
        <h2 className="text-2xl font-black">Secure Testing Environment</h2>
        <p className="text-slate-500 text-sm">You must enter fullscreen mode to proceed with the examination. Navigating away or resizing windowed tabs will trigger warnings.</p>
        <button
          onClick={enterFullscreen}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl hover-scale shadow-lg shadow-blue-500/20 text-sm"
        >
          Enter Fullscreen Mode
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const qId = currentQuestion._id;
  const currentAnswers = userAnswers[qId] || [];

  const totalAnsweredCount = Object.keys(userAnswers).filter(k => userAnswers[k].length > 0).length;
  const progressPercent = (totalAnsweredCount / questions.length) * 100;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPaletteBtnClass = (idx) => {
    const id = questions[idx]._id;
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
            <h2 className="font-extrabold text-sm truncate max-w-[200px] md:max-w-md">{quiz?.title}</h2>
            <span className="text-[10px] text-slate-400">Total: {questions.length} questions (Randomized Order)</span>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center space-x-2 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-xl font-mono text-sm font-bold animate-pulse">
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
                <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">+{currentQuestion.marks} Marks</span>
                {currentQuestion.negativeMarks > 0 && (
                  <span className="text-red-500 bg-red-500/10 px-2 py-0.5 rounded">-{currentQuestion.negativeMarks} Negative</span>
                )}
              </div>
            </div>

            {/* Question Text */}
            <h3 className="font-bold text-lg md:text-xl text-slate-900 dark:text-white leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Question answers choices wrapper */}
            <div className="pt-4 space-y-3">
              
              {/* MCQ Options (Single correct) */}
              {currentQuestion.type === 'mcq' && currentQuestion.options.map((opt, i) => (
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
              {currentQuestion.type === 'multiple-correct' && currentQuestion.options.map((opt, i) => (
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
              {currentQuestion.type === 'true-false' && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {['True', 'False'].map((opt) => (
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
              {currentQuestion.type === 'fill-in-the-blank' && (
                <div>
                  <input
                    type="text"
                    value={currentAnswers[0] || ''}
                    onChange={e => handleTextAnswerChange(qId, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full max-w-md px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
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
                className="px-4 py-2.5 rounded-xl border border-slate-350 dark:border-slate-800 hover:text-blue-500 text-xs font-bold flex items-center space-x-1.5 transition-colors disabled:opacity-40"
              >
                <span>Save & Next</span> <FaChevronRight />
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleFlagToggle(qId)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-all ${
                  flagged[qId] ? 'bg-amber-500 text-white border-amber-500' : 'border-slate-350 dark:border-slate-800 text-slate-500 hover:text-amber-500'
                }`}
              >
                <FaFlag />
                <span>{flagged[qId] ? 'Flagged' : 'Flag for Review'}</span>
              </button>

              {currentAnswers.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleClearAnswer(qId)}
                  className="px-4 py-2.5 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-all"
                >
                  <FaTimesCircle />
                  <span>Clear Answer</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right Area - Biometric Radar + Question Navigation Palette */}
        <div className="md:col-span-1 space-y-4">
          
          {/* World-First Feature: AI Biometric Integrity Radar */}
          <BiometricIntegrityRadar
            isExamActive={isFullscreen}
            onIntegrityChange={(score) => setIntegrityScore(score)}
            onViolation={(msg) => handleProctorViolation(msg)}
          />

          <div className="glass-card rounded-3xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-2">Question Palette</h3>
              
              {/* Palette dots grid */}
              <div className="grid grid-cols-4 gap-2">
                {questions.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePaletteClick(idx)}
                    className={getPaletteBtnClass(idx)}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Palette status keys guide */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-[10px] font-bold text-slate-400 space-y-3">
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-500 flex-shrink-0"></span>
                <span>Answered / Saved</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500 flex-shrink-0"></span>
                <span>Flagged / Bookmarked</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-blue-500/10 border border-blue-300 flex-shrink-0"></span>
                <span>Visited (Not Answered)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3.5 h-3.5 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex-shrink-0"></span>
                <span>Not Visited</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default AttemptQuiz;
