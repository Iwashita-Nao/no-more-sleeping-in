import { useEffect, useRef, useCallback } from 'react'

// Synthesize a harsh buzzing alarm using the Web Audio API
export function useAlarmAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ osc: OscillatorNode; gain: GainNode }[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const getCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioCtxRef.current
  }, [])

  const playBurst = useCallback((ctx: AudioContext) => {
    // Clean old nodes
    nodesRef.current.forEach(({ osc, gain }) => {
      try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.02) } catch { /* ignore */ }
      try { osc.stop(ctx.currentTime + 0.1) } catch { /* ignore */ }
    })
    nodesRef.current = []

    // Three layered oscillators for a harsh alarm sound
    const frequencies = [880, 660, 440]
    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = i === 0 ? 'sawtooth' : i === 1 ? 'square' : 'sawtooth'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      // Frequency sweep for urgency
      osc.frequency.linearRampToValueAtTime(freq * 1.05, ctx.currentTime + 0.15)
      osc.frequency.linearRampToValueAtTime(freq, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(i === 0 ? 0.4 : 0.2, ctx.currentTime + 0.02)
      gain.gain.setValueAtTime(i === 0 ? 0.4 : 0.2, ctx.currentTime + 0.25)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.4)
      nodesRef.current.push({ osc, gain })
    })
  }, [])

  const startAlarm = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    playBurst(ctx)
    intervalRef.current = setInterval(() => {
      playBurst(ctx)
    }, 600)
  }, [getCtx, playBurst])

  const stopAlarm = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    nodesRef.current.forEach(({ osc, gain }) => {
      const ctx = audioCtxRef.current
      if (ctx) {
        try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05) } catch { /* ignore */ }
        try { osc.stop(ctx.currentTime + 0.1) } catch { /* ignore */ }
      }
    })
    nodesRef.current = []
  }, [])

  // Play a short gentle success chime
  const playSuccess = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18)
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.18 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.5)
      osc.start(ctx.currentTime + i * 0.18)
      osc.stop(ctx.currentTime + i * 0.18 + 0.55)
    })
  }, [getCtx])

  // Play a short tick sound when monitoring starts
  const playStart = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, ctx.currentTime)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
  }, [getCtx])

  useEffect(() => {
    return () => {
      stopAlarm()
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [stopAlarm])

  return { startAlarm, stopAlarm, playSuccess, playStart }
}
