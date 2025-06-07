import { useAuth } from '../auth/AuthContext'

interface ApiConfig {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  url: string
  data?: unknown
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function useApiClient() {
  const { session } = useAuth()

  return async function apiClient<T>({ 
    method, 
    url, 
    data
  }: ApiConfig): Promise<T> {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (!session?.access_token) {
      throw new ApiError('No access token available', 401)
    }
    
    headers['Authorization'] = `Bearer ${session.access_token}`

    try {
      const response = await fetch(`${baseUrl}${url}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.error || 'An error occurred',
          response.status,
          errorData
        )
      }

      return response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError('Network error')
    }
  }
}