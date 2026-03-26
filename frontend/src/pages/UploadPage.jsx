import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileImage, X, Loader2, ScanLine } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file (JPG, PNG, WEBP, etc.)');
      return;
    }
    setError(null);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('receipt', file);

      console.log('Uploading receipt...', file.name);

      // Use absolute backend URL to bypass Vite proxy (more reliable)
      const res = await fetch('http://localhost:5000/api/receipt', {
        method: 'POST',
        body: formData,
      });

      const rawText = await res.text();
      let json;
      try {
        json = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Backend returned non-JSON:', rawText);
        throw new Error(`Backend error: ${rawText.substring(0, 100)}`);
      }

      console.log('Backend response:', json);

      if (!res.ok || !json.success) {
        throw new Error(json.error || `Failed to parse receipt (status ${res.status})`);
      }

      // Only navigate after successful backend response
      navigate('/processing', { state: { receiptData: json.data } });

    } catch (err) {
      console.error('Receipt upload error:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C68346]/10 border border-[#C68346]/20 text-[#C68346] text-sm font-medium mb-4">
            <ScanLine size={14} />
            AI Receipt Scanner
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Upload your receipt
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Our AI will extract merchant, date, items & total automatically
          </p>
        </div>

        {/* Drop Zone */}
        <div
          className={`glass-panel p-6 animate-fade-in-up delay-100 transition-all duration-200 cursor-pointer
            ${dragging ? 'border-[#C68346] border-2 scale-[1.01]' : ''}
            ${preview ? 'border-0' : 'border-2 border-dashed border-gray-200 dark:border-gray-700'}
          `}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => !preview && fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full max-h-72 object-contain rounded-xl"
              />
              <button
                onClick={(e) => { e.stopPropagation(); clearFile(); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <FileImage size={14} />
                <span className="truncate">{file?.name}</span>
                <span className="ml-auto shrink-0">
                  {file ? `${(file.size / 1024).toFixed(1)} KB` : ''}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#C68346]/10 flex items-center justify-center">
                <Upload size={24} className="text-[#C68346]" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700 dark:text-gray-200">
                  Drop your receipt here
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  or <span className="text-[#C68346] underline underline-offset-2">browse files</span>
                </p>
              </div>
              <p className="text-xs text-gray-400">JPG, PNG, WEBP up to 10MB</p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {/* Error */}
        {error && (
          <div className="mt-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm animate-fade-in-up">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={!file || loading}
          className="btn-primary w-full mt-4 py-3.5 text-base animate-fade-in-up delay-200"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Analyzing receipt...
            </>
          ) : (
            <>
              <ScanLine size={18} />
              Scan Receipt
            </>
          )}
        </button>

        <p className="text-center text-xs text-gray-400 mt-4 animate-fade-in-up delay-300">
          Your receipt is processed securely and never stored permanently.
        </p>
      </div>
    </div>
  );
}
