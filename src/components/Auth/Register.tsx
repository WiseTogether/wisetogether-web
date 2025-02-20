import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import { useAuth } from './AuthContext';
import { createUserProfile } from '../../api/userApi';
import { addUserToSharedAccount } from '../../api/sharedAccountApi'


function Register() {

    const [loading, setLoading] = useState<boolean>(false);
    const [signUpForm, setSignUpForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [errors, setErrors] = useState({
        password: '',
        confirmPassword: '',
    });

    const { signUp } = useAuth();
    const navigate = useNavigate();

    // Handles changes in the form input fields
    const handleChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newErrors = { ...errors };

        // Validate password length
        if (name === 'password' && value.length < 6) {
            newErrors.password = 'Please enter at least 6 digits.';
        } else {
            newErrors.password = '';
        }

        // Validate password confirmation
        if (name === 'confirmPassword' && value!= signUpForm.password) {
            newErrors.confirmPassword = `Passwords don't match.`;
        } else {
            newErrors.confirmPassword = '';
        }

        setErrors(newErrors);
        setSignUpForm({ ...signUpForm, [name]: value });
    };

    // Handles form submission
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        const params = new URLSearchParams(document.location.search); // Retrieve the URL parameters
        const uniqueCode = params.get('code'); // Extract 'code' from URL, if available
        
        try {
            const result = await signUp(signUpForm.email, signUpForm.password); // Call signUp from AuthContext

            if (result.success && result.data && result.data.user) {
                // If sign-up is successful, create user profile
                await createUserProfile(result.data.user.id, signUpForm.name)
                
                // If there's a unique code, add the user to a shared account
                if (uniqueCode) {
                    await addUserToSharedAccount(result.data.user.id, uniqueCode)
                }

                navigate('/'); // Redirect to the dashboard after successful registration
            } else {
                console.error('Sign-up failed:', result)
            }
        } catch (error) {
            console.error('An error occured: ', error)
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='w-full flex flex-col justify-center items-center'>
            <h1 className='text-emerald-500 text-3xl text-center m-10'>Get WiseTogether Now</h1>

            {/* Google Sign Up Button */}
            <div className='w-2/3 flex justify-center items-center p-6'>
                <button 
                    type='submit' 
                    className='flex items-center justify-center gap-4 w-3/4 py-2 px-4 rounded-md border-emerald-500 border-1 text-stone-500 hover:cursor-pointer'
                    disabled={loading}>
                <FcGoogle />Sign up with Google</button>
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
                    <form onSubmit={handleSubmit}>
                        {/* Name Input */}
                        <div className='flex gap-2 justify-center items-center mb-6'>
                            <input
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='text'
                                name='name'
                                value={signUpForm.name}
                                placeholder='Full Name'
                                required={true}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Email Input */}
                        <div className='space-y-4 flex flex-col justify-center items-center mb-6'>
                            <input
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='email'
                                name='email'
                                value={signUpForm.email}
                                placeholder='Email'
                                required={true}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Password Input */}
                        <div className='gap-2 flex flex-col justify-center items-left mb-6'>
                            <input 
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='password'
                                name='password'
                                value={signUpForm.password}
                                placeholder='Password'
                                required={true}
                                onChange={handleChange}
                            />
                            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}                    
                        </div>

                        {/* Confirm Password Input */}
                        <div className='gap-2 flex flex-col justify-center items-left mb-6'>
                            <input 
                                className='border-solid border-gray-200 border-1 inset-shadow-xs p-2 w-full' 
                                type='password'
                                name='confirmPassword'
                                value={signUpForm.confirmPassword}
                                placeholder='Confirm Password'
                                required={true}
                                onChange={handleChange}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword}</p>}          
                        </div>

                        {/* Submit Button */}
                        <div className='flex justify-center items-center w-full'>
                            <button 
                                type='submit' 
                                className='w-full py-2 px-4 rounded-md text-white bg-emerald-500 hover:cursor-pointer'
                                disabled={loading}>
                            Create Account</button>
                        </div>
                    </form>
                </div>

                {/* Link to Login page if the user already has an account */}
                <Link to='/login' className='text-emerald-500 text-xs text-center underline'>Do you already have an account? Sign in</Link>
            </div>
            
        </div>
    )
}

export default Register
