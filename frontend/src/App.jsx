import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { TravelerProvider } from './context/TravelerContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Navigation & Layout Components
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import ClaudeSidebar from './components/navigation/ClaudeSidebar';
import FloatingBhashiniWidget from './components/bhashini/FloatingBhashiniWidget';
import ToastContainer from './components/common/ToastContainer';
import HelplineFloatingBadge from './components/common/HelplineFloatingBadge';
import QRModal from './components/common/QRModal';
import TMChatbotModal from './components/chat/TMChatbotModal';
import LanguageSupportModal from './components/common/LanguageSupportModal';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import UserPortalPage from './pages/UserPortalPage';
import JourneyChainPage from './pages/JourneyChainPage';
import SettingsPage from './pages/SettingsPage';
import OnboardingPage from './pages/OnboardingPage';
import DiscoverPage from './pages/DiscoverPage';
import FareMeterPage from './pages/FareMeterPage';
import SafeJourneyPage from './pages/SafeJourneyPage';
import EvidenceVaultPage from './pages/EvidenceVaultPage';
import IncidentReportPage from './pages/IncidentReportPage';
import TripPlannerPage from './pages/TripPlannerPage';
import PhraseHelperPage from './pages/PhraseHelperPage';
import BhashiniTranslatorPage from './pages/BhashiniTranslatorPage';

import { Sparkles, Mic, Languages } from 'lucide-react';

// Inner App Layout Container that dynamically adjusts to sidebar state
function AppLayout() {
  const [isQROpen, setIsQROpen] = useState(false);
  const [isGeminiChatOpen, setIsGeminiChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isBhashiniOpen, setIsBhashiniOpen] = useState(false);
  const [isHelplineOpen, setIsHelplineOpen] = useState(false);
  const [bhashiniTargetLanguage, setBhashiniTargetLanguage] = useState('hi');
  const { isCollapsed } = useSidebar();
  const location = useLocation();

  // If on the dedicated /login route, render a clean, focused view without the outer shell
  if (location.pathname === '/login') {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
        <main className="flex-1">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 1. Claude-Style Collapsible Sidebar Rail & Drawer */}
      <ClaudeSidebar onOpenQR={() => setIsQROpen(true)} />

      {/* 2. Main Content Wrapper (Adjusts margin based on sidebar state on desktop) */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } pb-28 md:pb-16`}
      >
        <Header 
          onOpenQR={() => setIsQROpen(true)}
          onOpenLang={() => setIsLangOpen(true)}
        />
        
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/incident" element={<IncidentReportPage />} />
            <Route path="/emergency" element={<IncidentReportPage />} />

            {/* Authenticated Protected Routes */}
            <Route path="/portal" element={<ProtectedRoute><UserPortalPage /></ProtectedRoute>} />
            <Route path="/journey-chain" element={<ProtectedRoute><JourneyChainPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
            <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
            <Route path="/planner" element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} />
            <Route path="/trip-planner" element={<ProtectedRoute><TripPlannerPage /></ProtectedRoute>} />
            <Route path="/phrase-helper" element={<ProtectedRoute><PhraseHelperPage /></ProtectedRoute>} />
            <Route path="/bhashini-translator" element={<ProtectedRoute><BhashiniTranslatorPage /></ProtectedRoute>} />
            <Route path="/language" element={<ProtectedRoute><PhraseHelperPage /></ProtectedRoute>} />
            <Route path="/fare-meter" element={<ProtectedRoute><FareMeterPage /></ProtectedRoute>} />
            <Route path="/safe-journey" element={<ProtectedRoute><SafeJourneyPage /></ProtectedRoute>} />
            <Route path="/vault" element={<ProtectedRoute><EvidenceVaultPage /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><UserPortalPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>

      {/* Floating Chatbot Launcher (TravelMate AI - cleanly positioned with dynamic sidebar offset) */}
      <div 
        className={`fixed bottom-4 sm:bottom-6 z-30 transition-all duration-300 ease-in-out flex items-center pointer-events-auto ${
          isCollapsed ? 'left-4 sm:left-6 lg:left-24' : 'left-4 sm:left-6 lg:left-72'
        }`}
      >
        <button
          id="btn-floating-gemini-chat"
          onClick={() => setIsGeminiChatOpen(true)}
          className="flex items-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 text-white shadow-xl shadow-teal-600/25 border border-teal-400/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none"
          title="Ask TravelMate AI Assistant"
          aria-label="Open TravelMate AI Assistant"
        >
          <Sparkles className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300 animate-pulse shrink-0" />
          <span className="text-xs font-bold tracking-wide font-display hidden sm:inline whitespace-nowrap">
            TravelMate AI
          </span>
        </button>
      </div>

      {/* Unified Floating Action Buttons Group (Bottom-Right: Voice Interaction & Bhashini AI Side-by-Side) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex flex-row items-center flex-nowrap gap-3 sm:gap-4 pointer-events-auto">
        {/* Red Voice Interaction Button */}
        <button
          id="btn-floating-helplines"
          onClick={() => setIsHelplineOpen(true)}
          className="group relative flex items-center justify-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 border border-rose-400/50 hover:ring-2 hover:ring-rose-400/60 hover:shadow-rose-500/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shrink-0"
          title="Voice Interaction & Emergency Helpline 1363 / 112"
          aria-label="Voice Interaction and Helpline"
        >
          <div className="relative flex items-center justify-center">
            <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.2] animate-pulse shrink-0" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full ring-2 ring-red-600 animate-ping" />
          </div>
          <span className="text-xs font-bold font-display tracking-tight text-white hidden sm:inline whitespace-nowrap">
            Voice Interaction
          </span>
        </button>

        {/* Orange Bhashini AI Button */}
        <button
          id="btn-floating-bhashini-widget"
          onClick={() => setIsBhashiniOpen((prev) => !prev)}
          className="group relative flex items-center justify-center space-x-2 h-11 sm:h-12 px-3.5 sm:px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/30 border border-amber-300/50 hover:ring-2 hover:ring-amber-400/60 hover:shadow-amber-500/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none shrink-0"
          title="Digital India Bhashini Multilingual AI Voice Translator"
          aria-label="Open Bhashini AI Multilingual Translator"
        >
          <Languages className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.2] group-hover:rotate-12 transition-transform shrink-0" />
          <span className="text-xs font-extrabold font-display tracking-tight text-slate-950 hidden sm:inline whitespace-nowrap">
            Bhashini AI
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-slate-950/20 text-[10px] font-mono font-black text-slate-950 shrink-0 uppercase">
            {bhashiniTargetLanguage}
          </span>
        </button>
      </div>

      {/* Floating Modals & Consoles */}
      <FloatingBhashiniWidget 
        isOpen={isBhashiniOpen} 
        onClose={() => setIsBhashiniOpen(false)} 
        hideLauncher={true}
        targetLanguage={bhashiniTargetLanguage}
        onTargetLanguageChange={setBhashiniTargetLanguage}
      />
      <HelplineFloatingBadge 
        isOpen={isHelplineOpen} 
        onClose={() => setIsHelplineOpen(false)} 
        hideLauncher={true}
      />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Modals */}
      <QRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      <TMChatbotModal isOpen={isGeminiChatOpen} onClose={() => setIsGeminiChatOpen(false)} />
      <LanguageSupportModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TravelerProvider>
        <AuthProvider>
          <ToastProvider>
            <SidebarProvider>
              <BrowserRouter>
                <AppLayout />
              </BrowserRouter>
            </SidebarProvider>
          </ToastProvider>
        </AuthProvider>
      </TravelerProvider>
    </ThemeProvider>
  );
}
