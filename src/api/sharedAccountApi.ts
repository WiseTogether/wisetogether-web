import type { ApiConfig } from '../lib/baseApiClient'
import type { sharedAccount } from '../App'

export function createSharedAccountApi(apiRequest: <T>(config: ApiConfig) => Promise<T>) {
  return {
    createSharedAccount: async (userId: string, uniqueCode: string) => {
      return apiRequest({
        method: 'POST',
        url: '/shared-accounts',
        data: { userId, uniqueCode },
      })
    },

    findSharedAccountByUserId: async (userId: string): Promise<sharedAccount> => {
      return apiRequest<sharedAccount>({
        method: 'GET',
        url: `/shared-accounts/${userId}`,
      })
    },

    addUserToSharedAccount: async (user2Id: string, uniqueCode: string) => {
      return apiRequest({
        method: 'PATCH',
        url: `/shared-accounts/accept-invite?code=${uniqueCode}`,
        data: { user2Id, timestamp: new Date().toISOString() },
      })
    }
  }
}