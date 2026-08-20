import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaGraduationCap, FaChalkboardTeacher, FaClipboardCheck, FaAward, 
  FaSearch, FaChevronDown, FaChevronUp, FaMagic, FaShieldAlt, 
  FaRandom, FaFileWord, FaFilePdf, FaCamera, FaMobileAlt, FaUserCheck, FaBrain
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import api from '../services/api';
import Swal from 'sweetalert2';

import PageTransition from '../components/PageTransition';

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.tabViolationDisqualified) {
      Swal.fire({
        title: 'Quiz Terminated ⚠️',
        text: 'Your quiz session was closed due to proctoring policy violations.',
        icon: 'error',
        confirmButtonColor: '#6366f1',
        confirmButtonText: 'OK'
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    { 
      q: '⚡ How does the AI Scan-to-Quiz Builder work?', 
      a: 'Teachers can upload PDF textbook chapters, Word documents (.doc/.docx), or photos of handwritten notes. Our AI OCR engine extracts the content and automatically structures it into multiple-choice questions with answer keys in seconds!' 
    },
    { 
      q: '🛡️ How does the AI Biometric Proctoring System work?', 
      a: 'During exam attempts, our AI Proctoring Engine tracks head pose orientation and secondary mobile phone presence in real-time. Students receive a 15-second setup grace period when starting, followed by a 4-strikes violation alert system (3 warnings with flashing red alerts, 4th strike auto-disqualifies).' 
    },
    { 
      q: '🔀 Are questions and options shuffled for different users?', 
      a: 'Yes! Every candidate and attempt receives a unique, seeded Mulberry32 PRNG randomized sequence of questions and option order (Options A, B, C, D), making cheating virtually impossible.' 
    },
    { 
      q: '📜 How do I download my verified PDF certificate?', 
      a: 'Once a student passes a quiz with marks exceeding the passing threshold, a verified PDF Certificate with a unique cryptographic verification token is instantly generated on the Student Dashboard.' 
    }
  ];

  return (
    <PageTransition className="space-y-24 pb-20">
      
      {/* 🚀 Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Glowing Background Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-indigo-500/15 dark:bg-indigo-500/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-purple-500/15 dark:bg-purple-500/10 blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Live AI Feature Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-bold uppercase tracking-wider">
              <FaMagic className="w-3.5 h-3.5" />
              <span>Next-Gen AI Exam & Proctoring Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              AI-Powered Testing with{' '}
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Scan-to-Quiz & Proctoring
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
              Upload PDF notes, Word docs, or handwritten photos to generate instant quizzes. Experience AI head pose detection, mobile device proctoring, seeded candidate shuffling, and instant verified certificates.
            </p>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="flex max-w-lg p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-indigo-500/5">
              <input
                type="text"
                placeholder="Search quizzes, categories, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              />
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center space-x-2 text-xs">
                <FaSearch className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/quizzes" className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold hover-scale shadow-lg shadow-indigo-500/25 flex items-center space-x-2 text-sm">
                <FaBrain className="w-4 h-4" />
                <span>Explore Live Quizzes</span>
              </Link>
              <Link to="/login" className="px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 font-bold hover-scale flex items-center space-x-2 text-sm">
                <FaMagic className="w-4 h-4 text-indigo-500" />
                <span>⚡ AI Scan-to-Quiz Builder</span>
              </Link>
            </div>
          </motion.div>

          {/* Hero Visual Display Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative hidden md:flex justify-center"
          >
            <div className="relative w-full max-w-md space-y-4">
              
              {/* Card 1: AI Proctoring Radar */}
              <div className="p-5 glass-card rounded-3xl shadow-2xl border border-indigo-500/30 space-y-3 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider">AI Proctoring Active</span>
                  </div>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">15s Grace Period</span>
                </div>
                <div className="bg-slate-950 rounded-2xl p-3 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FaCamera className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">Head Pose & Device Cam</h4>
                      <p className="text-[10px] text-slate-400">Real-time orientation tracking</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Verified ✅</span>
                </div>
              </div>

              {/* Card 2: AI Scan-to-Quiz Preview */}
              <div className="p-5 bg-slate-900 text-white rounded-3xl shadow-2xl border border-purple-500/30 space-y-3 transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center space-x-2">
                  <FaMagic className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-300">OCR Scan-to-Quiz Engine</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-center space-x-1">
                    <FaFilePdf className="text-red-400" /> <span>PDF</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-center space-x-1">
                    <FaFileWord className="text-blue-400" /> <span>Word</span>
                  </div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex items-center justify-center space-x-1">
                    <FaCamera className="text-emerald-400" /> <span>Notes</span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-xl border border-slate-800">
                  "Generates interactive MCQs from handwritten & textbook files in 1-click."
                </p>
              </div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 📊 Live Statistics Counter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: <FaGraduationCap className="text-blue-500" />, count: '35+', label: 'Active Students' },
            { icon: <FaChalkboardTeacher className="text-indigo-500" />, count: '100%', label: 'AI Proctor Verified' },
            { icon: <FaClipboardCheck className="text-purple-500" />, count: '188+', label: 'Randomized Questions' },
            { icon: <FaAward className="text-emerald-500" />, count: '100%', label: 'PDF Certificates' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center space-y-2 hover-scale border border-slate-200 dark:border-slate-800"
            >
              <div className="inline-flex p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xl">{stat.icon}</div>
              <h3 className="text-2xl font-black">{stat.count}</h3>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ⚡ Core Platform Capabilities */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-black">Built for High-Integrity Assessments</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            Everything you need for creation, anti-cheating enforcement, candidate shuffling, and auto-grading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <FaMagic className="text-purple-500 w-6 h-6" />, 
              title: 'AI Scan-to-Quiz Builder', 
              desc: 'Upload PDF chapters, Word documents (.doc/.docx), or handwritten note photos to extract interactive quiz questions instantly.' 
            },
            { 
              icon: <FaShieldAlt className="text-red-500 w-6 h-6" />, 
              title: 'AI Biometric Proctoring', 
              desc: 'Real-time head pose tracking and secondary mobile device detection with a 4-strikes violation alert system.' 
            },
            { 
              icon: <FaRandom className="text-indigo-500 w-6 h-6" />, 
              title: 'Per-Candidate Shuffling', 
              desc: 'Mulberry32 PRNG algorithm shuffles question order and option positions (A, B, C, D) uniquely for every attempt.' 
            },
            { 
              icon: <FaAward className="text-emerald-500 w-6 h-6" />, 
              title: 'Verifiable PDF Certificates', 
              desc: 'Earn tamper-proof certificates featuring student performance metrics and unique verification hex codes.' 
            },
            { 
              icon: <FaUserCheck className="text-blue-500 w-6 h-6" />, 
              title: 'Role-Based Dashboards', 
              desc: 'Dedicated portals for Students (attempt history & leaderboards), Teachers (quiz creation), and Admins (policy logs).' 
            },
            { 
              icon: <FaClipboardCheck className="text-yellow-500 w-6 h-6" />, 
              title: 'Bulk Excel Import & AI Tutor', 
              desc: 'Import quiz questions directly from Excel spreadsheets and get 1-on-1 AI explanations for wrong answers.' 
            }
          ].map((feat, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all border-t-4 border-indigo-500 space-y-3 text-left">
              <div className="p-3 rounded-xl bg-indigo-500/10 inline-block">{feat.icon}</div>
              <h3 className="font-bold text-lg">{feat.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 📚 Quiz Categories Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="flex justify-between items-end">
          <div className="text-left space-y-1">
            <h2 className="text-3xl font-black">Explore Categories</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Select a subject area to test your knowledge</p>
          </div>
          <Link to="/quizzes" className="text-indigo-500 hover:underline text-xs font-bold">View All Quizzes &rarr;</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(n => <div key={n} className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <motion.div
                key={cat._id}
                whileHover={{ y: -5 }}
                className="glass-card rounded-2xl p-6 cursor-pointer text-left relative overflow-hidden border border-slate-200 dark:border-slate-800"
                onClick={() => navigate(`/quizzes?category=${cat._id}`)}
              >
                <div className="relative z-10 space-y-3">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{cat.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{cat.description}</p>
                  <span className="text-xs font-bold text-indigo-500 inline-block">Browse assessments &rarr;</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ❓ FAQ Section */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Everything you need to know about Quizzy</p>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex justify-between items-center p-5 text-left font-bold text-sm"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown />}
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed">
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
