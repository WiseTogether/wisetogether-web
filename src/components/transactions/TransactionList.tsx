import { TransactionListProps } from "../../types/transaction";
import TransactionRow from "./TransactionRow";

const TransactionList: React.FC<TransactionListProps> = ({
    transactions,
    onEdit,
    session,
    partnerProfile,
    showTransactionType = false,
    showSplitDetails = false,
    showUserAvatar = false
}) => {
    return (
        <table className='w-full'>
            <thead>
                <tr className='bg-gray-200'>
                    {showTransactionType && <th className='p-2 text-center'>Type</th>}
                    {showUserAvatar && <th className='p-2 text-center'> </th>}
                    <th className='p-2 text-center'>Date</th>
                    <th className='p-2 text-center'>Category</th>
                    <th className='p-2 text-center'>Amount</th>
                    <th className='p-2 text-center'> </th>
                </tr>
            </thead>
            <tbody>
                {transactions.length > 0 ? (
                    transactions.map((transaction, index) => (
                        <TransactionRow
                            key={index}
                            transaction={transaction}
                            onEdit={onEdit}
                            session={session}
                            partnerProfile={partnerProfile}
                            showTransactionType={showTransactionType}
                            showSplitDetails={showSplitDetails}
                            showUserAvatar={showUserAvatar}
                        />
                    ))
                ) : (
                    <tr>
                        <td colSpan={showTransactionType ? 6 : 5} className='p-6 text-center'>
                            No data available
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

export default TransactionList;
