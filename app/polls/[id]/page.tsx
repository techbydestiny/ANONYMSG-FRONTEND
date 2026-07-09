// app/polls/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from '@/app/context/ThemeContext'
import { 
  ArrowLeft, Users, Lock, BarChart3, Share2, Copy, Check, Calendar, 
  CheckCircle, MessageSquare, Shield
} from 'lucide-react'
import Link from 'next/link'
import { pollsAPI, profileAPI } from '@/lib/api'
import { 
  FaTwitter, FaInstagram, FaYoutube, FaGithub, FaDiscord, FaTiktok 
} from 'react-icons/fa'
import { FiLink } from 'react-icons/fi'

interface Poll {
  id: string
  question: string
  created_at: string
  expires_at: string | null
  options: { id: number; text: string; votes: number }[]
  total_votes: number
  allow_multiple_votes: boolean
  is_creator: boolean
  user_has_voted: boolean
  vote_percentage: Record<string, number>
  creator_username: string
  is_active: boolean
}

interface CreatorProfile {
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

interface SocialLinkProps {
  href: string | null
  icon: any
  label: string
  darkMode: boolean
}

const SocialLink = ({ href, icon: Icon, label, darkMode }: SocialLinkProps) => {
  if (!href) return null
  return (
    <Link 
      href={href} 
      target="_blank" 
      className={`p-2 rounded-lg transition-colors group ${
        darkMode 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      title={label}
    >
      <Icon size={16} className={`transition-colors ${
        darkMode 
          ? 'text-gray-400 group-hover:text-white' 
          : 'text-gray-600 group-hover:text-gray-900'
      }`} />
    </Link>
  )
}

export default function PollDetailPage() {
  const params = useParams()
  const { darkMode } = useTheme()
  const pollId = params.id as string
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (pollId) {
      fetchPoll()
    }
  }, [pollId])

  const fetchPoll = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await pollsAPI.getPoll(pollId)
      
      if (response.ok) {
        const data = await response.json()
        if (data && data.id) {
          setPoll(data)
          if (data.user_has_voted) {
            setShowResults(true)
          }
          // Fetch creator profile
          try {
            const profileResponse = await profileAPI.getPublicProfile(data.creator_username)
            if (profileResponse.ok) {
              const profileData = await profileResponse.json()
              setCreatorProfile(profileData)
            }
          } catch (profileErr) {
            console.error('Failed to fetch creator profile:', profileErr)
          }
        } else {
          setError('Poll not found')
          setPoll(null)
        }
      } else if (response.status === 404) {
        setError('Poll not found')
        setPoll(null)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to load poll')
        setPoll(null)
      }
    } catch (err) {
      console.error('Fetch poll error:', err)
      setError('Network error. Please try again.')
      setPoll(null)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async () => {
    if (selectedOption === null || !poll) return
    
    setIsVoting(true)
    try {
      const response = await pollsAPI.vote(poll.id, selectedOption)
      if (response.ok) {
        await fetchPoll()
        setShowResults(true)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to vote')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setIsVoting(false)
    }
  }

  const sharePoll = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200 shadow-sm',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    textMuted: darkMode ? 'text-gray-600' : 'text-gray-400',
    optionBg: darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
  }

  const socialLinks = [
    { key: 'twitter', icon: FaTwitter, label: 'Twitter' },
    { key: 'instagram', icon: FaInstagram, label: 'Instagram' },
    { key: 'youtube', icon: FaYoutube, label: 'YouTube' },
    { key: 'tiktok', icon: FaTiktok, label: 'TikTok' },
    { key: 'github', icon: FaGithub, label: 'GitHub' },
    { key: 'website', icon: FiLink, label: 'Website' },
    { key: 'discord', icon: FaDiscord, label: 'Discord' },
  ]

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center max-w-md p-8">
          <BarChart3 size={48} className="text-gray-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>
            {error === 'Poll not found' ? 'Poll not found' : 'Unable to load poll'}
          </h2>
          <p className={themeClasses.textSecondary}>
            {error || 'This poll may have been removed or expired'}
          </p>
          <Link href="/polls">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
              Browse Polls
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const isExpired = poll.expires_at && new Date(poll.expires_at) < new Date()
  const isResultMode = showResults || isExpired || !poll.is_active
  const firstChar = creatorProfile?.username ? creatorProfile.username.charAt(0).toUpperCase() : '?'

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      {/* Banner Section */}
      <div className="relative h-32 sm:h-48 w-full overflow-hidden">
        {creatorProfile?.banner_image ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${creatorProfile.banner_image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </>
        ) : (
          <div 
            className="absolute inset-0"
            style={{ 
              background: `linear-gradient(135deg, ${creatorProfile?.team_color || '#3B82F6'}20, ${darkMode ? '#000000' : '#f0f0f0'})`
            }}
          />
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Back Button */}
        <div className="relative -mt-2 mb-4">
          <Link href="/polls">
            <button className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} transition`}>
              <ArrowLeft size={18} />
              Back to Polls
            </button>
          </Link>
        </div>

        {/* Creator Profile Section - Full Profile */}
        {creatorProfile && (
          <div className="relative -mt-12 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              {/* Avatar */}
              <div className="relative">
                {creatorProfile.profile_picture ? (
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-4 border-black shadow-lg">
                    <img 
                      src={creatorProfile.profile_picture} 
                      alt={creatorProfile.username}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-24 h-24 rounded-xl flex items-center justify-center border-4 border-black shadow-lg"
                    style={{ backgroundColor: creatorProfile.team_color || '#3B82F6' }}
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
                  <Link href={`/${creatorProfile.username}`}>
                    <h1 className={`text-2xl font-bold ${themeClasses.text} hover:text-blue-500 transition`}>
                      @{creatorProfile.username}
                    </h1>
                  </Link>
                  <button
                    onClick={sharePoll}
                    className={`p-1.5 rounded-lg transition ${
                      darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title="Copy poll link"
                  >
                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} className={themeClasses.textSecondary} />}
                  </button>
                </div>
                
                {/* Stats Row */}
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-500" />
                    <span className={`text-sm ${themeClasses.text}`}>{creatorProfile.message_count || 0}</span>
                    <span className={`text-xs ${themeClasses.textSecondary}`}>messages</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-purple-500" />
                    <span className={`text-xs ${themeClasses.textSecondary}`}>
                      Joined {creatorProfile.join_date ? new Date(creatorProfile.join_date).getFullYear() : 'recently'}
                    </span>
                  </div>
                </div>

                {/* Bio */}
                {creatorProfile.bio && (
                  <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-100'}`}>
                    <p className={`text-sm ${themeClasses.textSecondary}`}>{creatorProfile.bio}</p>
                  </div>
                )}

                {/* Social Links */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {socialLinks.map((link) => {
                    const url = creatorProfile[link.key as keyof CreatorProfile]
                    if (!url) return null
                    return (
                      <SocialLink 
                        key={link.key}
                        href={url as string}
                        icon={link.icon}
                        label={link.label}
                        darkMode={darkMode}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Poll Content */}
        <div className={`rounded-xl border p-6 ${themeClasses.card}`}>
          <h1 className={`text-xl font-bold ${themeClasses.text} mb-2`}>{poll.question}</h1>
          <div className="flex items-center gap-3 text-xs mb-4">
            <div className="flex items-center gap-1">
              <Users size={14} className={themeClasses.textSecondary} />
              <span className={themeClasses.textSecondary}>{poll.total_votes} votes</span>
            </div>
            {poll.expires_at && (
              <div className="flex items-center gap-1">
                <Calendar size={14} className={themeClasses.textSecondary} />
                <span className={themeClasses.textSecondary}>
                  {new Date(poll.expires_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {isExpired && (
              <span className="text-red-500 text-xs font-medium">Closed</span>
            )}
          </div>

          <div className="space-y-3">
            {poll.options.map((option) => {
              const isSelected = selectedOption === option.id
              const percentage = poll.vote_percentage?.[String(option.id)] || 0

              return (
                <button
                  key={option.id}
                  onClick={() => {
                    if (isResultMode) return
                    setSelectedOption(option.id)
                  }}
                  disabled={isResultMode}
                  className={`w-full relative p-3 rounded-lg transition-all ${
                    isResultMode
                      ? 'cursor-default'
                      : `${themeClasses.optionBg} hover:scale-[1.02]`
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-3 relative z-10">
                    <span className={`text-sm ${themeClasses.text}`}>{option.text}</span>
                    {isSelected && (
                      <CheckCircle size={16} className="text-blue-500 shrink-0" />
                    )}
                    <span className={`ml-auto text-sm ${themeClasses.textSecondary}`}>
                      {isResultMode ? `${percentage}% (${option.votes})` : ''}
                    </span>
                  </div>
                  
                  {isResultMode && (
                    <div 
                      className="absolute left-0 top-0 h-full rounded-lg bg-blue-500/10 transition-all duration-700"
                      style={{ width: `${percentage}%` }}
                    />
                  )}
                </button>
              )
            })}
          </div>

          {!isResultMode && !isExpired && (
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={handleVote}
                disabled={selectedOption === null || isVoting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVoting ? 'Voting...' : 'Vote'}
              </button>
              <button
                onClick={() => setShowResults(true)}
                className={`px-4 py-2 text-sm font-medium transition rounded-lg ${
                  darkMode 
                    ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                View Results
              </button>
            </div>
          )}

          {isResultMode && (
            <div className="mt-4 text-xs text-green-500">
              {poll.user_has_voted ? '✅ You voted on this poll' : `${poll.total_votes} total votes`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}