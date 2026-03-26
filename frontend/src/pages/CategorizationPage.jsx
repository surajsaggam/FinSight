import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../data/dummyData';
import { Tag, CheckCircle, ArrowRight, ChevronDown, RefreshCw } from 'lucide-react';

export default function CategorizationPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  useEffect(() => {
    if (!data) {
      navigate('/upload');
      return;
    }
    // Attempt somewhat smart defaulting
    if (data.merchant_name && !selectedCategory) {
      const lower = data.merchant_name.toLowerCase();
      if (lower.includes('zomato') || lower.includes('swiggy') || lower.includes('starbucks')) setSelectedCategory('Food');
      else if (lower.includes('uber') || lower.includes('ola')) setSelectedCategory('Travel');
      else if (lower.includes('amazon') || lower.includes('myntra')) setSelectedCategory('Shopping');
      else if (lower.includes('reliance') || lower.includes('fresh')) setSelectedCategory('Groceries');
      else setSelectedCategory('Shopping'); // Default
    }
  }, [data, navigate, selectedCategory]);

  if (!data) return null;

  const handleSave = () => {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    const newTransaction = {
      id: Date.now(),
      merchant: data.merchant_name,
      amount: data.total_amount, // The dashboard uses 'amount', not 'total'
      date: data.date,
      currency: data.currency,
      category: selectedCategory,
      items: data.items,
      icon: categoryEmojis[selectedCategory] || '🛍️'
    };
    sessionStorage.setItem('transactions', JSON.stringify([...existing, newTransaction]));
    setSaved(true);
  };

  const categoryEmojis = {
    Food: '🍔', Travel: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Groceries: '🥦', Utilities: '⚡', Health: '💊', Education: '📚', Other: '📦'
  };

  const renderCategoryList = [...categories, 'Other'];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center bg-transparent py-16 px-4 pt-28">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[#C68346]/10 mx-auto flex items-center justify-center mb-6 shadow-sm border border-[#C68346]/20">
            <Tag className="w-8 h-8 text-[#C68346]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">VERIFY CATEGORY</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 font-medium">
            AI matched this to <span className="font-bold text-[#C68346]">{selectedCategory}</span>
          </p>
        </div>

        {/* Transaction Summary */}
        <div className="glass-panel p-6 mb-10 animate-fade-in-up delay-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#050505] border border-gray-200 dark:border-white/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-xl">{categoryEmojis[selectedCategory] || '📦'}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">{data.merchant_name}</h3>
                <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mt-1">{data.currency} {data.total_amount.toFixed(2)} • {data.date}</p>
              </div>
            </div>
            <span className="px-3 py-1.5 rounded-full bg-[#C68346]/10 border border-[#C68346]/20 text-[10px] font-bold tracking-widest uppercase text-[#C68346]">
              {selectedCategory}
            </span>
          </div>
        </div>

        {/* Category Dropdown */}
        <div className="relative mb-10 animate-fade-in-up delay-200">
          <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-500 dark:text-gray-400 mb-3 ml-2">
            Change Category
          </label>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-xl glass-panel text-gray-900 dark:text-white text-base font-bold tracking-wide hover:border-[#C68346]/50 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C68346]"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">{categoryEmojis[selectedCategory] || '📦'}</span>
              <span>{selectedCategory}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180 text-[#C68346]' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-[#111111] rounded-xl border border-gray-200 dark:border-white/10 shadow-lg overflow-hidden py-2 max-h-[300px] overflow-y-auto">
              {renderCategoryList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsOpen(false); setSaved(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-semibold tracking-wide hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors
                    ${selectedCategory === cat ? 'text-[#C68346] bg-[#C68346]/5' : 'text-gray-700 dark:text-gray-300'}
                  `}
                >
                  <span className="text-lg">{categoryEmojis[cat] || '📦'}</span>
                  <span>{cat}</span>
                  {selectedCategory === cat && <CheckCircle className="w-4 h-4 ml-auto text-[#C68346]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="animate-fade-in-up delay-300">
          {saved ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary w-full shadow-lg text-[#C68346] bg-[#C68346]/5 hover:bg-[#C68346]/10"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Saved! View Dashboard
              <ArrowRight className="w-5 h-5 ml-auto opacity-70" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/upload')}
                className="w-1/3 flex items-center justify-center gap-2 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111111] text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-gray-300"
              >
                <RefreshCw size={16} />
                Rescan
              </button>
              <button
                onClick={handleSave}
                className="btn-primary w-2/3 shadow-lg"
              >
                Confirm Categorization
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
