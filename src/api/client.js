import axios from 'axios'
import { toApiError } from './errors'

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

const NO_REFRESH_PATHS = ['/auth/signin', '/auth/signup', '/auth/refresh', '/auth/signout']

let accessToken = null
let sessionExpiredHandler = null
let refreshPromise = null

export const getAccessToken = () => accessToken
export const setAccessToken = (token) => {
  accessToken = token
}

export const setSessionExpiredHandler = (handler) => {
  sessionExpiredHandler = handler
}

const client = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${baseURL}/auth/refresh`, null, { withCredentials: true })
      .then((response) => {
        setAccessToken(response.data.accessToken)
        return response.data.accessToken
      })
      .catch((error) => {
        throw toApiError(error)
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

client.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const skipRefresh = NO_REFRESH_PATHS.some((path) => config?.url?.startsWith(path))

    if (response?.status === 401 && config && !config._retry && !skipRefresh) {
      config._retry = true
      try {
        const token = await refreshAccessToken()
        config.headers.Authorization = `Bearer ${token}`
        return client(config)
      } catch (refreshError) {
        setAccessToken(null)
        sessionExpiredHandler?.()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(toApiError(error))
  },
)

export default client
