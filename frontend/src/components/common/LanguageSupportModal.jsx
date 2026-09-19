import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Globe,
  Volume2,
  Maximize2,
  Minimize2,
  Search,
  Check,
  Sparkles,
  MessageSquare,
  Car,
  IndianRupee,
  ShieldAlert,
  Landmark,
  ExternalLink,
} from 'lucide-react';
import offlinePhrases from '../../data/offlinePhrases.json';
import { useTraveler } from '../../context/TravelerContext';
import StatusBadge from './StatusBadge';
import {
  translateText,
  playAudioSpeech,
  stopAudioSpeech,
  MAJOR_INDIAN_LANGUAGES,
  PRELOADED_TOURIST_PHRASES,
} from '../../services/bhashiniService';
import BhashiniLanguageDropdown from '../bhashini/BhashiniLanguageDropdown';

export default function LanguageSupportModal({ isOpen, onClose }) {
  const { traveler } = useTraveler();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [fullscreenPhrase, setFullscreenPhrase] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('hi');
  const [bhashiniInput, setBhashiniInput] = useState('');
  const [bhashiniResult, setBhashiniResult] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Transport & Meter',
    'Fair Fare & Negotiation',
    'Emergency & Safety',
    'Heritage & Cultural Etiquette',
  ];

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Transport & Meter':
        return <Car className="w-3.5 h-3.5" />;
      case 'Fair Fare & Negotiation':
        return <IndianRupee className="w-3.5 h-3.5" />;
      case 'Emergency & Safety':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      case 'Heritage & Cultural Etiquette':
        return <Landmark className="w-3.5 h-3.5" />;
      default:
        return <MessageSquare className="w-3.5 h-3.5" />;
    }
  };

  const handleSpeak = (text, lang = targetLanguage) => {
    playAudioSpeech(text, lang);
  };

  const handleBhashiniTranslate = async () => {
    if (!bhashiniInput.trim()) return;
    setIsTranslating(true);
    try {
      const res = await translateText({
        text: bhashiniInput,
        sourceLang: 'en',
        targetLanguage,
        targetLang: targetLanguage,
      });
      setBhashiniResult({
        original: bhashiniInput,
        translated: res.translated,
        hindi: res.translated,
        transliteration: res.transliteration,
        phonetic: res.phonetic,
        service: res.source,
        targetLanguage,
        confidence: `${Math.round(res.confidence * 100)}% Contextual Match`,
      });
    } catch (err) {
      console.error('Translation error:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOpenFullPage = () => {
    onClose();
    navigate('/phrase-helper');
  };

  // Filter phrases
  const allPhrasesGrouped = offlinePhrases.filter((group) => {
    if (activeCategory !== 'All' && group.category !== activeCategory) return false;
    return true;
  });

  const filteredGroups = allPhrasesGrouped
    .map((group) => {
      const matchingPhrases = group.phrases.filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          p.english.toLowerCase().includes(q) ||
          p.hindi.includes(q) ||
          p.transliteration.toLowerCase().includes(q) ||
          p.context.toLowerCase().includes(q)
        );
      });
      return { ...group, phrases: matchingPhrases };
    })
    .filter((group) => group.phrases.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md transition-all">
      {/* Fullscreen Show-to-Driver Overlay */}
      {fullscreenPhrase && (
        <div className="fixed inset-0 z-60 bg-black/95 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
          <button
            onClick={() => setFullscreenPhrase(null)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <Minimize2 className="w-6 h-6" />
          </button>
          <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest mb-4">
            Show this screen to Driver / Vendor
          </span>
          <div className="p-8 max-w-xl bg-surface-card border-2 border-emerald-500 rounded-3xl shadow-2xl shadow-emerald-500/20 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight font-display">
              {fullscreenPhrase.hindi}
            </h2>
            <p className="text-lg sm:text-xl font-mono text-emerald-300">
              "{fullscreenPhrase.transliteration}"
            </p>
            <div className="pt-4 border-t border-white/10 text-xs text-slate-300">
              English: <strong>{fullscreenPhrase.english || fullscreenPhrase.original}</strong>
            </div>
            <button
              onClick={() => handleSpeak(fullscreenPhrase.hindi)}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all"
            >
              <Volume2 className="w-5 h-5" />
              <span>Play Hindi Audio</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div className="relative w-full max-w-3xl bg-surface border border-surface-border rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 bg-surface-card border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold font-display text-white">Language Support & Phrase-Cards</h3>
                <StatusBadge status="Official" />
              </div>
              <p className="text-xs text-slate-400">
                BHASHINI Powered • Speech &amp; Text Translation for {traveler?.preferred_language?.toUpperCase() || 'EN'} &lt;–&gt; {targetLanguage.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenFullPage}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-semibold transition-all"
            >
              <span>Full Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bhashini Live Translator Input Section */}
        <div className="p-4 bg-indigo-950/20 border-b border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Digital India Bhashini English → {MAJOR_INDIAN_LANGUAGES.find(l => l.code === targetLanguage)?.name || 'Vernacular'} Translator</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                {targetLanguage}
              </span>
            </span>
            <button
              onClick={handleOpenFullPage}
              className="text-[11px] text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Try Speech-to-Speech Voice</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <BhashiniLanguageDropdown
              id="modal-select-target-language"
              selectedLanguage={targetLanguage}
              onSelectLanguage={(newTarget) => setTargetLanguage(newTarget)}
              theme="indigo"
              showSearch={false}
              align="left"
            />
            <input
              type="text"
              placeholder="Type any custom sentence (e.g. 'How much to Qutub Minar by meter?')..."
              value={bhashiniInput}
              onChange={(e) => setBhashiniInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBhashiniTranslate()}
              className="flex-1 px-3.5 py-2 bg-surface border border-surface-border rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleBhashiniTranslate}
              disabled={isTranslating || !bhashiniInput.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 shrink-0"
            >
              {isTranslating ? 'Translating...' : 'Translate'}
            </button>
          </div>

          {/* Bhashini Output Card */}
          {bhashiniResult && (
            <div className="p-3 bg-surface border border-indigo-500/40 rounded-xl space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-400">{bhashiniResult.service}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                    {targetLanguage}
                  </span>
                </div>
                <button
                  onClick={() => setFullscreenPhrase(bhashiniResult)}
                  className="text-[11px] text-indigo-300 hover:text-white font-semibold flex items-center space-x-1"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Show to Driver</span>
                </button>
              </div>
              <div className="text-base font-bold text-white">{bhashiniResult.translated}</div>
              <div className="text-xs font-mono text-emerald-300/90">{bhashiniResult.transliteration}</div>
              <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                <span>Pronunciation: {bhashiniResult.phonetic}</span>
                <button
                  onClick={() => handleSpeak(bhashiniResult.translated, targetLanguage)}
                  className="text-emerald-400 hover:underline flex items-center space-x-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Play Audio</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filter & Search Bar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                  activeCategory === cat
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-surface-card text-slate-400 hover:text-white border border-surface-border'
                }`}
              >
                {getCategoryIcon(cat)}
                <span>{cat}</span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search phrase..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface border border-surface-border rounded-xl text-xs text-white placeholder-slate-500"
            />
          </div>
        </div>

        {/* Phrase Cards Grid */}
        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {filteredGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                {getCategoryIcon(group.category)}
                <span>{group.category}</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.phrases.map((phrase, pIdx) => {
                  const cardId = `${gIdx}-${pIdx}`;
                  return (
                    <div
                      key={cardId}
                      className="p-4 bg-surface-card border border-surface-border rounded-2xl hover:border-emerald-500/40 transition-all space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-200 leading-snug">
                            "{phrase.english}"
                          </span>
                          <button
                            onClick={() => setFullscreenPhrase(phrase)}
                            title="Show in Fullscreen to driver"
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded transition-colors shrink-0"
                          >
                            <Maximize2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-base font-extrabold text-emerald-300 font-display">
                          {phrase.hindi}
                        </div>
                        <div className="text-xs font-mono text-slate-300 mt-0.5">
                          {phrase.transliteration}
                        </div>
                        <div className="text-[11px] text-slate-400 italic mt-1">
                          Say: {phrase.audio_phonetic}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className="text-[10px] text-slate-500 truncate max-w-[170px]" title={phrase.context}>
                          {phrase.context}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleSpeak(phrase.hindi)}
                            className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-semibold">Speak</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-surface-card border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>All phrase cards are stored offline for instant zero-data use during transit.</span>
          <button
            onClick={handleOpenFullPage}
            className="text-emerald-400 hover:underline font-semibold flex items-center space-x-1"
          >
            <span>Open Dedicated Phrase Helper</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
