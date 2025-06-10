import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from '../components/ui/Toast';

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
}

interface ToastState {
    message: string;
    type: ToastType;
    duration: number;
    id: number;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastState[]>([]);
    const [nextId, setNextId] = useState(0);

    const showToast = useCallback((message: string, type: ToastType = 'info', duration = 5000) => {
        const id = nextId;
        setNextId(prev => prev + 1);
        
        setToasts(prev => [...prev, { message, type, duration, id }]);
    }, [nextId]);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
} 