import { useState } from 'react';
import { Calendar, Trash2, Edit2, Check } from 'lucide-react';
import { categories } from '../data/dummyData';

export default function ExpenseCard({ id, merchant, amount, date, category, currency, icon, onDelete, onEdit }) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const [isEditing, setIsEditing] = useState(false);
  const [editMerchant, setEditMerchant] = useState(merchant);
  const [editAmount, setEditAmount] = useState(amount || 0);
  const [editCategory, setEditCategory] = useState(category || 'Other');

  const handleSave = () => {
    if (onEdit) {
      onEdit(id, { merchant: editMerchant, amount: Number(editAmount), category: editCategory });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditMerchant(merchant);
    setEditAmount(amount || 0);
    setEditCategory(category || 'Other');
    setIsEditing(false);
  };

  const renderCategoryList = [...categories, 'Other'];

  if (isEditing) {
    return (
      <div className="liquid-glass p-4 transition-all duration-300 border-l-4 border-[#10B981]">
        <div className="flex flex-col gap-3">
          <input
            type="text"
            value={editMerchant}
            onChange={e => setEditMerchant(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-[#10B981]"
            placeholder="Merchant name"
          />
          <div className="flex gap-2">
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 flex-1">
              <span className="text-[#9CA3AF] text-sm font-bold">
                {currency === 'INR' || currency === '₹' || !currency ? '₹' : currency}
              </span>
              <input
                type="number"
                value={editAmount}
                onChange={e => setEditAmount(e.target.value)}
                className="w-full bg-transparent py-1.5 pl-1.5 text-sm font-semibold text-white focus:outline-none"
                placeholder="Amount"
              />
            </div>
            <select
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="bg-[#0a0b12] border border-white/[0.08] rounded-lg px-2 text-xs font-semibold text-white focus:outline-none focus:border-[#10B981]"
            >
              {renderCategoryList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1">
            <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#9CA3AF] hover:text-white bg-white/[0.04] transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669] transition-colors shadow-sm">
              Save
              <Check size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dispCurrency = currency === '₹' || currency === 'INR' || !currency ? '₹' : currency + ' ';

  return (
    <div className="liquid-glass p-5 group transition-all duration-300 hover:border-white/[0.15]">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-white truncate">{merchant}</p>
            <p className="text-base font-extrabold text-[#10B981] ml-4 shrink-0">
              {dispCurrency}{(amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#4B5563]">{formattedDate}</p>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[10px] font-bold tracking-widest uppercase text-[#10B981]">
                {category || 'Uncategorized'}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-[#3B82F6]/10 text-[#6B7280] hover:text-[#3B82F6] transition-colors"
                    title="Edit Transaction"
                  >
                    <Edit2 size={11} strokeWidth={2.5} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-[#EF4444]/10 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                    title="Delete Transaction"
                  >
                    <Trash2 size={12} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
