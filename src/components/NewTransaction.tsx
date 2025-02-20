import { useState, useEffect } from 'react'
import { transaction, sharedAccount } from '../App';
import { IoClose } from "react-icons/io5";
import { useAuth } from './Auth/AuthContext';
import { addNewPersonalExpense, addNewSharedExpense } from '../api/transactionsApi';

interface NewTransactionProps {
    closeModal: () => void,
    editTransaction: transaction|undefined,
    modalType: string,
    setAllTransactions: React.Dispatch<React.SetStateAction<transaction[]>>;
    allTransactions: transaction[];
    setIsTransactionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expenseType: string,
    setExpenseType: React.Dispatch<React.SetStateAction<string>>;
    sharedAccountDetails: sharedAccount|null;
    setPersonalTransactions: React.Dispatch<React.SetStateAction<transaction[]>>;
    setSharedTransactions: React.Dispatch<React.SetStateAction<transaction[]>>;
}

interface errors {
    date: string,
    amount: string,
    category: string,
}

const NewTransaction: React.FC<NewTransactionProps> = ({ closeModal, editTransaction, modalType, setAllTransactions, allTransactions, setIsTransactionModalOpen, expenseType, setExpenseType, sharedAccountDetails, setPersonalTransactions, setSharedTransactions }) => {

    const [newTransaction, setNewTransaction] = useState<transaction>({
        sharedAccountId: '',
        userId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '-- Select Category --',
        description: undefined,
        splitType: 'equal',
        splitDetails: { 'user1': 0, 'user2': 0 },
    });

    const [errors, setErrors] = useState<errors>({
        date: '',
        amount: '',
        category: '',
    })

    const { session } = useAuth();

    useEffect(() => {
        if (session && session.user) {
            setNewTransaction((prevState) => ({ 
                ...prevState, 
                userId: session.user.id,
                ...(sharedAccountDetails && { sharedAccountId: sharedAccountDetails.id })
            }))
        }
    }, [session, sharedAccountDetails]);

    useEffect(() => {
        setNewTransaction({ ...newTransaction, splitDetails: { 'user1': 0, 'user2': 0 }})
    }, [newTransaction.splitType])

    useEffect(() => {
        setPersonalTransactions(allTransactions.filter((transaction) => !transaction.sharedAccountId));
        setSharedTransactions(allTransactions.filter((transaction) => transaction.sharedAccountId));
    },[closeModal])

    const categories = ['Groceries', 'Rent', 'Utilities', 'Insurance', 'Transportation', 'Dining Out', 'Entertainment', 'Healthcare', 'Personal Care', 'Miscellaneous']

    const handleChange = (event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === 'amount' && (/[^0-9.]/.test(value))) {
            setErrors({ ...errors, amount: 'Please enter an amount with no commas, letters, or symbols.'})
        } else {
            setErrors({ ...errors, amount: ''})
        }

        setNewTransaction({ ...newTransaction, [name]: value });
    };

    const handleAmountChange = (event:React.ChangeEvent<HTMLInputElement>, user:string) => {
        const { value } = event.target;

        if (newTransaction.splitType === 'percentage') {

            if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) return;
    
            const updatedSplitDetails = { ...newTransaction.splitDetails, [user]:Number(value) }

            user === 'user1' ? updatedSplitDetails.user2 = (100 - Number(value)) : updatedSplitDetails.user1 = (100 - Number(value));
    
            setNewTransaction({ ...newTransaction, splitDetails: updatedSplitDetails })
        } else if (newTransaction.splitType === 'custom') {
            const amount = Number(newTransaction.amount)
            if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > amount) return;

            const updatedSplitDetails = { ...newTransaction.splitDetails, [user]:Number(value) }

            user === 'user1' ? updatedSplitDetails.user2 = (amount - Number(value)) : updatedSplitDetails.user1 = (amount - Number(value));
            setNewTransaction({ ...newTransaction, splitDetails: updatedSplitDetails })
        }

    };


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newErrors = { ...errors };

        // Checks all inputs if the inputs are not empty
        !newTransaction.date ? newErrors.date = 'Date is required' : newErrors.date = ''
        !newTransaction.amount ? newErrors.amount = 'Amount is required' : newErrors.amount = ''
        newTransaction.category ===  '-- Select Category --' ? newErrors.category = 'Category is required' : newErrors.category = ''

        setErrors(newErrors);

        if (modalType === 'new' && session?.user) {
            if (expenseType === 'personal') {
                const personalExpense = { 
                    userId: session?.user.id,
                    date: newTransaction.date,
                    amount: newTransaction.amount,
                    category: newTransaction.category,
                    description: newTransaction.description,
                }
                await addNewPersonalExpense(personalExpense);
            }
            if (expenseType === 'shared') {
                const sharedExpense = { 
                    sharedAccountId: sharedAccountDetails?.id,
                    userId: session?.user.id,
                    date: newTransaction.date,
                    amount: newTransaction.amount,
                    category: newTransaction.category,
                    description: newTransaction.description,
                    splitType: newTransaction.splitType,
                    splitDetails: newTransaction.splitDetails,
                }
                await addNewSharedExpense(sharedExpense);
            }
        }

        setAllTransactions([newTransaction, ...allTransactions]);
        setIsTransactionModalOpen(false);
    }

    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-md shadow-lg w-lg'>
                <div className='mb-6 w-full flex'>
                    <h2 className='text-emerald-500 text-3xl'>{modalType === 'edit' ? 'Edit Transaction' : 'Add Transaction'}</h2>
                    <button 
                        className='text-gray-400 text-2xl bg-gray-100 rounded-full h-fit hover:cursor-pointer hover:bg-gray-200 ml-auto'
                        onClick={closeModal}
                    ><IoClose /></button>
                </div>
                <div>
                    {/* Tabs Navigation */}
                    <div className='flex mb-6'>
                        <button 
                            onClick={() => setExpenseType('personal')}
                            className={`p-2 w-30 ${expenseType === 'personal' ? 'border-t border-l border-r border-gray-200 rounded-t-md' : 'border-b border-gray-200'}`}
                        > Personal
                        </button>
                        <button 
                            onClick={() => setExpenseType('shared')}
                            className={`p-2 w-30 ${expenseType === 'shared' ? 'border-t border-l border-r border-gray-200 rounded-t-md' : 'border-b border-gray-200'}`}                        
                            > Shared
                        </button>
                        <div className='flex-1 border-b border-gray-200'></div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className='space-y-4 w-full flex flex-col justify-center items-center mb-6'>
                            <div className='flex gap-2 w-4/5'>
                                <label htmlFor='date' className='w-2/5 text-right'>Date: </label>
                                <div className='w-full'>
                                    <input 
                                        type='date' 
                                        id='date'
                                        name='date'
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1 mr-8' 
                                        value={newTransaction.date} 
                                        onChange={handleChange}
                                    />
                                    {errors.date && <p className="text-red-500 text-xs">{errors.date}</p>}
                                </div>
                            </div>

                            <div className='flex gap-2 w-4/5'>
                                <label htmlFor='amount' className='w-2/5 text-right'>Amount: </label>
                                <div className='w-full'>
                                    <input 
                                        type='text' 
                                        id='amount' 
                                        name='amount'
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1 w-20' 
                                        value={newTransaction.amount}
                                        placeholder='0'
                                        onChange={handleChange}
                                    />
                                    {errors.amount && <p className="text-red-500 text-xs">{errors.amount}</p>}
                                </div>
                            </div>

                            {expenseType === 'shared' && 
                                (<div className='flex gap-2 w-4/5'>
                                    <p className='w-2/5 text-right'>Split: </p>

                                    <div className='flex flex-col w-full'>
                                        <fieldset>
                                            <div>
                                                <input 
                                                    type='radio' 
                                                    name='splitType' 
                                                    value='equal'
                                                    checked={newTransaction.splitType === 'equal'}
                                                    onChange={handleChange}
                                                    className='border-solid border-gray-200 border-1 inset-shadow-xs p-1' 
                                                />
                                                <label htmlFor='equal'> Equal</label>
                                            </div>

                                            <div>
                                                <input 
                                                    type='radio' 
                                                    name='splitType' 
                                                    value='percentage'
                                                    onChange={handleChange}
                                                    className='border-solid border-gray-200 border-1 inset-shadow-xs p-1' 
                                                />
                                                <label htmlFor='percentage'> Percentage</label>
                                            </div>

                                            {newTransaction.splitType === 'percentage' && (
                                                <div className='flex items-center m-2'>
                                                    <input 
                                                        type='text' 
                                                        id='user1-amount'
                                                        name='user1-amount'
                                                        className='border-b border-solid border-gray-200 p-1 w-15 mr-2' 
                                                        value={newTransaction.splitDetails?.user1}
                                                        onChange={(e) => handleAmountChange(e, 'user1')}
                                                    />
                                                    <p className='mr-10'>%</p>

                                                    <input 
                                                        type='text' 
                                                        id='user2-amount'
                                                        name='user2-amount'
                                                        className='border-b border-solid border-gray-200 p-1 w-15 mr-2' 
                                                        value={newTransaction.splitDetails?.user2}
                                                        onChange={(e) => handleAmountChange(e, 'user2')}
                                                    />
                                                    <p>%</p>

                                                </div>
                                            )}

                                            <div>
                                                <input 
                                                    type='radio' 
                                                    name='splitType' 
                                                    value='custom'
                                                    onChange={handleChange}
                                                    className='border-solid border-gray-200 border-1 inset-shadow-xs p-1' 
                                                />
                                                <label htmlFor='custom'> Custom</label>
                                            </div>

                                            {newTransaction.splitType === 'custom' && (
                                                <div className='flex items-center mt-2 mb-2'>
                                                    <p className='mr-2'>¥</p>
                                                    <input 
                                                        type='text' 
                                                        id='user1-amount'
                                                        name='user1-amount'
                                                        className='border-b border-solid border-gray-200 p-1 w-20 mr-5' 
                                                        value={newTransaction.splitDetails?.user1}
                                                        onChange={(e) => handleAmountChange(e, 'user1')}
                                                    />
                                                    
                                                    <p className='mr-2'>¥</p>
                                                    <input 
                                                        type='text' 
                                                        id='user2-amount'
                                                        name='user2-amount'
                                                        className='border-b border-solid border-gray-200 p-1 w-20' 
                                                        value={newTransaction.splitDetails?.user2}
                                                        onChange={(e) => handleAmountChange(e, 'user2')}
                                                    />
                                                </div>
                                            )}

                                            {/* {errors.amount && <p className='text-red-500 text-xs'>{errors.amount}</p>} */}
                                        </fieldset>
                                    </div>

                                </div>)
                            }

                            <div className='flex gap-2 w-4/5'>
                                <label htmlFor='category' className='w-2/5 text-right'>Category: </label>
                                <div className='w-full'>
                                    <select 
                                        id='category' 
                                        name='category'
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1 w-59'
                                        value={newTransaction.category} 
                                        onChange={handleChange}
                                    >
                                        <option value='-- Select Category --'>-- Select Category --</option>
                                        {categories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
                                </div>
                            </div>

                            <div className='flex gap-2 w-4/5'>
                                <label htmlFor='description' className='w-2/5 text-right'>Description: </label>
                                <div className='w-full'>
                                    <textarea 
                                        name='description'
                                        cols={25}
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1'
                                        value={newTransaction.description}
                                        placeholder='(Optional)'
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className='flex justify-end gap-2'>
                            <button 
                                type='submit' 
                                className='py-2 px-4 w-22 rounded-lg bg-emerald-500 text-white hover:cursor-pointer'
                            >Save</button>
                            <button 
                                type='button'
                                className='py-2 px-4 w-22 rounded-lg bg-gray-400 text-white hover:cursor-pointer'
                                onClick={closeModal}
                            >Cancel</button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}

export default NewTransaction
