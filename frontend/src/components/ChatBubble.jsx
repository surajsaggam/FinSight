import { Bot, User } from 'lucide-react';

export default function ChatBubble({ message, isBot }) {
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-gray-200 dark:border-white/5
        ${isBot
          ? 'bg-[#C68346]'
          : 'bg-gray-100 dark:bg-[#0f0f13]'
        }`}
      >
        {isBot
          ? <Bot className="w-5 h-5 text-white" />
          : <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        }
      </div>
      <div className={`max-w-[75%] rounded-3xl px-6 py-4 text-[13px] leading-relaxed shadow-sm font-medium tracking-wide
        ${isBot
          ? 'bg-white dark:bg-[#0f0f13] text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-white/[0.05] rounded-tl-md'
          : 'bg-[#C68346] text-white rounded-tr-md font-semibold'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.replace(/\*\*/g, '')}</p>
      </div>
    </div>
  );
}
