import { useEffect, useRef, useCallback } from 'react'

export interface MotionConfig {
  threshold: number // m/s² combined acceleration magnitude delta
}

export interface UseMotionSensorOptions {
  onExceeded: () => void
  config: MotionConfig
  enabled: boolean
}

// Rolling average to smooth out noise
class RollingAverage {
  private samples: number[] = []
  private maxSamples: number

  constructor(maxSamples: number) {
    this.maxSamples = maxSamples
  }

  add(value: number): number {
    this.samples.push(value)
    if (this.samples.length > this.maxSamples) this.samples.shift()
    return this.samples.reduce((a, b) => a + b, 0) / this.samples.length
  }

  reset() {
    this.samples = []
  }
}

export async function requestMotionPermission(): Promise<boolean> {
  // iOS 13+ requires explicit permission
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
  ) {
    try {
      const result = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission()
      return result === 'granted'
    } catch (_err) {
      return false
    }
  }
  // Android / Desktop — always available
  return true
}

export function useMotionSensor({ onExceeded, config, enabled }: UseMotionSensorOptions) {
  const onExceededRef = useRef(onExceeded)
  onExceededRef.current = onExceeded

  const configRef = useRef(config)
  configRef.current = config

  const lastMagnitudeRef = useRef<number | null>(null)
  const avgDeltaRef = useRef(new RollingAverage(5)) // 5-sample rolling average
  const cooldownRef = useRef(false)
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  const reset = useCallback(() => {
    lastMagnitudeRef.current = null
    avgDeltaRef.current.reset()
    cooldownRef.current = false
  }, [])

  useEffect(() => {
    if (!enabled) {
      reset()
      return
    }

    const handleMotion = (e: DeviceMotionEvent) => {
      if (!enabledRef.current || cooldownRef.current) return

      const acc = e.accelerationIncludingGravity
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return

      const magnitude = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2)

      if (lastMagnitudeRef.current === null) {
        lastMagnitudeRef.current = magnitude
        return
      }

      const delta = Math.abs(magnitude - lastMagnitudeRef.current)
      lastMagnitudeRef.current = magnitude

      const avgDelta = avgDeltaRef.current.add(delta)

      if (avgDelta > configRef.current.threshold) {
        cooldownRef.current = true
        onExceededRef.current()
        // Cooldown to avoid repeated triggers within 3 seconds
        setTimeout(() => {
          cooldownRef.current = false
        }, 3000)
      }
    }

    window.addEventListener('devicemotion', handleMotion, { passive: true })
    return () => {
      window.removeEventListener('devicemotion', handleMotion)
      reset()
    }
  }, [enabled, reset])

  return { reset }
}
