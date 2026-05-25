// app/[username]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { messagesAPI, profileAPI } from '@/lib/api'
import { useTheme } from '@/app/context/ThemeContext'

// Lucide React Icons
import { 
  Send, Shield, Lock, User, Calendar, MessageSquare,
  Check, AlertCircle, Copy, Eye, Heart, Users, Star,
  Twitter, Instagram, Youtube, Github, Globe, Link as LinkIcon,
  MapPin, Mail, Sparkles, AlertTriangle
} from 'lucide-react'

// React Icons for Social Media
import { 
  FaTwitter, FaInstagram, FaYoutube, FaGithub, FaDiscord, FaTiktok 
} from 'react-icons/fa'
import { FiLink } from 'react-icons/fi'

// Button Component with theme support
const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick, fullWidth, disabled, loading, type = 'button', darkMode = false }: any) => {
  const baseStyles = "font-medium transition-all duration-200 inline-flex items-center justify-center gap-2 rounded-lg"
  
  const variants: any = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: darkMode
      ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
      : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200",
  }
  
  const sizes: any = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-base"
  }
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  )
}

// Social Link Component with theme
const SocialLink = ({ href, icon: Icon, label, darkMode }: { href: string | null, icon: any, label: string, darkMode: boolean }) => {
  if (!href) return null
  return (
    <Link 
      href={href} 
      target="_blank" 
      className={`p-2.5 rounded-lg transition-colors group ${
        darkMode 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      title={label}
    >
      <Icon size={18} className={`transition-colors ${
        darkMode 
          ? 'text-gray-400 group-hover:text-white' 
          : 'text-gray-600 group-hover:text-gray-900'
      }`} />
    </Link>
  )
}

interface PublicProfile {
  username: string
  bio: string
  profile_picture: string | null
  banner_image: string | null
  team_color: string
  twitter: string | null
  instagram: string | null
  youtube: string | null
  tiktok: string | null
  github: string | null
  website: string | null
  discord: string | null
  message_count: number
  join_date: string
}

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { darkMode } = useTheme()
  const username = params.username as string
  
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const maxChars = 1000

  // Social links configuration
  const socialLinks = [
    { key: 'twitter', icon: FaTwitter, label: 'Twitter' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { key: 'youtube', icon: FaYoutube, label: 'YouTube' },
    { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { key: 'github', icon: FaGithub, label: 'GitHub' },
    { key: 'website', icon: FiLink, label: 'Website' },
    { key: 'discord', icon: FaDiscord, label: 'Discord' },
  ]

  useEffect(() => {
    // Get current logged-in user
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        setCurrentUser(user.username)
      } catch (e) {
        console.error('Failed to parse user:', e)
      }
    }
    
    const fetchProfile = async () => {
      try {
        const response = await profileAPI.getPublicProfile(username)
        const data = await response.json()
        setProfile(data)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        setError('User not found')
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfile()
  }, [username])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent sending message to yourself
    if (currentUser === username) {
      setError("You cannot send a message to yourself")
      return
    }
    
    if (!message.trim() || message.length < 3) return
    
    setIsSending(true)
    setError('')
    
    try {
      const response = await messagesAPI.sendMessage({
        recipient_username: username,
        content: message,
        message_type: 'text'
      })
      
      if (response.ok) {
        setSent(true)
        setMessage('')
        setCharacterCount(0)
        setTimeout(() => setSent(false), 3000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to send message')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const handleMessageChange = (text: string) => {
    if (text.length <= maxChars) {
      setMessage(text)
      setCharacterCount(text.length)
    }
  }

  const copyProfileLink = () => {
    const link = window.location.href
    navigator.clipboard.writeText(link)
    alert('Profile link copied!')
  }

  const isOwnProfile = currentUser === username

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    textMuted: darkMode ? 'text-gray-600' : 'text-gray-400',
    card: darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm',
    input: darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
    buttonSecondary: darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className={themeClasses.textSecondary}>Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-700" />
          </div>
          <h1 className={`text-xl font-medium ${themeClasses.text} mb-2`}>User not found</h1>
          <p className={themeClasses.textSecondary}>The profile you're looking for doesn't exist.</p>
          <Link href="/">
            <Button variant="secondary" darkMode={darkMode} className="mt-6">
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const firstChar = profile.username ? profile.username.charAt(0).toUpperCase() : '?'
  const activeSocialLinks = socialLinks.filter(link => profile[link.key as keyof PublicProfile])

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Banner Section */}
      <div className="relative h-32 sm:h-48 w-full overflow-hidden">
        {profile.banner_image ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.banner_image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${profile.team_color || '#3B82F6'}20, ${darkMode ? '#000000' : '#f0f0f0'})`
            }}
          />
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Profile Header */}
        <div className="relative -mt-12 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              {profile.profile_picture ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-black shadow-lg">
                  <img 
                    src={profile.profile_picture} 
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div 
                  className="w-24 h-24 rounded-xl flex items-center justify-center border-4 border-black shadow-lg"
                  style={{ backgroundColor: profile.team_color || '#3B82F6' }}
                >
                  <span className="text-3xl font-bold text-white">{firstChar}</span>
                </div>
              )}
              <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1.5 shadow-lg">
                <Shield size={10} className="text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 pb-1">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>
                  {profile.username}
                </h1>
                <button
                  onClick={copyProfileLink}
                  className={`p-1.5 rounded-lg transition ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Copy profile link"
                >
                  <Copy size={14} className={themeClasses.textSecondary} />
                </button>
              </div>
              
              {/* Stats Row */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <MessageSquare size={14} className="text-blue-500" />
                  <span className={`text-sm ${themeClasses.text}`}>{profile.message_count || 0}</span>
                  <span className={`text-xs ${themeClasses.textSecondary}`}>messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-purple-500" />
                  <span className={`text-xs ${themeClasses.textSecondary}`}>
                    Joined {profile.join_date ? new Date(profile.join_date).getFullYear() : 'recently'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className={`mt-4 p-4 rounded-xl border ${darkMode ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
              <p className={`text-sm ${themeClasses.textSecondary} leading-relaxed`}>
                {profile.bio}
              </p>
            </div>
          )}

          {/* Social Links */}
          {activeSocialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {activeSocialLinks.map((link) => {
                const Icon = link.icon
                const url = profile[link.key as keyof PublicProfile]
                if (!url) return null
                return (
                  <SocialLink 
                    key={link.key}
                    href={url as string}
                    icon={Icon}
                    label={link.label}
                    darkMode={darkMode}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Message Form - Hidden if viewing own profile */}
        {!isOwnProfile ? (
          <div className={`rounded-xl border p-6 ${themeClasses.card}`}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                  Send Anonymous Message
                </label>
                <div className="relative">
                  <textarea
                    className={`w-full ${themeClasses.input} rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition resize-none`}
                    rows={4}
                    placeholder={`Write your anonymous message to @${profile.username}...`}
                    value={message}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    maxLength={maxChars}
                  />
                  <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                    {characterCount}/{maxChars}
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Shield size={12} />
                  <span>100% Anonymous</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Lock size={12} />
                  <span>End-to-end encrypted</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Eye size={12} />
                  <span>No tracking</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm flex items-center gap-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {sent && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center gap-2">
                  <Check size={16} />
                  Message sent anonymously!
                </div>
              )}

              <Button 
                type="submit" 
                fullWidth 
                loading={isSending}
                disabled={!message.trim() || message.length < 3}
                darkMode={darkMode}
              >
                <Send size={14} />
                Send Anonymous Message
              </Button>
            </form>
          </div>
        ) : (
          // Message when viewing own profile
          <div className={`rounded-xl border p-8 text-center ${themeClasses.card}`}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <User size={32} className="text-blue-500" />
            </div>
            <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>This is your profile</h3>
            <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
              You cannot send messages to yourself. Share your profile link with others to receive anonymous messages.
            </p>
            <button
              onClick={copyProfileLink}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                darkMode 
                  ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
              }`}
            >
              <Copy size={14} className="inline mr-2" />
              Copy Profile Link
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-8">
          <p className={`text-xs ${themeClasses.textMuted}`}>
            Your identity is never stored. Messages are encrypted and anonymous.
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className={`text-xs ${themeClasses.textMuted} hover:${darkMode ? 'text-gray-400' : 'text-gray-600'} transition`}>
              Privacy
            </Link>
            <Link href="/terms" className={`text-xs ${themeClasses.textMuted} hover:${darkMode ? 'text-gray-400' : 'text-gray-600'} transition`}>
              Terms
            </Link>
            <Link href="/about" className={`text-xs ${themeClasses.textMuted} hover:${darkMode ? 'text-gray-400' : 'text-gray-600'} transition`}>
              About
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}