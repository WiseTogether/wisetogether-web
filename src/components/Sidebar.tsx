import { SetStateAction, Dispatch } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from './context/AuthContext';
import { FaAnglesLeft, FaAnglesRight } from "react-icons/fa6";

interface SidebarProps {
    isOpen: boolean,
    setIsOpen: Dispatch<SetStateAction<boolean>>,
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen}) => {

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  }

  const { signOut } = UserAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        await signOut();
        navigate('/login');
    } catch (error) {
        console.error('An error occured: ', error)
    }
  }
    
  return (
    <div className={`fixed top-0 left-0 h-full bg-emerald-500 text-white transition-all duration-300 ${
          isOpen ? 'w-64 p-6' : 'w-16 py-6 px-2'
        }`}>
      <div className='flex items-center mb-6'>
        <h2 className={`flex-1 text-2xl font-semibold ${isOpen ? 'block' : 'hidden'}`}>WiseTogether</h2>
        <button className='py-2 px-4 rounded-lg hover:bg-emerald-700' onClick={toggleSidebar}>
            {isOpen ? <FaAnglesLeft /> : <FaAnglesRight />}
        </button>
      </div>
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
