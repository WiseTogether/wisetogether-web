import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from './AuthContext';
import { createSharedAccountApi } from '../api/sharedAccountApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { registerFormSchema, RegisterFormData } from '../types/auth';

function Register() {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pendingSharedAccountCode, setPendingSharedAccountCode] = useState<string | null>(null);

    const { signUp, apiRequest, session, signInWithGoogle } = useAuth();
    const navigate = useNavigate();
    const sharedAccountApi = createSharedAccountApi(apiRequest);

    // Handle adding user to shared account once session is available
    useEffect(() => {
        const handleSharedAccount = async () => {
            if (session?.user && pendingSharedAccountCode) {
                try {
                    console.log('Adding user to shared account');
                    await sharedAccountApi.addUserToSharedAccount(session.user.id, pendingSharedAccountCode);
                    setPendingSharedAccountCode(null);
                    navigate('/');
                } catch (error) {
                    console.error('Error adding user to shared account:', error);
                    setError('Failed to join shared account. Please try again.');
                }
            }
        };

        handleSharedAccount();
    }, [session, pendingSharedAccountCode, sharedAccountApi, navigate]);

    // Handle Google Sign-In
    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams(document.location.search);
        const uniqueCode = params.get('code');

        try {
            // If there's an invitation code, include it in the redirect URL
            const redirectTo = uniqueCode 
                ? `${window.location.origin}/auth/callback?code=${uniqueCode}`
                : `${window.location.origin}/auth/callback`;

            const result = await signInWithGoogle(redirectTo);
            if (!result.success) {
                setError('Failed to sign in with Google. Please try again.');
            }
        } catch (error) {
            console.error('An error occurred during Google sign-in: ', error);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const onSubmit = async (data: RegisterFormData) => {
        setLoading(true);
        setError('');

        const params = new URLSearchParams(document.location.search);
        const uniqueCode = params.get('code');

        try {
            const result = await signUp(data.email, data.password, data.name);

            if (result.success && result.data?.user) {
                if (uniqueCode) {
                    // Store the code and wait for session to be available
                    setPendingSharedAccountCode(uniqueCode);
                } else {
                    navigate('/');
                }
            } else {
                setError('Failed to create account. Please try again.');
                console.error('Sign-up failed:', result);
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full flex flex-col justify-center items-center'>
            <h1 className='text-emerald-500 text-3xl text-center m-10'>Get WiseTogether Now</h1>

            {/* Google Sign Up Button */}
            <div className='w-2/3 flex justify-center items-center p-6'>
                <button 
                    type='button' 
                    onClick={handleGoogleSignIn}
                    className='flex items-center justify-center gap-4 w-3/4 py-2 px-4 rounded-md border-emerald-500 border-1 text-stone-500 hover:bg-gray-50 transition-colors duration-200'
                    disabled={loading}>
                    <FcGoogle className="text-xl" />Sign up with Google
                </button>
            </div>

            {/* OR separator */}
            <div className='flex items-center justify-center w-2/3 my-4'>
                <hr className="flex-1 border-gray-200 border-1" />
                <span className="px-4 text-stone-700">or</span>
                <hr className="flex-1 border-gray-200 border-1" />
            </div>

            {/* Sign Up Form */}
            <div className='w-2/3 flex flex-col justify-center items-center mb-6'>
                <div className='w-3/4 border-solid border-black p-6'>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Name Input */}
                        <div className='flex gap-2 justify-center items-center mb-6'>
                            <input
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='text'
                                {...register('name')}
                                placeholder='Full Name'
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs w-full">{errors.name.message}</p>
                            )}
                        </div>

                        {/* Email Input */}
                        <div className='space-y-4 flex flex-col justify-center items-center mb-6'>
                            <input
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='email'
                                {...register('email')}
                                placeholder='Email'
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs w-full">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className='gap-2 flex flex-col justify-center items-left mb-6'>
                            <input 
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='password'
                                {...register('password')}
                                placeholder='Password'
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs w-full">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className='gap-2 flex flex-col justify-center items-left mb-6'>
                            <input 
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='password'
                                {...register('confirmPassword')}
                                placeholder='Confirm Password'
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs w-full">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs text-center mb-4">{error}</p>
                        )}

                        {/* Submit Button */}
                        <div className='flex justify-center items-center w-full'>
                            <button 
                                type='submit' 
                                className='w-full py-2 px-4 rounded-md text-white bg-emerald-500 hover:cursor-pointer'
                                disabled={loading}>
                                {loading ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Link to Login page */}
                <Link to='/login' className='text-emerald-500 text-xs text-center underline'>Do you already have an account? Sign in</Link>
            </div>
        </div>
    )
}

export default Register;
