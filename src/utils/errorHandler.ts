import { toast } from 'react-toastify';
import { ApiError } from '../lib/baseApiClient';

interface ErrorResponse {
    message?: string;
    error?: string;
    status?: number;
}

export function handleApiError(error: unknown, fallbackMessage = 'An unexpected error occurred') {
    // Log the error for debugging
    console.error('API Error:', error);

    let errorMessage = fallbackMessage;

    if (error instanceof ApiError) {
        // Handle our custom API errors
        errorMessage = error.message;
    } else if (error instanceof Error) {
        // Handle standard Error objects
        errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
        // Handle error objects from API responses
        const errorObj = error as ErrorResponse;
        errorMessage = errorObj.message || errorObj.error || fallbackMessage;
    }

    // Show toast notification
    toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    return errorMessage;
}

// Helper function for success messages
export function showSuccessMessage(message: string) {
    toast.success(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
}

// Helper function for info messages
export function showInfoMessage(message: string) {
    toast.info(message, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });
} 