import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFolderOpen, FaPlus, FaTrash, FaEdit, FaEye, FaToggleOn, FaToggleOff, FaQuestionCircle, FaArrowRight } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';
import CustomSelect from '../../components/CustomSelect';

const ManageQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Create form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'medium',
    timeLimit: '10',
    passingMarks: '3',
    maxAttempts: '1',
    visibility: 'public'
  });

  const [editId, setEditId] = useState(null);

  const fetchQuizzes = async () => {
    try {
      const res = await api.get('/quizzes/creator');
      if (res.data.success) {
        setQuizzes(res.data.quizzes);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.data.success) {
        setCategories(res.data.categories);
        if (res.data.categories.length > 0 && !formData.category) {
          setFormData(prev => ({ ...prev, category: res.data.categories[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchQuizzes(), fetchCategories()]);
      setLoading(false);
    };
    init();
  }, []);

  const handlePublishToggle = async (id, currentStatus) => {
    try {
      const res = await api.put(`/quizzes/${id}/publish`);
      if (res.data.success) {
        setQuizzes(prev => prev.map(q => q._id === id ? { ...q, isPublished: res.data.isPublished } : q));
        Swal.fire({
          title: res.data.isPublished ? 'Published! 🚀' : 'Reverted to Draft 📝',
          text: res.data.message || 'Quiz status updated.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Publish Error ⚠️',
        text: err.response?.data?.message || 'Could not publish quiz. Ensure it has questions first!',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the quiz and all associated questions/results! This action is irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/quizzes/${id}`);
          if (res.data.success) {
            setQuizzes(prev => prev.filter(q => q._id !== id));
            Swal.fire('Deleted!', 'The quiz has been deleted.', 'success');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  const handleEditClick = (quiz) => {
    setEditId(quiz._id);
    setFormData({
      title: quiz.title,
      description: quiz.description || '',
      category: quiz.category?._id || '',
      difficulty: quiz.difficulty,
      timeLimit: quiz.timeLimit.toString(),
      passingMarks: quiz.passingMarks.toString(),
      maxAttempts: quiz.maxAttempts.toString(),
      visibility: quiz.visibility
    });
    setShowCreateForm(true);
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({
      title: '',
      description: '',
      category: categories[0]?._id || '',
      difficulty: 'medium',
      timeLimit: '10',
      passingMarks: '3',
      maxAttempts: '1',
      visibility: 'public'
    });
    setShowCreateForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editId) {
        // Edit Mode
        const res = await api.put(`/quizzes/${editId}`, formData);
        if (res.data.success) {
          Swal.fire('Updated!', 'Quiz details have been updated.', 'success');
          resetForm();
          fetchQuizzes();
        }
      } else {
        // Create Mode
        const res = await api.post('/quizzes', formData);
        if (res.data.success) {
          const newQuizId = res.data.quiz._id;
          Swal.fire({
            title: 'Quiz Created! 🎉',
            text: "Now, let's add questions to your new quiz.",
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
          resetForm();
          navigate(`/teacher-dashboard/quizzes/${newQuizId}/questions`);
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error Saving',
        text: err.response?.data?.message || 'Could not complete save operation.',
        icon: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaFolderOpen className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Manage Quizzes</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Author, edit, publish, and review quiz parameters</p>
          </div>
        </div>

        <button
          onClick={() => {
            if (showCreateForm) resetForm();
            else setShowCreateForm(true);
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover-scale shadow-lg shadow-blue-500/20"
        >
          <FaPlus />
          <span>{showCreateForm ? 'Cancel' : 'Create Quiz'}</span>
        </button>
      </div>

      {/* Slide-out Create Form */}
      {showCreateForm && (
        <div className="glass-card rounded-3xl p-6 space-y-4">
          {!editId && (
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-black text-xs">1</div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Step 1: Enter Quiz Details</h4>
                  <p className="text-xs text-slate-400">Fill in title, category, timing, and score parameters</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-[2px] bg-slate-200 dark:bg-slate-800"></div>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center font-black text-xs">2</div>
                <div className="hidden sm:block">
                  <h4 className="font-bold text-xs text-slate-400">Step 2: Add Questions & Answers</h4>
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold">{editId ? 'Edit Quiz Parameters' : 'Step 1: General Quiz Information'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Quiz Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="JavaScript Lexical Scopes"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject Category</label>
              <CustomSelect
                options={categories.map(c => ({ value: c._id, label: c.name, icon: '📚' }))}
                value={formData.category}
                onChange={val => setFormData({ ...formData, category: val })}
                placeholder="Select Category"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Write a brief overview describing testing objectives..."
                rows="2"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Difficulty Level</label>
              <CustomSelect
                options={[
                  { value: 'easy', label: '🟢 Easy' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'hard', label: '🔴 Hard' }
                ]}
                value={formData.difficulty}
                onChange={val => setFormData({ ...formData, difficulty: val })}
                placeholder="Select Difficulty"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Duration (Minutes)</label>
              <input
                type="number"
                required
                min="1"
                value={formData.timeLimit}
                onChange={e => setFormData({ ...formData, timeLimit: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Passing Score Threshold</label>
              <input
                type="number"
                required
                min="0"
                value={formData.passingMarks}
                onChange={e => setFormData({ ...formData, passingMarks: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Max Attempts Permitted</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxAttempts}
                onChange={e => setFormData({ ...formData, maxAttempts: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Visibility Level</label>
              <select
                value={formData.visibility}
                onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="public">Public (Visible to everyone)</option>
                <option value="private">Private (Invite only / Draft)</option>
              </select>
            </div>

            <div className="md:col-span-2 pt-2 flex space-x-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold transition-all disabled:bg-blue-500/50 flex items-center space-x-2 hover-scale shadow-lg shadow-blue-500/20"
              >
                <span>{editId ? 'Update Quiz Details' : 'Save Quiz Info & Proceed to Add Questions'}</span>
                {!editId && <FaArrowRight className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-500 text-sm font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes List Table */}
      <div className="glass-card rounded-3xl p-6">
        {quizzes.length === 0 ? (
          <p className="text-sm text-slate-400 py-12 text-center">No quizzes created yet. Expand the form above to add a draft!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-xs">
                  <th className="pb-3">Quiz Info</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Difficulty</th>
                  <th className="pb-3">Time/Attempts</th>
                  <th className="pb-3">Questions</th>
                  <th className="pb-3 text-center">Published</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id} className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <td className="py-4 font-bold">
                      <div className="flex flex-col">
                        <span>{quiz.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal tracking-wide mt-0.5 uppercase">{quiz.visibility}</span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500">{quiz.category?.name}</td>
                    <td className="py-4 capitalize">{quiz.difficulty}</td>
                    <td className="py-4 text-slate-500">
                      <span>{quiz.timeLimit} mins / {quiz.maxAttempts} max</span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-1.5 font-semibold text-blue-500">
                        <FaQuestionCircle />
                        <span>{quiz.questionsCount} items</span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handlePublishToggle(quiz._id, quiz.isPublished)}
                        className="text-2xl focus:outline-none"
                        aria-label="Toggle Publish Status"
                      >
                        {quiz.isPublished ? (
                          <FaToggleOn className="text-emerald-500 mx-auto" />
                        ) : (
                          <FaToggleOff className="text-slate-400 mx-auto" />
                        )}
                      </button>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/teacher-dashboard/quizzes/${quiz._id}/questions`)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                        title="Manage Questions List"
                      >
                        <FaPlus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleEditClick(quiz)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-colors"
                        title="Edit Details"
                      >
                        <FaEdit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="inline-flex items-center justify-center p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                        title="Delete Quiz"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageQuizzes;
