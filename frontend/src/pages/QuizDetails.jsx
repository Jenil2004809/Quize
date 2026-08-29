import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaClock, FaTrophy, FaArrowLeft, FaGamepad, FaLock, FaExclamationTriangle, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const QuizDetails = () => {
  const { id: quizId } = useParams();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [quizStatus, setQuizStatus] = useState({
    canAttempt: true,
    isApproved: false,
    isPending: false,
    isRejected: false,
    isLocked: false,
    message: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const res = await api.get(`/quizzes/${quizId}`);
        if (res.data.success) {
          setQuiz(res.data.quiz);
          
          if (isAuthenticated && user?.role === 'student') {
            const attemptsRes = await api.get(`/results/student/${user._id}`);
            if (attemptsRes.data.success) {
              const quizAttempts = attemptsRes.data.results.filter(r => r.quizId?._id === quizId);
              setAttemptsCount(quizAttempts.length);
            }

            // Check Policy Violation & Admin Retake Approval Status for this Quiz
            try {
              const statusRes = await api.get(`/student/quiz-status/${quizId}`);
              if (statusRes.data) {
                setQuizStatus({
                  canAttempt: statusRes.data.canAttempt || statusRes.data.isApproved,
                  isApproved: !!statusRes.data.isApproved,
                  isPending: !!statusRes.data.isPending,
                  isRejected: !!statusRes.data.isRejected,
                  isLocked: !!statusRes.data.isLocked,
                  message: statusRes.data.message || ''
                });
              }
            } catch (err) {
              console.warn('Quiz status check error:', err.message);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizDetails();
  }, [quizId, isAuthenticated, user]);

  // Request Retake Approval from Admin
  const handleRequestRetake = async () => {
    if (!isAuthenticated) {
      return navigate('/login');
    }

    const { value: reason } = await Swal.fire({
      title: 'Request Admin Retake Approval ✉️',
      text: `Please enter a message for the Administrator explaining why you are requesting retake access for "${quiz?.title}".`,
      input: 'textarea',
      inputPlaceholder: 'e.g. I request permission for a retake attempt to improve my score / my network interrupted...',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Send Request to Admin',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Please write a brief note for the Admin!';
        }
      }
    });

    if (reason) {
      try {
        const res = await api.post('/policy-violations/request-retake', {
          quizId,
          reason: reason.trim()
        });

        if (res.data.success) {
          setQuizStatus({
            canAttempt: false,
            isApproved: false,
            isPending: true,
            isRejected: false,
            isLocked: false,
            message: 'Your retake approval request is pending administrator review.'
          });

          Swal.fire({
            title: 'Request Sent to Admin! ✉️',
            text: 'Your retake approval request has been logged. The Administrator will review your request shortly.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.response?.data?.message || 'Failed to submit request to Admin.', 'error');
      }
    }
  };

  const handleStartQuiz = async () => {
    if (!isAuthenticated) {
      return Swal.fire({
        title: 'Authentication Required',
        text: 'Please log in or register as a student to attempt this quiz.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        confirmButtonText: 'Go to login'
      }).then((result) => {
        if (result.isConfirmed) navigate('/login');
      });
    }

    if (user?.role !== 'student') {
      return Swal.fire({
        title: 'Role Restriction ⚠️',
        text: 'Only student accounts are authorized to attempt exams.',
        icon: 'warning'
      });
    }

    // CHECK POLICY VIOLATION & TAB CHANGE LOCK UNLESS ADMIN APPROVED
    if (!quizStatus.isApproved) {
      try {
        const statusRes = await api.get(`/student/quiz-status/${quizId}`);
        if (statusRes.data && statusRes.data.canAttempt === false) {
          return Swal.fire({
            title: 'Access Denied',
            text: statusRes.data.message || 'You exceeded the allowed limit or your attempt is locked.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      } catch (statusErr) {
        if (statusErr.response && statusErr.response.status === 403) {
          return Swal.fire({
            title: 'Access Denied',
            text: statusErr.response.data?.message || 'Quiz access blocked. Please request admin approval.',
            icon: 'error',
            confirmButtonColor: '#ef4444'
          });
        }
      }
    }

    // CHECK ATTEMPT LIMIT UNLESS ADMIN APPROVED
    if (!quizStatus.isApproved && attemptsCount >= quiz?.maxAttempts) {
      return Swal.fire({
        title: 'Attempt Limit Reached ⛔',
        text: `You have completed ${attemptsCount}/${quiz?.maxAttempts} permitted attempts. You can request admin approval to retake!`,
        icon: 'error'
      });
    }

    Swal.fire({
      title: 'Enter Proctored Exam?',
      text: 'This examination is monitored with active Screen & Biometric Proctoring. You will enter fullscreen mode with live session recording. Are you ready to begin?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Start Exam Now!'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/quizzes/${quizId}/attempt`);
      }
    });
  };

  // Instant Deletion Trigger
  const handleDeleteQuiz = () => {
    Swal.fire({
      title: 'Delete Quiz?',
      text: 'This will delete the quiz and all associated questions/results immediately. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete Quiz!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/quizzes/${quizId}`);
          if (res.data.success) {
            Swal.fire({
              title: 'Quiz Deleted! 🗑️',
              text: 'Quiz and all associated records removed.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              navigate('/quizzes');
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire('Error', err.response?.data?.message || 'Failed to delete quiz.', 'error');
        }
      }
    });
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={1} />;
  }

  if (!quiz) {
    return (
      <div className="max-w-md mx-auto my-12 text-center space-y-4">
        <p className="text-slate-400">Associated quiz could not be found.</p>
        <Link to="/quizzes" className="text-blue-500 hover:underline">&larr; Back to Explore</Link>
      </div>
    );
  }

  const isApprovedByAdmin = quizStatus.isApproved;
  const isPendingAdmin = quizStatus.isPending;
  const isBlockedOrLimit = (attemptsCount >= quiz.maxAttempts || quizStatus.isLocked || !quizStatus.canAttempt) && !isApprovedByAdmin;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left space-y-8">
      
      {/* Navigation header */}
      <div className="flex justify-between items-center">
        <Link to="/quizzes" className="flex items-center space-x-1.5 text-xs text-slate-500 hover:text-blue-500 transition-colors w-fit">
          <FaArrowLeft />
          <span>Back to explore page</span>
        </Link>

        {/* ALWAYS VISIBLE RED DELETE BUTTON */}
        <button
          onClick={handleDeleteQuiz}
          className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-red-500/20"
        >
          <FaTrash />
          <span>Delete Quiz</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column - Instructions details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-8 space-y-4 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">
                {quiz.category?.name}
              </span>
              {quiz.creator && (
                <span className="text-[10px] text-slate-400 font-bold">
                  Conducted by: <strong className="text-blue-500">{quiz.creator.name}</strong>
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black">{quiz.title}</h1>
            <p className="text-sm text-slate-555 dark:text-slate-400 leading-relaxed">{quiz.description}</p>
          </div>

          <div className="glass-card rounded-3xl p-8 space-y-4">
            <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-2">Exam Rules & Instructions</h3>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>Keep track of the countdown timer in the header. If the timer expires, your answers will auto-submit.</li>
              <li>You can navigate back and forth between questions using the previous/next buttons or the question palette.</li>
              <li>Ensure you run in a stable environment. Exiting fullscreen mode might trigger warnings.</li>
              <li>Your answers are autosaved locally and uploaded securely on completion.</li>
            </ul>
          </div>
        </div>

        {/* Right Column - Parameters / Actions */}
        <div className="md:col-span-1 space-y-6">
          
          <div className="glass-card rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-base border-b border-slate-100 dark:border-slate-800 pb-2">Exam Details</h3>
            
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Difficulty:</span>
                <span className="capitalize font-bold text-slate-700 dark:text-slate-350">{quiz.difficulty}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center space-x-1"><FaClock className="text-slate-400" /> <span>Time Limit:</span></span>
                <span className="font-bold text-slate-750">{quiz.timeLimit} Minutes</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center space-x-1"><FaTrophy className="text-slate-400" /> <span>Passing Marks:</span></span>
                <span className="font-bold text-slate-750">{quiz.passingMarks} Marks</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Total Attempts:</span>
                <span className="font-bold text-slate-750">{quiz.maxAttempts} allowed</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Questions Count:</span>
                <span className="font-bold text-slate-750">{quiz.questionsCount} items</span>
              </div>
            </div>

            {isAuthenticated && user?.role === 'student' && (
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/50 text-xs flex justify-between">
                <span className="text-slate-400">Attempts logged:</span>
                <strong className={isBlockedOrLimit ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}>
                  {attemptsCount} / {quiz.maxAttempts}
                </strong>
              </div>
            )}

            {/* BANNERS FOR ADMIN APPROVAL & BLOCKS */}
            {isApprovedByAdmin && (
              <div className="p-3 bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-500 rounded text-[10px] font-bold leading-relaxed flex items-center space-x-1.5">
                <FaTrophy className="flex-shrink-0" />
                <span>Admin Approved Retake Access! You are authorized to attempt this quiz now.</span>
              </div>
            )}

            {isPendingAdmin && (
              <div className="p-3 bg-amber-500/10 border-l-4 border-amber-500 text-amber-500 rounded text-[10px] font-bold leading-relaxed flex items-center space-x-1.5">
                <FaClock className="flex-shrink-0" />
                <span>Your Retake Approval Request is pending Administrator review.</span>
              </div>
            )}

            {isBlockedOrLimit && !isPendingAdmin && (
              <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-500 rounded text-[10px] leading-relaxed flex items-center space-x-1.5">
                <FaExclamationTriangle className="flex-shrink-0" />
                <span>Starting is disabled. You can request admin approval to retake this quiz below.</span>
              </div>
            )}

            {/* MAIN ACTION BUTTONS */}
            {isApprovedByAdmin ? (
              <button
                onClick={handleStartQuiz}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center justify-center space-x-2 text-sm transition-all hover-scale shadow-lg shadow-emerald-500/20"
              >
                <FaGamepad />
                <span>Start Assessment (Admin Authorized)</span>
              </button>
            ) : isPendingAdmin ? (
              <button
                disabled
                className="w-full py-3 rounded-xl bg-amber-500/20 text-amber-500 border border-amber-500/30 font-bold flex items-center justify-center space-x-2 text-xs cursor-not-allowed opacity-80"
              >
                <FaClock />
                <span>⏳ Retake Request Pending Admin Approval</span>
              </button>
            ) : isBlockedOrLimit ? (
              <div className="space-y-3">
                <button
                  onClick={handleRequestRetake}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold flex items-center justify-center space-x-2 text-xs transition-all hover-scale shadow-lg shadow-blue-500/20"
                >
                  <FaExclamationTriangle />
                  <span>📩 Request Retake Approval from Admin</span>
                </button>
                <button
                  disabled
                  className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 font-bold flex items-center justify-center space-x-2 text-xs cursor-not-allowed"
                >
                  <FaLock />
                  <span>Attempt Blocked</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartQuiz}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-2 text-sm transition-colors hover-scale shadow-lg shadow-blue-500/10"
              >
                <FaGamepad />
                <span>Start Assessment</span>
              </button>
            )}

            <button
              onClick={handleDeleteQuiz}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center space-x-2 text-xs transition-colors hover-scale shadow-lg shadow-red-500/20"
            >
              <FaTrash />
              <span>Delete Quiz</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuizDetails;
