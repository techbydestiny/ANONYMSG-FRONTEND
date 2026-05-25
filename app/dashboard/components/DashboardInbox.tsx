// app/dashboard/components/DashboardInbox.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Search, Eye, Inbox, Calendar, Zap, Award, MessageSquare, 
  Share2, Flag, Trash2, Download, Clock, User, 
  Archive, AlertCircle, X, Check, Link as LinkIcon
} from 'lucide-react'
import { Message, Stats } from '../types'
import * as htmlToImage from 'html-to-image'

interface DashboardInboxProps {
  messages: Message[]
  stats: Stats
  darkMode: boolean
  onMarkAsRead: (id: number) => void
  onMarkAllAsRead: () => void
  onDelete: (id: number) => void
  onArchive: (id: number) => void
  onExport: () => void
  onShareImage: (message: Message) => void  
  onShareLink: () => void
  onReport: (message: Message) => void
  username?: string
  brandColor?: string
  profilePicture?: string | null
}

// Hidden image component for rendering
const ShareImageTemplate = ({ message, username, brandColor, createdAt, profilePicture }: any) => {
  const accentColor = brandColor || '#3B82F6'
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError, setImgError] = useState(false)
  
  // Default placeholder image when profile picture fails to load
  const defaultAvatar = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='none' stroke='%23${accentColor.replace('#', '')}' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E`
  
  return (
    <div style={{
      width: '500px',
      background: 'white',
      borderRadius: '24px',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
    }}>
      {/* Header */}
      <div style={{ background: accentColor, padding: '32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          {/* Profile Picture in Header - with error handling */}
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profilePicture && !imgError ? (
              <img 
                src={profilePicture} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgError(true)}
                onLoad={() => setImgLoaded(true)}
                crossOrigin="anonymous"
              />
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            )}
          </div>
          <span style={{ color: 'white', fontSize: '22px', fontWeight: 700 }}>AnonMsg</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', margin: 0 }}>Anonymous Messaging Platform</p>
      </div>
      
      {/* Content */}
      <div style={{ padding: '32px' }}>
        {/* To section with Profile Picture */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '12px 16px', background: '#F3F4F6', borderRadius: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: `${accentColor}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profilePicture && !imgError ? (
              <img 
                src={profilePicture} 
                alt={username} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setImgError(true)}
                crossOrigin="anonymous"
              />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accentColor} strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>
          <div>
            <p style={{ color: '#6B7280', fontSize: '11px', margin: '0 0 2px 0' }}>Sent to</p>
            <p style={{ color: '#111827', fontSize: '15px', fontWeight: 600, margin: 0 }}>@{username}</p>
          </div>
        </div>
        
        {/* Message */}
        <div style={{ background: '#F9FAFB', borderRadius: '20px', padding: '24px', border: '1px solid #E5E7EB', marginBottom: '24px' }}>
          <p style={{ color: '#1F2937', fontSize: '15px', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {message.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </p>
        </div>
        
        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: accentColor, borderRadius: '50%' }}></div>
            <span style={{ color: '#6B7280', fontSize: '11px' }}>Anonymous Sender</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: accentColor, fontSize: '11px', fontWeight: 500, margin: 0 }}>AnonMsg.xyz</p>
            <p style={{ color: '#9CA3AF', fontSize: '10px', margin: '4px 0 0 0' }}>{new Date(createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function DashboardInbox({ 
  messages, stats, darkMode, onMarkAsRead, onMarkAllAsRead, onDelete, onArchive, onExport, 
  onShareLink, onReport, username = 'user', brandColor = '#3B82F6', profilePicture = null
}: DashboardInboxProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMessages, setSelectedMessages] = useState<number[]>([])
  const [selectMode, setSelectMode] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [shareImage, setShareImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)

  const filteredMessages = messages.filter(m => {
    if (filter === 'unread') return !m.is_read
    if (filter === 'read') return m.is_read
    return true
  }).filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))

  const toggleSelectMessage = (id: number) => {
    setSelectedMessages(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedMessages.length === filteredMessages.length) {
      setSelectedMessages([])
    } else {
      setSelectedMessages(filteredMessages.map(m => m.id))
    }
  }

  const archiveSelected = () => {
    selectedMessages.forEach(id => onArchive(id))
    setSelectedMessages([])
    setSelectMode(false)
  }

  // Generate share image using React component rendered to hidden div
  const generateShareImage = async (message: Message) => {
    setSelectedMessage(message)
    setIsGenerating(true)
    
    // Create a hidden div to render the React component
    const hiddenDiv = document.createElement('div')
    hiddenDiv.style.position = 'fixed'
    hiddenDiv.style.left = '-9999px'
    hiddenDiv.style.top = '0'
    hiddenDiv.style.width = '500px'
    document.body.appendChild(hiddenDiv)
    
    // Render the component using ReactDOM
    const { createRoot } = await import('react-dom/client')
    const root = createRoot(hiddenDiv)
    
    root.render(
      <ShareImageTemplate 
        message={message}
        username={username}
        brandColor={brandColor}
        createdAt={message.created_at}
        profilePicture={profilePicture}
      />
    )
    
    // Wait for rendering and images to load
    await new Promise(resolve => setTimeout(resolve, 500))
    
    try {
      const element = hiddenDiv.firstChild as HTMLElement
      const dataUrl = await htmlToImage.toPng(element, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        quality: 1,
        cacheBust: true,
      })
      setShareImage(dataUrl)
      setShowShareModal(true)
    } catch (error) {
      console.error('Failed to generate image:', error)
      alert('Failed to generate share image. Please try again.')
    } finally {
      root.unmount()
      document.body.removeChild(hiddenDiv)
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    if (shareImage) {
      const link = document.createElement('a')
      link.download = `anonmsg-to-${username}-${Date.now()}.png`
      link.href = shareImage
      link.click()
    }
  }

  const copyImage = async () => {
    if (shareImage) {
      try {
        const blob = await fetch(shareImage).then(r => r.blob())
        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob
          })
        ])
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        console.error('Failed to copy:', error)
        alert('Failed to copy image. Try downloading instead.')
      }
    }
  }

  const themeClasses = {
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    card: darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm',
    hover: darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
    button: darkMode ? 'bg-gray-800 hover:bg-gray-700 text-gray-300' : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-600',
  }

  const statCards = [
    { icon: Inbox, value: stats.total, label: 'Total' },
    { icon: Eye, value: stats.unread, label: 'Unread' },
    { icon: Calendar, value: stats.thisWeek, label: 'This Week' },
    { icon: Award, value: `${stats.streak} days`, label: 'Streak' },
    { icon: MessageSquare, value: stats.responseRate || 0, label: 'Engagement' },
  ]

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${themeClasses.card} rounded-xl p-3`}>
            <stat.icon className="text-gray-400 mb-1" size={18} />
            <div className={`text-xl font-semibold ${themeClasses.text}`}>{stat.value}</div>
            <div className="text-xs text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition text-sm ${
              filter === 'all' 
                ? (darkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white')
                : (darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-3 py-1.5 rounded-xl transition text-sm ${
              filter === 'unread' 
                ? (darkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white')
                : (darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
            }`}
          >
            Unread ({messages.filter(m => !m.is_read).length})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-3 py-1.5 rounded-xl transition text-sm ${
              filter === 'read' 
                ? (darkMode ? 'bg-white text-gray-900' : 'bg-gray-900 text-white')
                : (darkMode ? 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50')
            }`}
          >
            Read ({messages.filter(m => m.is_read).length})
          </button>
        </div>
        
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'} rounded-xl pl-9 pr-3 py-1.5 text-sm`}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectMode && (
        <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <div className="flex items-center gap-3">
            <span className={`text-sm ${themeClasses.textSecondary}`}>
              {selectedMessages.length} selected
            </span>
            <button onClick={selectAll} className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} hover:underline`}>
              {selectedMessages.length === filteredMessages.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={archiveSelected} className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700">
              <Archive size={14} /> Archive ({selectedMessages.length})
            </button>
            <button onClick={() => { setSelectMode(false); setSelectedMessages([]) }} className={`px-3 py-1.5 rounded-lg text-sm ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={onExport} className={`px-3 py-1.5 rounded-xl transition flex items-center gap-2 text-sm ${themeClasses.button}`}>
          <Download size={14} /> Export
        </button>
        <button onClick={onMarkAllAsRead} className={`px-3 py-1.5 rounded-xl transition flex items-center gap-2 text-sm ${themeClasses.button}`}>
          <Eye size={14} /> Mark all read
        </button>
        <button onClick={() => setSelectMode(!selectMode)} className={`px-3 py-1.5 rounded-xl transition flex items-center gap-2 text-sm ${themeClasses.button}`}>
          <Archive size={14} /> Bulk Archive
        </button>
        <button onClick={onShareLink} className="ml-auto bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-xl transition flex items-center gap-2 text-sm text-white">
          <Share2 size={14} /> Share Link
        </button>
      </div>

      {/* Messages List */}
      {filteredMessages.length === 0 ? (
        <div className={`${darkMode ? 'bg-gray-900/30 border-gray-800' : 'bg-gray-50 border-gray-200'} rounded-xl p-12 text-center border`}>
          <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className={`text-base font-medium ${themeClasses.text} mb-1`}>Empty inbox</h3>
          <p className="text-gray-500 text-sm">
            {searchQuery ? 'Try a different search term' : 'Share your link to receive messages'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredMessages.map((message) => (
            <div key={message.id} className={`${themeClasses.card} rounded-xl p-4 transition-all ${!message.is_read ? (darkMode ? 'border-l-4 border-l-blue-500' : 'border-l-4 border-l-blue-600') : ''}`}>
              <div className="flex items-start gap-3">
                {selectMode && (
                  <input type="checkbox" checked={selectedMessages.includes(message.id)} onChange={() => toggleSelectMessage(message.id)} className="mt-1 w-4 h-4 rounded border-gray-300" />
                )}
                <div className="flex-1">
                  <div className="flex items-start gap-2 mb-2">
                    <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                    <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>{message.content}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <Clock size={12} /> {new Date(message.created_at).toLocaleDateString()}
                    <User size={12} /> Anonymous
                    {!message.is_read && <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-500 rounded-full text-xs">New</span>}
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {!message.is_read && (
                    <button onClick={() => onMarkAsRead(message.id)} className={`p-1.5 rounded-lg transition ${themeClasses.hover}`}>
                      <Eye size={14} className="text-gray-500" />
                    </button>
                  )}
                  <button onClick={() => generateShareImage(message)} className={`p-1.5 rounded-lg transition ${themeClasses.hover}`} disabled={isGenerating}>
                    {isGenerating ? <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" /> : <Share2 size={14} className="text-gray-500" />}
                  </button>
                  <button onClick={() => onReport(message)} className={`p-1.5 rounded-lg transition ${themeClasses.hover}`}>
                    <Flag size={14} className="text-gray-500" />
                  </button>
                  <button onClick={() => onArchive(message.id)} className={`p-1.5 rounded-lg transition ${themeClasses.hover}`}>
                    <Archive size={14} className="text-gray-500" />
                  </button>
                  <button onClick={() => onDelete(message.id)} className={`p-1.5 rounded-lg transition ${themeClasses.hover}`}>
                    <Trash2 size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && shareImage && selectedMessage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowShareModal(false)}>
          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl w-full max-w-md p-6`} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Share Branded Image</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                <X size={20} />
              </button>
            </div>
            {shareImage && (
              <img src={shareImage} alt="Branded message" className="w-full rounded-xl mb-4 border border-gray-200 dark:border-gray-700 shadow-lg" />
            )}
            <div className="space-y-2">
              <button onClick={downloadImage} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl text-white text-sm font-medium transition">
                <Download size={16} /> Download Image
              </button>
              <button onClick={copyImage} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition">
                {copied ? <Check size={16} /> : <LinkIcon size={16} />}
                {copied ? 'Copied!' : 'Copy Image'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}