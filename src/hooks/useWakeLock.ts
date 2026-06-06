import { useEffect, useRef, useCallback } from 'react'

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)
  const activeRef = useRef(false)

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen')
      activeRef.current = true
    } catch (err) {
      console.warn('Wake Lock request failed:', err)
    }
  }, [])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release()
      } catch { /* ignore */ }
      wakeLockRef.current = null
      activeRef.current = false
    }
  }, [])

  // Re-acquire lock when page becomes visible again (iOS releases on hide)
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && activeRef.current) {
        await requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [requestWakeLock])

  return { requestWakeLock, releaseWakeLock }
}
