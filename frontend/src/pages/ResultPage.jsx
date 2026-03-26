import { Link } from 'react-router-dom';
import { Store, Calendar, IndianRupee, FileCheck, ArrowRight } from 'lucide-react';

export default function ResultPage() {
  const extractedData = {
    merchant: 'Zomato',
    amount: '₹340',
    date: '16 March 2026',
    paymentMethod: 'UPI',
    confidence: '98.5%',
  };

  const fields = [
    { icon: Store, label: 'Merchant', value: extractedData.merchant },
    { icon: IndianRupee, label: 'Amount', value: extractedData.amount },
    { icon: Calendar, label: 'Date', value: extractedData.date },
    { icon: FileCheck, label: 'Payment Method', value: extractedData.paymentMethod },
  ];

  return (
    <div className="flex flex-col justify-center items-center py-8 px-4 flex-1">
      <div className="w-full max-w-lg mt-8">
        {/* Header */}
        <div className="text-center justify-center flex flex-col items-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl bg-[#C68346]/10 flex items-center justify-center mb-5">
            <FileCheck className="w-8 h-8 text-[#C68346]" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tighter text-gray-900 dark:text-white">Data extracted</h1>
          <p className="mt-2 text-[#C68346] font-medium tracking-tight text-xs flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C68346]"></span> AI confidence: {extractedData.confidence}
          </p>
        </div>

        {/* Result Card */}
        <div className="glass-panel overflow-hidden animate-fade-in-up delay-100">
          {fields.map(({ icon: Icon, label, value }, i) => (
            <div
              key={label}
              className={`flex items-center gap-5 p-5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i !== fields.length - 1 ? 'border-b border-gray-100 dark:border-white/[0.05]' : ''}`}
            >
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Icon className="w-4 h-4 text-[#C68346]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-tight">{label}</p>
                <p className="text-base font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-center animate-fade-in-up delay-200">
          <Link
            to="/dashboard"
            className="btn-primary w-full shadow-lg"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
