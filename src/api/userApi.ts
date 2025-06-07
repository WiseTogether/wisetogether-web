import { useApiClient } from '../lib/apiClient'

const apiClient = useApiClient()

export const createUserProfile = async (userId: string, name: string) => {
  return apiClient({
    method: 'POST',
    url: '/profiles',
    data: { user_id: userId, name },
  })
}

export const getUserProfile = async (userId: string) => {
  return apiClient({
    method: 'GET',
    url: `/profiles/${userId}`,
  })
}