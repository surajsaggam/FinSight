import { Calendar, DollarSign } from 'lucide-react';

export default function ExpenseCard({ merchant, amount, date, category, icon }) {
  const formattedDate = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <div className="glass-panel p-5 group transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#1a1b26]/50 border border-white/5 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-gray-900 dark:text-white truncate">{merchant}</p>
            <p className="text-base font-extrabold text-[#C68346] ml-4 flex-shrink-0">₹{amount.toLocaleString()}</p>
          </div>
          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] font-bold tracking-widest uppercase text-gray-500">{formattedDate}</p>
            <span className="px-2 py-0.5 rounded-full bg-[#C68346]/10 text-[10px] font-bold tracking-widest uppercase text-[#C68346]">
              {category}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
