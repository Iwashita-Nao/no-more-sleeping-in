import { useState, useEffect, useRef, useCallback } from 'react'
import { TimerSetup } from './components/TimerSetup'
import { ActiveMonitor } from './components/ActiveMonitor'
import { AlarmScreen } from './components/AlarmScreen'
import { SuccessScreen } from './components/SuccessScreen'
import { useAlarmAudio } from './hooks/useAlarmAudio'
import { useWakeLock } from './hooks/useWakeLock'
import { useMotionSensor, requestMotionPermission } from './hooks/useMotionSensor'

type AppState = 'setup' | 'monitoring' | 'alarm' | 'success'

export default function App() {
  const [appState, setAppState] = useState<AppState>('setup')
  const [durationMinutes, setDurationMinutes] = useState(20)
  const [threshold, setThreshold] = useState(3.0)
  const [alarmCount, setAlarmCount] = useState(0)
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alarmCountRef = useRef(0)

  const { startAlarm, stopAlarm, playSuccess, playStart } = useAlarmAudio()
  const { requestWakeLock, releaseWakeLock } = useWakeLock()

  // Fires when motion threshold exceeded
  const handleMotionExceeded = useCallback(() => {
    if (isAlarmActive) return // already alarming
    alarmCountRef.current += 1
    setAlarmCount(alarmCountRef.current)
    setIsAlarmActive(true)
    setAppState('alarm')
    startAlarm()
  }, [isAlarmActive, startAlarm])

  const { reset: resetSensor } = useMotionSensor({
    onExceeded: handleMotionExceeded,
    config: { threshold },
    enabled: appState === 'monitoring',
  })

  const handleStart = async (minutes: number, thresh: number) => {
    // Must happen inside a user gesture for iOS permission + AudioContext
    const granted = await requestMotionPermission()
    if (!granted) {
      alert('Motion sensor permission is required. Please allow access and try again.')
      return
    }

    setDurationMinutes(minutes)
    setThreshold(thresh)
    setAlarmCount(0)
    alarmCountRef.current = 0
    resetSensor()

    playStart()
    await requestWakeLock()
    setAppState('monitoring')

    // Set the countdown timer
    timerRef.current = setTimeout(() => {
      // Timer expired — success if we're still monitoring
      setAppState((curr) => {
        if (curr === 'monitoring') {
          releaseWakeLock()
          playSuccess()
          return 'success'
        }
        return curr
      })
    }, minutes * 60 * 1000)
  }

  const handleStopAlarm = useCallback(() => {
    stopAlarm()
    setIsAlarmActive(false)
    // Return to monitoring if timer still running
    setAppState('monitoring')
  }, [stopAlarm])

  const handleCancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    stopAlarm()
    releaseWakeLock()
    setIsAlarmActive(false)
    setAppState('setup')
  }, [stopAlarm, releaseWakeLock])

  const handleReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    stopAlarm()
    setIsAlarmActive(false)
    setAlarmCount(0)
    alarmCountRef.current = 0
    setAppState('setup')
  }, [stopAlarm])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      stopAlarm()
      releaseWakeLock()
    }
  }, [stopAlarm, releaseWakeLock])

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col relative overflow-hidden bg-zinc-950">
      {/* Ambient background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{
            background: appState === 'alarm'
              ? 'radial-gradient(circle, #dc2626, transparent)'
              : appState === 'success'
              ? 'radial-gradient(circle, #22c55e, transparent)'
              : 'radial-gradient(circle, #f59e0b, transparent)',
            transition: 'background 1s ease',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col safe-top">
        {appState === 'setup' && (
          <TimerSetup onStart={handleStart} />
        )}
        {(appState === 'monitoring' || appState === 'alarm') && (
          <ActiveMonitor
            durationMinutes={durationMinutes}
            alarmCount={alarmCount}
            onCancel={handleCancel}
          />
        )}
        {appState === 'alarm' && (
          <AlarmScreen
            onStop={handleStopAlarm}
            triggerCount={alarmCount}
          />
        )}
        {appState === 'success' && (
          <SuccessScreen
            durationMinutes={durationMinutes}
            alarmCount={alarmCount}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
