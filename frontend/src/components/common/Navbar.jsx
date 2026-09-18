import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  User,
  Link2,
  Navigation,
  Globe,
  MapPin,
  AlertCircle,
  Settings,
  Calculator,
} from 'lucide-react';

export default function Navbar() {
  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/portal', label: 'User Portal', icon: User },
    { to: '/journey-chain', label: 'Journey Chain', icon: Link2 },
    { to: '/safe-journey', label: 'Live Track', icon: Navigation },
    { to: '/phrase-helper', label: 'Bhashini AI', icon: Globe },
    { to: '/discover', label: 'Monuments', icon: MapPin },
    { to: '/fare-meter', label: 'Fair Fare', icon: Calculator },
    { to: '/emergency', label: 'SOS 112', icon: AlertCircle },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 glass-panel border-t border-surface-border md:static md:border-b md:border-t-0 md:bg-surface/50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-around md:justify-start md:space-x-1 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                id={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="whitespace-nowrap tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
