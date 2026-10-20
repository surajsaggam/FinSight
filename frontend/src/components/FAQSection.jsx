import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: 'How does FinSight process receipts without keeping my data?',
    a: 'FinSight operates on a privacy-first, session-only architecture. Your scanned receipts are parsed in-memory using OCR and local AI extraction. When your browser session ends or when you click "Clear All Data", all receipts and transaction logs are immediately purged.',
  },
  {
    q: 'What receipt formats are supported for upload?',
    a: 'You can upload receipts in JPG, PNG, WEBP, and PDF formats. Clean, well-lit receipts yield the fastest and most accurate extraction results.',
  },
  {
    q: 'Can I export my scanned receipts and expenses?',
    a: 'Yes! From the Dashboard, you can export your entire parsed transaction history to a CSV spreadsheet at any time with a single click.',
  },
  {
    q: 'How do budget targets and alerts work?',
    a: 'You can set a monthly spending budget in the Dashboard. FinSight dynamically calculates your total spend, remaining balance, and daily average, showing visual alert badges when spending exceeds 75% or 100% of your budget.',
  },
  {
    q: 'What is the FinSight AI Advisor?',
    a: 'The AI Advisor analyzes your parsed receipts to identify recurring subscriptions, suggest potential tax-deductible items, and offer recommendations to optimize your monthly spending habits.',
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (idx) => {
    setOpenIndex((curr) => (curr === idx ? null : idx));
  };

  return (
    <section className="py-20 border-t border-slate-800/80 bg-slate-950/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
            Everything you need to know
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Got questions about FinSight? Here are the most common questions our users ask.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-slate-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-medium text-slate-200 hover:text-emerald-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-emerald-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
