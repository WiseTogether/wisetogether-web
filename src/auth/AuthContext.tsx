import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { type ApiConfig } from '../lib/baseApiClient';
import { UserProfile } from '../types/auth';
import { extractUserProfile, createApiRequest } from '../utils/authUtils';

// Types
interface AuthContextType {
    session: Session | null;
    userProfile: UserProfile | null;
    isLoading: boolean;
    signUp: (email: string, password: string, name: string) => Promise<AuthResponse>;
    signIn: (email: string, password: string) => Promise<AuthResponse>;
    signInWithGoogle: (redirectTo?: string) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    apiRequest: <T>(config: ApiConfig) => Promise<T>;
}

interface AuthResponse {
    success: boolean;
    data?: { user: User | null; session: Session | null };
    error?: Error;
}

interface AuthContextProviderProps {
    children: ReactNode;
}

// Create the AuthContext with an initial undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Responsible for managing user authentication state
export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUserProfile(extractUserProfile(session));
                setIsLoading(false);
            } catch (error) {
                console.error('Error initializing auth:', error);
                setIsLoading(false);
            }
        };

        initializeAuth();

        // Listen for authentication state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUserProfile(extractUserProfile(session));
            setIsLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    // Sign up with email and password
    const signUp = async (email: string, password: string, name: string): Promise<AuthResponse> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                }
            }
        });
            
        if (error) {
            console.error('There was an error signing up: ', error);
            return { success: false, error };
        }

        return { success: true, data };
    };

    // Sign in with email and password
    const signIn = async (email: string, password: string): Promise<AuthResponse> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            console.error('There was an error signing in: ', error);
            return { success: false, error };
        }

        return { success: true, data };
    };

    // Sign out
    const signOut = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('There was an error signing out: ', error);
        }
        setSession(null);
        setUserProfile(null);
        setIsLoading(false);
    };

    // Sign in with Google
    const signInWithGoogle = async (redirectTo?: string): Promise<AuthResponse> => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
                queryParams: {
                    access_type: 'offline',
                    prompt: 'consent',
                }
            }
        });

        if (error) {
            console.error('There was an error signing in with Google: ', error);
            return { success: false, error };
        }

        return { success: true };
    };

    const apiRequest = createApiRequest(session);

    return (
        <AuthContext.Provider value={{ 
            session, 
            signUp, 
            signOut, 
            signIn,
            signInWithGoogle,
            userProfile,
            isLoading,
            apiRequest,
        }}> 
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};