// app/components/EmbedGenerator.tsx
'use client'

import { useState } from 'react'
import { Copy, Check, Code, Sparkles, MessageSquare } from 'lucide-react'

interface EmbedGeneratorProps {
  username: string
  darkMode: boolean
}

export function EmbedGenerator({ username, darkMode }: EmbedGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [primaryColor, setPrimaryColor] = useState('#3B82F6')
  const [position, setPosition] = useState<'fixed' | 'inline'>('fixed')

  const embedCode = `<script src="https://cdn.anonmsg.com/embed.js"></script>
<script>
  AnonMsgWidget.init({
    username: "${username}",
    theme: "${theme}",
    primaryColor: "${primaryColor}",
    position: "${position}",
    placeholder: "Write your anonymous message..."
  });
</script>
<div id="anonmsg-widget"></div>`

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-gray-50',
    card: darkMode ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200 shadow-sm',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-400' : 'text-gray-500',
    input: darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900',
  }

  return (
    <div className={`${themeClasses.card} rounded-2xl p-6 border`}>
      <div className="flex items-center gap-2 mb-4">
        <Code size={18} className="text-blue-500" />
        <h3 className={`text-lg font-semibold ${themeClasses.text}`}>Embed Widget</h3>
      </div>
      <p className={`text-sm ${themeClasses.textSecondary} mb-4`}>
        Embed an anonymous message box on your website. Copy and paste the code below.
      </p>

      {/* Customization */}
      <div className="space-y-4 mb-4">
        <div className="flex gap-4">
          <div>
            <label className={`text-xs font-medium ${themeClasses.textSecondary}`}>Theme</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setTheme('dark')}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  theme === 'dark'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  theme === 'light'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Light
              </button>
            </div>
          </div>
          <div>
            <label className={`text-xs font-medium ${themeClasses.textSecondary}`}>Position</label>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setPosition('fixed')}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  position === 'fixed'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Floating
              </button>
              <button
                onClick={() => setPosition('inline')}
                className={`px-3 py-1 rounded-lg text-xs transition ${
                  position === 'inline'
                    ? 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Inline
              </button>
            </div>
          </div>
          <div>
            <label className={`text-xs font-medium ${themeClasses.textSecondary}`}>Color</label>
            <div className="flex gap-2 mt-1">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Code Display */}
      <div className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl p-4 mb-4`}>
        <pre className={`text-xs ${themeClasses.text} overflow-x-auto whitespace-pre-wrap`}>
          {embedCode}
        </pre>
        <button
          onClick={copyCode}
          className={`absolute top-2 right-2 p-2 rounded-lg transition ${
            darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'
          }`}
        >
          {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
        </button>
      </div>

      {/* Live Preview */}
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-gray-50'} border border-gray-200 dark:border-gray-700`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-blue-500" />
          <span className={`text-sm font-medium ${themeClasses.text}`}>Live Preview</span>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: primaryColor }}
          >
            <MessageSquare size={16} className="text-white" />
          </div>
          <div>
            <p className={`text-sm ${themeClasses.text}`}>Anonymous Message to @{username}</p>
            <p className={`text-xs ${themeClasses.textSecondary}`}>Click to send anonymous message</p>
          </div>
        </div>
      </div>
    </div>
  )
}