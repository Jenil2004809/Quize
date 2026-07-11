import React, { useState } from 'react';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import api from '../services/api';
import Swal from 'sweetalert2';

const ContactPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        Swal.fire({
          title: 'Message Sent! ✉️',
          text: res.data.message || 'Thank you! Your query has been logged.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error Sending ⚠️',
        text: err.response?.data?.message || 'Something went wrong. Please check your credentials.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
      
      {/* Contact Information */}
      <div className="space-y-8 text-left">
        <div className="space-y-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Have questions about student limits, certifications, or custom developer solutions? Fill in the form and our team will get back to you within 24 hours.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><FaEnvelope className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Email Support</p>
              <p className="text-sm font-semibold">support@quizzy.com</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><FaPhone className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Call Directly</p>
              <p className="text-sm font-semibold">+1 (555) 123-4567</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl"><FaMapMarkerAlt className="w-5 h-5" /></div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Headquarters</p>
              <p className="text-sm font-semibold">100 Innovation Way, Silicon Valley, CA</p>
            </div>
          </div>
        </div>

        {/* Map placeholder */}
        <div className="h-60 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
          <iframe
            title="Office Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.6273413999946!2d-122.0837468!3d37.4224498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fba02425d1f1b%3A0x62cc7087611598f8!2sGoogleplex!5e0!3m2!1sen!2sus!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>

      {/* Form Submission */}
      <div className="glass-card rounded-3xl p-8 h-fit">
        <h2 className="text-2xl font-bold mb-6 text-left">Send a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Your Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Subject</label>
            <input
              type="text"
              name="subject"
              required
              value={formData.subject}
              onChange={handleChange}
              placeholder="Partnership / Support Question"
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Detailed Message</label>
            <textarea
              name="message"
              required
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Write your details here..."
              className="w-full text-sm px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-850 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center justify-center space-x-2 transition-colors disabled:bg-blue-500/50"
          >
            {submitting ? (
              <span>Sending...</span>
            ) : (
              <>
                <FaPaperPlane /> <span>Send Message</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;
