import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} widthClass="max-w-[360px]">
      <h3 className="mb-2 text-center font-cn text-lg font-semibold text-ink">{title}</h3>
      <p className="mb-6 text-center text-sm text-ink-muted">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-ink-line/60 bg-paper-soft py-2 text-sm text-ink-muted transition hover:bg-ink-line/20"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`flex-1 rounded-lg py-2 text-sm text-paper shadow-md transition ${
            danger
              ? 'bg-ink-danger hover:bg-ink-danger/90'
              : 'bg-ink-accent hover:bg-ink-accent/90'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
}
