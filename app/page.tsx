// app/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/app/context/ThemeContext'
import {Navbar} from '@/components/Navbar'

// Icons
import { 
  Shield, Zap, Heart, Users, Lock, MessageSquare, 
  ArrowRight, Check, Star, Globe, Sparkles, 
  TrendingUp, Smile, Award, Clock, Mic, Image,
  Palette, BarChart3, Send, Share2, Crown,
  Rocket, Gem, Infinity, Target, Coffee, Play,
  ChevronRight, Quote, MoveRight
} from 'lucide-react'

// Button Component with theme support
const Button = ({ children, variant = 'primary', size = 'md', className = '', onClick, href, fullWidth, darkMode = false, ...props }: any) => {
  const baseStyles = "font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 rounded-xl"
  
  const variants: any = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25",
    secondary: darkMode 
      ? "bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm"
      : "bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200",
    outline: "border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10",
  }
  
  const sizes: any = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  }
  
  const Component = href ? Link : 'button'
  
  return (
    <Component
      href={href || '#'}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </Component>
  )
}

// Footer Component with theme support
const Footer = ({ darkMode }: { darkMode: boolean }) => (
  <footer className={`border-t py-16 px-4 transition-colors duration-300 ${darkMode ? 'border-white/5 bg-black' : 'border-gray-200/50 bg-white/50 backdrop-blur-sm'}`}>
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>Anon<span className="text-blue-500">Q</span></span>
          </div>
          <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Speak freely. Stay anonymous.</p>
        </div>
        <div>
          <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Product</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/features" className={`${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}>Features</Link></li>
            <li><Link href="/pricing" className={`${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}>Pricing</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className={`${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}>About</Link></li>
            <li><Link href="/contact" className={`${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}>Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className={`font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/privacy" className={`${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}>Privacy</Link></li>
            <li><Link href="/terms" className={`${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-gray-900'} transition`}>Terms</Link></li>
          </ul>
        </div>
      </div>
      <div className={`text-center text-sm pt-8 border-t ${darkMode ? 'text-gray-600 border-white/5' : 'text-gray-400 border-gray-200/50'}`}>
        © 2024 AnonQ. All rights reserved.
      </div>
    </div>
  </footer>
)

export default function HomePage() {
  const { darkMode } = useTheme()
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const targetRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] })
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  useEffect(() => {
    const interval = setInterval(() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length), 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { icon: Shield, title: '100% Anonymous', desc: 'Your identity is never revealed. No tracking, no logs.', badge: 'Privacy First', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: Zap, title: 'Instant Delivery', desc: 'Messages arrive immediately in real-time.', badge: 'Real-time', color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { icon: Heart, title: 'AI Moderation', desc: 'Advanced AI keeps conversations respectful.', badge: 'AI Powered', color: 'text-red-500', bg: 'bg-red-500/10' },
    { icon: Mic, title: 'Voice Messages', desc: 'Send and receive anonymous voice messages.', badge: 'New', color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { icon: Image, title: 'Media Sharing', desc: 'Share images anonymously with blur preview.', badge: 'Rich Media', color: 'text-green-500', bg: 'bg-green-500/10' },
    { icon: BarChart3, title: 'Analytics', desc: 'Track engagement and understand your audience.', badge: 'Insights', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]

  const statsData = [
    { value: '10K+', label: 'Active Users', trend: '+25%', icon: Users },
    { value: '1M+', label: 'Messages Sent', trend: '+45%', icon: MessageSquare },
    { value: '99.9%', label: 'Uptime', trend: '30-day', icon: Shield },
    { value: '180+', label: 'Countries', trend: 'Worldwide', icon: Globe },
  ]

  const testimonials = [
    { text: "This completely changed how I interact with my audience. The anonymous feedback is absolute GOLD.", author: "@sarah_creator", role: "Content Creator", rating: 5 },
    { text: "Best platform for honest feedback. My team uses it weekly for anonymous suggestions.", author: "@techlead", role: "Tech Lead", rating: 5 },
    { text: "The voice message feature is amazing! My followers love sending anonymous voice notes.", author: "@podcaster", role: "Podcaster", rating: 5 },
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) { setIsSubmitted(true); setTimeout(() => setIsSubmitted(false), 3000); setEmail('') }
  }

  const themeClasses = {
    bg: darkMode ? 'bg-black' : 'bg-gray-50',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSec: darkMode ? 'text-gray-400' : 'text-gray-600',
    textMuted: darkMode ? 'text-gray-500' : 'text-gray-400',
    card: darkMode ? 'bg-white/5 border border-white/10 backdrop-blur-sm' : 'bg-white border border-gray-200/60 shadow-sm',
    cardHover: darkMode ? 'hover:border-blue-500/30 hover:shadow-xl' : 'hover:border-blue-500/50 hover:shadow-xl',
    sectionBg: darkMode ? 'bg-white/5' : 'bg-gray-50/50',
    gradientText: darkMode ? 'bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent',
    input: darkMode ? 'bg-white/5 border border-white/10 text-white placeholder:text-gray-500' : 'bg-white border border-gray-200 text-gray-900 placeholder:text-gray-400',
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}>
      <Navbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-blue-600/20' : 'bg-blue-400/10'}`} />
        <div className={`absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl animate-pulse-slow ${darkMode ? 'bg-purple-600/15' : 'bg-purple-300/10'}`} />
        <div className={`absolute top-1/2 left-0 w-[500px] h-[500px] rounded-full blur-3xl animate-pulse ${darkMode ? 'bg-blue-500/10' : 'bg-blue-300/10'}`} />
      </div>
      
      {/* Hero Section */}
      <section ref={targetRef} className="relative pt-32 pb-20 px-4 overflow-hidden">
        <motion.div style={{ opacity }} className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
              <Sparkles size={16} className="text-blue-500" />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voice Messages Now Available</span>
            </div>
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 ${themeClasses.text}`}>
              Speak <span className={`bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent`}>Freely</span><br />
              Stay <span className={themeClasses.text}>Anonymous</span>
            </h1>
            <p className={`text-xl ${themeClasses.textSec} mb-8 max-w-2xl mx-auto leading-relaxed`}>
              Create your anonymous profile and receive honest, unfiltered messages from anyone, anywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
              <Link href="/register">
                <Button darkMode={darkMode} size="lg">
                  Get Started Free <MoveRight size={18} />
                </Button>
              </Link>
              <Button variant="secondary" darkMode={darkMode} size="lg">
                <Play size={18} /> Watch Demo
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {statsData.map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: i * 0.1 }} 
                  className={`${themeClasses.card} rounded-2xl p-6 text-center transition ${themeClasses.cardHover}`}
                >
                  <stat.icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <div className={`text-3xl font-bold ${themeClasses.text}`}>{stat.value}</div>
                  <div className={`text-sm ${themeClasses.textSec}`}>{stat.label}</div>
                  <div className="text-xs text-green-500 mt-1 font-medium">{stat.trend}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-sm font-medium text-blue-500 uppercase tracking-wider`}>Simple Process</span>
            <h2 className={`text-4xl md:text-5xl font-bold ${themeClasses.text} mb-4 mt-2`}>
              How It <span className={themeClasses.gradientText}>Works</span>
            </h2>
            <p className={`text-xl ${themeClasses.textSec} max-w-2xl mx-auto`}>
              Three simple steps to start receiving anonymous messages
            </p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up and choose your unique username', icon: Users },
            { step: '02', title: 'Share Your Link', desc: 'Post your profile link anywhere', icon: Share2 },
            { step: '03', title: 'Receive Messages', desc: 'Get anonymous messages in your inbox', icon: MessageSquare },
          ].map((item, i) => (
            <motion.div 
              key={item.step} 
              initial={{ opacity: 0, y: 30 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.1 }} 
              className={`${themeClasses.card} rounded-2xl p-8 text-center transition ${themeClasses.cardHover} relative group`}
            >
              <div className="absolute -top-4 right-4 text-6xl font-bold text-blue-500/10">{item.step}</div>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>{item.title}</h3>
              <p className={themeClasses.textSec}>{item.desc}</p>
              <div className="mt-4 flex items-center justify-center gap-2 text-blue-500">
                <span className="text-sm font-medium">Learn More</span>
                <ChevronRight size={16} className="group-hover:translate-x-1 transition" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={`py-24 px-4 ${themeClasses.sectionBg}`}>
        <div className="max-w-6xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-sm font-medium text-purple-500 uppercase tracking-wider`}>Features</span>
            <h2 className={`text-4xl md:text-5xl font-bold ${themeClasses.text} mb-4 mt-2`}>
              Powerful <span className={themeClasses.gradientText}>Features</span>
            </h2>
            <p className={`text-xl ${themeClasses.textSec} max-w-2xl mx-auto`}>
              Everything you need for anonymous communication
            </p>
          </motion.div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <motion.div 
              key={feature.title} 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ delay: i * 0.05 }} 
              className={`${themeClasses.card} rounded-2xl p-6 transition ${themeClasses.cardHover}`}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>{feature.title}</h3>
              <p className={`text-sm ${themeClasses.textSec} leading-relaxed`}>{feature.desc}</p>
              <span className={`inline-block mt-3 text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                {feature.badge}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className={`text-sm font-medium text-green-500 uppercase tracking-wider`}>Testimonials</span>
            <h2 className={`text-4xl md:text-5xl font-bold ${themeClasses.text} mb-4 mt-2`}>
              Loved by <span className={themeClasses.gradientText}>Thousands</span>
            </h2>
            <p className={`text-xl ${themeClasses.textSec} max-w-2xl mx-auto`}>
              See what our users are saying
            </p>
          </motion.div>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTestimonial} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }} 
              className={`${themeClasses.card} rounded-2xl p-8 md:p-12 text-center relative overflow-hidden`}
            >
              <Quote className="w-12 h-12 text-blue-500/30 absolute top-6 left-6" />
              <Quote className="w-12 h-12 text-blue-500/30 absolute bottom-6 right-6 rotate-180" />
              <p className={`text-xl md:text-2xl ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed relative z-10`}>
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {testimonials[activeTestimonial].author.charAt(1).toUpperCase()}
                  </span>
                </div>
                <div className="text-left">
                  <p className={`font-semibold ${themeClasses.text}`}>{testimonials[activeTestimonial].author}</p>
                  <p className={`text-sm ${themeClasses.textSec}`}>{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
              <div className="flex justify-center gap-1 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className="fill-yellow-500 text-yellow-500" />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setActiveTestimonial(i)} 
                className={`h-2 rounded-full transition-all duration-300 ${activeTestimonial === i ? 'w-8 bg-gradient-to-r from-blue-500 to-purple-600' : 'w-2 bg-gray-400'}`} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`max-w-4xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden ${darkMode ? 'bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100/50'}`}
        >
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-400/10'}`} />
          <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full blur-3xl ${darkMode ? 'bg-purple-500/10' : 'bg-purple-400/10'}`} />
          <div className="relative z-10">
            <Sparkles className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h2 className={`text-3xl md:text-4xl font-bold ${themeClasses.text} mb-4`}>
              Ready to Start Your Anonymous Journey?
            </h2>
            <p className={`${themeClasses.textSec} mb-8 max-w-lg mx-auto`}>
              Join thousands of users who are having real conversations without fear.
            </p>
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email" 
                  className={`flex-1 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${themeClasses.input}`} 
                  required 
                />
                <Button darkMode={darkMode} type="submit" size="lg">
                  Get Started <ArrowRight size={18} />
                </Button>
              </form>
            ) : (
              <div className="text-green-500 flex items-center justify-center gap-2 text-lg">
                <Check size={24} /> Thanks! Check your email.
              </div>
            )}
          </div>
        </motion.div>
      </section>

      <Footer darkMode={darkMode} />
      
      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}