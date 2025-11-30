export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const ENDPOINTS = {
  SEARCH: `${API_URL}/search`,
  HEALTH: `${API_URL}/health`,
}

export const SEARCH_CONFIG = {
  LIMIT: 5,
  DEBOUNCE_MS: 300,
}

export const UI = {
  GRID_COLUMNS: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
  },
  MAX_MODAL_HEIGHT: '90vh',
}
