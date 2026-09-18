import React from 'react';
import { IndianRupee, MapPin, Clock, ShieldCheck, AlertTriangle, Leaf, Hash } from 'lucide-react';

export default function ChainAnalytics({ analytics, audit }) {
  if (!analytics) return null;

  const isValid = audit?.is_valid ?? !analytics.tamper_detected;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Total Fare Spent */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider">Total Incurred Fare</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-display text-white">
          ₹{analytics.total_spent}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
          <span>Across {analytics.total_hops} ledger transits</span>
        </div>
      </div>

      {/* 2. Total Distance Traveled */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-indigo-500/30 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider">Total Tracked Distance</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-display text-white">
          {analytics.total_distance_km} <span className="text-sm font-normal text-slate-400">km</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
          <Leaf className="w-3 h-3 text-emerald-400" />
          <span>{analytics.carbon_saved_kg || '3.9'} kg CO₂ saved vs private cab</span>
        </div>
      </div>

      {/* 3. Average Duration */}
      <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider">Average Trip Duration</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black font-display text-white">
          {analytics.avg_duration_min} <span className="text-sm font-normal text-slate-400">min</span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          Per transit hop across Delhi
        </div>
      </div>

      {/* 4. Cryptographic Ledger Status */}
      <div className={`glass-card p-5 rounded-2xl border transition-all ${
        isValid
          ? 'border-emerald-500/30 bg-emerald-950/20'
          : 'border-red-500/40 bg-red-950/20'
      }`}>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span className="font-semibold uppercase tracking-wider">Chain Integrity Seal</span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            isValid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {isValid ? <ShieldCheck className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
        </div>
        <div className="text-lg sm:text-xl font-bold font-display text-white truncate">
          {isValid ? '0 Tampering Detected' : 'Warning: Tampering'}
        </div>
        <div className="text-[11px] text-slate-400 mt-1 font-mono truncate">
          SHA-256: {analytics.tip_hash ? `${analytics.tip_hash.slice(0, 14)}...` : 'Linked'}
        </div>
      </div>
    </div>
  );
}
