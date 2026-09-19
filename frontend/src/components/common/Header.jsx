import React from 'react';
import { 
  Shield, 
  QrCode, 
  Globe, 
  AlertTriangle, 
  Sun, 
  Moon, 
  Menu 
} from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import { useSidebar } from '../../context/SidebarContext';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

export default function Header({ onOpenQR, onOpenLang }) {
  const { traveler, journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();
  const { toggleMobile, toggleCollapse } = useSidebar();

  const handleSidebarToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobile();
    } else {
      toggleCollapse();
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 min-h-[4rem] py-2 sm:py-2.5 flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Left: Hamburger Menu & Consolidated Branding (Single Source of Truth) */}
        <div className="header-left flex items-center space-x-2.5 sm:space-x-3.5 min-w-0 shrink-0">
          <button
            id="btn-sidebar-hamburger-toggle"
            onClick={handleSidebarToggle}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          </button>

          {/* Consolidated Primary Header Logo */}
          <Link to="/" className="flex items-center space-x-2.5 sm:space-x-3 group min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center p-1.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
              <Shield className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-white" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="text-base sm:text-lg font-black tracking-tight font-display text-white truncate">
                  TRAVEL<span className="text-emerald-400">MATE</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 uppercase tracking-widest shrink-0">
                  Delhi
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide hidden md:block truncate">
                Cross-Service Tourist Trust &amp; Safety Layer
              </p>
            </div>
          </Link>
        </div>

        {/* Center: Simplified, Consolidated Single-Line Journey Pass */}
        <div className="header-center hidden lg:flex items-center space-x-2.5 bg-surface-card px-3 py-1.5 rounded-xl border border-surface-border text-xs shrink-0 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-slate-300 whitespace-nowrap">
            Journey Pass: <strong className="text-white font-mono">{journey?.journey_code || 'TM-DEL-2026-X89K'}</strong>
          </span>
          <span className="text-slate-600">•</span>
          <StatusBadge status="Official" />
          <button
            id="btn-header-view-pass"
            onClick={onOpenQR}
            className="h-7 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Right Actions: Theme Toggle, Location/Language, and SOS Button */}
        <div className="header-right flex items-center space-x-2 sm:space-x-2.5 md:space-x-3 shrink-0">
          {/* Global Light / Dark Theme Toggle Button */}
          <button
            id="btn-global-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center h-9 w-9 sm:h-9.5 sm:w-9.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all group focus:outline-none"
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Location & Language Selector */}
          <button
            id="btn-header-language-support"
            onClick={onOpenLang}
            title="Open Bhashini Language Support & Phrase Cards"
            className="flex items-center space-x-1.5 h-9 sm:h-9.5 px-2.5 sm:px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-400/40 text-xs text-slate-300 transition-all group focus:outline-none"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform shrink-0" />
            <span className="hidden sm:inline font-medium">{traveler?.nationality || 'United Kingdom'}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="uppercase text-[11px] font-bold text-emerald-400">
              {traveler?.preferred_language || 'EN'} ⇄ HI
            </span>
          </button>

          {/* Emergency Quick Tap SOS Button */}
          <Link
            to="/emergency"
            id="btn-header-sos-link"
            className="flex items-center space-x-1.5 h-9 sm:h-9.5 px-3 sm:px-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all hover:scale-105 active:scale-95 focus:outline-none shadow-md shadow-red-600/10"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce shrink-0" />
            <span className="font-bold">SOS 112</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
