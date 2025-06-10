import { toast } from 'react-toastify';

export function showErrorToast(message: string) {
    // Log the error for debugging
    console.error('Error:', message);

    // Show toast notification
    toast.error(message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    });

    return message;
}

// Helper function for success messages
export function showSuccessToast(message: string) {
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
export function showInfoToast(message: string) {
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