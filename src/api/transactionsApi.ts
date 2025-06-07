import { useApiClient } from '../lib/apiClient'
import type { transaction } from '../App.tsx'

const apiClient = useApiClient()

export const fetchAllTransactionsById = async (userId: string, sharedAccountId: string | null) => {
  const queries: { [key: string]: string } = { userId }
  if (sharedAccountId) {
    queries.sharedAccountId = sharedAccountId
  }
  const queryParams = new URLSearchParams(queries).toString()
  
  return apiClient<transaction[]>({
    method: 'GET',
    url: `/expenses?${queryParams}`,
  })
}

export const addNewPersonalExpense = async (expense: transaction) => {
  return apiClient<transaction>({
    method: 'POST',
    url: '/expenses/personal',
    data: expense,
  })
}

export const addNewSharedExpense = async (expense: transaction) => {
  return apiClient<transaction>({
    method: 'POST',
    url: '/expenses/shared',
    data: expense,
  })
}