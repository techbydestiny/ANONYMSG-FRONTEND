// app/dashboard/components/DashboardAnalytics.tsx
'use client'

import { Stats } from '../types'
import { 
  TrendingUp, TrendingDown, Users, MessageSquare, 
  Calendar, Clock, Award, Zap, Eye, BarChart3,
  Activity, PieChart, ArrowUp, ArrowDown, Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardAnalyticsProps {
  stats: Stats
  darkMode: boolean
  messages: Message[]
}

interface Message {
  id: number
  content: string
  created_at: string
  is_read: boolean
}

export function DashboardAnalytics({ stats, darkMode, messages }: DashboardAnalyticsProps) {
  // Calculate additional stats
  const totalMessages = messages.length
  const readMessages = messages.filter(m => m.is_read).length
  const unreadMessages = totalMessages - readMessages
  const responseRate = totalMessages > 0 ? Math.round((readMessages / totalMessages) * 100) : 0
  
  // Get messages from last 7 days
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const weekMessages = messages.filter(m => new Date(m.created_at) >= weekAgo)
  
  // Get messages from today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayMessages = messages.filter(m => new Date(m.created_at) >= today)
  
  // Calculate average per day
  const daysWithMessages = new Set(messages.map(m => new Date(m.created_at).toDateString())).size
  const avgPerDay = daysWithMessages > 0 ? Math.round(totalMessages / daysWithMessages) : 0

  // Find peak day
  const dayCounts: Record<string, number> = {}
  messages.forEach(m => {
    const day = new Date(m.created_at).toDateString()
    dayCounts[day] = (dayCounts[day] || 0) + 1
  })
  const peakDay = Object.keys(dayCounts).length > 0 
    ? Object.keys(dayCounts).reduce((a, b) => dayCounts[a] > dayCounts[b] ? a : b)
    : null

  // Calculate response time (mock)
  const avgResponseTime = stats.avg_response_time || '2.4h'
  const topReaction = stats.top_reaction || '🔥'

  const statCards = [
    { 
      icon: MessageSquare, 
      value: totalMessages, 
      label: 'Total Messages', 
      change: '+12%',
      trend: 'up',
      color: 'blue'
    },
    { 
      icon: Eye, 
      value: unreadMessages, 
      label: 'Unread', 
      change: '-8%',
      trend: 'down',
      color: 'purple'
    },
    { 
      icon: Users, 
      value: responseRate + '%', 
      label: 'Response Rate', 
      change: '+5%',
      trend: 'up',
      color: 'green'
    },
    { 
      icon: Zap, 
      value: stats.streak || 0, 
      label: 'Day Streak', 
      change: '+' + (stats.streak || 0),
      trend: 'up',
      color: 'orange'
    },
  ]

  const getStatColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/10 text-blue-500',
      purple: 'bg-purple-500/10 text-purple-500',
      green: 'bg-green-500/10 text-green-500',
      orange: 'bg-orange-500/10 text-orange-500',
      pink: 'bg-pink-500/10 text-pink-500',
    }
    return colors[color] || 'bg-gray-500/10 text-gray-500'
  }

  const themeClasses = {
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    card: darkMode ? 'bg-gray-900/40 border border-gray-800/50 backdrop-blur-sm' : 'bg-white border border-gray-200/60 shadow-sm',
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50'}`}>
        <div className="flex items-center gap-3">
          <Sparkles size={24} className="text-blue-500" />
          <div>
            <h2 className={`text-lg font-semibold ${themeClasses.text}`}>Analytics Overview</h2>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Here's how your messages are performing
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-green-500">
            <Activity size={16} />
            <span>Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statCards.map((stat, index) => (
          <motion.div 
            key={stat.label} 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`${themeClasses.card} rounded-2xl p-4 transition-all duration-200 hover:scale-[1.02]`}
          >
            <div className={`inline-flex p-2 rounded-xl ${getStatColor(stat.color)} mb-2`}>
              <stat.icon size={16} />
            </div>
            <div className={`text-2xl font-bold ${themeClasses.text}`}>{stat.value}</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">{stat.label}</span>
              <span className={`text-xs font-medium ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Stats */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className={`${themeClasses.card} rounded-2xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-gray-400" />
            <span className={`text-sm ${themeClasses.textSecondary}`}>This Week</span>
          </div>
          <div className={`text-2xl font-bold ${themeClasses.text}`}>{weekMessages.length}</div>
          <div className={`text-xs ${themeClasses.textSecondary}`}>
            {weekMessages.length > 0 ? `${Math.round((weekMessages.length / totalMessages) * 100)}% of total` : 'No messages this week'}
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-2xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-gray-400" />
            <span className={`text-sm ${themeClasses.textSecondary}`}>Avg Response Time</span>
          </div>
          <div className={`text-2xl font-bold ${themeClasses.text}`}>{avgResponseTime}</div>
          <div className={`text-xs ${themeClasses.textSecondary}`}>
            {readMessages > 0 ? `Based on ${readMessages} responses` : 'No responses yet'}
          </div>
        </div>
        <div className={`${themeClasses.card} rounded-2xl p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <Award size={16} className="text-gray-400" />
            <span className={`text-sm ${themeClasses.textSecondary}`}>Top Reaction</span>
          </div>
          <div className={`text-2xl font-bold ${themeClasses.text}`}>{topReaction}</div>
          <div className={`text-xs ${themeClasses.textSecondary}`}>
            Most used reaction
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className={`${themeClasses.card} rounded-2xl p-4`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-gray-400" />
            <span className={`text-sm font-medium ${themeClasses.text}`}>Activity Insights</span>
          </div>
          <span className={`text-xs ${themeClasses.textSecondary}`}>
            {daysWithMessages} active days
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={`text-xs ${themeClasses.textSecondary}`}>Today</div>
            <div className={`text-lg font-semibold ${themeClasses.text}`}>{todayMessages.length}</div>
          </div>
          <div>
            <div className={`text-xs ${themeClasses.textSecondary}`}>Average per day</div>
            <div className={`text-lg font-semibold ${themeClasses.text}`}>{avgPerDay}</div>
          </div>
          {peakDay && (
            <div className="col-span-2">
              <div className={`text-xs ${themeClasses.textSecondary}`}>Peak Day</div>
              <div className={`text-sm font-medium ${themeClasses.text}`}>
                {new Date(peakDay).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })} — {dayCounts[peakDay]} messages
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}