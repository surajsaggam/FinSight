import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine, FileSearch, Brain, CheckCircle } from 'lucide-react';

const steps = [
  { icon: ScanLine, label: 'Scanning receipt', duration: 1200 },
  { icon: FileSearch, label: 'Extracting data', duration: 1200 },
  { icon: Brain, label: 'Analyzing expenses', duration: 1000 },
];

export default function ProcessingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let total = 0;
    const timers = steps.map((step, i) => {
      total += step.duration;
      return setTimeout(() => setCurrentStep(i + 1), total);
    });

    const finalTimer = setTimeout(() => {
      setCompleted(true);
      setTimeout(() => navigate('/result'), 600);
    }, total + 500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finalTimer);
    };
  }, [navigate]);

  return (
    <div className="flex-1 flex flex-col justify-center items-center bg-transparent py-8 px-4">
      <div className="w-full max-w-md">
        {/* Processing animation */}
        <div className="text-center mb-10 animate-fade-in-up">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 transition-all duration-500
            ${completed
              ? 'bg-[#C68346]/20 border border-[#C68346]/30 shadow-sm'
              : 'bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm'
            }`}
          >
            {completed
              ? <CheckCircle className="w-8 h-8 text-[#C68346]" />
              : <Brain className="w-8 h-8 text-[#C68346] animate-pulse" />
            }
          </div>
          <h2 className="text-2xl font-semibold tracking-tighter text-gray-900 dark:text-white">
            {completed ? 'Analysis complete!' : 'Processing receipt'}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium tracking-tight">
            {completed ? 'Redirecting to results...' : 'Our AI is analyzing your receipt'}
          </p>
        </div>

        {/* Steps */}
        <div className="glass-panel p-6 space-y-4 animate-fade-in-up delay-100">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isDone = currentStep > i;
            const isActive = currentStep === i;

            return (
              <div key={step.label} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500
                  ${isDone
                    ? 'bg-[#C68346]/10'
                    : isActive
                      ? 'bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/10 shadow-sm'
                      : 'bg-gray-50 dark:bg-white/[0.02]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle className="w-5 h-5 text-[#C68346]" />
                  ) : (
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#C68346] animate-pulse' : 'text-gray-400 dark:text-gray-600'}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold transition-colors ${isDone ? 'text-gray-900 dark:text-white' : isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                    {step.label}
                  </p>
                </div>
                {isActive && (
                  <div className="flex gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C68346]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C68346]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C68346]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
                {isDone && (
                  <span className="text-xs font-bold text-[#C68346]">Done</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-8 h-1 rounded-full bg-gray-200 dark:bg-white/5 overflow-hidden animate-fade-in-up delay-200">
          <div
            className="h-full rounded-full bg-[#C68346] transition-all duration-700 ease-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
