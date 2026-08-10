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

  const handleStartQuiz = () => {
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

    if (attemptsCount >= quiz?.maxAttempts) {
      return Swal.fire({
        title: 'Attempt Limit Reached ⛔',
        text: `You have completed ${attemptsCount}/${quiz?.maxAttempts} permitted attempts.`,
        icon: 'error'
      });
    }

    Swal.fire({
      title: 'Enter Exam Environment?',
      text: 'This will request fullscreen mode. Exiting fullscreen or navigating away will automatically autosave and submit your active progress! Are you ready?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Start Now!'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(`/quizzes/${quizId}/attempt`);
      }
    });
  };

  // Instant Database Deletion Trigger
  const handleDeleteQuiz = () => {
    Swal.fire({
      title: 'Delete Quiz Permanently?',
      text: 'This will delete the quiz and ALL associated questions/results from the database immediately. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Delete from Database!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/quizzes/${quizId}`);
          if (res.data.success) {
            Swal.fire({
              title: 'Deleted from Database! 🗑️',
              text: 'Quiz and all associated database records removed.',
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

  const reachedLimit = attemptsCount >= quiz.maxAttempts;

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
          <span>Delete Quiz from Database</span>
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
                <strong className={reachedLimit ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}>
                  {attemptsCount} / {quiz.maxAttempts}
                </strong>
              </div>
            )}

            {reachedLimit && (
              <div className="p-3 bg-red-500/10 border-l-4 border-red-500 text-red-500 rounded text-[10px] leading-relaxed flex items-center space-x-1.5">
                <FaExclamationTriangle className="flex-shrink-0" />
                <span>You have reached the maximum attempt limit. Starting is disabled.</span>
              </div>
            )}

            <button
              onClick={handleStartQuiz}
              disabled={reachedLimit}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-2 text-sm transition-colors disabled:bg-slate-350 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 disabled:cursor-not-allowed hover-scale shadow-lg shadow-blue-500/10"
            >
              {reachedLimit ? <FaLock /> : <FaGamepad />}
              <span>{reachedLimit ? 'Attempt Blocked' : 'Start Assessment'}</span>
            </button>

            <button
              onClick={handleDeleteQuiz}
              className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center space-x-2 text-xs transition-colors hover-scale shadow-lg shadow-red-500/20"
            >
              <FaTrash />
              <span>Delete Quiz from Database</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default QuizDetails;
