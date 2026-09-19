import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Languages, Search, Sparkles } from 'lucide-react';
import { MAJOR_INDIAN_LANGUAGES, BHASHINI_LANGUAGES } from '../../services/bhashiniService';

/**
 * BhashiniLanguageDropdown
 * 
 * High-fidelity, scrollable dropdown selector for Indian languages with a fixed
 * max height (max-h-60) and dark-themed scrollbar.
 * 
 * Supports the 10 major Indian languages:
 * - Hindi (hi), Bengali (bn), Tamil (ta), Telugu (te), Marathi (mr),
 * - Gujarati (gu), Punjabi (pa), Kannada (kn), Malayalam (ml), Odia (or).
 */
export default function BhashiniLanguageDropdown({
  selectedLanguage = 'hi',
  onSelectLanguage,
  id = 'select-target-language',
  className = '',
  theme = 'indigo', // 'indigo' | 'amber' | 'emerald'
  showSearch = true,
  align = 'right', // 'left' | 'right'
  disabled = false,
  label = null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on click outside
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

  // Close on Escape
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeLangObj =
    MAJOR_INDIAN_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    BHASHINI_LANGUAGES.find((l) => l.code === selectedLanguage) ||
    MAJOR_INDIAN_LANGUAGES[0];

  const filteredLanguages = MAJOR_INDIAN_LANGUAGES.filter((lang) => {
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
      tag: 'bg-indigo-500/20 text-indigo-300'
    },
    amber: {
      btn: 'text-amber-300 bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50',
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeItem: 'bg-amber-500/20 text-white font-bold border-amber-500/40',
      hoverItem: 'hover:bg-amber-500/15 hover:text-amber-100',
      check: 'text-amber-400',
      focus: 'focus:ring-amber-500/40',
      tag: 'bg-amber-500/20 text-amber-300'
    },
    emerald: {
      btn: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeItem: 'bg-emerald-500/20 text-white font-bold border-emerald-500/40',
      hoverItem: 'hover:bg-emerald-500/15 hover:text-emerald-100',
      check: 'text-emerald-400',
      focus: 'focus:ring-emerald-500/40',
      tag: 'bg-emerald-500/20 text-emerald-300'
    }
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
        className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 ${currentTheme.btn} ${currentTheme.focus} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Languages className="w-3.5 h-3.5 shrink-0 opacity-80" />
        <span className="font-bold text-white tracking-wide">
          {activeLangObj.name}
        </span>
        <span className="opacity-80 text-[11px] hidden sm:inline text-slate-300">
          ({activeLangObj.native})
        </span>
        <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] uppercase border ${currentTheme.badge}`}>
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
          } mt-2 w-64 sm:w-72 rounded-2xl bg-[#0B1220]/95 backdrop-blur-2xl border border-white/15 shadow-2xl shadow-black/80 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
        >
          {/* Menu Top Bar */}
          <div className="px-3.5 py-2.5 border-b border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>10 Major Indian Languages</span>
            </span>
            <span className="px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-mono text-[9px]">
              MeitY Bhashini
            </span>
          </div>

          {/* Optional Search Bar */}
          {showSearch && (
            <div className="p-2 border-b border-white/10 bg-black/25">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search Indian language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-white/30"
                />
              </div>
            </div>
          )}

          {/* Scrollable Language List: max-h-60 overflow-y-auto with dark theme scrollbar */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-1 bhashini-dropdown-scrollbar">
            {filteredLanguages.map((lang) => {
              const isSelected = lang.code === selectedLanguage;
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
                      {lang.code}
                    </span>
                    <div className="truncate">
                      <div className="font-bold text-white tracking-wide truncate">
                        {lang.name}
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
              Target: <strong className="text-white font-semibold">{activeLangObj.name}</strong> ({activeLangObj.native})
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
