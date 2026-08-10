import { useUIStore } from '@/store/uiStore'

/** 右下角通知条 */
export default function ToastHost() {
  const toasts = useUIStore((s) => s.toasts)
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[200] flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-fadeIn pointer-events-auto rounded-book border border-gold bg-shelf px-5 py-3
            font-cn text-[13px] tracking-wider text-paper shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
