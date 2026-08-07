import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import Modal from '@/components/Modal'
import { BOOK_COLORS, type Journal } from '@/types'
import { initialsOf } from '@/utils'

export default function BookshelfPage() {
  const navigate = useNavigate()
  const toast = useUIStore((s) => s.toast)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const journals = useJournalStore((s) => s.journals)
  const createJournal = useJournalStore((s) => s.createJournal)
  const deleteJournal = useJournalStore((s) => s.deleteJournal)

  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(BOOK_COLORS[0].value)

  // 进入时确保数据已加载
  useEffect(() => {
    // init 由 App 在登录后触发；此处仅兜底
  }, [])

  const openModal = () => {
    setName('')
    setDesc('')
    setColor(BOOK_COLORS[0].value)
    setModalOpen(true)
  }

  const confirmCreate = async () => {
    if (!name.trim()) {
      toast('请为日记本命名')
      return
    }
    const j = await createJournal({ name: name.trim(), description: desc.trim(), color })
    setModalOpen(false)
    toast(`已立卷《${j.name}》`)
    navigate(`/journal/${j.id}`)
  }

  const onDelete = async (b: Journal, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`确定撕去《${b.name}》全卷？`)) {
      await deleteJournal(b.id)
      toast('已撕去此卷')
    }
  }

  const onOpen = (b: Journal) => {
    navigate(`/journal/${b.id}`)
  }

  const totalCount = useMemo(
    () => journals.reduce((s, b) => s + b.chapters.reduce((c, ch) => c + ch.entries.length, 0), 0),
    [journals],
  )

  return (
    <div
      className="h-[100dvh] w-full overflow-y-auto"
      style={{ background: 'linear-gradient(180deg, var(--paper) 0%, var(--paper-deep) 100%)' }}
    >
      {/* 品牌头 */}
      <header className="relative px-10 pb-8 pt-[60px] text-center">
        <div
          className="font-brush text-[72px] leading-none text-ink"
          style={{ letterSpacing: '8px', textShadow: '2px 2px 0 rgba(154,123,58,0.15)' }}
        >
          墨笺
        </div>
        <div className="mt-2 font-latin text-[18px] uppercase tracking-[8px] text-ink-faded">
          Inkwell Journal
        </div>
        <div className="mt-3.5 font-latin text-[15px] italic tracking-wide text-ink-soft">
          笔墨随心动 <span className="text-accent">❦</span> 纸上记光阴
        </div>
        <div className="mx-auto mt-6 h-px w-30 bg-gradient-to-r from-transparent via-margin-line to-transparent" />
      </header>

      {/* 工具栏 */}
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-10 pb-6">
        <h2 className="flex items-center gap-2.5 font-latin text-2xl font-semibold text-ink">
          <span className="text-gold">§</span>
          我的书架
          <span className="ml-1.5 font-latin text-sm italic font-normal text-ink-faded">
            · {journals.length} 卷 · {totalCount} 则
          </span>
        </h2>

        <div className="flex items-center gap-3">
          {/* 用户头像 + 登出（桌面） */}
          {user && (
            <div className="hidden items-center gap-3 md:flex">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full font-cn text-[13px] font-medium text-paper"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}
                title={user.email}
              >
                {initialsOf(user.name)}
              </div>
              <button
                onClick={() => {
                  logout()
                  navigate('/login', { replace: true })
                }}
                className="btn-ghost"
              >
                退出
              </button>
            </div>
          )}
          <button onClick={openModal} className="btn-ink">
            <span className="font-latin text-[18px] leading-none">+</span> 新立一卷
          </button>
        </div>
      </div>

      {/* 书卡网格 */}
      <main className="mx-auto grid max-w-[1100px] grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-x-9 gap-y-10 px-10 pb-20">
        {journals.length === 0 ? (
          <div className="col-span-full py-20 text-center text-ink-faded">
            <div className="mb-5 font-latin text-[80px] text-margin-line">❦</div>
            <h3 className="mb-2.5 font-latin text-2xl italic text-ink-soft">书架空空，静待第一卷</h3>
            <p className="font-serif text-sm leading-relaxed">
              点击右上角"新立一卷"，开启你的第一本日记。
            </p>
          </div>
        ) : (
          journals.map((b, idx) => {
            const entryCount = b.chapters.reduce((s, c) => s + c.entries.length, 0)
            return (
              <div
                key={b.id}
                onClick={() => onOpen(b)}
                className="group relative cursor-pointer animate-bookIn"
                style={{ perspective: '1000px', animationDelay: `${idx * 0.08}s` }}
              >
                <button
                  onClick={(e) => onDelete(b, e)}
                  title="删除此卷"
                  className="absolute -right-2 -top-2 z-[5] flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 border-paper bg-ink text-[14px] text-paper opacity-0 transition-all hover:scale-110 hover:bg-accent group-hover:opacity-100"
                >
                  ×
                </button>
                <div
                  className="relative h-[300px] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:[transform:rotateY(-8deg)]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="relative flex h-full flex-col overflow-hidden rounded-r-[6px] rounded-l-[2px] p-5 pl-7 text-paper"
                    style={{
                      background: `linear-gradient(135deg, ${b.color} 0%, rgba(0,0,0,0.5) 100%)`,
                      boxShadow:
                        'inset 4px 0 0 rgba(255,255,255,0.1), inset -2px 0 8px rgba(0,0,0,0.4), 4px 6px 16px rgba(0,0,0,0.3), 8px 10px 24px rgba(0,0,0,0.15)',
                    }}
                  >
                    {/* 装订线 */}
                    <div className="absolute left-2.5 top-0 bottom-0 w-px bg-white/20" />
                    {/* 内描边 */}
                    <div className="pointer-events-none absolute inset-2 left-4 rounded-[2px] border border-white/15" />
                    <div className="mb-1.5 text-center font-latin text-[24px] text-white/40">❦</div>
                    <h3
                      className="text-center font-brush text-[28px] font-semibold leading-tight text-paper"
                      style={{ letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
                    >
                      {b.name}
                    </h3>
                    <p className="mt-2 flex-1 text-center font-latin text-[13px] italic leading-relaxed text-[rgba(243,234,215,0.75)]">
                      {b.desc || b.description || ''}
                    </p>
                    <div className="mt-auto flex justify-between border-t border-white/15 pt-2.5 font-latin text-[11px] italic tracking-wide text-[rgba(243,234,215,0.7)]">
                      <span>{b.chapters.length} 章</span>
                      <span>{entryCount} 则</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </main>

      {/* 新建日记本弹层 */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="新立一卷"
        subtitle="— A New Volume —"
      >
        <div className="mb-4">
          <label className="modal-label">日记本之名</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmCreate()}
            placeholder="例如：随想录、旅次手记"
            autoFocus
            className="modal-input"
          />
        </div>
        <div className="mb-4">
          <label className="modal-label">题记</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmCreate()}
            placeholder="一句话简介"
            className="modal-input"
          />
        </div>
        <div className="mb-2">
          <label className="modal-label">封面色</label>
          <div className="mt-1.5 flex flex-wrap gap-2.5">
            {BOOK_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.name}
                onClick={() => setColor(c.value)}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  color === c.value ? 'scale-110 border-ink' : 'border-transparent'
                }`}
                style={{
                  background: c.value,
                  boxShadow: 'inset 0 -3px 6px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={() => setModalOpen(false)} className="btn-ghost">
            取消
          </button>
          <button onClick={confirmCreate} className="btn-ink">
            立卷
          </button>
        </div>
      </Modal>
    </div>
  )
}
