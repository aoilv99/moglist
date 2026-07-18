import axios from 'axios'

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1'

export const USE_MOCK_API: boolean = import.meta.env.VITE_USE_MOCK_API === 'true'

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})
