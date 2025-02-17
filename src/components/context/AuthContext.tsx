import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { Session } from '@supabase/supabase-js';
import { supabase } from "../../supabaseClient";

interface AuthContextType {
    session: Session | null;
    signUp: (email:string, password:string) => Promise<SignUpAndSignInResponse>;
    signIn: (email:string, password:string) => Promise<SignUpAndSignInResponse>;
    signOut: () => void;
}

interface SignUpAndSignInResponse {
    success: boolean;
    data?: any;
    error?: Error;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    signUp: async (email, password) => await ({ success: false, error: new Error("Function not implemented") }),
    signIn: async (email, password) => await ({ success: false, error: new Error("Function not implemented") }),
    signOut: () => {},
});

interface AuthContextProviderProps {
    children: ReactNode;
}

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({ children }) => {
    const [session, setSession] = useState<Session|null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({data: {session}}) => {
            setSession(session);
        });

        supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        })
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
    const signOut = async (): Promise<void> => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('There was an error signing out: ', error);
        }
    }

    return (
        <AuthContext.Provider value={{ session, signUp, signOut, signIn }}> 
            {children}
        </AuthContext.Provider>
    )
}

export const UserAuth = () => useContext(AuthContext);