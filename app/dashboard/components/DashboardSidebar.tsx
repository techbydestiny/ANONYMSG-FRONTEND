// app/dashboard/components/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, BarChart3, Settings, LogOut, Sun, Moon, Crown, User, Archive, Sparkles, MessageSquare, Plus } from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'

interface DashboardSidebarProps {
  activeTab: 'inbox' | 'analytics' | 'settings' | 'archive' | 'qa'
  setActiveTab: (tab: 'inbox' | 'analytics' | 'settings' | 'archive' | 'qa') => void
  username: string
  unreadCount: number
  onLogout: () => void
  profilePicture?: string | null
}

export function DashboardSidebar({ 
  activeTab, 
  setActiveTab, 
  username, 
  unreadCount, 
  onLogout,
  profilePicture = null
}: DashboardSidebarProps) {
  const { darkMode, toggleTheme } = useTheme()
  const pathname = usePathname()

  const navItems = [
    { icon: Inbox, label: 'Inbox', tab: 'inbox' as const, badge: unreadCount },
    { icon: Archive, label: 'Archive', tab: 'archive' as const, badge: 0 },
    { icon: MessageSquare, label: 'Q&A', tab: 'qa' as const, badge: 0 },
    { icon: BarChart3, label: 'Analytics', tab: 'analytics' as const, badge: 0 },
    { icon: Settings, label: 'Settings', tab: 'settings' as const, badge: 0 },
  ]

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-white',
    border: darkMode ? 'border-white/10' : 'border-gray-200/50',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    hover: darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100',
    active: darkMode ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900',
    inactive: darkMode ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  }

  const isActive = (item: typeof navItems[0]) => {
    return activeTab === item.tab
  }

  const handleClick = (item: typeof navItems[0]) => {
    setActiveTab(item.tab)
  }

  const firstChar = username ? username.charAt(0).toUpperCase() : '?'

  return (
    <div className={`hidden lg:block fixed left-0 top-0 bottom-0 w-64 ${themeClasses.bg} border-r ${themeClasses.border} backdrop-blur-sm`}>
      <div className="p-6 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-200/50 dark:border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <p className={`font-bold text-lg ${themeClasses.text}`}>Anon<span className="text-blue-500">Q</span></p>
            <p className="text-xs text-gray-500">Dashboard</p>
          </div>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200/50 dark:border-white/10">
          {profilePicture ? (
            <img 
              src={profilePicture} 
              alt={username}
              className="w-10 h-10 rounded-xl object-cover border-2 border-blue-500/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">{firstChar}</span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className={`font-medium ${themeClasses.text} truncate`}>@{username}</p>
            <div className="flex items-center gap-1">
              <Crown size={10} className="text-yellow-500" />
              <p className="text-xs text-gray-500">Member</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm group ${
                isActive(item) ? themeClasses.active : themeClasses.inactive
              }`}
            >
              <item.icon size={18} className={isActive(item) ? 'text-blue-500' : ''} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive(item) 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-blue-500/20 text-blue-500'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200/50 dark:border-white/10 space-y-1">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${themeClasses.inactive}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}