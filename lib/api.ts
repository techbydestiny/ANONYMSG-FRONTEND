// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token')
  }
  return null
}

// API request helper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getToken()
  
  // Build headers properly without index signature error
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  // Merge with any additional headers from options
  const mergedHeaders = { ...headers, ...(options.headers as Record<string, string> || {}) }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: mergedHeaders,
  })
  
  // Handle token refresh on 401
  if (response.status === 401) {
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh: refreshToken }),
        })
        
        if (refreshResponse.ok) {
          const data = await refreshResponse.json()
          localStorage.setItem('access_token', data.access)
          // Retry original request with new token
          return apiRequest(endpoint, options)
        } else {
          // Refresh failed, clear storage and redirect to login
          localStorage.clear()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
        }
      } catch (error) {
        console.error('Token refresh failed:', error)
      }
    }
  }
  
  return response
}

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; password2: string }) =>
    apiRequest('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  login: (data: { email: string; password: string }) =>
    apiRequest('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  getMe: () => apiRequest('/auth/me/'),
}

// Profile API
export const profileAPI = {
  getProfile: () => apiRequest('/profile/'),
  
  updateProfile: (data: FormData | Record<string, any>) => {
    const token = getToken()
    const isFormData = data instanceof FormData
    
    const headers: Record<string, string> = {}
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return fetch(`${API_BASE_URL}/profile/`, {
      method: 'PATCH',
      headers,
      body: isFormData ? data : JSON.stringify(data),
    })
  },
  
  getPublicProfile: (username: string) =>
    apiRequest(`/profile/public/${username}/`),
}

// Messages API
export const messagesAPI = {
  getInbox: (page = 1) => apiRequest(`/messages/inbox/?page=${page}`),
  
  sendMessage: (data: { recipient_username: string; content: string; message_type?: string; tip_text?: string }) =>
    apiRequest('/messages/send/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  markAsRead: (messageId: number) =>
    apiRequest(`/messages/${messageId}/read/`, { method: 'POST' }),
  
  deleteMessage: (messageId: number) =>
    apiRequest(`/messages/${messageId}/delete/`, { method: 'DELETE' }),
  
  reportMessage: (messageId: number, reason: string, description?: string) =>
    apiRequest(`/messages/${messageId}/report/`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    }),
  
  getStats: () => apiRequest('/messages/stats/'),
  
  archiveMessage: (messageId: number) =>
    apiRequest(`/messages/${messageId}/archive/`, { method: 'POST' }),
}