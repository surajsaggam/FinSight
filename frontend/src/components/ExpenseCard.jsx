import { useState } from 'react';
import { Trash2, Edit2, Check, X } from 'lucide-react';
import { categories, CATEGORY_EMOJIS } from '../data/dummyData';

export default function ExpenseCard({ id, merchant, amount, date, category, currency, icon, onDelete, onEdit }) {
  const parsedDate = date ? new Date(date) : null;
  const formattedDate =
    parsedDate && !isNaN(parsedDate.getTime())
      ? parsedDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      : date || 'Unknown Date';

  const [isEditing, setIsEditing] = useState(false);
  const [editMerchant, setEditMerchant] = useState(merchant || '');
  const [editAmount, setEditAmount] = useState(amount ?? 0);
  const [editCategory, setEditCategory] = useState(category || 'Other');
  const [validationError, setValidationError] = useState('');

  const handleSave = () => {
    const trimmedMerchant = String(editMerchant || '').trim();
    const numericAmount = Number(editAmount);

    if (!trimmedMerchant) {
      setValidationError('Merchant name is required.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setValidationError('Amount must be greater than 0.');
      return;
    }

    setValidationError('');
    if (onEdit) {
      onEdit(id, {
        merchant: trimmedMerchant.slice(0, 80),
        amount: Number(numericAmount.toFixed(2)),
        category: editCategory,
        icon: CATEGORY_EMOJIS[editCategory] || icon || '📦',
      });
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditMerchant(merchant || '');
    setEditAmount(amount ?? 0);
    setEditCategory(category || 'Other');
    setValidationError('');
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
            maxLength={80}
            onChange={(e) => {
              setEditMerchant(e.target.value);
              if (validationError) setValidationError('');
            }}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:outline-none focus:border-[#10B981]"
            placeholder="Merchant name"
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 flex-1">
              <span className="text-[#9CA3AF] text-sm font-bold">
                {currency === 'INR' || currency === '₹' || !currency ? '₹' : currency}
              </span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={editAmount}
                onChange={(e) => {
                  setEditAmount(e.target.value);
                  if (validationError) setValidationError('');
                }}
                className="w-full bg-transparent py-1.5 pl-1.5 text-sm font-semibold text-white focus:outline-none"
                placeholder="Amount"
              />
            </div>
            <select
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="bg-[#0a0b12] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs font-semibold text-white focus:outline-none focus:border-[#10B981]"
            >
              {renderCategoryList.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {validationError && (
            <p className="text-[11px] font-semibold text-[#EF4444]">{validationError}</p>
          )}
          <div className="flex items-center justify-end gap-2 mt-1">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#9CA3AF] hover:text-white bg-white/[0.04] transition-colors"
            >
              <X size={13} />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669] transition-colors shadow-sm"
            >
              Save
              <Check size={14} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const dispCurrency = currency === '₹' || currency === 'INR' || !currency ? '₹' : `${currency} `;
  const displayIcon = icon || CATEGORY_EMOJIS[category] || '📦';

  return (
    <div className="liquid-glass p-4 sm:p-5 group transition-all duration-300 hover:border-white/[0.15]">
      <div className="flex items-center gap-3.5 sm:gap-4">
        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
          <span className="text-xl sm:text-2xl">{displayIcon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm sm:text-base font-bold text-white truncate">{merchant}</p>
            <p className="text-sm sm:text-base font-extrabold text-[#10B981] shrink-0 tabular-nums">
              {dispCurrency}
              {Number(amount || 0).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center justify-between mt-1.5 gap-2">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#6B7280] truncate">
              {formattedDate}
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded-full bg-[#10B981]/10 border border-[#10B981]/20 text-[10px] font-bold tracking-widest uppercase text-[#10B981]">
                {category || 'Other'}
              </span>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                {onEdit && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-[#3B82F6]/15 text-[#9CA3AF] hover:text-[#3B82F6] transition-colors"
                    title="Edit Transaction"
                    aria-label={`Edit ${merchant}`}
                  >
                    <Edit2 size={11} strokeWidth={2.5} />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(id)}
                    className="w-6 h-6 rounded-full flex items-center justify-center bg-white/[0.05] hover:bg-[#EF4444]/15 text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
                    title="Delete Transaction"
                    aria-label={`Delete ${merchant}`}
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

