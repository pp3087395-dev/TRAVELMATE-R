import React, { useState, useEffect } from 'react';
import { Link2, ShieldCheck, Plus, RefreshCw, Download, CheckCircle2, Lock } from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';
import { useToast } from '../context/ToastContext';
import { journeyChainService } from '../services/journeyChainService';
import ChainAnalytics from '../components/portal/ChainAnalytics';
import JourneyChainTimeline from '../components/portal/JourneyChainTimeline';
import AddTripModal from '../components/portal/AddTripModal';
import { SkeletonCard } from '../components/common/Skeleton';

export default function JourneyChainPage() {
  const { traveler, journey } = useTraveler();
  const { showToast } = useToast();

  const [chainData, setChainData] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    loadChain();
  }, [traveler?.id, journey?.journey_code]);

  const loadChain = async () => {
    setLoading(true);
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
      showToast('Error loading Journey Chain ledger.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLedger = async () => {
    setIsVerifying(true);
    try {
      const identifier = traveler?.id || journey?.journey_code || 'trv-default-sarah';
      const res = await journeyChainService.verifyChain(identifier);
      if (res.success) {
        setAudit(res.data);
        if (res.data.is_valid) {
          showToast(`Audit Passed: All ${res.data.total_nodes} nodes cryptographically verified! 0 tampering detected.`, 'success');
        } else {
          showToast(`Warning: ${res.data.tampered_count} tampered node(s) detected.`, 'error');
        }
      }
    } catch (e) {
      showToast('Audit check failed.', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleExportLedger = () => {
    const exportPayload = {
      traveler: traveler?.name || 'Verified Traveler',
      journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
      exported_at: new Date().toISOString(),
      analytics,
      audit,
      chain: chainData
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journey-chain-${journey?.journey_code || 'ledger'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Cryptographic ledger exported to JSON file!', 'info');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Immutable Transit Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Personal Journey Chain Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Every trip hop or multi-transit ride is recorded as a sequential cryptographic block. 
              Each node is sealed with an SHA-256 hash linking to your previous transit node for 100% tamper-proof fare and travel auditing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleVerifyLedger}
              disabled={isVerifying}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? 'Verifying...' : 'Audit Ledger'}</span>
            </button>

            <button
              onClick={handleExportLedger}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Hop</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} lines={2} />
          ))}
        </div>
      ) : (
        <ChainAnalytics analytics={analytics} audit={audit} />
      )}

      {/* Timeline View */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-lg font-bold font-display text-white flex items-center space-x-2">
            <Link2 className="w-5 h-5 text-emerald-400" />
            <span>Cryptographic Timeline ({chainData.length} Hops)</span>
          </h2>
          <span className="text-xs text-slate-400">
            Ordered Chronologically • SHA-256 Chained
          </span>
        </div>

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : (
          <JourneyChainTimeline chain={chainData} />
        )}
      </div>

      {/* Log Trip Modal */}
      <AddTripModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onNodeAdded={() => loadChain()}
      />
    </div>
  );
}
