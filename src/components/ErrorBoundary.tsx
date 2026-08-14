import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('Unhandled UI Error caught by Crackers Falls ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const errMsg = this.state.error?.message || '';
      const isFirestoreAssertion = errMsg.includes('FIRESTORE') || errMsg.includes('ASSERTION FAILED') || errMsg.includes('TargetState');

      // If it's a background SDK connection assertion, don't block the UI!
      if (isFirestoreAssertion) {
        return this.props.children;
      }

      return (
        <div className="min-h-screen bg-ink-950 flex items-center justify-center p-6 text-paper-50 font-sans">
          <div className="max-w-md w-full bg-ink-900 p-8 rounded-3xl text-center space-y-6 shadow-2xl border border-gold-400/30">
            <div className="w-16 h-16 bg-gold-400/20 text-gold-400 rounded-2xl flex items-center justify-center mx-auto border border-gold-400/40">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">Something Went Wrong</h2>
              <p className="text-xs text-paper-300 font-sans leading-relaxed">
                {this.state.error?.message || 'An unexpected error occurred while rendering the page.'}
              </p>
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3.5 bg-gold-400 hover:bg-gold-300 text-ink-950 font-extrabold text-xs uppercase tracking-wider rounded-full transition-all shadow-ember flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>Reload Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
