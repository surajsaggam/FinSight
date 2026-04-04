const styleMap = {
  warning: { borderColor: 'border-[#f59e0b]', textColor: 'text-[#f59e0b]' },
  danger:  { borderColor: 'border-[#EF4444]', textColor: 'text-[#EF4444]' },
  success: { borderColor: 'border-[#10B981]', textColor: 'text-[#10B981]' },
  info:    { borderColor: 'border-[#3B82F6]', textColor: 'text-[#3B82F6]' },
};

export default function InsightCard({ type, title, message, icon }) {
  const style = styleMap[type] || styleMap.info;
  
  return (
    <div className={`liquid-glass p-5 border-l-4 ${styleMap[type].borderColor} flex gap-4 transition-all duration-300 hover:border-white/[0.15]`}>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/[0.04] border border-white/[0.08]">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-bold tracking-wide ${style.textColor}`}>
          {title}
        </h4>
        <p className="text-sm font-medium text-[#9CA3AF] mt-1 leading-relaxed">
          {message}
        </p>
      </div>
    </div>
  );
}
