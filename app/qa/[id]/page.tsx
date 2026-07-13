// app/qa/[id]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from '@/app/context/ThemeContext'
import { 
  ArrowLeft, Send, ThumbsUp, MessageSquare, Users, Clock, Lock,
  AlertCircle, Loader2, Share2, Copy, Check, CheckCircle,
  Calendar, Shield
} from 'lucide-react'
import Link from 'next/link'
import { qaAPI, profileAPI } from '@/lib/api'
import { 
  FaTwitter, FaInstagram, FaYoutube, FaGithub, FaDiscord, FaTiktok 
} from 'react-icons/fa'
import { FiLink } from 'react-icons/fi'

interface Question {
  id: number
  question: string
  is_anonymous: boolean
  is_answered: boolean
  is_approved: boolean
  is_pinned: boolean
  upvotes: number
  asked_by_username: string
  user_has_upvoted: boolean
  created_at: string
  answer: {
    id: number
    answer: string
    answered_by_username: string
    created_at: string
  } | null
}

interface QASession {
  id: string
  title: string
  description: string
  is_active: boolean
  is_live: boolean
  starts_at: string
  ends_at: string | null
  allow_anonymous: boolean
  require_approval: boolean
  host_username: string
  question_count: number
  is_host: boolean
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

export default function QASessionPage() {
  const params = useParams()
  const { darkMode } = useTheme()
  const sessionId = params.id as string
  
  const [session, setSession] = useState<QASession | null>(null)
  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newQuestion, setNewQuestion] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [viewerCount, setViewerCount] = useState(Math.floor(Math.random() * 30) + 10)
  const questionsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId])

  // Real-time updates - poll every 5 seconds when live
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (session?.is_live) {
      interval = setInterval(() => {
        fetchQuestions()
        setViewerCount(prev => Math.max(5, prev + Math.floor(Math.random() * 6) - 3))
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [session?.is_live])

  const fetchSessionData = async () => {
    setLoading(true)
    try {
      const [sessionRes, questionsRes] = await Promise.all([
        qaAPI.getSession(sessionId),
        qaAPI.getQuestions(sessionId)
      ])

      if (sessionRes.ok && questionsRes.ok) {
        const sessionData = await sessionRes.json()
        const questionsData = await questionsRes.json()
        
        setSession(sessionData)
        setQuestions(Array.isArray(questionsData) ? questionsData : (questionsData.results || []))

        // Fetch host profile
        try {
          const profileResponse = await profileAPI.getPublicProfile(sessionData.host_username)
          if (profileResponse.ok) {
            const profileData = await profileResponse.json()
            setCreatorProfile(profileData)
          }
        } catch (profileErr) {
          console.error('Failed to fetch host profile:', profileErr)
        }
      } else {
        setError('Failed to load session')
        setQuestions([])
      }
    } catch (err) {
      console.error('Fetch session error:', err)
      setError('Network error')
      setQuestions([])
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestions = async () => {
    try {
      const response = await qaAPI.getQuestions(sessionId)
      if (response.ok) {
        const data = await response.json()
        const newQuestions = Array.isArray(data) ? data : (data.results || [])
        setQuestions(newQuestions)
        if (newQuestions.length > questions.length) {
          setTimeout(() => {
            questionsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
        }
      }
    } catch (err) {
      console.error('Failed to fetch questions:', err)
    }
  }

  const submitQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.trim()) return
    
    setIsSubmitting(true)
    try {
      const response = await qaAPI.submitQuestion({
        session_id: sessionId,
        question: newQuestion,
        is_anonymous: true
      })
      
      if (response.ok) {
        setNewQuestion('')
        await fetchQuestions()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Failed to submit question')
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // FIX: Convert number to string when calling API
  const upvoteQuestion = async (questionId: number) => {
    try {
      const response = await qaAPI.upvoteQuestion(String(questionId))
      if (response.ok) {
        await fetchQuestions()
      }
    } catch (err) {
      alert('Failed to upvote')
    }
  }

  const shareSession = () => {
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
    input: darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
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
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center max-w-md p-8">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>Session not found</h2>
          <p className={themeClasses.textSecondary}>{error || 'This Q&A session doesn\'t exist'}</p>
          <Link href="/qa">
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
              Browse Q&A
            </button>
          </Link>
        </div>
      </div>
    )
  }

  const isLive = session.is_live
  const questionsList = Array.isArray(questions) ? questions : []
  const pinnedQuestions = questionsList.filter(q => q.is_pinned)
  const answeredQuestions = questionsList.filter(q => q.is_answered && !q.is_pinned)
  const unansweredQuestions = questionsList.filter(q => !q.is_answered && !q.is_pinned)
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

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {/* Back Button */}
        <div className="relative -mt-2 mb-4">
          <Link href="/qa">
            <button className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} transition`}>
              <ArrowLeft size={18} />
              Back to Q&A
            </button>
          </Link>
        </div>

        {/* Host Profile Section - Full Profile */}
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
                    onClick={shareSession}
                    className={`p-1.5 rounded-lg transition ${
                      darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    title="Copy session link"
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

        {/* Session Header */}
        <div className={`rounded-xl border p-6 mb-6 ${themeClasses.card}`}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className={`text-2xl font-bold ${themeClasses.text}`}>{session.title}</h1>
                {isLive && (
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-500 text-white rounded-full animate-pulse">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    LIVE
                  </span>
                )}
                {!isLive && (
                  <span className="text-xs px-2 py-1 bg-gray-500 text-white rounded-full">
                    Ended
                  </span>
                )}
              </div>
              
              {session.description && (
                <p className={`text-sm ${themeClasses.textSecondary} mb-3`}>{session.description}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className={themeClasses.textSecondary}>
                  Host: @{session.host_username}
                </span>
                <div className="flex items-center gap-1">
                  <Clock size={14} className={themeClasses.textSecondary} />
                  <span className={themeClasses.textSecondary}>
                    {new Date(session.starts_at).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare size={14} className={themeClasses.textSecondary} />
                  <span className={themeClasses.textSecondary}>{questionsList.length} questions</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} className={themeClasses.textSecondary} />
                  <span className={themeClasses.textSecondary}>{viewerCount} watching</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Form - Always available when live */}
        {isLive && (
          <>
            <div className={`mb-4 p-3 rounded-lg border ${darkMode ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Lock size={14} />
                <span>Your question will be posted anonymously. No login required.</span>
              </div>
            </div>

            <div className={`rounded-xl border p-6 mb-6 ${themeClasses.card}`}>
              <form onSubmit={submitQuestion} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                    Ask a Question (Anonymous)
                  </label>
                  <textarea
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className={`w-full ${themeClasses.input} rounded-lg p-3 text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition resize-none`}
                    rows={3}
                    placeholder="Type your anonymous question here..."
                    maxLength={500}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!newQuestion.trim() || isSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Submit Question
                </button>
              </form>
            </div>
          </>
        )}

        {!isLive && (
          <div className={`mb-6 p-4 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
            <p className={`text-sm ${themeClasses.textSecondary} text-center`}>
              This Q&A session is not currently live. Check back at the scheduled time.
            </p>
          </div>
        )}

        {/* Questions List - Real-time */}
        <div className="space-y-4">
          {pinnedQuestions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              darkMode={darkMode}
              onUpvote={upvoteQuestion}
              showAnswer={false}
            />
          ))}

          {answeredQuestions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              darkMode={darkMode}
              onUpvote={upvoteQuestion}
              showAnswer={true}
            />
          ))}

          {unansweredQuestions.map((q) => (
            <QuestionItem
              key={q.id}
              question={q}
              darkMode={darkMode}
              onUpvote={upvoteQuestion}
              showAnswer={false}
            />
          ))}

          {questionsList.length === 0 && (
            <div className={`text-center py-12 ${themeClasses.card} rounded-xl border`}>
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-500" />
              <h3 className={`text-lg font-medium ${themeClasses.text} mb-2`}>No questions yet</h3>
              <p className={themeClasses.textSecondary}>
                {isLive ? 'Be the first to ask a question!' : 'Questions will appear when the session goes live.'}
              </p>
            </div>
          )}
        </div>

        <div ref={questionsEndRef} />
      </div>
    </div>
  )
}

function QuestionItem({
  question,
  darkMode,
  onUpvote,
  showAnswer
}: {
  question: Question
  darkMode: boolean
  onUpvote: (id: number) => void
  showAnswer: boolean
}) {
  const themeClasses = {
    card: darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200 shadow-sm',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
  }

  return (
    <div className={`rounded-xl border p-4 ${themeClasses.card}`}>
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <button
            onClick={() => onUpvote(question.id)}
            className={`p-1.5 rounded-lg transition ${
              question.user_has_upvoted
                ? 'bg-blue-500/20 text-blue-500'
                : darkMode
                ? 'hover:bg-gray-800 text-gray-400'
                : 'hover:bg-gray-100 text-gray-400'
            }`}
          >
            <ThumbsUp size={16} />
          </button>
          <span className={`text-xs font-medium ${themeClasses.text}`}>{question.upvotes}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${themeClasses.text}`}>{question.question}</p>
              <div className="flex items-center gap-3 mt-1.5 text-xs">
                <span className={themeClasses.textSecondary}>
                  {question.is_anonymous ? 'Anonymous' : `@${question.asked_by_username}`}
                </span>
                <span className={themeClasses.textSecondary}>•</span>
                <span className={themeClasses.textSecondary}>
                  {new Date(question.created_at).toLocaleString()}
                </span>
                {question.is_answered && (
                  <>
                    <span className={themeClasses.textSecondary}>•</span>
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Answered
                    </span>
                  </>
                )}
                {question.is_pinned && (
                  <>
                    <span className={themeClasses.textSecondary}>•</span>
                    <span className="text-yellow-500 flex items-center gap-1">
                      📌 Pinned
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {showAnswer && question.answer && (
            <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <p className={`text-sm ${themeClasses.text}`}>{question.answer.answer}</p>
              <p className={`text-xs ${themeClasses.textSecondary} mt-1`}>
                Answered by @{question.answer.answered_by_username}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}