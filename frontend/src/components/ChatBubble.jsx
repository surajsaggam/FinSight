import { Sparkles, User } from 'lucide-react';

export default function ChatBubble({ message, isBot }) {
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
        ${isBot
          ? 'bg-[#10B981]/15 border border-[#10B981]/25'
          : 'bg-white/[0.06] border border-white/[0.08]'
        }`}
      >
        {isBot
          ? <Sparkles className="w-5 h-5 text-[#10B981]" />
          : <User className="w-5 h-5 text-[#9CA3AF]" />
        }
      </div>
      <div className={`max-w-[75%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed font-medium
        ${isBot
          ? 'bg-[#10B981]/[0.07] border border-[#10B981]/20 text-[#d1d5db] rounded-tl-md'
          : 'bg-white/[0.06] border border-white/[0.08] text-white rounded-tr-md'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.replace(/\*\*/g, '')}</p>
      </div>
    </div>
  );
}
