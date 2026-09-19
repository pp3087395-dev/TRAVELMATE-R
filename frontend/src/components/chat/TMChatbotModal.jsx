import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  ShieldCheck, 
  PhoneCall, 
  Volume2, 
  VolumeX,
  ArrowRight, 
  Compass, 
  Calculator, 
  Languages, 
  AlertTriangle, 
  RefreshCw,
  Mic,
  MicOff,
  Radio
} from 'lucide-react';
import { api } from '../../services/api';
import { useTraveler } from '../../context/TravelerContext';
import StatusBadge from '../common/StatusBadge';

export default function TMChatbotModal({ isOpen, onClose }) {
  const { traveler } = useTraveler();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const lastSpokenIndexRef = useRef(-1);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Namaste! Click on it and find this in the app!\n\n[action: /discover | Explore Places] [action: /fare-meter | Auto Fare Meter] [action: /bhashini-translator | Bhashini Translator]`,
      source: 'TM chatbot • Powered by Gemini',
      confidence: 'Live Grounded'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState(null);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // If first time opening and autoSpeak is on, optionally speak greeting if not spoken
      if (autoSpeak && lastSpokenIndexRef.current === -1 && messages.length === 1) {
        lastSpokenIndexRef.current = 0;
        handleSpeakText(messages[0].text, 0);
      }
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActiveSpeechIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Auto-speak new bot messages if enabled
      const lastIndex = messages.length - 1;
      const lastMsg = messages[lastIndex];
      if (lastMsg && lastMsg.sender === 'bot' && lastIndex > lastSpokenIndexRef.current) {
        lastSpokenIndexRef.current = lastIndex;
        if (autoSpeak) {
          handleSpeakText(lastMsg.text, lastIndex);
        }
      }
    }
  }, [messages, autoSpeak, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechIndex(null);
    onClose();
  };

  if (!isOpen) return null;

  const prepareSpeechText = (rawText) => {
    // Extract actions
    const actionRegex = /\[action:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
    const actionLabels = [];
    let match;
    while ((match = actionRegex.exec(rawText)) !== null) {
      actionLabels.push(match[2].trim());
    }

    // Strip action tokens
    let text = rawText.replace(actionRegex, '').trim();

    // Clean markdown formatting for clear spoken speech
    text = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#{1,6}\s*/g, '')
      .replace(/[`_]/g, '')
      .replace(/•/g, '')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();

    // Concise speech prompt: click on it and find this
    if (!text.toLowerCase().includes('click on it and find this') && !text.toLowerCase().includes('click on')) {
      if (actionLabels.length > 0) {
        text += `. Click on ${actionLabels[0]} and find this in the app!`;
      } else {
        text += `. Click on it and find this in the app!`;
      }
    }

    return text;
  };

  const handleSpeakText = (text, idx) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (activeSpeechIndex === idx) {
      setActiveSpeechIndex(null);
      return;
    }

    const spokenText = prepareSpeechText(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick English-Indian or English voice if available
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.lang === 'en-IN') || voices.find(v => v.lang.startsWith('en')) || null;
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onend = () => setActiveSpeechIndex(null);
    utterance.onerror = () => setActiveSpeechIndex(null);

    setActiveSpeechIndex(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend) => {
    const userMsg = (typeof textToSend === 'string' ? textToSend : inputQuery).trim();
    if (!userMsg || loading) return;

    // Stop previous speech if any
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeechIndex(null);
    }

    setInputQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setLoading(true);

    const isDistressQuery = ["help", "scared", "follow", "attack", "danger", "trapped", "harass", "threat", "emergency", "hurt", "sos", "unsafe", "stalking"].some(kw => userMsg.toLowerCase().includes(kw));

    if (isDistressQuery) {
      // Auto-dispatch SOS alert to control room
      try {
        api.triggerSOS({
          journey_code: traveler?.temp_id || 'TM-DEL-2026-X89K',
          trigger_type: 'tm_distress_detection',
          lat: 28.6139,
          lng: 77.2090,
          message: `Distress message detected by TM chatbot: "${userMsg}"`
        });
      } catch (_) {}

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: `⚠️ Emergency: Dial 112 immediately. Click on it and find this in the app!\n\n[action: /incident | Open Incident Report & SOS]`,
            source: 'Emergency 112 & Delhi Tourist Police',
            confidence: 'Critical Safety Alert',
            is_distress: true
          }
        ]);
        setLoading(false);
      }, 350);
      return;
    }

    try {
      const res = await (api.askGeminiChatbot ? api.askGeminiChatbot(userMsg, traveler) : api.askChatbot(userMsg, traveler));
      if (res.success && res.data) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'bot',
            text: res.data.response || 'Click on it and find this in the app!\n\n[action: /discover | Explore Places]',
            source: res.data.source_label || 'TM chatbot • Powered by Gemini',
            confidence: res.data.confidence || 'Official Grounded'
          }
        ]);
      } else {
        throw new Error('No reply');
      }
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Click on it and find this in the app!\n\n[action: /discover | Explore Places] [action: /fare-meter | Check Fare] [action: /bhashini-translator | Bhashini Translator]`,
          source: 'TM chatbot • Grounded Knowledge',
          confidence: 'Verified Guide'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputQuery(transcript);
      handleSend(transcript);
    };

    recognition.start();
  };

  const handleActionClick = (path) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechIndex(null);
    onClose();
    navigate(path);
  };

  const handleReset = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveSpeechIndex(null);
    lastSpokenIndexRef.current = 0;
    setMessages([
      {
        sender: 'bot',
        text: `Click on it and find this in the app!\n\n[action: /discover | Discover Places] [action: /fare-meter | Check Auto Fare]`,
        source: 'TM chatbot • Powered by Gemini',
        confidence: 'Live'
      }
    ]);
  };

  // Render text with interactive action buttons and bold/bullet formatting
  const renderMessageContent = (rawText) => {
    // Extract [action: /path | Label]
    const actionRegex = /\[action:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
    const actions = [];
    let match;
    while ((match = actionRegex.exec(rawText)) !== null) {
      actions.push({ path: match[1].trim(), label: match[2].trim() });
    }

    // Remove action tokens from the display text
    const textWithoutActions = rawText.replace(actionRegex, '').trim();

    return (
      <div className="space-y-2.5">
        <div className="whitespace-pre-line leading-relaxed">
          {textWithoutActions.split('\n').map((line, lIdx) => {
            // Render bullet points cleanly
            const isBullet = line.trim().startsWith('•') || line.trim().startsWith('*') || line.trim().startsWith('-');
            const cleanedLine = isBullet ? line.replace(/^[\s•*-]+/, '').trim() : line;

            // Highlight interactive guidance phrases
            const isGuidanceLine = cleanedLine.toLowerCase().includes('here is your') || cleanedLine.toLowerCase().includes('click on this');

            return (
              <div 
                key={lIdx} 
                className={`${isBullet ? "flex items-start space-x-2 my-0.5" : "my-0.5"} ${isGuidanceLine ? "text-emerald-300 font-medium bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20" : ""}`}
              >
                {isBullet && <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>}
                <span dangerouslySetInnerHTML={{ 
                  __html: cleanedLine
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                    .replace(/__(.*?)__/g, '<u>$1</u>')
                }} />
              </div>
            );
          })}
        </div>

        {/* Interactive App Action Chips */}
        {actions.length > 0 && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
            {actions.map((act, aIdx) => (
              <button
                key={aIdx}
                onClick={() => handleActionClick(act.path)}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                <span>{act.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-surface border border-surface-border rounded-3xl shadow-2xl flex flex-col h-[650px] max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-card border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 relative">
              <Bot className="w-5 h-5 text-emerald-200" />
              {activeSpeechIndex !== null && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white font-display">TM chatbot</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30 uppercase tracking-wide flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  <span>Gemini AI</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Voice Assistant • Speaks Answers & Guides Navigation
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Auto-Speak Voice Toggle */}
            <button
              onClick={() => {
                const next = !autoSpeak;
                setAutoSpeak(next);
                if (!next && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setActiveSpeechIndex(null);
                }
              }}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 border transition-all ${
                autoSpeak
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/30'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
              }`}
              title={autoSpeak ? "Voice Speaking is ON (click to mute)" : "Voice Speaking is OFF (click to unmute)"}
            >
              {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              <span className="hidden sm:inline">{autoSpeak ? "Voice: ON" : "Muted"}</span>
            </button>

            {/* Speaking animation badge */}
            {activeSpeechIndex !== null && (
              <button
                onClick={() => {
                  window.speechSynthesis?.cancel();
                  setActiveSpeechIndex(null);
                }}
                className="px-2 py-1 rounded-lg text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse flex items-center space-x-1 hover:bg-indigo-500/30"
                title="Click to stop voice"
              >
                <Radio className="w-3 h-3 text-indigo-400 animate-spin" />
                <span className="hidden sm:inline text-[10px]">Speaking...</span>
              </button>
            )}

            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              title="Reset Conversation"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              id="btn-close-tm-chatbot-modal"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
              title="Close Chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl p-4 text-xs shadow-md transition-all ${
                  m.sender === 'user'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-sm'
                    : 'bg-surface-card border border-surface-border text-slate-200 rounded-bl-sm'
                }`}
              >
                {renderMessageContent(m.text)}

                {/* Distress Emergency Actions */}
                {m.is_distress && (
                  <div className="mt-3 pt-3 border-t border-rose-500/30 flex flex-wrap items-center gap-2">
                    <a
                      href="tel:112"
                      className="px-3 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-red-600/30 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dial 112 (Police & Emergency)</span>
                    </a>
                    <a
                      href="tel:1363"
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Dial 1363 (Tourist Infoline)</span>
                    </a>
                  </div>
                )}

                {/* Message Footer with Source & Voice Read Button */}
                {m.sender === 'bot' && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate pr-2">{m.source}</span>
                    <div className="flex items-center space-x-2 shrink-0">
                      <span className="text-emerald-400 font-semibold">{m.confidence}</span>
                      <button
                        onClick={() => handleSpeakText(m.text, idx)}
                        className={`p-1 rounded-md transition-colors ${
                          activeSpeechIndex === idx
                            ? 'text-emerald-300 bg-emerald-500/20 animate-pulse'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title={activeSpeechIndex === idx ? "Stop speaking" : "Listen to TM chatbot response"}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3.5 bg-surface-card border border-surface-border rounded-2xl rounded-bl-none text-xs text-slate-300 flex items-center space-x-2.5 shadow-md">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span className="font-medium">TM chatbot is querying Gemini & preparing voice guide...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-3 py-2 bg-surface/80 border-t border-white/5 flex items-center space-x-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            'Foreigner ticket for Red Fort?',
            'How to calculate auto fare?',
            'How do I translate to Hindi?',
            '1-Day Delhi itinerary plan?',
            'Emergency contact numbers?',
            'What is SafeVisit Pass?'
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-emerald-500/15 border border-white/10 hover:border-emerald-500/30 rounded-full text-slate-300 hover:text-emerald-300 transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-surface-card border-t border-white/10 flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-2.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
                : 'bg-surface border-surface-border text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isListening ? 'Listening...' : 'Voice Input (Speak your query)'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            id="input-tm-chatbot-query"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask TM chatbot: 'Red Fort ticket', 'Auto meter fare'..."
            className="flex-1 px-4 py-2.5 bg-surface border border-surface-border rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />

          <button
            type="submit"
            id="btn-send-tm-chatbot"
            disabled={loading || !inputQuery.trim()}
            className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md shadow-emerald-600/30 active:scale-95"
            title="Send Query"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
