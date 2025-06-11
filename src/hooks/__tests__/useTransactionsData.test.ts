import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTransactionsData } from '../useTransactionsData'
import { useAuth } from '../../auth/AuthContext'
import { createTransactionsApi } from '../../api/transactionsApi'
import { Transaction } from '../../types/transaction'

// Mock the auth context
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock the transactions API
vi.mock('../../api/transactionsApi', () => ({
  createTransactionsApi: vi.fn()
}))

describe('useTransactionsData', () => {
  const mockSession = {
    user: {
      id: 'user123',
      email: 'test@example.com'
    }
  }

  const mockApiRequest = vi.fn()
  const mockTransactionsApi = {
    fetchAllTransactionsById: vi.fn()
  }

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'user123',
      amount: '100',
      date: '2024-03-20',
      description: 'Personal transaction',
      category: 'food',
      sharedAccountId: undefined
    },
    {
      id: '2',
      userId: 'user123',
      amount: '200',
      date: '2024-03-20',
      description: 'Shared transaction',
      category: 'transport',
      sharedAccountId: 'shared123'
    },
    {
      id: '3',
      userId: 'user123',
      amount: '300',
      date: '2024-03-20',
      description: 'Another shared transaction',
      category: 'entertainment',
      sharedAccountId: 'shared123'
    }
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useAuth as any).mockReturnValue({ session: mockSession, apiRequest: mockApiRequest })
    ;(createTransactionsApi as any).mockReturnValue(mockTransactionsApi)
  })

  it('should return initial state when no session or shared account ID', () => {
    ;(useAuth as any).mockReturnValue({ session: null, apiRequest: mockApiRequest })
    
    const { result } = renderHook(() => useTransactionsData(null))
    
    expect(result.current).toEqual({
      transactions: [],
      personalTransactions: [],
      sharedTransactions: [],
      personalTotal: 0,
      sharedTotal: 0,
      isTransactionsLoading: false,
      setTransactions: expect.any(Function),
      refreshTransactions: expect.any(Function)
    })
  })

  it('should fetch and process transactions', async () => {
    mockTransactionsApi.fetchAllTransactionsById.mockResolvedValue(mockTransactions)

    const { result } = renderHook(() => useTransactionsData('shared123'))

    // Initial loading state
    expect(result.current.isTransactionsLoading).toBe(true)

    // Wait for the data to be fetched
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Verify the data was fetched
    expect(mockTransactionsApi.fetchAllTransactionsById).toHaveBeenCalledWith('user123', 'shared123')

    // Verify the returned data
    expect(result.current.transactions).toHaveLength(3)
    expect(result.current.personalTransactions).toHaveLength(1)
    expect(result.current.sharedTransactions).toHaveLength(2)
    expect(result.current.personalTotal).toBe(100)
    expect(result.current.sharedTotal).toBe(500)
    expect(result.current.isTransactionsLoading).toBe(false)
  })

  it('should handle empty transaction list', async () => {
    mockTransactionsApi.fetchAllTransactionsById.mockResolvedValue([])

    const { result } = renderHook(() => useTransactionsData('shared123'))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current).toEqual({
      transactions: [],
      personalTransactions: [],
      sharedTransactions: [],
      personalTotal: 0,
      sharedTotal: 0,
      isTransactionsLoading: false,
      setTransactions: expect.any(Function),
      refreshTransactions: expect.any(Function)
    })
  })

  it('should handle API errors gracefully', async () => {
    mockTransactionsApi.fetchAllTransactionsById.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useTransactionsData('shared123'))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current).toEqual({
      transactions: [],
      personalTransactions: [],
      sharedTransactions: [],
      personalTotal: 0,
      sharedTotal: 0,
      isTransactionsLoading: false,
      setTransactions: expect.any(Function),
      refreshTransactions: expect.any(Function)
    })
  })

  it('should allow manual transaction updates', async () => {
    const { result } = renderHook(() => useTransactionsData('shared123'))

    await act(async () => {
      result.current.setTransactions(mockTransactions)
    })

    expect(result.current.transactions).toHaveLength(3)
    expect(result.current.personalTransactions).toHaveLength(1)
    expect(result.current.sharedTransactions).toHaveLength(2)
    expect(result.current.personalTotal).toBe(100)
    expect(result.current.sharedTotal).toBe(500)
  })

  it('should format dates correctly', async () => {
    const transactionsWithDifferentDates: Transaction[] = [
      {
        id: '1',
        userId: 'user123',
        amount: '100',
        date: '2024-03-20T12:00:00Z',
        description: 'Transaction with ISO date',
        category: 'food',
        sharedAccountId: undefined
      },
      {
        id: '2',
        userId: 'user123',
        amount: '200',
        date: '2024-03-21',
        description: 'Transaction with YMD date',
        category: 'transport',
        sharedAccountId: 'shared123'
      }
    ]

    mockTransactionsApi.fetchAllTransactionsById.mockResolvedValue(transactionsWithDifferentDates)

    const { result } = renderHook(() => useTransactionsData('shared123'))

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.transactions).toEqual([
      {
        id: '1',
        userId: 'user123',
        amount: '100',
        date: '2024-03-20',
        description: 'Transaction with ISO date',
        category: 'food',
        sharedAccountId: undefined
      },
      {
        id: '2',
        userId: 'user123',
        amount: '200',
        date: '2024-03-21',
        description: 'Transaction with YMD date',
        category: 'transport',
        sharedAccountId: 'shared123'
      }
    ])
  })
}) 