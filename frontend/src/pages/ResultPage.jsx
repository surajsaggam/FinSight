import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Store, Calendar, Receipt, ArrowRight, RefreshCw, LayoutDashboard, Tag, AlertTriangle } from 'lucide-react';
import { CATEGORY_EMOJIS } from '../data/dummyData';
import { trackEvent } from '../utils/analytics';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  useEffect(() => {
    if (!data) {
      navigate('/upload');
    }
  }, [data, navigate]);

  if (!data) return null;

  let isDuplicate = false;
  try {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    isDuplicate = existing.some(
      (t) =>
        t.date === data.date &&
        Math.abs(Number(t.amount) - Number(data.total_amount)) < 0.01
    );
  } catch {
    isDuplicate = false;
  }

  const totalAmount = Number(data.total_amount) || 0;
  const items = Array.isArray(data.items) ? data.items : [];
  const mappedCategory = data.category || 'Other';

  const handleSaveToDashboard = () => {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');

    const newTransaction = {
      id: Date.now(),
      merchant: data.merchant_name || 'Unknown Merchant',
      amount: totalAmount,
      date: data.date || new Date().toISOString().slice(0, 10),
      currency: data.currency || 'INR',
      category: mappedCategory,
      icon: CATEGORY_EMOJIS[mappedCategory] || '📦',
      items,
    };
    sessionStorage.setItem('transactions', JSON.stringify([...existing, newTransaction]));
    window.dispatchEvent(new Event('finsight-session-updated'));
    trackEvent('receipt_saved_to_dashboard', { category: mappedCategory, was_duplicate: isDuplicate });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen px-4 pb-16 pt-8 flex flex-col items-center justify-start max-w-lg mx-auto w-full">
      <div className="w-full animate-fade-in-up">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#10B981]/10 text-[#10B981] mb-4 animate-[bounce_1s_ease-out]">
            <Receipt size={28} />
          </div>
          <h1 className="font-space text-3xl font-bold tracking-tight text-white mb-2">
            Scan Complete
          </h1>
          <p className="text-sm font-medium text-[#9CA3AF]">
            We've neatly extracted your receipt details.
          </p>
        </div>

        {/* The Digital Receipt / Ticket */}
        <div className="liquid-glass mb-8 flex flex-col relative z-10 overflow-visible">
          {/* Top colored strip */}
          <div className="h-2.5 w-full bg-gradient-to-r from-[#10B981] via-[#10B981]/60 to-[#10B981]/30 rounded-t-2xl" />

          {/* Top Half (Merchant) */}
          <div className="p-8 pb-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 flex items-center justify-center mb-5 border border-[#10B981]/20">
              <Store size={28} className="text-[#10B981]" />
            </div>
            <h2 className="font-space text-2xl font-bold text-white uppercase tracking-wider mb-2">
              {data.merchant_name || 'Receipt'}
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] bg-white/[0.04] py-1.5 px-3 rounded-full border border-white/[0.08]">
                <Calendar size={14} />
                {data.date || 'Today'}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#10B981] bg-[#10B981]/10 py-1.5 px-3 rounded-full border border-[#10B981]/20">
                <span>{CATEGORY_EMOJIS[mappedCategory] || '📦'}</span>
                <span>{mappedCategory}</span>
              </div>
            </div>
          </div>

          {/* Separation Line & Ticket Cutouts */}
          <div className="flex items-center w-full">
            <div className="w-4 h-8 rounded-r-full bg-[#04050A]" />
            <div className="flex-1 border-t-2 border-dashed border-white/[0.08] mx-1" />
            <div className="w-4 h-8 rounded-l-full bg-[#04050A]" />
          </div>

          {/* Bottom Half (Items & Total) */}
          <div className="p-8 pt-6">
            <div className="flex items-center text-[10px] font-bold tracking-widest uppercase text-[#4B5563] mb-4">
              <span className="flex-1">Itemized bill</span>
              <span>Amount</span>
            </div>

            <div className="space-y-3.5 mb-8">
              {items.length > 0 ? (
                items.map((item, i) => (
                  <div key={i} className="flex justify-between items-start text-sm group">
                    <span className="text-[#9CA3AF] pr-4 leading-snug font-medium transition-colors group-hover:text-white">
                      {item.name}
                    </span>
                    <span className="font-semibold text-white tabular-nums">
                      {data.currency} {(Number(item.price) || 0).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#6B7280] italic">No individual line items detected — total extracted directly.</p>
              )}
            </div>

            {/* Total Section */}
            <div className="pt-5 border-t-2 border-white/[0.08] flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#4B5563] mb-1">Total Paid</p>
                <div className="font-space text-3xl font-black text-white tracking-tight">
                  <span className="text-[#10B981] mr-1">{data.currency}</span>
                  {totalAmount.toFixed(2)}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                <Tag size={20} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3.5 delay-200 animate-fade-in-up">
          {isDuplicate && (
            <div className="mb-4 py-3 px-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] text-xs font-medium flex items-center justify-center gap-2 animate-fade-in-up">
              <AlertTriangle size={15} className="shrink-0" />
              <span>A receipt with the same date and amount is already in your dashboard.</span>
            </div>
          )}
          <button
            onClick={handleSaveToDashboard}
            className="w-full py-4 text-[15px] rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg bg-[#10B981] text-white hover:bg-[#059669] hover:scale-[1.01] shadow-[#10B981]/20 cursor-pointer"
          >
            <LayoutDashboard size={18} />
            {isDuplicate ? 'Save Anyway to Dashboard' : 'Save to Dashboard'}
            <ArrowRight size={16} className="opacity-70" />
          </button>

          <button
            onClick={() => navigate('/upload')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] border border-white/[0.12] bg-white/[0.04] text-[#9CA3AF] hover:bg-white/[0.08] hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            Scan Another Receipt
          </button>
        </div>

        {/* Categorize CTA */}
        <div className="mt-6 text-center animate-fade-in-up delay-[400ms]">
          <button
            onClick={() => navigate('/categorize', { state: { receiptData: data } })}
            className="text-sm font-semibold text-[#10B981] hover:text-[#059669] transition-colors underline decoration-transparent hover:decoration-[#10B981] underline-offset-4 cursor-pointer"
          >
            Change category ({mappedCategory}) →
          </button>
        </div>
      </div>
    </div>
  );
}
