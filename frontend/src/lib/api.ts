import { ENDPOINTS } from './constants'
import type { SearchResponse, ApiError } from './types'

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000') {
    this.baseUrl = baseUrl
  }

  async search(query: string): Promise<SearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const error: ApiError = await response.json()
        throw new Error(error.detail || 'Failed to search')
      }

      return await response.json()
    } catch (error) {
      console.error('Search error:', error)
      throw error
    }
  }

  async health() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Health check failed')
      }

      return await response.json()
    } catch (error) {
      console.error('Health check error:', error)
      throw error
    }
  }
}

export const apiClient = new ApiClient()
