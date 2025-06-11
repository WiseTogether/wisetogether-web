import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSharedAccountData } from '../useSharedAccountData'
import { useAuth } from '../../auth/AuthContext'
import { createSharedAccountApi } from '../../api/sharedAccountApi'
import { createUserApi } from '../../api/userApi'

// Mock the auth context
vi.mock('../../auth/AuthContext', () => ({
  useAuth: vi.fn()
}))

// Mock the APIs
vi.mock('../../api/sharedAccountApi', () => ({
  createSharedAccountApi: vi.fn()
}))

vi.mock('../../api/userApi', () => ({
  createUserApi: vi.fn()
}))

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key]
    }),
    clear: () => {
      store = {}
    }
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('useSharedAccountData', () => {
  const mockSession = {
    user: {
      id: 'user123',
      email: 'test@example.com'
    }
  }

  const mockApiRequest = vi.fn()
  const mockSharedAccountApi = {
    findSharedAccountByUserId: vi.fn()
  }
  const mockUserApi = {
    getUserProfile: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
    ;(useAuth as any).mockReturnValue({ session: mockSession, apiRequest: mockApiRequest })
    ;(createSharedAccountApi as any).mockReturnValue(mockSharedAccountApi)
    ;(createUserApi as any).mockReturnValue(mockUserApi)
  })

  it('should return initial state when no session', () => {
    ;(useAuth as any).mockReturnValue({ session: null, apiRequest: mockApiRequest })
    
    const { result } = renderHook(() => useSharedAccountData())
    
    expect(result.current).toEqual({
      sharedAccount: null,
      partnerProfile: null,
      invitationLink: '',
      isInvitedByPartner: false,
      isSharedAccountLoading: false,
      refreshSharedAccount: expect.any(Function)
    })
  })

  it('should fetch and cache shared account data', async () => {
    const mockAccountDetails = {
      uuid: 'acc123',
      user1Id: 'user123',
      user2Id: 'partner456',
      uniqueCode: 'invite123'
    }

    const mockPartnerDetails = {
      name: 'Partner Name',
      avatar: 'avatar-url'
    }

    mockSharedAccountApi.findSharedAccountByUserId.mockResolvedValue(mockAccountDetails)
    mockUserApi.getUserProfile.mockResolvedValue(mockPartnerDetails)

    const { result } = renderHook(() => useSharedAccountData())

    // Initial loading state
    expect(result.current.isSharedAccountLoading).toBe(true)

    // Wait for the data to be fetched
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Verify the data was fetched and cached
    expect(mockSharedAccountApi.findSharedAccountByUserId).toHaveBeenCalledWith('user123')
    expect(mockUserApi.getUserProfile).toHaveBeenCalledWith('partner456')
    expect(localStorageMock.setItem).toHaveBeenCalled()

    // Verify the returned data
    expect(result.current).toEqual({
      sharedAccount: {
        uuid: 'acc123',
        user1Id: 'user123',
        user2Id: 'partner456'
      },
      partnerProfile: {
        name: 'Partner',
        avatarUrl: 'avatar-url'
      },
      invitationLink: expect.stringContaining('/invite?code=invite123'),
      isInvitedByPartner: true,
      isSharedAccountLoading: false,
      refreshSharedAccount: expect.any(Function)
    })
  })

  it('should use cached data when available', async () => {
    const cachedData = {
      data: {
        sharedAccount: {
          uuid: 'acc123',
          user1Id: 'user123',
          user2Id: 'partner456'
        },
        invitationLink: 'http://example.com/invite?code=invite123',
        isInvitedByPartner: true,
        partnerId: 'partner456'
      },
      timestamp: Date.now()
    }

    const cachedPartnerData = {
      data: {
        name: 'Partner',
        avatarUrl: 'avatar-url'
      },
      timestamp: Date.now()
    }

    localStorageMock.getItem
      .mockImplementation((key: string) => {
        if (key.includes('sharedAccount')) return JSON.stringify(cachedData)
        if (key.includes('partnerProfile')) return JSON.stringify(cachedPartnerData)
        return null
      })

    const { result } = renderHook(() => useSharedAccountData())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Verify that API calls were not made
    expect(mockSharedAccountApi.findSharedAccountByUserId).not.toHaveBeenCalled()
    expect(mockUserApi.getUserProfile).not.toHaveBeenCalled()

    // Verify the cached data was used
    expect(result.current).toEqual({
      sharedAccount: cachedData.data.sharedAccount,
      partnerProfile: cachedPartnerData.data,
      invitationLink: cachedData.data.invitationLink,
      isInvitedByPartner: true,
      isSharedAccountLoading: false,
      refreshSharedAccount: expect.any(Function)
    })
  })

  it('should handle expired cache', async () => {
    const expiredCache = {
      data: {
        sharedAccount: {
          uuid: 'acc123',
          user1Id: 'user123',
          user2Id: 'partner456'
        },
        invitationLink: 'http://example.com/invite?code=invite123',
        isInvitedByPartner: true,
        partnerId: 'partner456'
      },
      timestamp: Date.now() - (25 * 60 * 60 * 1000) // 25 hours ago
    }

    localStorageMock.getItem.mockReturnValue(JSON.stringify(expiredCache))

    const mockAccountDetails = {
      uuid: 'acc123',
      user1Id: 'user123',
      user2Id: 'partner456',
      uniqueCode: 'invite123'
    }

    mockSharedAccountApi.findSharedAccountByUserId.mockResolvedValue(mockAccountDetails)

    const { result } = renderHook(() => useSharedAccountData())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    // Verify that the expired cache was removed
    expect(localStorageMock.removeItem).toHaveBeenCalled()
    // Verify that fresh data was fetched
    expect(mockSharedAccountApi.findSharedAccountByUserId).toHaveBeenCalled()
  })

  it('should handle API errors gracefully', async () => {
    mockSharedAccountApi.findSharedAccountByUserId.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() => useSharedAccountData())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current).toEqual({
      sharedAccount: null,
      partnerProfile: null,
      invitationLink: '',
      isInvitedByPartner: false,
      isSharedAccountLoading: false,
      refreshSharedAccount: expect.any(Function)
    })
  })
}) 