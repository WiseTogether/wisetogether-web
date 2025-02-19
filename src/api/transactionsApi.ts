const baseUrl = import.meta.env.VITE_API_BASE_URL

export const fetchAllTransactionsById = async (userId:string, sharedAccountId:string | null) => {
    try {

        let queries: { [key: string]: string } = { userId: userId };

        if (sharedAccountId) {
            queries.sharedAccountId = sharedAccountId;
        }

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