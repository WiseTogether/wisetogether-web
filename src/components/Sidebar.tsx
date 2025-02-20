import { SetStateAction, Dispatch } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './Auth/AuthContext';
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

interface SidebarProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen}) => {

  // Function to toggle the sidebar open/close
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Function to handle the logout process
  const handleLogout = async () => {
    try {
        await signOut(); // Sign the user out
        navigate('/login'); // Redirect to login page after successful logout
    } catch (error) {
        console.error('An error occured: ', error)
    }
  }
    
  return (
    <div className={`fixed top-0 left-0 h-full bg-emerald-500 text-white transition-all duration-300 z-60 ${
          isOpen ? 'w-64 p-6' : 'w-16 py-6 px-2'
        }`}>
      
      {/* Sidebar header with the app name and toggle button */}
      <div className='flex items-center mb-6'>
        <h2 className={`flex-1 text-2xl font-semibold ${isOpen ? 'block' : 'hidden'}`}>WiseTogether</h2>
        <button className='py-2 px-4 rounded-lg hover:bg-emerald-700' onClick={toggleSidebar}>
            {isOpen ? <FaAnglesLeft /> : <FaAnglesRight />}
        </button>
      </div>

      {/* Sidebar navigation links */}
      <nav>
        <ul>
          <li className={`navbar-link ${isOpen ? 'block' : 'hidden'}`}>
            <Link to='/'>Dashboard</Link>
          </li>
          <li className={`navbar-link ${isOpen ? 'block' : 'hidden'}`}>
            <Link to='/transactions'>Transactions</Link>
          </li>
          <li className={`navbar-link ${isOpen ? 'block' : 'hidden'}`}>
            <Link to='/settings'>Settings</Link>
          </li>
          <li className={`navbar-link ${isOpen ? 'block' : 'hidden'}`} onClick={handleLogout}>
            Logout
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar;
