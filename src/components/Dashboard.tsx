import React from 'react'

const Dashboard = () => {
  return (
    <div className='flex p-6 gap-4'>
        <div className='flex-1 w-xs h-64 shadow-sm bg-white p-6'>
            Graph 1
        </div>
        <div className='flex-1 w-xs h-64 shadow-sm bg-white p-6'>
            Graph 2
        </div>
    </div>
  )
}

export default Dashboard;
