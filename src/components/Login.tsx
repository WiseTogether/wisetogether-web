import { useState } from 'react'
import { Link } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";

const Login = () => {

    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    return (
        <div className='w-full flex flex-col justify-center items-center'>
            <h1 className='text-emerald-500 text-3xl text-center m-10'>Welcome Back!</h1>
            <div className='w-2/3 flex justify-center items-center p-6'>
                <button 
                    type='submit' 
                    className='flex items-center justify-center gap-4 w-3/4 py-2 px-4 rounded-md border-emerald-500 border-1 text-stone-500 hover:cursor-pointer'
                    disabled={loading}>
                <FcGoogle />Sign in with Google</button>
            </div>

            <div className='flex items-center justify-center w-2/3 my-4'>
                <hr className="flex-1 border-gray-200 border-1" />
                <span className="px-4 text-stone-700">or</span>
                <hr className="flex-1 border-gray-200 border-1" />
            </div>

            <div className='w-2/3 flex flex-col justify-center items-center mb-6'>
                <div className='w-full border-solid border-black p-6'>
                    <form>
                        <div className='space-y-4 flex flex-col justify-center items-center mb-6'>
                            <input
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-3/4' 
                                type='email'
                                placeholder='Email'
                                required={true}
                            />
                        </div>

                        <div className='space-y-4 flex flex-col justify-center items-center mb-6'>
                            <input 
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-3/4' 
                                type='password'
                                placeholder='Password'
                                required={true}
                            />                    
                        </div>

                        <div className='flex justify-center items-center w-full'>
                            <button 
                                type='submit' 
                                className='w-3/4 py-2 px-4 rounded-md bg-emerald-500 text-white hover:cursor-pointer'
                                disabled={loading}>
                            Sign in</button>
                        </div>
                    </form>
                </div>
                <Link to='/login' className='text-emerald-500 text-xs text-center underline'>Don't have an account? Sign up</Link>
            </div>



        </div>
    )
}

export default Login
