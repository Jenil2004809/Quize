import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaFacebook, FaPaperPlane } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Footer = () => {
  const handleNewsletter = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    if (email) {
      Swal.fire({
        title: 'Subscribed! 🎉',
        text: 'Thank you for subscribing to our newsletter! We will keep you updated.',
        icon: 'success',
        confirmButtonColor: '#3b82f6',
        background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
        color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#1e293b'
      });
      e.target.reset();
    }
  };

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-xl font-black bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent tracking-wide">
              QUIZZY
            </span>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Empowering students and teachers with interactive, production-ready assessment utilities, statistics, and instant certifications.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><FaFacebook className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><FaTwitter className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><FaGithub className="w-5 h-5" /></a>
              <a href="#" className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"><FaLinkedin className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">Contact Form</Link></li>
              <li><Link to="/login" className="text-slate-500 dark:text-slate-400 hover:text-blue-500 transition-colors">Sign In Portal</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Contact Info</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>Email: support@quizzy.com</li>
              <li>Phone: +91 90164 66277</li>
              <li>Location: 100 Innovation Way, Silicon Valley, CA</li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">Newsletter</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Subscribe to stay updated with new challenges and platform announcements.
            </p>
            <form onSubmit={handleNewsletter} className="flex">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter email address"
                className="w-full text-sm px-4 py-2 rounded-l-lg border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors"
                aria-label="Subscribe"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-900 text-center">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Quizzy Inc. All rights reserved. Created for Production-Ready Deployment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
