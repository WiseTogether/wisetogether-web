import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {

    const [isOpen, setIsOpen] = useState<boolean>(true);
  
    return (
        <div className='flex h-full'>
            {/* Sidebar */}
            <Sidebar isOpen={isOpen}setIsOpen={setIsOpen}/>

            {/* Main Content */}
            <div className={`${isOpen ? 'ml-64' : 'ml-16'} flex-1 transition-all duration-300 bg-blue-50 text-stone-700`}>
                <Header />

                {/* Outlet will render the page content */}
                <Outlet />
            </div>
        </div>
    )
}

export default Layout
