import { useState, useEffect } from 'react'
import { transaction } from '../App';
import { IoClose } from "react-icons/io5";
import { useAuth } from './Auth/AuthContext';
import { addNewExpense } from '../api/transactionsApi';

interface NewTransactionProps {
    closeModal: () => void,
    editTransaction: transaction|undefined,
    modalType: string,
    setAllTransactions: React.Dispatch<React.SetStateAction<transaction[]>>;
    allTransactions: transaction[];
    setIsTransactionModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    expenseType: string,
    setExpenseType: React.Dispatch<React.SetStateAction<string>>;
}

interface errors {
    date: string,
    amount: string,
    category: string,
}

const NewTransaction: React.FC<NewTransactionProps> = ({ closeModal, editTransaction, modalType, setAllTransactions, allTransactions, setIsTransactionModalOpen, expenseType, setExpenseType }) => {

    const [newTransaction, setNewTransaction] = useState<transaction>({
        userId: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '-- Select Category --',
        description: undefined,
    });

    const [errors, setErrors] = useState<errors>({
        date: '',
        amount: '',
        category: '',
    })

    const { session } = useAuth();

    useEffect(() => {
        if (session && session.user) {
            setNewTransaction({ ...newTransaction, userId: session.user.id})
        }
    }, [session]);

    const handleChange = (event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === 'amount' && (/[^0-9.]/.test(value))) {
            setErrors({ ...errors, amount: 'Please enter an amount with no commas, letters, or symbols.'})
        } else {
            setErrors({ ...errors, amount: ''})
        }

        setNewTransaction({ ...newTransaction, [name]: value });
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newErrors = { ...errors };

        // Checks all inputs if the inputs are not empty
        !newTransaction.date ? newErrors.date = 'Date is required' : newErrors.date = ''
        !newTransaction.amount ? newErrors.amount = 'Amount is required' : newErrors.amount = ''
        newTransaction.category ===  '-- Select Category --' ? newErrors.category = 'Category is required' : newErrors.category = ''

        setErrors(newErrors);

        if (modalType === 'new') {
            await addNewExpense(newTransaction);
        }

        setAllTransactions([newTransaction, ...allTransactions])
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
                                        <option value='Groceries'>Groceries</option>
                                        <option value='Rent'>Rent</option>
                                        <option value='Utilities'>Utilities</option>
                                        <option value='Insurance'>Insurance</option>
                                        <option value='Date Nights'>Date Nights</option>
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
