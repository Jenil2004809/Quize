import React, { useEffect, useState } from 'react';
import { FaCog, FaShieldAlt, FaPaintBrush, FaUniversity, FaEnvelope, FaPhoneAlt, FaCheckCircle, FaSlidersH, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../services/api';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    instituteName: 'Quizzy International Academy',
    supportEmail: 'support@quizzy.com',
    supportPhone: '+1 800 555 0199',
    allowRegistrations: true,
    autoApproveTeachers: true,
    generateCertificates: true,
    passingPercentage: 50,
    maxQuizTimeLimit: 180,
    defaultLanguage: 'English',
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error('Error loading settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        Swal.fire({
          title: 'Configurations Saved! ⚙️',
          text: res.data.message || 'System settings updated successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Error', res.data.message || 'Failed to update settings', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to save system configurations.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton type="card" count={3} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-left py-4">
      {/* Page Title & Save Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
            <FaCog className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-3xl font-black">System Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure global platform branding, permissions, exam defaults & maintenance status.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-500/20 text-xs transition-all hover-scale disabled:opacity-50"
        >
          <FaCheckCircle className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Institute Branding & Support */}
        <div className="glass-card rounded-3xl p-6 space-y-5">
          <h3 className="text-base font-bold flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-blue-500">
            <FaUniversity className="w-4 h-4" />
            <span>Branding & Support Information</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Institute Branding Name
              </label>
              <input
                type="text"
                required
                value={settings.instituteName}
                onChange={(e) => setSettings({ ...settings, instituteName: e.target.value })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <FaEnvelope className="text-slate-400" /> Support Email Address
              </label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <FaPhoneAlt className="text-slate-400" /> Support Helpline Phone
              </label>
              <input
                type="text"
                required
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Platform Permissions */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-indigo-500">
            <FaShieldAlt className="w-4 h-4" />
            <span>Access Control & Permissions</span>
          </h3>

          <div className="space-y-4 pt-1">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h4 className="text-sm font-bold">Allow Public Sign-Ups</h4>
                <p className="text-xs text-slate-400">Permit new visitors to register as students or educators</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowRegistrations')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.allowRegistrations ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${settings.allowRegistrations ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h4 className="text-sm font-bold">Auto-Approve Educator Licenses</h4>
                <p className="text-xs text-slate-400">Instantly activate new teacher accounts upon registration</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoApproveTeachers')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.autoApproveTeachers ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${settings.autoApproveTeachers ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h4 className="text-sm font-bold">Enable PDF Certifications</h4>
                <p className="text-xs text-slate-400">Generate crypto-coded certifications for students upon passing tests</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('generateCertificates')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.generateCertificates ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${settings.generateCertificates ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>

            <div className="flex justify-between items-center py-2">
              <div>
                <h4 className="text-sm font-bold text-amber-500 flex items-center gap-1.5">
                  <FaExclamationTriangle className="w-3.5 h-3.5" /> Platform Maintenance Mode
                </h4>
                <p className="text-xs text-slate-400">Display maintenance banner and restrict new exam attempts</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('maintenanceMode')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${settings.maintenanceMode ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Exam Parameters & Language */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-base font-bold flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-3 text-emerald-500">
            <FaSlidersH className="w-4 h-4" />
            <span>Exam Rules & Default Parameters</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Default Passing Score (%)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={settings.passingPercentage}
                onChange={(e) => setSettings({ ...settings, passingPercentage: Number(e.target.value) })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Max Time Limit (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="600"
                value={settings.maxQuizTimeLimit}
                onChange={(e) => setSettings({ ...settings, maxQuizTimeLimit: Number(e.target.value) })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <FaPaintBrush className="text-slate-400" /> Default Language
              </label>
              <select
                value={settings.defaultLanguage}
                onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
                className="w-full text-sm px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="English">English (US)</option>
                <option value="Spanish">Spanish (ES)</option>
                <option value="French">French (FR)</option>
                <option value="German">German (DE)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/20 text-sm transition-all hover-scale disabled:opacity-50"
          >
            <FaCheckCircle className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;