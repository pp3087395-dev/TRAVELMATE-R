import React, { useState } from 'react';
import { X, Navigation, MapPin, IndianRupee, Clock, Car, Plus, ShieldCheck } from 'lucide-react';
import { useTraveler } from '../../context/TravelerContext';
import { useToast } from '../../context/ToastContext';
import { journeyChainService } from '../../services/journeyChainService';

export default function AddTripModal({ isOpen, onClose, onNodeAdded }) {
  const { traveler, journey } = useTraveler();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    fare: '',
    vehicle_type: 'auto',
    distance_km: '5.2',
    time_taken: '22',
    verification_badge: 'Fair Fare Verified'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.source.trim() || !formData.destination.trim() || !formData.fare) {
      showToast('Please fill in source, destination, and fare.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date();
      const durationMin = parseInt(formData.time_taken, 10) || 20;
      const departureTime = new Date(now.getTime() - durationMin * 60 * 1000).toISOString();

      const payload = {
        traveler_id: traveler?.id || 'trv-default-sarah',
        journey_id: journey?.id || 'journey-default-x89k',
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        fare: parseFloat(formData.fare),
        vehicle_type: formData.vehicle_type,
        distance_km: parseFloat(formData.distance_km) || 5.0,
        departure_time: departureTime,
        arrival_time: now.toISOString(),
        time_taken: durationMin,
        verification_badge: formData.verification_badge
      };

      const res = await journeyChainService.addChainNode(payload);
      if (res.success) {
        showToast('New transit block cryptographically linked to Journey Chain!', 'success');
        if (onNodeAdded) onNodeAdded(res.data);
        onClose();
      } else {
        showToast(res.error || 'Failed to mint block.', 'error');
      }
    } catch (err) {
      showToast('Error appending node to ledger.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg glass-card rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-white">
              Log Transit Hop to Ledger
            </h3>
            <p className="text-xs text-slate-400">
              Mints a new cryptographic node linked to your prior hash.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Origin / Starting Point
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                placeholder="e.g. Connaught Place (Janpath)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Destination Point
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-400" />
              <input
                type="text"
                required
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Qutub Minar Main Gate"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Fare (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
                  placeholder="85"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.distance_km}
                onChange={(e) => setFormData({ ...formData, distance_km: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
                Duration (min)
              </label>
              <input
                type="number"
                value={formData.time_taken}
                onChange={(e) => setFormData({ ...formData, time_taken: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Transit Vehicle
            </label>
            <select
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50"
            >
              <option value="auto" className="bg-slate-900 text-white">Auto-Rickshaw (Metered)</option>
              <option value="taxi_non_ac" className="bg-slate-900 text-white">Non-AC Taxi (Kalyani)</option>
              <option value="taxi_ac" className="bg-slate-900 text-white">AC Taxi / App Cab</option>
              <option value="metro" className="bg-slate-900 text-white">Delhi Metro Rail</option>
              <option value="bus" className="bg-slate-900 text-white">DTC City Bus</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <span>{isSubmitting ? 'Computing SHA-256...' : 'Mint Block to Journey Chain'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic hash will link to the current chain tip</span>
          </div>
        </form>
      </div>
    </div>
  );
}
