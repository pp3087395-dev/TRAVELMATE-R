import React from 'react';
import { Landmark, Navigation, Link2, Languages, ArrowUpRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    id: 'feat-route-planning',
    title: 'AI Route Planning & Verified Monuments',
    badge: 'ASI Official Layer',
    icon: Landmark,
    color: 'emerald',
    description:
      'Explore 10+ verified Delhi heritage sites with ASI official entrance fees (Indian vs Foreigner), direct ticketing links, optimal lighting times, and localized scam advisories.',
    link: '/discover',
    stats: '10 UNESCO & Heritage Sites'
  },
  {
    id: 'feat-live-tracking',
    title: 'Live Journey Track & Route Guardian',
    badge: '500m Soft Alert',
    icon: Navigation,
    color: 'indigo',
    description:
      'Google Directions navigation with background GPS monitoring. Notifies you gently if your driver deviates over 500m from the safe corridor, with NCRB crime risk zone overlays.',
    link: '/safe-journey',
    stats: 'NCRB Advisory Overlay'
  },
  {
    id: 'feat-journey-chain',
    title: 'Cryptographic Journey Chain Ledger',
    badge: 'SHA-256 Ledger',
    icon: Link2,
    color: 'teal',
    description:
      'Every multi-hop trip logs exact fare, distance, and timestamps into an immutable sequential ledger. Validated with cryptographic hashes linking back to your arrival Genesis block.',
    link: '/journey-chain',
    stats: '100% Tamper Proof'
  },
  {
    id: 'feat-bhashini',
    title: 'Digital India Bhashini AI Translator',
    badge: '12+ Vernaculars',
    icon: Languages,
    color: 'amber',
    description:
      'Overcome language barriers instantly with speech-to-speech and text translation into Hindi, Bengali, Tamil, Telugu, and 8 more Indian languages. Includes auto-rickshaw phrase cards.',
    link: '/phrase-helper',
    stats: 'Voice & Text Enabled'
  }
];

export default function FeaturesGrid() {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Integrated Trust Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Engineered for Foreign & Domestic Traveler Safety
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Four specialized subsystems running cohesively to guarantee transparent pricing, reliable navigation, and language accessibility.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative glass-card p-8 rounded-3xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 hover:-translate-y-1.5 shadow-xl flex flex-col justify-between"
              >
                <div>
                  {/* Top Pill & Icon */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center text-white group-hover:scale-110 group-hover:border-emerald-500/50 transition-all duration-300">
                      <Icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/5 text-slate-300 border border-white/10 group-hover:border-emerald-500/30 group-hover:text-emerald-300 transition-colors">
                      {feat.badge}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold font-display text-white mb-2.5 group-hover:text-emerald-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Footer Link & Stat */}
                <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400 font-mono">
                    {feat.stats}
                  </span>
                  <Link
                    to={feat.link}
                    className="flex items-center space-x-1 text-emerald-400 hover:text-emerald-300 font-bold group-hover:translate-x-1 transition-transform"
                  >
                    <span>Explore Feature</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
