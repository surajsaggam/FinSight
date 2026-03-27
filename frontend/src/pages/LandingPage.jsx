import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import {
  ArrowRight, ArrowUpRight, Sparkles, Camera, Brain, BarChart3,
  Upload, Shield, CheckCircle, MessageCircle, Send, ScanLine,
  TrendingUp, Github, Twitter
} from 'lucide-react';

/* ─── Scroll Reveal Hook ─── */
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('visible'); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

/* ─── SECTION: Hero ─── */
function HeroSection() {
  const barHeights = [40, 65, 50, 80, 45, 90, 70];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <section className="relative min-h-screen flex items-center" style={{ background: '#04050A' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 70% 45%, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />

      <div className="w-full max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-0 flex flex-col lg:flex-row items-center gap-16 lg:gap-12">

        {/* Left Block */}
        <div className="flex-1 lg:max-w-[52%] animate-fade-in-up">
          <h1 className="font-space font-extrabold text-4xl sm:text-5xl lg:text-[62px] leading-[1.1] tracking-tight text-white uppercase">
            Your Money.<br />Understood.
          </h1>
          <p className="mt-6 text-base text-[#9CA3AF] max-w-[380px] leading-[1.7]">
            Scan receipts, track every rupee, and let AI explain where your money actually goes.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#10B981] text-white font-semibold text-sm hover:bg-[#059669] hover:scale-[1.02] transition-all duration-300 animate-pulse-glow">
              <ScanLine className="w-4 h-4" /> Scan a Receipt
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/[0.22] text-white text-sm font-medium hover:bg-white/[0.06] transition-all duration-300">
              View Dashboard
            </Link>
          </div>

          {/* Stat Pills */}
          <div className="mt-10 flex flex-wrap gap-3">
            {['💚 AI-Powered Parsing', '📊 Live Dashboard', '💬 Smart Chat Assistant'].map(pill => (
              <span key={pill} className="px-4 py-1.5 rounded-full text-xs text-[#9CA3AF] bg-white/[0.05] border border-white/[0.07]">{pill}</span>
            ))}
          </div>
        </div>

        {/* Right Block — Cash Flow Card */}
        <div className="flex-1 lg:max-w-[48%] flex justify-center animate-fade-in-up delay-200">
          <div className="relative">
            {/* Ambient glow behind card */}
            <div className="absolute -inset-8 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 60% 40%, rgba(16,185,129,0.12) 0%, transparent 70%)' }} />

            <div className="liquid-glass w-full max-w-[420px] p-6 animate-float" style={{ background: 'rgba(8, 11, 18, 0.85)' }}>
              {/* Top row */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-space text-[13px] text-[#9CA3AF]">Cash Flow</span>
                <span className="flex items-center gap-1.5 text-[11px] text-[#10B981] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> Live
                </span>
              </div>

              {/* Balance */}
              <div className="mb-1">
                <span className="font-space font-bold text-[38px] text-white leading-tight">₹ 42,850</span>
              </div>
              <div className="flex items-center gap-1 mb-6">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#10B981]" />
                <span className="text-[13px] text-[#10B981]">+₹ 3,200 this month</span>
              </div>

              {/* Mini bar chart */}
              <div className="flex items-end gap-2 h-24 mb-2">
                {barHeights.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t"
                      style={{
                        height: `${h}%`,
                        background: 'linear-gradient(to top, #10B981, rgba(16,185,129,0.4))',
                        boxShadow: i === 5 ? '0 0 14px rgba(16,185,129,0.5)' : 'none',
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mb-5">
                {days.map(d => (
                  <span key={d} className="flex-1 text-center text-[10px] text-[#4B5563]">{d}</span>
                ))}
              </div>

              {/* Transactions */}
              {[
                { icon: '🛒', name: 'Grocery Store', date: 'Today', amount: '-₹ 640', color: '#EF4444' },
                { icon: '☕', name: 'Café Brew', date: 'Yesterday', amount: '-₹ 180', color: '#EF4444' },
                { icon: '💰', name: 'Salary Credit', date: '3 days ago', amount: '+₹ 45,000', color: '#10B981' },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{tx.icon}</span>
                    <div>
                      <div className="text-[13px] text-white">{tx.name}</div>
                      <div className="text-[11px] text-[#4B5563]">{tx.date}</div>
                    </div>
                  </div>
                  <span className="text-[13px] font-medium" style={{ color: tx.color }}>{tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Social Proof ─── */
function SocialProof() {
  const ref = useReveal();
  return (
    <section ref={ref} className="reveal py-10 lg:py-14 px-6 lg:px-16" style={{ background: '#060810' }}>
      <p className="text-center text-[11px] tracking-[0.14em] uppercase text-[#374151] font-medium">
        Trusted by people who take their finances seriously
      </p>
      <div className="mt-7 max-w-3xl mx-auto flex items-center justify-evenly">
        {[
          { value: '10,000+', label: 'Receipts Scanned' },
          { value: '₹ 2.4 Cr+', label: 'Amount Tracked' },
          { value: '99.2%', label: 'AI Accuracy' },
        ].map((s, i) => (
          <div key={i} className="flex items-center">
            {i > 0 && <div className="w-px h-10 bg-white/[0.07] mr-8 lg:mr-12 hidden sm:block" />}
            <div className={`text-center ${i > 0 ? 'ml-0 sm:ml-0' : ''}`}>
              <div className="font-space font-bold text-2xl lg:text-[28px] text-white">{s.value}</div>
              <div className="text-[13px] text-[#6B7280] mt-1">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── SECTION: How It Works ─── */
function HowItWorks() {
  const ref = useReveal();
  const steps = [
    { num: '01', icon: Camera, title: 'Scan Your Receipt', body: 'Drag and drop or upload any receipt image. Works with bills, invoices, and paper receipts.', glow: '#10B981' },
    { num: '02', icon: Brain, title: 'AI Extracts Everything', body: 'Gemini AI reads merchant name, date, total, and every line item — structured instantly.', glow: '#3B82F6' },
    { num: '03', icon: BarChart3, title: 'Track & Chat', body: 'Your dashboard updates live. Ask the AI assistant anything about your spending patterns.', glow: '#10B981' },
  ];

  return (
    <section className="py-20 px-6 lg:px-16 bg-white">
      <div ref={ref} className="reveal max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-space font-bold text-3xl lg:text-[40px] text-[#111111]">From Receipt to Insight in Seconds</h2>
          <p className="mt-3 text-base text-[#6B7280]">Three steps. Zero manual entry. Total clarity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="relative p-7 rounded-2xl" style={{ background: 'linear-gradient(145deg, #0f1420 0%, #0d1117 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span className="absolute top-5 right-5 font-space text-[11px] text-[#4B5563]">{s.num}</span>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${s.glow}15`, boxShadow: `0 0 20px ${s.glow}20` }}>
                <s.icon className="w-5 h-5" style={{ color: s.glow }} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-[13px] text-[#9CA3AF] leading-relaxed">{s.body}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 text-[#374151] text-lg z-10">→</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Features Grid ─── */
function FeaturesGrid() {
  const ref = useReveal();
  const features = [
    {
      title: 'AI Receipt Scanning',
      body: 'Snap or upload any receipt. Gemini Vision extracts every detail automatically.',
      visual: (
        <div className="mb-4 p-4 rounded-xl border-2 border-dashed border-[#10B981]/30 bg-[#10B981]/[0.03] flex flex-col items-center gap-2">
          <Upload className="w-6 h-6 text-[#10B981]/60" />
          <span className="text-[11px] text-[#4B5563]">Drop receipt here</span>
        </div>
      ),
    },
    {
      title: 'Live Expense Dashboard',
      body: 'Charts, totals, and category breakdowns that update every time you scan.',
      visual: (
        <div className="mb-4 flex items-end gap-1.5 h-16">
          {[35, 55, 45, 70, 60, 85, 50].map((h, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: 'linear-gradient(to top, #10B981, rgba(16,185,129,0.3))' }} />
          ))}
        </div>
      ),
    },
    {
      title: 'Chat With Your Finances',
      body: "Ask anything — 'What did I spend on food?' — and get instant data-driven answers.",
      visual: (
        <div className="mb-4 space-y-2">
          <div className="ml-auto max-w-[70%] px-3 py-2 rounded-xl bg-white/[0.06] text-[11px] text-[#9CA3AF] text-right">What did I spend on food?</div>
          <div className="flex items-start gap-1.5 max-w-[80%]">
            <div className="w-5 h-5 rounded-md bg-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-3 h-3 text-[#10B981]" />
            </div>
            <div className="px-3 py-2 rounded-xl bg-[#10B981]/[0.07] border border-[#10B981]/20 text-[11px] text-[#9CA3AF]">₹ 1,840 across 4 transactions this week.</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Session-Based Privacy',
      body: 'Your data lives in your session. Nothing stored, nothing shared, nothing leaked.',
      visual: (
        <div className="mb-4 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#10B981]/10 flex items-center justify-center" style={{ boxShadow: '0 0 30px rgba(16,185,129,0.15)' }}>
            <Shield className="w-7 h-7 text-[#10B981]" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-20 px-6 lg:px-16" style={{ background: '#04050A' }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-space font-bold text-3xl lg:text-[40px] text-white">Everything You Need to Master Your Money</h2>
          <p className="mt-3 text-base text-[#9CA3AF]">Built for people who want clarity, not complexity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {features.map((f, i) => (
            <div key={i} className="liquid-glass p-6">
              {f.visual}
              <h3 className="text-base font-semibold text-white mb-1.5">{f.title}</h3>
              <p className="text-[13px] text-[#9CA3AF] leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Chat Preview ─── */
function ChatPreview() {
  const ref = useReveal();
  return (
    <section className="py-20 px-6 lg:px-16" style={{ background: '#04050A' }}>
      <div ref={ref} className="reveal max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-14">

        {/* Left text */}
        <div className="flex-1 lg:max-w-[55%]">
          <h2 className="font-space font-bold text-2xl lg:text-[32px] text-white leading-tight">Your personal finance assistant, always ready</h2>
          <p className="mt-5 text-[15px] text-[#9CA3AF] leading-[1.75] max-w-lg">
            Stop wondering where your money went. FinSight connects every receipt to a full picture of your financial health — and lets you ask questions in plain English.
          </p>
          <Link to="/chat" className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-[#10B981] bg-[#10B981]/[0.12] border border-[#10B981]/30 hover:bg-[#10B981]/[0.20] transition-all duration-300">
            Try the Chat Assistant <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Right chat mockup */}
        <div className="flex-1 lg:max-w-[40%] w-full">
          <div className="liquid-glass p-5 max-w-[380px] mx-auto" style={{ background: 'rgba(8, 11, 18, 0.85)' }}>
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-white/[0.06]">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
              </div>
              <div>
                <span className="font-space text-sm text-white font-medium">FinSight AI</span>
                <div className="flex items-center gap-1 text-[10px] text-[#10B981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> Online
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="space-y-3 mb-4">
              <div className="ml-auto max-w-[80%] px-4 py-2.5 rounded-2xl bg-white/[0.06] text-[13px] text-white text-right">
                How much did I spend on food this week?
              </div>
              <div className="flex items-start gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-md bg-[#10B981]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#10B981]" />
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-[#10B981]/[0.07] border border-[#10B981]/20 text-[13px] text-[#d1d5db]">
                  You spent ₹ 1,840 on food this week across 4 transactions. That's 22% of your total weekly spend.
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <div className="flex-1 px-4 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[12px] text-[#4B5563]">Ask about your finances...</div>
              <div className="w-9 h-9 rounded-full bg-[#10B981]/15 flex items-center justify-center">
                <Send className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── SECTION: Final CTA ─── */
function CTASection() {
  const ref = useReveal();
  return (
    <section className="relative py-24 lg:py-28 px-6 lg:px-16" style={{ background: '#04050A' }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(16,185,129,0.10) 0%, transparent 70%)' }} />

      <div ref={ref} className="reveal relative max-w-2xl mx-auto text-center">
        <div className="w-12 h-12 rounded-xl liquid-glass-green flex items-center justify-center mx-auto mb-8">
          <ScanLine className="w-6 h-6 text-[#10B981]" />
        </div>

        <h2 className="font-space font-extrabold text-3xl sm:text-4xl lg:text-[52px] text-white leading-[1.1] max-w-[580px] mx-auto">
          Stop guessing.<br />Start knowing.
        </h2>
        <p className="mt-5 text-base text-[#9CA3AF] max-w-[440px] mx-auto">
          Upload your first receipt in seconds. No signup, no setup, no nonsense.
        </p>

        <Link to="/upload" className="mt-8 inline-flex items-center gap-2 px-9 py-3.5 rounded-full bg-[#10B981] text-white font-bold text-[15px] hover:bg-[#059669] hover:scale-[1.03] transition-all duration-300 animate-pulse-glow">
          Scan Your First Receipt
        </Link>
      </div>
    </section>
  );
}

/* ─── SECTION: Footer ─── */
function Footer() {
  return (
    <footer className="pt-14 pb-8 px-6 lg:px-16 border-t border-white/[0.06]" style={{ background: '#06060E' }}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-[#10B981]/15 border border-[#10B981]/25 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              </div>
              <span className="font-space font-bold text-white text-sm">FinSight</span>
            </div>
            <p className="text-sm text-[#6B7280] max-w-[210px] leading-relaxed">AI-powered expense tracking for the financially aware.</p>
          </div>

          {/* Navigate */}
          <div>
            <h4 className="font-space font-semibold text-[13px] text-[#9CA3AF] mb-4">Navigate</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Upload Receipt', to: '/upload' },
                { label: 'Dashboard', to: '/dashboard' },
                { label: 'Chat Assistant', to: '/chat' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-[#6B7280] hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-space font-semibold text-[13px] text-[#9CA3AF] mb-4">Product</h4>
            <ul className="space-y-2.5">
              {['How It Works', 'Features', 'Privacy', 'Open Source'].map(l => (
                <li key={l}>
                  <span className="text-sm text-[#6B7280] hover:text-white transition-colors cursor-pointer">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[12px] text-[#4B5563]">© 2025 FinSight. Built with Gemini AI.</span>
          <div className="flex items-center gap-4">
            <Github className="w-[18px] h-[18px] text-[#6B7280] hover:text-white transition-colors cursor-pointer" />
            <Twitter className="w-[18px] h-[18px] text-[#6B7280] hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Main Landing Page ─── */
export default function LandingPage() {
  return (
    <div>
      <HeroSection />
      <SocialProof />
      <HowItWorks />
      <FeaturesGrid />
      <ChatPreview />
      <CTASection />
      <Footer />
    </div>
  );
}
