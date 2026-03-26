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

      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, transactions })
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
    <div className="w-full flex-1 flex flex-col bg-transparent animate-fade-in-up">
      <div className="max-w-4xl mx-auto w-full flex flex-col flex-1 pb-8 px-4 gap-5 py-6">
        
        {/* Header */}
        <div className="glass-panel px-6 py-5 z-10 shadow-lg shadow-black/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#C68346] to-[#8B5E3C] flex items-center justify-center shadow-lg shadow-[#C68346]/20 relative">
              <Sparkles className="w-6 h-6 text-white" />
              {/* Online pulse */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-[#111111]">
                <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">FinSight Assistant</h1>
              <p className="text-xs text-green-500 font-semibold tracking-tight mt-0.5">Active • Analyzing your data</p>
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1.5 rounded-full">
            Gemini 3 Flash
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-2 sm:px-6 py-8 glass-panel shadow-lg shadow-black/5 min-h-[400px]">
          <div className="max-w-3xl mx-auto space-y-5">
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
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#C68346] to-[#8B5E3C] flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="bg-white dark:bg-[#161616] rounded-2xl p-4 border border-gray-100 dark:border-white/5 shadow-sm flex items-center min-w-[70px]">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#C68346]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#C68346]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-[#C68346]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
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
        <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide px-1">
          {quickQuestions.map((q) => (
            <button
              key={q}
              onClick={() => sendMessage(q)}
              className="shrink-0 px-4 py-2.5 rounded-xl text-[12px] font-semibold tracking-tight bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/[0.06] text-gray-600 dark:text-gray-400 hover:border-[#C68346]/40 hover:text-[#C68346] hover:bg-[#C68346]/5 transition-all duration-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md flex items-center gap-1.5 group"
            >
              {q}
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="glass-panel px-4 py-4 shadow-xl shadow-[#C68346]/5">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-semibold tracking-wide border border-gray-200 dark:border-white/5 focus:border-[#C68346]/40 focus:bg-white dark:focus:bg-[#111111] focus:outline-none transition-all duration-300 focus:shadow-lg focus:shadow-[#C68346]/5"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-6 py-4 rounded-2xl btn-primary group flex items-center justify-center hover:shadow-xl hover:shadow-[#C68346]/25"
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
