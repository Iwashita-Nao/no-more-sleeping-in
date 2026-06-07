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
  const [durationSeconds, setDurationSeconds] = useState(20 * 60)
  const [threshold, setThreshold] = useState(3.0)
  const [alarmCount, setAlarmCount] = useState(0)
  const [isAlarmActive, setIsAlarmActive] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const alarmCountRef = useRef(0)

  const { startAlarm, stopAlarm, playSuccess, playStart } = useAlarmAudio()
  const { requestWakeLock, releaseWakeLock } = useWakeLock()

  // 動き検知時に発火
  const handleMotionExceeded = useCallback(() => {
    if (isAlarmActive) return
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

  const handleStart = async (seconds: number, thresh: number) => {
    const granted = await requestMotionPermission()
    if (!granted) {
      alert('モーションセンサーへのアクセス権限が必要です。許可してから再度お試しください。')
      return
    }

    setDurationSeconds(seconds)
    setThreshold(thresh)
    setAlarmCount(0)
    alarmCountRef.current = 0
    resetSensor()

    playStart()
    await requestWakeLock()
    setAppState('monitoring')

    timerRef.current = setTimeout(() => {
      setAppState((curr) => {
        if (curr === 'monitoring') {
          releaseWakeLock()
          playSuccess()
          return 'success'
        }
        return curr
      })
    }, seconds * 1000)
  }

  const handleStopAlarm = useCallback(() => {
    stopAlarm()
    setIsAlarmActive(false)
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

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      stopAlarm()
      releaseWakeLock()
    }
  }, [stopAlarm, releaseWakeLock])

  return (
    <div className="h-full w-full max-w-md mx-auto flex flex-col relative overflow-hidden bg-zinc-950">
      {/* 環境グラデーション */}
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

      {/* コンテンツ */}
      <div className="relative z-10 h-full flex flex-col safe-top">
        {appState === 'setup' && (
          <TimerSetup onStart={handleStart} />
        )}
        {(appState === 'monitoring' || appState === 'alarm') && (
          <ActiveMonitor
            durationSeconds={durationSeconds}
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
            durationSeconds={durationSeconds}
            alarmCount={alarmCount}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  )
}
