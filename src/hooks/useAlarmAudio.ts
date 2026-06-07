import { useEffect, useRef, useCallback } from 'react'

// Web Audio API による警告音合成（少し優しいバージョン）
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
    // 古いノードをフェードアウト
    nodesRef.current.forEach(({ osc, gain }) => {
      try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05) } catch { /* ignore */ }
      try { osc.stop(ctx.currentTime + 0.15) } catch { /* ignore */ }
    })
    nodesRef.current = []

    // 優しめの三角波 2 層（サイン波に近く、耳に刺さりにくい）
    // 周波数も低めにして穏やかに
    const layers: { freq: number; volume: number }[] = [
      { freq: 523.25, volume: 0.28 }, // C5（中音域）
      { freq: 392.00, volume: 0.14 }, // G4（低め・ハーモニー）
    ]

    layers.forEach(({ freq, volume }) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      // triangle 波 = サイン波より倍音が少なく柔らかい
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, ctx.currentTime)

      // 穏やかなエンベロープ（ゆっくり立ち上がり、ゆっくり消える）
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.08)  // 緩やかなアタック
      gain.gain.setValueAtTime(volume, ctx.currentTime + 0.35)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.55)       // 緩やかなリリース

      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.6)
      nodesRef.current.push({ osc, gain })
    })
  }, [])

  const startAlarm = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    playBurst(ctx)
    // インターバルを長めにして連続性を緩和（600ms → 950ms）
    intervalRef.current = setInterval(() => {
      playBurst(ctx)
    }, 950)
  }, [getCtx, playBurst])

  const stopAlarm = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    nodesRef.current.forEach(({ osc, gain }) => {
      const ctx = audioCtxRef.current
      if (ctx) {
        try { gain.gain.setTargetAtTime(0, ctx.currentTime, 0.08) } catch { /* ignore */ }
        try { osc.stop(ctx.currentTime + 0.2) } catch { /* ignore */ }
      }
    })
    nodesRef.current = []
  }, [])

  // 成功チャイム（C5 E5 G5 C6 の上昇アルペジオ）
  const playSuccess = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const notes = [523.25, 659.25, 783.99, 1046.5]
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

  // スタート時の短い確認音
  const playStart = useCallback(() => {
    const ctx = getCtx()
    if (ctx.state === 'suspended') ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, ctx.currentTime)
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
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
