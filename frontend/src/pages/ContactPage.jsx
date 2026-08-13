import React, { useState } from 'react';
import { 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaClock, 
  FaQuestionCircle, FaCheckCircle, FaChevronDown, FaChevronUp, 
  FaChalkboardTeacher, FaGraduationCap, FaShieldAlt, FaCopy 
} from 'react-icons/fa';
import api from '../services/api';
import Swal from 'sweetalert2';
import PageTransition from '../components/PageTransition';

const ContactPage = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    category: 'General Inquiry', 
    subject: '', 
    message: '' 
  });
  const [submitting, setSubmitting] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const categories = [
    { id: 'General Inquiry', label: '💬 General Inquiry', icon: <FaQuestionCircle /> },
    { id: 'Student Support', label: '🎓 Student Support', icon: <FaGraduationCap /> },
    { id: 'Teacher Enterprise', label: '👨‍🏫 Educator & Enterprise', icon: <FaChalkboardTeacher /> },
    { id: 'Proctoring & Security', label: '🛡️ Proctoring & Security', icon: <FaShieldAlt /> }
  ];

  const contactFaqs = [
    { 
      q: 'How fast will I get a response to my support message?', 
      a: 'Our dedicated support team responds to 95% of inquiries within 2 hours during active business hours, and guaranteed within 24 hours on weekends.' 
    },
    { 
      q: 'Can I request an Enterprise demo for my School or Organization?', 
      a: 'Absolutely! Select "Educator & Enterprise" above, leave your institution details, and our educational tech lead will schedule a customized live demonstration.' 
    },
    { 
      q: 'Where do I report technical issues during an live exam?', 
      a: 'If an issue occurs during an attempt, your attempt data is safely persisted in MongoDB. Contact us with your Student ID and Quiz Title for instant verification.' 
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategorySelect = (catId) => {
    setFormData(prev => ({
      ...prev,
      category: catId,
      subject: prev.subject || `Inquiry regarding ${catId}`
    }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('support@quizzy.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        subject: `[${formData.category}] ${formData.subject}`,
        message: formData.message
      });

      if (res.data.success) {
        Swal.fire({
          title: 'Message Sent Successfully! ✉️',
          text: 'Thank you for reaching out! Our team has received your message and will respond shortly.',
          icon: 'success',
          confirmButtonColor: '#6366f1'
        });
        setFormData({ name: '', email: '', category: 'General Inquiry', subject: '', message: '' });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Submission Error ⚠️',
        text: err.response?.data?.message || 'Failed to send message. Please verify your internet connection.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageTransition className="space-y-16 pb-20 pt-8">
      
      {/* 🚀 Header & Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        
        {/* Support Online Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Support Engineering Team Online (Average Response &lt; 2h)</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
          How Can We Help You{' '}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Succeed Today?
          </span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Have questions about AI Scan-to-Quiz, Biometric Proctoring, Student accounts, or Enterprise licensing? We are here to support your learning journey.
        </p>
      </section>

      {/* 📬 Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact Cards & Info */}
        <div className="lg:col-span-5 space-y-6 text-left">
          
          <div className="glass-card rounded-3xl p-6 space-y-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <span>Connect Direct</span>
            </h2>

            {/* Email Support Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl mt-0.5">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Email Support</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">support@quizzy.com</p>
                  <p className="text-[10px] text-emerald-500 font-medium">Monitored 24/7 worldwide</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"
                title="Copy Email Address"
              >
                {copiedEmail ? <FaCheckCircle className="text-emerald-500 w-4 h-4" /> : <FaCopy className="w-4 h-4" />}
              </button>
            </div>

            {/* Phone Support Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3">
              <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl mt-0.5">
                <FaPhone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Direct Hotline</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">+1 (555) 123-4567</p>
                <p className="text-[10px] text-slate-400 font-medium">Toll-free customer care</p>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3">
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl mt-0.5">
                <FaClock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Office Hours</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Mon - Fri: 9:00 AM - 6:00 PM PST</p>
                <p className="text-[10px] text-slate-400 font-medium">Weekend emergency support active</p>
              </div>
            </div>

            {/* Headquarters Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 flex items-start space-x-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl mt-0.5">
                <FaMapMarkerAlt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Global Headquarters</p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">100 Innovation Way, Silicon Valley, CA</p>
              </div>
            </div>

          </div>

          {/* Embedded Google Map */}
          <div className="h-56 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14875.804935880773!2d72.84470915794371!3d21.233782289283198!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be04f33933b2623%3A0xb440e8447a399880!2zVmlqYXlob8Ku!5e0!3m2!1sen!2sin!4v1784287096584!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>

        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7">
          <div className="glass-card rounded-3xl p-6 sm:p-8 space-y-6 text-left border border-slate-200 dark:border-slate-800 shadow-2xl">
            
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Send Us a Message</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Fill in your details below and our support team will reach out directly to your inbox.
              </p>
            </div>

            {/* Category Quick Select Pills */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase text-slate-400">Select Support Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left flex items-center space-x-2 border ${
                      formData.category === cat.id
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Your Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject</label>
                <input
                  type="text"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Summarize your query..."
                  className="w-full text-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold uppercase text-slate-400">Detailed Message</label>
                  <span className="text-[10px] text-slate-400 font-mono">{formData.message.length} / 500 chars</span>
                </div>
                <textarea
                  name="message"
                  required
                  rows="4"
                  maxLength={500}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your question, request, or issue in detail..."
                  className="w-full text-xs p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100 leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-indigo-900/30 text-xs uppercase tracking-wider"
              >
                {submitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <FaPaperPlane className="w-3.5 h-3.5" />
                    <span>Send Message to Support</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>

      </section>

      {/* ❓ Quick Contact FAQs */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-left">
        <h3 className="text-xl font-black text-center">Frequently Asked Support Questions</h3>
        <div className="space-y-3">
          {contactFaqs.map((faq, idx) => (
            <div key={idx} className="glass-card rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                type="button"
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full p-4 flex items-center justify-between font-bold text-xs text-slate-800 dark:text-slate-200 text-left"
              >
                <span>{faq.q}</span>
                {activeFaq === idx ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown />}
              </button>
              {activeFaq === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed">
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

export default ContactPage;