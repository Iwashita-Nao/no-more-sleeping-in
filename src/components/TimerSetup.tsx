import { useState } from 'react'

interface TimerSetupProps {
  // durationSeconds: 合計秒数で渡す
  onStart: (durationSeconds: number, threshold: number) => Promise<void>
}

// sensitivityLevel: 1=低感度(鈍感), 8=高感度(敏感)
const SENSITIVITY_MIN = 1
const SENSITIVITY_MAX = 8
const DEFAULT_SENSITIVITY = 6

function sensitivityToThreshold(level: number): number {
  return SENSITIVITY_MAX + SENSITIVITY_MIN - level // 9 - level
}

// ±ボタン付きスピナー
function Spinner({
  label,
  unit,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  unit: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <p className="text-xs font-semibold text-zinc-400 tracking-widest">{label}</p>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-amber-400 hover:text-zinc-900 text-white font-black text-lg transition-all duration-150 active:scale-90"
      >
        ＋
      </button>
      <div className="text-center">
        <span className="text-4xl font-black text-white tabular-nums leading-none">
          {String(value).padStart(2, '0')}
        </span>
        <span className="text-xs text-zinc-400 ml-1">{unit}</span>
      </div>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white font-black text-lg transition-all duration-150 active:scale-90"
      >
        ー
      </button>
    </div>
  )
}

// クイック選択プリセット（秒単位）
const QUICK_PRESETS = [
  { label: '5分', seconds: 5 * 60 },
  { label: '15分', seconds: 15 * 60 },
  { label: '30分', seconds: 30 * 60 },
  { label: '1時間', seconds: 60 * 60 },
]

export function TimerSetup({ onStart }: TimerSetupProps) {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(20)
  const [seconds, setSeconds] = useState(0)
  const [sensitivityLevel, setSensitivityLevel] = useState(DEFAULT_SENSITIVITY)
  const [isStarting, setIsStarting] = useState(false)

  const totalSeconds = hours * 3600 + minutes * 60 + seconds
  const threshold = sensitivityToThreshold(sensitivityLevel)

  // プリセットをh/m/sに分解して設定
  const applyPreset = (sec: number) => {
    setHours(Math.floor(sec / 3600))
    setMinutes(Math.floor((sec % 3600) / 60))
    setSeconds(sec % 60)
  }

  const handleStart = async () => {
    if (totalSeconds < 5) return // 最低5秒
    setIsStarting(true)
    try {
      await onStart(totalSeconds, threshold)
    } catch {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* ヘッダー */}
      <div className="flex flex-col items-center pt-8 pb-5 px-6">
        <div className="relative mb-3">
          <div className="text-6xl animate-bounce-slow">😴</div>
          <div className="absolute -top-1 -right-1 text-2xl animate-ping-slow">⚡</div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight text-center">
          ねむる番
        </h1>
        <p className="text-amber-400 text-sm font-semibold text-center mt-1">
          睡魔との闘いをサポート
        </p>
        <p className="text-zinc-500 text-xs text-center mt-2 leading-relaxed">
          スマホをベッドに置いて寝てください。<br />寝返りを打ったら → アラームが鳴ります 🚨
        </p>
      </div>

      {/* スクロール可能なコンテンツ */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-4">

        {/* タイマー h/m/s スピナー */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4 text-center">
            ⏱ 監視時間
          </p>

          {/* スピナー3つ */}
          <div className="flex items-start justify-center gap-2">
            <Spinner label="時間" unit="h" value={hours} min={0} max={2} onChange={setHours} />
            <div className="text-2xl font-black text-zinc-600 mt-10">:</div>
            <Spinner label="分" unit="min" value={minutes} min={0} max={59} onChange={setMinutes} />
            <div className="text-2xl font-black text-zinc-600 mt-10">:</div>
            <Spinner label="秒" unit="s" value={seconds} min={0} max={59} onChange={setSeconds} />
          </div>

          {/* 合計時間表示 */}
          <div className="mt-4 text-center">
            <span className="text-xs text-zinc-500">合計：</span>
            <span className={`text-sm font-bold ml-1 ${totalSeconds < 5 ? 'text-red-400' : 'text-amber-400'}`}>
              {totalSeconds < 5
                ? '5秒以上に設定してください'
                : totalSeconds < 60
                  ? `${totalSeconds}秒`
                  : totalSeconds < 3600
                    ? `${Math.floor(totalSeconds / 60)}分${totalSeconds % 60 > 0 ? `${totalSeconds % 60}秒` : ''}`
                    : `${Math.floor(totalSeconds / 3600)}時間${Math.floor((totalSeconds % 3600) / 60)}分${totalSeconds % 60 > 0 ? `${totalSeconds % 60}秒` : ''}`
              }
            </span>
          </div>

          {/* クイックプリセット */}
          <div className="mt-3 flex gap-2 justify-center">
            {QUICK_PRESETS.map((p) => (
              <button
                key={p.seconds}
                onClick={() => applyPreset(p.seconds)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150
                  ${totalSeconds === p.seconds
                    ? 'bg-amber-400 border-amber-400 text-zinc-900 font-bold'
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
                  }`}
              >
                {p.label}
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
          disabled={isStarting || totalSeconds < 5}
          className={`
            w-full py-5 rounded-2xl font-black text-lg tracking-tight transition-all duration-200
            ${isStarting || totalSeconds < 5
              ? 'bg-amber-500/40 text-zinc-600 cursor-not-allowed'
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
