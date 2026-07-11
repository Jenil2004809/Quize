import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { bookmarkToggleSuccess } from '../redux/authSlice';
import { FaClock, FaTrophy, FaSearch, FaBookmark, FaGamepad, FaFilter } from 'react-icons/fa';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const QuizzesPage = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (difficulty) params.difficulty = difficulty;
      if (sort) params.sort = sort;

      const res = await api.get('/quizzes', { params });
      if (res.data.success) {
        setQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [search, category, difficulty, sort]);

  const handleBookmarkToggle = async (e, id) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      return Swal.fire({ title: 'Authentication Needed', text: 'Please sign in to bookmark quizzes.', icon: 'info' });
    }

    try {
      const res = await api.post(`/quizzes/${id}/bookmark`);
      if (res.data.success) {
        dispatch(bookmarkToggleSuccess(res.data.bookmarks));
        Swal.fire({
          title: res.data.bookmarked ? 'Bookmarked! 🔖' : 'Removed! 🔖',
          text: res.data.message || 'Bookmark status updated.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isBookmarked = (id) => {
    return user?.bookmarks?.includes(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
      <div>
        <h1 className="text-3xl font-black">Explore Quizzes</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Search and filter active quizzes to test your understanding</p>
      </div>

      {/* Filters bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 glass-card rounded-3xl items-center">
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search titles..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
          />
        </div>

        {/* Category */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
          <FaFilter className="text-slate-400 text-xs" />
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none pr-6 cursor-pointer w-full"
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {/* Difficulty */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
          <FaFilter className="text-slate-400 text-xs" />
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none pr-6 cursor-pointer w-full"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
          <FaFilter className="text-slate-400 text-xs" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="bg-transparent text-xs font-semibold focus:outline-none pr-6 cursor-pointer w-full"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title-asc">Title A-Z</option>
            <option value="title-desc">Title Z-A</option>
          </select>
        </div>

      </div>

      {/* Quizzes list */}
      {loading ? (
        <LoadingSkeleton type="card" count={3} />
      ) : quizzes.length === 0 ? (
        <p className="text-slate-400 text-center py-16 text-sm">No quizzes found matching your parameters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              onClick={() => navigate(`/quizzes/${quiz._id}`)}
              className="glass-card rounded-3xl p-6 flex flex-col justify-between hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden group border-t-4 border-transparent hover:border-blue-500"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded text-[10px] bg-blue-500/10 text-blue-500 font-bold uppercase tracking-wider">
                    {quiz.category?.name}
                  </span>
                  
                  <button
                    onClick={(e) => handleBookmarkToggle(e, quiz._id)}
                    className="text-slate-400 hover:text-blue-500 transition-colors focus:outline-none"
                    aria-label="Toggle Bookmark"
                  >
                    <FaBookmark className={`w-4 h-4 ${isBookmarked(quiz._id) ? 'text-blue-500' : ''}`} />
                  </button>
                </div>

                <div>
                  <h3 className="font-black text-lg group-hover:text-blue-500 transition-colors leading-snug">{quiz.title}</h3>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-2 leading-relaxed">{quiz.description}</p>
                </div>

                {/* Meta properties */}
                <div className="flex space-x-4 text-xs text-slate-400 pt-1">
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
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 group-hover:bg-blue-600 group-hover:text-white text-slate-700 dark:text-slate-350 font-bold flex items-center justify-center space-x-2 transition-all text-xs hover-scale"
                >
                  <FaGamepad />
                  <span>Start Attempt</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizzesPage;
