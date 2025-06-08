import type { ApiConfig } from '../lib/baseApiClient'
import type { transaction } from '../App'

export function createTransactionsApi(apiRequest: <T>(config: ApiConfig) => Promise<T>) {
  return {
    fetchAllTransactionsById: async (userId: string, sharedAccountId: string | null) => {
      const queries: { [key: string]: string } = { userId }
      if (sharedAccountId) {
        queries.sharedAccountId = sharedAccountId
      }
      const queryParams = new URLSearchParams(queries).toString()
      
      return apiRequest<transaction[]>({
        method: 'GET',
        url: `/expenses?${queryParams}`,
      })
    },

    addNewPersonalExpense: async (expense: transaction) => {
      return apiRequest<transaction>({
        method: 'POST',
        url: '/expenses/personal',
        data: expense,
      })
    },

    addNewSharedExpense: async (expense: transaction) => {
      return apiRequest<transaction>({
        method: 'POST',
        url: '/expenses/shared',
        data: expense,
      })
    }
  }
}