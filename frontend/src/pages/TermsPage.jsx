import { Link } from 'react-router-dom';
import { FileText, AlertCircle, Scale, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  const clauses = [
    {
      icon: AlertCircle,
      title: '1. Informational Purposes Only (Not Financial Advice)',
      body: 'FinSight provides automated receipt extraction, machine-learning spending forecasts, and AI-generated chat insights strictly for informational and personal budgeting purposes. Nothing in FinSight constitutes certified financial, investment, legal, or tax advice.',
    },
    {
      icon: FileText,
      title: '2. AI Extraction & Forecast Accuracy',
      body: 'While FinSight uses structured schemas and validation to parse receipts accurately, optical character recognition (OCR) and AI models may occasionally misread faded receipts, handwritten totals, or foreign currencies. Users can review, categorize, and edit any transaction directly on the Dashboard.',
    },
    {
      icon: ShieldCheck,
      title: '3. Acceptable Use & Rate Limits',
      body: 'To keep the service fast and reliable for everyone, API endpoints are protected by automated rate limiting and file validation (maximum 10MB per image in JPG, PNG, or WEBP format). Automated scraping, abuse, or uploading non-receipt malicious payloads is prohibited.',
    },
    {
      icon: Scale,
      title: '4. Session Storage Responsibility',
      body: 'Because FinSight stores your transaction list in your browser session for privacy, closing your browser tab or clearing browser storage will reset your session unless you export your data. We recommend using the Export CSV/JSON feature on the Dashboard to keep personal backups.',
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-16 max-w-4xl mx-auto">
      <div className="animate-fade-in-up">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-center justify-center">
            <FileText className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h1 className="font-space text-3xl sm:text-4xl font-bold text-white">Terms & Conditions</h1>
            <p className="text-xs text-[#6B7280] mt-1">Effective Date: October 2026</p>
          </div>
        </div>

        <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8">
          By using FinSight, you agree to the following terms governing the use of our AI receipt scanner, ML analytics dashboard, and financial chat assistant.
        </p>

        <div className="space-y-4">
          {clauses.map((c, idx) => (
            <div key={idx} className="liquid-glass p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <c.icon className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <h2 className="font-space text-base font-bold text-white mb-2">{c.title}</h2>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{c.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
