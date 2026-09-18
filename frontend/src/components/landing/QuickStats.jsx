import React from 'react';
import { Landmark, Shield, AlertCircle, PhoneCall } from 'lucide-react';

const STATS = [
  {
    value: '10+',
    label: 'Verified Delhi Heritage Sites',
    subtext: 'ASI Official entry fees and scam advisories',
    icon: Landmark,
    color: 'text-emerald-400'
  },
  {
    value: '100%',
    label: 'Passport-Free Privacy',
    subtext: 'Cryptographic 7-day auto-expiring pass',
    icon: Shield,
    color: 'text-indigo-400'
  },
  {
    value: '₹0',
    label: 'Entry Ticket Overcharge Fraud',
    subtext: 'Direct links to official ASI payment gateways',
    icon: AlertCircle,
    color: 'text-teal-400'
  },
  {
    value: '< 3s',
    label: '112 Emergency Dispatch',
    subtext: 'Instant GPS broadcast & silent shake SOS',
    icon: PhoneCall,
    color: 'text-amber-400'
  }
];

export default function QuickStats() {
  return (
    <section className="py-12 border-y border-white/10 bg-slate-900/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="text-center sm:text-left space-y-2 group">
                <div className="flex items-center justify-center sm:justify-start space-x-2">
                  <Icon className={`w-5 h-5 ${s.color}`} />
                  <span className={`text-3xl sm:text-4xl font-black font-display tracking-tight ${s.color}`}>
                    {s.value}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white tracking-wide">
                  {s.label}
                </div>
                <div className="text-[11px] text-slate-400 leading-tight">
                  {s.subtext}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
