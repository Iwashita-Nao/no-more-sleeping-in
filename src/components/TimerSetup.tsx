import { useState } from 'react'

interface TimerSetupProps {
  onStart: (durationMinutes: number, threshold: number) => Promise<void>
}

// sensitivityLevel: 1=低感度(鈍感), 8=高感度(敏感)
// 実際の閾値: threshold = 9 - sensitivityLevel (逆変換)
const SENSITIVITY_MIN = 1
const SENSITIVITY_MAX = 8
const DEFAULT_SENSITIVITY = 6  // threshold = 3.0 相当

const TIMER_MIN = 5
const TIMER_MAX = 90
const TIMER_STEP = 5

function sensitivityToThreshold(level: number): number {
  return SENSITIVITY_MAX + SENSITIVITY_MIN - level  // 9 - level
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes}分`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}時間` : `${h}時間${m}分`
}

export function TimerSetup({ onStart }: TimerSetupProps) {
  const [durationMinutes, setDurationMinutes] = useState(20)
  const [sensitivityLevel, setSensitivityLevel] = useState(DEFAULT_SENSITIVITY)
  const [isStarting, setIsStarting] = useState(false)

  const threshold = sensitivityToThreshold(sensitivityLevel)

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await onStart(durationMinutes, threshold)
    } catch {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ヘッダー */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6">
        <div className="relative mb-4">
          <div className="text-6xl animate-bounce-slow">😴</div>
          <div className="absolute -top-1 -right-1 text-2xl animate-ping-slow">⚡</div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight text-center">
          もう<br />
          <span className="text-amber-400">寝坊しない</span>
        </h1>
        <p className="text-zinc-400 text-sm text-center mt-2 leading-relaxed">
          スマホをベッドに置いて寝てください。<br />寝返りを打ったら → アラームが鳴ります 🚨
        </p>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">

        {/* タイマー時間スライダー */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              ⏱ 監視時間
            </p>
            <span className="text-amber-400 font-black text-2xl tabular-nums">
              {formatTime(durationMinutes)}
            </span>
          </div>
          <input
            type="range"
            min={TIMER_MIN}
            max={TIMER_MAX}
            step={TIMER_STEP}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 h-2"
            aria-label="タイマー時間"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-2">
            <span>{TIMER_MIN}分</span>
            <span>{TIMER_MAX}分</span>
          </div>
          {/* 目盛り表示 */}
          <div className="flex justify-between mt-3">
            {[5, 15, 30, 45, 60, 90].map((m) => (
              <button
                key={m}
                onClick={() => setDurationMinutes(m)}
                className={`text-xs px-2 py-1 rounded-lg transition-all duration-150
                  ${durationMinutes === m
                    ? 'bg-amber-400 text-zinc-900 font-bold'
                    : 'text-zinc-500 hover:text-zinc-300'
                  }`}
              >
                {m}分
              </button>
            ))}
          </div>
        </div>

        {/* 感度スライダー */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              📡 検知感度
            </p>
            <span className="text-amber-400 font-bold text-sm">
              {sensitivityLevel <= 2 ? '低感度' : sensitivityLevel <= 5 ? '中感度' : '高感度'}
            </span>
          </div>
          <input
            type="range"
            min={SENSITIVITY_MIN}
            max={SENSITIVITY_MAX}
            step={1}
            value={sensitivityLevel}
            onChange={(e) => setSensitivityLevel(parseInt(e.target.value, 10))}
            className="w-full accent-amber-400 h-2"
            aria-label="動き検知感度"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>← 鈍感（動きにくい）</span>
            <span>（反応しやすい）敏感 →</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            右にするほど小さな動きで反応します
          </p>
        </div>

        {/* インフォカード */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🛏️</div>
            <p className="text-xs text-zinc-400 leading-snug">ベッドや枕の上に<br />平らに置いてください</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🔊</div>
            <p className="text-xs text-zinc-400 leading-snug">開始前に音量を<br />上げておいてください</p>
          </div>
        </div>
      </div>

      {/* スタートボタン */}
      <div className="px-5 pb-8 safe-bottom pt-4 border-t border-zinc-800/50">
        <button
          id="start-timer-btn"
          onClick={handleStart}
          disabled={isStarting}
          className={`
            w-full py-5 rounded-2xl font-black text-lg tracking-tight transition-all duration-200
            ${isStarting
              ? 'bg-amber-500/50 text-zinc-700 scale-95 cursor-not-allowed'
              : 'bg-amber-400 text-zinc-900 active:scale-95 shadow-xl glow-amber hover:bg-amber-300'
            }
          `}
        >
          {isStarting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> アクセス許可を確認中…
            </span>
          ) : (
            '🛏️ タイマー開始してベッドに置く'
          )}
        </button>
      </div>
    </div>
  )
}
