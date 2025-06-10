import type { ApiConfig } from '../lib/baseApiClient'

export function createUserApi(apiRequest: <T>(config: ApiConfig) => Promise<T>) {
  return {

    getUserProfile: async (userId: string) => {
      return apiRequest({
        method: 'GET',
        url: `/profiles/${userId}`,
      })
    }
  }
}