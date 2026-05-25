// app/dashboard/hooks/useDashboardData.ts
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { messagesAPI, profileAPI } from '@/lib/api'
import { Message, SettingsForm, DashboardStats } from '../types'

export function useDashboardData() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    unread: 0,
    thisWeek: 0,
    responseRate: 0,
    streak: 0
  })
  const [settingsForm, setSettingsForm] = useState<SettingsForm>({
    username: '',
    email: '',
    bio: '',
    emailNotifications: true,
    pushNotifications: true,
    weeklyDigest: false,
    publicWall: true,
    allowVoice: true,
    autoDelete: false,
    profilePicture: null,
    bannerImage: null,
    teamColor: '#3B82F6',
    socialLinks: {
      twitter: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      github: '',
      website: '',
      discord: '',
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        router.push('/login')
        return
      }
      
      try {
        const profileRes = await profileAPI.getProfile()
        const profileData = await profileRes.json()
        
        setSettingsForm(prev => ({
          ...prev,
          username: profileData.username || '',
          email: profileData.email || '',
          bio: profileData.bio || '',
          teamColor: profileData.team_color || '#3B82F6',
          profilePicture: profileData.profile_picture || null,
          bannerImage: profileData.banner_image || null,
          socialLinks: {
            twitter: profileData.twitter || '',
            instagram: profileData.instagram || '',
            youtube: profileData.youtube || '',
            tiktok: profileData.tiktok || '',
            github: profileData.github || '',
            website: profileData.website || '',
            discord: profileData.discord || '',
          }
        }))
        
        const messagesRes = await messagesAPI.getInbox()
        const messagesData = await messagesRes.json()
        setMessages(messagesData.results || [])
        
        const statsRes = await messagesAPI.getStats()
        const statsData = await statsRes.json()
        setStats({
          total: statsData.total || 0,
          unread: statsData.unread || 0,
          thisWeek: statsData.this_week || 0,
          responseRate: statsData.response_rate || 0,
          streak: statsData.streak || 0
        })
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  const deleteMessage = async (id: number) => {
    try {
      await messagesAPI.deleteMessage(id)
      setMessages(messages.filter((m) => m.id !== id))
    } catch (error) {
      console.error('Failed to delete message:', error)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      await messagesAPI.markAsRead(id)
      setMessages(messages.map((m) => (m.id === id ? { ...m, is_read: true } : m)))
    } catch (error) {
      console.error('Failed to mark as read:', error)
    }
  }

  const markAllAsRead = async () => {
    const unreadMessages = messages.filter(m => !m.is_read)
    for (const message of unreadMessages) {
      await messagesAPI.markAsRead(message.id)
    }
    setMessages(messages.map((m) => ({ ...m, is_read: true })))
  }

  const handleSettingsChange = (field: keyof SettingsForm, value: any) => {
    setSettingsForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSocialLinkChange = (platform: keyof typeof settingsForm.socialLinks, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value }
    }))
  }

  const saveSettings = async () => {
    try {
      const formData = new FormData()
      formData.append('bio', settingsForm.bio)
      formData.append('team_color', settingsForm.teamColor)
      formData.append('twitter', settingsForm.socialLinks.twitter)
      formData.append('instagram', settingsForm.socialLinks.instagram)
      formData.append('youtube', settingsForm.socialLinks.youtube)
      formData.append('tiktok', settingsForm.socialLinks.tiktok)
      formData.append('github', settingsForm.socialLinks.github)
      formData.append('website', settingsForm.socialLinks.website)
      formData.append('discord', settingsForm.socialLinks.discord)
      
      await profileAPI.updateProfile(formData)
      return true
    } catch (error) {
      console.error('Failed to save settings:', error)
      return false
    }
  }

  return {
    messages,
    loading,
    stats,
    settingsForm,
    deleteMessage,
    markAsRead,
    markAllAsRead,
    handleSettingsChange,
    handleSocialLinkChange,
    saveSettings,
  }
}