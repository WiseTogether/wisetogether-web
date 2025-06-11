import { useState, useRef } from 'react'
import { FaPlus, FaReceipt } from "react-icons/fa";
import { Transaction } from '../types/transaction';
import { useAuth } from '../auth/AuthContext';
import TransactionModal from '../components/transactions/TransactionModal';
import TransactionList from '../components/transactions/TransactionList';
import { createTransactionsApi } from '../api/transactionsApi';
import { FadeLoader } from 'react-spinners';
import { showErrorToast, showSuccessToast } from '../utils/toastNotifications';
import { useTransactionsData } from '../hooks/useTransactionsData';
import { useSharedAccountData } from '../hooks/useSharedAccountData';

export function Transactions() {
    const { session, apiRequest } = useAuth();
    const transactionsApi = createTransactionsApi(apiRequest);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploadingReceipt, setIsUploadingReceipt] = useState(false);

    // Get shared account data
    const { 
        sharedAccount,
        partnerProfile,
        isSharedAccountLoading 
    } = useSharedAccountData();

    // Get transactions data
    const {
        transactions,
        personalTransactions,
        sharedTransactions,
        isTransactionsLoading,
        setTransactions
    } = useTransactionsData(sharedAccount?.uuid ?? null);

    const [modalMode, setModalMode] = useState<{ type: 'add' | 'edit', transaction?: Transaction } | null>(null);
    const [expenseType, setExpenseType] = useState<string>('personal');
    const [activeTab, setActiveTab] = useState<string>('all');

    const handleAddTransaction = () => {
        setExpenseType(activeTab === 'shared' ? 'shared' : 'personal');
        setModalMode({ type: 'add' });
    };

    const handleEditTransaction = (transaction: Transaction) => {
        setModalMode({ type: 'edit', transaction });
    };

    const handleTransactionUpdate = async (newTransaction: Transaction) => {
        try {
            if (modalMode?.type === 'edit' && modalMode.transaction?.id) {
                // For edits, update the specific transaction
                const updatedTransactions = transactions.map((t: Transaction) => 
                    t.id === modalMode.transaction!.id ? newTransaction : t
                );
                setTransactions(updatedTransactions);
                showSuccessToast('Transaction updated successfully');
            } else if (modalMode?.type === 'add') {
                // For adds, prepend the new transaction
                const updatedTransactions = [newTransaction, ...transactions];
                setTransactions(updatedTransactions);
                showSuccessToast('Transaction added successfully');
            }
            setModalMode(null);
        } catch (error) {
            showErrorToast('Failed to update transaction');
        }
    };

    const handleDeleteTransaction = async (transaction: Transaction) => {
        if (!transaction.id) return;
        
        try {
            await transactionsApi.deleteTransaction(transaction.id);
            const updatedTransactions = transactions.filter((t: Transaction) => t.id !== transaction.id);
            setTransactions(updatedTransactions);
            showSuccessToast('Transaction deleted successfully');
        } catch (error) {
            showErrorToast('Failed to delete transaction');
        }
    };

    const handleUploadReceipt = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showErrorToast('Please upload an image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showErrorToast('File size should be less than 5MB')
            return
        }

        setIsUploadingReceipt(true)
        try {
            const formData = new FormData()
            formData.append('receipt', file)

            const parsedReceipt = await apiRequest<{
                merchant: string;
                date: string
                amount: number
                category: string
            }>({
                method: 'POST',
                url: '/expenses/parse-receipt',
                data: formData
            })

            // Format the parsed data for the transaction form
            const transaction: Transaction = {
                userId: session?.user?.id || '',
                date: parsedReceipt.date,
                amount: parsedReceipt.amount.toString(),
                category: parsedReceipt.category,
                description: parsedReceipt.merchant, // Use merchant as description
                splitType: 'equal', // Default to equal split for shared expenses
                splitDetails: {
                    user1_amount: parsedReceipt.amount / 2,
                    user2_amount: parsedReceipt.amount / 2
                }
            }

            // Open the transaction modal with the parsed data
            setExpenseType('personal') // Default to personal expense
            setModalMode({ 
                type: 'add',
                transaction
            })

            showSuccessToast('Receipt uploaded successfully')
        } catch (error) {
            console.error('Error uploading receipt:', error)
            showErrorToast('Failed to parse receipt')
        } finally {
            setIsUploadingReceipt(false)
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
        }
    }

    if (isSharedAccountLoading || isTransactionsLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <FadeLoader />
            </div>
        );
    }

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

                    {/* Action buttons */}
                    <div className='ml-auto flex gap-2'>
                        {/* Add Transaction button */}
                        <button 
                            className='inline-flex items-center text-emerald-500 p-2 mb-2 hover:cursor-pointer hover:text-emerald-300'
                            onClick={handleAddTransaction}
                        >
                            <FaPlus className='mr-2'/> Add Transaction
                        </button>

                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleUploadReceipt}
                            accept="image/*"
                            className="hidden"
                            disabled={isUploadingReceipt}
                        />
                        
                        {/* Upload Receipt button */}
                        <button 
                            className={`inline-flex items-center p-2 mb-2 rounded-md hover:cursor-pointer transition-colors
                                ${isUploadingReceipt 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
                            onClick={() => !isUploadingReceipt && fileInputRef.current?.click()}
                            disabled={isUploadingReceipt}
                        >
                            {isUploadingReceipt ? (
                                <>
                                    Parsing Receipt...
                                </>
                            ) : (
                                <>
                                    <FaReceipt className='mr-2'/> Upload Receipt
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Conditional rendering of tables based on active tab */}
                {activeTab === 'all' && (
                    <TransactionList
                        transactions={transactions}
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
                    sharedAccountDetails={sharedAccount}
                    onTransactionUpdate={handleTransactionUpdate}
                />
            )}
        </div>
    );
}

export default Transactions;
