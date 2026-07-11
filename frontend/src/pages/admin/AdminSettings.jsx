import React, { useEffect, useState } from 'react';
import { FaCog, FaShieldAlt, FaPaintBrush } from 'react-icons/fa';
import Swal from 'sweetalert2';
import api from '../../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    instituteName: 'Quizzy International Academy',
    allowRegistrations: true,
    autoApproveTeachers: false,
    generateCertificates: true,
    defaultLanguage: 'English'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          setSettings(res.data.settings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/settings', settings);
      if (res.data.success) {
        Swal.fire({
          title: 'Settings Saved! ⚙️',
          text: 'System configurations updated successfully.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } else {
        Swal.fire('Error', res.data.message || 'Failed to update settings', 'error');
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to update settings', 'error');
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left py-4">
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl"><FaCog className="w-6 h-6" /></div>
        <div>
          <h1 className="text-3xl font-black">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configure global platform permissions and look & feel</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core settings */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <FaShieldAlt className="text-blue-500" />
            <span>Platform Permissions</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Institute Branding Name</label>
              <input
                type="text"
                required
                value={settings.instituteName}
                onChange={e => setSettings({ ...settings, instituteName: e.target.value })}
                className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
              />
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h4 className="text-sm font-bold">Allow Public Registrations</h4>
                <p className="text-xs text-slate-400">Permit new visitors to sign up as students or educators</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('allowRegistrations')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.allowRegistrations ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${settings.allowRegistrations ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-850">
              <div>
                <h4 className="text-sm font-bold">Auto-Approve Educator Licenses</h4>
                <p className="text-xs text-slate-400">Instantly activate new teacher accounts without manual review</p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('autoApproveTeachers')}
                className={`w-12 h-6 rounded-full transition-all relative ${settings.autoApproveTeachers ? 'bg-blue-600' : 'bg-slate-300'}`}
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
                className={`w-12 h-6 rounded-full transition-all relative ${settings.generateCertificates ? 'bg-blue-600' : 'bg-slate-300'}`}
              >
                <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${settings.generateCertificates ? 'right-1' : 'left-1'}`}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="glass-card rounded-3xl p-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <FaPaintBrush className="text-indigo-500" />
            <span>Appearance & Languages</span>
          </h3>

          <div className="pt-2">
            <label className="block text-xs font-bold uppercase text-slate-400 mb-1">System Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={e => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none"
            >
              <option value="English">English (US)</option>
              <option value="Spanish">Spanish (ES)</option>
              <option value="French">French (FR)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl hover-scale shadow-lg shadow-blue-500/10 text-sm"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
