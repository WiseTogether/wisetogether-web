import { describe, it, expect, vi } from 'vitest'
import { extractUserProfile } from '../authUtils'
import type { Session } from '@supabase/supabase-js'

// Mock the baseApiClient module
vi.mock('../../lib/baseApiClient', () => ({
  default: {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({}),
  },
}))

describe('extractUserProfile', () => {
  it('should return null if session is null', () => {
    expect(extractUserProfile(null)).toBeNull()
  })

  it('should return null if session user is missing', () => {
    const session = { 
      user: null,
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: 'bearer'
    } as unknown as Session
    expect(extractUserProfile(session)).toBeNull()
  })

  it('should extract display name and avatar URL from metadata', () => {
    const session = {
      user: {
        id: '123',
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01',
        user_metadata: {
          full_name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: 'bearer'
    } as unknown as Session

    expect(extractUserProfile(session)).toEqual({
      name: 'John',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
  })

  it('should fall back to name if full_name is missing', () => {
    const session = {
      user: {
        id: '123',
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01',
        user_metadata: {
          name: 'John Doe',
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: 'bearer'
    } as unknown as Session

    expect(extractUserProfile(session)).toEqual({
      name: 'John',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
  })

  it('should return default name if no name metadata is present', () => {
    const session = {
      user: {
        id: '123',
        app_metadata: {},
        aud: 'authenticated',
        created_at: '2024-01-01',
        user_metadata: {
          avatar_url: 'https://example.com/avatar.jpg',
        },
      },
      access_token: '',
      refresh_token: '',
      expires_in: 0,
      token_type: 'bearer'
    } as unknown as Session

    expect(extractUserProfile(session)).toEqual({
      name: 'User',
      avatarUrl: 'https://example.com/avatar.jpg',
    })
  })
}) 