import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Globe, ExternalLink, Heart, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Footer() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <footer className="border-t border-white/10 bg-slate-950/80 backdrop-blur-xl text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-base font-black font-display text-white tracking-tight">
                TRAVEL<span className="text-emerald-400">MATE</span>
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/30">
                DELHI
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Next-generation tourist trust, fair fare calculation, and cryptographic trip ledger architecture for international and domestic visitors in New Delhi.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-emerald-400 font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>Scope #18 Compliant: 7-Day Auto Data Purge</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Core Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/portal" className="hover:text-emerald-400 transition-colors">
                  User Portal
                </Link>
              </li>
              <li>
                <Link to="/journey-chain" className="hover:text-emerald-400 transition-colors">
                  Journey Chain Ledger
                </Link>
              </li>
              <li>
                <Link to="/safe-journey" className="hover:text-emerald-400 transition-colors">
                  Active Trips & Live Track
                </Link>
              </li>
              <li>
                <Link to="/phrase-helper" className="hover:text-emerald-400 transition-colors">
                  Bhashini AI Translator
                </Link>
              </li>
              <li>
                <Link to="/settings" className="hover:text-emerald-400 transition-colors">
                  Settings & Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Safety Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/discover" className="hover:text-emerald-400 transition-colors">
                  ASI Verified Monuments
                </Link>
              </li>
              <li>
                <Link to="/fare-meter" className="hover:text-emerald-400 transition-colors">
                  Fair Fare Meter
                </Link>
              </li>
              <li>
                <Link to="/vault" className="hover:text-emerald-400 transition-colors">
                  RideSafe Evidence Vault
                </Link>
              </li>
              <li>
                <Link to="/emergency" className="hover:text-emerald-400 transition-colors">
                  112 SOS & Embassies
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Control Room
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Verification Portals */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-display">
              Official Partners
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://asi.nic.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>ASI (Archaeology Survey)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://delhitourism.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>Delhi Tourism (DTTDC)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://bhashini.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>Digital India Bhashini</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://delhipolice.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-emerald-400 transition-colors"
                >
                  <span>Delhi Tourist Police (112)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2026 TravelMate. Built for Smart India Hackathon (SIH 2026). All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Toggle {isDark ? 'Light' : 'Dark'} Mode
            </button>
            <span className="text-slate-600">•</span>
            <span>Zero Passport Storage Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
