import React, { useState } from 'react';
import { useTraveler } from '../context/TravelerContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import {
  Settings,
  User,
  Globe,
  Phone,
  Shield,
  Trash2,
  Download,
  Sun,
  Moon,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  Lock,
  Save
} from 'lucide-react';

const NATIONALITIES = [
  'United Kingdom', 'United States', 'Germany', 'France',
  'Australia', 'Japan', 'Spain', 'Canada', 'Italy', 'India', 'Other'
];

const LANGUAGES = [
  { code: 'en', label: 'English (EN)' },
  { code: 'hi', label: 'हिन्दी (Hindi - HI)' },
  { code: 'bn', label: 'বাংলা (Bengali - BN)' },
  { code: 'ta', label: 'தமிழ் (Tamil - TA)' },
  { code: 'te', label: 'తెలుగు (Telugu - TE)' },
  { code: 'mr', label: 'मराठी (Marathi - MR)' },
  { code: 'fr', label: 'Français (FR)' },
  { code: 'de', label: 'Deutsch (DE)' },
  { code: 'es', label: 'Español (ES)' },
  { code: 'ja', label: '日本語 (JA)' }
];

export default function SettingsPage() {
  const { traveler, journey, updateProfile, concludeJourney } = useTraveler();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: traveler?.name || 'Sarah Jenkins',
    nationality: traveler?.nationality || 'United Kingdom',
    preferred_language: traveler?.preferred_language || 'en',
    emergency_contact: traveler?.emergency_contact || '+44 7700 900077',
    opt_in_location: traveler?.opt_in_location !== false
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateProfile(
        {
          ...traveler,
          ...formData
        },
        journey
      );
      showToast('Profile and preferences updated successfully!', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurgeData = async () => {
    if (
      window.confirm(
        'PERMANENT PRIVACY PURGE (Scope #18):\n\nThis will immediately delete your name, emergency phone number, and GPS route history from the server and local device.\n\nProceed?'
      )
    ) {
      try {
        await api.expireJourney(journey?.journey_code || 'TM-DEL-2026-X89K');
        concludeJourney();
        showToast('All personal identifying data has been permanently purged under Scope #18.', 'info', 5000);
      } catch (err) {
        showToast('Error purging data from server. Purging local storage.', 'warning');
        concludeJourney();
      }
    }
  };

  const handleDownloadLedger = async () => {
    try {
      const res = await api.getJourneyChain(traveler?.id || journey?.journey_code || 'trv-default-sarah');
      const blob = new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `travelmate-ledger-${journey?.journey_code || 'backup'}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Ledger backup JSON downloaded!', 'success');
    } catch (e) {
      showToast('Could not export ledger file.', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>User Configuration & Privacy Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Settings & Security
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Configure your personal travel profile, language defaults, cryptographic backup, and Scope #18 privacy compliance.
          </p>
        </div>

        {/* Global Light / Dark Theme Button */}
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold flex items-center space-x-2 transition-all self-start sm:self-auto"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
        </button>
      </div>

      {/* Profile Form */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <User className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold font-display text-white">
              Personal Travel Profile
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400">
            ID: {traveler?.temp_id || 'TRV-X89K'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name / Traveler Handle
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Nationality
              </label>
              <select
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              >
                {NATIONALITIES.map((n) => (
                  <option key={n} value={n} className="bg-slate-900 text-white">
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Preferred Regional / Vernacular Language
              </label>
              <select
                value={formData.preferred_language}
                onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Emergency Contact Phone
              </label>
              <input
                type="text"
                value={formData.emergency_contact}
                onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                placeholder="+44 7700 900077"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.opt_in_location}
                onChange={(e) => setFormData({ ...formData, opt_in_location: e.target.checked })}
                className="rounded text-emerald-500 focus:ring-0"
              />
              <span>Opt-in to background GPS deviation checks (&gt;500m soft alert)</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Cryptographic Backup & Export */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold font-display text-white">
              Cryptographic Journey Chain Ledger Backup
            </h2>
          </div>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Download your immutable SHA-256 travel ledger as an offline verifiable JSON package. You can provide this to travel insurers or tax authorities as tamper-proof transit evidence.
        </p>
        <div>
          <button
            onClick={handleDownloadLedger}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Download Ledger Export (.json)</span>
          </button>
        </div>
      </div>

      {/* Scope #18 Privacy Purge */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-red-500/20 bg-red-950/10 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
          <div className="flex items-center space-x-2.5 text-red-400">
            <Trash2 className="w-5 h-5" />
            <h2 className="text-lg font-bold font-display text-white">
              Data Retention &amp; Privacy Purge (Scope #18)
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-300">
            Irreversible
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          In strict compliance with Delhi Tourism Scope #18 privacy guidelines, any traveler can instantly purge all personal identifiers (name, emergency contacts, and exact GPS tracks) at any point during or at the end of their stay.
        </p>
        <div className="pt-2">
          <button
            onClick={handlePurgeData}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/20 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Permanently Purge My Personal Data Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
