import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { findProfileByUserId } from '../../api/userApi';

export interface AuthContextType {
    session: Session | null;
    signUp: (email:string, password:string) => Promise<SignUpAndSignInResponse>;
    signIn: (email:string, password:string) => Promise<SignUpAndSignInResponse>;
    signOut: () => void;
    user: UserProfile | null;
    loadingApp: boolean;
}

interface SignUpAndSignInResponse {
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
    const [session, setSession] = useState<Session|null>(null)
    const [user, setUser] = useState<UserProfile|null>(null)
    const [loadingApp, setLoadingApp] = useState<boolean>(true);

    useEffect(() => {
        // Function to load the session and user profile
        const loadSession = async () => {

            // Retrieve session data from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            // Fetch user profile using the user ID
            if (session && session.user) {
                const userProfile = await findProfileByUserId(session.user.id);
                const displayName = userProfile.name.substring(0, userProfile.name.indexOf(' ')); // Get the first name

                setUser({
                    name: displayName,
                    avatarUrl: userProfile.avatar
                });
            }

            setLoadingApp(false);
        };
    
        loadSession();

        // Listen for authentication state changes (when user logs in or logs out)
        const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session); // Update session state when auth state changes
            setLoadingApp(false);

            // If session is valid, fetch and set user profile data
            if (session && session.user) {
                findProfileByUserId(session.user.id).then(userProfile => {
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
        });
        
        // Clean up the subscription when the component unmounts
        return () => subscription.unsubscribe();
    },[])

    // Sign up function to create a new user account
    const signUp = async (email:string, password:string): Promise<SignUpAndSignInResponse> => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        })
            
        if (error) {
            console.error('There was an error signing up: ', error);
            return { success: false, error };
        }

        return { success: true, data };
    }

    // Sign in function to authenticate an existing user
    const signIn = async (email:string, password:string): Promise<SignUpAndSignInResponse> => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })
        if (error) {
            console.error('There was an error signing in: ', error);
            return { success: false, error }
        }
        return { success: true, data }
    }

    // Sign out function to log out the current user
    const signOut = async (): Promise<SignUpAndSignInResponse> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('There was an error signing out: ', error);
            return { success: false, error }
        }

        return { success: true }
    }

    return (
        // Provide the authentication context to the component tree
        <AuthContext.Provider value={{ session, signUp, signOut, signIn, user, loadingApp }}> 
            {children}
        </AuthContext.Provider>
    )
}

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('UserAuth must be used within an AuthContextProvider');
    }
    return context;
}