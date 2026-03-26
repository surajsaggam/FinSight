import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Store, Calendar, Receipt, ArrowRight, RefreshCw, LayoutDashboard, Tag } from 'lucide-react';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  useEffect(() => {
    if (!data) navigate('/upload');
  }, [data, navigate]);

  if (!data) return null;

  const handleSaveToDashboard = () => {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    const categoryEmojis = {
      Food: '🍔', Travel: '🚗', Shopping: '🛍️', Entertainment: '🎬',
      Groceries: '🥦', Utilities: '⚡', Health: '💊', Education: '📚', Other: '📦'
    };
    const mappedCategory = data.category || 'Other';

    const newTransaction = {
      id: Date.now(),
      merchant: data.merchant_name,
      amount: data.total_amount, // Dashboard expects 'amount'
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
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-500/10 text-green-500 mb-4 animate-[bounce_1s_ease-out]">
            <Receipt size={28} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            Scan Complete
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            We've neatly extracted your receipt details.
          </p>
        </div>

        {/* The Digital Receipt / Ticket */}
        <div className="bg-white dark:bg-[#111111] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)] mb-8 flex flex-col border border-gray-100 dark:border-white/5 relative z-10">
          
          {/* Top colored strip */}
          <div className="h-2.5 w-full bg-gradient-to-r from-[#df9d61] via-[#C68346] to-[#8B5E3C] rounded-t-3xl" />
          
          {/* Top Half (Merchant) */}
          <div className="p-8 pb-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#C68346]/10 flex items-center justify-center mb-5 border border-[#C68346]/20 shadow-sm">
              <Store size={28} className="text-[#C68346]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
              {data.merchant_name}
            </h2>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 py-1.5 px-3 rounded-full">
              <Calendar size={14} />
              {data.date}
            </div>
          </div>

          {/* Separation Line & Ticket Cutouts */}
          <div className="flex items-center w-full">
            <div className="w-4 h-8 rounded-r-full bg-[#fafafa] dark:bg-[#0a0a0a] shadow-[inset_-2px_0_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_-2px_0_4px_rgba(0,0,0,0.4)] border-r border-gray-100 dark:border-white/5" />
            <div className="flex-1 border-t-2 border-dashed border-gray-200 dark:border-gray-800/60 mx-1" />
            <div className="w-4 h-8 rounded-l-full bg-[#fafafa] dark:bg-[#0a0a0a] shadow-[inset_2px_0_4px_rgba(0,0,0,0.02)] dark:shadow-[inset_2px_0_4px_rgba(0,0,0,0.4)] border-l border-gray-100 dark:border-white/5" />
          </div>

          {/* Bottom Half (Items & Total) */}
          <div className="p-8 pt-6">
            <div className="flex items-center text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">
              <span className="flex-1">Itemized bill</span>
              <span>Amount</span>
            </div>
            
            <div className="space-y-3.5 mb-8">
              {data.items?.map((item, i) => (
                <div key={i} className="flex justify-between items-start text-sm group">
                  <span className="text-gray-700 dark:text-gray-300 pr-4 leading-snug font-medium transition-colors group-hover:text-gray-900 dark:group-hover:text-white">
                    {item.name}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white tabular-nums">
                    {data.currency} {item.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Section */}
            <div className="pt-5 border-t-2 border-gray-100 dark:border-gray-800/80 flex items-end justify-between">
              <div>
                <p className="text-[11px] font-bold tracking-widest uppercase text-gray-400 mb-1">Total Paid</p>
                <div className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                  <span className="text-[#C68346] mr-1">{data.currency}</span> 
                  {data.total_amount.toFixed(2)}
                </div>
              </div>
              <div className="h-12 w-12 rounded-2xl bg-[#C68346]/10 flex items-center justify-center text-[#C68346] shadow-sm">
                <Tag size={20} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3.5 delay-200 animate-fade-in-up">
          <button
            onClick={handleSaveToDashboard}
            className="btn-primary w-full py-4 text-[15px] shadow-[0_4px_20px_rgba(198,131,70,0.25)] hover:shadow-[0_6px_25px_rgba(198,131,70,0.35)]"
          >
            <LayoutDashboard size={18} />
            Save to Dashboard
            <ArrowRight size={16} className="ml-auto opacity-70" />
          </button>
          
          <button
            onClick={() => navigate('/upload')}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-[15px] border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#C68346]"
          >
            <RefreshCw size={16} />
            Scan Another Receipt
          </button>
        </div>
        
        {/* Categorize CTA */}
        <div className="mt-6 text-center animate-fade-in-up delay-[400ms]">
          <button
            onClick={() => navigate('/categorize', { state: { receiptData: data } })}
            className="text-sm font-semibold text-[#8B5E3C] dark:text-[#d39b6b] hover:text-[#C68346] transition-colors underline decoration-transparent hover:decoration-[#C68346] underline-offset-4"
          >
            Categorize this instead →
          </button>
        </div>

      </div>
    </div>
  );
}
