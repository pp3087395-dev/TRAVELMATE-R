import React, { useState, useEffect } from 'react';
import { PhoneCall, ShieldAlert, X, ExternalLink, Globe, Landmark, ChevronUp, AlertOctagon, Mic } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { api } from '../../services/api';
import StatusBadge from './StatusBadge';

export default function HelplineFloatingBadge({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  hideLauncher = false
} = {}) {
  const { traveler } = useTraveler();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = (val) => {
    if (!val && externalOnClose) externalOnClose();
    else setInternalIsOpen(val);
  };
  const [directory, setDirectory] = useState(null);

  useEffect(() => {
    async function loadDirectory() {
      const res = await api.getHelplines(traveler?.nationality || 'United Kingdom');
      if (res.success) {
        setDirectory(res.data);
      }
    }
    loadDirectory();
  }, [traveler?.nationality]);

  return (
    <>
      {/* Floating 1-Tap Trigger Button */}
      {!hideLauncher && (
        <div className="fixed bottom-4 right-4 z-30 md:bottom-6 md:right-6">
          <button
            id="btn-floating-helplines"
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 border border-rose-400/50 hover:ring-2 hover:ring-rose-400/60 hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
            title="Voice Interaction & Emergency Helpline 1363 / 112"
            aria-label="Voice Interaction and Helpline"
          >
            <div className="relative flex items-center justify-center">
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2] animate-pulse shrink-0" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-red-600 animate-ping" />
            </div>
            <span className="text-xs font-bold font-display tracking-tight text-white hidden sm:inline whitespace-nowrap">
              Voice Interaction
            </span>
          </button>
        </div>
      )}

      {/* Slide-over / Modal Directory Card */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-opacity">
          <div className="relative w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-white">Emergency & Embassy Directory</h3>
                  <p className="text-xs text-slate-400">Official Delhi Tourist Support • Available 24x7</p>
                </div>
              </div>
              <button
                id="btn-close-helpline-modal"
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Helpline Cards */}
            <div className="mt-4 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              {/* 1. Tourist Helpline 1363 */}
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border hover:border-emerald-500/30 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">Ministry of Tourism 24x7 Infoline</span>
                      <StatusBadge status="Official" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Multi-lingual helpline available in 12 languages (German, French, Spanish, Japanese, etc.)
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center space-x-2">
                  <a
                    href="tel:1363"
                    className="flex-1 py-2 px-3 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center space-x-1"
                  >
                    <PhoneCall className="w-3.5 h-3.5 mr-1" />
                    <span>Dial 1363 (Short Code)</span>
                  </a>
                  <a
                    href="tel:1800111363"
                    className="flex-1 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-lg text-xs font-semibold text-center"
                  >
                    Toll-Free 1800-11-1363
                  </a>
                </div>
              </div>

              {/* 2. National Emergency 112 */}
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-red-300">National Emergency Support (ERSS)</span>
                      <StatusBadge status="Official" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Unified police, ambulance, and fire dispatch in Delhi. Instant GPS tracing.
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <a
                    href="tel:112"
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-sm flex items-center justify-center space-x-2 shadow-lg shadow-red-600/30"
                  >
                    <AlertOctagon className="w-4 h-4" />
                    <span>Dial 112 Emergency Dispatch</span>
                  </a>
                </div>
              </div>

              {/* 3. Delhi Tourist Police */}
              <div className="p-4 rounded-xl bg-surface-card border border-surface-border">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-white">Delhi Tourist Police Headquarters</span>
                      <StatusBadge status="Official" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Connaught Place & Paharganj Kiosks. Specialized foreign visitor assistance.
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <a
                    href="tel:+911123365359"
                    className="block w-full py-2 px-3 bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-semibold text-center"
                  >
                    <PhoneCall className="w-3.5 h-3.5 inline mr-1" />
                    Call +91 11 2336 5359
                  </a>
                </div>
              </div>

              {/* 4. Tourist's Embassy Card (Auto-Personalized) */}
              {directory?.embassy && (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                      Your Embassy ({traveler?.nationality || 'United Kingdom'})
                    </span>
                    <StatusBadge status="Official" />
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{directory.embassy.name}</h4>
                  <p className="text-xs text-slate-300 mt-1">{directory.embassy.address}</p>
                  <div className="mt-3 flex items-center space-x-2">
                    <a
                      href={`tel:${directory.embassy.emergency_phone?.replace(/[^0-9+]/g, '') || directory.embassy.phone}`}
                      className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold text-center"
                    >
                      Emergency Consular Assistance
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
