import { useState, useEffect } from 'react';
import { TransactionFormProps, transactionFormSchema, TransactionFormData } from '../../types/transaction';
import { useAuth } from '../../auth/AuthContext';
import { createTransactionsApi } from '../../api/transactionsApi';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

const TransactionForm: React.FC<TransactionFormProps> = ({
    mode,
    closeModal,
    expenseType,
    setExpenseType,
    sharedAccountDetails,
    onTransactionUpdate
}) => {
    const { register, handleSubmit, setValue, getValues, formState: { errors }, reset } = useForm<TransactionFormData>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: '',
            category: '-- Select Category --',
            description: '',
            splitType: 'equal',
            splitDetails: { user1_amount: 0, user2_amount: 0 }
        }
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { session } = useAuth();
    const { apiRequest } = useAuth();
    const transactionsApi = createTransactionsApi(apiRequest);

    const categories = [
        'Groceries', 'Rent', 'Utilities', 'Insurance', 'Transportation',
        'Dining Out', 'Entertainment', 'Healthcare', 'Personal Care', 'Miscellaneous'
    ];

    useEffect(() => {
        if (mode.type === 'edit' && mode.transaction) {
            reset({
                date: mode.transaction.date,
                amount: mode.transaction.amount,
                category: mode.transaction.category,
                description: mode.transaction.description || '',
                splitType: mode.transaction.splitType || 'equal',
                splitDetails: mode.transaction.splitDetails || { user1_amount: 0, user2_amount: 0 }
            });
            setExpenseType(mode.transaction.sharedAccountId ? 'shared' : 'personal');
        } else {
            reset({
                date: new Date().toISOString().split('T')[0],
                amount: '',
                category: '-- Select Category --',
                description: '',
                splitType: 'equal',
                splitDetails: { user1_amount: 0, user2_amount: 0 }
            });
        }
    }, [mode, reset]);

    const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>, user: string) => {
        const { value } = event.target;
        const currentSplitType = getValues('splitType');
        const currentSplitDetails = getValues('splitDetails') || { user1_amount: 0, user2_amount: 0 };

        if (currentSplitType === 'percentage') {
            if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > 100) return;

            const updatedSplitDetails = { ...currentSplitDetails };
            if (user === 'user1') {
                updatedSplitDetails.user1_amount = Number(value);
                updatedSplitDetails.user2_amount = 100 - Number(value);
            } else {
                updatedSplitDetails.user2_amount = Number(value);
                updatedSplitDetails.user1_amount = 100 - Number(value);
            }

            setValue('splitDetails', updatedSplitDetails);
        } else if (currentSplitType === 'custom') {
            const amount = Number(getValues('amount'));
            if (isNaN(Number(value)) || Number(value) < 0 || Number(value) > amount) return;

            const updatedSplitDetails = { ...currentSplitDetails };
            if (user === 'user1') {
                updatedSplitDetails.user1_amount = Number(value);
                updatedSplitDetails.user2_amount = amount - Number(value);
            } else {
                updatedSplitDetails.user2_amount = Number(value);
                updatedSplitDetails.user1_amount = amount - Number(value);
            }

            setValue('splitDetails', updatedSplitDetails);
        }
    };

    const onSubmit = async (data: TransactionFormData) => {
        if (!session?.user?.id) {
            setError('User session not found');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (mode.type === 'edit' && mode.transaction?.id) {
                const updatedTransaction = await transactionsApi.editTransaction(mode.transaction.id, {
                    ...data,
                    userId: session.user.id
                });
                if (updatedTransaction) {
                    onTransactionUpdate(updatedTransaction);
                }
            } else if (mode.type === 'add') {
                let response;
                if (expenseType === 'personal') {
                    const personalExpense = {
                        userId: session.user.id,
                        date: data.date,
                        amount: data.amount,
                        category: data.category,
                        description: data.description,
                    };
                    response = await transactionsApi.addNewPersonalExpense(personalExpense);
                } else if (expenseType === 'shared') {
                    const sharedExpense = {
                        sharedAccountId: sharedAccountDetails?.uuid,
                        userId: session.user.id,
                        date: data.date,
                        amount: data.amount,
                        category: data.category,
                        description: data.description,
                        splitType: data.splitType,
                        splitDetails: data.splitDetails,
                    };
                    response = await transactionsApi.addNewSharedExpense(sharedExpense);
                }
                
                if (response) {
                    onTransactionUpdate(response);
                }
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            setError('Failed to save transaction. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className='space-y-4 w-full flex flex-col justify-center items-center mb-6'>
                {/* Date Input */}
                <div className='flex gap-2 w-4/5'>
                    <label htmlFor='date' className='w-2/5 text-right'>Date: </label>
                    <div className='w-full'>
                        <input
                            type='date'
                            id='date'
                            {...register('date')}
                            className='border-solid border-gray-200 border-1 inset-shadow-xs p-1 mr-8'
                        />
                        {errors.date && <p className="text-red-500 text-xs">{errors.date.message}</p>}
                    </div>
                </div>

                {/* Amount Input */}
                <div className='flex gap-2 w-4/5'>
                    <label htmlFor='amount' className='w-2/5 text-right'>Amount: </label>
                    <div className='w-full'>
                        <input
                            type='text'
                            id='amount'
                            {...register('amount')}
                            className='border-solid border-gray-200 border-1 inset-shadow-xs p-1 w-20'
                            placeholder='0'
                        />
                        {errors.amount && <p className="text-red-500 text-xs">{errors.amount.message}</p>}
                    </div>
                </div>

                {/* Shared Expense Split Type */}
                {expenseType === 'shared' && (
                    <div className='flex gap-2 w-4/5'>
                        <p className='w-2/5 text-right'>Split: </p>
                        <div className='flex flex-col w-full'>
                            <fieldset>
                                <div>
                                    <input
                                        type='radio'
                                        {...register('splitType')}
                                        value='equal'
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1'
                                    />
                                    <label htmlFor='equal'> Equal</label>
                                </div>

                                <div>
                                    <input
                                        type='radio'
                                        {...register('splitType')}
                                        value='percentage'
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1'
                                    />
                                    <label htmlFor='percentage'> Percentage</label>
                                </div>

                                {getValues('splitType') === 'percentage' && (
                                    <div className='flex items-center m-2'>
                                        <input
                                            type='text'
                                            id='user1-amount'
                                            className='border-b border-solid border-gray-200 p-1 w-15 mr-2'
                                            value={getValues('splitDetails.user1_amount')}
                                            onChange={(e) => handleAmountChange(e, 'user1')}
                                        />
                                        <p className='mr-10'>%</p>

                                        <input
                                            type='text'
                                            id='user2-amount'
                                            className='border-b border-solid border-gray-200 p-1 w-15 mr-2'
                                            value={getValues('splitDetails.user2_amount')}
                                            onChange={(e) => handleAmountChange(e, 'user2')}
                                        />
                                        <p>%</p>
                                    </div>
                                )}

                                <div>
                                    <input
                                        type='radio'
                                        {...register('splitType')}
                                        value='custom'
                                        className='border-solid border-gray-200 border-1 inset-shadow-xs p-1'
                                    />
                                    <label htmlFor='custom'> Custom</label>
                                </div>

                                {getValues('splitType') === 'custom' && (
                                    <div className='flex items-center mt-2 mb-2'>
                                        <p className='mr-2'>¥</p>
                                        <input
                                            type='text'
                                            id='user1-amount'
                                            className='border-b border-solid border-gray-200 p-1 w-20 mr-5'
                                            value={getValues('splitDetails.user1_amount')}
                                            onChange={(e) => handleAmountChange(e, 'user1')}
                                        />

                                        <p className='mr-2'>¥</p>
                                        <input
                                            type='text'
                                            id='user2-amount'
                                            className='border-b border-solid border-gray-200 p-1 w-20'
                                            value={getValues('splitDetails.user2_amount')}
                                            onChange={(e) => handleAmountChange(e, 'user2')}
                                        />
                                    </div>
                                )}
                            </fieldset>
                        </div>
                    </div>
                )}

                {/* Category Selection */}
                <div className='flex gap-2 w-4/5'>
                    <label htmlFor='category' className='w-2/5 text-right'>Category: </label>
                    <div className='w-full'>
                        <select
                            id='category'
                            {...register('category')}
                            className='border-solid border-gray-200 border-1 inset-shadow-xs p-1 w-59'
                        >
                            <option value='-- Select Category --'>-- Select Category --</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                    </div>
                </div>

                {/* Description Input */}
                <div className='flex gap-2 w-4/5'>
                    <label htmlFor='description' className='w-2/5 text-right'>Description: </label>
                    <div className='w-full'>
                        <textarea
                            {...register('description')}
                            cols={25}
                            className='border-solid border-gray-200 border-1 inset-shadow-xs p-1'
                            placeholder='(Optional)'
                        ></textarea>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className='flex justify-end gap-2'>
                <button
                    type='submit'
                    className='py-2 px-4 w-22 rounded-lg bg-emerald-500 text-white hover:cursor-pointer'
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                    type='button'
                    className='py-2 px-4 w-22 rounded-lg bg-gray-400 text-white hover:cursor-pointer'
                    onClick={closeModal}
                    disabled={isLoading}
                >
                    Cancel
                </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </form>
    );
};

export default TransactionForm;
