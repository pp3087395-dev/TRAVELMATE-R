import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, ArrowRight, QrCode, Navigation, Landmark, Volume2, CheckCircle2, Lock } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import StatusBadge from '../common/StatusBadge';

export default function HeroSection({ onOpenSafePassModal }) {
  const { traveler, journey } = useTraveler();

  return (
    <section className="relative overflow-hidden pt-6 pb-16 md:pt-12 md:pb-24">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[750px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-emerald-500/15 via-indigo-600/20 to-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* SIH Badge */}
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wide shadow-sm hover:bg-emerald-500/15 transition-all">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Shield className="w-3.5 h-3.5" />
              <span>Smart India Hackathon • Next-Gen Tourist Trust Architecture</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
              One Tourist. <br className="hidden sm:inline" />
              One Journey ID. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                Total Delhi Safety.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
              TravelMate eliminates tourist scams with a cryptographic <strong className="text-white">Journey Chain</strong> ledger, 
              ASI-verified monument passes, fair fare guarantees, and real-time vernacular translation powered by <strong className="text-emerald-300">Digital India Bhashini</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link
                to="/portal"
                id="btn-hero-launch-app"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch User Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/discover"
                id="btn-hero-explore-journeys"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-white font-semibold text-sm tracking-wide backdrop-blur-xl flex items-center justify-center space-x-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <Landmark className="w-4 h-4 text-emerald-400" />
                <span>Explore Journeys</span>
              </Link>

              <button
                onClick={onOpenSafePassModal}
                id="btn-hero-instant-safepass"
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold text-sm tracking-wide flex items-center justify-center space-x-2 transition-all duration-300"
              >
                <QrCode className="w-4 h-4 text-indigo-400" />
                <span>Instant SafePass</span>
              </button>
            </div>

            {/* Key Trust Highlights */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 font-medium">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Passport Uploads</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SHA-256 Trip Ledger</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Official ASI Gate Prices</span>
              </div>
            </div>
          </div>

          {/* Right Dynamic Travel Graphic Mock */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md glass-card rounded-3xl p-6 border border-white/15 shadow-2xl backdrop-blur-2xl transition-all duration-500 hover:border-emerald-500/40 group">
              
              {/* Top Bar / SafeVisit Pass Preview */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center shadow-md">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-black font-display text-white tracking-wide">
                      SAFEVISIT PASS
                    </div>
                    <div className="text-[11px] font-mono text-emerald-400">
                      {journey?.journey_code || 'TM-DEL-2026-X89K'}
                    </div>
                  </div>
                </div>
                <StatusBadge status="Official" />
              </div>

              {/* Active Trip Mock Hop */}
              <div className="my-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Active Trip Corridor</span>
                  <span className="flex items-center space-x-1 text-emerald-400 font-semibold">
                    <Navigation className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                    <span>Live GPS Track</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-white font-medium">IGI Airport T3</span>
                    <span className="text-slate-500">➔</span>
                    <span className="text-emerald-300 font-medium">Connaught Place</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Fare: <strong className="text-white">₹420</strong> (Gazette Fair Rate)</span>
                    <span>Distance: <strong className="text-white">16.4 km</strong></span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Ledger Node Block Preview */}
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-bold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Journey Chain Block #0</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                    VERIFIED
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono truncate">
                  Hash: <span className="text-slate-200">5e884898da28047151d0e56f8...</span>
                </div>
              </div>

              {/* Bhashini Live Vernacular Phrase Pill */}
              <div className="mt-4 flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/10 text-xs">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-white font-medium">भैया, कृपया मीटर से चलिए।</div>
                    <div className="text-[10px] text-slate-400">Bhaiya, please use the meter.</div>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-indigo-400">
                  Bhashini
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
