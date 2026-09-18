import React, { useState, useEffect } from 'react';
import { useTraveler } from '../context/TravelerContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { journeyChainService } from '../services/journeyChainService';
import ChainAnalytics from '../components/portal/ChainAnalytics';
import JourneyChainTimeline from '../components/portal/JourneyChainTimeline';
import AddTripModal from '../components/portal/AddTripModal';
import StatusBadge from '../components/common/StatusBadge';
import { SkeletonCard } from '../components/common/Skeleton';
import {
  User,
  Shield,
  QrCode,
  Globe,
  Phone,
  Clock,
  Link2,
  Plus,
  RefreshCw,
  Landmark,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Camera,
  ExternalLink,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function UserPortalPage() {
  const { traveler, journey, concludeJourney } = useTraveler();
  const { showToast } = useToast();

  // Mode: 'traveler' (default user portal) or 'control_room' (officer audit mode)
  const [activePortalTab, setActivePortalTab] = useState('traveler');

  // Journey Chain state
  const [chainData, setChainData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [audit, setAudit] = useState(null);
  const [loadingChain, setLoadingChain] = useState(true);
  const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

  // Admin / Control Room audit state
  const [adminStats, setAdminStats] = useState(null);
  const [adminIncidents, setAdminIncidents] = useState([]);
  const [placesFreshness, setPlacesFreshness] = useState([]);
  const [flaggedFares, setFlaggedFares] = useState([]);
  const [officerNotes, setOfficerNotes] = useState({});

  useEffect(() => {
    loadChain();
    loadAdminData();
  }, [traveler?.id, journey?.journey_code]);

  const loadChain = async () => {
    setLoadingChain(true);
    try {
      const identifier = traveler?.id || journey?.journey_code || 'trv-default-sarah';
      const res = await journeyChainService.getJourneyChain(identifier);
      if (res.success) {
        setChainData(res.data || []);
        setAnalytics(res.analytics);
        setAudit(res.audit);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingChain(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const s = await api.getAdminStats();
      if (s.success) setAdminStats(s.data);

      const inc = await api.getAdminIncidents();
      if (inc.success) setAdminIncidents(inc.data || []);

      const fares = await api.getFlaggedFares();
      if (fares.success) setFlaggedFares(fares.data || []);

      setPlacesFreshness([
        { id: 'pl-red-fort-01', name: 'Red Fort (Lal Qila)', last_verified: '2026-08-20', status: 'Official', needs_reverification: false },
        { id: 'pl-qutub-minar-02', name: 'Qutub Minar', last_verified: '2026-08-20', status: 'Official', needs_reverification: false },
        { id: 'pl-purana-qila-05', name: 'Purana Qila', last_verified: '2026-08-10', status: 'Official', needs_reverification: false },
        { id: 'pl-jama-masjid-09', name: 'Jama Masjid', last_verified: '2026-07-01', status: 'Stale', needs_reverification: true }
      ]);
    } catch (err) {
      console.warn('Admin data load notice:', err.message);
    }
  };

  const handleAuditLedger = async () => {
    const identifier = traveler?.id || journey?.journey_code || 'trv-default-sarah';
    const res = await journeyChainService.verifyChain(identifier);
    if (res.success && res.data) {
      setAudit(res.data);
      if (res.data.is_valid) {
        showToast('All Journey Chain nodes verified! 0 tampering detected.', 'success');
      } else {
        showToast(`Audit flag: ${res.data.tampered_count} issue(s) found.`, 'warning');
      }
    }
  };

  const handleConcludeJourney = async () => {
    if (window.confirm('Are you sure you want to conclude this journey? Under Scope #18, all personal GPS logs and contact info will be permanently purged.')) {
      await api.expireJourney(journey?.journey_code || 'TM-DEL-2026-X89K');
      concludeJourney();
      showToast('Journey successfully concluded. Personal data purged.', 'info');
    }
  };

  // Remaining days calculation
  const expiresAt = journey?.expires_at ? new Date(journey.expires_at) : new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  const diffDays = Math.max(0, Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Authenticated Traveler & Trust Space</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            TravelMate User Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your SafeVisit pass, cryptographic Journey Chain transit records, and active monument visits.
          </p>
        </div>

        {/* Dual Mode Switch */}
        <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0">
          <button
            id="tab-user-portal-traveler"
            onClick={() => setActivePortalTab('traveler')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activePortalTab === 'traveler'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Traveler Hub
          </button>
          <button
            id="tab-user-portal-control-room"
            onClick={() => setActivePortalTab('control_room')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activePortalTab === 'control_room'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Control Room Audit
          </button>
        </div>
      </div>

      {activePortalTab === 'traveler' ? (
        <>
          {/* Traveler Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Traveler Profile Card */}
            <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-white/10 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {traveler?.name ? traveler.name.charAt(0) : 'T'}
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-display text-white">
                      {traveler?.name || 'Sarah Jenkins'}
                    </h3>
                    <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                      <span>{traveler?.nationality || 'United Kingdom'}</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-400">{traveler?.temp_id || 'TRV-X89K'}</span>
                    </div>
                  </div>
                </div>
                <StatusBadge status="Official" />
              </div>

              {/* Profile Details List */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Globe className="w-4 h-4 text-indigo-400" />
                    <span>Preferred Language</span>
                  </span>
                  <span className="text-white font-semibold uppercase">
                    {traveler?.preferred_language || 'English (EN)'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Emergency Contact</span>
                  </span>
                  <span className="text-white font-mono font-medium">
                    {traveler?.emergency_contact || '+44 7700 900077'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <span className="text-slate-400 flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>SafePass Validity</span>
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {diffDays} Days Remaining
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/settings"
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold text-center transition-colors"
                >
                  Edit Profile & Preferences
                </Link>
                <button
                  onClick={handleConcludeJourney}
                  className="w-full py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/25 text-red-300 text-xs font-semibold text-center transition-colors"
                >
                  Conclude Trip & Purge Data (Scope #18)
                </button>
              </div>
            </div>

            {/* Right: SafeVisit Pass Visual Card */}
            <div className="lg:col-span-7 glass-card p-6 rounded-3xl border border-white/10 flex flex-col justify-between space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-base font-bold font-display text-white">
                    Active SafeVisit Pass
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  ID: <strong className="text-white">{journey?.journey_code || 'TM-DEL-2026-X89K'}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {/* Visual QR Code Representation */}
                <div className="p-4 rounded-2xl bg-white flex flex-col items-center justify-center text-center max-w-[200px] mx-auto shadow-xl">
                  {/* High quality SVG QR representation */}
                  <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
                    <rect width="100" height="100" fill="white" />
                    {/* Corners */}
                    <rect x="10" y="10" width="24" height="24" fill="#090E17" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="#10B981" />

                    <rect x="66" y="10" width="24" height="24" fill="#090E17" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="#10B981" />

                    <rect x="10" y="66" width="24" height="24" fill="#090E17" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="#10B981" />

                    {/* Matrix grid cells */}
                    <rect x="42" y="12" width="6" height="6" fill="#090E17" />
                    <rect x="52" y="18" width="6" height="6" fill="#090E17" />
                    <rect x="42" y="28" width="6" height="6" fill="#090E17" />
                    <rect x="50" y="38" width="8" height="8" fill="#4F46E5" />
                    <rect x="62" y="44" width="6" height="6" fill="#090E17" />
                    <rect x="18" y="42" width="6" height="6" fill="#090E17" />
                    <rect x="28" y="52" width="6" height="6" fill="#090E17" />
                    <rect x="42" y="62" width="6" height="6" fill="#090E17" />
                    <rect x="52" y="72" width="6" height="6" fill="#090E17" />
                    <rect x="66" y="66" width="8" height="8" fill="#090E17" />
                    <rect x="78" y="78" width="8" height="8" fill="#090E17" />
                  </svg>
                  <span className="text-[10px] font-mono text-slate-700 font-bold mt-2">
                    {journey?.journey_code || 'TM-DEL-2026-X89K'}
                  </span>
                </div>

                {/* Pass Attributes */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                    <div className="font-bold mb-0.5">Official Temporary Tourist Pass</div>
                    <div className="text-[11px] text-emerald-400/80">
                      Show at ASI security gates and Delhi Tourist Police kiosks.
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-300 text-xs">
                    <div>Status: <strong className="text-white">Active Authorized Visitor</strong></div>
                    <div>Issued to: <strong className="text-white">{traveler?.name || 'Sarah Jenkins'}</strong></div>
                    <div>Jurisdiction: <strong className="text-white">NCT of Delhi</strong></div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to="/safe-journey"
                      className="inline-flex items-center space-x-2 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <span>Open Live GPS Navigation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Journey Chain Section */}
          <div className="space-y-6 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold font-display text-white flex items-center space-x-2">
                  <Link2 className="w-5 h-5 text-emerald-400" />
                  <span>Journey Chain (Cryptographic Trip Ledger)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Sequential ledger linking your arrival to each monument and transit ride with SHA-256 hashes.
                </p>
              </div>

              <div className="flex items-center space-x-2.5">
                <button
                  onClick={handleAuditLedger}
                  className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Audit Ledger</span>
                </button>

                <button
                  onClick={() => setIsAddTripModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Trip Hop</span>
                </button>
              </div>
            </div>

            {loadingChain ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} lines={2} />
                  ))}
                </div>
                <SkeletonCard lines={3} />
              </div>
            ) : (
              <>
                <ChainAnalytics analytics={analytics} audit={audit} />
                <JourneyChainTimeline chain={chainData} />
              </>
            )}
          </div>
        </>
      ) : (
        /* Control Room / Officer Audit Mode */
        <div className="space-y-8">
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-indigo-400" />
              <span>
                <strong>Human Verification Console:</strong> Review incident reports, audit monument entry data freshness, and inspect flagged fare disputes.
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-200 font-bold uppercase text-[10px]">
              Officer Active
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <div className="text-xs text-slate-400">Total Journeys</div>
              <div className="text-2xl font-black text-white mt-1">{adminStats?.totalJourneys || 28}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <div className="text-xs text-slate-400">Pending Incident Reviews</div>
              <div className="text-2xl font-black text-amber-400 mt-1">{adminStats?.pendingIncidents || 2}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <div className="text-xs text-slate-400">Flagged Fare Disputes</div>
              <div className="text-2xl font-black text-red-400 mt-1">{adminStats?.flaggedFares || 3}</div>
            </div>
            <div className="glass-card p-4 rounded-2xl border border-white/10">
              <div className="text-xs text-slate-400">Verified Delhi Monuments</div>
              <div className="text-2xl font-black text-emerald-400 mt-1">{adminStats?.placesCount || 10}</div>
            </div>
          </div>

          {/* Incidents Queue */}
          <div className="space-y-4">
            <h3 className="text-base font-bold font-display text-white">
              Pending Incident Reports for Verification
            </h3>
            <div className="space-y-3">
              {adminIncidents.length > 0 ? (
                adminIncidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-2xl glass-card border border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">Incident ID: {inc.id}</span>
                      <StatusBadge status={inc.status === 'verified_by_human' ? 'Verified' : 'Pending'} />
                    </div>
                    <p className="text-xs text-slate-300">{inc.raw_text}</p>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center text-xs text-slate-400">
                  No pending incidents requiring officer review.
                </div>
              )}
            </div>
          </div>

          {/* Flagged Fares */}
          <div className="space-y-4">
            <h3 className="text-base font-bold font-display text-white">
              Flagged Fare Disputes (Discrepancy Alerts)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {flaggedFares.map((f, i) => (
                <div key={f.id || i} className="p-4 rounded-2xl glass-card border border-red-500/20 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{f.origin_name} ➔ {f.destination_name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/20 text-red-300 font-bold">
                      +{f.discrepancy_percent}% Overcharge
                    </span>
                  </div>
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Quoted: <strong className="text-red-400">₹{f.quoted_fare}</strong></span>
                    <span>Expected: <strong className="text-emerald-400">₹{f.expected_fare_min} - ₹{f.expected_fare_max}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Trip Hop Modal */}
      <AddTripModal
        isOpen={isAddTripModalOpen}
        onClose={() => setIsAddTripModalOpen(false)}
        onNodeAdded={() => loadChain()}
      />
    </div>
  );
}
