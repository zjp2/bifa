import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useJournalStore } from '@/store/journalStore'
import Modal from './Modal'
import { initialsOf } from '@/utils'

interface Props {
  open: boolean
  onClose: () => void
}

/** 个人信息弹层：展示用户信息 + 我的书架统计 + 退出登录 */
export default function ProfileModal({ open, onClose }: Props) {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const isGuest = useAuthStore((s) => s.isGuest)
  const logout = useAuthStore((s) => s.logout)
  const journals = useJournalStore((s) => s.journals)

  const journalCount = journals.length
  const chapterCount = journals.reduce((s, j) => s + j.chapters.length, 0)
  const entryCount = journals.reduce(
    (s, j) => s + j.chapters.reduce((c, ch) => c + ch.entries.length, 0),
    0,
  )

  const onLogout = () => {
    logout()
    onClose()
    navigate('/login', { replace: true })
  }

  if (!user) return null

  return (
    <Modal open={open} onClose={onClose} title="墨客档案" subtitle="— My Profile —">
      {/* 用户卡 */}
      <div className="mb-5 flex items-center gap-4 rounded-book border border-margin-line bg-[rgba(154,123,58,0.06)] p-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full font-cn text-xl font-medium text-paper shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
          style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}
        >
          {initialsOf(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-cn text-lg font-semibold text-ink">{user.name}</span>
            {isGuest && (
              <span className="rounded-book bg-[rgba(138,47,31,0.1)] px-1.5 py-px font-latin text-[10px] uppercase tracking-wider text-accent">
                guest
              </span>
            )}
          </div>
          <div className="truncate font-latin text-xs italic text-ink-faded">
            {user.email || '—'}
          </div>
        </div>
      </div>

      {/* 我的书架：统计 */}
      <div className="mb-5">
        <div className="modal-label mb-2">
          <span className="mr-1.5 text-gold">§</span> 我的书架
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Stat label="卷" value={journalCount} />
          <Stat label="章" value={chapterCount} />
          <Stat label="则" value={entryCount} />
        </div>
        <button
          onClick={() => {
            onClose()
            navigate('/')
          }}
          className="mt-3 w-full rounded-book border border-margin-line bg-paper-deep px-3 py-2 font-cn text-[13px] text-ink-soft transition-colors hover:bg-paper-shadow hover:text-ink"
        >
          前往书架 →
        </button>
      </div>

      {/* 退出登录 */}
      <div className="mt-6 flex justify-end">
        <button onClick={onLogout} className="btn-ghost text-accent-soft hover:text-accent">
          退出登录
        </button>
      </div>
    </Modal>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-book border border-margin-line bg-paper-deep px-2 py-2.5 text-center">
      <div className="font-latin text-2xl font-semibold text-ink">{value}</div>
      <div className="mt-0.5 font-cn text-[11px] text-ink-faded">{label}</div>
    </div>
  )
}
