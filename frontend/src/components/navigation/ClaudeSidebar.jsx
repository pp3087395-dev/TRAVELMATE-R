import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useTraveler } from '../../context/TravelerContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Home,
  Navigation,
  Link2,
  Languages,
  AlertTriangle,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Compass,
  CalendarDays,
  Calculator,
  Camera,
  ShieldAlert,
  Sun,
  Moon,
  Plus,
  QrCode
} from 'lucide-react';

export default function ClaudeSidebar({ onOpenQR }) {
  const { isCollapsed, isMobileOpen, toggleCollapse, closeMobile } = useSidebar();
  const { traveler, journey } = useTraveler();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Primary 6 Navigation Links (as explicitly requested)
  const primaryLinks = [
    {
      to: '/portal',
      label: 'Dashboard / Home',
      icon: Home,
      exact: true,
      badge: 'Hub'
    },
    {
      to: '/safe-journey',
      label: 'Active Trips & Live Tracking',
      icon: Navigation,
      badge: 'Live'
    },
    {
      to: '/journey-chain',
      label: 'Journey Chains (Ledger)',
      icon: Link2,
      badge: 'Crypto'
    },
    {
      to: '/phrase-helper',
      label: 'Bhashini AI Translator',
      icon: Languages,
      badge: 'AI'
    },
    {
      to: '/emergency',
      label: 'Distress & Assistance',
      icon: AlertTriangle,
      badge: '112',
      danger: true
    },
    {
      to: '/settings',
      label: 'User Settings & Profile',
      icon: Settings
    }
  ];

  // Secondary Tools
  const secondaryLinks = [
    { to: '/discover', label: 'Verified Monuments', icon: Compass },
    { to: '/planner', label: 'Trip Planner', icon: CalendarDays },
    { to: '/fare-meter', label: 'Fair Fare Meter', icon: Calculator },
    { to: '/vault', label: 'RideSafe Vault', icon: Camera },
    { to: '/admin', label: 'Control Room Audit', icon: ShieldAlert }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden animate-fadeIn"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="claude-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col justify-between bg-slate-950/95 lg:bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Top Header & Brand */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between min-w-0 gap-2">
          <NavLink
            to="/"
            onClick={closeMobile}
            className="flex items-center space-x-2.5 overflow-hidden group min-w-0 flex-1"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shrink-0 p-1.5 shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
                <span className="text-sm font-black font-display tracking-tight text-white">
                  TRAVEL<span className="text-emerald-400">MATE</span>
                </span>
                <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                  DELHI
                </span>
              </div>
            )}
          </NavLink>

          {/* Desktop Collapse Toggle Arrow */}
          <button
            onClick={toggleCollapse}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors shrink-0 ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            aria-label="Close Mobile Navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List Container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          
          {/* Quick SafePass Action Card (only visible when expanded) */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-950/50 to-emerald-950/40 border border-indigo-500/20 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">SafePass Token</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {journey?.journey_code ? journey.journey_code.slice(-4) : 'X89K'}
                </span>
              </div>
              <button
                onClick={() => {
                  if (onOpenQR) onOpenQR();
                  closeMobile();
                }}
                className="w-full py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Show QR Pass</span>
              </button>
            </div>
          )}

          {/* 1. Core Modules Section */}
          <div className="space-y-1">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">
                Main Menu
              </div>
            )}
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  title={isCollapsed && !isMobileOpen ? link.label : undefined}
                  className={`relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group ${
                    isCollapsed && !isMobileOpen
                      ? 'justify-center p-3'
                      : 'px-3 py-2.5 space-x-3'
                  } ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      link.danger
                        ? 'text-red-400'
                        : isActive
                        ? 'text-emerald-400'
                        : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="flex-1 truncate tracking-tight">
                      {link.label}
                    </span>
                  )}
                  {(!isCollapsed || isMobileOpen) && link.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                        link.danger
                          ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                          : 'bg-white/10 text-slate-300'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* 2. Secondary Tools Section */}
          <div className="space-y-1 pt-2 border-t border-white/10">
            {(!isCollapsed || isMobileOpen) && (
              <div className="px-3 pb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-display">
                Travel Tools
              </div>
            )}
            {secondaryLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={closeMobile}
                  title={isCollapsed && !isMobileOpen ? link.label : undefined}
                  className={`relative flex items-center rounded-xl text-xs font-medium transition-all duration-200 group ${
                    isCollapsed && !isMobileOpen
                      ? 'justify-center p-2.5'
                      : 'px-3 py-2 space-x-3'
                  } ${
                    isActive
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-200" />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="flex-1 truncate tracking-tight text-[11px]">
                      {link.label}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

        </div>

        {/* Bottom User Profile & Theme Controls */}
        <div className="p-3 border-t border-white/10 space-y-3">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.03] border border-white/5">
              <NavLink
                to="/settings"
                onClick={closeMobile}
                className="flex items-center space-x-2.5 overflow-hidden flex-1 group"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {traveler?.name ? traveler.name.charAt(0) : 'S'}
                </div>
                <div className="truncate">
                  <div className="text-xs font-bold text-white font-display truncate group-hover:text-emerald-300 transition-colors">
                    {traveler?.name || 'Sarah Jenkins'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {traveler?.nationality || 'United Kingdom'}
                  </div>
                </div>
              </NavLink>

              <button
                onClick={toggleTheme}
                title={isDark ? 'Switch to Light' : 'Switch to Dark'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors shrink-0"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <NavLink
                to="/settings"
                title={traveler?.name || 'Profile'}
                className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform"
              >
                {traveler?.name ? traveler.name.charAt(0) : 'S'}
              </NavLink>
              <button
                onClick={toggleTheme}
                title={isDark ? 'Light Mode' : 'Dark Mode'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/10 transition-colors"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
