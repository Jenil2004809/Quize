import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaQuestionCircle, FaPlus, FaTrash, FaUpload, FaDownload } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const ManageQuestions = () => {
  const { id: quizId } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Manual Form States
  const [type, setType] = useState('mcq');
  const [text, setText] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState('1');
  const [negativeMarks, setNegativeMarks] = useState('0');

  const fetchQuizDetails = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data.success) {
        setQuiz(res.data.quiz);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchQuestions = async () => {
    try {
      const res = await api.get(`/quizzes/${quizId}/questions`);
      if (res.data.success) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchQuizDetails(), fetchQuestions()]);
      setLoading(false);
    };
    init();
  }, [quizId]);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) return;
    const newOpts = options.filter((_, i) => i !== index);
    setOptions(newOpts);
    // Adjust correct answers selection index
    const correctVal = options[index];
    setCorrectAnswers(correctAnswers.filter(c => c !== correctVal));
  };

  const handleOptionChange = (index, value) => {
    const newOpts = [...options];
    newOpts[index] = value;
    setOptions(newOpts);
  };

  const handleCorrectAnswersSelect = (value) => {
    if (type === 'multiple-correct') {
      const idx = correctAnswers.indexOf(value);
      if (idx === -1) {
        setCorrectAnswers([...correctAnswers, value]);
      } else {
        setCorrectAnswers(correctAnswers.filter(c => c !== value));
      }
    } else {
      // Single correct (mcq or true-false)
      setCorrectAnswers([value]);
    }
  };

  const resetForm = () => {
    setType('mcq');
    setText('');
    setOptions(['', '']);
    setCorrectAnswers([]);
    setExplanation('');
    setMarks('1');
    setNegativeMarks('0');
    setShowAddForm(false);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (correctAnswers.length === 0) {
      return Swal.fire({ title: 'Select Correct Key', text: 'Please pick or input at least one correct answer.', icon: 'warning' });
    }

    setSubmitting(true);
    try {
      const payload = {
        type,
        text,
        options: type === 'mcq' || type === 'multiple-correct' ? options : [],
        correctAnswers,
        explanation,
        marks: parseFloat(marks),
        negativeMarks: parseFloat(negativeMarks)
      };

      const res = await api.post(`/quizzes/${quizId}/questions`, payload);
      if (res.data.success) {
        Swal.fire({ title: 'Created! 📝', text: 'Question added to quiz successfully.', icon: 'success', timer: 1500, showConfirmButton: false });
        resetForm();
        fetchQuestions();
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ title: 'Error Adding', text: err.response?.data?.message || 'Could not complete operations.', icon: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (qId) => {
    Swal.fire({
      title: 'Delete Question?',
      text: 'This will remove the question from this quiz.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/quizzes/questions/${qId}`);
          if (res.data.success) {
            setQuestions(prev => prev.filter(q => q._id !== qId));
            Swal.fire('Deleted!', 'Question removed.', 'success');
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
  };

  // SheetJS Excel Upload handler
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = await import('xlsx');
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          return Swal.fire('Empty File', 'No rows found in the uploaded sheet.', 'warning');
        }

        // Validate data row keys
        // Expected headers: text, type, options (comma-separated), correctAnswers (comma-separated), explanation, marks, negativeMarks
        const formatted = data.map(row => {
          return {
            text: row.text || row.QuestionText,
            type: row.type || row.QuestionType || 'mcq',
            options: row.options ? row.options.toString().split(',').map(o => o.trim()) : [],
            correctAnswers: row.correctAnswers ? row.correctAnswers.toString().split(',').map(c => c.trim()) : [row.correctAnswer?.toString()],
            explanation: row.explanation || '',
            marks: parseFloat(row.marks || 1),
            negativeMarks: parseFloat(row.negativeMarks || 0)
          };
        });

        const res = await api.post(`/quizzes/${quizId}/import-questions`, { questions: formatted });
        if (res.data.success) {
          Swal.fire({
            title: 'Imported! 📊',
            text: res.data.message || `Successfully imported ${formatted.length} questions.`,
            icon: 'success'
          });
          fetchQuestions();
        }
      } catch (err) {
        console.error(err);
        Swal.fire('Import Error', 'Failed to parse file. Make sure columns match: text, type, options, correctAnswers.', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = ''; // Reset file input
  };

  // Download Excel template
  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const templateData = [
      {
        text: 'What is the output of typeof null?',
        type: 'mcq',
        options: 'object,null,undefined,number',
        correctAnswers: 'object',
        explanation: 'Historical JS bug, typeof null returns object.',
        marks: 1,
        negativeMarks: 0.25
      },
      {
        text: 'HTML stands for HyperText Markup Language.',
        type: 'true-false',
        options: 'True,False',
        correctAnswers: 'True',
        explanation: 'HTML is the standard markup language for creating web pages.',
        marks: 1,
        negativeMarks: 0
      },
      {
        text: 'Which array methods mutate the original array?',
        type: 'multiple-correct',
        options: 'push,pop,concat,filter',
        correctAnswers: 'push,pop',
        explanation: 'push and pop mutate the array. concat and filter return a new array.',
        marks: 2,
        negativeMarks: 0.5
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Questions Template');
    XLSX.writeFile(wb, 'Quizzy_Questions_Template.xlsx');
  };

  if (loading) {
    return <LoadingSkeleton type="table" count={5} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Link to="/teacher-dashboard/quizzes" className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-500 hover:text-blue-500"><FaArrowLeft /></Link>
          <div>
            <h1 className="text-3xl font-black">Edit Questions</h1>
            <p className="text-sm text-slate-400">Quiz: <strong>{quiz?.title}</strong> ({questions.length} questions total)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={downloadTemplate}
            className="flex items-center space-x-1.5 border border-slate-350 dark:border-slate-800 text-slate-500 hover:text-blue-500 px-3.5 py-2.5 rounded-xl text-xs font-semibold hover-scale"
          >
            <FaDownload />
            <span>Excel Template</span>
          </button>
          
          <label className="flex items-center space-x-1.5 border border-slate-350 dark:border-slate-800 text-slate-500 hover:text-indigo-500 px-3.5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer hover-scale">
            <FaUpload />
            <span>Import Excel</span>
            <input type="file" onChange={handleExcelUpload} className="hidden" accept=".xlsx, .xls" />
          </label>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover-scale shadow-lg shadow-blue-500/10"
          >
            <FaPlus />
            <span>{showAddForm ? 'Cancel' : 'Add Question'}</span>
          </button>
        </div>
      </div>

      {/* Slide-out Add Form */}
      {showAddForm && (
        <div className="glass-card rounded-3xl p-6">
          <h3 className="text-lg font-bold mb-4">Compose Question</h3>
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Question Type</label>
                <select
                  value={type}
                  onChange={(e) => {
                    const t = e.target.value;
                    setType(t);
                    if (t === 'true-false') {
                      setOptions(['True', 'False']);
                      setCorrectAnswers([]);
                    } else if (t === 'fill-in-the-blank') {
                      setOptions([]);
                      setCorrectAnswers([]);
                    } else {
                      setOptions(['', '']);
                      setCorrectAnswers([]);
                    }
                  }}
                  className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="mcq">Multiple Choice (Single Correct)</option>
                  <option value="multiple-correct">Multiple Correct Answers</option>
                  <option value="true-false">True / False</option>
                  <option value="fill-in-the-blank">Fill in the Blank</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Marks Awarded</label>
                <input
                  type="number"
                  required
                  step="0.5"
                  min="0.5"
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Negative Marks</label>
                <input
                  type="number"
                  required
                  step="0.25"
                  min="0"
                  value={negativeMarks}
                  onChange={e => setNegativeMarks(e.target.value)}
                  className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Question Text</label>
              <textarea
                required
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="What is the lexical environment scope definition?"
                rows="2"
                className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              ></textarea>
            </div>

            {/* MCQ / Multiple Correct Dynamic Options Setup */}
            {(type === 'mcq' || type === 'multiple-correct') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">Options Pool & Correct Keys</label>
                  <button type="button" onClick={handleAddOption} className="text-xs text-blue-500 font-bold hover:underline">+ Add Option</button>
                </div>
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleCorrectAnswersSelect(opt)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border font-bold text-xs ${
                        correctAnswers.includes(opt) && opt.trim() !== ''
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-slate-300 dark:border-slate-800 text-slate-400 hover:border-blue-500'
                      }`}
                    >
                      {correctAnswers.includes(opt) && opt.trim() !== '' ? '✓' : i + 1}
                    </button>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(i, e.target.value)}
                      placeholder={`Option ${i + 1} text`}
                      className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                    />
                    {options.length > 2 && (
                      <button type="button" onClick={() => handleRemoveOption(i)} className="text-red-500 hover:text-red-600 text-sm">Remove</button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* True False options */}
            {type === 'true-false' && (
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase text-slate-400">Correct Option Selection</label>
                <div className="flex space-x-4">
                  {['True', 'False'].map(opt => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCorrectAnswers([opt])}
                      className={`px-6 py-2 rounded-xl text-sm font-bold border ${
                        correctAnswers[0] === opt
                          ? 'bg-blue-600 text-white border-blue-600 shadow'
                          : 'border-slate-300 dark:border-slate-800 text-slate-500 hover:border-blue-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fill in the blank text */}
            {type === 'fill-in-the-blank' && (
              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Correct Answer (Text Matching)</label>
                <input
                  type="text"
                  required
                  value={correctAnswers[0] || ''}
                  onChange={e => setCorrectAnswers([e.target.value])}
                  placeholder="e.g. number"
                  className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
                />
                <p className="text-[10px] text-slate-400 mt-1">Note: Verification compares answer keys lowercase, trimmed.</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Explanation</label>
              <textarea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                placeholder="Why is this answer correct? Provide an explanation for reviews."
                rows="2"
                className="w-full text-sm px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
              ></textarea>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl disabled:bg-blue-500/50"
              >
                Save Question
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 border border-slate-300 text-slate-500 text-sm font-semibold rounded-xl"
              >
                Clear
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Questions Stack display */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-2">
            <FaQuestionCircle className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="font-bold text-lg">No Questions Seeded</h3>
            <p className="text-xs">Add manual questions or import using our Excel spreadsheet format template above.</p>
          </div>
        ) : (
          questions.map((q, idx) => (
            <div key={q._id} className="glass-card rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-extrabold text-blue-500 uppercase">Q{idx + 1}</span>
                    <span className="px-2 py-0.5 rounded text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 font-bold uppercase tracking-wider">{q.type}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs font-bold">
                    <span className="text-emerald-500">+{q.marks} Marks</span>
                    {q.negativeMarks > 0 && <span className="text-red-500">-{q.negativeMarks} Negative</span>}
                    <button
                      onClick={() => handleDelete(q._id)}
                      className="text-red-500 hover:text-red-600"
                      title="Remove Question"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white leading-relaxed">{q.text}</h3>

                {/* Options list */}
                {q.options.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className={`p-2.5 rounded-xl border flex items-center space-x-2 ${
                        q.correctAnswers.includes(opt)
                          ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-semibold'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}>
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center font-bold text-[9px]">{oIdx + 1}</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Answer if not options */}
                {q.options.length === 0 && (
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 rounded-xl font-bold">
                    Correct Key: {q.correctAnswers.join(', ')}
                  </div>
                )}

                {q.explanation && (
                  <div className="p-3 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-400 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/50">
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageQuestions;
