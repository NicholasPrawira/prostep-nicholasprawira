import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import type { SearchResult } from '@/lib/types'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setError('Masukkan deskripsi gambar')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])

    try {
      const response = await apiClient.search(searchQuery)
      setResults(response.results)
    } catch (err: any) {
      setError(err.message || 'Gagal mencari gambar')
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setQuery('')
    setError(null)
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    search,
    clearResults,
  }
}
