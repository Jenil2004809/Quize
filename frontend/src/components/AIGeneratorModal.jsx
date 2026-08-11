import React, { useState } from 'react';
import { FaRobot, FaMagic, FaCheckCircle, FaTrash, FaTimes, FaSpinner, FaSave } from 'react-icons/fa';
import api from '../services/api';
import Swal from 'sweetalert2';

const AIGeneratorModal = ({ isOpen, onClose, quizId, onQuestionsAdded }) => {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('mixed');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) {
      return Swal.fire('Topic Required', 'Please enter a topic for AI question generation.', 'warning');
    }

    setLoading(true);
    try {
      const res = await api.post('/ai/generate-quiz', { topic, count, difficulty });
      if (res.data.success) {
        setGeneratedQuestions(res.data.questions);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('AI Error', 'Could not generate questions. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveGenerated = (index) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveToQuiz = async () => {
    if (generatedQuestions.length === 0) return;

    try {
      const res = await api.post(`/quizzes/${quizId}/import-questions`, {
        questions: generatedQuestions
      });

      if (res.data.success) {
        Swal.fire({
          title: 'AI Questions Saved! 🎉',
          text: `Successfully saved ${res.data.count} AI-generated questions to this quiz!`,
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        if (onQuestionsAdded) onQuestionsAdded();
        onClose();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Save Error', 'Could not save AI questions to database.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-card max-w-2xl w-full rounded-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 border border-blue-500/20">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/20">
              <FaRobot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                AI Question Generator ✨
              </h2>
              <p className="text-xs text-slate-400">Craft validated multi-choice questions with 1-click AI synthesis</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-xl">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-3 space-y-1">
            <label className="text-xs font-bold text-slate-400">Topic / Core Concept</label>
            <input
              type="text"
              placeholder="e.g., IoT Sensor Layer Security, REST Web Services, Agile Testing..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Question Count</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value={3}>3 Questions</option>
              <option value={5}>5 Questions</option>
              <option value={10}>10 Questions</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-400">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              <option value="mixed">Mixed Difficulty</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center space-x-2 transition-all"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin w-4 h-4" />
                  <span>AI Crafting...</span>
                </>
              ) : (
                <>
                  <FaMagic className="w-3.5 h-3.5" />
                  <span>Generate Questions</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Generated Questions Preview */}
        {generatedQuestions.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-blue-500">
                AI Preview ({generatedQuestions.length} Questions Generated)
              </h3>
              <button
                onClick={handleSaveToQuiz}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center space-x-1.5"
              >
                <FaSave className="w-3.5 h-3.5" />
                <span>Save All to Database</span>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {generatedQuestions.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 relative text-xs">
                  <button
                    onClick={() => handleRemoveGenerated(idx)}
                    className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                    title="Remove Question"
                  >
                    <FaTrash className="w-3.5 h-3.5" />
                  </button>

                  <p className="font-bold text-slate-800 dark:text-slate-100 pr-6">
                    <span className="text-blue-500 mr-1">Q{idx + 1}.</span> {q.text}
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 pl-4">
                    {q.options?.map((opt, oIdx) => {
                      const isCorrect = q.correctAnswers?.includes(opt);
                      return (
                        <div
                          key={oIdx}
                          className={`p-1.5 rounded-lg border font-medium text-[11px] ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                              : 'bg-slate-200/50 dark:bg-slate-800/50 border-transparent text-slate-400'
                          }`}
                        >
                          {opt} {isCorrect && '✓'}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <p className="text-[10px] text-slate-400 italic bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIGeneratorModal;
