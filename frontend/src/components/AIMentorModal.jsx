import React, { useState, useEffect } from 'react';
import { FaRobot, FaCheckCircle, FaExclamationCircle, FaLightbulb, FaTimes, FaSpinner, FaBookOpen } from 'react-icons/fa';
import api from '../services/api';

const AIMentorModal = ({ isOpen, onClose, questionData }) => {
  const [loading, setLoading] = useState(true);
  const [breakdown, setBreakdown] = useState(null);
  const [activeTab, setActiveTab] = useState('concept');

  useEffect(() => {
    if (isOpen && questionData) {
      const fetchAIExplanation = async () => {
        setLoading(true);
        try {
          const res = await api.post('/ai/explain-question', {
            questionText: questionData.text,
            options: questionData.options,
            selectedAnswers: questionData.selectedAnswers,
            correctAnswers: questionData.correctAnswers,
            explanation: questionData.explanation
          });

          if (res.data.success) {
            setBreakdown(res.data.aiBreakdown);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchAIExplanation();
    }
  }, [isOpen, questionData]);

  if (!isOpen || !questionData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
      <div className="glass-card max-w-xl w-full rounded-3xl p-6 space-y-5 border border-indigo-500/20 text-slate-800 dark:text-slate-100">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
              <FaRobot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                AI Mentor Explanation
              </h2>
              <p className="text-xs text-slate-400">Personalized AI learning insights & concept breakdown</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-xl">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Question Header */}
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
          <p className="font-extrabold text-slate-700 dark:text-slate-200">
            {questionData.text}
          </p>
        </div>

        {loading ? (
          <div className="py-12 text-center space-y-3">
            <FaSpinner className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-400">AI Mentor analyzing concept & generating insights...</p>
          </div>
        ) : breakdown ? (
          <div className="space-y-4">
            {/* Tabs */}
            <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 text-xs font-bold">
              <button
                onClick={() => setActiveTab('concept')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'concept' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                📌 Concept
              </button>
              <button
                onClick={() => setActiveTab('correct')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'correct' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ✅ Correct Choice
              </button>
              <button
                onClick={() => setActiveTab('wrong')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'wrong' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚠️ Your Answer
              </button>
              <button
                onClick={() => setActiveTab('tip')}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'tip' ? 'bg-amber-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                💡 Pro Tip
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 min-h-[140px] text-xs leading-relaxed">
              {activeTab === 'concept' && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-indigo-500 flex items-center">
                    <FaBookOpen className="mr-1.5" /> Topic Deep-Dive & Foundational Concept
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{breakdown.conceptSummary}</p>
                </div>
              )}

              {activeTab === 'correct' && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-emerald-500 flex items-center">
                    <FaCheckCircle className="mr-1.5" /> Why Correct Option Wins
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{breakdown.whyCorrect}</p>
                </div>
              )}

              {activeTab === 'wrong' && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-red-500 flex items-center">
                    <FaExclamationCircle className="mr-1.5" /> Answer Choice Diagnostic
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{breakdown.whyUserWrong}</p>
                </div>
              )}

              {activeTab === 'tip' && (
                <div className="space-y-2">
                  <h4 className="font-extrabold text-amber-500 flex items-center">
                    <FaLightbulb className="mr-1.5" /> Study Tip & Revision Advice
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{breakdown.proTip}</p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold rounded-xl"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIMentorModal;
