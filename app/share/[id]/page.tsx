// app/share/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useTheme } from '@/app/context/ThemeContext'
import { MessageSquare, Lock, Shield, Sparkles, Share2, Copy, Check } from 'lucide-react'
import { messagesAPI } from '@/lib/api'

interface SharedMessage {
  id: string
  content: string
  created_at: string
  message_type: string
}

export default function SharedMessagePage() {
  const params = useParams()
  const { darkMode } = useTheme()
  const id = params.id as string
  
  const [message, setMessage] = useState<SharedMessage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const response = await messagesAPI.getMessage(id)
        if (response.ok) {
          const data = await response.json()
          setMessage(data)
        } else {
          setError('Message not found or has been removed')
        }
      } catch (err) {
        setError('Failed to load message')
      } finally {
        setLoading(false)
      }
    }
    fetchMessage()
  }, [id])

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-white border-gray-200 shadow-sm',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !message) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="text-center max-w-md">
          <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>Message not found</h2>
          <p className={themeClasses.textSecondary}>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
      <div className={`max-w-md w-full mx-4 ${themeClasses.card} rounded-2xl p-8 border`}>
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-green-500" />
          <span className={`text-xs font-medium text-green-500`}>Anonymous</span>
          <Lock size={14} className="text-blue-500 ml-2" />
          <span className={`text-xs ${themeClasses.textSecondary}`}>Encrypted</span>
        </div>
        
        <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} mb-4`}>
          <p className={`text-base ${themeClasses.text} leading-relaxed`}>
            {message.content}
          </p>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{new Date(message.created_at).toLocaleDateString()}</span>
          <span>Anonymous Sender</span>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={copyLink}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl transition ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent('Check out this anonymous message:')}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
              className="flex-1 py-2 rounded-xl bg-[#1DA1F2] text-white text-sm hover:bg-[#1a8cd8] transition"
            >
              Share
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 py-2 rounded-xl bg-blue-500 text-white text-sm hover:bg-blue-600 transition"
            >
              Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}