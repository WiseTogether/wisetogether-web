import { useEffect, useState } from 'react'

const NewTransaction = () => {

    const [newTransaction, setNewTransaction] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: '',
        category: '-- Select Category --',
        description: ''
    });

    useEffect(() => {
        console.log(newTransaction)
    }, [newTransaction])

    const handleChange = (event:React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
        const { name, value } = event.target;
        setNewTransaction({ ...newTransaction, [name]: value });
    };

    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-md shadow-lg'>
                <form>
                    <label htmlFor='date'>Date: </label>
                    <input 
                        type='date' 
                        id='date' 
                        name='transaction-date'
                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1' 
                        value={newTransaction.date} 
                        onChange={handleChange}
                    />

                    <label htmlFor='amount'>Amount: </label>
                    <input 
                        type='number' 
                        id='amount' 
                        name='amount'
                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1' 
                        value={newTransaction.amount}
                        placeholder='0'
                        onChange={handleChange}
                    />

                    <label htmlFor='category'>Category: </label>
                    <select 
                        id='category' 
                        name='category'
                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1'
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

                    <label htmlFor='description'>Description: </label>
                    <input 
                        type='text' 
                        id='description' 
                        name='description'
                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1' 
                        value={newTransaction.description}
                        placeholder='(Optional)'
                        onChange={handleChange}
                    />
                </form>
            </div>
        </div>
    )
}

export default NewTransaction
