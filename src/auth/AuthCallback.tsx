import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import { createSharedAccountApi } from '../api/sharedAccountApi';

function AuthCallback() {
    const navigate = useNavigate();
    const location = useLocation();
    const { apiRequest } = useAuth();
    const sharedAccountApi = createSharedAccountApi(apiRequest);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the session from the URL hash
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    // Check for invitation code in URL
                    const params = new URLSearchParams(location.search);
                    const uniqueCode = params.get('code');

                    if (uniqueCode) {
                        try {
                            await sharedAccountApi.addUserToSharedAccount(session.user.id, uniqueCode);
                        } catch (error) {
                            console.error('Error adding user to shared account:', error);
                            // Continue to home page even if adding to shared account fails
                        }
                    }
                }

                // Redirect to home page
                navigate('/');
            } catch (error) {
                console.error('Error handling auth callback:', error);
                navigate('/login?error=auth_callback_failed');
            }
        };

        handleAuthCallback();
    }, [navigate, location.search, apiRequest]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-emerald-500 mb-2">Completing sign in...</h2>
                <p className="text-gray-600">Please wait while we set up your account.</p>
            </div>
        </div>
    );
}

export default AuthCallback; 