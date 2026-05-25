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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })
  
  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshToken = localStorage.getItem('refresh_token')
    if (refreshToken) {
      const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      })
      
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        localStorage.setItem('access_token', data.access)
        // Retry original request
        return apiRequest(endpoint, options)
      } else {
        // Refresh failed, redirect to login
        localStorage.clear()
        window.location.href = '/login'
      }
    }
  }
  
  return response
}

// Auth API exports
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

// Profile API exports
export const profileAPI = {
  getProfile: () => apiRequest('/profile/'),
  
  updateProfile: (data: FormData) =>
    fetch(`${API_BASE_URL}/profile/`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
      },
      body: data,
    }),
  
  getPublicProfile: (username: string) =>
    apiRequest(`/profile/public/${username}/`),
}

// Messages API exports
export const messagesAPI = {
  getInbox: (page = 1) => apiRequest(`/messages/inbox/?page=${page}`),
  
  sendMessage: (data: { recipient_username: string; content: string; message_type?: string }) =>
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
}