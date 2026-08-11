import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import Modal from '@/components/Modal'
import ProfileModal from '@/components/ProfileModal'
import BookCover from '@/components/BookCover'
import OpeningBookOverlay from '@/components/OpeningBookOverlay'
import { BOOK_COLORS, type Journal } from '@/types'
import { initialsOf } from '@/utils'

export default function BookshelfPage() {
  const navigate = useNavigate()
  const toast = useUIStore((s) => s.toast)
  const user = useAuthStore((s) => s.user)
  const journals = useJournalStore((s) => s.journals)
  const createJournal = useJournalStore((s) => s.createJournal)
  const deleteJournal = useJournalStore((s) => s.deleteJournal)

  const [modalOpen, setModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [openingBook, setOpeningBook] = useState<{ journal: Journal; rect: DOMRect } | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(BOOK_COLORS[0].value)
  const [coverImage, setCoverImage] = useState<string | null>(null)

  // 进入时确保数据已加载
  useEffect(() => {
    // init 由 App 在登录后触发；此处仅兜底
  }, [])

  const openModal = () => {
    setName('')
    setDesc('')
    setColor(BOOK_COLORS[0].value)
    setCoverImage(null)
    setModalOpen(true)
  }

  // 选取图片 → 转 base64
  const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 3 * 1024 * 1024) {
      toast('图片不宜超过 3MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setCoverImage(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const confirmCreate = async () => {
    if (!name.trim()) {
      toast('请为日记本命名')
      return
    }
    const j = await createJournal({ name: name.trim(), description: desc.trim(), color, coverImage })
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

  const onOpen = (b: Journal, e: React.MouseEvent) => {
    if (openingBook) return // 防止动画期间重复点击
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOpeningBook({ journal: b, rect })
    // 推近 0.45s + 停顿 0.08s + 翻开 0.75s ≈ 1.28s，在翻开快结束时导航
    window.setTimeout(() => {
      navigate(`/journal/${b.id}`)
    }, 1220)
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
      <header className="relative px-5 pb-5 pt-10 text-center md:px-10 md:pb-8 md:pt-[60px]">
        <div
          className="font-brush text-[48px] leading-none text-ink md:text-[72px]"
          style={{ letterSpacing: '8px', textShadow: '2px 2px 0 rgba(154,123,58,0.15)' }}
        >
          墨笺
        </div>
        <div className="mt-2 font-latin text-[14px] uppercase tracking-[6px] text-ink-faded md:text-[18px] md:tracking-[8px]">
          Inkwell Journal
        </div>
        <div className="mt-2 font-latin text-[13px] italic tracking-wide text-ink-soft md:mt-3.5 md:text-[15px]">
          笔墨随心动 <span className="text-accent">❦</span> 纸上记光阴
        </div>
        <div className="mx-auto mt-4 h-px w-24 bg-gradient-to-r from-transparent via-margin-line to-transparent md:mt-6 md:w-30" />
      </header>

      {/* 工具栏 */}
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-5 pb-3 md:px-10 md:pb-6">
        <h2 className="flex items-center gap-2 font-latin text-lg font-semibold text-ink md:gap-2.5 md:text-2xl">
          <span className="text-gold">§</span>
          我的书架
          <span className="hidden font-latin text-xs italic font-normal text-ink-faded sm:inline md:text-sm">
            · {journals.length} 卷 · {totalCount} 则
          </span>
        </h2>

        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {/* 用户头像：点击打开个人信息 */}
          {user && (
            <button
              onClick={() => setProfileOpen(true)}
              title="个人信息"
              className="avatar-pulse flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-cn text-[12px] font-medium text-paper transition-transform hover:scale-105 md:h-9 md:w-9 md:text-[13px]"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}
            >
              {initialsOf(user.name)}
            </button>
          )}
          <button onClick={openModal} className="btn-ink !px-3 !py-2 text-xs md:!px-5 md:!py-2.5 md:text-sm">
            <span className="font-latin text-[16px] leading-none md:text-[18px]">+</span> 新立
          </button>
        </div>
      </div>

      {/* 书卡网格 */}
      <main className="mx-auto grid max-w-[1100px] grid-cols-2 gap-3 px-5 pb-10 sm:grid-cols-3 sm:gap-x-6 sm:gap-y-8 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] md:gap-x-9 md:gap-y-10 md:px-10 md:pb-20">
        {journals.length === 0 ? (
          <div className="col-span-full py-20 text-center text-ink-faded">
            <div className="mb-5 font-latin text-[60px] text-margin-line md:text-[80px]">❦</div>
            <h3 className="mb-2.5 font-latin text-xl italic text-ink-soft md:text-2xl">书架空空，静待第一卷</h3>
            <p className="font-serif text-sm leading-relaxed">
              点击右上角"新立一卷"，开启你的第一本日记。
            </p>
          </div>
        ) : (
          journals.map((b, idx) => {
            const isHidden = openingBook?.journal.id === b.id
            return (
              <div
                key={b.id}
                onClick={(e) => onOpen(b, e)}
                className={`group relative cursor-pointer animate-bookIn ${isHidden ? 'opacity-0' : ''}`}
                style={{ perspective: '1000px', animationDelay: `${idx * 0.08}s` }}
              >
                <button
                  onClick={(e) => onDelete(b, e)}
                  title="删除此卷"
                  className="absolute -right-1 -top-1 z-[5] flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-paper bg-ink text-[12px] text-paper opacity-0 transition-all hover:scale-110 hover:bg-accent group-hover:opacity-100 sm:-right-2 sm:-top-2 sm:h-[26px] sm:w-[26px] sm:text-[14px]"
                >
                  ×
                </button>
                <div
                  className="relative h-[180px] transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:[transform:rotateY(-8deg)] sm:h-[240px] md:h-[300px]"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <BookCover journal={b} />
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
        {/* 封面图上传 */}
        <div className="mb-2">
          <label className="modal-label">封面图（可选）</label>
          <div className="mt-1.5 flex items-center gap-3">
            {/* 预览框 */}
            <div
              className="relative flex h-[60px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] border-2"
              style={{
                background: `linear-gradient(135deg, ${color} 0%, rgba(0,0,0,0.4) 100%)`,
                borderColor: 'var(--margin-line)',
              }}
            >
              {coverImage ? (
                <img src={coverImage} alt="封面预览" className="h-full w-full object-cover" />
              ) : (
                <span className="font-latin text-[10px] italic text-[rgba(243,234,215,0.6)]">空</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="btn-ghost cursor-pointer text-[13px]">
                选取图像
                <input type="file" accept="image/*" onChange={onPickCover} className="hidden" />
              </label>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage(null)}
                  className="text-[12px] text-ink-faded underline-offset-2 hover:text-accent hover:underline"
                >
                  移除
                </button>
              )}
              <span className="font-serif text-[11px] leading-tight text-ink-faded">
                图片将嵌于封面中央，保留封面色边框
              </span>
            </div>
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

      {/* 个人信息弹层 */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* 书翻开浮层：镜头推近 + 翻开封面 */}
      {openingBook && (
        <OpeningBookOverlay journal={openingBook.journal} startRect={openingBook.rect} />
      )}
    </div>
  )
}
