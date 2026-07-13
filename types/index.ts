// types/index.ts
export interface User {
  id: number
  username: string
  email: string
  avatarColor: string
  createdAt: string
  messageCount: number
}

export interface Message {
  id: number
  content: string
  createdAt: string
  isRead: boolean
  reaction?: string
  isReported: boolean
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ApiError {
  message: string
  status: number
}