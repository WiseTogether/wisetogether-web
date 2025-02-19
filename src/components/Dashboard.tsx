import { useState } from 'react'
import { PiUsers } from "react-icons/pi";
import { RiMoneyCnyCircleLine } from "react-icons/ri";
import { AiOutlineProfile } from "react-icons/ai";
import { Link } from 'react-router-dom';
import InvitationCard from './InvitationCard';
import { useAuth } from './Auth/AuthContext';
import { createSharedAccount } from '../api/sharedAccountApi'
import { transaction } from '../App';

interface DashboardProps {
  invitationLink: string;
  setInvitationLink: React.Dispatch<React.SetStateAction<string>>;
  isInvitedByPartner: boolean;
  allTransactions: transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ invitationLink, setInvitationLink, isInvitedByPartner, allTransactions }) => {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const { session } = useAuth();

  const openModal = async () => {
    // If no invitation link exists, create a new one
    if (!invitationLink) {
      const uniqueCode = Math.random().toString(36).substring(2, 8);
      const newInvitationLink = `http://localhost:5173/invite?code=${uniqueCode}`;

      setInvitationLink(newInvitationLink);

      if (session && session.user) {
        try {
          await createSharedAccount(session.user.id, uniqueCode);
        } catch (error) {
          console.error('Error while creating shared account:', error);
        }
      }
    }
    
    setIsModalOpen(true);
  }

  return (
    // first-time users
    
      <div className='flex flex-col p-6 gap-4 items-center justify-center'>
        
        <div className='text-center space-y-2'>
          <h1 className='text-emerald-500 text-2xl font-bold'>Welcome to WiseTogether!</h1>
          <p className='text-gray-400'>Feel free to explore, or get started on managing your finances together.</p>
        </div>

        {allTransactions.length === 0 &&
          <div className='flex p-6 gap-4 items-center justify-center'>
            <Link to='/transactions'>
              <div className='flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm bg-white p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'>
                <RiMoneyCnyCircleLine fontSize={50} color={'#10B981'}/>
                <h1 className='text-emerald-500 text-xl'>Add an expense</h1>
                <p className='text-gray-400 text-sm'>Add your first expense to get a sense of how things work.</p>
              </div>
            </Link>

            <div className='flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm bg-emerald-400 p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'
              onClick={openModal}>
              <PiUsers fontSize={50} color={'white'}/>
              <h1 className='text-white text-xl'>Track shared expenses</h1>
              <p className='text-white text-sm'>Invite your partner to set up a shared account.</p>
            </div>

            <Link to='/settings'>
              <div className='flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm bg-white p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'>
                <AiOutlineProfile fontSize={50} color={'#10B981'}/>
                <h1 className='text-emerald-500 text-xl'>Set up your profile</h1>
                <p className='text-gray-400 text-sm'>Personalize with a photo and preferences.</p>
              </div>  
            </Link>
          </div>
        }

        {isModalOpen && (
          <div>
              <div className='fixed inset-0 bg-black opacity-50 z-40'>
              </div>

              {/* Invitation Card Modal */}
              <InvitationCard setIsModalOpen={setIsModalOpen} invitationLink={invitationLink}/>
          </div>
        )}

      </div>
    


    // No transactions




    // Graphs
    // <div className='flex p-6 gap-4'>
    //     <div className='flex-1 w-xs h-64 shadow-sm bg-white p-6'>
    //         Graph 1
    //     </div>
    //     <div className='flex-1 w-xs h-64 shadow-sm bg-white p-6'>
    //         Graph 2
    //     </div>
    // </div>
  )
}

export default Dashboard;
