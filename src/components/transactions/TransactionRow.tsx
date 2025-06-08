import { FiEdit, FiTrash2, FiInfo } from "react-icons/fi";
import { TransactionRowProps } from "../../types/transaction";
import { useAuth } from "../../auth/AuthContext";

const TransactionRow: React.FC<TransactionRowProps> = ({
    transaction,
    onEdit,
    onDelete,
    session,
    partnerProfile,
    showTransactionType = false,
    showSplitDetails = false,
    showUserAvatar = false
}) => {
    const { user } = useAuth();

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            onDelete(transaction);
        }
    };

    return (
        <tr>
            {/* Transaction Type (only shown in 'all' tab) */}
            {showTransactionType && (
                <td className='p-2 text-center'>
                    <button className={`p-2 w-full rounded-md 
                        ${transaction.sharedAccountId ? 'bg-orange-100' : 'bg-purple-100'}`}>
                        {transaction.sharedAccountId ? 'shared' : 'personal'}
                    </button>
                </td>
            )}

            {/* Display user avatar depending on who made the transaction */}
            {showUserAvatar && (
                <td className='p-2 text-center'>
                    <img 
                        src={transaction.userId === session?.user.id ? user?.avatarUrl : partnerProfile?.avatarUrl} 
                        className='h-10 w-10 rounded-full'
                        alt="User avatar"
                    />
                </td>
            )}
            
            {/* Date */}
            <td className='p-2 text-center'>
                {new Date(transaction.date).toLocaleDateString('en-US')}
            </td>
            
            {/* Category and Description */}
            <td className='p-2 text-left'>
                <div className='flex items-center gap-2'>
                    <p>{transaction.category}</p>
                    {transaction.description && (
                        <span className='relative group'>
                            <FiInfo className='text-gray-400 cursor-pointer' />
                            <span className='absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-2 text-xs bg-gray-800 text-white p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity'>
                                {transaction.description}
                            </span>
                        </span>
                    )}
                </div>
            </td>
            
            {/* Amount and Split Details */}
            <td className='flex gap-4 p-2'>
                <div className='text-right w-25'>
                    {showSplitDetails && (
                        <p className='text-xs text-gray-400'>
                            {transaction.userId === session?.user.id ? 
                                'you paid' 
                                : `${partnerProfile?.name ?? 'your partner'} paid`}
                        </p>
                    )}
                    <p>¥ {Number(transaction.amount).toLocaleString()}</p>
                </div>
                {showSplitDetails && (
                    <div className='text-left'>
                        <p className='text-xs text-gray-400'>
                            {transaction.userId !== session?.user.id
                                ? 'you owe'
                                : `${partnerProfile?.name ?? 'your partner'} owes you`}
                        </p>
                        {transaction.userId === session?.user.id 
                            ? <p className='text-emerald-500'>¥ {Number(transaction.splitDetails?.user2_amount).toLocaleString()}</p>
                            : <p className='text-red-500'>¥ {Number(transaction.splitDetails?.user2_amount).toLocaleString()}</p>
                        }
                    </div>
                )}
            </td>
            
            {/* Action Buttons */}
            <td className='p-2 text-right'>
                <div className='flex justify-center items-center'>
                    <FiEdit 
                        className='ml-2 hover:cursor-pointer' 
                        onClick={() => onEdit(transaction)}
                    />
                    <FiTrash2 
                        className='ml-2 hover:cursor-pointer text-red-500'
                        onClick={handleDelete}
                    />
                </div>
            </td>
        </tr>
    );
};

export default TransactionRow;
