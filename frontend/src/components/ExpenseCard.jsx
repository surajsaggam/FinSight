import { useState } from 'react';
import { Calendar, DollarSign, Trash2, Edit2, Check, X } from 'lucide-react';
import { categories } from '../data/dummyData';

export default function ExpenseCard({ id, merchant, amount, date, category, currency, icon, onDelete, onEdit }) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const [isEditing, setIsEditing] = useState(false);
  const [editMerchant, setEditMerchant] = useState(merchant);
  const [editAmount, setEditAmount] = useState(amount || 0);
  const [editCategory, setEditCategory] = useState(category || 'Other');

  // Handle saving the edits back to parent Component
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
      <div className="glass-panel p-4 transition-all duration-300 border-l-4 border-[#C68346]">
        <div className="flex flex-col gap-3">
          {/* Top Row: Merchant Name */}
          <input 
            type="text" 
            value={editMerchant} 
            onChange={e => setEditMerchant(e.target.value)} 
            className="w-full bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#C68346]"
            placeholder="Merchant name"
          />
          
          {/* Middle Row: Amount and Category */}
          <div className="flex gap-2">
            <div className="flex items-center bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg px-3 flex-1">
               <span className="text-gray-400 text-sm font-bold">
                 {currency === 'INR' || currency === '₹' || !currency ? '₹' : currency}
               </span>
               <input 
                 type="number" 
                 value={editAmount} 
                 onChange={e => setEditAmount(e.target.value)} 
                 className="w-full bg-transparent py-1.5 pl-1.5 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none"
                 placeholder="Amount"
               />
            </div>
            <select
              value={editCategory}
              onChange={e => setEditCategory(e.target.value)}
              className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-white/10 rounded-lg px-2 text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:border-[#C68346]"
            >
              {renderCategoryList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Bottom Row: Actions */}
          <div className="flex items-center justify-end gap-2 mt-1">
            <button onClick={cancelEdit} className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 bg-gray-100 dark:bg-white/5 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-green-500 hover:bg-green-600 transition-colors shadow-sm">
              Save
              <Check size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal Card Rendering
  const dispCurrency = currency === '₹' || currency === 'INR' || !currency ? '₹' : currency + ' ';

  return (
    <div className="glass-panel p-5 group transition-all duration-300">
      <div className="flex items-center gap-4">
        
        {/* Icon Container */}
        <div className="w-12 h-12 rounded-2xl bg-[#1a1b26]/50 border border-white/5 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <span className="text-2xl">{icon}</span>
        </div>
        
        {/* Content Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-gray-900 dark:text-white truncate">{merchant}</p>
            <p className="text-base font-extrabold text-[#C68346] ml-4 shrink-0">
              {dispCurrency}{(amount || 0).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500">{formattedDate}</p>
            
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-[#C68346]/10 text-[10px] font-bold tracking-widest uppercase text-[#C68346]">
                {category || 'Uncategorized'}
              </span>
              
              {/* Action Buttons Container (Hidden until hover) */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/[0.05] hover:bg-blue-50 dark:hover:bg-blue-500/10 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit Transaction"
                  >
                    <Edit2 size={11} strokeWidth={2.5} />
                  </button>
                )}
                {onDelete && (
                  <button 
                    onClick={() => onDelete(id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/[0.05] hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-colors"
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
