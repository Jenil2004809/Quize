import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { bookmarkToggleSuccess } from '../../redux/authSlice';
import { FaBookmark, FaGamepad, FaClock, FaTrophy } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const StudentBookmarks = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get('/quizzes');
        if (res.data.success) {
          // Filter only quizzes that are inside user bookmarks array
          const userBookmarks = user?.bookmarks || [];
          const bookmarked = res.data.quizzes.filter(q => userBookmarks.includes(q._id));
          setQuizzes(bookmarked);
        }
      } catch (err) {
        console.error('Error fetching bookmarked quizzes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [user]);

  const handleUnbookmark = async (id) => {
    try {
      const res = await api.post(`/quizzes/${id}/bookmark`);
      if (res.data.success) {
        dispatch(bookmarkToggleSuccess(res.data.bookmarks));
        // Remove from local list state
        setQuizzes(prev => prev.filter(q => q._id !== id));
        Swal.fire({
          title: 'Removed 🔖',
          text: 'Quiz removed from your bookmarks.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaBookmark className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black">Bookmarked Quizzes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and attempt quizzes you have saved for later</p>
        </div>
      </div>

      {quizzes.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4">
          <FaBookmark className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold">No Bookmarked Quizzes</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">Browse the explore page to bookmark and save interesting quizzes.</p>
          <Link to="/quizzes" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl hover-scale">
            Explore Quizzes
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all relative overflow-hidden">
              
              <div className="space-y-4">
                {/* Header info */}
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">
                    {quiz.category?.name}
                  </span>
                  <button
                    onClick={() => handleUnbookmark(quiz._id)}
                    className="text-blue-500 hover:text-blue-600 focus:outline-none"
                    aria-label="Remove Bookmark"
                  >
                    <FaBookmark className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-lg leading-snug">{quiz.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2">{quiz.description}</p>
                </div>

                {/* Meta details */}
                <div className="flex space-x-4 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <FaClock /> <span>{quiz.timeLimit} mins</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <FaTrophy /> <span>Passing: {quiz.passingMarks}</span>
                  </span>
                  <span className="capitalize font-bold text-slate-500">
                    {quiz.difficulty}
                  </span>
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-2 transition-colors text-sm hover-scale shadow-lg shadow-blue-500/10"
                >
                  <FaGamepad />
                  <span>Start Quiz</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentBookmarks;
