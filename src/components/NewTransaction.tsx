import { useState } from 'react'
import { transaction } from './Transactions';
import { IoClose } from "react-icons/io5";

interface NewTransactionProps {
    closeModal: () => void,
    editTransaction: transaction|undefined,
    modalType: string,
}

const NewTransaction: React.FC<NewTransactionProps> = ({ closeModal, editTransaction, modalType }) => {

    const [newTransaction, setNewTransaction] = useState<transaction>({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '-- Select Category --',
        description: undefined,
        type:'',
    });

    const [errors, setErrors] = useState<transaction>({
        date: '',
        amount: '',
        category: '',
        type:'',
    })

    const handleChange = (event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
        const { name, value } = event.target;

        if (name === 'amount' && (/[^0-9.]/.test(value))) {
            setErrors({ ...errors, amount: 'Please enter an amount with no commas, letters, or symbols.'})
        } else {
            setErrors({ ...errors, amount: ''})
        }

        setNewTransaction({ ...newTransaction, [name]: value });
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newErrors = { ...errors };

        // Checks all inputs if the inputs are not empty
        !newTransaction.date ? newErrors.date = 'Date is required' : newErrors.date = ''
        !newTransaction.amount ? newErrors.amount = 'Amount is required' : newErrors.amount = ''
        newTransaction.category ===  '-- Select Category --' ? newErrors.category = 'Category is required' : newErrors.category = ''

        setErrors(newErrors);

        console.log(newTransaction)
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
