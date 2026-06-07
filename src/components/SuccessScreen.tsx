interface SuccessScreenProps {
  durationSeconds: number
  alarmCount: number
  onReset: () => void
}

function formatDuration(totalSec: number): string {
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) return `${h}時間${m > 0 ? `${m}分` : ''}`
  if (m > 0) return `${m}分${s > 0 ? `${s}秒` : ''}`
  return `${s}秒`
}

export function SuccessScreen({ durationSeconds, alarmCount, onReset }: SuccessScreenProps) {
  return (
    <div className="flex flex-col h-full items-center justify-between animate-fade-in"
      style={{ background: 'linear-gradient(160deg, #09090b 0%, #052e16 60%, #09090b 100%)' }}
    >
      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6 text-center">
        {/* 成功アイコン */}
        <div className="relative">
          <div className="text-9xl animate-bounce-slow">☀️</div>
          <div className="absolute -inset-4 rounded-full bg-yellow-400/10 animate-ping" style={{ animationDuration: '2s' }} />
        </div>

        {/* 成功メッセージ */}
        <div className="space-y-3 animate-slide-up">
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
            スッキリ<br />
            <span className="text-green-400">目覚めました！</span>
          </h1>
          <p className="text-zinc-400 text-base">
            タイマー完了 ✓
          </p>
        </div>

        {/* セッション統計 */}
        <div className="w-full glass-card rounded-2xl p-5 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">セッション時間</span>
            <span className="text-white font-bold">{formatDuration(durationSeconds)}</span>
          </div>
          <div className="h-px bg-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">アラーム回数</span>
            <span className={`font-bold ${alarmCount === 0 ? 'text-green-400' : 'text-amber-400'}`}>
              {alarmCount === 0 ? '🏆 なし！' : `${alarmCount}回`}
            </span>
          </div>
          <div className="h-px bg-zinc-800" />
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-sm">結果</span>
            <span className={`font-bold text-sm ${alarmCount === 0 ? 'text-green-400' : 'text-amber-400'}`}>
              {alarmCount === 0 ? '✨ 完璧なセッション！' : '💪 よく頑張りました！'}
            </span>
          </div>
        </div>

        {/* 一言メッセージ */}
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <p className="text-zinc-500 text-sm italic">
            {alarmCount === 0
              ? '「二度寝ゼロ — 朝の勇者です！🌟」'
              : '「乗り越えました — その調子で習慣を続けましょう！💪」'
            }
          </p>
        </div>
      </div>

      {/* 戻るボタン */}
      <div className="w-full px-5 pb-8 safe-bottom pt-4 border-t border-zinc-800/50">
        <button
          id="reset-btn"
          onClick={onReset}
          className="w-full py-5 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-black text-lg tracking-tight shadow-xl active:scale-95 transition-all duration-200"
        >
          🔁 新しいセッションを開始
        </button>
      </div>
    </div>
  )
}
