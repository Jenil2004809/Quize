import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaSpinner, FaLightbulb, FaSmile, FaBalanceScale, FaBook } from 'react-icons/fa';
import api from '../services/api';

const AIChatModal = ({ isOpen, onClose, questionContext }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && questionContext) {
      // Initialize with welcome message from AI Tutor
      setMessages([
        {
          sender: 'ai',
          text: `👋 Hi! I'm your AI Tutor for this question: "${questionContext.text?.slice(0, 60)}..."\n\nAsk me anything! You can request a real-world example, a simpler explanation, or compare choices.`
        }
      ]);
    }
  }, [isOpen, questionContext]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen || !questionContext) return null;

  const handleSendMessage = async (textToSend) => {
    const userMsg = textToSend || input;
    if (!userMsg.trim() || loading) return;

    const newHistory = [...messages, { sender: 'user', text: userMsg }];
    setMessages(newHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', {
        questionContext,
        history: newHistory,
        userMessage: userMsg
      });

      if (res.data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: '⚠️ Apologies, I encountered a temporary connection issue. Please try asking again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handlePillClick = (promptText) => {
    handleSendMessage(promptText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-left">
      <div className="glass-card max-w-xl w-full rounded-3xl p-6 flex flex-col h-[85vh] max-h-[650px] border border-purple-500/20 text-slate-800 dark:text-slate-100 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl shadow-lg shadow-purple-500/20">
              <FaRobot className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                Live AI Tutor Chat
              </h2>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[280px]">
                Q: {questionContext.text}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-red-500 rounded-xl">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompt Suggestions Bar */}
        <div className="py-2 flex items-center space-x-2 overflow-x-auto flex-shrink-0 border-b border-slate-100 dark:border-slate-850 text-[11px] scrollbar-none">
          <button
            onClick={() => handlePillClick('Can you give me a real-world example of this concept?')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold transition-all flex items-center space-x-1"
          >
            <FaLightbulb className="w-3 h-3" />
            <span>Real-World Example</span>
          </button>
          <button
            onClick={() => handlePillClick('Explain this as if I am 10 years old.')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold transition-all flex items-center space-x-1"
          >
            <FaSmile className="w-3 h-3" />
            <span>Explain Like I'm 10</span>
          </button>
          <button
            onClick={() => handlePillClick('Why is the correct key better than my selected choice?')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-500 hover:bg-purple-500 hover:text-white font-bold transition-all flex items-center space-x-1"
          >
            <FaBalanceScale className="w-3 h-3" />
            <span>Compare Choices</span>
          </button>
          <button
            onClick={() => handlePillClick('What is the main memory rule or formula to remember?')}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white font-bold transition-all flex items-center space-x-1"
          >
            <FaBook className="w-3 h-3" />
            <span>Memory Rule</span>
          </button>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-line ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-md'
                    : 'bg-slate-100 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 text-slate-700 dark:text-slate-200 rounded-bl-none shadow-sm'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1 capitalize">
                {m.sender === 'user' ? 'You' : 'AI Tutor'}
              </span>
            </div>
          ))}

          {loading && (
            <div className="flex items-start space-x-2">
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-bl-none text-xs flex items-center space-x-2 text-indigo-500">
                <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                <span>AI Tutor is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-2 flex-shrink-0"
        >
          <input
            type="text"
            placeholder="Type your question about this topic..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl disabled:opacity-50 hover-scale shadow-md"
          >
            <FaPaperPlane className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};

export default AIChatModal;
