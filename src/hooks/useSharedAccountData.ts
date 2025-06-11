import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import { createSharedAccountApi } from '../api/sharedAccountApi'
import { createUserApi } from '../api/userApi'
import { SharedAccount, UserProfile, PartnerDetails } from '../types/auth'

interface UseSharedAccountDataReturn {
  sharedAccount: SharedAccount | null
  partnerProfile: UserProfile | null
  invitationLink: string
  isInvitedByPartner: boolean
  isSharedAccountLoading: boolean
  refreshSharedAccount: () => Promise<void>
}

// Cache keys
const CACHE_KEYS = {
  sharedAccount: (userId: string) => `sharedAccount_${userId}`,
  partnerProfile: (partnerId: string) => `partnerProfile_${partnerId}`
}

// Cache expiration time (24 hours)
const CACHE_EXPIRY = 24 * 60 * 60 * 1000

interface CacheData<T> {
  data: T
  timestamp: number
}

function getCachedData<T>(key: string): T | null {
  const cached = localStorage.getItem(key)
  if (!cached) return null

  try {
    const { data, timestamp }: CacheData<T> = JSON.parse(cached)
    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    localStorage.removeItem(key)
    return null
  }
}

function setCachedData<T>(key: string, data: T): void {
  const cacheData: CacheData<T> = {
    data,
    timestamp: Date.now()
  }
  localStorage.setItem(key, JSON.stringify(cacheData))
}

export function useSharedAccountData(): UseSharedAccountDataReturn {
  const [sharedAccount, setSharedAccount] = useState<SharedAccount | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)
  const [invitationLink, setInvitationLink] = useState<string>('')
  const [isInvitedByPartner, setIsInvitedByPartner] = useState<boolean>(false)
  const [isSharedAccountLoading, setIsSharedAccountLoading] = useState<boolean>(true)

  const { session, apiRequest } = useAuth()
  const sharedAccountApi = createSharedAccountApi(apiRequest)
  const userApi = createUserApi(apiRequest)

  const fetchSharedAccountData = async (forceRefresh = false) => {
    if (!session?.user) {
      setIsSharedAccountLoading(false)
      return
    }

    setIsSharedAccountLoading(true)
    try {
      // Try to get from cache first
      const cacheKey = CACHE_KEYS.sharedAccount(session.user.id)
      const cachedData = !forceRefresh ? getCachedData<{
        sharedAccount: SharedAccount
        invitationLink: string
        isInvitedByPartner: boolean
        partnerId: string | null
      }>(cacheKey) : null

      if (cachedData) {
        setSharedAccount(cachedData.sharedAccount)
        setInvitationLink(cachedData.invitationLink)
        setIsInvitedByPartner(cachedData.isInvitedByPartner)

        // If we have a partner ID, try to get their profile from cache
        if (cachedData.partnerId) {
          const partnerCacheKey = CACHE_KEYS.partnerProfile(cachedData.partnerId)
          const cachedPartner = getCachedData<UserProfile>(partnerCacheKey)
          if (cachedPartner) {
            setPartnerProfile(cachedPartner)
          } else {
            // Fetch partner profile if not in cache
            const partnerDetails = await userApi.getUserProfile(cachedData.partnerId) as PartnerDetails
            const profile = {
              name: partnerDetails.name.split(' ')[0],
              avatarUrl: partnerDetails.avatar
            }
            setPartnerProfile(profile)
            setCachedData(partnerCacheKey, profile)
          }
        }
        setIsSharedAccountLoading(false)
        return
      }

      // If not in cache or force refresh, fetch from API
      const accountDetails = await sharedAccountApi.findSharedAccountByUserId(session.user.id)
      
      if (accountDetails) {
        const sharedAccountData = {
          uuid: accountDetails.uuid,
          user1Id: accountDetails.user1Id,
          user2Id: accountDetails.user2Id
        }
        setSharedAccount(sharedAccountData)

        // Set invitation status
        setIsInvitedByPartner(!!accountDetails.user2Id)

        // Create invitation link
        const link = `${import.meta.env.VITE_APP_BASE_URL}/invite?code=${accountDetails.uniqueCode}`
        setInvitationLink(link)

        // Cache the shared account data
        setCachedData(cacheKey, {
          sharedAccount: sharedAccountData,
          invitationLink: link,
          isInvitedByPartner: !!accountDetails.user2Id,
          partnerId: accountDetails.user1Id === session.user.id ? accountDetails.user2Id : accountDetails.user1Id
        })

        // If there's a partner, fetch and cache their profile
        if (accountDetails.user2Id) {
          try {
            const user = accountDetails.user1Id === session.user.id ? 'user1' : 'user2'
            const partnerId = user === 'user1' ? accountDetails.user2Id : accountDetails.user1Id
            
            if (partnerId) {
              const partnerDetails = await userApi.getUserProfile(partnerId) as PartnerDetails
              const profile = {
                name: partnerDetails.name.split(' ')[0],
                avatarUrl: partnerDetails.avatar
              }
              setPartnerProfile(profile)
              setCachedData(CACHE_KEYS.partnerProfile(partnerId), profile)
            }
          } catch (error: any) {
            console.error('Error fetching partner profile:', error.message)
          }
        }
      }
    } catch (error: any) {
      console.error('Error fetching shared account data:', error.message)
    } finally {
      setIsSharedAccountLoading(false)
    }
  }

  useEffect(() => {
    fetchSharedAccountData()
  }, [session])

  return {
    sharedAccount,
    partnerProfile,
    invitationLink,
    isInvitedByPartner,
    isSharedAccountLoading,
    refreshSharedAccount: () => fetchSharedAccountData(true)
  }
} 