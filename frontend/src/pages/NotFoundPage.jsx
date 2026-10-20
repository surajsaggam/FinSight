import { Link } from 'react-router-dom';
import { Compass, Home, Upload, BarChart3 } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6 py-16">
      <div className="liquid-glass max-w-lg w-full p-8 sm:p-10 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-2xl bg-[#10B981]/10 border border-[#10B981]/25 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 text-[#10B981]" />
        </div>
        <span className="inline-block px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[11px] font-bold tracking-widest uppercase text-[#10B981] mb-3">
          Error 404
        </span>
        <h1 className="font-space text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Page not found
        </h1>
        <p className="text-sm text-[#9CA3AF] leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been moved. Let's get you back to tracking your finances.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            to="/"
            className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Home className="w-4 h-4 text-[#10B981]" />
            Home
          </Link>
          <Link
            to="/upload"
            className="py-3 px-4 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4" />
            Scan Receipt
          </Link>
          <Link
            to="/dashboard"
            className="py-3 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/[0.2] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <BarChart3 className="w-4 h-4 text-[#10B981]" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
