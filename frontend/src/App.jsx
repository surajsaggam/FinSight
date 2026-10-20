import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import CookieBanner from './components/CookieBanner';
import SearchModal from './components/SearchModal';
import BackToTop from './components/BackToTop';
import SupportButton from './components/SupportButton';
import ScrollProgressBar from './components/ScrollProgressBar';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import LandingPage from './pages/LandingPage';
import UploadPage from './pages/UploadPage';
import ProcessingPage from './pages/ProcessingPage';
import ResultPage from './pages/ResultPage';
import CategorizationPage from './pages/CategorizationPage';
import DashboardPage from './pages/DashboardPage';
import ChatPage from './pages/ChatPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';
import { trackPageView } from './utils/analytics';

function AppContent() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageView(location.pathname);
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden font-sans antialiased transition-colors duration-200">
      {/* Accessible Skip-to-Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-400 focus:text-slate-950 focus:font-semibold focus:rounded-xl focus:shadow-xl focus:outline-none transition-all"
      >
        Skip to main content
      </a>

      {/* Top viewport scroll progress indicator */}
      <ScrollProgressBar />

      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Main Content Landmark */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`relative z-10 flex flex-col min-h-screen outline-none ${
          location.pathname === '/' ? '' : 'pt-16 pb-12'
        }`}
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/processing" element={<ProcessingPage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/categorize" element={<CategorizationPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          {/* Legacy / convenience redirects for stateless session mode */}
          <Route path="/signup" element={<Navigate to="/upload" replace />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          {/* Custom 404 Page */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Interactive Utilities */}
      <SearchModal />
      <CookieBanner />
      <BackToTop />
      <SupportButton />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <AppContent />
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
