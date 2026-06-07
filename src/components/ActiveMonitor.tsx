import { useEffect, useState, useRef } from 'react'

interface ActiveMonitorProps {
  durationSeconds: number
  alarmCount: number
  onCancel: () => void
}

function formatCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatElapsed(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}時間${m}分`
  if (m > 0) return `${m}分${s > 0 ? `${s}秒` : ''}`
  return `${s}秒`
}

function getProgressColor(pct: number): string {
  if (pct > 0.66) return '#f59e0b'
  if (pct > 0.33) return '#fb923c'
  return '#ef4444'
}

export function ActiveMonitor({ durationSeconds, alarmCount, onCancel }: ActiveMonitorProps) {
  const [remaining, setRemaining] = useState(durationSeconds)
  const startTimeRef = useRef(Date.now())

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
      setRemaining(Math.max(0, durationSeconds - elapsed))
    }, 500)
    return () => clearInterval(id)
  }, [durationSeconds])

  const pct = remaining / durationSeconds
  const radius = 100
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - pct)
  const color = getProgressColor(pct)
  const elapsed = durationSeconds - remaining

  // 時計表示フォントサイズ（hh:mm:ss の場合は小さく）
  const hasHours = durationSeconds >= 3600
  const countdownFontSize = hasHours ? 'text-3xl' : 'text-5xl'

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-5 pt-8 pb-4">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">監視中</p>
          <h2 className="text-white font-bold text-lg mt-0.5">動きを検知しています…</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">LIVE</span>
        </div>
      </div>

      {/* 円形タイマー */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="relative">
          <svg width="260" height="260" className="rotate-[-90deg]">
            <circle
              cx="130" cy="130" r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="12"
            />
            <circle
              cx="130" cy="130" r={radius}
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease', filter: `drop-shadow(0 0 8px ${color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-black text-white tabular-nums ${countdownFontSize}`} style={{ color }}>
              {formatCountdown(remaining)}
            </span>
            <span className="text-zinc-400 text-sm mt-1">残り時間</span>
          </div>
        </div>

        {/* 統計 */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-3xl font-black text-amber-400">{alarmCount}</div>
            <div className="text-xs text-zinc-400 mt-1">アラーム回数</div>
          </div>
          <div className="glass-card rounded-2xl p-4 text-center">
            <div className="text-xl font-black text-emerald-400 leading-tight">
              {formatElapsed(elapsed)}
            </div>
            <div className="text-xs text-zinc-400 mt-1">経過時間</div>
          </div>
        </div>

        {/* センサー状態 */}
        <div className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3 w-full">
          <span className="text-2xl">📡</span>
          <div>
            <p className="text-white text-sm font-semibold">センサー起動中</p>
            <p className="text-zinc-400 text-xs">スマホをベッドに平らに置いてください</p>
          </div>
          <span className="ml-auto text-green-400 text-lg">✓</span>
        </div>
      </div>

      {/* キャンセルボタン */}
      <div className="px-5 pb-8 safe-bottom pt-4 border-t border-zinc-800/50">
        <button
          id="cancel-monitor-btn"
          onClick={onCancel}
          className="w-full py-4 rounded-2xl font-bold text-base text-zinc-400 border border-zinc-700 hover:border-zinc-500 hover:text-zinc-200 transition-all duration-200 active:scale-95"
        >
          セッションをキャンセル
        </button>
      </div>
    </div>
  )
}
