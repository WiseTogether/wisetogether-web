import type { ApiConfig } from '../lib/baseApiClient'
import type { SharedAccount } from '../types/auth'

export function createSharedAccountApi(apiRequest: <T>(config: ApiConfig) => Promise<T>) {
  return {
    createSharedAccount: async (userId: string, uniqueCode: string) => {
      return apiRequest({
        method: 'POST',
        url: '/shared-accounts',
        data: { userId, uniqueCode },
      })
    },

    findSharedAccountByUserId: async (userId: string): Promise<SharedAccount> => {
      return apiRequest<SharedAccount>({
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