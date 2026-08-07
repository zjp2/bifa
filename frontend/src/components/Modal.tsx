import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  /** 自定义容器宽度类 */
  widthClass?: string
}

/** 古籍手札风格模态弹层 */
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  widthClass = 'max-w-[440px]',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(20,12,6,0.65)] p-4 backdrop-blur-[4px] animate-backdropIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className={`modal-card ${widthClass}`}>
        {title && (
          <h3 className="mb-1.5 text-center font-latin text-2xl font-semibold text-ink">{title}</h3>
        )}
        {subtitle && (
          <p className="mb-6 text-center font-latin italic text-xs tracking-wider text-ink-faded">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  )
}
