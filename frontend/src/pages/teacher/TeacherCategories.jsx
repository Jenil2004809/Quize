import React, { useState, useEffect } from 'react';
import { FaPlusCircle, FaPlus, FaFolder } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const TeacherCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

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

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    };
    init();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/categories', { name, description });
      if (res.data.success) {
        Swal.fire({
          title: 'Created! 📂',
          text: 'Category created successfully.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        setName('');
        setDescription('');
        setShowAddForm(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error Creating',
        text: err.response?.data?.message || 'Could not save category.',
        icon: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaPlusCircle className="w-6 h-6" /></div>
          <div>
            <h1 className="text-3xl font-black">Categories</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Add or review subject categories to classify quizzes</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm hover-scale shadow-lg shadow-blue-500/20"
        >
          <FaPlus />
          <span>{showAddForm ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4">Create Subject Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Briefly summarize what kind of quizzes fall under this category..."
                rows="3"
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:bg-blue-500/50"
            >
              Save Category
            </button>
          </form>
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat._id} className="glass-card rounded-3xl p-6 space-y-4 border-t-4 border-indigo-500 hover:shadow-2xl transition-all">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><FaFolder className="w-5 h-5" /></div>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wide">{cat.slug}</span>
            </div>
            <div>
              <h3 className="font-black text-lg">{cat.name}</h3>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-3">{cat.description || 'No description provided.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCategories;
