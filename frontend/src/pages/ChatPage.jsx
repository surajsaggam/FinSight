import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { chatResponses } from '../data/dummyData';

const quickQuestions = Object.keys(chatResponses);

export default function ChatPage() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! I\'m your FinSight AI assistant. Ask me anything about your finances! 💰', isBot: true },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (text) => {
    console.log("Sending message:", text);

    if (!text.trim()) return;

    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');

      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: text,
          transactions: transactions
        })
      });

      const data = await res.json();

      const botMsg = {
        id: Date.now() + 1,
        text: data.reply,
        isBot: true
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "Error connecting to AI",
        isBot: true
      }]);
    }

    setIsTyping(false);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-transparent animate-fade-in-up">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 pb-8 px-4 gap-6 py-6">
        {/* Header Block */}
        <div className="glass-panel px-6 py-5 z-10 shadow-lg shadow-black/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C68346] flex items-center justify-center shadow-lg shadow-[#C68346]/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">FinSight Assistant</h1>
              <p className="text-xs text-[#C68346] font-medium tracking-tight mt-0.5 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[#C68346]"></span>Online</p>
            </div>
          </div>
        </div>

        {/* Messages Block */}
        <div className="flex-1 overflow-y-auto px-6 py-8 glass-panel shadow-lg shadow-black/5 min-h-[400px]">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
            ))}

            {isTyping && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-10 h-10 rounded-2xl bg-[#C68346] flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white dark:bg-[#0f0f13] rounded-2xl p-4 border border-gray-200 dark:border-white/[0.05] shadow-sm flex items-center justify-center min-w-[60px] max-h-[46px]">
                  <div className="flex gap-1.5 px-4 py-3">
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

      {/* Input Section - Separated */}
      <div className="w-full max-w-5xl mx-auto px-4 pb-12 space-y-4">
        {/* Quick Questions */}
        <div className="glass-panel px-6 py-4 shadow-md shadow-black/5">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="shrink-0 px-5 py-2.5 rounded-full text-[13px] font-medium tracking-tight bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/[0.05] text-gray-600 dark:text-gray-400 hover:border-[#C68346]/30 hover:text-[#C68346] hover:bg-[#C68346]/10 transition-all duration-300 shadow-sm hover:-translate-y-0.5"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="glass-panel px-4 py-5 shadow-xl shadow-[#C68346]/5">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances..."
                className="flex-1 px-6 py-4 rounded-full bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-semibold tracking-wide border border-gray-200 dark:border-white/5 focus:border-[#C68346]/40 focus:bg-white dark:focus:bg-[#0a0a0a] focus:outline-none transition-all duration-300 shadow-inner"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-8 py-4 !rounded-full btn-primary group flex items-center justify-center"
              >
                <Send className="w-5 h-5 group-hover:scale-110 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
