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

export function useSharedAccountData(): UseSharedAccountDataReturn {
  const [sharedAccount, setSharedAccount] = useState<SharedAccount | null>(null)
  const [partnerProfile, setPartnerProfile] = useState<UserProfile | null>(null)
  const [invitationLink, setInvitationLink] = useState<string>('')
  const [isInvitedByPartner, setIsInvitedByPartner] = useState<boolean>(false)
  const [isSharedAccountLoading, setIsSharedAccountLoading] = useState<boolean>(true)

  const { session, apiRequest } = useAuth()
  const sharedAccountApi = createSharedAccountApi(apiRequest)
  const userApi = createUserApi(apiRequest)

  const fetchSharedAccountData = async () => {
    if (!session?.user) {
      setIsSharedAccountLoading(false)
      return
    }

    setIsSharedAccountLoading(true)
    try {
      // Fetch shared account details
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

        // If there's a partner, fetch their profile
        if (accountDetails.user2Id) {
          try {
            const user = accountDetails.user1Id === session.user.id ? 'user1' : 'user2'
            const partnerId = user === 'user1' ? accountDetails.user2Id : accountDetails.user1Id
            
            if (partnerId) {
              const partnerDetails = await userApi.getUserProfile(partnerId) as PartnerDetails
              setPartnerProfile({
                name: partnerDetails.name.split(' ')[0],
                avatarUrl: partnerDetails.avatar
              })
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
    refreshSharedAccount: fetchSharedAccountData
  }
} 