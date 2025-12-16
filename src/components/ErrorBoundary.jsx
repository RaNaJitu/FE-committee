import { Component } from "react";
import { Button } from "./ui/Button.jsx";
import { captureError } from "../utils/errorTracking.js";

export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo,
        });

        // Log error to console in development
        if (import.meta.env.DEV) {
            console.error("ErrorBoundary caught an error:", error, errorInfo);
        }

        // Send to error tracking service
        captureError(error, {
            componentStack: errorInfo.componentStack,
            errorBoundary: true,
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-white">
                    <div className="max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-lg shadow-black/30">
                        <div className="text-center">
                            <h1 className="text-3xl font-semibold text-white mb-4">
                                Something went wrong
                            </h1>
                            <p className="text-white/70 mb-6">
                                We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                            </p>
                            
                            {import.meta.env.DEV && this.state.error && (
                                <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-left">
                                    <p className="text-sm font-semibold text-red-300 mb-2">
                                        Error Details (Development Only):
                                    </p>
                                    <pre className="text-xs text-red-200 overflow-auto max-h-64">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </div>
                            )}

                            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                                <Button
                                    variant="primary"
                                    onClick={this.handleReset}
                                >
                                    Try Again
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => window.location.reload()}
                                >
                                    Refresh Page
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

