import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { baseApiClient, type ApiConfig, ApiError } from '../lib/baseApiClient';

export interface AuthContextType {
    session: Session | null;
    user: UserProfile | null;
    isLoading: boolean;
    signUp: (email:string, password:string, name: string) => Promise<SupabaseResponse>;
    signIn: (email:string, password:string) => Promise<SupabaseResponse>;
    signInWithGoogle: (redirectTo?: string) => Promise<SupabaseResponse>;
    signOut: () => Promise<SupabaseResponse>;
    apiRequest: <T>(config: ApiConfig) => Promise<T>;
}

interface SupabaseResponse {
    success: boolean;
    data?: { user: User | null; session: Session | null };
    error?: Error;
}

export interface UserProfile {
    name: string;
    avatarUrl?: string;
}

// Create the AuthContext with an initial undefined value
const AuthContext = createContext<AuthContextType|undefined>(undefined);

interface AuthContextProviderProps {
    children: ReactNode;
}

// Responsible for managing user authentication state
export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Create the API request function that uses the current session
    const apiRequest = async <T,>(config: ApiConfig): Promise<T> => {
        if (!session?.access_token) {
            throw new ApiError('No access token available', 401);
        }
        return baseApiClient<T>({ ...config, accessToken: session.access_token });
    };

    // Helper function to extract user profile from session
    const extractUserProfile = (session: Session | null): UserProfile | null => {
        if (!session?.user) return null;

        const metadata = session.user.user_metadata;
        const fullName = metadata?.full_name || metadata?.name || 'User';
        const displayName = fullName.split(' ')[0]; // Get first name

        return {
            name: displayName,
            avatarUrl: metadata?.avatar_url || metadata?.picture
        };
    };

    useEffect(() => {
        // Function to load the session and user profile
        const loadSession = async () => {
            // Retrieve session data from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(extractUserProfile(session));
            setIsLoading(false);
        };
    
        loadSession();

        // Listen for authentication state changes
        const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(extractUserProfile(session));
            setIsLoading(false);
        });
        
        return () => subscription.unsubscribe();
    }, []);

    // Sign up with email and password
    const signUp = async (email: string, password: string, name: string): Promise<SupabaseResponse> => {
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
    const signIn = async (email: string, password: string): Promise<SupabaseResponse> => {
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
    const signOut = async (): Promise<SupabaseResponse> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('There was an error signing out: ', error);
            return { success: false, error };
        }

        return { success: true };
    };

    // Sign in with Google
    const signInWithGoogle = async (redirectTo?: string): Promise<SupabaseResponse> => {
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

    return (
        <AuthContext.Provider value={{ 
            session, 
            signUp, 
            signOut, 
            signIn,
            signInWithGoogle,
            user, 
            isLoading,
            apiRequest 
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