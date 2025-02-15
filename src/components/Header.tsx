import React from 'react'
import userIcon from '../../public/user-icon.jpg'

function Header() {
  return (
    <div className='flex items-center gap-4 bg-white p-6'>
      <h2 className='flex-1'>Dashboard</h2>
      <h3>Hi, user!</h3>
      <img src={userIcon} className='h-10 w-10 rounded-full'></img>
    </div>
  )
}

export default Header
