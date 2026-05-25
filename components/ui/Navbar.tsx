// components/ui/Navbar.tsx
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, Moon, Sun } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from '@/app/context/ThemeContext'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const { darkMode, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  // Check auth status
  const checkAuth = () => {
    const token = localStorage.getItem('access_token')
    const userStr = localStorage.getItem('user')
    
    if (token) {
      setIsLoggedIn(true)
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          setUsername(user.username || '')
        } catch (e) {
          console.error('Failed to parse user:', e)
        }
      }
    } else {
      setIsLoggedIn(false)
      setUsername('')
    }
  }

  useEffect(() => {
    checkAuth()
    
    // Listen for storage changes (login/logout in other tabs)
    window.addEventListener('storage', checkAuth)
    
    // Listen for custom events
    window.addEventListener('authChange', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  // Re-check when route changes (in case of redirects)
  useEffect(() => {
    checkAuth()
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUsername('')
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('authChange'))
    
    router.push('/')
  }

  const navClasses = darkMode 
    ? 'bg-black/80 backdrop-blur-xl border-b border-white/10'
    : 'bg-white/80 backdrop-blur-xl border-b border-gray-200'

  const linkClasses = darkMode 
    ? 'text-gray-300 hover:text-white'
    : 'text-gray-600 hover:text-gray-900'

  const mobileMenuClasses = darkMode
    ? 'border-white/10'
    : 'border-gray-200'

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg transform group-hover:scale-110 transition" />
            <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>AnonMsg</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/features" className={`transition ${linkClasses}`}>
              Features
            </Link>
            <Link href="/pricing" className={`transition ${linkClasses}`}>
              Pricing
            </Link>
            
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun size={18} className="text-gray-300" /> : <Moon size={18} className="text-gray-600" />}
            </button>
            
            {isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <button className={`px-4 py-2 rounded-lg transition ${darkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <button className={`px-4 py-2 rounded-lg transition ${darkMode ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
                    Login
                  </button>
                </Link>
                <Link href="/register">
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg transition shadow-lg shadow-blue-500/25 text-white">
                    Sign Up Free
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}
            >
              {darkMode ? <Sun size={20} className="text-gray-300" /> : <Moon size={20} className="text-gray-600" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}>
              {isOpen ? <X size={24} className={darkMode ? 'text-white' : 'text-gray-900'} /> : <Menu size={24} className={darkMode ? 'text-white' : 'text-gray-900'} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className={`md:hidden py-4 border-t space-y-3 ${mobileMenuClasses}`}>
            <Link href="/features" className={`block py-2 transition ${linkClasses}`} onClick={() => setIsOpen(false)}>
              Features
            </Link>
            <Link href="/pricing" className={`block py-2 transition ${linkClasses}`} onClick={() => setIsOpen(false)}>
              Pricing
            </Link>
            {isLoggedIn ? (
              <>
                <Link href="/dashboard" className={`block py-2 transition ${linkClasses}`} onClick={() => setIsOpen(false)}>
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="block w-full text-left py-2 text-red-400">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={`block py-2 transition ${linkClasses}`} onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)}>
                  <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}