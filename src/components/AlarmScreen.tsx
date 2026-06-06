interface AlarmScreenProps {
  onStop: () => void
  triggerCount: number
}

export function AlarmScreen({ onStop, triggerCount }: AlarmScreenProps) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-between alarm-overlay z-50"
      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)' }}
    >
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
        {/* Icon */}
        <div className="relative">
          <div className="text-9xl animate-shake">🚨</div>
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping" style={{ animationDuration: '0.8s' }} />
        </div>

        {/* Warning text */}
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tight leading-none">
            WAKE UP!
          </h1>
          <p className="text-red-200 text-xl font-bold">
            Movement detected!
          </p>
        </div>

        {/* Flash rings */}
        <div className="relative flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-4 border-red-300/40 animate-ping" style={{ animationDuration: '1s' }} />
          <div className="absolute w-28 h-28 rounded-full border-4 border-red-200/40 animate-ping" style={{ animationDuration: '0.7s' }} />
          <div className="absolute flex flex-col items-center">
            <span className="text-white text-3xl font-black">{triggerCount}×</span>
            <span className="text-red-200 text-xs">triggered</span>
          </div>
        </div>

        {/* Message */}
        <div className="glass-card rounded-2xl px-6 py-4 border border-red-400/30" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <p className="text-red-100 text-sm leading-relaxed">
            You moved! Get up now — don't let yourself fall back asleep!
          </p>
        </div>
      </div>

      {/* Stop button */}
      <div className="w-full px-6 pb-12 safe-bottom pt-6">
        <button
          id="stop-alarm-btn"
          onClick={onStop}
          className="w-full py-5 rounded-2xl bg-white text-red-600 font-black text-xl tracking-tight shadow-2xl active:scale-95 transition-transform duration-100"
          style={{ boxShadow: '0 0 40px rgba(255,255,255,0.3)' }}
        >
          ✋ I'm Awake — Stop Alarm
        </button>
      </div>
    </div>
  )
}
