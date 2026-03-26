import { useNavigate } from 'react-router-dom';
import UploadCard from '../components/UploadCard';
import { FileText, Shield, Zap } from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();

  const handleUpload = () => {
    navigate('/processing');
  };

  return (
    <div className="w-full flex-1 flex flex-col justify-center items-center py-8 px-4">
      <div className="w-full max-w-2xl mt-4">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tighter text-gray-900 dark:text-white">
            Upload your <span className="text-[#C68346]">receipt</span>
          </h1>
          <p className="mt-4 text-[15px] text-gray-500 dark:text-gray-400 font-medium tracking-tight">
            Upload a receipt image and let AI extract your expense data.
          </p>
        </div>

        {/* Upload Card */}
        <div className="animate-fade-in-up delay-100">
          <UploadCard onUpload={handleUpload} />
        </div>

        {/* Info badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-4 animate-fade-in-up delay-200">
          {[
            { icon: Zap, text: 'Instant OCR' },
            { icon: FileText, text: 'Auto-categorize' },
            { icon: Shield, text: 'Financial Planning' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="glass-panel py-3 px-5 flex items-center justify-center gap-2">
              <Icon className="w-4 h-4 text-[#C68346]" />
              <span className="text-sm font-medium tracking-tight text-gray-700 dark:text-gray-300">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
