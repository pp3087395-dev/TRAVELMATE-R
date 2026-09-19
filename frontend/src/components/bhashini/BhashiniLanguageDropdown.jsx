import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Languages, Search, Sparkles, Globe } from 'lucide-react';
import {
  MAJOR_INDIAN_LANGUAGES,
  MAJOR_INTERNATIONAL_LANGUAGES,
  BHASHINI_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
} from '../../services/bhashiniService';

// Combined language set with group metadata
const COMPREHENSIVE_LANGUAGES = [
  ...MAJOR_INDIAN_LANGUAGES.map((l) => ({ ...l, category: 'indian' })),
  ...MAJOR_INTERNATIONAL_LANGUAGES.map((l) => ({ ...l, category: 'intl' })),
];

/**
 * BhashiniLanguageDropdown
 * 
 * High-fidelity, scrollable dropdown selector for Indian & International languages
 * with a fixed max height (max-h-60) and dark-themed scrollbar.
 * 
 * Features:
 * - 10 Major Indian Languages (Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Punjabi, Kannada, Malayalam, Odia)
 * - 10 Major International Languages (English, Spanish, French, German, Chinese, Japanese, Arabic, Russian, Portuguese, Italian)
 * - Optional Auto Detect for source input
 * - Category filter tabs (All, Indian, International)
 * - Fixed max height (max-h-60 overflow-y-auto) with dark-theme scrollbar
 * - Active checkmark, language code pills, and smooth transitions
 */
