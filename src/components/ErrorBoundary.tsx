import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in child component tree
 * Logs errors and displays fallback UI
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (could also send to error tracking service)
        console.error('Error Boundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        // Optionally reload the page for a fresh start
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            // Custom fallback UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default fallback UI
            return (
                <div className="min-h-screen flex items-center justify-center bg-cream p-4">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6 border border-emerald-deep/10">
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-emerald-deep font-tajawal">
                                حدث خطأ غير متوقع
                            </h2>
                            <p className="text-sm text-emerald-deep/60">
                                An unexpected error occurred
                            </p>
                        </div>

                        <p className="text-sm text-emerald-deep/70 leading-relaxed">
                            نعتذر عن الإزعاج. يرجى المحاولة مرة أخرى.
                            <br />
                            We apologize for the inconvenience. Please try again.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="text-left text-xs bg-red-50 p-3 rounded-lg border border-red-200">
                                <summary className="cursor-pointer font-semibold text-red-800 mb-2">
                                    Error Details (Dev Only)
                                </summary>
                                <pre className="overflow-auto text-red-700 whitespace-pre-wrap">
                                    {this.state.error.toString()}
                                    {this.state.errorInfo?.componentStack}
                                </pre>
                            </details>
                        )}

                        <Button
                            onClick={this.handleReset}
                            className="w-full bg-emerald-deep hover:bg-emerald-deep/90 text-white font-tajawal"
                            size="lg"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            إعادة تحميل التطبيق / Reload App
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
