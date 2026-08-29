import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaGraduationCap, FaChalkboardTeacher, FaClipboardCheck, FaAward, 
  FaSearch, FaChevronDown, FaChevronUp, FaMagic, FaShieldAlt, 
  FaRandom, FaFileWord, FaFilePdf, FaCamera, FaUserCheck, FaBrain,
  FaLaptopCode, FaMicrochip, FaCloud, FaDatabase,
  FaCheckCircle, FaLock, FaRocket, FaArrowRight, FaBolt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import Swal from 'sweetalert2';
import PageTransition from '../components/PageTransition';

// Animated CountUp Hook for Smooth Statistic Counters
const useCountUp = (end, duration = 2000, startOnMount = true) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startOnMount) return;
    let startTime;
    let animationFrame;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startOnMount]);

  return count;
};

const AnimatedStatItem = ({ icon, endValue, suffix = '', label, delay = 0 }) => {
  const count = useCountUp(endValue, 1800);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card rounded-3xl p-6 text-center space-y-2.5 border border-slate-200/80 dark:border-slate-800/80 card-glow-hover relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
      
      <div className="inline-flex p-3.5 rounded-2xl bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 text-2xl shadow-inner group-hover:rotate-6 transition-transform duration-300">
        {icon}
      </div>

      <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
        {count}{suffix}
      </h3>

      <p className="text-xs text-slate-400 dark:text-slate-400 uppercase font-extrabold tracking-wider">
        {label}
      </p>
    </motion.div>
  );
};

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
      a: 'Teachers and professors can upload PDF textbook chapters, Word documents (.doc/.docx), or photos of handwritten notes. Our Google Gemini OCR engine extracts the content and automatically structures it into professional, college-grade multiple-choice questions with deep IEEE/ABET technical explanations in seconds!' 
    },
    { 
      q: '🛡️ How does the AI Biometric Proctoring & Screen Recording work?', 
      a: 'During exam attempts, our composite proctoring engine records both the user\'s screen and webcam stream simultaneously in picture-in-picture mode. It continuously monitors tab switches and gaze alignment with a 3-strikes warning system before disqualification, preserving video evidence for faculty review.' 
    },
    { 
      q: '🔀 Are questions and options randomized across students?', 
      a: 'Yes! Every candidate and attempt receives a unique seeded Mulberry32 pseudo-randomized sequence of questions and option choices (A, B, C, D), eliminating side-by-side exam duplication in classroom halls.' 
    },
    { 
      q: '📜 How do I earn and verify 3D Holographic PDF Certificates?', 
      a: 'Once a student scores above the passing threshold, an accredited, cryptographically signed digital certificate with an interactive 3D holographic tilt card is generated. It can be downloaded in 300-DPI PDF/PNG format or verified publicly via its unique ID.' 
    }
  ];

  // Core Subject Showcase Cards
  const coreSubjects = [
    { name: 'Software Engineering', code: 'SE-302', units: '4 Units • 40 Questions', icon: <FaLaptopCode className="text-indigo-400" />, color: 'from-indigo-500/20 to-purple-600/20 border-indigo-500/40', tag: 'SDLC • Agile • SOLID • QA' },
    { name: 'Internet of Things', code: 'IoT-401', units: '4 Units • 40 Questions', icon: <FaMicrochip className="text-cyan-400" />, color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/40', tag: '6LoWPAN • MQTT • ESP32 • WSN' },
    { name: 'Web Services & SOA', code: 'WS-403', units: '4 Units • 40 Questions', icon: <FaCloud className="text-emerald-400" />, color: 'from-emerald-500/20 to-teal-600/20 border-emerald-500/40', tag: 'SOAP • WSDL • UDDI • SAML' },
    { name: 'Database Systems & SQL', code: 'DBMS-202', units: '4 Units • 40 Questions', icon: <FaDatabase className="text-purple-400" />, color: 'from-purple-500/20 to-pink-600/20 border-purple-500/40', tag: '1NF–BCNF • ACID • B+ Trees' },
    { name: 'Computer Science & DSA', code: 'DSA-201', units: '4 Units • 40 Questions', icon: <FaBrain className="text-blue-400" />, color: 'from-blue-500/20 to-indigo-600/20 border-blue-500/40', tag: 'Big-O • AVL Trees • Dijkstra' },
    { name: 'Artificial Intelligence', code: 'AI-404', units: '4 Units • 40 Questions', icon: <FaMagic className="text-rose-400" />, color: 'from-rose-500/20 to-red-600/20 border-rose-500/40', tag: 'Backprop • CNNs • Transformers' }
  ];

  return (
    <PageTransition className="space-y-28 pb-24 overflow-hidden text-left">
      
      {/* 🚀 1. HERO SECTION WITH AMBIENT FLOATING ORBS & MOTION ENTRANCE */}
      <section className="relative overflow-hidden pt-16 pb-12 md:pt-28 md:pb-20">
        
        {/* Animated Background Mesh Orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-600/15 to-indigo-600/15 blur-[100px] animate-blob-1"></div>
          <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] rounded-full bg-gradient-to-bl from-purple-600/15 to-pink-600/15 blur-[100px] animate-blob-2"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-7 text-left"
          >
            {/* Live AI Feature Pill with Glowing Ping Dot */}
            <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase tracking-wider shadow-sm animate-pulse-glow">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
              <FaBolt className="w-3.5 h-3.5 text-indigo-500" />
              <span>Next-Gen University Examination & AI Proctoring</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Elevate University Assessments with{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-gradient-x">
                AI Scan-to-Quiz & Live Proctoring
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Transform textbook PDFs, lecture slides, and handwritten notes into accredited college quizzes in seconds. Equipped with screen recording, randomized candidate shuffling, and verifiable 3D holographic certificates.
            </p>

            {/* Interactive Search Bar */}
            <form onSubmit={handleSearch} className="flex max-w-lg p-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl shadow-indigo-500/10 focus-within:border-indigo-500 transition-all">
              <input
                type="text"
                placeholder="Search subjects (SE, IoT, WS, DBMS, DSA, AI)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-sm focus:outline-none text-slate-800 dark:text-slate-100"
              />
              <button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center space-x-2 text-xs hover-scale active-press"
              >
                <FaSearch className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <Link 
                to="/quizzes" 
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black hover-scale shadow-xl shadow-indigo-500/25 flex items-center space-x-2.5 text-sm"
              >
                <FaRocket className="w-4 h-4" />
                <span>Explore Unit Quizzes</span>
                <FaArrowRight className="w-3 h-3 ml-1" />
              </Link>
              
              <Link 
                to="/login" 
                className="px-6 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold hover-scale flex items-center space-x-2 text-sm hover:border-indigo-500/50 shadow-sm"
              >
                <FaMagic className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>⚡ AI Scan-to-Quiz Builder</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Floating 3D Graphic Cards Column */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative hidden md:flex justify-center"
          >
            <div className="relative w-full max-w-md space-y-5">
              
              {/* Card 1: Live Composite Proctoring HUD (Floating) */}
              <motion.div 
                whileHover={{ scale: 1.02, rotate: 0 }}
                className="p-6 glass-card rounded-3xl shadow-2xl border border-indigo-500/30 space-y-3.5 transform -rotate-2 transition-all duration-300 animate-float-rotate"
              >
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 dark:border-slate-800/50">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="text-xs font-black text-rose-500 uppercase tracking-wider">
                      🔴 REC | Dual Screen & Cam Monitored
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    Integrity: 100%
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between shadow-inner">
                  <div className="flex items-center space-x-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <FaShieldAlt className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-100">Live AI Proctoring Radar</h4>
                      <p className="text-[10px] text-slate-400">Head alignment & Tab Switch Detection</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                    Active ✅
                  </span>
                </div>
              </motion.div>

              {/* Card 2: AI Document OCR Engine Card (Floating in opposite direction) */}
              <motion.div 
                whileHover={{ scale: 1.02, rotate: 0 }}
                className="p-6 bg-slate-900/90 backdrop-blur-xl text-white rounded-3xl shadow-2xl border border-purple-500/30 space-y-3.5 transform rotate-2 transition-all duration-300 animate-float-slow"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <FaMagic className="w-4 h-4 text-purple-400 animate-pulse" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-purple-300">
                      OCR Scan-to-Quiz Engine
                    </h3>
                  </div>
                  <span className="text-[9px] bg-purple-500/20 text-purple-300 font-extrabold px-2 py-0.5 rounded-full">
                    Gemini 2.0 Flash
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-[10px] font-black">
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 flex items-center justify-center space-x-1.5 shadow-sm">
                    <FaFilePdf className="text-rose-400" /> <span>PDF Book</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 flex items-center justify-center space-x-1.5 shadow-sm">
                    <FaFileWord className="text-blue-400" /> <span>Word Doc</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 flex items-center justify-center space-x-1.5 shadow-sm">
                    <FaCamera className="text-emerald-400" /> <span>Photo Notes</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 italic bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 leading-relaxed text-left">
                  "Transforms uploaded university syllabus documents into formatted MCQs with verified answer keys in seconds."
                </p>
              </motion.div>

            </div>
          </motion.div>

        </div>
      </section>

      {/* 📊 2. ANIMATED LIVE STATISTICS COUNTERS WITH COUNTUP EFFECT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedStatItem 
            icon={<FaGraduationCap />} 
            endValue={24} 
            suffix=" Units" 
            label="Curriculum Quizzes" 
            delay={0.1} 
          />
          <AnimatedStatItem 
            icon={<FaBrain />} 
            endValue={240} 
            suffix="+" 
            label="Original Exam Questions" 
            delay={0.2} 
          />
          <AnimatedStatItem 
            icon={<FaShieldAlt />} 
            endValue={100} 
            suffix="%" 
            label="AI Proctoring Integrity" 
            delay={0.3} 
          />
          <AnimatedStatItem 
            icon={<FaAward />} 
            endValue={100} 
            suffix="%" 
            label="3D Verifiable Certificates" 
            delay={0.4} 
          />
        </div>
      </section>

      {/* 📚 3. ACCREDITED SUBJECTS SHOWCASE WITH GLOWING HOVER CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-4 text-left">
          <div>
            <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
              University Curriculum
            </span>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              Explore Core Engineering Disciplines
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Every subject contains 4 comprehensive unit-wise modules with peer-reviewed technical questions.
            </p>
          </div>
          <Link 
            to="/quizzes" 
            className="inline-flex items-center space-x-1.5 text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-auto"
          >
            <span>View All 24 Unit Quizzes</span>
            <FaArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreSubjects.map((sub, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -6, scale: 1.02 }}
              onClick={() => navigate('/quizzes')}
              className={`p-6 rounded-3xl bg-gradient-to-br ${sub.color} backdrop-blur-xl border card-glow-hover cursor-pointer space-y-4 text-left flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-white dark:bg-slate-950 shadow-md text-xl">
                    {sub.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/70 dark:bg-slate-950/70 border border-slate-200/50 dark:border-slate-800/50 text-[10px] font-mono font-black text-slate-700 dark:text-slate-200">
                    {sub.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-black text-lg text-slate-900 dark:text-white">
                    {sub.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                    {sub.units}
                  </p>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-slate-900/50 px-2.5 py-1 rounded-lg border border-white/20 dark:border-slate-800/40 inline-block">
                    {sub.tag}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/30 dark:border-slate-800/30 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Start Unit 1 &rarr;</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Proctored</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ⚡ 4. CORE CAPABILITIES (3D TILT CARDS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
            Built for Zero-Compromise Examination Integrity
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm">
            Complete suite for AI document generation, dual-stream recording, candidate shuffling, and auto-grading.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: <FaMagic className="text-purple-500 w-6 h-6" />, 
              title: 'AI Scan-to-Quiz Builder', 
              desc: 'Upload PDF chapters, Word documents (.doc/.docx), or handwritten note photos to extract interactive quiz questions instantly with Gemini 2.0.' 
            },
            { 
              icon: <FaShieldAlt className="text-rose-500 w-6 h-6" />, 
              title: 'Composite Video Proctoring', 
              desc: 'Simultaneously captures webcam and quiz screen in picture-in-picture canvas mode with head-pose and tab violation audit logs.' 
            },
            { 
              icon: <FaRandom className="text-indigo-500 w-6 h-6" />, 
              title: 'Per-Candidate Shuffling', 
              desc: 'Mulberry32 PRNG algorithm shuffles question order and option positions (A, B, C, D) uniquely for every attempt.' 
            },
            { 
              icon: <FaAward className="text-amber-500 w-6 h-6" />, 
              title: '3D Holographic Certificates', 
              desc: 'Earn verifiable digital credentials with interactive 3D perspective tilt, physics confetti bursts, and 1-click LinkedIn integration.' 
            },
            { 
              icon: <FaUserCheck className="text-blue-500 w-6 h-6" />, 
              title: 'Role-Based Portals', 
              desc: 'Dedicated dashboards for Students (attempt history & certificates), Teachers (quiz creation & recordings), and Admins (database center).' 
            },
            { 
              icon: <FaClipboardCheck className="text-emerald-500 w-6 h-6" />, 
              title: 'Multi-Theme Switcher (4 Palettes)', 
              desc: 'Switch between Academic Light, Slate Dark, Midnight OLED, and Cyber Synthwave modes in real-time with instant persistence.' 
            }
          ].map((feat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="glass-card rounded-3xl p-7 hover:shadow-2xl transition-all border-t-4 border-indigo-500 space-y-3.5 text-left card-glow-hover"
            >
              <div className="p-3.5 rounded-2xl bg-indigo-500/10 inline-block shadow-sm">
                {feat.icon}
              </div>
              <h3 className="font-black text-lg text-slate-900 dark:text-white">
                {feat.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ❓ 5. INTERACTIVE ANIMATED FAQ ACCORDION */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
            Got Questions?
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Everything you need to know about the Quiz Master university platform
          </p>
        </div>

        <div className="space-y-4 text-left">
          {faqs.map((faq, idx) => {
            const isExpanded = activeFaq === idx;
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 transition-all shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(isExpanded ? null : idx)}
                  className="w-full flex justify-between items-center p-5 text-left font-black text-sm text-slate-900 dark:text-white hover:text-indigo-500 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : 'text-slate-400'}`}>
                    <FaChevronDown />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed font-medium">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

    </PageTransition>
  );
};

export default LandingPage;
