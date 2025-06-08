export interface ApiConfig {
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

export async function baseApiClient<T>({ 
  method, 
  url, 
  data,
  accessToken
}: ApiConfig & { accessToken: string }): Promise<T> {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const requestBody = data ? { body: JSON.stringify(data) } : {}
    
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` })
      },
      ...requestBody
    });

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Server error response:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      throw new ApiError(`API request failed: ${response.statusText}`, response.status)
    }

    const text = await response.text()
    if (!text) return {} as T
    
    return JSON.parse(text) as T
  } catch (error) {
    console.error('API client error:', error)
    if (error instanceof ApiError) throw error
    throw new ApiError(error instanceof Error ? error.message : 'Unknown error occurred', 500)
  }
}
