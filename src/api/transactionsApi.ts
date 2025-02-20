import { transaction } from '../App';

const baseUrl = import.meta.env.VITE_API_BASE_URL

// Fetches all transactions for a specific user and optionally for a shared account.
export const fetchAllTransactionsById = async (userId:string, sharedAccountId:string | null) => {
    try {

        let queries: { [key: string]: string } = { userId: userId };

        // If a sharedAccountId is provided, include it in the query parameters
        if (sharedAccountId) {
            queries.sharedAccountId = sharedAccountId;
        }

        // Convert query parameters to a URL query string
        const queryParams = new URLSearchParams(queries).toString();
        const response = await fetch(`${baseUrl}/expenses?${queryParams}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Expenses not found');
            }
            throw new Error('An error occurred while fetching expenses');
        }
        return response.json();
    } catch (error) {
        console.error('Error fetching expenses: ', error);
        throw error;
    }
}

// Make a POST request to create a new personal expense
export const addNewPersonalExpense = async (expense:transaction) => {
    try {
        const response = await fetch(`${baseUrl}/expenses/personal`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expense)
        })
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occured while adding a new personal expense');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding new personal expense: ', error);
        throw error;
    }
}

// Make a POST request to create a new shared expense
export const addNewSharedExpense = async (expense:transaction) => {
    try {
        const response = await fetch(`${baseUrl}/expenses/shared`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(expense)
        })
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occured while adding a new shared expense');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding new shared expense: ', error);
        throw error;
    }
}