import { AlertTriangle, TrendingDown, TrendingUp, Lightbulb } from 'lucide-react';

const styleMap = {
  warning: {
    borderColor: 'border-[#C68346]',
    textColor: 'text-[#C68346]',
  },
  danger: {
    borderColor: 'border-[#8B5E3C]',
    textColor: 'text-[#8B5E3C]',
  },
  success: {
    borderColor: 'border-[#E0A96D]',
    textColor: 'text-[#E0A96D]',
  },
  info: {
    borderColor: 'border-[#D6B98C]',
    textColor: 'text-[#D6B98C]',
  },
};

export default function InsightCard({ type, title, message, icon }) {
  return (
    <div className={`glass-panel p-5 border-l-4 ${styleMap[type].borderColor} flex gap-4 transition-all duration-300 hover:scale-[1.01]`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white dark:bg-[#050505] shadow-sm border border-gray-200 dark:border-white/5`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div>
        <h4 className={`text-sm font-bold tracking-wide ${styleMap[type].textColor}`}>
          {title}
        </h4>
        <p className="text-sm font-medium text-gray-400 mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
