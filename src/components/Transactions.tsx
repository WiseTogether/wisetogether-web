import { useState } from 'react'
import { FaPlus } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import NewTransaction from './NewTransaction';

export interface transaction {
    date:string,
    amount:string,
    category:string,
    description:string|undefined,
}; 

const Transactions = () => {

    const [activeTab, setActiveTab] = useState<string>('all');
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
    const [transactions, setTransactions] = useState<transaction[]>([]);
    
    const openModal = () => {
        setIsTransactionModalOpen(true);
    }

    const closeModal = () => {
        setIsTransactionModalOpen(false);
    }

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

                    <button 
                        className='ml-auto inline-flex items-center text-emerald-500 p-2 m-2 hover:cursor-pointer hover:text-emerald-300'
                        onClick={openModal}>
                            <FaPlus className='mr-2'/> Add transaction
                    </button>
                </div>

                <table className='w-full'>
                    <thead>
                        <tr className='bg-gray-200'>
                            <th className='p-2 text-center'>Date</th>
                            <th className='p-2 text-center'>Amount</th>
                            <th className='p-2 text-center'>Category</th>
                            <th className='p-2 text-center'>Description</th>
                            <th className='p-2 text-center'> </th>
                            <th className='p-2 text-center'> </th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr>
                            <td className='p-2 text-center'>02/15/2015</td>
                            <td className='p-2 text-center'>¥ 7,619</td>
                            <td className='p-2 text-center'>Groceries</td>
                            <td className='p-2 text-left'></td>
                            <td className='p-2 text-center'>
                                <button className='p-2 w-full bg-orange-100 rounded-md'>Shared</button>
                            </td>
                            <td className='p-2 text-right '>
                                <div className='flex justify-center items-center'>
                                    <FiEdit className='ml-2 hover:cursor-pointer'/>
                                    <FiTrash2 className='ml-2 hover:cursor-pointer'/>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className='p-2 text-center'>02/13/2015</td>
                            <td className='p-2 text-center'>¥ 4,200</td>
                            <td className='p-2 text-center'>Shopping</td>
                            <td className='p-2 text-left'></td>
                            <td className='p-2 text-center'>
                                <button className='p-2 w-full bg-purple-100 rounded-md'>Personal</button>
                            </td>
                            <td className='p-2 text-right '>
                                <div className='flex justify-center items-center'>
                                    <FiEdit className='ml-2 hover:cursor-pointer'/>
                                    <FiTrash2 className='ml-2 hover:cursor-pointer'/>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>

            {isTransactionModalOpen && (
                <div>
                    <div className='fixed inset-0 bg-black opacity-50 z-40'>
                    </div>

                    {/* New Transaction Modal */}
                    <NewTransaction closeModal={closeModal}/>
                </div>
            )}
        </div>
    )
}

export default Transactions
