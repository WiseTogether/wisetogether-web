import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Session, User } from '@supabase/supabase-js';
import { supabase } from "../../supabaseClient";

export interface AuthContextType {
    session: Session | null;
    signUp: (email:string, password:string) => Promise<SignUpAndSignInResponse>;
    signIn: (email:string, password:string) => Promise<SignUpAndSignInResponse>;
    signOut: () => void;
    setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
    user: UserProfile | null;
    loadingApp: boolean;
}

interface SignUpAndSignInResponse {
    success: boolean;
    data?: { user: User | null; session: Session | null };
    error?: Error;
}

interface UserProfile {
    name: string,
    avatarUrl?: string,
}

const AuthContext = createContext<AuthContextType|undefined>(undefined);

interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session|null>(null)
    const [user, setUser] = useState<UserProfile|null>(null)
    const [loadingApp, setLoadingApp] = useState<boolean>(true);

    useEffect(() => {

        const loadSession = async () => {

            // retrieves session data from Supabase
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);

            // Store session in local storage
            if (session) {
                localStorage.setItem('supabase_session', JSON.stringify(session));
            }

            // Load user data from local storage
            const userData = localStorage.getItem('supabase_user');
            if (userData) {
                setUser(JSON.parse(userData));
            }

            setLoadingApp(false);
        };
    
        loadSession();

        const { data: { subscription }} = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoadingApp(false);
            
            if (session) {
                localStorage.setItem('supabase_session', JSON.stringify(session));
            } else {
                localStorage.removeItem('supabase_session');
                localStorage.removeItem('supabase_user');
                localStorage.removeItem('invitationLink');
            }
        });
            
        return () => subscription.unsubscribe();
    },[])

    // Sign up
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

    // Sign in
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

    // Sign out
    const signOut = async (): Promise<SignUpAndSignInResponse> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('There was an error signing out: ', error);
            return { success: false, error }
        }

        localStorage.removeItem('supabase_session');
        localStorage.removeItem('supabase_user');

        return { success: true }
    }

    return (
        <AuthContext.Provider value={{ session, signUp, signOut, signIn, setUser, user, loadingApp }}> 
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("UserAuth must be used within an AuthContextProvider");
    }
    return context;
}