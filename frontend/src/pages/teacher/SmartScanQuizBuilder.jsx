import React, { useState } from 'react';
import { FaFilePdf, FaFileUpload, FaMagic, FaCheckCircle, FaTrash, FaEdit, FaSave, FaPlus, FaLightbulb, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const SmartScanQuizBuilder = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [topicTitle, setTopicTitle] = useState('');
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedQuestions, setExtractedQuestions] = useState([]);
  const [scanStats, setScanStats] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch Categories on Mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories');
        if (res.data.success && res.data.categories?.length > 0) {
          setCategoriesList(res.data.categories);
          setSelectedCategory(res.data.categories[0]._id);
        }
      } catch (err) {
        console.warn('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // File Drop / Selection Handler
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!topicTitle) {
        setTopicTitle(selected.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
    }
  };

  // Trigger AI Document Scan API
  const handleScanDocument = async (e) => {
    e.preventDefault();
    if (!file && !pastedText.trim()) {
      return Swal.fire('Missing Source', 'Please select a PDF/notes file or paste document text.', 'warning');
    }

    try {
      setIsScanning(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      if (pastedText.trim()) {
        formData.append('text', pastedText);
      }
      formData.append('count', questionCount);

      const res = await axios.post('/api/ai/scan-to-quiz', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setExtractedQuestions(res.data.questions || []);
        setScanStats({
          characters: res.data.extractedCharacters,
          paragraphs: res.data.paragraphsCount,
          count: res.data.questionsCount
        });
        Swal.fire({
          title: '⚡ Scan Complete!',
          text: `Successfully extracted ${res.data.questionsCount} structured quiz questions from your document.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Scan Failed', err.response?.data?.message || 'Failed to scan document.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  // Save Quiz and Attach Extracted Questions to Database
  const handleSaveQuizToDatabase = async () => {
    if (extractedQuestions.length === 0) return;
    if (!topicTitle.trim()) {
      return Swal.fire('Missing Quiz Title', 'Please enter a title for your generated quiz.', 'warning');
    }

    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // 1. Create Quiz Header
      const quizRes = await axios.post('/api/quizzes', {
        title: topicTitle,
        category: selectedCategory || categoriesList[0]?._id,
        description: `AI Scanned Quiz generated from document (${scanStats?.characters || 0} characters analyzed).`,
        timeLimit: 15,
        passingMarks: Math.ceil(extractedQuestions.length * 0.6),
        isPublished: true,
        difficulty: 'medium'
      }, config);

      const quizId = quizRes.data.quiz._id;

      // 2. Attach Extracted Questions
      for (const q of extractedQuestions) {
        await axios.post(`/api/quizzes/${quizId}/questions`, {
          type: q.type || 'mcq',
          text: q.text,
          options: q.options,
          correctAnswers: q.correctAnswers,
          explanation: q.explanation,
          marks: 1
        }, config);
      }

      Swal.fire({
        title: '🎉 Quiz Published!',
        text: `Your scanned quiz "${topicTitle}" with ${extractedQuestions.length} questions has been published to MongoDB.`,
        icon: 'success',
        confirmButtonText: 'View Dashboard'
      }).then(() => {
        navigate('/teacher/dashboard');
      });
    } catch (err) {
      console.error(err);
      Swal.fire('Save Failed', err.response?.data?.message || 'Failed to save quiz.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 text-left space-y-6">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FaMagic className="w-5 h-5 animate-pulse" />
            </span>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              ⚡ AI Smart Scan-to-Quiz Builder
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload PDF notes, textbook chapters, or paste document text to automatically generate interactive quiz questions.
          </p>
        </div>

        {extractedQuestions.length > 0 && (
          <button
            type="button"
            onClick={handleSaveQuizToDatabase}
            disabled={isSaving}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center space-x-2"
          >
            <FaSave className="w-4 h-4" />
            <span>{isSaving ? 'Publishing Quiz...' : 'Save & Publish Quiz to DB'}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Upload & Options Card */}
        <div className="lg:col-span-1 space-y-4">
          <form onSubmit={handleScanDocument} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <FaFileUpload className="w-4 h-4 text-indigo-400" />
              <span>Document Input Source</span>
            </h3>

            {/* Quiz Title */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Quiz Title</label>
              <input
                type="text"
                placeholder="e.g. Operating Systems Chapter 4"
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Drag & Drop File Box */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Upload PDF / Document File</label>
              <div className="relative border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center transition-all bg-slate-950/50">
                <input
                  type="file"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <FaFilePdf className="w-8 h-8 mx-auto text-indigo-400 mb-2 animate-bounce" />
                <span className="text-xs font-bold block text-slate-300">
                  {file ? file.name : 'Drag & Drop PDF or Click to Browse'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">Supports PDF, TXT, MD files</span>
              </div>
            </div>

            {/* Pasted Text Area */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Or Paste Notes / Chapter Text</label>
              <textarea
                rows="4"
                placeholder="Paste chapter notes or text summary here..."
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Question Count Selector */}
            <div>
              <label className="text-xs text-slate-400 font-semibold block mb-1">Number of Questions to Extract</label>
              <select
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value={3}>3 Questions</option>
                <option value={5}>5 Questions</option>
                <option value={8}>8 Questions</option>
                <option value={10}>10 Questions</option>
              </select>
            </div>

            {/* Submit Scan Button */}
            <button
              type="submit"
              disabled={isScanning}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-900/30 transition-all flex items-center justify-center space-x-2 text-xs"
            >
              <FaMagic className="w-4 h-4 animate-spin" />
              <span>{isScanning ? 'Extracting & Generating Questions...' : '⚡ Scan Document & Generate Quiz'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Scanned Questions Preview & Editor */}
        <div className="lg:col-span-2 space-y-4">
          {extractedQuestions.length > 0 ? (
            <div className="space-y-4">
              
              {/* Scan Metrics Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-300">
                    {extractedQuestions.length} Questions Generated
                  </span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 space-x-3">
                  <span>Chars: {scanStats?.characters || 0}</span>
                  <span>Paragraphs: {scanStats?.paragraphs || 0}</span>
                </div>
              </div>

              {/* Generated Questions List */}
              <div className="space-y-3">
                {extractedQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        Question {idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setExtractedQuestions(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="text-red-400 hover:text-red-300 text-xs p-1"
                      >
                        <FaTrash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs font-semibold text-slate-200">{q.text}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {q.options?.map((opt, oIdx) => {
                        const isCorrect = q.correctAnswers?.includes(opt);
                        return (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl border text-xs font-medium ${
                              isCorrect
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                : 'bg-slate-950 border-slate-800 text-slate-400'
                            }`}
                          >
                            <span className="font-bold mr-1">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <FaLightbulb className="w-12 h-12 text-indigo-400/40 mx-auto animate-bounce" />
              <h3 className="text-sm font-bold text-slate-300">No Document Scanned Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload a PDF document or paste chapter notes on the left, then click "Scan Document" to automatically extract structured questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartScanQuizBuilder;
