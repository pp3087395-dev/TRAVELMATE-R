import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TravelerProvider } from './context/TravelerContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';

// Navigation & Layout Components
import Header from './components/common/Header';
import Navbar from './components/common/Navbar';
import ClaudeSidebar from './components/navigation/ClaudeSidebar';
import FloatingBhashiniWidget from './components/bhashini/FloatingBhashiniWidget';
import ToastContainer from './components/common/ToastContainer';
import HelplineFloatingBadge from './components/common/HelplineFloatingBadge';
import QRModal from './components/common/QRModal';
import ClaudeChatbotModal from './components/chat/ClaudeChatbotModal';
import LanguageSupportModal from './components/common/LanguageSupportModal';

// Pages
import LandingPage from './pages/LandingPage';
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

import { Bot } from 'lucide-react';

// Inner App Layout Container that dynamically adjusts to sidebar state
function AppLayout() {
  const [isQROpen, setIsQROpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { isCollapsed } = useSidebar();

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
        {/* Header */}
        <Header onOpenQR={() => setIsQROpen(true)} onOpenLang={() => setIsLangOpen(true)} />

        {/* Sub Navigation (Mobile Quick Rail) */}
        <Navbar />

        {/* Main Routes View */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/portal" element={<UserPortalPage />} />
            <Route path="/journey-chain" element={<JourneyChainPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/onboard" element={<OnboardingPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
            <Route path="/planner" element={<TripPlannerPage />} />
            <Route path="/trip-planner" element={<TripPlannerPage />} />
            <Route path="/phrase-helper" element={<PhraseHelperPage />} />
            <Route path="/language" element={<PhraseHelperPage />} />
            <Route path="/fare-meter" element={<FareMeterPage />} />
            <Route path="/safe-journey" element={<SafeJourneyPage />} />
            <Route path="/vault" element={<EvidenceVaultPage />} />
            <Route path="/incident" element={<IncidentReportPage />} />
            <Route path="/emergency" element={<IncidentReportPage />} />
            <Route path="/admin" element={<UserPortalPage />} />
          </Routes>
        </main>
      </div>

      {/* Floating Claude Chatbot Launcher Button */}
      <div className="fixed bottom-4 left-4 z-30 md:bottom-6 md:left-6">
        <button
          id="btn-floating-claude-chat"
          onClick={() => setIsChatOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3.5 py-2.5 rounded-full shadow-xl shadow-indigo-600/30 border border-indigo-400/40 transition-all duration-200 hover:scale-105 active:scale-95"
          title="Ask Claude AI Grounded Assistant"
        >
          <Bot className="w-4 h-4" />
          <span className="text-xs font-semibold tracking-wide font-display hidden sm:inline">
            Ask Claude AI
          </span>
        </button>
      </div>

      {/* Floating Bhashini AI Multilingual Translator Widget */}
      <FloatingBhashiniWidget />

      {/* Floating Emergency & Embassy Helpline Directory */}
      <HelplineFloatingBadge />

      {/* Toast Notification Container */}
      <ToastContainer />

      {/* Modals */}
      <QRModal isOpen={isQROpen} onClose={() => setIsQROpen(false)} />
      <ClaudeChatbotModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <LanguageSupportModal isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <TravelerProvider>
        <ToastProvider>
          <SidebarProvider>
            <BrowserRouter>
              <AppLayout />
            </BrowserRouter>
          </SidebarProvider>
        </ToastProvider>
      </TravelerProvider>
    </ThemeProvider>
  );
}
