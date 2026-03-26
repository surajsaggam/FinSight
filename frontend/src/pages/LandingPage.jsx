import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Receipt, BarChart3, Activity } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center relative overflow-hidden">

      {/* Subtle radial glow background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-[80vw] h-[80vw] rounded-full bg-[#C68346]/5 blur-[120px] dark:bg-[#C68346]/10" />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-16 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white/50 dark:bg-white/[0.02] shadow-sm mb-8">
            <Sparkles className="w-4 h-4 text-[#C68346]" />
            <span className="text-[13px] font-medium tracking-tight text-gray-700 dark:text-gray-300">Expense Tracking, Simplified.</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white mb-8 leading-[0.9] text-center">
            Scan. Track. <span className="text-[#C68346]">Optimize.</span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
            Upload your receipt. Let our AI extract and categorize your expenses instantly. Experience financial clarity like never before.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/upload" className="btn-primary group">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/[0.02] text-gray-800 dark:text-white font-semibold tracking-wide hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all duration-300"
            >
              <Activity className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up delay-200">
          {[
            {
              title: 'Instant Extraction',
              desc: 'OCR and YOLO based technology decode your receipts with 99.9% accuracy instantly.',
              icon: Receipt,
            },
            {
              title: 'Visual Analytics',
              desc: 'Beautiful interactive charts to visualize your spending trends.',
              icon: BarChart3,
            },
            {
              title: 'AI Intelligence',
              desc: 'Predictive insights and intelligent recommendations on your cash flow.',
              icon: Sparkles,
            },
          ].map((feature, i) => (
            <div key={feature.title} className="glass-panel p-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-xl bg-[#C68346]/10 flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-[#C68346]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
