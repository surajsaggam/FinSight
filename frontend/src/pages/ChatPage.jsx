import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, RotateCcw, ScanLine, AlertCircle } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import { sendChatMessage } from '../utils/api';
import { trackEvent } from '../utils/analytics';

const quickQuestions = [
  'How much did I spend on food?',
  'What is my biggest expense?',
  'Am I within my budget?',
  'Show spending by category',
  'Give me 3 tips to save money this month',
];

const INITIAL_MESSAGE = {
  id: 1,
  text: "Hi! I'm your FinSight AI assistant. Ask me anything about your finances — I analyze your live dashboard data in real-time! 💰",
  isBot: true,
};

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [txCount, setTxCount] = useState(0);
  const endRef = useRef(null);

  useEffect(() => {
    try {
      const tx = JSON.parse(sessionStorage.getItem('transactions') || '[]');
      setTxCount(Array.isArray(tx) ? tx.length : 0);
    } catch {
      setTxCount(0);
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (rawText) => {
    const text = rawText.trim();
    if (!text || isTyping) return;

    if (text.length > 500) {
      setErrorBanner('Please keep your question under 500 characters.');
      return;
    }

    setErrorBanner('');
    const userMsg = { id: Date.now(), text, isBot: false };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    trackEvent('chat_message_sent', { length: text.length });

    try {
      const transactions = JSON.parse(sessionStorage.getItem('transactions') || '[]');
      const monthlyBudget = Number(sessionStorage.getItem('monthlyBudget')) || 50000;

      const reply = await sendChatMessage({
        message: text,
        transactions,
        monthlyBudget,
      });

      setMessages((prev) => [...prev, { id: Date.now() + 1, text: reply, isBot: true }]);
    } catch (err) {
      console.error('Chat error:', err);
      setErrorBanner(err.message || 'Unable to reach FinSight AI assistant.');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: err.message || 'Error connecting to AI. Please verify the backend server is running.',
          isBot: true,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
    setErrorBanner('');
    trackEvent('chat_history_cleared');
  };

  return (
    <div className="w-full flex-1 flex flex-col animate-fade-in-up">
      <div className="max-w-5xl mx-auto w-full flex flex-col flex-1 pb-8 px-4 gap-5 py-6">
        {/* Header Block */}
        <div className="liquid-glass px-6 py-4 z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center shadow-lg shadow-[#10B981]/10">
              <Sparkles className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <h1 className="font-space text-lg font-semibold tracking-tight text-white">FinSight Assistant</h1>
              <p className="text-xs text-[#10B981] font-medium tracking-tight mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Online • Analyzing {txCount} {txCount === 1 ? 'receipt' : 'receipts'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9CA3AF] bg-white/5 px-3 py-1.5 rounded-full border border-white/[0.06]">
              Gemini AI
            </span>
            {messages.length > 1 && (
              <button
                onClick={handleResetChat}
                title="Clear conversation"
                className="p-2 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Empty Session Notice */}
        {txCount === 0 && (
          <div className="px-5 py-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs text-[#9CA3AF]">
            <span>You haven&apos;t added any receipts yet. Add receipts or load sample data on the Dashboard for personalized answers!</span>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-3.5 py-1.5 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-semibold flex items-center gap-1.5 hover:bg-[#10B981]/25 transition-colors cursor-pointer"
            >
              <ScanLine size={12} />
              Go to Dashboard
            </button>
          </div>
        )}

        {/* Messages Block */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-8 liquid-glass min-h-[380px] max-h-[55vh]">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg.text} isBot={msg.isBot} />
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
      <div className="w-full max-w-5xl mx-auto px-4 pb-10 space-y-4">
        {errorBanner && (
          <div className="px-4 py-2.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/25 text-[#EF4444] text-xs flex items-center gap-2">
            <AlertCircle size={14} className="shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Quick Questions */}
        <div className="liquid-glass px-5 py-3.5">
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {quickQuestions.map((q) => (
              <button
                key={q}
                disabled={isTyping}
                onClick={() => sendMessage(q)}
                className="shrink-0 px-4 py-2 rounded-full text-xs font-medium tracking-tight bg-white/[0.02] border border-white/[0.06] text-[#9CA3AF] hover:border-[#10B981]/30 hover:text-[#10B981] hover:bg-[#10B981]/5 transition-all duration-300 disabled:opacity-40 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Field */}
        <div className="liquid-glass px-4 py-4 shadow-xl shadow-[#10B981]/5">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-3">
              <input
                type="text"
                maxLength={500}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about your finances (up to 500 chars)..."
                className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.03] text-white placeholder-[#4B5563] text-sm font-medium tracking-wide border border-white/[0.06] focus:border-[#10B981]/40 focus:bg-white/[0.05] focus:outline-none transition-all duration-300"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-6 sm:px-8 py-3.5 rounded-full bg-[#10B981] text-white font-semibold flex items-center justify-center hover:bg-[#059669] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed group cursor-pointer"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
