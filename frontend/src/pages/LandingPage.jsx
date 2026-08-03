import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaChalkboardTeacher, FaClipboardCheck, FaAward, FaSearch, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../services/api';

import PageTransition from '../components/PageTransition';

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) {
          setCategories(res.data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/quizzes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/quizzes');
    }
  };

  const faqs = [
    { q: 'Is Quizzy completely free to use?', a: 'Yes! Students can register, attempt quizzes, and download PDF certificates entirely for free. Teachers can also publish public quizzes for free.' },
    { q: 'How does OTP verification work?', a: 'During registration, a 6-digit verification code is emailed to you. Simply enter this code to activate your account. If you do not have SMTP configured, check your terminal logs for the code!' },
    { q: 'Can I import questions from Excel?', a: 'Absolutely! Teachers can download our template, paste in their questions list, and upload the Excel file. Our system parses and validates questions in a single click.' },
    { q: 'Where do I access my certificates?', a: 'Once you pass a quiz by exceeding the passing marks threshold, a PDF certificate is automatically generated. You can download and share it directly from your Student Dashboard.' }
  ];

  return (
    <PageTransition className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-12 md:pt-32 md:pb-20">
        {/* Animated Background Gradients */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6 text-left"
          >
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              Master New Skills Through{' '}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Interactive Quizzes
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400">
              Quizzy is a production-grade testing platform where students challenge their brains, teachers author assessments, and systems generate verified certifications instantly.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="flex max-w-md p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-none">
              <input
                type="text"
                placeholder="Search quizzes, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-colors">
                <FaSearch className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/login" className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold hover-scale shadow-lg shadow-blue-500/20">
                Attempt Free Quiz
              </Link>
              <Link to="/register?role=teacher" className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-transparent text-slate-700 dark:text-slate-300 font-semibold hover-scale">
                Create as Educator
              </Link>
            </div>
          </motion.div>

          {/* Hero Image / Animated Card Pile */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex justify-center"
          >
            <div className="relative w-full max-w-md h-[400px]">
              {/* Stacked cards demonstrating interface */}
              <div className="absolute top-0 right-0 w-80 p-6 glass-card rounded-3xl shadow-2xl space-y-4 transform rotate-3 hover:rotate-0 transition-transform duration-500 z-20 animate-float">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase">Active Exam</span>
                  <span className="text-slate-400 text-xs font-semibold">Time: 09:59</span>
                </div>
                <h3 className="font-bold text-lg">JavaScript Closures</h3>
                <p className="text-sm text-slate-500">What is the output of the following lexical scoping function?</p>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 text-sm text-blue-500 font-medium">A. Lexical Environment</div>
                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-sm">B. Global Scope Execution</div>
                </div>
              </div>

              <div className="absolute bottom-4 left-0 w-72 p-6 bg-slate-900 text-white rounded-3xl shadow-xl transform -rotate-6 hover:rotate-0 transition-transform duration-500 z-10 animate-float-slow">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl"><FaAward className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-sm">Verification Token</h4>
                    <p className="text-xs text-slate-400">PDF Certificate issued instantly</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <FaGraduationCap className="text-blue-500" />, count: '25,000+', label: 'Happy Students' },
            { icon: <FaChalkboardTeacher className="text-indigo-500" />, count: '1,200+', label: 'Verified Teachers' },
            { icon: <FaClipboardCheck className="text-purple-500" />, count: '150,000+', label: 'Completed Quizzes' },
            { icon: <FaAward className="text-emerald-500" />, count: '85,000+', label: 'Certificates Earned' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center space-y-2 hover-scale"
            >
              <div className="inline-flex p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xl">{stat.icon}</div>
              <h3 className="text-2xl font-black">{stat.count}</h3>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black">Why Choose Quizzy?</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Our platform provides structural security, diverse formats, and full responsive dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Interactive Exam Environment', desc: 'Attempt quizzes with fullscreen constraints, progress trackers, and detailed palettes.' },
            { title: 'Rich Question Types', desc: 'Support for MCQs, True/False, Fill in the blanks, and multiple choice checks.' },
            { title: 'Bulk Excel Imports', desc: 'Educators can compose quizzes inside spreadsheets and upload files for prompt conversions.' },
            { title: 'Automated Credentials', desc: 'Receive verifiable PDF Certificates with unique hex tracking IDs upon exceeding passing thresholds.' },
            { title: 'Role Based Portals', desc: 'Distinct dashboards for Students (performance logs), Teachers (question management), and Admins.' },
            { title: 'Rich Graphic Analytics', desc: 'Examine results through Chart.js diagrams tracking score timeline progressions.' }
          ].map((feat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-shadow border-t-4 border-blue-500">
              <h3 className="font-bold text-lg mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quiz Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black">Top Categories</h2>
            <p className="text-slate-500 dark:text-slate-400">Discover trending subjects and challenge your knowledge</p>
          </div>
          <Link to="/quizzes" className="text-blue-500 hover:underline text-sm font-semibold">View All Quizzes &rarr;</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <div key={n} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                whileHover={{ y: -5 }}
                className="glass-card rounded-2xl p-6 cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/quizzes?category=${cat._id}`)}
              >
                <div className="relative z-10 space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2">{cat.description}</p>
                  <span className="text-xs font-semibold text-blue-500">Browse tests &rarr;</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <h2 className="text-3xl font-black text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left font-semibold"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-sm text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </PageTransition>
  );
};

export default LandingPage;
