import { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RiErrorWarningLine } from 'react-icons/ri';
import ErrorFallback from './ErrorFallback';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

// Wrapper component to provide navigation context to the error boundary
function RouteErrorBoundaryWithNav(props: Props) {
    const navigate = useNavigate();
    const location = useLocation();
    
    return <RouteErrorBoundary {...props} navigate={navigate} location={location} />;
}

interface RouteErrorBoundaryProps extends Props {
    navigate: ReturnType<typeof useNavigate>;
    location: ReturnType<typeof useLocation>;
}

class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, State> {
    constructor(props: RouteErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error(`Error in route ${this.props.location.pathname}:`, error);
        console.error('Error info:', errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        // Optionally refresh the current route
        this.props.navigate(this.props.location.pathname, { replace: true });
    }

    handleGoBack = () => {
        this.props.navigate(-1);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div>
                    <ErrorFallback
                        title="Page Error"
                        error={this.state.error}
                        action={{
                            label: 'Try Again',
                            onClick: this.handleRetry
                        }}
                        icon={<RiErrorWarningLine className="w-12 h-12 text-emerald-500 mb-4" />}
                        className="min-h-[calc(100vh-4rem)]"
                    />
                    <div className="text-center mt-4">
                        <button
                            onClick={this.handleGoBack}
                            className="text-emerald-500 hover:text-emerald-600 underline text-sm"
                        >
                            Go back to previous page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default RouteErrorBoundaryWithNav; 