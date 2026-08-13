import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { bookmarkToggleSuccess } from '../redux/authSlice';
import { FaClock, FaTrophy, FaSearch, FaBookmark, FaGamepad, FaFilter, FaTrash, FaBookOpen, FaArrowLeft, FaLayerGroup, FaMicrochip, FaLaptopCode, FaCloud } from 'react-icons/fa';
import api from '../services/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Swal from 'sweetalert2';
import PageTransition from '../components/PageTransition';
import CustomSelect from '../components/CustomSelect';

const QuizzesPage = () => {
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';
  const urlCategory = searchParams.get('category') || '';

  const [quizzes, setQuizzes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active view: null = Subject Cards view, 'all' or subjectId = Unit-wise Quiz Cards view
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Filters state
  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [difficulty, setDifficulty] = useState('');
  const [sort, setSort] = useState('newest');

  const fetchCategoriesAndSubjects = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        api.get('/categories'),
        api.get('/subjects')
      ]);
      if (catRes.data.success) setCategories(catRes.data.categories);
      if (subRes.data.success) setSubjects(subRes.data.subjects);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const params = { limit: 500 };
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
    fetchCategoriesAndSubjects();
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

  // Instant Database Deletion Trigger
  const handleDeleteQuiz = async (e, quizId, title) => {
    e.stopPropagation();
    Swal.fire({
      title: `Delete "${title}"?`,
      text: 'This will permanently delete this quiz and ALL associated questions/results from the database immediately!',
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
            setQuizzes(prev => prev.filter(q => q._id !== quizId));
            Swal.fire({
              title: 'Deleted from Database! 🗑️',
              text: 'Quiz and all associated questions/results removed in real time.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: 'Delete Error ⚠️',
            text: err.response?.data?.message || 'Could not delete quiz.',
            icon: 'error'
          });
        }
      }
    });
  };

  const isBookmarked = (id) => {
    return user?.bookmarks?.includes(id);
  };

  // Pre-grouped subjects meta for visual cards
  const subjectMetadata = [
    {
      id: 'iot',
      matchName: 'Internet of Things',
      title: 'Internet of Things (IoT)',
      icon: <FaMicrochip className="w-8 h-8 text-cyan-500" />,
      color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/30',
      tagColor: 'bg-cyan-500/10 text-cyan-500',
      description: 'Explore 4 Unit Quizzes covering IoT Protocols, Sensors, Arduino C++ Programming, and WSN Cloud Integration.'
    },
    {
      id: 'se',
      matchName: 'Software Engineering',
      title: 'Software Engineering (SE)',
      icon: <FaLaptopCode className="w-8 h-8 text-indigo-500" />,
      color: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/30',
      tagColor: 'bg-indigo-500/10 text-indigo-500',
      description: 'Explore 4 Unit Quizzes covering SDLC Agile/Scrum, Requirements SRS, Architectural Design, and Testing QA.'
    },
    {
      id: 'ws',
      matchName: 'Web Services',
      title: 'Web Services & SOA (WS)',
      icon: <FaCloud className="w-8 h-8 text-emerald-500" />,
      color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/30',
      tagColor: 'bg-emerald-500/10 text-emerald-500',
      description: 'Explore 4 Unit Quizzes covering XML Schemas, SOAP, WSDL, UDDI, Conversational Services, and WS-Security.'
    },
    {
      id: 'custom',
      matchName: 'Custom',
      title: 'Teacher & Custom Quizzes',
      icon: <FaLayerGroup className="w-8 h-8 text-amber-500" />,
      color: 'from-amber-500/20 to-orange-600/20 border-amber-500/30',
      tagColor: 'bg-amber-500/10 text-amber-500',
      description: 'Access all custom assessments and practice tests created by teachers and faculty members.'
    }
  ];

  // Filter quizzes based on selected subject
  const getFilteredQuizzes = () => {
    if (!selectedSubject) return quizzes;
    if (selectedSubject.id === 'custom') {
      return quizzes.filter(q => !q.isSystemQuiz);
    }
    return quizzes.filter(q => 
      q.subject?.name?.toLowerCase().includes(selectedSubject.matchName.toLowerCase()) ||
      q.title?.toLowerCase().includes(selectedSubject.matchName.toLowerCase())
    );
  };

  const activeQuizzes = getFilteredQuizzes();

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            {selectedSubject && (
              <button
                onClick={() => setSelectedSubject(null)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-600 hover:text-white transition-all text-xs font-bold mr-2"
              >
                <FaArrowLeft />
                <span>All Subjects</span>
              </button>
            )}
            <h1 className="text-3xl font-black">
              {selectedSubject ? `${selectedSubject.title} Unit Quizzes` : 'Explore Academic Subjects'}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {selectedSubject
              ? `Select a unit-wise quiz below to attempt exam questions or manage database records`
              : `Select a subject card below to view its unit-wise quiz modules`}
          </p>
        </div>

        {isAuthenticated && user?.role === 'teacher' && (
          <button
            onClick={() => navigate('/teacher-dashboard/quizzes')}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold px-5 py-3 rounded-xl text-xs hover-scale shadow-lg shadow-blue-500/20 self-start sm:self-auto"
          >
            <FaGamepad />
            <span>Create a Quiz</span>
          </button>
        )}
      </div>

      {/* VIEW 1: SUBJECT CARDS VIEW (When no subject is selected) */}
      {!selectedSubject && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subjectMetadata.map((sub) => {
              const count = quizzes.filter(q => {
                if (sub.id === 'custom') return !q.isSystemQuiz;
                return q.subject?.name?.toLowerCase().includes(sub.matchName.toLowerCase()) ||
                       q.title?.toLowerCase().includes(sub.matchName.toLowerCase());
              }).length;

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubject(sub)}
                  className={`glass-card rounded-3xl p-6 flex flex-col justify-between hover-lift cursor-pointer relative overflow-hidden group border-2 bg-gradient-to-br ${sub.color}`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="p-3 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-md">
                        {sub.icon}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${sub.tagColor}`}>
                        {count} {count === 1 ? 'Quiz' : 'Quizzes'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-black text-xl group-hover:text-blue-400 transition-colors leading-snug">
                        {sub.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                        {sub.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      type="button"
                      className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-2 text-xs transition-all hover-scale shadow-lg shadow-blue-500/20"
                    >
                      <FaBookOpen />
                      <span>View Unit Quizzes</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Option to view all quizzes directly */}
          <div className="text-center pt-4">
            <button
              onClick={() => setSelectedSubject({ id: 'all', title: 'All Available', matchName: '' })}
              className="text-xs text-blue-500 hover:underline font-bold"
            >
              Or click here to browse all quizzes in a single view &rarr;
            </button>
          </div>
        </div>
      )}

      {/* VIEW 2: UNIT-WISE QUIZZES VIEW (When a subject is selected) */}
      {selectedSubject && (
        <div className="space-y-8">
          
          {/* Filters Bar */}
          <div className="glass-card rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl">
              <FaSearch className="text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search unit quizzes..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-xs focus:outline-none w-full"
              />
            </div>

            <div className="w-full sm:w-48">
              <CustomSelect
                options={[
                  { value: '', label: 'All Categories', icon: '📂' },
                  ...categories.map(c => ({ value: c._id, label: c.name, icon: '📚' }))
                ]}
                value={category}
                onChange={val => setCategory(val)}
                placeholder="All Categories"
                icon={FaFilter}
              />
            </div>

            <div className="w-full sm:w-44">
              <CustomSelect
                options={[
                  { value: '', label: 'All Difficulties', icon: '⚡' },
                  { value: 'easy', label: '🟢 Easy' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'hard', label: '🔴 Hard' }
                ]}
                value={difficulty}
                onChange={val => setDifficulty(val)}
                placeholder="All Difficulties"
                icon={FaFilter}
              />
            </div>

            <div className="w-full sm:w-44">
              <CustomSelect
                options={[
                  { value: 'newest', label: '🔥 Newest First' },
                  { value: 'oldest', label: '📅 Oldest First' },
                  { value: 'title-asc', label: '🔤 Title A-Z' },
                  { value: 'title-desc', label: '🔤 Title Z-A' }
                ]}
                value={sort}
                onChange={val => setSort(val)}
                placeholder="Sort By"
                icon={FaFilter}
              />
            </div>
          </div>

          {/* Unit-Wise Quiz Cards Grid */}
          {loading ? (
            <LoadingSkeleton type="card" count={4} />
          ) : activeQuizzes.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center space-y-3">
              <p className="text-slate-400 text-sm">No unit quizzes found for this subject selection.</p>
              <button
                onClick={() => setSelectedSubject(null)}
                className="text-xs text-blue-500 hover:underline font-bold"
              >
                &larr; Return to Subject Directory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeQuizzes.map((quiz) => (
                <div
                  key={quiz._id}
                  onClick={() => navigate(`/quizzes/${quiz._id}`)}
                  className="glass-card rounded-3xl p-6 flex flex-col justify-between hover-lift cursor-pointer relative overflow-hidden group border-t-4 border-transparent hover:border-blue-500"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        quiz.isSystemQuiz ? 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {quiz.unitName || (quiz.isSystemQuiz ? 'System Curriculum' : quiz.category?.name)}
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
                      <h3 className="font-black text-base group-hover:text-blue-500 transition-colors leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1.5 line-clamp-3 leading-relaxed">
                        {quiz.description}
                      </p>
                      {quiz.isSystemQuiz ? (
                        <p className="text-[10px] text-indigo-500 font-bold mt-2">
                          🎓 Official System Curriculum (Automated System Quiz)
                        </p>
                      ) : quiz.creator ? (
                        <p className="text-[10px] text-blue-500 font-bold mt-2">
                          Conducted by: {quiz.creator.name}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex space-x-3 text-xs text-slate-400 pt-1">
                      <span className="flex items-center space-x-1">
                        <FaClock /> <span>{quiz.timeLimit}m</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <FaTrophy /> <span>Pass: {quiz.passingMarks}</span>
                      </span>
                      <span className="capitalize font-bold text-slate-500">
                        {quiz.difficulty}
                      </span>
                    </div>
                  </div>

                  {/* BOTH BUTTONS SIDE-BY-SIDE ON BOTTOM */}
                  <div className="pt-6 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/quizzes/${quiz._id}`);
                      }}
                      className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center space-x-1 transition-all text-xs hover-scale shadow-lg shadow-blue-500/20"
                    >
                      <FaGamepad className="w-3.5 h-3.5" />
                      <span>Start</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteQuiz(e, quiz._id, quiz.title)}
                      className="py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center space-x-1 transition-all text-xs hover-scale shadow-lg shadow-red-500/20"
                      title="Delete Quiz from Database"
                    >
                      <FaTrash className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </PageTransition>
  );
};

export default QuizzesPage;
