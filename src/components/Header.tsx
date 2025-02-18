import React from 'react'
import userIcon from '../assets/user-icon.jpg'
import { useAuth } from './Auth/AuthContext';


function Header() {

  const { user } = useAuth();

  return (
    <div className='flex items-center gap-4 bg-white p-6'>
      <h2 className='flex-1'>Dashboard</h2>
      <h3>Hi, {user?.name}!</h3>
      <img src={userIcon} className='h-10 w-10 rounded-full'></img>
    </div>
  )
}

export default Header
