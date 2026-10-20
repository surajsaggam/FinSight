import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Trash2 } from 'lucide-react';
import { reportClientError } from '../utils/api';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught UI Error:', error, errorInfo);
    reportClientError(error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleResetSession = () => {
    sessionStorage.clear();
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#04050A] text-white flex items-center justify-center p-6">
          <div className="liquid-glass max-w-md w-full p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#EF4444]/10 border border-[#EF4444]/25 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-[#EF4444]" />
            </div>
            <h1 className="font-space text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#9CA3AF] leading-relaxed mb-6">
              We encountered an unexpected error while rendering this view. Your session data is safe.
            </p>
            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-white/[0.03] border border-white/[0.07] text-xs text-[#9CA3AF] font-mono break-words text-left">
                {this.state.error.message}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-full bg-[#10B981] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#059669] transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>
              <a
                href="/"
                className="flex-1 py-3 px-4 rounded-full border border-white/[0.15] bg-white/[0.04] text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white/[0.08] transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </a>
            </div>
            <button
              onClick={this.handleResetSession}
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#EF4444] transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset session data if problem persists
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
