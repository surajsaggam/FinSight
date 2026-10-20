import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories, CATEGORY_EMOJIS } from '../data/dummyData';
import { Tag, CheckCircle, ArrowRight, ChevronDown, RefreshCw, AlertTriangle } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

function inferInitialCategory(data) {
  if (!data) return 'Other';
  if (data.category && data.category !== 'Other') return data.category;
  if (data.merchant_name) {
    const lower = data.merchant_name.toLowerCase();
    if (lower.includes('zomato') || lower.includes('swiggy') || lower.includes('starbucks') || lower.includes('cafe')) {
      return 'Food';
    }
    if (lower.includes('uber') || lower.includes('ola') || lower.includes('shell')) {
      return 'Transportation';
    }
    if (lower.includes('amazon') || lower.includes('myntra')) {
      return 'Shopping';
    }
    if (lower.includes('reliance') || lower.includes('fresh') || lower.includes('mart')) {
      return 'Groceries';
    }
    return data.category || 'Shopping';
  }
  return 'Other';
}

export default function CategorizationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  const [selectedCategory, setSelectedCategory] = useState(() => inferInitialCategory(data));
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');

    const newTransaction = {
      id: Date.now(),
      merchant: data.merchant_name || 'Unknown Merchant',
      amount: totalAmount,
      date: data.date || new Date().toISOString().slice(0, 10),
      currency: data.currency || 'INR',
      category: selectedCategory || 'Other',
      items: Array.isArray(data.items) ? data.items : [],
      icon: CATEGORY_EMOJIS[selectedCategory] || '📦',
    };
    sessionStorage.setItem('transactions', JSON.stringify([...existing, newTransaction]));
    window.dispatchEvent(new Event('finsight-session-updated'));
    trackEvent('receipt_categorized_and_saved', { category: selectedCategory });
    setSaved(true);
  };

  const renderCategoryList = [...categories, 'Other'];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-16 px-4 pt-28">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 mx-auto flex items-center justify-center mb-6 border border-[#10B981]/20">
            <Tag className="w-8 h-8 text-[#10B981]" />
          </div>
          <h1 className="font-space text-3xl font-extrabold tracking-tight text-white">VERIFY CATEGORY</h1>
          <p className="mt-3 text-[#9CA3AF] font-medium">
            AI matched this to <span className="font-bold text-[#10B981]">{selectedCategory}</span>
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="liquid-glass p-6 mb-10 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{CATEGORY_EMOJIS[selectedCategory] || '📦'}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">{data.merchant_name}</h3>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#4B5563] mt-1">
                  {data.currency} {totalAmount.toFixed(2)} • {data.date}
                </p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[10px] font-bold tracking-widest uppercase text-[#10B981]">
              {selectedCategory}
            </span>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="relative mb-10 animate-fade-in-up delay-200">
          <label className="block text-[10px] font-bold tracking-widest uppercase text-[#4B5563] mb-3 ml-2">
            Change Category
          </label>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-xl liquid-glass text-white text-base font-bold tracking-wide hover:border-[#10B981]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981] cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">{CATEGORY_EMOJIS[selectedCategory] || '📦'}</span>
              <span>{selectedCategory}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180 text-[#10B981]' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#0a0b12] rounded-xl border border-white/[0.08] shadow-lg overflow-hidden py-2 max-h-[300px] overflow-y-auto">
              {renderCategoryList.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsOpen(false); setSaved(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-semibold tracking-wide hover:bg-white/[0.05] transition-colors cursor-pointer
                    ${selectedCategory === cat ? 'text-[#10B981] bg-[#10B981]/5' : 'text-[#9CA3AF]'}
                  `}
                >
                  <span className="text-lg">{CATEGORY_EMOJIS[cat] || '📦'}</span>
                  <span>{cat}</span>
                  {selectedCategory === cat && <CheckCircle className="w-4 h-4 ml-auto text-[#10B981]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="animate-fade-in-up delay-300">
          {isDuplicate && !saved && (
            <div className="mb-4 py-3 px-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] text-xs font-medium text-center flex items-center justify-center gap-2 animate-fade-in-up">
              <AlertTriangle size={15} className="shrink-0" />
              <span>A receipt with this date & amount already exists in your dashboard.</span>
            </div>
          )}
          {saved ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-semibold flex items-center justify-center gap-2 hover:bg-[#10B981]/20 transition-all cursor-pointer"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Saved! View Dashboard
              <ArrowRight className="w-5 h-5 ml-auto opacity-70" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/upload')}
                className="w-1/3 flex items-center justify-center gap-2 py-4 rounded-xl border border-white/[0.12] bg-white/[0.04] text-[#9CA3AF] font-semibold text-sm hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <RefreshCw size={16} />
                Rescan
              </button>
              <button
                onClick={handleSave}
                className="w-2/3 py-4 rounded-full bg-[#10B981] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] transition-all animate-pulse-glow cursor-pointer"
              >
                {isDuplicate ? 'Confirm & Save Anyway' : 'Confirm Categorization'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
