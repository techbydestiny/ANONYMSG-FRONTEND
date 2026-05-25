// app/dashboard/components/DashboardSidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Inbox, BarChart3, Settings, LogOut, Sun, Moon, Crown, User, Archive } from 'lucide-react'
import { useTheme } from '@/app/context/ThemeContext'

interface DashboardSidebarProps {
  activeTab: 'inbox' | 'analytics' | 'settings'
  setActiveTab: (tab: 'inbox' | 'analytics' | 'settings') => void
  username: string
  unreadCount: number
  onLogout: () => void
}

export function DashboardSidebar({ activeTab, setActiveTab, username, unreadCount, onLogout }: DashboardSidebarProps) {
  const { darkMode, toggleTheme } = useTheme()
  const pathname = usePathname()
  const isArchivePage = pathname === '/dashboard/archive'

  const navItems = [
    { icon: Inbox, label: 'Inbox', tab: 'inbox' as const, badge: unreadCount, href: '/dashboard' },
    { icon: Archive, label: 'Archive', tab: null, badge: 0, href: '/dashboard/archive' },
    { icon: BarChart3, label: 'Analytics', tab: 'analytics' as const, badge: 0, href: '/dashboard' },
    { icon: Settings, label: 'Settings', tab: 'settings' as const, badge: 0, href: '/dashboard' },
  ]

  const themeClasses = {
    bg: darkMode ? 'bg-gray-950' : 'bg-white',
    border: darkMode ? 'border-gray-800' : 'border-gray-200',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    hover: darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100',
    active: darkMode ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-900',
    inactive: darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100',
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.href === '/dashboard') {
      return !isArchivePage && activeTab === item.tab
    }
    if (item.href === '/dashboard/archive') {
      return isArchivePage
    }
    return activeTab === item.tab
  }

  const handleClick = (item: typeof navItems[0]) => {
    if (item.tab) {
      setActiveTab(item.tab)
    }
  }

  return (
    <div className={`hidden lg:block fixed left-0 top-0 bottom-0 w-64 ${themeClasses.bg} border-r ${themeClasses.border}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <User className="text-white" size={20} />
          </div>
          <div>
            <p className={`font-medium ${themeClasses.text}`}>@{username}</p>
            <div className="flex items-center gap-1">
              <Crown size={10} className="text-yellow-500" />
              <p className="text-xs text-gray-500">Pro Member</p>
            </div>
          </div>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => handleClick(item)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                isActive(item) ? themeClasses.active : themeClasses.inactive
              }`}
            >
              <item.icon size={18} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && !isActive(item) && (
                <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
          <button 
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${themeClasses.inactive}`}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}