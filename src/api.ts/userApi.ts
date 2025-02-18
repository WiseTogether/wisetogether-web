const baseUrl = import.meta.env.VITE_API_BASE_URL


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

export const findProfileByUserId = async (userId:string) => {
    try {
        const response = await fetch(`${baseUrl}/profiles/${userId}`)
    
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Something went wrong with fetching the profile');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user profile: ', error);
        throw error;
    }
}