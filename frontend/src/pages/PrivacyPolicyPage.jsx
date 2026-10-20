import { Link } from 'react-router-dom';
import { Shield, Lock, Trash2, EyeOff, Server, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: EyeOff,
      title: '1. Session-Based Privacy By Design',
      body: 'FinSight is architected with a privacy-first, stateless approach. Your financial transactions, monthly budget preferences, and analytics stay exclusively inside your browser session (sessionStorage). We do not maintain a centralized database of user accounts or personal financial histories.',
    },
    {
      icon: Trash2,
      title: '2. Zero Permanent Receipt Image Storage',
      body: 'When you upload a receipt photo for scanning, the image is temporarily processed in memory/disk only for the few seconds required for AI extraction and is immediately deleted from our server (via automatic file unlinking) as soon as structured data is returned.',
    },
    {
      icon: Server,
      title: '3. AI Processing (Google Gemini API)',
      body: 'Receipt text extraction and financial chat responses are powered by Google Gemini AI. Only the receipt image being scanned or the current session transaction summary is transmitted over encrypted HTTPS to generate your insights. No personally identifiable account credentials are attached.',
    },
    {
      icon: Lock,
      title: '4. Full User Control & Instant Data Erasure',
      body: 'You have complete ownership of your data. You can export your session transactions to CSV or JSON at any time, delete individual transactions, or click "Clear Session Data" on the Dashboard to permanently wipe all stored records from your browser.',
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
            <Shield className="w-6 h-6 text-[#10B981]" />
          </div>
          <div>
            <h1 className="font-space text-3xl sm:text-4xl font-bold text-white">Privacy Policy</h1>
            <p className="text-xs text-[#6B7280] mt-1">Last updated: October 2026</p>
          </div>
        </div>

        <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8">
          At FinSight, we believe you shouldn't have to surrender your financial privacy just to understand your spending. Here is exactly how your data is handled.
        </p>

        <div className="space-y-4">
          {sections.map((s, idx) => (
            <div key={idx} className="liquid-glass p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <s.icon className="w-5 h-5 text-[#10B981]" />
                </div>
                <div>
                  <h2 className="font-space text-base font-bold text-white mb-2">{s.title}</h2>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
