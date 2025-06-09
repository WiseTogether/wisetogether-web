import { sharedAccount } from "@/App";
import { Session } from '@supabase/supabase-js';
import { UserProfile } from '../auth/AuthContext';
import { z } from 'zod';

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

// Zod schemas for validation
export const transactionFormSchema = z.object({
    date: z.string().min(1, 'Date is required'),
    amount: z.string()
        .min(1, 'Amount is required')
        .regex(/^\d*\.?\d*$/, 'Please enter a valid amount with no commas, letters, or symbols'),
    category: z.string()
        .min(1, 'Category is required')
        .refine(val => val !== '-- Select Category --', 'Please select a category'),
    description: z.string().optional(),
    splitType: z.enum(['equal', 'percentage', 'custom']).optional(),
    splitDetails: z.object({
        user1_amount: z.number().min(0).optional(),
        user2_amount: z.number().min(0).optional()
    }).optional(),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
