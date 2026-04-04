import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScanLine } from 'lucide-react';

const steps = [
  'Uploading receipt image...',
  'Detecting merchant & date...',
  'Extracting line items...',
  'Calculating totals...',
  'Finalizing results...',
];

export default function ProcessingPage() {
  const stepRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state?.receiptData;

  useEffect(() => {
    let i = 0;
    const el = stepRef.current;
    const interval = setInterval(() => {
      if (!el) return;
      if (i < steps.length - 1) {
        i++;
        el.textContent = steps[i];
      }
    }, 150);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const totalTime = steps.length * 150;
    const timer = setTimeout(() => {
      navigate('/result', { state: { receiptData: data } });
    }, totalTime);
    return () => clearTimeout(timer);
  }, [navigate, data]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm w-full">

        {/* Animated icon */}
        <div className="relative inline-flex items-center justify-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-[#10B981]/10 flex items-center justify-center">
            <ScanLine size={36} className="text-[#10B981] animate-pulse" />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-[#10B981]/30 animate-spin [animation-duration:3s]" />
        </div>

        <h2 className="font-space text-2xl font-bold text-white mb-2">
          Analyzing your receipt
        </h2>
        <p
          ref={stepRef}
          className="text-[#9CA3AF] text-sm transition-all duration-500"
        >
          {steps[0]}
        </p>

        {/* Progress bar */}
        <div className="mt-8 h-1 w-full bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#10B981] to-[#10B981]/40 rounded-full animate-[progress_6s_ease-in-out_forwards]" />
        </div>

        <style>{`
          @keyframes progress {
            from { width: 0% }
            to   { width: 90% }
          }
        `}</style>
      </div>
    </div>
  );
}
