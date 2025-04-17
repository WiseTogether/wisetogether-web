const baseUrl = import.meta.env.VITE_API_BASE_URL

// Make a POST request to create a new user profile
export const createUserProfile = async (userId:string, name:string) => {
    try {
        const response = await fetch(`${baseUrl}/profiles/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 'user_id': userId, name })
        })
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Something went wrong');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error creating user profile: ', error);
        throw error;
    }
}

// Fetches the profile of a user by their user ID.
export const getUserProfile = async (userId:string, token: string) => {
    try {
        const response = await fetch(`${baseUrl}/profiles/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                'X-Supabase-Auth': token,
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User profile not found');
            }
            throw new Error('An error occurred while fetching user profile');
        }
        
        return response.json();
    } catch (error) {
        console.error('Error fetching user profile: ', error);
        throw error;
    }
}