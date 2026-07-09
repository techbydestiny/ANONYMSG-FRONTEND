// hooks/usePWA.ts
'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function usePWA() {
  const [isPWA, setIsPWA] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    setIsPWA(isStandalone)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsPWA(true)
      setShowInstallPrompt(false)
      setDeferredPrompt(null)
      localStorage.setItem('pwa-installed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const now = Date.now()
      // If dismissed more than 7 days ago, show again
      if (now - dismissedTime > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pwa-dismissed')
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return

    try {
      setIsInstalling(true)
      await deferredPrompt.prompt()
      const result = await deferredPrompt.userChoice
      
      if (result.outcome === 'accepted') {
        setIsPWA(true)
        setShowInstallPrompt(false)
        localStorage.setItem('pwa-installed', 'true')
      }
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const dismissPrompt = () => {
    setShowInstallPrompt(false)
    // Don't show again for 7 days
    localStorage.setItem('pwa-dismissed', Date.now().toString())
  }

  return { isPWA, showInstallPrompt, installApp, dismissPrompt, isInstalling }
}