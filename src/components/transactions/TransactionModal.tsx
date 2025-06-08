import { IoClose } from "react-icons/io5";
import { TransactionModalProps } from "../../types/transaction";
import TransactionForm from "./TransactionForm";


const TransactionModal: React.FC<TransactionModalProps> = ({
    mode,
    closeModal,
    allTransactions,
    expenseType,
    setExpenseType,
    sharedAccountDetails,
    onTransactionUpdate
}) => {
    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-md shadow-lg w-lg'>
                {/* Modal title and close button */}
                <div className='mb-6 w-full flex'>
                    <h2 className='text-emerald-500 text-3xl'>
                        {mode.type === 'edit' ? 'Edit Transaction' : 'Add Transaction'}
                    </h2>
                    <button 
                        className='text-gray-400 text-2xl bg-gray-100 rounded-full h-fit hover:cursor-pointer hover:bg-gray-200 ml-auto'
                        onClick={closeModal}
                    >
                        <IoClose />
                    </button>
                </div>

                {/* Tabs for selecting expense type */}
                <div className='flex mb-6'>
                    <button 
                        onClick={() => setExpenseType('personal')}
                        className={`p-2 w-30 ${expenseType === 'personal' ? 'border-t border-l border-r border-gray-200 rounded-t-md' : 'border-b border-gray-200'}`}
                    >
                        Personal
                    </button>
                    <button 
                        onClick={() => setExpenseType('shared')}
                        className={`p-2 w-30 ${expenseType === 'shared' ? 'border-t border-l border-r border-gray-200 rounded-t-md' : 'border-b border-gray-200'}`}
                    >
                        Shared
                    </button>
                    <div className='flex-1 border-b border-gray-200'></div>
                </div>

                {/* Transaction Form */}
                <TransactionForm
                    mode={mode}
                    closeModal={closeModal}
                    allTransactions={allTransactions}
                    expenseType={expenseType}
                    setExpenseType={setExpenseType}
                    sharedAccountDetails={sharedAccountDetails}
                    onTransactionUpdate={onTransactionUpdate}
                />
            </div>
        </div>
    );
};

export default TransactionModal;
