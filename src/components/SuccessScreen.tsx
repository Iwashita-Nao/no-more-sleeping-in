interface SuccessScreenProps {
  durationMinutes: number
  alarmCount: number
  onReset: () => void
}

export function SuccessScreen({ durationMinutes, alarmCount, onReset }: SuccessScreenProps) {
  return (
    <div className="flex flex-col h-full items-center justify-between animate-fade-in"
      style={{ background: 'linear-gradient(160deg, #09090b 0%, #052e16 60%, #09090b 100%)' }}
    >
      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
        {/* Success icon with glow */}
        <div className="relative">
          <div className="text-9xl animate-bounce-slow">☀️</div>
          <div className="absolute -inset-4 rounded-full bg-yellow-400/10 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* Success message */}
        <div className="space-y-3 animate-slide-up">
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            You woke up<br />
            <span className="text-green-400">feeling refreshed!</span>
          </h1>
          <p className="text-zinc-400 text-base">
            Timer complete ✓
          </p>
        </div>

        {/* Stats */}
        <div className="w-full glass-card rounded-2xl p-5 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Session Duration</span>
            <span className="text-white font-bold">{durationMinutes} minutes</span>
          </div>
          <div className="h-px bg-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Times Woken Up</span>
            <span className={`font-bold ${alarmCount === 0 ? 'text-green-400' : 'text-amber-400'}`}>
              {alarmCount === 0 ? '🏆 None!' : `${alarmCount}×`}
            </span>
          </div>
          <div className="h-px bg-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">Result</span>
            <span className={`font-bold text-sm ${alarmCount === 0 ? 'text-green-400' : 'text-amber-400'}`}>
              {alarmCount === 0 ? '✨ Perfect Session!' : '💪 You made it!'}
            </span>
          </div>
        </div>

        {/* Motivational message */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-zinc-500 text-sm italic">
            {alarmCount === 0
              ? '"No snoozing — you\u2019re a morning champion! 🌟"'
              : '"You pushed through — keep building that habit! 💪"'
            }
          </p>
        </div>
      </div>

      {/* Back button */}
      <div className="w-full px-5 pb-8 safe-bottom pt-4 border-t border-zinc-800/50">
        <button
          id="reset-btn"
          onClick={onReset}
          className="w-full py-5 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-black text-lg tracking-tight shadow-xl glow-green active:scale-95 transition-all duration-200"
        >
          🔁 Start New Session
        </button>
      </div>
    </div>
  )
}
