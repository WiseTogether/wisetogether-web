import { Session } from '@supabase/supabase-js'
import { UserProfile } from '../types/auth'
import { ApiConfig, ApiError } from '../lib/baseApiClient'
import { baseApiClient } from '../lib/baseApiClient'


// Extracts user profile information from a Supabase session
export function extractUserProfile(session: Session | null): UserProfile | null {
  if (!session?.user) return null

  const metadata = session.user.user_metadata
  const fullName = metadata?.full_name || metadata?.name || 'User'
  const displayName = fullName.split(' ')[0] // Get first name

  return {
    name: displayName,
    avatarUrl: metadata?.avatar_url || metadata?.picture
  }
}

// Creates an API request function that includes the current session's access token
export function createApiRequest(session: Session | null) {
  return async <T,>(config: ApiConfig): Promise<T> => {
    if (!session?.access_token) {
      throw new ApiError('No access token available', 401)
    }
    return baseApiClient<T>({ ...config, accessToken: session.access_token })
  }
}