export default function BhashiniLanguageDropdown({
  selectedLanguage = 'hi',
  onSelectLanguage,
  id = 'bhashini-language-dropdown',
  className = '',
  theme = 'indigo', // 'indigo' | 'emerald' | 'amber' | 'cyan'
  showSearch = true,
  includeAuto = false,
  align = 'right', // 'left' | 'right'
  disabled = false,
  label = null,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'indian' | 'intl'
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      if (showSearch && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, showSearch]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Resolve currently active language meta
  const getActiveLangObj = () => {
    if (selectedLanguage === 'auto') {
      return { code: 'auto', name: 'Auto Detect', native: '✨ Auto' };
    }
    const match =
      COMPREHENSIVE_LANGUAGES.find((l) => l.code === selectedLanguage) ||
      BHASHINI_LANGUAGES.find((l) => l.code === selectedLanguage) ||
      INTERNATIONAL_LANGUAGES.find((l) => l.code === selectedLanguage);
    return match || { code: selectedLanguage, name: selectedLanguage.toUpperCase(), native: selectedLanguage.toUpperCase() };
  };

  const activeLangObj = getActiveLangObj();

  // Filter languages by search and tab
  const allList = includeAuto
    ? [{ code: 'auto', name: 'Auto Detect', native: '✨ Auto', category: 'all' }, ...COMPREHENSIVE_LANGUAGES]
    : COMPREHENSIVE_LANGUAGES;

  const filteredLanguages = allList.filter((lang) => {
    // Tab filter
    if (activeTab === 'indian' && lang.category !== 'indian') return false;
    if (activeTab === 'intl' && lang.category !== 'intl') return false;

    // Search query filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      lang.name.toLowerCase().includes(q) ||
      lang.native.toLowerCase().includes(q) ||
      lang.code.toLowerCase().includes(q)
    );
  });

  const handleSelect = (code) => {
    if (onSelectLanguage) {
      onSelectLanguage(code);
    }
    setIsOpen(false);
    setSearchQuery('');
  };

  // Theme palettes
  const themeStyles = {
    indigo: {
      btn: 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30 hover:bg-indigo-500/20 hover:border-indigo-500/50',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      activeItem: 'bg-indigo-500/20 text-white font-bold border-indigo-500/40',
      hoverItem: 'hover:bg-indigo-500/15 hover:text-indigo-100',
      check: 'text-indigo-400',
      focus: 'focus:ring-indigo-500/40',
      tabActive: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30 font-bold',
    },
    emerald: {
      btn: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeItem: 'bg-emerald-500/20 text-white font-bold border-emerald-500/40',
      hoverItem: 'hover:bg-emerald-500/15 hover:text-emerald-100',
      check: 'text-emerald-400',
      focus: 'focus:ring-emerald-500/40',
      tabActive: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-bold',
    },
    amber: {
      btn: 'text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeItem: 'bg-amber-500/20 text-white font-bold border-amber-500/40',
      hoverItem: 'hover:bg-amber-500/15 hover:text-amber-100',
      check: 'text-amber-400',
      focus: 'focus:ring-amber-500/40',
      tabActive: 'bg-amber-500/20 text-amber-300 border-amber-500/30 font-bold',
    },
    cyan: {
      btn: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 hover:border-cyan-500/50',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      activeItem: 'bg-cyan-500/20 text-white font-bold border-cyan-500/40',
      hoverItem: 'hover:bg-cyan-500/15 hover:text-cyan-100',
      check: 'text-cyan-400',
      focus: 'focus:ring-cyan-500/40',
      tabActive: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30 font-bold',
    },
  };

  const currentTheme = themeStyles[theme] || themeStyles.indigo;

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        title={`Selected Language: ${activeLangObj.name} (${activeLangObj.code.toUpperCase()})`}
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 ${currentTheme.btn} ${currentTheme.focus} ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {label && <span className="text-slate-400 font-normal">{label}:</span>}
        <Languages className="w-3.5 h-3.5 shrink-0 opacity-80" />
        <span className="font-bold text-white tracking-wide truncate max-w-[110px] sm:max-w-[140px]">
          {activeLangObj.name}
        </span>
        {activeLangObj.code !== 'auto' && (
          <span className="opacity-80 text-[11px] hidden sm:inline text-slate-300">
            ({activeLangObj.native})
          </span>
        )}
        <span
          className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] uppercase border shrink-0 ${currentTheme.badge}`}
        >
          {activeLangObj.code}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-2 w-72 sm:w-80 rounded-2xl bg-[#0B1220]/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/85 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Top Bar */}
          <div className="px-3.5 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Indian &amp; Global Languages</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono text-[9px]">
              20 Languages
            </span>
          </div>

          {/* Quick Filter Tabs (All / Indian / International) */}
          <div className="flex items-center gap-1 p-1.5 border-b border-white/10 bg-black/20 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-1 rounded-lg transition-all text-center ${
                activeTab === 'all'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              All (20)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('indian')}
              className={`flex-1 py-1 rounded-lg transition-all text-center ${
                activeTab === 'indian'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Indian (10)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('intl')}
              className={`flex-1 py-1 rounded-lg transition-all text-center ${
                activeTab === 'intl'
                  ? currentTheme.tabActive
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Global (10)
            </button>
          </div>

          {/* Search Box */}
          {showSearch && (
            <div className="p-2 border-b border-white/10 bg-black/30">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search language or code (e.g. Tamil, es)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          )}

          {/* Scrollable Language List Container: max-h-60 overflow-y-auto */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 bhashini-dropdown-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === selectedLanguage;
              const isIndian = lang.category === 'indian';
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 text-left border ${
                    isSelected
                      ? currentTheme.activeItem
                      : `border-transparent text-slate-200 ${currentTheme.hoverItem}`
                  }`}
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-[10px] uppercase border shrink-0 ${
                        isSelected
                          ? currentTheme.badge
                          : 'bg-white/5 text-slate-400 border-white/10'
                      }`}
                    >
                      {lang.code === 'auto' ? '✨' : lang.code}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-white tracking-wide truncate flex items-center space-x-1.5">
                        <span>{lang.name}</span>
                        {lang.category && lang.code !== 'auto' && (
                          <span
                            className={`text-[9px] px-1 py-0.1 rounded font-normal uppercase ${
                              isIndian
                                ? 'bg-amber-500/15 text-amber-300'
                                : 'bg-blue-500/15 text-blue-300'
                            }`}
                          >
                            {isIndian ? 'IN' : 'Global'}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {lang.native}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0 ml-2">
                    {isSelected && (
                      <Check className={`w-4 h-4 ${currentTheme.check} stroke-[2.5]`} />
                    )}
                  </div>
                </button>
              );
            })}

            {filteredLanguages.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No matching language found
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-3.5 py-2 border-t border-white/10 bg-white/[0.01] flex items-center justify-between text-[10px] text-slate-400">
            <span>
              Selected: <strong className="text-white font-semibold">{activeLangObj.name}</strong> ({activeLangObj.native})
            </span>
            <span className="font-mono text-slate-500 uppercase">
              {activeLangObj.code}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
