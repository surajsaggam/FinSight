import { useState, useRef } from 'react';
import { Upload, CheckCircle, ArrowRight } from 'lucide-react';

export default function UploadCard({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      setUploaded(true);
    }
  };

  const handleClick = () => fileRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      setUploaded(true);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={!uploaded ? handleClick : undefined}
      className={`relative rounded-3xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-500 backdrop-blur-xl
        ${isDragging
          ? 'border-[#C68346] bg-[#C68346]/5 dark:bg-[#C68346]/10 shadow-[0_0_40px_rgba(198,131,70,0.1)] scale-[1.02]'
          : uploaded
            ? 'border-[#C68346]/50 bg-gray-50 dark:bg-white/[0.02] shadow-sm'
            : 'border-gray-200 dark:border-white/[0.08] hover:border-[#C68346]/50 bg-white dark:bg-[#0a0a0a] hover:bg-gray-50 dark:hover:bg-white/[0.02]'
        }`}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploaded ? (
        <div className="space-y-3">
            <CheckCircle className="w-16 h-16 text-[#C68346] mx-auto mb-6" />
            <p className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">Receipt Uploaded!</p>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Ready for AI extraction</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpload();
              }}
              className="px-8 py-4 rounded-full bg-[#C68346] text-white font-black tracking-widest uppercase shadow-lg shadow-[#C68346]/30 hover:shadow-xl hover:shadow-[#C68346]/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto" // Updated button styles
            >
              Scan Receipt
              <ArrowRight className="w-5 h-5 ml-1" />
            </button>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col items-center justify-center">
            <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 transition-transform duration-300 ${isDragging ? 'bg-[#C68346]/20 scale-110' : 'bg-[#C68346]/10'}`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-[#C68346]' : 'text-[#C68346]/80'}`} />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
              Drop your receipt here
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-8">
              or click to browse from your device
            </p>
            
            <button className="px-8 py-4 rounded-full bg-[#C68346] text-white font-black tracking-widest uppercase shadow-lg shadow-[#C68346]/30 hover:shadow-xl hover:shadow-[#C68346]/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto"> {/* Updated button styles */}
              Select File
            </button>
          </div>
        </>
      )}
    </div>
  );
}
