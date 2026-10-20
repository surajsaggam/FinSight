import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';
import { getCookieConsent, setCookieConsent } from '../utils/analytics';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getCookieConsent();
    if (consent === 'undecided') {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleChoice = (preference) => {
    setCookieConsent(preference);
    setVisible(false);
  };

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fade-in-up no-print"
    >
      <div className="liquid-glass p-5 rounded-2xl border border-white/[0.14] shadow-2xl bg-[#080B12]/95 backdrop-blur-xl">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4.5 h-4.5 text-[#10B981]" />
          </div>
          <div className="flex-1">
            <h3 className="font-space text-sm font-bold text-white mb-1">
              Privacy-First Storage &amp; Cookies
            </h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
              FinSight stores your financial receipts strictly inside your temporary browser session. We only use anonymous performance metrics to improve AI response speed.{' '}
              <Link to="/privacy" className="text-[#10B981] underline underline-offset-2 hover:text-[#059669]">
                Privacy Policy
              </Link>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleChoice('all')}
                className="px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleChoice('essential')}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.10] text-[#9CA3AF] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Essential Only
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleChoice('essential')}
            aria-label="Dismiss cookie notice"
            className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
