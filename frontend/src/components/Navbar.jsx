import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Upload, MessageCircle, Home, TrendingUp, ShieldCheck, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { trackEvent } from '../utils/analytics';

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
  const [, setTick] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleSessionUpdate = () => setTick((t) => t + 1);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('finsight-session-updated', handleSessionUpdate);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('finsight-session-updated', handleSessionUpdate);
    };
  }, []);

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

  const navLinks = [
    { path: '/', IconComp: Home, label: 'Home' },
    { path: '/upload', IconComp: Upload, label: 'Upload' },
    { path: '/dashboard', IconComp: BarChart3, label: 'Dashboard' },
    { path: '/chat', IconComp: MessageCircle, label: 'Chat' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`${isLanding ? 'absolute' : 'fixed'} top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${scrolled || !isLanding ? 'backdrop-blur-xl bg-[#04050A]/85 border-b border-white/[0.06]' : 'bg-transparent'}`}>
      <div className="max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-16 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white font-space">FinSight</span>
        </Link>

        {/* Center Nav Links — Desktop */}
        {!isLanding && (
          <div className="hidden md:flex items-center bg-white/[0.03] border border-white/[0.06] rounded-full p-1">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              const IconElement = item.IconComp;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-[13px] font-semibold tracking-tight transition-all duration-300
                    ${active
                      ? 'text-[#10B981] bg-[#10B981]/10'
                      : 'text-[#9CA3AF] hover:text-white'
                    }`}
                >
                  <IconElement className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Right Side Controls */}
        {isLanding ? (
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden sm:inline-flex px-4 py-2 rounded-full text-xs font-medium text-[#9CA3AF] hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="px-5 py-2 rounded-full text-sm font-medium text-white border border-white/[0.18] bg-white/[0.05] hover:bg-white/[0.10] hover:scale-[1.02] transition-all duration-300"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* Mobile icon links */}
            <div className="flex md:hidden items-center bg-white/[0.03] border border-white/[0.06] rounded-full px-1.5 py-1">
              {navLinks.map((item) => {
                const IconElement = item.IconComp;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    aria-label={item.label}
                    title={item.label}
                    className={`p-2 rounded-full transition-colors ${isActive(item.path) ? 'text-[#10B981] bg-[#10B981]/10' : 'text-[#9CA3AF] hover:text-white'}`}
                  >
                    <IconElement className="w-4 h-4" />
                  </Link>
                );
              })}
            </div>

            {/* Session status & Clear Session button */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-[#9CA3AF]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Session ({sessionCount})</span>
              {sessionCount > 0 && (
                <button
                  onClick={handleEndSession}
                  title="End session & clear all data"
                  className="ml-1 pl-2 border-l border-white/[0.08] text-[#EF4444]/80 hover:text-[#EF4444] flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden lg:inline">Reset</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}