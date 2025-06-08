import { useState, useEffect } from 'react'
import { FaPlus } from "react-icons/fa";
import { Transaction } from '../types/transaction';
import { sharedAccount } from '../App';
import { useAuth, UserProfile } from '../auth/AuthContext';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionList from '../components/transactions/TransactionList';
import { createTransactionsApi } from '../api/transactionsApi';

interface TransactionsProps {
    allTransactions: Transaction[];
    setAllTransactions: (transactions: Transaction[]) => void;
    sharedAccountDetails: sharedAccount | null;
    partnerProfile: UserProfile | null;
}

const Transactions: React.FC<TransactionsProps> = ({ allTransactions, setAllTransactions, sharedAccountDetails, partnerProfile }) => {
    const [personalTransactions, setPersonalTransactions] = useState<Transaction[]>([]);
    const [sharedTransactions, setSharedTransactions] = useState<Transaction[]>([]);
    const [modalMode, setModalMode] = useState<{ type: 'add' | 'edit', transaction?: Transaction } | null>(null);
    const [expenseType, setExpenseType] = useState<string>('personal');
    const [activeTab, setActiveTab] = useState<string>('all');

    const { session, apiRequest } = useAuth();
    const transactionsApi = createTransactionsApi(apiRequest);

    useEffect(() => {
        setPersonalTransactions(allTransactions.filter((transaction) => !transaction.sharedAccountId));
        setSharedTransactions(allTransactions.filter((transaction) => transaction.sharedAccountId));
    }, [allTransactions]);

    const handleAddTransaction = () => {
        setExpenseType(activeTab === 'shared' ? 'shared' : 'personal');
        setModalMode({ type: 'add' });
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setModalMode({ type: 'edit', transaction });
    };

    const handleTransactionUpdate = async (newTransaction: Transaction) => {
        if (modalMode?.type === 'edit' && modalMode.transaction?.id) {
            // For edits, update the specific transaction
            const updatedTransactions = allTransactions.map(t => 
                t.id === modalMode.transaction!.id ? newTransaction : t
            );
            setAllTransactions(updatedTransactions);
        } else if (modalMode?.type === 'add') {
            // For adds, prepend the new transaction
            const updatedTransactions = [newTransaction, ...allTransactions];
            setAllTransactions(updatedTransactions);
        }
        setModalMode(null);
    };

    const handleDeleteTransaction = async (transaction: Transaction) => {
        if (!transaction.id) return;
        
        try {
            await transactionsApi.deleteTransaction(transaction.id);
            const updatedTransactions = allTransactions.filter(t => t.id !== transaction.id);
            setAllTransactions(updatedTransactions);
        } catch (error) {
            console.error('Error deleting transaction:', error);
            alert('Failed to delete transaction. Please try again.');
        }
    };

    return (
        <div className='w-full p-6'>
            <div className='shadow-sm bg-white p-6'>
                {/* Tabs Navigation */}
                <div className='flex'>
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`tab ${activeTab === 'all' ? 'bg-gray-200' : 'bg-gray-50'}`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setActiveTab('personal')}
                        className={`tab ${activeTab === 'personal' ? 'bg-gray-200' : 'bg-gray-50'}`}
                    >
                        Personal
                    </button>
                    <button 
                        onClick={() => setActiveTab('shared')}
                        className={`tab ${activeTab === 'shared' ? 'bg-gray-200' : 'bg-gray-50'}`}
                    >
                        Shared
                    </button>

                    {/* Button to add a new transaction */}
                    <button 
                        className='ml-auto inline-flex items-center text-emerald-500 p-2 mb-2 hover:cursor-pointer hover:text-emerald-300'
                        onClick={handleAddTransaction}
                    >
                        <FaPlus className='mr-2'/> Add transaction
                    </button>
                </div>

                {/* Conditional rendering of tables based on active tab */}
                {activeTab === 'all' && (
                    <TransactionList
                        transactions={allTransactions}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                        session={session}
                        partnerProfile={partnerProfile}
                        showTransactionType={true}
                    />
                )}

                {activeTab === 'personal' && (
                    <TransactionList
                        transactions={personalTransactions}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                        session={session}
                        partnerProfile={partnerProfile}
                    />
                )}

                {activeTab === 'shared' && (
                    <TransactionList
                        transactions={sharedTransactions}
                        onEdit={handleEditTransaction}
                        onDelete={handleDeleteTransaction}
                        session={session}
                        partnerProfile={partnerProfile}
                        showSplitDetails={true}
                        showUserAvatar={true}
                    />
                )}
            </div>

            {/* Transaction Modal */}
            {modalMode && (
                <TransactionModal
                    mode={modalMode}
                    closeModal={() => setModalMode(null)}
                    allTransactions={expenseType === 'personal' ? personalTransactions : sharedTransactions}
                    expenseType={expenseType}
                    setExpenseType={setExpenseType}
                    sharedAccountDetails={sharedAccountDetails}
                    onTransactionUpdate={handleTransactionUpdate}
                />
            )}
        </div>
    );
}

export default Transactions;
