import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Store, Calendar, Receipt, ArrowRight, RefreshCw, LayoutDashboard, Tag } from 'lucide-react';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  const [isDuplicate, setIsDuplicate] = useState(false);

  useEffect(() => {
    if (!data) {
      navigate('/upload');
      return;
    }
    
    // Check for existing duplicate
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    const duplicate = existing.some(t => 
      t.date === data.date && 
      Math.abs(t.amount - data.total_amount) < 0.01
    );
    setIsDuplicate(duplicate);
  }, [data, navigate]);

  if (!data) return null;

  const handleSaveToDashboard = () => {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    const categoryEmojis = {
      Food: '🍔', Travel: '🚗', Transportation: '🚕', Shopping: '🛍️', Entertainment: '🎬',
      Groceries: '🥦', Utilities: '⚡', Health: '💊', Education: '📚', Personal: '👤', Other: '📦'
    };
    const mappedCategory = data.category || 'Other';

    const newTransaction = {
      id: Date.now(),
      merchant: data.merchant_name,
      amount: data.total_amount,
      date: data.date,
      currency: data.currency,
      category: mappedCategory,
      icon: categoryEmojis[mappedCategory] || '📦',
      items: data.items,
    };
    sessionStorage.setItem('transactions', JSON.stringify([...existing, newTransaction]));
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
              {data.merchant_name}
            </h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] bg-white/[0.04] py-1.5 px-3 rounded-full border border-white/[0.08]">
              <Calendar size={14} />
              {data.date}
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
              {data.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm group">
                  <span className="text-[#9CA3AF] pr-4 leading-snug font-medium transition-colors group-hover:text-white">
                    {item.name}
                  </span>
                  <span className="font-semibold text-white tabular-nums">
                    {data.currency} {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="pt-5 border-t-2 border-white/[0.08] flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#4B5563] mb-1">Total Paid</p>
                <div className="font-space text-3xl font-black text-white tracking-tight">
                  <span className="text-[#10B981] mr-1">{data.currency}</span> 
                  {data.total_amount.toFixed(2)}
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
            <div className="mb-4 py-3 px-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-[13px] font-bold text-center flex items-center justify-center gap-2 animate-fade-in-up">
              <span className="text-base">⚠️</span> Duplicate detected (Already in dashboard)
            </div>
          )}
          <button
            onClick={handleSaveToDashboard}
            disabled={isDuplicate}
            className={`w-full py-4 text-[15px] rounded-2xl font-semibold flex items-center justify-center gap-2.5 transition-all duration-300 shadow-lg 
              ${isDuplicate 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed shadow-none grayscale' 
                : 'bg-[#10B981] text-white hover:bg-[#059669] hover:scale-[1.01] shadow-[#10B981]/20'
              }
            `}
          >
            <LayoutDashboard size={18} />
            {isDuplicate ? 'Already Saved' : 'Save to Dashboard'}
            <ArrowRight size={16} className="opacity-70" />
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] border border-white/[0.12] bg-white/[0.04] text-[#9CA3AF] hover:bg-white/[0.08] hover:text-white transition-all"
          >
            <RefreshCw size={16} />
            Scan Another Receipt
          </button>
        </div>
        
        {/* Categorize CTA */}
        <div className="mt-6 text-center animate-fade-in-up delay-[400ms]">
          <button
            onClick={() => navigate('/categorize', { state: { receiptData: data } })}
            className="text-sm font-semibold text-[#10B981] hover:text-[#059669] transition-colors underline decoration-transparent hover:decoration-[#10B981] underline-offset-4"
          >
            Categorize this instead →
          </button>
        </div>
      </div>
    </div>
  );
}
