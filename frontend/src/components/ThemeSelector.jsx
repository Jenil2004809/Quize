import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '../redux/authSlice';
import { FaSun, FaMoon, FaPalette, FaCheck, FaDesktop } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const THEMES = [
  {
    id: 'light',
    name: 'Academic Light',
    tagline: 'Crisp White & Royal Blue',
    icon: <FaSun className="text-amber-500" />,
    previewBg: 'bg-slate-100 border-slate-300',
    accentColor: 'bg-blue-600',
    badge: '☀️ Light'
  },
  {
    id: 'dark',
    name: 'Slate Dark',
    tagline: 'Deep Slate & Indigo Glow',
    icon: <FaMoon className="text-indigo-400" />,
    previewBg: 'bg-slate-900 border-slate-700',
    accentColor: 'bg-indigo-500',
    badge: '🌙 Dark'
  },
  {
    id: 'oled',
    name: 'Midnight OLED',
    tagline: 'Pure Pitch Black & Cyan Matrix',
    icon: <FaDesktop className="text-cyan-400" />,
    previewBg: 'bg-black border-zinc-800',
    accentColor: 'bg-cyan-400',
    badge: '🌌 OLED'
  },
  {
    id: 'cyber',
    name: 'Cyber Synthwave',
    tagline: 'Cosmic Violet & Neon Pink Glow',
    icon: <FaPalette className="text-fuchsia-400" />,
    previewBg: 'bg-purple-950 border-purple-800',
    accentColor: 'bg-fuchsia-500',
    badge: '🔮 Cyber'
  }
];

const ThemeSelector = ({ variant = 'dropdown', align = 'right' }) => {
  const { theme } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeTheme = THEMES.find((t) => t.id === theme) || THEMES[1];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (themeId) => {
    dispatch(setTheme(themeId));
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Theme Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 hover:text-blue-500 dark:hover:text-blue-400 transition-all hover:scale-105 shadow-sm text-xs font-bold"
        aria-label="Select Theme Style"
        title={`Active Theme: ${activeTheme.name}`}
      >
        <span className="text-sm">{activeTheme.icon}</span>
        <span className="hidden sm:inline-block font-semibold">{activeTheme.badge}</span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
      </button>

      {/* Floating Theme Options Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute mt-2 w-64 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 text-left ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Display Theme (4 Palettes)
              </span>
              <FaPalette className="text-slate-400 text-xs" />
            </div>

            <div className="space-y-1">
              {THEMES.map((t) => {
                const isSelected = (theme === t.id) || (!theme && t.id === 'dark');
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelect(t.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-all text-xs font-semibold ${
                      isSelected
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${t.previewBg} shadow-inner`}>
                        <span className="text-xs">{t.icon}</span>
                      </div>
                      <div className="text-left">
                        <p className="font-bold leading-tight">{t.name}</p>
                        <p className="text-[10px] text-slate-400 leading-tight">{t.tagline}</p>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] shadow-sm">
                        <FaCheck />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ThemeSelector;
