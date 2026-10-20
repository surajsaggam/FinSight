import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Upload,
  MessageCircle,
  Home,
  TrendingUp,
  ShieldCheck,
  Trash2,
  Search,
  Sun,
  Moon,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent } from '../utils/analytics';
import { useTheme } from '../context/ThemeContext';

function readSessionTxCount() {
  try {
    const tx = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    return Array.isArray(tx) ? tx.length : 0;
  } catch {
    return 0;
  }
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, setTick] = useState(0);
  const { darkMode, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleSessionUpdate = () => setTick((t) => t + 1);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('finsight-session-updated', handleSessionUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('finsight-session-updated', handleSessionUpdate);
    };
  }, []);

  const [prevPath, setPrevPath] = useState(location.pathname);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setMobileMenuOpen(false);
  }

  const sessionCount = readSessionTxCount();

  const handleEndSession = () => {
    if (window.confirm('Clear all session data (transactions, budget, and analytics) from this browser?')) {
      sessionStorage.removeItem('transactions');
      sessionStorage.removeItem('monthlyBudget');
      sessionStorage.removeItem('finsight_analytics_events');
      trackEvent('session_cleared_navbar');
      window.dispatchEvent(new Event('finsight-session-updated'));
      if (location.pathname !== '/dashboard') {
        navigate('/');
      }
    }
  };

  const handleOpenSearch = () => {
    window.dispatchEvent(new CustomEvent('open-finsight-search'));
  };

  const navLinks = [
    { path: '/', IconComp: Home, label: 'Home' },
    { path: '/upload', IconComp: Upload, label: 'Upload' },
    { path: '/dashboard', IconComp: BarChart3, label: 'Dashboard' },
    { path: '/chat', IconComp: MessageCircle, label: 'Chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full print:hidden">
      <nav
        aria-label="Main Navigation"
        className={`w-full transition-all duration-300 ${
          scrolled || !isLanding || mobileMenuOpen
            ? 'backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80 shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-16 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-100 font-space">
              FinSight
            </span>
          </Link>

          {/* Center Nav Links — Desktop */}
          <div className="hidden md:flex items-center bg-slate-900/60 border border-slate-800/80 rounded-full p-1 backdrop-blur-md">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const IconElement = item.IconComp;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-200 ${
                    active
                      ? 'text-emerald-400 bg-emerald-500/10 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <IconElement className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Trigger Button */}
            <button
              type="button"
              onClick={handleOpenSearch}
              aria-label="Search site or run commands"
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                ⌘K
              </kbd>
            </button>

            {/* Dark / Light Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800/80 text-slate-400 hover:text-amber-400 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Session Indicator & Clear Button */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Session ({sessionCount})</span>
              {sessionCount > 0 && (
                <button
                  type="button"
                  onClick={handleEndSession}
                  title="End session & clear all data"
                  className="ml-1 pl-2 border-l border-slate-800 text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Upload CTA for Landing Page */}
            {isLanding && (
              <Link
                to="/upload"
                className="hidden sm:inline-flex px-4 py-1.5 rounded-full text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 hover:scale-[1.02] shadow-sm transition-all duration-200 font-semibold"
              >
                Scan Receipt
              </Link>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
              aria-expanded={mobileMenuOpen}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Responsive Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((item) => {
                const active = isActive(item.path);
                const IconElement = item.IconComp;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <IconElement className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Receipts stored: {sessionCount}
              </span>
              {sessionCount > 0 && (
                <button
                  type="button"
                  onClick={handleEndSession}
                  className="text-rose-400 hover:text-rose-300 font-medium"
                >
                  Clear Data
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}