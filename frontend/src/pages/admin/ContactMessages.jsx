import React, { useState, useEffect } from 'react';
import { FaComments, FaCheckCircle, FaHourglassHalf, FaEnvelope } from 'react-icons/fa';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import Swal from 'sweetalert2';

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact');
      if (res.data.success) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleResolveToggle = async (id, currentStatus) => {
    try {
      const res = await api.put(`/contact/${id}/resolve`);
      if (res.data.success) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, isResolved: res.data.messageData.isResolved } : m));
        Swal.fire({
          title: res.data.messageData.isResolved ? 'Resolved! ✓' : 'Unresolved!',
          text: 'Message status updated.',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="list" count={4} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaComments className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black">Contact Inbox</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Review feedback submissions and inquiries left by visitors</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <FaEnvelope className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-lg">Inbox is Empty</h3>
          <p className="text-xs">No inquiries logged from the Contact page.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div
              key={m._id}
              className={`glass-card rounded-3xl p-6 transition-all border-l-4 ${
                m.isResolved ? 'border-emerald-500 opacity-70' : 'border-blue-500 shadow-lg'
              }`}
            >
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-lg">{m.subject}</h3>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      m.isResolved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {m.isResolved ? <FaCheckCircle /> : <FaHourglassHalf />}
                      <span>{m.isResolved ? 'RESOLVED' : 'PENDING'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    From: <strong>{m.name}</strong> ({m.email}) | Received: {new Date(m.createdAt).toLocaleString()}
                  </p>
                  
                  <p className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed pt-2">
                    {m.message}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleResolveToggle(m._id, m.isResolved)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all hover-scale shadow-sm ${
                      m.isResolved
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10'
                    }`}
                  >
                    {m.isResolved ? 'Re-open Ticket' : 'Mark Resolved'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
