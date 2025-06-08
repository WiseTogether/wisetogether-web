import { sharedAccount } from "@/App";
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '../auth/AuthContext';

export interface Transaction {
    id?: string;
    sharedAccountId?: string;
    userId: string;
    date: string;
    amount: string;
    category: string;
    description?: string;
    splitType?: 'equal' | 'percentage' | 'custom';
    splitDetails?: {
        user1_amount?: number;
        user2_amount?: number;
    };
}

export interface TransactionFormErrors {
    date: string;
    amount: string;
    category: string;
}

export interface TransactionFormProps {
    mode: {
        type: 'add' | 'edit';
        transaction?: Transaction;
    };
    closeModal: () => void;
    allTransactions: Transaction[];
    expenseType: string;
    setExpenseType: (type: string) => void;
    sharedAccountDetails: sharedAccount | null;
    onTransactionUpdate: (newTransaction: Transaction) => void;
}

export interface TransactionListProps {
    transactions: Transaction[];
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    session: Session | null;
    partnerProfile: UserProfile | null;
    showTransactionType?: boolean;
    showSplitDetails?: boolean;
    showUserAvatar?: boolean;
}

export interface TransactionRowProps {
    transaction: Transaction;
    onEdit: (transaction: Transaction) => void;
    onDelete: (transaction: Transaction) => void;
    session: Session | null;
    partnerProfile: UserProfile | null;
    showTransactionType?: boolean;
    showSplitDetails?: boolean;
    showUserAvatar?: boolean;
}

export interface TransactionModalProps {
    mode: {
        type: 'add' | 'edit';
        transaction?: Transaction;
    };
    closeModal: () => void;
    allTransactions: Transaction[];
    expenseType: string;
    setExpenseType: (type: string) => void;
    sharedAccountDetails: sharedAccount | null;
    onTransactionUpdate: (newTransaction: Transaction) => void;
}
