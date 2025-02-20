const baseUrl = import.meta.env.VITE_API_BASE_URL

// Make a POST request to create a new shared account
export const createSharedAccount = async (userId:string, uniqueCode:string) => {
    try {
        const response = await fetch(`${baseUrl}/shared-accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId, uniqueCode })
        })
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Something went wrong');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating shared account: ', error);
        throw error;
    }
}

// Make a GET request to fetch the shared account for the specified userId
export const findSharedAccountByUserId = async (userId:string) => {
    try {
        const response = await fetch(`${baseUrl}/shared-accounts/${userId}`)

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Shared account not found');
            }
            throw new Error('An error occurred while fetching the shared account');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching shared account: ', error);
        throw error;
    }
}

// Make a PATCH request to add a user to an existing shared account using a unique code
export const addUserToSharedAccount = async (user2Id:string, uniqueCode:string) => {
    const timestamp = new Date().toISOString();
    try {
        const response = await fetch(`${baseUrl}/shared-accounts/accept-invite?code=${uniqueCode}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user2Id, timestamp })
        })
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'An error occurred while adding user to the shared account');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error adding user to the shared account: ', error);
        throw error;
    }
}