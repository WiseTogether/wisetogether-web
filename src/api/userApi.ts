import type { ApiConfig } from '../lib/baseApiClient'

export function createUserApi(apiRequest: <T>(config: ApiConfig) => Promise<T>) {
  return {
    createUserProfile: async (userId: string, name: string) => {
      return apiRequest({
        method: 'POST',
        url: '/profiles',
        data: { user_id: userId, name },
      })
    },

    getUserProfile: async (userId: string) => {
      return apiRequest({
        method: 'GET',
        url: `/profiles/${userId}`,
      })
    }
  }
}