// app/components/EmbedWidget.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, Send, Lock, Shield, Sparkles, X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EmbedWidgetProps {
  username: string
  theme?: 'light' | 'dark'
  primaryColor?: string
  placeholder?: string
  position?: 'fixed' | 'inline'
  onMessageSent?: () => void
}

export function EmbedWidget({ 
  username, 
  theme = 'dark', 
  primaryColor = '#3B82F6',
  placeholder = 'Write your anonymous message...',
  position = 'fixed',
  onMessageSent
}: EmbedWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [characterCount, setCharacterCount] = useState(0)
  const maxChars = 500
  const widgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || message.length < 3) return
    
    setIsSending(true)
    setError('')
    
    try {
      // Send message via API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/messages/send/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_username: username,
          content: message,
          message_type: 'text'
        })
      })
      
      if (response.ok) {
        setSent(true)
        setMessage('')
        setCharacterCount(0)
        if (onMessageSent) onMessageSent()
        setTimeout(() => {
          setSent(false)
          setIsOpen(false)
        }, 3000)
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

  const themeClasses = theme === 'dark' ? {
    bg: 'bg-black',
    card: 'bg-gray-900/90 border border-gray-800',
    text: 'text-white',
    textSecondary: 'text-gray-400',
    input: 'bg-gray-800 border-gray-700 text-white placeholder:text-gray-500',
    button: 'bg-gray-800 hover:bg-gray-700 text-gray-300',
  } : {
    bg: 'bg-white',
    card: 'bg-white border border-gray-200 shadow-xl',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    input: 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400',
    button: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  }

  const widgetStyles = {
    primaryColor,
    widget: position === 'fixed' ? {
      position: 'fixed' as const,
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
    } : {
      position: 'relative' as const,
      zIndex: 10,
    }
  }

  return (
    <div ref={widgetRef} style={widgetStyles.widget}>
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`p-4 rounded-full shadow-2xl transition-all hover:scale-105 flex items-center gap-2`}
          style={{ background: primaryColor }}
        >
          <MessageSquare size={24} className="text-white" />
          <span className="text-white font-medium hidden sm:inline">Send Anonymous Message</span>
        </button>
      )}

      {/* Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`${themeClasses.card} rounded-2xl w-[380px] max-w-[calc(100vw-32px)] shadow-2xl overflow-hidden`}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: primaryColor }}>
                  <Shield size={16} className="text-white" />
                </div>
                <div>
                  <h3 className={`text-sm font-semibold ${themeClasses.text}`}>Anonymous Message</h3>
                  <p className={`text-xs ${themeClasses.textSecondary}`}>To @{username}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-lg ${themeClasses.button}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="px-4 py-2 flex items-center gap-4 bg-blue-500/5 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-1 text-xs text-green-500">
                <Lock size={12} />
                <span>100% Anonymous</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-500">
                <Shield size={12} />
                <span>Encrypted</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-purple-500">
                <Sparkles size={12} />
                <span>No tracking</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <textarea
                  className={`w-full ${themeClasses.input} rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition resize-none border`}
                  rows={4}
                  placeholder={placeholder}
                  value={message}
                  onChange={(e) => {
                    if (e.target.value.length <= maxChars) {
                      setMessage(e.target.value)
                      setCharacterCount(e.target.value.length)
                    }
                  }}
                  maxLength={maxChars}
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-xs ${themeClasses.textSecondary}`}>
                    {characterCount}/{maxChars}
                  </span>
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <Lock size={10} />
                    Anonymous
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                  {error}
                </div>
              )}

              {sent && (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm flex items-center gap-2">
                  <Check size={16} />
                  Message sent anonymously!
                </div>
              )}

              <button
                type="submit"
                disabled={!message.trim() || message.length < 3 || isSending}
                className="w-full py-2.5 rounded-xl text-white font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: primaryColor }}
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={16} />
                    Send Anonymous Message
                  </>
                )}
              </button>

              <p className={`text-center text-xs ${themeClasses.textSecondary}`}>
                Your identity is never stored. Messages are encrypted and anonymous.
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}