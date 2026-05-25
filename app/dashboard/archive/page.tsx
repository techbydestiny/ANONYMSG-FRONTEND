// app/dashboard/archive/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/app/context/ThemeContext'
import { 
  Archive, Trash2, Eye, Download, Search, Calendar,
  MessageSquare, Clock, User, ArrowLeft, FolderOpen
} from 'lucide-react'
import Link from 'next/link'
import { API_BASE_URL, messagesAPI } from '@/lib/api'

interface ArchivedMessage {
  id: number
  content: string
  created_at: string
  archived_at: string
  is_read: boolean
}

export default function ArchivePage() {
  const router = useRouter()
  const { darkMode } = useTheme()
  const [archivedMessages, setArchivedMessages] = useState<ArchivedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch archived messages from API
    const fetchArchivedMessages = async () => {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_BASE_URL}/messages/archived/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        setArchivedMessages(data.results || [])
      } catch (error) {
        console.error('Failed to fetch archived messages:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArchivedMessages()
  }, [router])

  const handleRestore = async (id: number) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_BASE_URL}/messages/${id}/restore/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        setArchivedMessages(prev => prev.filter(m => m.id !== id))
        alert('Message restored to inbox')
      }
    } catch (error) {
      console.error('Failed to restore message:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to permanently delete this message? This cannot be undone.')) {
      try {
        const token = localStorage.getItem('access_token')
        const response = await fetch(`${API_BASE_URL}/messages/${id}/permanent-delete/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        if (response.ok) {
          setArchivedMessages(prev => prev.filter(m => m.id !== id))
          alert('Message permanently deleted')
        }
      } catch (error) {
        console.error('Failed to delete message:', error)
      }
    }
  }

  const filteredMessages = archivedMessages.filter(m =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const themeClasses = {
    bg: darkMode ? 'bg-gray-950' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    input: darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
    button: darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200',
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${themeClasses.bg}`}>
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${themeClasses.bg}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <button className={`p-2 rounded-lg transition ${themeClasses.button}`}>
              <ArrowLeft size={20} />
            </button>
          </Link>
          <div>
            <h1 className={`text-2xl font-bold ${themeClasses.text}`}>Archive</h1>
            <p className={themeClasses.textSecondary}>Messages archived after 10 days</p>
          </div>
        </div>

        {/* Stats */}
        <div className={`${themeClasses.card} rounded-xl p-4 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Archive size={24} className="text-blue-500" />
              <div>
                <div className={`text-2xl font-bold ${themeClasses.text}`}>{archivedMessages.length}</div>
                <div className={`text-sm ${themeClasses.textSecondary}`}>Archived Messages</div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Auto-archived after 10 days
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search archived messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${themeClasses.input} rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
          />
        </div>

        {/* Archived Messages List */}
        {filteredMessages.length === 0 ? (
          <div className={`${themeClasses.card} rounded-xl p-12 text-center`}>
            <FolderOpen size={48} className="text-gray-400 mx-auto mb-3" />
            <h3 className={`text-lg font-medium ${themeClasses.text} mb-1`}>Archive is empty</h3>
            <p className={themeClasses.textSecondary}>
              {searchQuery ? 'Try a different search term' : 'Messages will appear here after 10 days'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMessages.map((message) => (
              <div key={message.id} className={`${themeClasses.card} rounded-xl p-4 transition-all`}>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                      <MessageSquare size={14} className="text-gray-400 mt-0.5" />
                      <p className={`${themeClasses.textSecondary} text-sm leading-relaxed`}>{message.content}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Received: {new Date(message.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Archive size={12} />
                        <span>Archived: {new Date(message.archived_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRestore(message.id)}
                      className="px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 transition"
                    >
                      Restore
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-1.5 rounded-lg transition hover:bg-red-500/20 text-red-500"
                      title="Permanently delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}