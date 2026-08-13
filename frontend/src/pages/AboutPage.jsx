import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaEye, FaBullhorn, FaUsers, FaHistory, FaMagic, FaShieldAlt, 
  FaRandom, FaAward, FaBuilding, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaCheckCircle, FaRocket, FaBrain, FaFileWord, FaCamera
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';

const AboutPage = () => {
  return (
    <PageTransition className="space-y-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left">
      
      {/* 🚀 Hero Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-500 text-xs font-bold uppercase tracking-wider">
          <FaRocket className="w-3.5 h-3.5" />
          <span>Empowering Global Education & Assessment</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Transforming Testing Through{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            AI & Biometric Integrity
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Quizzy is an enterprise-grade examination platform engineered to combine AI OCR document parsing, real-time biometric proctoring, per-candidate question shuffling, and instant verifiable PDF certification.
        </p>
      </div>

      {/* 📊 Impact Statistics Bar */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { icon: <FaBrain className="text-purple-500" />, count: 'AI OCR', label: 'PDF, Word & Handwritten Notes' },
          { icon: <FaShieldAlt className="text-red-500" />, count: '100%', label: 'Head & Mobile Device Proctoring' },
          { icon: <FaRandom className="text-indigo-500" />, count: 'Mulberry32', label: 'Candidate Seeded Shuffling' },
          { icon: <FaAward className="text-emerald-500" />, count: 'Verifiable', label: 'PDF Digital Certificates' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-6 text-center space-y-2 border border-slate-200 dark:border-slate-800 hover-scale"
          >
            <div className="inline-flex p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xl">{stat.icon}</div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{stat.count}</h3>
            <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">{stat.label}</p>
          </motion.div>
        ))}
      </section>

      {/* 🎯 Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 space-y-4 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all"
        >
          <div className="p-3.5 bg-blue-500/10 text-blue-500 inline-block rounded-2xl">
            <FaBullhorn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            To provide educators with an intelligent, automated test authoring system that eliminates manual formatting through AI Scan-to-Quiz, while ensuring students receive unbiased, high-integrity assessment results backed by verifiable digital credentials.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 space-y-4 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all"
        >
          <div className="p-3.5 bg-indigo-500/10 text-indigo-500 inline-block rounded-2xl">
            <FaEye className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Vision</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            To establish the global benchmark for online examination security, bridging classroom learning and professional qualification using computer vision biometric proctoring and tamper-proof cryptographic certificate tokens.
          </p>
        </motion.div>
      </section>

      {/* ⚡ Core Technological Innovations */}
      <section className="space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black">Our Core Platform Pillars</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Engineering features that set Quizzy apart</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: <FaMagic className="w-6 h-6 text-purple-500" />,
              title: 'AI Scan-to-Quiz Builder',
              desc: 'Upload PDF textbook chapters, Word documents (.doc/.docx), or handwritten paper note photos. Our Tesseract OCR engine extracts text and generates structured MCQs automatically.'
            },
            {
              icon: <FaShieldAlt className="w-6 h-6 text-red-500" />,
              title: 'AI Biometric Proctoring',
              desc: 'Features a 15-second setup grace period, real-time head pose tracking, secondary mobile phone detection, and a 4-strikes violation warning system.'
            },
            {
              icon: <FaRandom className="w-6 h-6 text-indigo-500" />,
              title: 'Candidate Seeded Shuffling',
              desc: 'Utilizes a Mulberry32 PRNG algorithm seeded by candidate attempt tokens to randomize question order and option positions (Options A, B, C, D) for every individual attempt.'
            }
          ].map((pillar, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-6 space-y-3 border-t-4 border-indigo-500">
              <div className="p-3 bg-indigo-500/10 rounded-xl inline-block">{pillar.icon}</div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{pillar.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ⏳ Journey Timeline */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black">Our Evolution Journey</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">From concept to production-grade platform</p>
        </div>

        <div className="relative border-l-2 border-indigo-500/30 ml-4 md:ml-24 space-y-8">
          {[
            { 
              year: '2024', 
              title: 'Platform Architecture & Role Control', 
              desc: 'Designed JWT authentication, MongoDB schemas, and role-based portals for Students, Teachers, and Administrators.' 
            },
            { 
              year: '2025', 
              title: 'Exam Engine & Shuffling Algorithm', 
              desc: 'Implemented fullscreen enforcement, Mulberry32 PRNG candidate shuffling, option distribution, and auto-grading.' 
            },
            { 
              year: '2026', 
              title: 'AI OCR & Biometric Proctoring Suite', 
              desc: 'Launched AI Scan-to-Quiz (PDF, Word, OCR Handwritten Notes), Head Pose tracking, Mobile Phone detection, and PDF Certificate generation.' 
            }
          ].map((milestone, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12">
              <span className="absolute -left-3 top-1 bg-indigo-600 border-2 border-slate-900 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-md shadow-indigo-500/30">
                ✓
              </span>
              <div className="glass-card rounded-2xl p-6 space-y-1 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors">
                <span className="text-xs font-black text-indigo-500">{milestone.year}</span>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">{milestone.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 🏢 Headquarters & Contact Card */}
      <section className="glass-card rounded-3xl p-8 border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-indigo-500 font-bold text-xs uppercase tracking-wider">
              <FaBuilding className="w-4 h-4" />
              <span>Headquarters & Location</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Quizzy EduTech Headquarters
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              📍 1099, Silver Business Point, VIP Circle Uttran, Mota Varachha, Surat, Gujarat 394105
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              📞 Phone Hotline: +91 90164 66277 | ✉️ Support: support@quizzy.com
            </p>
          </div>

          <Link
            to="/contact"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/25 whitespace-nowrap"
          >
            Get In Touch With Us &rarr;
          </Link>
        </div>
      </section>

    </PageTransition>
  );
};

export default AboutPage;