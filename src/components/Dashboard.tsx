import { useState, useEffect } from 'react'
import { PiUsers } from "react-icons/pi";
import { RiMoneyCnyCircleLine } from "react-icons/ri";
import { AiOutlineProfile } from "react-icons/ai";
import { Link } from 'react-router-dom';
import InvitationCard from './InvitationCard';
import { useAuth } from '../auth/AuthContext';
import { createSharedAccount } from '../api/sharedAccountApi'
import { transaction } from '../App';
import PieChart from './PieChart';


interface DashboardProps {
  invitationLink: string;
  setInvitationLink: React.Dispatch<React.SetStateAction<string>>;
  isInvitedByPartner: boolean;
  allTransactions: transaction[];
}

const Dashboard: React.FC<DashboardProps> = ({ invitationLink, setInvitationLink, isInvitedByPartner, allTransactions }) => {

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [expenseByType, setExpenseByType] = useState<number[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);

  const { session } = useAuth();

  // Effect to calculate personal and shared expenses based on all transactions
  useEffect(() => {
    const personalTransactions = allTransactions.filter(transaction => !transaction.sharedAccountId);
    const sharedTransactions = allTransactions.filter(transaction => transaction.sharedAccountId);

    const personalTotal = personalTransactions.reduce((total, transaction) => total + Number(transaction.amount), 0);
    const sharedTotal = sharedTransactions.reduce((total, transaction) => total + Number(transaction.amount), 0);

    setExpenseByType([personalTotal, sharedTotal])

  }, [allTransactions])

  // Open modal to invite partner and create shared account if necessary
  const openModal = async () => {
    // If no invitation link exists, create a new one
    if (!invitationLink) {
      const uniqueCode = Math.random().toString(36).substring(2, 8);
      const newInvitationLink = `${import.meta.env.VITE_APP_BASE_URL}/invite?code=${uniqueCode}`;

      setInvitationLink(newInvitationLink);

      if (session && session.user) {
        try {
          // Create a shared account for the user
          await createSharedAccount(session.user.id, uniqueCode);
        } catch (error) {
          console.error('Error while creating shared account:', error);
        }
      }
    }
    
    setIsModalOpen(true);
  }

  // Calculate expense breakdown by category
  const calculateExpenseBreakdown = () => {
    if (!allTransactions.length) return [];

    const categories = ['Groceries', 'Rent', 'Utilities', 'Insurance', 'Transportation', 'Dining Out', 'Entertainment', 'Healthcare', 'Personal Care', 'Miscellaneous']
    const breakdown = categories.map((category) => {

        // Calculate total amount for each category
        const categoryTotal = allTransactions
            .filter((transaction) => transaction.category === category)
            .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
        return categoryTotal;
    });

    // Filter out categories with zero total
    const categoriesWithTotals = categories.filter((_, index) => breakdown[index] > 0);

    // Update the categories list if it's different from the current state
    if (JSON.stringify(categoriesWithTotals) !== JSON.stringify(expenseCategories)) {
      setExpenseCategories(categoriesWithTotals);
    }

    return breakdown;
  };

  // Data for pie charts
  const expensesByCategoryData = calculateExpenseBreakdown();

  return (
    <div className='flex flex-col p-6 gap-4 items-center justify-center'>
      
      {/* Displayed when there are no transactions */}
      {allTransactions.length === 0 && (
        <>
          <div className='text-center space-y-2'>
            <h1 className='text-emerald-500 text-2xl font-bold'>Welcome to WiseTogether!</h1>
            <p className='text-gray-400'>Feel free to explore, or get started on managing your finances together.</p>
          </div>

          <div className='flex p-6 gap-4 items-center justify-center'>
            {/* Prompt to add an expense */}
            <Link to='/transactions'>
              <div className='flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm bg-white p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'>
                <RiMoneyCnyCircleLine fontSize={50} color={'#10B981'}/>
                <h1 className='text-emerald-500 text-xl'>Add an expense</h1>
                <p className='text-gray-400 text-sm'>Add your first expense to get a sense of how things work.</p>
              </div>
            </Link>

            {/* Prompt to create a shared account */}
            {!isInvitedByPartner && 
              <div className='flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm bg-emerald-400 p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'
                onClick={openModal}>
                <PiUsers fontSize={50} color={'white'}/>
                <h1 className='text-white text-xl'>Track shared expenses</h1>
                <p className='text-white text-sm'>Invite your partner to set up a shared account.</p>
              </div>
            }

            {/* Prompt to set up user profile */}
            <Link to='/settings'>
              <div className='flex-1 flex flex-col justify-center items-center gap-2 w-xs h-64 shadow-sm bg-white p-6 text-center hover:cursor-pointer hover:scale-105 hover:shadow-lg transition-transform duration-300'>
                <AiOutlineProfile fontSize={50} color={'#10B981'}/>
                <h1 className='text-emerald-500 text-xl'>Set up your profile</h1>
                <p className='text-gray-400 text-sm'>Personalize with a photo and preferences.</p>
              </div>  
            </Link>
          </div>
        </>
      )}

      {/* Modal to display invitation card */}
      {isModalOpen && (
        <div>
            <div className='fixed inset-0 bg-black opacity-50 z-40'>
            </div>

            {/* Invitation Card Modal */}
            <InvitationCard setIsModalOpen={setIsModalOpen} invitationLink={invitationLink}/>
        </div>
      )}

      {/* Displayed when there are transactions */}
      {allTransactions.length > 0 && (
        <div className='flex gap-5 w-full justify-center items-center'>
          {/* Pie charts displaying expenses */}
          <div className='flex-1 flex flex-col justify-center items-center gap-2 w-1/2 h-120 shadow-sm bg-white p-10 text-center'>
            <h2 className='flex-1 font-bold text-stone-600'>Personal vs Shared Expenses</h2>
            <PieChart data={expenseByType} labels={['Personal', 'Shared']} title={'Personal vs Shared Expenses'} />
          </div>
          <div className='flex-1 flex flex-col justify-center items-center gap-2 w-1/2 h-120 shadow-sm bg-white p-10 text-center'>
            <h2 className='flex-1 font-bold text-stone-600'>Expense Category Breakdown</h2>
            <PieChart data={expensesByCategoryData} labels={expenseCategories} title={'Expense Category Breakdown'} />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard;
