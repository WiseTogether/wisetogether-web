import { useApiClient } from '../lib/apiClient'

const apiClient = useApiClient()

// Make a POST request to create a new shared account
export const createSharedAccount = async (userId: string, uniqueCode: string) => {
    return apiClient({
        method: 'POST',
        url: '/shared-accounts',
        data: { userId, uniqueCode },
    })
}

// Make a GET request to fetch the shared account for the specified userId
export const findSharedAccountByUserId = async (userId: string) => {
    return apiClient({
        method: 'GET',
        url: `/shared-accounts/${userId}`,
    })
}

// Make a PATCH request to add a user to an existing shared account using a unique code
export const addUserToSharedAccount = async (user2Id: string, uniqueCode: string) => {
    return apiClient({
        method: 'PATCH',
        url: `/shared-accounts/accept-invite?code=${uniqueCode}`,
        data: { user2Id, timestamp: new Date().toISOString() },
    })
}