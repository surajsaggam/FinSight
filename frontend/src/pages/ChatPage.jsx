import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Bot, User, ArrowRight } from 'lucide-react';
import { chatResponses } from '../data/dummyData';

const quickQuestions = [
  'How much did I spend on food?',
  'What is my biggest expense?',
  'Am I within my budget?',
  'Show spending by category',
  'Compare this month with last month',
];

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! I\'m your **FinSight AI** assistant. Ask me anything about your finances — I analyze your live dashboard data in real-time! 💰', isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');
      const monthlyBudget = sessionStorage.getItem('monthlyBudget') || 50000;

      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          transactions: transactions,
          monthlyBudget: monthlyBudget
        })
      });

      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, text: data.reply, isBot: true }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "Error connecting to AI. Please check your server.", isBot: true }]);
    }

    setIsTyping(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-fade-in-up">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 pb-8 px-4 gap-6 py-6">
        {/* Header Block */}
        <div className="liquid-glass px-6 py-5 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center shadow-lg shadow-[#10B981]/10">
              <Sparkles className="w-6 h-6 text-[#10B981]" />
            </div>
            <div>
              <h1 className="font-space text-lg font-semibold tracking-tight text-white">FinSight Assistant</h1>
              <p className="text-xs text-[#10B981] font-medium tracking-tight mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>Online</p>
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full">
            Gemini 3 Flash
          </div>
        </div>

        {/* Messages Block */}
        <div className="flex-1 overflow-y-auto px-6 py-8 liquid-glass min-h-[400px]">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 animate-fade-in-up ${msg.isBot ? '' : 'flex-row-reverse'}`}>
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${msg.isBot ? 'bg-gradient-to-br from-[#C68346] to-[#8B5E3C]' : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10'}`}>
                  {msg.isBot ? <Bot className="w-4.5 h-4.5 text-white" /> : <User className="w-4.5 h-4.5 text-gray-500 dark:text-gray-400" />}
                </div>
                {/* Bubble */}
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed font-medium transition-all duration-300 ${
                  msg.isBot 
                    ? 'bg-white dark:bg-[#161616] border border-gray-100 dark:border-white/5 text-gray-700 dark:text-gray-300 shadow-sm' 
                    : 'bg-[#C68346] text-white shadow-md shadow-[#C68346]/20'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-10 h-10 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="bg-[#10B981]/[0.07] border border-[#10B981]/20 rounded-2xl p-4 flex items-center justify-center min-w-[60px] max-h-[46px]">
                  <div className="flex gap-1.5 px-4 py-3">
                    <div className="w-2 h-2 rounded-full bg-[#10B981]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#10B981]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#10B981]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>
        </div>
      </div>

      {/* Bottom Input Section */}
      <div className="w-full max-w-4xl mx-auto px-4 pb-10 space-y-4">
        {/* Quick Questions */}
        <div className="liquid-glass px-6 py-4">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="shrink-0 px-5 py-2.5 rounded-full text-[13px] font-medium tracking-tight bg-white/[0.02] border border-white/[0.06] text-[#9CA3AF] hover:border-[#10B981]/30 hover:text-[#10B981] hover:bg-[#10B981]/5 transition-all duration-300 hover:-translate-y-0.5"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="liquid-glass px-4 py-5 shadow-xl shadow-[#10B981]/5">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 px-6 py-4 rounded-full bg-white/[0.03] text-white placeholder-[#4B5563] text-sm font-semibold tracking-wide border border-white/[0.06] focus:border-[#10B981]/40 focus:bg-white/[0.05] focus:outline-none transition-all duration-300"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-8 py-4 rounded-full bg-[#10B981] text-white font-semibold flex items-center justify-center hover:bg-[#059669] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group"
              >
                <Send className="w-5 h-5 group-hover:scale-110 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
