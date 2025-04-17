import { useState, useEffect, useRef } from 'react'
import { FaPlus } from "react-icons/fa";
import { FiEdit, FiTrash2, FiInfo } from "react-icons/fi";
import NewTransaction from './NewTransaction';
import userIcon from '../assets/user-icon.jpg'
import { transaction, sharedAccount } from '../App';
import { useAuth, UserProfile } from '../auth/AuthContext';

interface TransactionsProps {
    allTransactions: transaction[];
    setAllTransactions: React.Dispatch<React.SetStateAction<transaction[]>>;
    sharedAccountDetails: sharedAccount|null;
    partnerProfile: UserProfile|null
}

const Transactions: React.FC<TransactionsProps> = ({ allTransactions, setAllTransactions, sharedAccountDetails, partnerProfile }) => {

    const [activeTab, setActiveTab] = useState<string>('all');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
    const [personalTransactions, setPersonalTransactions] = useState<transaction[]>([]);
    const [sharedTransactions, setSharedTransactions] = useState<transaction[]>([]);
    const [editTransaction, setEditTransaction] = useState<transaction>();
    const [modalType, setModalType] = useState<string>('');
    const [expenseType, setExpenseType] = useState<string>('personal');
    const [file, setFile] = useState<File | null>(null);

    const { session, user } = useAuth();

    // useEffect hook to filter and set personal and shared transactions
    useEffect(() => {
        setPersonalTransactions(allTransactions.filter((transaction) => !transaction.sharedAccountId));
        setSharedTransactions(allTransactions.filter((transaction) => transaction.sharedAccountId));
    },[activeTab])

    // open modal for creating/editing transactions
    const openModal = (type:string) => {
        setModalType(type)
        setExpenseType(activeTab === 'shared' ? 'shared' : 'personal');
        setIsTransactionModalOpen(true);
    }

    // Close the transaction modal
    const closeModal = () => {
        setIsTransactionModalOpen(false);
    }

    // Handle opening a modal for editing a transaction
    const handleEdit = (transaction:transaction) => {
        setEditTransaction({...transaction});
        openModal('edit');
    }

    // Handle image file change
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };
    
    const inputRef = useRef<HTMLInputElement>(null);

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!inputRef || !inputRef.current) return;
        inputRef.current.click();
    }

    useEffect(() => {
        
    },[file])
    
    return (
        <div className='w-full p-6'>
            <div className='shadow-sm bg-white p-6'>

                {/* Tabs Navigation */}
                <div className='flex'>
                    <button 
                        onClick={() => setActiveTab('all')}
                        className={`tab ${activeTab === 'all' ? 'bg-gray-200' : 'bg-gray-50'}`}
                    > All
                    </button>
                    <button 
                        onClick={() => setActiveTab('personal')}
                        className={`tab ${activeTab === 'personal' ? 'bg-gray-200' : 'bg-gray-50'}`}
                    > Personal
                    </button>
                    <button 
                        onClick={() => setActiveTab('shared')}
                        className={`tab ${activeTab === 'shared' ? 'bg-gray-200' : 'bg-gray-50'}`}
                    > Shared
                    </button>

                    {/* Button to add a new transaction */}
                    <button 
                        className='ml-auto inline-flex items-center text-emerald-500 p-2 mb-2 hover:cursor-pointer hover:text-emerald-300'
                        onClick={() => openModal('new')}>
                            <FaPlus className='mr-2'/> Add transaction
                    </button>

                    {/* Add File Upload Button */}
                    <form>
                        <button className='ml-2 p-2 h-10 bg-[#3B429F] text-white rounded' onClick={handleButtonClick}>Upload Receipt</button>
                        <input 
                            type='file' 
                            ref={inputRef}
                            accept='image/*,application/pdf'
                            onChange={handleFileUpload}
                            className='absolute -left-full'
                        />
                        
                    </form>
                </div>

                {/* Conditional rendering of tables based on active tab */}
                {activeTab === 'all' ? (
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-gray-200'>
                                <th className='p-2 text-center'> </th>
                                <th className='p-2 text-center'>Date</th>
                                <th className='p-2 text-center'>Category</th>
                                <th className='p-2 text-center'>Amount</th>
                                <th className='p-2 text-center'> </th>
                            </tr>
                        </thead>

                        <tbody>
                            {allTransactions.length ? 
                                allTransactions.map((transaction, index) => (
                                    <tr key={index}>
                                        {/* Display transaction type (shared or personal) */}
                                        <td className='p-2 text-center'>
                                            <button className={`p-2 w-full rounded-md 
                                                ${transaction.sharedAccountId ? 'bg-orange-100' : 'bg-purple-100'}`}>
                                            {transaction.sharedAccountId ? 'shared' : 'personal'}</button>
                                        </td>
                                        {/* Format and display the date */}
                                        <td className='p-2 text-center'>{new Date(transaction.date).toLocaleDateString('en-US')}</td>
                                        {/* Display transaction category and description */}
                                        <td className='p-2 text-left'>
                                            <div className='flex items-center gap-2'>
                                                <p>{transaction.category}</p>

                                                {/* Info icon for tooltip */}
                                                {transaction.description && (
                                                    <span className='relative group'>
                                                        <FiInfo className='text-gray-400 cursor-pointer' />
                                                        
                                                        {/* Tooltip for description */}
                                                        <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 text-xs bg-gray-800 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'>
                                                            {transaction.description}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        {/* Display transaction amount */}
                                        <td className='p-2 text-center'>¥ {Number(transaction.amount).toLocaleString()}</td>
                                        <td className='p-2 text-right '>
                                            {/* Edit and Delete icons */}
                                            <div className='flex justify-center items-center'>
                                                <FiEdit className='ml-2 hover:cursor-pointer' onClick={() => handleEdit(transaction)}/>
                                                <FiTrash2 className='ml-2 hover:cursor-pointer'/>
                                            </div>
                                        </td>
                                    </tr>
                                )) :
                                (<tr>
                                    <td colSpan={5} className='p-6 text-center'>No data available</td>
                                </tr>)
                            }
                        </tbody>
                    </table>
                ) : activeTab === 'personal' ? (
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-gray-200'>
                                <th className='p-2 text-center'>Date</th>
                                <th className='p-2 text-center'>Category</th>
                                <th className='p-2 text-center'>Amount</th>
                                <th className='p-2 text-center'> </th>
                            </tr>
                        </thead>

                        <tbody>
                            {personalTransactions.length ?
                                personalTransactions.map((transaction, index) => (
                                    <tr key={index}>
                                        <td className='p-2 text-center'>{new Date(transaction.date).toLocaleDateString('en-US')}</td>
                                        <td className='p-2 text-left'>
                                            <div className='flex items-center gap-2'>
                                                <p>{transaction.category}</p>

                                                {/* Info icon for tooltip */}
                                                {transaction.description && (
                                                    <span className='relative group'>
                                                        <FiInfo className='text-gray-400 cursor-pointer' />
                                                        
                                                        {/* Tooltip for description */}
                                                        <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 text-xs bg-gray-800 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'>
                                                            {transaction.description}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className='p-2 text-center'>¥ {Number(transaction.amount).toLocaleString()}</td>
                                        <td className='p-2 text-right '>
                                            <div className='flex justify-center items-center'>
                                                <FiEdit className='ml-2 hover:cursor-pointer' onClick={() => handleEdit(transaction)}/>
                                                <FiTrash2 className='ml-2 hover:cursor-pointer'/>
                                            </div>
                                        </td>
                                    </tr>
                                )) :
                                (<tr>
                                    <td colSpan={4} className='p-6 text-center'>No data available</td>
                                </tr>) 
                        }
                        </tbody>
                    </table>
                ) : (
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-gray-200'>
                                <th className='p-2 text-center'> </th>
                                <th className='p-2 text-center'>Date</th>
                                <th className='p-2 text-center'>Category</th>
                                <th className='p-2 text-center'>Amount</th>
                                <th className='p-2 text-center'> </th>
                            </tr>
                        </thead>

                        <tbody>
                            {sharedTransactions.length > 0 ?
                                sharedTransactions.map((transaction, index) => (
                                    <tr key={index}>
                                        {/* Display user avatar depending on who made the transaction */}
                                        <td className='p-2 justify-center'>
                                            <img src={transaction.userId === session?.user.id ? user?.avatarUrl : partnerProfile?.avatarUrl || userIcon } 
                                                className='h-10 w-10 rounded-full'>    
                                            </img>
                                        </td>
                                        {/* Date, Category, and Amount columns */}
                                        <td className='p-2 text-center'>{new Date(transaction.date).toLocaleDateString('en-US')}</td>
                                        <td className='p-2 text-left'>
                                            <div className='flex items-center gap-2'>
                                                <p>{transaction.category}</p>

                                                {/* Info icon for tooltip */}
                                                {transaction.description && (
                                                    <span className='relative group'>
                                                        <FiInfo className='text-gray-400 cursor-pointer' />
                                                        
                                                        {/* Tooltip for description */}
                                                        <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 text-xs bg-gray-800 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'>
                                                            {transaction.description}
                                                        </span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className='flex gap-4 p-2'>
                                            <div className='text-right w-25'>
                                                <p className='text-xs text-gray-400'>
                                                    {transaction.userId === session?.user.id ? 'you paid' : `${partnerProfile?.name} paid` || 'your partner paid'}
                                                </p>
                                                <p>¥ {Number(transaction.amount).toLocaleString()}</p>
                                            </div>
                                            <div className='text-left'>
                                                <p className='text-xs text-gray-400'>
                                                    {transaction.userId != session?.user.id ? 'you owe' : `${partnerProfile?.name} owes you` || 'your partner owes you'}
                                                </p>
                                                {transaction.userId === session?.user.id 
                                                    ? <p className='text-emerald-500'>¥ {Number(transaction.splitDetails?.user2_amount).toLocaleString()}</p>
                                                    : <p className='text-red-500'>¥ {Number(transaction.splitDetails?.user2_amount).toLocaleString()}</p>
                                                }
                                            </div>
                                        </td>
                                        <td className='p-2 text-right '>
                                            <div className='flex justify-center items-center'>
                                                <FiEdit className='ml-2 hover:cursor-pointer' onClick={() => handleEdit(transaction)}/>
                                                <FiTrash2 className='ml-2 hover:cursor-pointer'/>
                                            </div>
                                        </td>
                                    </tr>
                                )) :
                                (<tr>
                                    <td colSpan={5} className='p-6 text-center'>No data available</td>
                                </tr>) 
                            }
                        </tbody>
                    </table>
                )}
            </div>
            
            {isTransactionModalOpen && (
                <div>
                    <div className='fixed inset-0 bg-black opacity-50 z-40'>
                    </div>

                    {/* New Transaction Modal */}
                    <NewTransaction 
                        closeModal={closeModal} 
                        editTransaction={editTransaction} 
                        modalType={modalType} 
                        setAllTransactions={setAllTransactions} 
                        allTransactions={allTransactions}
                        setIsTransactionModalOpen={setIsTransactionModalOpen}
                        expenseType={expenseType}
                        setExpenseType={setExpenseType}
                        sharedAccountDetails={sharedAccountDetails}
                        setPersonalTransactions={setPersonalTransactions}
                        setSharedTransactions={setSharedTransactions}
                        isTransactionModalOpen={isTransactionModalOpen}
                    />
                </div>
            )}
        </div>
    )
}

export default Transactions
