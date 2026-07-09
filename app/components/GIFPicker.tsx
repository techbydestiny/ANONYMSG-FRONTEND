// app/components/GIFPicker.tsx
'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, X, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface GIFPickerProps {
  darkMode: boolean
  onSelect: (url: string) => void
  onClose: () => void
}

// Note: You'll need to get a GIPHY API key from https://developers.giphy.com/
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || 'YOUR_GIPHY_API_KEY'

export function GIFPicker({ darkMode, onSelect, onClose }: GIFPickerProps) {
  const [search, setSearch] = useState('')
  const [gifs, setGifs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [trending, setTrending] = useState<any[]>([])

  useEffect(() => {
    fetchTrending()
  }, [])

  const fetchTrending = async () => {
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20`
      )
      const data = await response.json()
      setTrending(data.data || [])
    } catch (error) {
      console.error('Failed to fetch trending GIFs:', error)
    }
  }

  const searchGIFs = async () => {
    if (!search.trim()) {
      setGifs([])
      return
    }
    setLoading(true)
    try {
      const response = await fetch(
        `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(search)}&limit=20`
      )
      const data = await response.json()
      setGifs(data.data || [])
    } catch (error) {
      console.error('Failed to search GIFs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) searchGIFs()
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const displayGifs = search ? gifs : trending

  const themeClasses = {
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    input: darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400',
    card: darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200/50',
  }

  return (
    <div className={`${themeClasses.card} rounded-2xl border p-4 max-w-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-purple-500" />
          <h3 className={`font-medium ${themeClasses.text}`}>Choose a GIF</h3>
        </div>
        <button onClick={onClose} className={`p-1 rounded-lg hover:${darkMode ? 'bg-white/10' : 'bg-gray-100'} transition`}>
          <X size={18} className={themeClasses.textSecondary} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full ${themeClasses.input} rounded-xl pl-10 pr-4 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition`}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence>
          {loading ? (
            <div className="col-span-3 flex items-center justify-center py-8">
              <Loader2 size={24} className="animate-spin text-blue-500" />
            </div>
          ) : displayGifs.length === 0 ? (
            <div className="col-span-3 text-center py-8 text-gray-500 text-sm">
              {search ? 'No GIFs found' : 'No trending GIFs'}
            </div>
          ) : (
            displayGifs.map((gif, index) => (
              <motion.button
                key={gif.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                onClick={() => onSelect(gif.images.fixed_height.url)}
                className="rounded-lg overflow-hidden hover:scale-105 transition transform shadow-md"
              >
                <img 
                  src={gif.images.fixed_height_small.url} 
                  alt={gif.title || 'GIF'}
                  className="w-full h-[80px] object-cover"
                  loading="lazy"
                />
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>

      <div className="mt-3 text-center text-xs text-gray-500">
        Powered by GIPHY
      </div>
    </div>
  )
}