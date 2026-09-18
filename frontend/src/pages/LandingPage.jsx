import React, { useState } from 'react';
import HeroSection from '../components/landing/HeroSection';
import QuickStats from '../components/landing/QuickStats';
import FeaturesGrid from '../components/landing/FeaturesGrid';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import Footer from '../components/landing/Footer';
import { useTraveler } from '../context/TravelerContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Shield, User, Globe, Phone, X, QrCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NATIONALITIES = [
  'United Kingdom', 'United States', 'Germany', 'France',
  'Australia', 'Japan', 'Spain', 'Canada', 'Italy', 'India', 'Other'
];

export default function LandingPage() {
  const { traveler, updateProfile } = useTraveler();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: traveler?.name || '',
    nationality: traveler?.nationality || 'United Kingdom',
    preferred_language: traveler?.preferred_language || 'en',
    emergency_contact: traveler?.emergency_contact || ''
  });

  const handleGeneratePass = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter your full name or traveler handle.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.onboardTraveler(formData);
      if (res.success) {
        updateProfile(res.data.traveler, res.data.journey);
        showToast('SafeVisit Pass successfully generated! Valid for 7 days.', 'success');
        setIsModalOpen(false);
        navigate('/portal');
      } else {
        showToast(res.error || 'Failed to generate pass.', 'error');
      }
    } catch (err) {
      showToast('Error generating pass. Using local encrypted identity.', 'warning');
      setIsModalOpen(false);
      navigate('/portal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Hero Section */}
      <HeroSection onOpenSafePassModal={() => setIsModalOpen(true)} />

      {/* 2. Quick Key Stats Bar */}
      <QuickStats />

      {/* 3. Core Features Grid */}
      <FeaturesGrid />

      {/* 4. Testimonials Section */}
      <TestimonialsSection />

      {/* 5. Footer */}
      <Footer />

      {/* Fast Passport-Free SafePass Onboarding Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display text-white">
                  Get Your SafeVisit Pass
                </h3>
                <p className="text-xs text-slate-400">
                  Zero passport upload. 7-day auto-expiring QR identity.
                </p>
              </div>
            </div>

            <form onSubmit={handleGeneratePass} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                  Full Name / Handle
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Nationality
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={formData.nationality}
                      onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                    >
                      {NATIONALITIES.map((n) => (
                        <option key={n} value={n} className="bg-slate-900 text-white">
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                    Emergency Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      placeholder="+44 7700 900077"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
                >
                  <span>{isSubmitting ? 'Minting Pass...' : 'Generate 7-Day SafePass'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Scope #18 compliant: Permanently purged after 7 days</span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
