import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { categories } from '../data/dummyData';
import { Tag, CheckCircle, ArrowRight, ChevronDown, RefreshCw } from 'lucide-react';

export default function CategorizationPage() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [duplicateError, setDuplicateError] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  useEffect(() => {
    if (!data) {
      navigate('/upload');
      return;
    }
    if (data.merchant_name && !selectedCategory) {
      const lower = data.merchant_name.toLowerCase();
      if (lower.includes('zomato') || lower.includes('swiggy') || lower.includes('starbucks')) setSelectedCategory('Food');
      else if (lower.includes('uber') || lower.includes('ola')) setSelectedCategory('Travel');
      else if (lower.includes('amazon') || lower.includes('myntra')) setSelectedCategory('Shopping');
      else if (lower.includes('reliance') || lower.includes('fresh')) setSelectedCategory('Groceries');
      else setSelectedCategory('Shopping');
    }

    // Check for existing duplicate on load (Aggressive: Date + Amount)
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    const isDuplicate = existing.some(t => 
      t.date === data.date && 
      Math.abs(t.amount - data.total_amount) < 0.01
    );
    if (isDuplicate) setDuplicateError(true);
  }, [data, navigate, selectedCategory]);

  if (!data) return null;

  const handleSave = () => {
    const existing = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    
    // Check for duplicate receipt (Aggressive: Date + Amount)
    const isDuplicate = existing.some(t => 
      t.date === data.date && 
      Math.abs(t.amount - data.total_amount) < 0.01
    );

    if (isDuplicate) {
      setDuplicateError(true);
      return;
    }

    const newTransaction = {
      id: Date.now(),
      merchant: data.merchant_name,
      amount: data.total_amount,
      date: data.date,
      currency: data.currency,
      category: selectedCategory,
      items: data.items,
      icon: categoryEmojis[selectedCategory] || '🛍️'
    };
    sessionStorage.setItem('transactions', JSON.stringify([...existing, newTransaction]));
    setSaved(true);
    setDuplicateError(false);
  };

  const categoryEmojis = {
    Food: '🍔', Travel: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Groceries: '🥦', Utilities: '⚡', Health: '💊', Education: '📚', Other: '📦'
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-xl">{categoryEmojis[selectedCategory] || '📦'}</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-wide">{data.merchant_name}</h3>
                <p className="text-[11px] font-bold tracking-widest uppercase text-[#4B5563] mt-1">{data.currency} {data.total_amount.toFixed(2)} • {data.date}</p>
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
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-6 py-4 rounded-xl liquid-glass text-white text-base font-bold tracking-wide hover:border-[#10B981]/50 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            <div className="flex items-center gap-4">
              <span className="text-xl">{categoryEmojis[selectedCategory] || '📦'}</span>
              <span>{selectedCategory}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-[#9CA3AF] transition-transform ${isOpen ? 'rotate-180 text-[#10B981]' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-2 bg-[#0a0b12] rounded-xl border border-white/[0.08] shadow-lg overflow-hidden py-2 max-h-[300px] overflow-y-auto">
              {renderCategoryList.map((cat) => (
                <button
                  key={cat}
                  onClick={() => { setSelectedCategory(cat); setIsOpen(false); setSaved(false); setDuplicateError(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-3 text-sm font-semibold tracking-wide hover:bg-white/[0.05] transition-colors
                    ${selectedCategory === cat ? 'text-[#10B981] bg-[#10B981]/5' : 'text-[#9CA3AF]'}
                  `}
                >
                  <span className="text-lg">{categoryEmojis[cat] || '📦'}</span>
                  <span>{cat}</span>
                  {selectedCategory === cat && <CheckCircle className="w-4 h-4 ml-auto text-[#10B981]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="animate-fade-in-up delay-300">
          {duplicateError && !saved && (
            <div className="mb-4 py-3 px-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-sm font-bold text-center flex items-center justify-center gap-2 animate-fade-in-up">
              <span className="text-base">⚠️</span> This receipt has already been added
            </div>
          )}
          {saved ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-4 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] font-semibold flex items-center justify-center gap-2 hover:bg-[#10B981]/20 transition-all"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Saved! View Dashboard
              <ArrowRight className="w-5 h-5 ml-auto opacity-70" />
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/upload')}
                className="w-1/3 flex items-center justify-center gap-2 py-4 rounded-xl border border-white/[0.12] bg-white/[0.04] text-[#9CA3AF] font-semibold text-sm hover:bg-white/[0.08] transition-all"
              >
                <RefreshCw size={16} />
                Rescan
              </button>
              <button
                onClick={handleSave}
                className="w-2/3 py-4 rounded-full bg-[#10B981] text-white font-semibold flex items-center justify-center gap-2 hover:bg-[#059669] transition-all animate-pulse-glow"
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
