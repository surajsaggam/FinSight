const styleMap = {
  warning: {
    borderColor: 'border-amber-500',
    bgColor: 'bg-amber-500/5',
    textColor: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-200 dark:border-amber-500/20',
  },
  danger: {
    borderColor: 'border-red-500',
    bgColor: 'bg-red-500/5',
    textColor: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-500/10 border-red-200 dark:border-red-500/20',
  },
  success: {
    borderColor: 'border-emerald-500',
    bgColor: 'bg-emerald-500/5',
    textColor: 'text-emerald-600 dark:text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20',
  },
  info: {
    borderColor: 'border-blue-500',
    bgColor: 'bg-blue-500/5',
    textColor: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-500/10 border-blue-200 dark:border-blue-500/20',
  },
};

export default function InsightCard({ type, title, message, icon }) {
  const style = styleMap[type] || styleMap.info;
  
  return (
    <div className={`glass-panel p-5 border-l-4 ${style.borderColor} flex gap-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-default group`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${style.iconBg} transition-transform duration-300 group-hover:scale-110`}>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold tracking-wide ${style.textColor}`}>
          {title}
        </h4>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
