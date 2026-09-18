import React from 'react';
import { Shield, QrCode, Globe, AlertTriangle, CheckCircle, BellRing, Sun, Moon, Menu } from 'lucide-react';
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-sidebar-hamburger-toggle"
            onClick={handleSidebarToggle}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center p-2 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-black tracking-tight font-display text-white">
                TRAVEL<span className="text-emerald-400">MATE</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30 uppercase tracking-widest">
                Delhi
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              Cross-Service Tourist Trust & Safety Layer
            </p>
          </div>
        </Link>
      </div>

        {/* Center / Active SafeVisit Pass Pill */}
        <div className="hidden md:flex items-center space-x-3 bg-surface-card px-3 py-1.5 rounded-full border border-surface-border">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs text-slate-300">
            Journey Pass: <strong className="text-white font-mono">{journey?.journey_code || 'TM-DEL-2026-X89K'}</strong>
          </span>
          <StatusBadge status="Official" />
          <button
            id="btn-header-view-pass"
            onClick={onOpenQR}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-medium flex items-center space-x-1"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Show QR</span>
          </button>
        </div>

        {/* Right Actions: Theme Toggle, Nationality & Emergency Quick Tap */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Global Light / Dark Theme Toggle Button */}
          <button
            id="btn-global-theme-toggle"
            onClick={toggleTheme}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-amber-300 transition-all group"
            aria-label="Toggle Light/Dark Theme"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          <button
            id="btn-header-language-support"
            onClick={onOpenLang}
            title="Open Bhashini Language Support & Phrase Cards"
            className="flex items-center space-x-1.5 text-xs text-slate-300 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10 hover:border-indigo-400/40 transition-all group"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">{traveler?.nationality || 'UK'}</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="uppercase text-[11px] font-bold text-emerald-400">
              {traveler?.preferred_language || 'EN'} ⇄ HI
            </span>
          </button>

          <Link
            to="/emergency"
            id="btn-header-sos-link"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 text-xs font-bold transition-all hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span>SOS 112</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
