import React, { useState } from 'react';
import { Link2, Navigation, Car, Bus, Train, Clock, MapPin, IndianRupee, ShieldCheck, Check, Copy, ExternalLink, X, Code2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function JourneyChainTimeline({ chain = [] }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);
  const { showToast } = useToast();

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    showToast('Cryptographic hash copied to clipboard!', 'info', 2000);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getVehicleIcon = (type) => {
    switch (type) {
      case 'metro':
        return <Train className="w-4 h-4 text-cyan-400" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-amber-400" />;
      case 'taxi_ac':
      case 'taxi_non_ac':
        return <Car className="w-4 h-4 text-indigo-400" />;
      case 'auto':
      default:
        return <Navigation className="w-4 h-4 text-emerald-400" />;
    }
  };

  const formatVehicleLabel = (type) => {
    switch (type) {
      case 'taxi_ac':
        return 'AC Taxi';
      case 'taxi_non_ac':
        return 'Non-AC Taxi';
      case 'metro':
        return 'Delhi Metro';
      case 'bus':
        return 'DTC Bus';
      case 'auto':
      default:
        return 'Auto-Rickshaw';
    }
  };

  if (!chain || chain.length === 0) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
        <Link2 className="w-8 h-8 text-slate-500 mx-auto" />
        <h3 className="text-base font-bold text-white">No Journey Nodes Minted Yet</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Start your journey or log a new trip hop to initialize your cryptographic sequence chain.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative pl-6 sm:pl-8 border-l-2 border-emerald-500/30 space-y-8">
        {chain.map((node, index) => {
          const isGenesis = index === 0;
          const shortHash = node.current_hash ? `${node.current_hash.slice(0, 10)}...${node.current_hash.slice(-8)}` : '0x...';
          const shortPrevHash = node.previous_hash ? `${node.previous_hash.slice(0, 8)}...` : '0x000...';

          return (
            <div key={node.id || index} className="relative group">
              {/* Timeline Connector Dot */}
              <div className={`absolute -left-[31px] sm:-left-[39px] top-4 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                isGenesis
                  ? 'bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-500/50'
                  : 'bg-slate-900 border-indigo-400 group-hover:bg-indigo-400'
              }`} />

              {/* Node Card */}
              <div className="glass-card p-5 sm:p-6 rounded-2xl border border-white/10 hover:border-emerald-500/40 transition-all duration-300 shadow-lg space-y-4">
                
                {/* Header Strip: Block Index & Vehicle */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {isGenesis ? 'Genesis Block #0' : `Block #${node.sequence_index || index}`}
                    </span>
                    <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 text-[11px] font-medium">
                      {getVehicleIcon(node.vehicle_type)}
                      <span>{formatVehicleLabel(node.vehicle_type)}</span>
                    </span>
                  </div>

                  {node.verification_badge && (
                    <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{node.verification_badge}</span>
                    </span>
                  )}
                </div>

                {/* Route: Origin -> Destination */}
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2 text-sm sm:text-base font-bold text-white font-display">
                    <span className="text-slate-100">{node.source}</span>
                    <span className="text-emerald-400 font-normal">➔</span>
                    <span className="text-emerald-300">{node.destination}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center space-x-1 font-semibold text-white">
                      <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                      <span>₹{node.fare}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{node.distance_km} km</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{node.time_taken} min</span>
                    </span>
                  </div>
                </div>

                {/* Cryptographic Linkage Footer */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-slate-400">
                  <div className="space-y-0.5">
                    <div>
                      Current: <span className="text-emerald-300 select-all">{shortHash}</span>
                    </div>
                    <div>
                      Prev Link: <span className="text-slate-500 select-all">{shortPrevHash}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedNode(node)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-sans font-medium flex items-center space-x-1.5 transition-colors"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Inspect Proof</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Cryptographic Proof Modal */}
      {selectedNode && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedNode(null);
          }}
        >
          <div className="relative w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl space-y-6">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Link2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  Cryptographic Ledger Node #{selectedNode.sequence_index}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  SHA-256 Sequential Verification Proof
                </p>
              </div>
            </div>

            {/* Hashes Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider flex items-center justify-between">
                  <span>Current Node SHA-256 Hash</span>
                  <button
                    onClick={() => handleCopy(selectedNode.current_hash)}
                    className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-emerald-300 break-all select-all">
                  {selectedNode.current_hash}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                  Previous Linked Hash
                </div>
                <div className="font-mono text-slate-400 break-all select-all">
                  {selectedNode.previous_hash}
                </div>
              </div>
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Raw Ledger Block Payload
              </div>
              <pre className="p-4 rounded-xl bg-black/60 border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48 leading-relaxed">
                {JSON.stringify(selectedNode, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10">
              <div className="flex items-center space-x-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Cryptographically Immutable & Audited</span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
