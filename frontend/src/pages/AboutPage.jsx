import React from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaBullhorn, FaUsers, FaHistory } from 'react-icons/fa';

const AboutPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      
      {/* Header */}
      <div className="text-center space-y-4 max-w-xl mx-auto">
        <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
          About Quizzy
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          A production-ready exam authoring and student testing engine designed to validate competencies globally.
        </p>
      </div>

      {/* Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card rounded-3xl p-8 space-y-4"
        >
          <div className="p-4 bg-blue-500/10 text-blue-500 inline-block rounded-2xl"><FaBullhorn className="w-6 h-6" /></div>
          <h2 className="text-2xl font-bold">Our Mission</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            To provide educators with a secure, flexible, and powerful testing system that makes evaluations stress-free, while offering students automated certifications that represent actual mastery.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-3xl p-8 space-y-4"
        >
          <div className="p-4 bg-indigo-500/10 text-indigo-500 inline-block rounded-2xl"><FaEye className="w-6 h-6" /></div>
          <h2 className="text-2xl font-bold">Our Vision</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            To establish a global standard in digital verification, bridging the gap between educational content delivery and skill verification through secure exam palettes and cryptographic certificate IDs.
          </p>
        </motion.div>
      </section>

      {/* Timeline Section */}
      <section className="space-y-12">
        <h2 className="text-3xl font-black text-center">Our Journey</h2>
        <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 md:ml-32 space-y-8">
          {[
            { year: '2024', title: 'Platform Conception', desc: 'Scribbled down core algorithms, database entities, and mock interfaces for role authorizations.' },
            { year: '2025', title: 'Interactive Engine Launch', desc: 'Deployed full-screen restrictions, negative markings scoring, and nested question routers.' },
            { year: '2026', title: 'Enterprise Dashboards', desc: 'Introduced CSV/Excel imports, multi-coordinate analytics graphs, and fully-responsive layout designs.' }
          ].map((milestone, idx) => (
            <div key={idx} className="relative pl-8 md:pl-12">
              <span className="absolute -left-3.5 top-1.5 bg-blue-500 w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                {idx + 1}
              </span>
              <div className="glass-card rounded-2xl p-6 space-y-1">
                <span className="text-sm font-extrabold text-blue-500">{milestone.year}</span>
                <h3 className="font-bold text-lg">{milestone.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{milestone.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
