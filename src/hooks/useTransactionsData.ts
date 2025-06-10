import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createTransactionsApi } from '../api/transactionsApi'
import { Transaction } from '../types/transaction'

interface UseTransactionsDataReturn {
  transactions: Transaction[]
  personalTransactions: Transaction[]
  sharedTransactions: Transaction[]
  personalTotal: number
  sharedTotal: number
  isTransactionsLoading: boolean
  setTransactions: (transactions: Transaction[]) => void
  refreshTransactions: () => Promise<void>
}

// Helper to format date as yyyy-MM-dd
function formatDateToYMD(dateString: string): string {
  const d = new Date(dateString)
  if (isNaN(d.getTime())) return ''
  return d.toISOString().split('T')[0]
}

export function useTransactionsData(sharedAccountId: string | null): UseTransactionsDataReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isTransactionsLoading, setIsTransactionsLoading] = useState<boolean>(true)

  const { session, apiRequest } = useAuth()
  const transactionsApi = createTransactionsApi(apiRequest)

  // Memoize filtered transactions and totals
  const { personalTransactions, sharedTransactions, personalTotal, sharedTotal } = useMemo(() => {
    const personal = transactions.filter(t => !t.sharedAccountId)
    const shared = transactions.filter(t => t.sharedAccountId)
    
    const personalSum = personal.reduce((sum, t) => sum + Number(t.amount), 0)
    const sharedSum = shared.reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      personalTransactions: personal,
      sharedTransactions: shared,
      personalTotal: personalSum,
      sharedTotal: sharedSum
    }
  }, [transactions])

  const fetchTransactions = async () => {
    if (!session?.user || !sharedAccountId) {
      setIsTransactionsLoading(false)
      return
    }

    setIsTransactionsLoading(true)
    try {
      const fetchedTransactions = await transactionsApi.fetchAllTransactionsById(
        session.user.id,
        sharedAccountId
      )
      setTransactions(
        fetchedTransactions.length > 0 
          ? fetchedTransactions.map(t => ({ ...t, date: formatDateToYMD(t.date) })) 
          : []
      )
    } catch (error: any) {
      console.error('Error fetching transactions:', error.message)
    } finally {
      setIsTransactionsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [session, sharedAccountId])

  return {
    transactions,
    personalTransactions,
    sharedTransactions,
    personalTotal,
    sharedTotal,
    isTransactionsLoading,
    setTransactions,
    refreshTransactions: fetchTransactions
  }
} 