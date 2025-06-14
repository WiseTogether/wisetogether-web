import { useState, useMemo } from 'react'
import { PiUsers } from "react-icons/pi";
import { RiMoneyCnyCircleLine } from "react-icons/ri";
import { AiOutlineProfile } from "react-icons/ai";
import InvitationCard from '../components/dashboard/InvitationCard';
import { useAuth } from '../auth/AuthContext';
import { createSharedAccountApi } from '../api/sharedAccountApi'
import PieChart from '../components/dashboard/PieChart';
import { FadeLoader } from 'react-spinners';
import { useSharedAccountData } from '../hooks/useSharedAccountData'
import { useTransactionsData } from '../hooks/useTransactionsData'
import CTACard from '../components/dashboard/CTACard';

const Dashboard: React.FC = () => {
  const { session, apiRequest } = useAuth()
  const sharedAccountApi = createSharedAccountApi(apiRequest)

  // Get shared account data
  const { 
    sharedAccount,
    invitationLink,
    isInvitedByPartner,
    isSharedAccountLoading,
    refreshSharedAccount
  } = useSharedAccountData()

  // Get transactions data
  const {
    transactions,
    personalTotal,
    sharedTotal,
    isTransactionsLoading
  } = useTransactionsData(sharedAccount?.uuid ?? null)

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Memoize expense breakdown calculation
  const { expensesByCategoryData, expenseCategories } = useMemo(() => {
    if (!transactions.length) return { expensesByCategoryData: [], expenseCategories: [] }

    const categories = ['Groceries', 'Rent', 'Utilities', 'Insurance', 'Transportation', 'Dining Out', 'Entertainment', 'Healthcare', 'Personal Care', 'Miscellaneous']
    const breakdown = categories.map((category) => {
      const categoryTotal = transactions
        .filter((transaction) => transaction.category === category)
        .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0)
      return categoryTotal
    })

    // Filter out categories with zero total
    const categoriesWithTotals = categories.filter((_, index) => breakdown[index] > 0)

    return {
      expensesByCategoryData: breakdown,
      expenseCategories: categoriesWithTotals
    }
  }, [transactions])

  // Open modal to invite partner and create shared account if necessary
  const openModal = async () => {
    // If no invitation link exists, create a new one
    if (!invitationLink) {
      const uniqueCode = Math.random().toString(36).substring(2, 8)

      if (session?.user) {
        try {
          // Create a shared account for the user
          await sharedAccountApi.createSharedAccount(session.user.id, uniqueCode)
          await refreshSharedAccount() // Refresh shared account data after creation
        } catch (error) {
          console.error('Error while creating shared account:', error)
        }
      }
    }
    
    setIsModalOpen(true)
  }

  if (isSharedAccountLoading || isTransactionsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <FadeLoader />
      </div>
    )
  }

  return (
    <div className='flex flex-col p-6 gap-4 items-center justify-center'>
      
      {/* Displayed when there are no transactions */}
      {transactions.length === 0 && (
        <>
          <div className='text-center space-y-2'>
            <h1 className='text-emerald-500 text-2xl font-bold'>Welcome to WiseTogether!</h1>
            <p className='text-gray-400'>Feel free to explore, or get started on managing your finances together.</p>
          </div>

          <div className='flex p-6 gap-4 items-center justify-center'>
            <CTACard
              icon={<RiMoneyCnyCircleLine fontSize={50} color={'#10B981'}/>}
              title="Add an expense"
              description="Add your first expense to get a sense of how things work."
              linkTo="/transactions"
            />

            {!isInvitedByPartner && (
              <CTACard
                icon={<PiUsers fontSize={50} color={'white'}/>}
                title="Track shared expenses"
                description="Invite your partner to set up a shared account."
                onClick={openModal}
                bgColor="bg-emerald-400"
                textColor="text-white"
                iconColor="white"
              />
            )}

            <CTACard
              icon={<AiOutlineProfile fontSize={50} color={'#10B981'}/>}
              title="Set up your profile"
              description="Personalize with a photo and preferences."
              linkTo="/settings"
            />
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
      {transactions.length > 0 && (
        <div className='flex gap-5 w-full justify-center items-center'>
          {/* Pie charts displaying expenses */}
          <div className='flex-1 flex flex-col justify-center items-center gap-2 w-1/2 h-120 shadow-sm bg-white p-10 text-center'>
            <h2 className='flex-1 font-bold text-stone-600'>Personal vs Shared Expenses</h2>
            <PieChart 
              data={[personalTotal, sharedTotal]} 
              labels={['Personal', 'Shared']} 
              title={'Personal vs Shared Expenses'} 
            />
          </div>
          <div className='flex-1 flex flex-col justify-center items-center gap-2 w-1/2 h-120 shadow-sm bg-white p-10 text-center'>
            <h2 className='flex-1 font-bold text-stone-600'>Expense Category Breakdown</h2>
            <PieChart 
              data={expensesByCategoryData} 
              labels={expenseCategories} 
              title={'Expense Category Breakdown'} 
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard;
