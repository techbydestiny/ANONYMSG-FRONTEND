// app/dashboard/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/app/context/ThemeContext'
import Link from 'next/link'
import { 
  Inbox, BarChart3, Settings, LogOut, Sun, Moon, Crown, User, Archive,
  Share2, Menu, X, AlertCircle, Loader2, Check
} from 'lucide-react'

// Import your existing components
import { DashboardInbox } from './components/DashboardInbox'
import { DashboardAnalytics } from './components/DashboardAnalytics'
import { DashboardSettings } from './components/DashboardSettings'

// Types
interface Message {
  id: number
  content: string
  created_at: string
  is_read: boolean
}

interface SettingsForm {
  username: string
  email: string
  bio: string
  teamColor: string
  profilePicture: string | null
  bannerImage: string | null
  socialLinks: {
    twitter: string
    instagram: string
    youtube: string
    website: string
  }
}

export default function DashboardPage() {
  const router = useRouter()
  const { darkMode, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'profile' | 'banner' | null>(null)
  const [showSavedAlert, setShowSavedAlert] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'inbox' | 'analytics' | 'settings'>('inbox')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [settings, setSettings] = useState<SettingsForm>({
    username: '',
    email: '',
    bio: '',
    teamColor: '#3B82F6',
    profilePicture: null,
    bannerImage: null,
    socialLinks: { twitter: '', instagram: '', youtube: '', website: '' }
  })
  const [stats, setStats] = useState({
    total: 0, 
    unread: 0, 
    thisWeek: 0, 
    streak: 0,
    responseRate: 0
  })

  // Image upload handlers
  const handleImageUpload = async (type: 'profile' | 'banner', file: File) => {
    setUploading(type)
    const formData = new FormData()
    formData.append(type === 'profile' ? 'profile_picture' : 'banner_image', file)
    
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json()
        if (type === 'profile') {
          setSettings(prev => ({ ...prev, profilePicture: data.profile_picture }))
        } else {
          setSettings(prev => ({ ...prev, bannerImage: data.banner_image }))
        }
      } else {
        alert(`Failed to upload ${type} image`)
      }
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Network error. Please try again.')
    } finally {
      setUploading(null)
    }
  }

  const handleImageRemove = async (type: 'profile' | 'banner') => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch('http://localhost:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [type === 'profile' ? 'profile_picture' : 'banner_image']: null
        }),
      })
      
      if (response.ok) {
        if (type === 'profile') {
          setSettings(prev => ({ ...prev, profilePicture: null }))
        } else {
          setSettings(prev => ({ ...prev, bannerImage: null }))
        }
      }
    } catch (error) {
      console.error('Remove failed:', error)
      alert('Failed to remove image')
    }
  }

  // Save settings
  const saveSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('access_token')
      
      // Update user account (username and email)
      const userResponse = await fetch('http://localhost:8000/api/auth/me/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: settings.username,
          email: settings.email,
        }),
      })
      
      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.error || 'Failed to update account')
      }
      
      // Update profile settings (bio, color, social links)
      const profileResponse = await fetch('http://localhost:8000/api/profile/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bio: settings.bio,
          team_color: settings.teamColor,
          twitter: settings.socialLinks.twitter,
          instagram: settings.socialLinks.instagram,
          youtube: settings.socialLinks.youtube,
          website: settings.socialLinks.website,
        }),
      })
      
      if (profileResponse.ok) {
        setShowSavedAlert(true)
        setTimeout(() => setShowSavedAlert(false), 3000)
      } else {
        throw new Error('Failed to save profile settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert(error instanceof Error ? error.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('access_token')
        
        // Fetch profile
        const profileRes = await fetch('http://localhost:8000/api/profile/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const profileData = await profileRes.json()
        
        setSettings({
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
            website: profileData.website || '',
          }
        })
        
        // Fetch messages
        const messagesRes = await fetch('http://localhost:8000/api/messages/inbox/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const messagesData = await messagesRes.json()
        const fetchedMessages = messagesData.results || []
        setMessages(fetchedMessages)
              
      // Calculate stats
      const total = fetchedMessages.length
      const unread = fetchedMessages.filter((m: Message) => !m.is_read).length

      // Calculate This Week (last 7 days)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const thisWeek = fetchedMessages.filter((m: Message) => new Date(m.created_at) >= oneWeekAgo).length

      // Calculate Streak (consecutive days with messages)
      const dates: string[] = fetchedMessages.map((m: Message) => new Date(m.created_at).toDateString())
      const uniqueDates: string[] = [...new Set(dates)].sort()
      let streak = 0
      let currentStreak = 0
      let lastDate: Date | null = null

      for (const dateStr of uniqueDates) {
        const currentDate = new Date(dateStr)
        if (lastDate) {
          const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays === 1) {
            currentStreak++
          } else if (diffDays > 1) {
            currentStreak = 1
          }
        } else {
          currentStreak = 1
        }
        streak = Math.max(streak, currentStreak)
        lastDate = currentDate
      }

      // Calculate response rate (read messages / total)
      const read = fetchedMessages.filter((m: Message) => m.is_read).length
      const responseRate = total > 0 ? Math.round((read / total) * 100) : 0

      setStats({
        total,
        unread,
        thisWeek,
        streak,
        responseRate
      })
        
      } catch (error) {
        console.error('Failed to fetch:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [router])

  const handleLogout = () => {
    localStorage.clear()
    router.push('/login')
  }

  const shareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/@${settings.username}`)
    alert('Profile link copied!')
  }

  const deleteMessage = async (id: number) => {
    const token = localStorage.getItem('access_token')
    await fetch(`http://localhost:8000/api/messages/${id}/delete/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setMessages(messages.filter(m => m.id !== id))
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: messages.find(m => m.id === id && !m.is_read) ? prev.unread - 1 : prev.unread
    }))
  }

  const archiveMessage = async (id: number) => {
    const token = localStorage.getItem('access_token')
    await fetch(`http://localhost:8000/api/messages/${id}/archive/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setMessages(messages.filter(m => m.id !== id))
    setStats(prev => ({
      ...prev,
      total: prev.total - 1,
      unread: messages.find(m => m.id === id && !m.is_read) ? prev.unread - 1 : prev.unread
    }))
  }

  const markAsRead = async (id: number) => {
    const token = localStorage.getItem('access_token')
    await fetch(`http://localhost:8000/api/messages/${id}/read/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    setMessages(messages.map(m => m.id === id ? { ...m, is_read: true } : m))
    setStats(prev => ({ ...prev, unread: prev.unread - 1 }))
  }

  const markAllAsRead = async () => {
    for (const message of messages.filter(m => !m.is_read)) {
      await markAsRead(message.id)
    }
  }

  const exportMessages = () => {
    const data = JSON.stringify(messages, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `messages-${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateShareImage = (message: Message) => {
    // Handled in DashboardInbox component
  }

  const handleReport = (message: Message) => {
    alert(`Reported: "${message.content.substring(0, 50)}..."`)
  }

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    sidebar: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    border: darkMode ? 'border-gray-800' : 'border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSec: darkMode ? 'text-gray-400' : 'text-gray-500',
    inactive: darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100',
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center max-w-md p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>Error</h2>
          <p className={themeClasses.textSec}>{error}</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Success Alert */}
      {showSavedAlert && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <Check size={16} /> Settings saved!
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-md"
      >
        {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <div className={`
        fixed top-0 left-0 bottom-0 w-64 z-50 transform transition-transform duration-300 lg:hidden
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        ${themeClasses.sidebar} border-r ${themeClasses.border}
      `}>
        <div className="p-6">
          {/* Sidebar User Info - With Profile Picture */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            {/* Profile Picture */}
            {settings.profilePicture ? (
              <img 
                src={settings.profilePicture} 
                alt={settings.username}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
            )}
            <div>
              <p className={`font-medium ${themeClasses.text}`}>@{settings.username}</p>
              <p className="text-xs text-gray-500">Pro Member</p>
            </div>
          </div>
          <nav className="space-y-1">
            <button onClick={() => { setActiveTab('inbox'); setMobileMenuOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'inbox' ? 'bg-blue-600 text-white' : themeClasses.inactive}`}>
              <Inbox size={18} /> Inbox
              {stats.unread > 0 && <span className="ml-auto bg-blue-500 text-white text-xs px-2 rounded-full">{stats.unread}</span>}
            </button>
            <Link href="/dashboard/archive" onClick={() => setMobileMenuOpen(false)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${themeClasses.inactive}`}>
              <Archive size={18} /> Archive
            </Link>
            <button onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : themeClasses.inactive}`}>
              <BarChart3 size={18} /> Analytics
            </button>
            <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false) }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'settings' ? 'bg-blue-600 text-white' : themeClasses.inactive}`}>
              <Settings size={18} /> Settings
            </button>
          </nav>
          <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${themeClasses.inactive}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />} {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className={`hidden lg:block fixed left-0 top-16 bottom-0 w-64 ${themeClasses.sidebar} border-r ${themeClasses.border} overflow-y-auto`}>
        <div className="p-6">
          {/* Sidebar User Info - With Profile Picture */}
          <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
            {/* Profile Picture */}
            {settings.profilePicture ? (
              <img 
                src={settings.profilePicture} 
                alt={settings.username}
                className="w-10 h-10 rounded-xl object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
            )}
            <div>
              <p className={`font-medium ${themeClasses.text}`}>@{settings.username}</p>
              <p className="text-xs text-gray-500">Pro Member</p>
            </div>
          </div>
          <nav className="space-y-1">
            <button onClick={() => setActiveTab('inbox')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'inbox' ? 'bg-blue-600 text-white' : themeClasses.inactive}`}>
              <Inbox size={18} /> Inbox
              {stats.unread > 0 && <span className="ml-auto bg-blue-500 text-white text-xs px-2 rounded-full">{stats.unread}</span>}
            </button>
            <Link href="/dashboard/archive" className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${themeClasses.inactive}`}>
              <Archive size={18} /> Archive
            </Link>
            <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : themeClasses.inactive}`}>
              <BarChart3 size={18} /> Analytics
            </button>
            <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeTab === 'settings' ? 'bg-blue-600 text-white' : themeClasses.inactive}`}>
              <Settings size={18} /> Settings
            </button>
          </nav>
          <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button onClick={toggleTheme} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${themeClasses.inactive}`}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />} {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 pt-20">
        <div className={`border-b ${themeClasses.border} px-6 py-4`}>
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
                {activeTab === 'inbox' && 'Messages'}
                {activeTab === 'analytics' && 'Analytics'}
                {activeTab === 'settings' && 'Settings'}
              </h1>
              <p className={`text-sm ${themeClasses.textSec}`}>
                {activeTab === 'inbox' && `${stats.unread} unread messages`}
              </p>
            </div>
            <button onClick={shareLink} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm flex items-center gap-2">
              <Share2 size={14} /> Share Profile
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'inbox' && (
            <DashboardInbox 
              messages={messages}
              stats={stats}
              darkMode={darkMode}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
              onDelete={deleteMessage}
              onArchive={archiveMessage}
              onExport={exportMessages}
              onShareLink={shareLink}
              onShareImage={generateShareImage}
              onReport={handleReport}
              username={settings.username}
              brandColor={settings.teamColor}
              profilePicture={settings.profilePicture}
            />
          )}

          {activeTab === 'analytics' && (
            <DashboardAnalytics stats={stats} darkMode={darkMode} />
          )}

          {activeTab === 'settings' && (
            <DashboardSettings 
              settingsForm={settings}
              darkMode={darkMode}
              onSettingsChange={(field, value) => setSettings({ ...settings, [field]: value })}
              onSocialLinkChange={(platform, value) => setSettings({ ...settings, socialLinks: { ...settings.socialLinks, [platform]: value } })}
              onImageUpload={handleImageUpload}
              onImageRemove={handleImageRemove}
              onSave={saveSettings}
              isSaving={saving}
              isUploading={uploading}
              selectedColor={settings.teamColor}
              setSelectedColor={(color) => setSettings({ ...settings, teamColor: color })}
              profilePreview={settings.profilePicture}
              setProfilePreview={() => {}}
              bannerPreview={settings.bannerImage}
              setBannerPreview={() => {}}
            />
          )}
        </div>
      </main>
    </div>
  )
}