import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { getUserProfile } from '../api/userApi';

export interface AuthContextType {
    session: Session | null;
    user: UserProfile | null;
    isLoading: boolean;
    signUp: (email:string, password:string) => Promise<SupabaseResponse>;
    signIn: (email:string, password:string) => Promise<SupabaseResponse>;
    signOut: () => Promise<SupabaseResponse>;
}

interface SupabaseResponse {
    success: boolean;
    data?: { user: User | null; session: Session | null };
    error?: Error;
}

export interface UserProfile {
    name: string,
    avatarUrl?: string,
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

    useEffect(() => {
        // Function to load the session and user profile
        const loadSession = async () => {

            // Retrieve session data from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            // Fetch user profile
            if (session && session.user) {
                const userProfile = await getUserProfile(session.user.id, session.access_token);
                const displayName = userProfile.name.substring(0, userProfile.name.indexOf(' ')); // Get the first name

                setUser({
                    name: displayName,
                    avatarUrl: userProfile.avatar
                });
            }

            setIsLoading(false);
        };
    
        loadSession();

        // Listen for authentication state changes (when user logs in or logs out)
        const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session); // Update session state when auth state changes
            
            // If session is valid, fetch and set user profile data
            if (session && session.user) {
                getUserProfile(session.user.id, session.access_token).then(userProfile => {
                    const displayName = userProfile.name.substring(0, userProfile.name.indexOf(' '));
                    setUser({
                        name: displayName,
                        avatarUrl: userProfile.avatar
                    });
                });
            } else {
                // Clear user data from state when logged out
                setUser(null);
            }
            setIsLoading(false);
        });
        
        // Clean up the subscription when the component unmounts
        return () => subscription.unsubscribe();
    },[])

    // Sign up with email and password
    const signUp = async (email:string, password:string): Promise<SupabaseResponse> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });
            
        if (error) {
            console.error('There was an error signing up: ', error);
            return { success: false, error };
        }

        return { success: true, data };
    };

    // Sign in with email and password
    const signIn = async (email:string, password:string): Promise<SupabaseResponse> => {
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

    return (
        // Provide the authentication context to the component tree
        <AuthContext.Provider value={{ session, signUp, signOut, signIn, user, isLoading }}> 
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('UserAuth must be used within an AuthContextProvider');
    }
    return context;
}