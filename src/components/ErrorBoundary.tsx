import { Component, type ErrorInfo, type ReactNode } from 'react';

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('bag-chaser-save');
    window.location.reload();
  };

  public render() {
    const { children } = this.props;
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center font-mono">
          <div className="text-6xl mb-6">📉</div>
          <h1 className="text-2xl font-black text-red-500 uppercase tracking-tighter mb-4">
            SYSTEM CRASHED
          </h1>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-8 w-full max-w-md">
            <p className="text-xs text-slate-400 break-words">
              {this.state.error?.message || 'Unknown runtime error occurred.'}
            </p>
          </div>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            The simulation encountered a fatal error. Your progress might be corrupted.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => window.location.reload()}
              className="py-4 bg-slate-100 text-black font-black rounded-xl uppercase tracking-widest text-sm hover:bg-white transition-all active:scale-95"
            >
              RETRY BOOT
            </button>
            <button
              onClick={this.handleReset}
              className="py-4 bg-red-600/20 text-red-500 border border-red-500/30 font-black rounded-xl uppercase tracking-widest text-sm hover:bg-red-600/30 transition-all"
            >
              WIPE SAVE & RESET
            </button>
          </div>
          <p className="mt-8 text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em]">
            BAG CHASER V2 • EMERGENCY PROTOCOL
          </p>
        </div>
      );
    }

    return children;
  }
}
