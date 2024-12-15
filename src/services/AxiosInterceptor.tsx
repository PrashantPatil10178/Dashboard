import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import Cookies from 'js-cookie'
import { Navigate } from '@tanstack/react-router'
import { jwtDecode, JwtPayload } from 'jwt-decode'
import { T } from 'node_modules/@faker-js/faker/dist/airline-BnpeTvY9'
import { escape } from 'querystring'

interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

const API_URL = 'http://localhost:4000'
const ACCESS_TOKEN_COOKIE = 'access_token'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

export class AuthService {
  private api: AxiosInstance
  private refreshPromise: Promise<string> | null = null

  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config) => {
        const token = Cookies.get(ACCESS_TOKEN_COOKIE)
        if (token) {
          if (this.isTokenExpired(token)) {
            const newToken = await this.refreshAccessToken()
            if (newToken) {
              config.headers['Authorization'] = `Bearer ${newToken}`
            }
          } else {
            config.headers['Authorization'] = `Bearer ${token}`
          }
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean
        }
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          try {
            const newAccessToken = await this.refreshAccessToken()
            if (newAccessToken) {
              if (originalRequest.headers) {
                originalRequest.headers['Authorization'] =
                  `Bearer ${newAccessToken}`
              }
              return this.api(originalRequest)
            }
          } catch (refreshError) {
            this.logout()
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      }
    )
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<JwtPayload>(token)
      if (!decoded.exp) return true

      const currentTime = Date.now() / 1000
      const isExpired = decoded.exp < currentTime + 300 // 300 seconds = 5 minutes

      if (isExpired) {
        console.log('Token is expired or will expire soon. Refreshing...')
      }

      return isExpired
    } catch (error) {
      console.error('Error decoding token:', error)
      return true // Assume token is expired if it can't be decoded
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      console.log('Reached I guess')
      console.log('I am new to ' + (await this.refreshPromise))
      return await this.refreshPromise
    }

    this.refreshPromise = new Promise<string>(async (resolve, reject) => {
      try {
        const refreshToken = Cookies.get(REFRESH_TOKEN_COOKIE)
        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await this.api.post<RefreshTokenResponse>(
          '/auth/refresh',
          { refreshToken }
        )

        if (
          response.data &&
          response.data.accessToken &&
          response.data.refreshToken
        ) {
          this.setTokens(response.data.accessToken, response.data.refreshToken)
          resolve(response.data.accessToken)
        } else {
          throw new Error('Invalid response from refresh token endpoint')
        }
      } catch (error) {
        console.error('Error refreshing token:', error)
        this.logout() // Logout user if refresh fails
        reject(error)
      } finally {
        this.refreshPromise = null
      }
    })

    return this.refreshPromise
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    Cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
      secure: false,
      sameSite: 'strict',
    })
    Cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, {
      secure: false,
      sameSite: 'strict',
    })
  }

  public getAccessToken(): string | undefined {
    return Cookies.get(ACCESS_TOKEN_COOKIE)
  }

  public getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_TOKEN_COOKIE)
  }

  public getToken(): boolean {
    if (Cookies.get(ACCESS_TOKEN_COOKIE)) {
      return true
    } else {
      return false
    }
  }

  public clearTokens() {
    Cookies.remove(ACCESS_TOKEN_COOKIE)
    Cookies.remove(REFRESH_TOKEN_COOKIE)
  }

  private logout() {
    this.clearTokens()
    // Add any additional logout logic here (e.g., redirect to login page)
    window.location.href = '/login'
  }

  // Generic request method
  public async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.api.request(config)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Resource not found')
        }
        if (error.response?.status === 500) {
          throw new Error('Internal server error')
        }
      }
      throw error
    }
  }

  // Convenience methods for common HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  public async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  public async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }
  public async isAdmin(): Promise<any> {
    const access_token = Cookies.get(ACCESS_TOKEN_COOKIE)
    if (access_token) {
      const JwtPayload = jwtDecode<any>(access_token)
      if (JwtPayload.role == 'TEACHER') {
        return true
      } else {
        return false
      }
    }
    return console.log('Tokken not found Bro')
  }
  public async postFormData<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const formDataConfig: AxiosRequestConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }
    return this.request<T>({
      ...formDataConfig,
      method: 'POST',
      url,
      data: formData,
    })
  }
}

export const api = new AuthService()
