import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from './AuthContext';


const Login = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');

    const { signIn } = useAuth();
    const navigate = useNavigate();

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Call signIn method from AuthContext to authenticate the user
            const result = await signIn(email, password);
            if (result.success) {
                navigate('/'); // If successful, navigate to the dashboard
            } else {
                setError('Incorrect email or password')
            }
        } catch (error) {
            console.error('An error occured during sign-in: ', error);
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='w-full flex flex-col justify-center items-center'>
            <h1 className='text-emerald-500 text-3xl text-center m-10'>Welcome Back!</h1>

            {/* Google Sign-In Button */}
            <div className='w-2/3 flex justify-center items-center p-6'>
                <button 
                    type='submit' 
                    className='flex items-center justify-center gap-4 w-3/4 py-2 px-4 rounded-md border-emerald-500 border-1 text-stone-500 hover:cursor-pointer'
                    disabled={loading}>
                <FcGoogle />Sign in with Google</button>
            </div>

            {/* OR separator */}
            <div className='flex items-center justify-center w-2/3 my-4'>
                <hr className="flex-1 border-gray-200 border-1" />
                <span className="px-4 text-stone-700">or</span>
                <hr className="flex-1 border-gray-200 border-1" />
            </div>

            {/* Sign-In Form */}
            <div className='w-2/3 flex flex-col justify-center items-center mb-6'>
                <div className='w-3/4 border-solid border-black p-6'>
                    <form onSubmit={handleSubmit}>
                        {/* Email Input */}
                        <div className='gap-2 flex flex-col justify-center items-center mb-6'>
                            <input
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='email'
                                name='email'
                                value={email}
                                placeholder='Email'
                                required={true}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        {/* Password Input */}
                        <div className='gap-2 flex flex-col justify-center items-left mb-6'>
                            <input 
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='password'
                                name='password'
                                value={password}
                                placeholder='Password'
                                required={true}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {error && <p className="text-red-500 text-xs">{error}</p>}               
                        </div>

                        {/* Submit Button */}
                        <div className='flex justify-center items-center w-full'>
                            <button 
                                type='submit' 
                                className='w-full py-2 px-4 rounded-md bg-emerald-500 text-white hover:cursor-pointer'
                                disabled={loading}>
                            Sign in</button>
                        </div>
                    </form>
                </div>
                
                {/* Link to Registration page */}
                <Link to='/register' className='text-emerald-500 text-xs text-center underline'>Don't have an account? Sign up</Link>
            </div>



        </div>
    )
}

export default Login