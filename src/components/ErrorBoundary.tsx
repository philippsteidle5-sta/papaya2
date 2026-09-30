import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public props: Props;
  public state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: React.ErrorInfo, errorInfo: React.ErrorInfo) {
    console.error("Uncaught Error Boundary caught an error:", error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Could not clear localStorage", e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#030712] text-white flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900/90 border border-orange-500/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(245,158,11,0.2)] backdrop-blur-xl">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/50 mx-auto flex items-center justify-center text-orange-400 mb-4 animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="font-display text-xl font-bold text-white tracking-wide uppercase mb-2">
              S.Y.N.T.A.X. System Wiederherstellung
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-4 font-mono">
              Ein unerwarteter Anzeigefehler ist aufgetreten.
            </p>

            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-left font-mono text-xs text-red-400 overflow-x-auto max-h-32 mb-6">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>SEITE NEU LADEN</span>
              </button>

              <button
                onClick={this.handleReset}
                className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-[11px] transition cursor-pointer"
              >
                Speicher zurücksetzen & neu starten
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
