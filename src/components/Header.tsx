import userIcon from '../assets/user-icon.jpg'
import { useAuth } from './Auth/AuthContext';
import { useLocation } from 'react-router-dom';

function Header() {

  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className='flex items-center gap-4 bg-white p-6'>
      <h2 className='flex-1'>
        {location.pathname === '/transactions' ? 'Transactions' 
        : location.pathname === '/settings' ? 'Settings' 
        : 'Dashboard'}
      </h2>
      {user && <h3>Hi, {user.name}!</h3>}
      <img 
        src={user?.avatarUrl ? user.avatarUrl : userIcon} 
        className='h-10 w-10 rounded-full'
      />
    </div>
  )
}

export default Header
