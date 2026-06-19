'use client'

import { useState, useCallback, useEffect } from 'react'
import LoadingScreen from '@/components/ui/LoadingScreen'
import { LoadedContext } from '@/context/LoadedContext'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false)

  // Prevent the browser from restoring the previous scroll position so the
  // user always lands at the top (Hero section) on every fresh load / reload.
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [])

  // Lock scroll until loading completes so the globe scatter animation
  // can't be triggered before the page is ready.
  useEffect(() => {
    if (!loaded) {
      document.documentElement.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    return () => { document.documentElement.style.overflow = '' }
  }, [loaded])

  const handleComplete = useCallback(() => setLoaded(true), [])

  return (
    <LoadedContext.Provider value={loaded}>
      <LoadingScreen onComplete={handleComplete} />
      <div style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s ease' }}>
        {children}
      </div>
    </LoadedContext.Provider>
  )
}
