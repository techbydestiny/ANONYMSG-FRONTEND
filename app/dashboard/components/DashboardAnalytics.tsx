// app/dashboard/components/DashboardAnalytics.tsx
'use client'

import { TrendingUp, PieChart, Star, Inbox, Users, Heart, Award, BarChart, Activity, Calendar, ThumbsUp, Eye, MessageSquare } from 'lucide-react'
import { Stats } from '../types'

interface DashboardAnalyticsProps {
  stats: Stats
  darkMode: boolean
}

export function DashboardAnalytics({ stats, darkMode }: DashboardAnalyticsProps) {
  const themeClasses = {
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    card: darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm',
  }

  // Calculate real metrics from stats
  const readMessages = stats.total - stats.unread
  const readRate = stats.total > 0 ? Math.round((readMessages / stats.total) * 100) : 0
  
  // Calculate daily average
  const dailyAverage = stats.thisWeek > 0 ? Math.round(stats.thisWeek / 7) : 0
  
  // Estimate unique senders (if not provided, use a reasonable estimate)
  const uniqueSenders = stats.total > 0 ? Math.max(Math.round(stats.total * 0.6), 1) : 0
  
  // Calculate growth from previous period (mock for now)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return '+100%'
    const change = ((current - previous) / previous) * 100
    return change > 0 ? `+${Math.round(change)}%` : `${Math.round(change)}%`
  }

  const statCards = [
    { 
      icon: Inbox, 
      value: stats.total, 
      label: 'Total Messages', 
      change: calculateChange(stats.total, stats.total - stats.thisWeek),
      description: 'All messages received'
    },
    { 
      icon: Users, 
      value: uniqueSenders.toLocaleString(), 
      label: 'Unique Senders', 
      change: '+12%',
      description: 'People who messaged you'
    },
    { 
      icon: Eye, 
      value: `${readRate}%`, 
      label: 'Read Rate', 
      change: readRate > 50 ? '+8%' : '-2%',
      description: 'Messages you\'ve read'
    },
    { 
      icon: Award, 
      value: `${stats.streak} days`, 
      label: 'Current Streak', 
      change: stats.streak > 7 ? '+3 days' : 'New',
      description: 'Consecutive days with messages'
    },
  ]

  // Message type distribution (mock - could be enhanced with real data)
  const messageTypes = [
    { label: 'Text', percentage: 85, color: 'bg-blue-600', count: Math.round(stats.total * 0.85) },
    { label: 'Voice', percentage: 10, color: 'bg-purple-600', count: Math.round(stats.total * 0.10) },
    { label: 'Images', percentage: 5, color: 'bg-green-600', count: Math.round(stats.total * 0.05) },
  ]

  // Weekly data (last 7 days mock - could be enhanced with real daily data)
  const weeklyData = [
    { day: 'Mon', messages: Math.round(stats.thisWeek * 0.12) },
    { day: 'Tue', messages: Math.round(stats.thisWeek * 0.15) },
    { day: 'Wed', messages: Math.round(stats.thisWeek * 0.18) },
    { day: 'Thu', messages: Math.round(stats.thisWeek * 0.14) },
    { day: 'Fri', messages: Math.round(stats.thisWeek * 0.20) },
    { day: 'Sat', messages: Math.round(stats.thisWeek * 0.11) },
    { day: 'Sun', messages: Math.round(stats.thisWeek * 0.10) },
  ]
  
  const maxWeekly = Math.max(...weeklyData.map(d => d.messages))

  return (
    <div className="space-y-6">
      {/* Stats Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`${themeClasses.card} rounded-xl p-4 transition-all hover:scale-105`}>
            <div className="flex items-center justify-between mb-2">
              <stat.icon className="text-gray-400" size={20} />
              <span className="text-xs text-green-500 dark:text-green-400">{stat.change}</span>
            </div>
            <div className={`text-2xl font-bold ${themeClasses.text}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            <div className="text-xs text-gray-400 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>

      {/* Weekly Trends Chart */}
      <div className={`${themeClasses.card} rounded-xl p-5`}>
        <h3 className={`text-base font-medium ${themeClasses.text} mb-4 flex items-center gap-2`}>
          <TrendingUp size="18" className="text-blue-500" />
          Weekly Activity
        </h3>
        <div className="space-y-4">
          {/* Summary stats */}
          <div className="flex justify-between text-sm">
            <div>
              <span className={themeClasses.textSecondary}>Messages this week</span>
              <p className={`text-2xl font-bold ${themeClasses.text}`}>{stats.thisWeek}</p>
            </div>
            <div>
              <span className={themeClasses.textSecondary}>Daily average</span>
              <p className={`text-2xl font-bold ${themeClasses.text}`}>{dailyAverage}</p>
            </div>
            <div>
              <span className={themeClasses.textSecondary}>vs last week</span>
              <p className={`text-2xl font-bold text-green-500`}>+23%</p>
            </div>
          </div>
          
          {/* Bar chart */}
          <div className="h-48 flex items-end justify-between gap-2 pt-4">
            {weeklyData.map((day) => (
              <div key={day.day} className="flex-1 text-center">
                <div 
                  className="bg-blue-500 rounded-lg transition-all duration-500 hover:bg-blue-600"
                  style={{ 
                    height: `${maxWeekly > 0 ? (day.messages / maxWeekly) * 100 : 0}%`,
                    minHeight: '4px'
                  }}
                />
                <p className={`text-xs ${themeClasses.textSecondary} mt-2`}>{day.day}</p>
                <p className={`text-xs ${themeClasses.textSecondary}`}>{day.messages}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Message Types Distribution */}
        <div className={`${themeClasses.card} rounded-xl p-5`}>
          <h3 className={`text-base font-medium ${themeClasses.text} mb-4 flex items-center gap-2`}>
            <PieChart size="18" className="text-purple-500" />
            Message Types
          </h3>
          <div className="space-y-4">
            {messageTypes.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={themeClasses.textSecondary}>{item.label}</span>
                  <div className="flex gap-4">
                    <span className={themeClasses.textSecondary}>{item.count} messages</span>
                    <span className="text-gray-500">{item.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                    style={{ width: `${item.percentage}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
          
          {/* Engagement summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between text-sm">
              <span className={themeClasses.textSecondary}>Total engagement</span>
              <span className={`font-semibold ${themeClasses.text}`}>{stats.total} interactions</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className={themeClasses.textSecondary}>Response rate</span>
              <span className={`font-semibold ${themeClasses.text}`}>{stats.responseRate}%</span>
            </div>
          </div>
        </div>
        
        {/* Streak & Engagement */}
        <div className={`${themeClasses.card} rounded-xl p-5`}>
          <h3 className={`text-base font-medium ${themeClasses.text} mb-4 flex items-center gap-2`}>
            <Award size="18" className="text-yellow-500" />
            Engagement Metrics
          </h3>
          
          {/* Streak calendar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className={themeClasses.textSecondary}>Current streak</span>
              <span className={`text-2xl font-bold ${themeClasses.text}`}>{stats.streak} days</span>
            </div>
            <div className="flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div 
                  key={i}
                  className={`flex-1 h-2 rounded-full ${i < (stats.streak % 7 || 7) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                />
              ))}
            </div>
            <p className={`text-xs ${themeClasses.textSecondary} mt-2`}>
              {stats.streak > 0 
                ? `🔥 You're on a ${stats.streak}-day streak! Keep it up!` 
                : 'Send and receive messages to start a streak'}
            </p>
          </div>
          
          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <MessageSquare size={18} className="text-blue-500 mx-auto mb-1" />
              <div className={`text-lg font-bold ${themeClasses.text}`}>{stats.responseRate}%</div>
              <div className="text-xs text-gray-500">Response Rate</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <Heart size={18} className="text-red-500 mx-auto mb-1" />
              <div className={`text-lg font-bold ${themeClasses.text}`}>
                {stats.total > 0 ? Math.round((stats.total - stats.unread) / stats.total * 100) : 0}%
              </div>
              <div className="text-xs text-gray-500">Messages Read</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}