'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface SearchResult {
  prompt: string
  image_url: string
  clipscore: number
  similarity: number
}

interface SearchResponse {
  query: string
  results: SearchResult[]
}

// Predefined categories for the "Category" mode
const PREDEFINED_CATEGORIES = [
  'Tanaman Pangan', 'Tanaman Buah', 'Hewan Ternak', 'Hewan Liar',
  'Alat Pertanian', 'Proses Menanam', 'Lingkungan Desa', 'Sampah & Daur Ulang',
  'Drum Industri', 'Keselamatan Anak', 'Cuaca & Musim', 'Kegiatan Warga',
  'Transportasi Desa'
]

const LOADING_MESSAGES = [
  "Sebentar ya...",
  "AI lagi buka buku ajaib dulu...",
  "AI lagi bisik-bisik sama komputer lain...rahasia!",
  "Sabar ya...",
  "Hampir selesai..."
]

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

export default function SearchForm() {
  const [query, setQuery] = useState('')
  const [searchMode, setSearchMode] = useState<'prompt' | 'category'>('prompt')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<SearchResult | null>(null)

  // New state for UI polish
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Rotate loading messages
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (loading) {
      interval = setInterval(() => {
        setLoadingMsgIndex((prev) => (prev + 1) % LOADING_MESSAGES.length)
      }, 2000)
    } else {
      setLoadingMsgIndex(0)
    }
    return () => clearInterval(interval)
  }, [loading])

  // Fetch initial images on mount
  useEffect(() => {
    const fetchInitialImages = async () => {
      setLoading(true)
      try {
        // Artificial delay for animation
        await new Promise(resolve => setTimeout(resolve, 3000))
        const response = await axios.get<SearchResponse>(`${API_BASE_URL}/images`)
        setResults(response.data.results)
      } catch (err) {
        console.error('Failed to fetch initial images:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchInitialImages()
  }, [])

  const handleSearch = async (e?: React.FormEvent, overrideQuery?: string) => {
    if (e) e.preventDefault()

    const searchQuery = overrideQuery || query
    if (!searchQuery.trim()) {
      setError('Masukkan deskripsi gambar atau pilih kategori')
      return
    }

    setLoading(true)
    setError(null)
    setResults([])
    setFailedImages(new Set())
    setSelectedImage(null)

    try {
      // Artificial delay for animation
      await new Promise(resolve => setTimeout(resolve, 3000))
      const response = await axios.get<SearchResponse>(`${API_BASE_URL}/search`, {
        params: { q: searchQuery },
      })
      setResults(response.data.results)
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
        'Gagal mencari gambar. Pastikan API server berjalan di http://127.0.0.1:8000'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    setQuery(category)
    handleSearch(undefined, category)
  }

  const handleSaveImage = async (result: SearchResult) => {
    try {
      const response = await fetch(result.image_url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `tigaraksa-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error:', err)
      alert('Gagal menyimpan gambar')
    }
  }

  // Sort results: valid images first, failed images last
  const sortedResults = [...results].sort((a, b) => {
    const aFailed = failedImages.has(a.image_url)
    const bFailed = failedImages.has(b.image_url)
    if (aFailed === bFailed) return 0
    return aFailed ? 1 : -1
  })

  return (
    <div className="w-full">
      <div className="space-y-8">
        {/* Search Input Section */}
        <div className="max-w-3xl mx-auto">

          {/* Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white p-1 rounded-full shadow-sm border border-gray-200 inline-flex">
              <button
                onClick={() => setSearchMode('prompt')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${searchMode === 'prompt'
                  ? 'bg-umn-blue text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                ✍️ Tulis Prompt
              </button>
              <button
                onClick={() => setSearchMode('category')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${searchMode === 'category'
                  ? 'bg-umn-blue text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                🏷️ Pilih Kategori
              </button>
            </div>
          </div>

          {searchMode === 'prompt' ? (
            <form onSubmit={(e) => handleSearch(e)} className="relative flex items-center group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-gray-400 group-focus-within:text-umn-blue transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari gambar... (contoh: Pemandangan sawah di sore hari)"
                className="block w-full pl-16 pr-32 py-5 bg-white border-2 border-gray-100 rounded-full shadow-sm text-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-umn-blue focus:ring-4 focus:ring-umn-blue/10 transition-all duration-300"
              />
              <div className="absolute right-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-3 bg-umn-blue hover:bg-blue-800 disabled:bg-gray-300 text-white rounded-full font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  ) : 'Cari'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white p-6 rounded-3xl border-2 border-gray-100 shadow-sm">
              <p className="text-center text-gray-500 mb-4 text-sm font-medium">Pilih kategori untuk melihat gambar terkait:</p>
              <div className="flex flex-wrap justify-center gap-3">
                {PREDEFINED_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    disabled={loading}
                    className="px-5 py-2.5 bg-gray-50 hover:bg-umn-lightBlue hover:text-umn-blue border border-gray-200 rounded-full text-gray-700 font-medium transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {category}
                  </button>
                ))}
              </div>
              {loading && (
                <div className="text-center mt-4 text-umn-blue font-medium animate-pulse">
                  Sedang mencari gambar kategori {query}...
                </div>
              )}
            </div>
          )}

          {/* Cute Loading Animation */}
          {loading && (
            <div className="mt-8 text-center animate-fade-in">
              <div className="inline-flex flex-col items-center justify-center p-6">
                <div className="relative w-16 h-16 mb-4">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-umn-blue rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl animate-bounce">
                    🔎
                  </div>
                </div>
                <p className="text-umn-blue font-bold text-lg animate-pulse">
                  {LOADING_MESSAGES[loadingMsgIndex]}
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center text-sm font-medium animate-fade-in">
              {error}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {/* Results Grid */}
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedResults.map((result, idx) => (
                <div
                  key={result.image_url || idx}
                  className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full ${failedImages.has(result.image_url) ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <img
                      src={result.image_url}
                      alt={result.prompt}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="200"%3E%3Crect fill="%23f3f4f6" width="300" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="14" fill="%239ca3af"%3EImage not found%3C/text%3E%3C/svg%3E'
                        setFailedImages(prev => {
                          const newSet = new Set(prev)
                          newSet.add(result.image_url)
                          return newSet
                        })
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                      <button
                        onClick={() => setSelectedImage(result)}
                        className="bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-white transition-colors shadow-lg z-10 cursor-pointer"
                      >
                        Lihat Detail
                      </button>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex-1 mb-4">
                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {result.prompt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Score</p>
                          <p className="text-sm font-bold text-umn-blue">{result.clipscore.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Mirip</p>
                          <p className="text-sm font-bold text-green-600">{(result.similarity * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSaveImage(result)}
                        className="p-2 text-gray-400 hover:text-umn-blue hover:bg-blue-50 rounded-full transition-colors"
                        title="Simpan Gambar"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && !error && query && (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">Tidak ada hasil ditemukan</h3>
                <p className="text-gray-500 mt-1">Coba kata kunci lain yang lebih spesifik</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Image Detail Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedImage(null)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row animate-scale-in z-50">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="w-full md:w-1/2 bg-gray-100 flex items-center justify-center p-4 md:p-0">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.prompt}
                className="max-w-full max-h-[50vh] md:max-h-full object-contain"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-umn-yellow rounded-full"></span>
                  Detail Gambar
                </h3>

                <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Prompt</p>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {selectedImage.prompt}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs text-blue-600 font-medium mb-1">CLIP Score</p>
                    <p className="text-2xl font-bold text-umn-blue">{selectedImage.clipscore.toFixed(3)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                    <p className="text-xs text-green-600 font-medium mb-1">Kemiripan</p>
                    <p className="text-2xl font-bold text-green-700">{(selectedImage.similarity * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleSaveImage(selectedImage)}
                  className="w-full py-4 bg-umn-blue hover:bg-blue-800 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Unduh Gambar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}