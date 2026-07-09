// frontend/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
export { API_BASE_URL }

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
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
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
          return apiRequest(endpoint, options)
        } else {
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
  
  verifyEmail: (data: { token: string; email: string }) =>
    apiRequest('/auth/verify-email/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  resendVerification: (data: { email: string }) =>
    apiRequest('/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  forgotPassword: (data: { email: string }) =>
    apiRequest('/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  resetPassword: (data: { token: string; email: string; new_password: string; confirm_password: string }) =>
    apiRequest('/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
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
  
  getArchived: (page = 1) => apiRequest(`/messages/archived/?page=${page}`),
  
  // Text message
  sendMessage: (data: { recipient_username: string; content: string; message_type?: string }) =>
    apiRequest('/messages/send/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Voice message with FormData
  sendVoiceMessage: (formData: FormData) => {
    const token = getToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData - browser will set it with boundary
    
    return fetch(`${API_BASE_URL}/messages/send-voice/`, {
      method: 'POST',
      headers,
      body: formData,
    })
  },
  
  // Image message with FormData
  sendImageMessage: (formData: FormData) => {
    const token = getToken()
    const headers: Record<string, string> = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData - browser will set it with boundary
    
    return fetch(`${API_BASE_URL}/messages/send-image/`, {
      method: 'POST',
      headers,
      body: formData,
    })
  },
  
  // GIF message (sent as text with gif type)
  sendGIFMessage: (data: { recipient_username: string; content: string }) =>
    apiRequest('/messages/send/', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        message_type: 'gif'
      }),
    }),
  
  getMessage: (messageId: string) => apiRequest(`/messages/${messageId}/`),
  
  markAsRead: (messageId: string) =>
    apiRequest(`/messages/${messageId}/read/`, { method: 'POST' }),
  
  deleteMessage: (messageId: string) =>
    apiRequest(`/messages/${messageId}/delete/`, { method: 'DELETE' }),
  
  permanentDelete: (messageId: string) =>
    apiRequest(`/messages/${messageId}/permanent-delete/`, { method: 'DELETE' }),
  
  reportMessage: (messageId: string, reason: string, description?: string) =>
    apiRequest(`/messages/${messageId}/report/`, {
      method: 'POST',
      body: JSON.stringify({ reason, description }),
    }),
  
  getStats: () => apiRequest('/messages/stats/'),
  
  archiveMessage: (messageId: string) =>
    apiRequest(`/messages/${messageId}/archive/`, { method: 'POST' }),
  
  restoreMessage: (messageId: string) =>
    apiRequest(`/messages/${messageId}/restore/`, { method: 'POST' }),
  
  pinMessage: (messageId: string) =>
    apiRequest(`/messages/${messageId}/pin/`, { method: 'POST' }),
  
  unpinMessage: (messageId: string) =>
    apiRequest(`/messages/${messageId}/unpin/`, { method: 'POST' }),
}

// Polls API
export const pollsAPI = {
  getPolls: () => apiRequest('/messages/polls/'),
  
  getPoll: (pollId: string) => apiRequest(`/messages/polls/${pollId}/`),
  
  createPoll: (data: { 
    question: string; 
    options: string[]; 
    expires_at?: string | null; 
    allow_multiple_votes?: boolean;
  }) => apiRequest('/messages/polls/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  vote: (pollId: string, optionId: number) => 
    apiRequest(`/messages/polls/${pollId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId, poll_id: pollId }),
    }),
  
  deletePoll: (pollId: string) => 
    apiRequest(`/messages/polls/${pollId}/`, { method: 'DELETE' }),
}

// Q&A API
export const qaAPI = {
  getSessions: (live?: boolean) => 
    apiRequest(`/messages/qa/sessions/${live ? '?live=true' : ''}`),
  
  getSession: (id: string) => 
    apiRequest(`/messages/qa/sessions/${id}/`),
  
  createSession: (data: {
    title: string;
    description?: string;
    starts_at: string;
    ends_at?: string | null;
    allow_anonymous?: boolean;
    require_approval?: boolean;
    max_questions?: number;
  }) => apiRequest('/messages/qa/sessions/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  updateSession: (id: string, data: any) => 
    apiRequest(`/messages/qa/sessions/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  deleteSession: (id: string) => 
    apiRequest(`/messages/qa/sessions/${id}/`, { method: 'DELETE' }),
  
  toggleLive: (id: string, isLive: boolean) => 
    apiRequest(`/messages/qa/sessions/${id}/live/`, {
      method: 'POST',
      body: JSON.stringify({ is_live: isLive }),
    }),
  
  getQuestions: (sessionId: string) => 
    apiRequest(`/messages/qa/questions/?session_id=${sessionId}`),
  
  submitQuestion: (data: { session_id: string; question: string; is_anonymous?: boolean }) => 
    apiRequest('/messages/qa/questions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  upvoteQuestion: (id: string) => 
    apiRequest(`/messages/qa/questions/${id}/upvote/`, { method: 'POST' }),
  
  pinQuestion: (id: string, isPinned: boolean) => 
    apiRequest(`/messages/qa/questions/${id}/pin/`, {
      method: 'POST',
      body: JSON.stringify({ is_pinned: isPinned }),
    }),
  
  submitAnswer: (data: { question_id: string; answer: string }) => 
    apiRequest('/messages/qa/answers/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMessage: (messageId: string) => 
    apiRequest(`/messages/${messageId}/`),
}
