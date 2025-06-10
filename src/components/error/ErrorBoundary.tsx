import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorFallback from './ErrorFallback';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Error caught by boundary:', error);
        console.error('Error info:', errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided, otherwise use ErrorFallback
            return this.props.fallback || (
                <ErrorFallback
                    title="Application Error"
                    error={this.state.error}
                    action={{
                        label: 'Refresh Page',
                        onClick: () => window.location.reload()
                    }}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 