import React from 'react';
import { Star, ShieldCheck, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Sarah Jenkins',
    country: 'United Kingdom',
    flag: '🇬🇧',
    role: 'Solo Cultural Traveler',
    quote:
      'The Fair Fare meter saved me over ₹400 on my very first day taking an auto-rickshaw from NDLS to Red Fort. Showing the driver the Hindi phrase card was completely game-changing!',
    rating: 5,
    tag: 'Fare Protection'
  },
  {
    id: 't-2',
    name: 'Kenji Takahashi',
    country: 'Japan',
    flag: '🇯🇵',
    role: 'Architectural Photographer',
    quote:
      'Having the SafeVisit QR pass on my phone meant zero passport risk at monument security gates. The soft route deviation guardian gave me total peace of mind during late-night transits.',
    rating: 5,
    tag: 'Passport-Free Pass'
  },
  {
    id: 't-3',
    name: 'Amélie Dupont',
    country: 'France',
    flag: '🇫🇷',
    role: 'Heritage Researcher',
    quote:
      'The cryptographic Journey Chain ledger logged all my multi-hop rides with verifiable SHA-256 hashes. Absolutely phenomenal tech for foreign visitor trust and safety.',
    rating: 5,
    tag: 'Journey Chain Ledger'
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Traveler Experiences</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
            Trusted by Travelers Worldwide
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real feedback from international visitors navigating Delhi’s heritage corridors with TravelMate.
          </p>
        </div>

        {/* Testimonials Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.id}
              className="glass-card p-7 rounded-3xl border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div>
                {/* Stars & Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1 text-amber-400">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
                    {t.tag}
                  </span>
                </div>

                <Quote className="w-6 h-6 text-emerald-500/40 mb-3" />

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic mb-6">
                  "{t.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="pt-4 border-t border-white/10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-base shadow-md font-bold">
                  {t.flag}
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-display">
                    {t.name}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {t.country} • {t.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
