import { Transaction } from '../types/transaction'
import { ApiConfig } from '../lib/baseApiClient'

export function createTransactionsApi(apiRequest: <T>(config: ApiConfig) => Promise<T>) {
  return {
    fetchAllTransactionsById: async (userId: string, sharedAccountId: string | null): Promise<Transaction[]> => {
      const queries: { [key: string]: string } = { userId }
      if (sharedAccountId) {
        queries.sharedAccountId = sharedAccountId
      }
      const queryParams = new URLSearchParams(queries).toString()
      
      return apiRequest<Transaction[]>({
        method: 'GET',
        url: `/expenses?${queryParams}`,
      })
    },

    addNewPersonalExpense: async (expense: Transaction) => {
      return apiRequest<Transaction>({
        method: 'POST',
        url: '/expenses/personal',
        data: expense,
      })
    },

    addNewSharedExpense: async (expense: Transaction) => {
      return apiRequest<Transaction>({
        method: 'POST',
        url: '/expenses/shared',
        data: expense,
      })
    },

    editTransaction: async (expenseId: string, expense: Transaction) => {
      return apiRequest<Transaction>({
        method: 'PATCH',
        url: `/expenses/${expenseId}`,
        data: expense,
      })
    },

    deleteTransaction: async (expenseId: string): Promise<void> => {
      await apiRequest<void>({
        method: 'DELETE',
        url: `/expenses/${expenseId}`,
      })
    }
  }
}