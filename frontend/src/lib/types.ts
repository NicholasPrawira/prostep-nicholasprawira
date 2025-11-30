export interface SearchResult {
  prompt: string
  image_url: string
  clipscore: number
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
}

export interface ApiError {
  detail: string
}

export interface HealthResponse {
  status: string
}