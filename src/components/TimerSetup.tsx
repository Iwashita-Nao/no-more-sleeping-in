import { useState } from 'react'

interface TimerSetupProps {
  onStart: (durationMinutes: number, threshold: number) => Promise<void>
}

const PRESETS = [
  { label: '5 min', value: 5, sublabel: 'Debug' },
  { label: '15 min', value: 15, sublabel: 'Quick' },
  { label: '20 min', value: 20, sublabel: 'Standard' },
  { label: '30 min', value: 30, sublabel: 'Relaxed' },
  { label: '45 min', value: 45, sublabel: 'Extended' },
  { label: '60 min', value: 60, sublabel: 'Full Hour' },
]

export function TimerSetup({ onStart }: TimerSetupProps) {
  const [selectedMinutes, setSelectedMinutes] = useState(20)
  const [threshold, setThreshold] = useState(3.0)
  const [isStarting, setIsStarting] = useState(false)

  const handleStart = async () => {
    setIsStarting(true)
    try {
      await onStart(selectedMinutes, threshold)
    } catch {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {/* Header */}
      <div className="flex flex-col items-center pt-8 pb-6 px-6">
        <div className="relative mb-4">
          <div className="text-6xl animate-bounce-slow">😴</div>
          <div className="absolute -top-1 -right-1 text-2xl animate-ping-slow">⚡</div>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight text-center">
          No More<br />
          <span className="text-amber-400">Sleeping In</span>
        </h1>
        <p className="text-zinc-400 text-sm text-center mt-2 leading-relaxed">
          Place your phone on the bed.<br />Roll over → alarm fires. 🚨
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-5">

        {/* Timer Presets */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3">
            ⏱ Monitoring Duration
          </p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setSelectedMinutes(preset.value)}
                className={`
                  relative rounded-xl py-3 px-2 text-center transition-all duration-200
                  ${selectedMinutes === preset.value
                    ? 'bg-amber-400 text-zinc-900 shadow-lg glow-amber scale-105'
                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 active:scale-95'
                  }
                `}
              >
                <div className="text-sm font-bold">{preset.label}</div>
                <div className={`text-xs mt-0.5 ${selectedMinutes === preset.value ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  {preset.sublabel}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sensitivity */}
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
              📡 Sensitivity
            </p>
            <span className="text-amber-400 font-bold text-sm">
              {threshold.toFixed(1)} m/s²
            </span>
          </div>
          <input
            type="range"
            min="1.0"
            max="8.0"
            step="0.5"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="w-full accent-amber-400 h-2"
            aria-label="Motion sensitivity threshold"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>Very sensitive</span>
            <span>Less sensitive</span>
          </div>
          <p className="text-xs text-zinc-500 mt-2 text-center">
            Lower = triggers on subtle movement
          </p>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🛏️</div>
            <p className="text-xs text-zinc-400 leading-snug">Place flat on your bed or pillow</p>
          </div>
          <div className="glass-card rounded-xl p-3 text-center">
            <div className="text-2xl mb-1">🔊</div>
            <p className="text-xs text-zinc-400 leading-snug">Turn volume up before starting</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
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
              <span className="animate-spin">⏳</span> Requesting permission…
            </span>
          ) : (
            '🛏️ Start Timer & Place on Bed'
          )}
        </button>
      </div>
    </div>
  )
}
