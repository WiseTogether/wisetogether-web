import { ReactNode } from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';

interface ErrorFallbackProps {
    title?: string;
    message?: string;
    error?: Error | null;
    action?: {
        label: string;
        onClick: () => void;
    };
    icon?: ReactNode;
    className?: string;
}

function ErrorFallback({
    title = 'Oops! Something went wrong',
    message,
    error,
    action = {
        label: 'Refresh Page',
        onClick: () => window.location.reload()
    },
    icon = <RiErrorWarningLine className="w-12 h-12 text-emerald-500 mb-4" />,
    className = ''
}: ErrorFallbackProps) {
    // Get the most relevant error message
    const errorMessage = message || error?.message || 'An unexpected error occurred';

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`}>
            <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
                {/* Icon */}
                <div className="flex justify-center">
                    {icon}
                </div>

                {/* Title */}
                <h2 className="text-2xl font-semibold text-emerald-500 mb-4">
                    {title}
                </h2>

                {/* Error Message */}
                <p className="text-gray-600 mb-6">
                    {errorMessage}
                </p>

                {/* Action Button */}
                <button
                    onClick={action.onClick}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    {action.label}
                </button>

                {/* Additional Error Details in Development */}
                {process.env.NODE_ENV === 'development' && error?.stack && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-md text-left overflow-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                            {error.stack}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ErrorFallback; 