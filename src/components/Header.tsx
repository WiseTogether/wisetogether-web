import userIcon from '../assets/user-icon.jpg'
import { useAuth } from '../auth/AuthContext';
import { useLocation } from 'react-router-dom';

function Header() {

  const { userProfile } = useAuth();
  const location = useLocation();

  return (
    <div className='flex items-center gap-4 bg-white p-6'>
      <h2 className='flex-1'>
        {location.pathname === '/transactions' ? 'Transactions' 
        : location.pathname === '/settings' ? 'Settings' 
        : 'Dashboard'}
      </h2>
      {userProfile && <h3>Hi, {userProfile.name}!</h3>}
      <img 
        src={userProfile?.avatarUrl ? userProfile.avatarUrl : userIcon} 
        className='h-10 w-10 rounded-full'
      />
    </div>
  )
}

export default Header
