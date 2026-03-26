import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Receipt, BarChart3, Activity, Shield, Zap, Brain, ChevronRight, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

// Animated counter for hero stats
function StatCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 2000;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 500);
    return () => clearTimeout(timer);
  }, [end]);
  return <>{count.toLocaleString()}{suffix}</>;
}

// Floating particles background
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Primary glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C68346]/[0.07] blur-[120px] dark:bg-[#C68346]/[0.12] animate-pulse-slow" />
      {/* Secondary orbs */}
      <div className="absolute top-[60%] left-[20%] w-[300px] h-[300px] rounded-full bg-purple-500/[0.04] blur-[100px] dark:bg-purple-500/[0.06] animate-float-slow" />
      <div className="absolute top-[20%] right-[15%] w-[250px] h-[250px] rounded-full bg-blue-500/[0.03] blur-[80px] dark:bg-blue-500/[0.05] animate-float-delayed" />
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEyOCwxMjgsMTI4LDAuMDYpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-60 dark:opacity-30" />
    </div>
  );
}

export default function LandingPage() {
  const features = [
    {
      title: 'AI Receipt Scanning',
      desc: 'Gemini-powered OCR instantly extracts merchant, items, and totals from any receipt image.',
      icon: Receipt,
      gradient: 'from-[#C68346] to-[#E0A96D]',
      delay: '0ms',
    },
    {
      title: 'Visual Analytics',
      desc: 'Beautiful interactive charts, radial gauges, and bar graphs to visualize your spending habits.',
      icon: BarChart3,
      gradient: 'from-purple-500 to-indigo-500',
      delay: '100ms',
    },
    {
      title: 'ML Intelligence',
      desc: 'Machine learning predicts future spending and classifies your risk profile in real-time.',
      icon: Brain,
      gradient: 'from-emerald-500 to-teal-500',
      delay: '200ms',
    },
    {
      title: 'Smart Categories',
      desc: 'AI automatically classifies each receipt into Food, Travel, Shopping, and more.',
      icon: Sparkles,
      gradient: 'from-rose-500 to-pink-500',
      delay: '300ms',
    },
    {
      title: 'AI Chat Assistant',
      desc: 'Ask your financial assistant anything — it analyzes your live data and gives intelligent answers.',
      icon: Zap,
      gradient: 'from-amber-500 to-orange-500',
      delay: '400ms',
    },
    {
      title: 'Secure & Private',
      desc: 'Session-based architecture ensures your financial data is never stored permanently.',
      icon: Shield,
      gradient: 'from-cyan-500 to-blue-500',
      delay: '500ms',
    },
  ];

  const stats = [
    { label: 'Categories', value: 9, suffix: '+' },
    { label: 'Accuracy', value: 99, suffix: '%' },
    { label: 'ML Models', value: 3, suffix: '' },
    { label: 'API Latency', value: 2, suffix: 's' },
  ];

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center">

        {/* ═══ HERO SECTION ═══ */}
        <div className="text-center max-w-5xl mx-auto pt-16 sm:pt-24 pb-20 animate-fade-in-up">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-white/[0.08] bg-white/60 dark:bg-white/[0.03] shadow-sm mb-8 backdrop-blur-sm hover:border-[#C68346]/30 transition-colors duration-300 cursor-default group">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[13px] font-medium tracking-tight text-gray-600 dark:text-gray-300">Powered by Gemini AI & Machine Learning</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C68346] group-hover:translate-x-0.5 transition-all" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold tracking-[-0.04em] text-gray-900 dark:text-white mb-6 leading-[0.95]">
            <span className="block">Your Finances,</span>
            <span className="block mt-2 bg-gradient-to-r from-[#C68346] via-[#E0A96D] to-[#C68346] bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-x">
              Decoded by AI.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-8 text-lg sm:text-xl text-gray-500 dark:text-gray-400 font-medium tracking-tight max-w-2xl mx-auto leading-relaxed">
            Scan receipts, get instant AI categorization, predictive ML forecasts, and real-time financial intelligence — all in one beautiful dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/upload" className="btn-primary group px-8 py-4 text-[15px] shadow-xl shadow-[#C68346]/20 hover:shadow-2xl hover:shadow-[#C68346]/30">
              <Receipt className="w-5 h-5" />
              Scan Your First Receipt
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl border-2 border-gray-200 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] text-gray-800 dark:text-white font-semibold text-[15px] tracking-wide hover:bg-white dark:hover:bg-white/[0.06] hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-lg"
            >
              <BarChart3 className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              View Dashboard
            </Link>
          </div>
        </div>

        {/* ═══ STATS BAR ═══ */}
        <div className="w-full max-w-3xl mx-auto mb-20 animate-fade-in-up delay-100">
          <div className="glass-panel p-1.5 flex items-center justify-between rounded-2xl">
            {stats.map((stat, i) => (
              <div key={stat.label} className={`flex-1 text-center py-4 ${i < stats.length -1 ? 'border-r border-gray-100 dark:border-white/5' : ''}`}>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  <StatCounter end={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ FEATURES GRID ═══ */}
        <div className="w-full mb-20">
          <div className="text-center mb-12 animate-fade-in-up delay-200">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Everything you need to <span className="text-[#C68346]">master</span> your money.
            </h2>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
              Built with cutting-edge AI, designed with obsessive attention to detail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="glass-panel p-7 flex flex-col group hover:-translate-y-1 hover:shadow-xl transition-all duration-500 cursor-default animate-fade-in-up"
                style={{ animationDelay: feature.delay }}
              >
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                {/* Text */}
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2.5 tracking-tight group-hover:text-[#C68346] transition-colors duration-300">{feature.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium flex-1">{feature.desc}</p>
                {/* Hover arrow */}
                <div className="mt-5 flex items-center gap-1.5 text-[#C68346] opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all duration-500">
                  <span className="text-xs font-bold tracking-wide">Learn more</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ BOTTOM CTA ═══ */}
        <div className="w-full max-w-3xl mx-auto mb-16 animate-fade-in-up delay-400">
          <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 text-center bg-gradient-to-br from-[#C68346] via-[#d49a5e] to-[#8B5E3C] shadow-2xl shadow-[#C68346]/30">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-white/10 blur-2xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-black/10 blur-xl translate-y-1/2 -translate-x-1/3" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-200 fill-yellow-200" />
                ))}
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4 tracking-tight">
                Start tracking your expenses today.
              </h3>
              <p className="text-white/80 font-medium mb-8 max-w-md mx-auto text-sm sm:text-base">
                Join thousands of users who have taken control of their finances with AI-powered insights.
              </p>
              <Link 
                to="/upload" 
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-[#8B5E3C] font-bold text-[15px] shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                Get Started — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full text-center pb-8 opacity-50">
          <p className="text-xs font-medium text-gray-400 tracking-wide">
            Built with ❤️ using React, Gemini AI, and scikit-learn  •  FinSight © 2026
          </p>
        </div>

      </div>
    </div>
  );
}
