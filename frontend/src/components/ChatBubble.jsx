import { useState } from 'react';
import { Sparkles, User, Copy, Check } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

export default function ChatBubble({ message, isBot }) {
  const [copied, setCopied] = useState(false);

  const cleanText = message.replace(/\*\*/g, '');

  const handleCopy = async () => {
    const success = await copyToClipboard(cleanText);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`flex gap-3 group ${isBot ? '' : 'flex-row-reverse'}`}>
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
          isBot
            ? 'bg-emerald-500/15 border border-emerald-500/25'
            : 'bg-white/[0.06] border border-white/[0.08]'
        }`}
      >
        {isBot ? (
          <Sparkles className="w-5 h-5 text-emerald-400" />
        ) : (
          <User className="w-5 h-5 text-slate-400" />
        )}
      </div>

      <div
        className={`relative max-w-[80%] rounded-2xl px-5 py-3.5 text-[13px] leading-relaxed font-medium ${
          isBot
            ? 'bg-emerald-500/[0.07] border border-emerald-500/20 text-slate-200 rounded-tl-md'
            : 'bg-white/[0.06] border border-white/[0.08] text-white rounded-tr-md'
        }`}
      >
        <p className="whitespace-pre-wrap pr-4">{cleanText}</p>

        {isBot && (
          <button
            type="button"
            onClick={handleCopy}
            title={copied ? 'Copied' : 'Copy message'}
            aria-label="Copy AI message"
            className="absolute top-2.5 right-2 p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
