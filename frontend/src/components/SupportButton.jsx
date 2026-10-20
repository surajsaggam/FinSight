import { useState } from 'react';
import { HelpCircle, X, Send, Mail, CheckCircle2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function SupportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) {
      addToast('Please enter your feedback or inquiry', 'error');
      return;
    }

    setSubmitted(true);
    addToast('Support inquiry sent successfully! Our team will respond shortly.', 'success');

    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      setEmail('');
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open support & feedback modal"
        className="fixed bottom-6 left-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-slate-800/90 hover:bg-emerald-600 text-slate-200 hover:text-white border border-slate-700/80 shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 print:hidden group"
      >
        <HelpCircle className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
        <span className="text-xs font-medium hidden sm:inline">Support & Feedback</span>
      </button>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-dialog-title"
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 relative text-slate-100"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support modal"
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 id="support-dialog-title" className="text-base font-semibold text-slate-100">
                  FinSight Support & Feedback
                </h3>
                <p className="text-xs text-slate-400">
                  Questions, suggestions, or need help with a scan?
                </p>
              </div>
            </div>

            {submitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-medium text-emerald-300">Message Delivered</h4>
                <p className="text-xs text-slate-400">Thank you for helping us improve FinSight.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Your Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Topic</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-800 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Feedback">Feedback & Suggestions</option>
                    <option value="OCR Issue">Issue with Receipt Scanning</option>
                    <option value="Question">General Question</option>
                    <option value="Privacy">Privacy & Data Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Message <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or suggestions..."
                    className="w-full rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <a
                    href="mailto:support@finsight.local"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>support@finsight.local</span>
                  </a>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium text-xs shadow-md transition-all active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
