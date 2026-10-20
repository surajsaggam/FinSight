import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Home, Upload, BarChart3, MessageCircle, Shield,
  FileText, Plus, Download, Trash2, ArrowRight, CornerDownLeft
} from 'lucide-react';
import { CATEGORY_EMOJIS } from '../data/dummyData';

const STATIC_PAGES = [
  { id: 'p-home', title: 'Home', subtitle: 'FinSight landing page & overview', path: '/', Icon: Home, category: 'Pages' },
  { id: 'p-upload', title: 'Upload Receipt', subtitle: 'Scan a receipt with Gemini Vision AI', path: '/upload', Icon: Upload, category: 'Pages' },
  { id: 'p-dash', title: 'Dashboard', subtitle: 'View spending charts, AI forecasts & risk profile', path: '/dashboard', Icon: BarChart3, category: 'Pages' },
  { id: 'p-chat', title: 'Chat Assistant', subtitle: 'Ask AI questions about your finances', path: '/chat', Icon: MessageCircle, category: 'Pages' },
  { id: 'p-privacy', title: 'Privacy Policy', subtitle: 'Stateless session data & security practices', path: '/privacy', Icon: Shield, category: 'Pages' },
  { id: 'p-terms', title: 'Terms & Conditions', subtitle: 'Acceptable use & service boundaries', path: '/terms', Icon: FileText, category: 'Pages' },
];

export default function SearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [prevOpen, setPrevOpen] = useState(isOpen);
  const inputRef = useRef(null);

  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    if (!isOpen) {
      setQuery('');
    }
  }

  const transactions = useMemo(() => {
    if (!isOpen) return [];
    try {
      const stored = JSON.parse(sessionStorage.getItem('transactions') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Filter pages
  const matchedPages = STATIC_PAGES.filter(
    (p) => p.title.toLowerCase().includes(trimmed) || p.subtitle.toLowerCase().includes(trimmed)
  );

  // Quick actions
  const quickActions = [
    {
      id: 'a-scan',
      title: 'Scan New Receipt',
      subtitle: 'Upload an image for instant extraction',
      action: () => { navigate('/upload'); onClose(); },
      Icon: Upload,
      category: 'Actions',
    },
    {
      id: 'a-manual',
      title: 'Add Expense Manually',
      subtitle: 'Record an expense without a receipt image',
      action: () => { navigate('/dashboard'); onClose(); },
      Icon: Plus,
      category: 'Actions',
    },
    {
      id: 'a-export',
      title: 'Export Transactions as CSV',
      subtitle: 'Download your session data locally',
      action: () => { navigate('/dashboard'); onClose(); },
      Icon: Download,
      category: 'Actions',
    },
    {
      id: 'a-reset',
      title: 'Reset Session Data',
      subtitle: 'Wipe all receipts and start fresh',
      action: () => {
        if (window.confirm('Clear all session data?')) {
          sessionStorage.removeItem('transactions');
          sessionStorage.removeItem('monthlyBudget');
          window.dispatchEvent(new Event('finsight-session-updated'));
          navigate('/');
          onClose();
        }
      },
      Icon: Trash2,
      category: 'Actions',
    },
  ].filter(
    (a) => a.title.toLowerCase().includes(trimmed) || a.subtitle.toLowerCase().includes(trimmed)
  );

  // Filter session transactions
  const matchedTx = trimmed
    ? transactions.filter((t) => {
        const m = (t.merchant || '').toLowerCase();
        const c = (t.category || '').toLowerCase();
        const a = String(t.amount || '');
        const d = (t.date || '').toLowerCase();
        return m.includes(trimmed) || c.includes(trimmed) || a.includes(trimmed) || d.includes(trimmed);
      }).slice(0, 5)
    : [];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site-wide search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-24 px-4 bg-black/75 backdrop-blur-md no-print"
      onClick={onClose}
    >
      <div
        className="liquid-glass max-w-2xl w-full p-4 sm:p-5 border border-white/[0.14] shadow-2xl bg-[#080B12]/95 backdrop-blur-2xl rounded-2xl animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] focus-within:border-[#10B981]/50 transition-colors">
          <Search className="w-5 h-5 text-[#9CA3AF] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, transactions, or actions (e.g. food, upload, export)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#6B7280] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-[#9CA3AF] hover:text-white rounded-md cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/[0.06] text-[10px] text-[#9CA3AF] border border-white/[0.08]">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {/* Matched Transactions */}
          {matchedTx.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#10B981] px-2 mb-2">
                Matching Receipts ({matchedTx.length})
              </p>
              <div className="space-y-1">
                {matchedTx.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => { navigate('/dashboard'); onClose(); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-sm">
                        {CATEGORY_EMOJIS[t.category] || t.icon || '📦'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white group-hover:text-[#10B981] transition-colors">
                          {t.merchant}
                        </p>
                        <p className="text-[10px] text-[#6B7280]">{t.category} • {t.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">
                        {t.currency || '₹'} {Number(t.amount).toFixed(2)}
                      </span>
                      <CornerDownLeft size={12} className="text-[#6B7280] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {quickActions.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B7280] px-2 mb-2">
                Quick Actions
              </p>
              <div className="space-y-1">
                {quickActions.map((action) => {
                  const ActionIcon = action.Icon;
                  return (
                    <button
                      key={action.id}
                      onClick={action.action}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                          <ActionIcon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-[#10B981] transition-colors">
                            {action.title}
                          </p>
                          <p className="text-[10px] text-[#6B7280]">{action.subtitle}</p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-[#6B7280] group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Navigation Pages */}
          {matchedPages.length > 0 && (
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B7280] px-2 mb-2">
                Navigation
              </p>
              <div className="space-y-1">
                {matchedPages.map((page) => {
                  const PageIcon = page.Icon;
                  return (
                    <button
                      key={page.id}
                      onClick={() => { navigate(page.path); onClose(); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-[#9CA3AF] group-hover:text-white">
                          <PageIcon size={14} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white group-hover:text-[#10B981] transition-colors">
                            {page.title}
                          </p>
                          <p className="text-[10px] text-[#6B7280]">{page.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-[#6B7280] group-hover:text-white">{page.path}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {matchedPages.length === 0 && quickActions.length === 0 && matchedTx.length === 0 && (
            <div className="py-8 text-center text-xs text-[#6B7280]">
              No results found for &ldquo;{query}&rdquo;. Try &ldquo;upload&rdquo;, &ldquo;food&rdquo;, or &ldquo;dashboard&rdquo;.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#6B7280]">
          <span>Tip: Press <kbd className="px-1 py-0.5 rounded bg-white/[0.06] text-white">Ctrl+K</kbd> anywhere to search</span>
          <span>FinSight Instant Search</span>
        </div>
      </div>
    </div>
  );
}
