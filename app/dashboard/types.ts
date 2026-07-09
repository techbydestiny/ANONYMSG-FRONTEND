// app/dashboard/types.ts
export interface Message {
  id: number
  content: string
  created_at: string
  is_read: boolean
  is_pinned?: boolean
  is_archived?: boolean
  is_archiving_soon?: boolean
  days_until_archive?: number
  reaction?: string
  type?: 'text' | 'voice' | 'image'
  media_url?: string
}

export interface SettingsForm {
  username: string
  email: string
  bio: string
  emailNotifications: boolean
  pushNotifications: boolean
  weeklyDigest: boolean
  publicWall: boolean
  allowVoice: boolean
  autoDelete: boolean
  profilePicture: string | null
  bannerImage: string | null
  teamColor: string
  socialLinks: {
    twitter: string
    instagram: string
    youtube: string
    tiktok: string
    github: string
    website: string
    discord: string
  }
}

export interface Stats {
  total: number
  unread: number
  thisWeek: number
  responseRate: number
  streak: number
}