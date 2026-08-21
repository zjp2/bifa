import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import Modal from '@/components/Modal'
import ProfileModal from '@/components/ProfileModal'
import BookCover from '@/components/BookCover'
import OpeningBookOverlay from '@/components/OpeningBookOverlay'
import InspirationModal from '@/components/InspirationModal'
import { BOOK_COLORS, type Journal } from '@/types'
import { initialsOf } from '@/utils'
import { getDailyQuote } from '@/data/quotes'

export default function BookshelfPage() {
  const navigate = useNavigate()
  const toast = useUIStore((s) => s.toast)
  const user = useAuthStore((s) => s.user)
  const journals = useJournalStore((s) => s.journals)
  const createJournal = useJournalStore((s) => s.createJournal)
  const deleteJournal = useJournalStore((s) => s.deleteJournal)

  const [modalOpen, setModalOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [inspirationOpen, setInspirationOpen] = useState(false)
  const [openingBook, setOpeningBook] = useState<{ journal: Journal; rect: DOMRect } | null>(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [color, setColor] = useState(BOOK_COLORS[0].value)
  const [coverImage, setCoverImage] = useState<string | null>(null)

  // 获取每日一言
  const dailyQuote = useMemo(() => getDailyQuote(), [])

  // 计算统计数据
  const stats = useMemo(() => {
    let totalEntries = 0
    let totalWords = 0
    let lastWriteDate = 0
    const recentEntries: { title: string; date: number; journalId: string }[] = []

    for (const j of journals) {
      for (const c of j.chapters) {
        for (const e of c.entries) {
          totalEntries++
          const text = e.content.replace(/<[^>]*>/g, '')
          totalWords += text.length
          if (typeof e.date === 'number' && e.date > lastWriteDate) {
            lastWriteDate = e.date
          }
          recentEntries.push({
            title: e.title || '无题',
            date: typeof e.date === 'number' ? e.date : new Date(e.date).getTime(),
            journalId: j.id,
          })
        }
      }
    }

    // 按日期排序，取最近3条
    recentEntries.sort((a, b) => b.date - a.date)
    const recent = recentEntries.slice(0, 3)

    // 计算连续写作天数
    const streakDays = calculateStreak(recentEntries.map((e) => e.date))

    return { totalEntries, totalWords, lastWriteDate, recent, streakDays }
  }, [journals])

  // 进入时确保数据已加载
  useEffect(() => {}, [])

  const openModal = () => {
    setName('')
    setDesc('')
    setColor(BOOK_COLORS[0].value)
    setCoverImage(null)
    setModalOpen(true)
  }

  // 选取图片 → Canvas 压缩 → 转 base64（限制最大 800px，JPEG 质量 0.8）
  const onPickCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      toast('图片不宜超过 5MB')
      return
    }
    const img = new Image()
    img.onload = () => {
      const MAX = 800
      let { width, height } = img
      if (width > MAX || height > MAX) {
        const ratio = Math.min(MAX / width, MAX / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
      setCoverImage(dataUrl)
    }
    img.onerror = () => toast('图片加载失败')
    img.src = URL.createObjectURL(file)
    e.target.value = ''
  }

  const confirmCreate = async () => {
    if (!name.trim()) {
      toast('请为日记本命名')
      return
    }
    try {
      const j = await createJournal({ name: name.trim(), description: desc.trim(), color, coverImage })
      setModalOpen(false)
      toast(`已立卷《${j.name}》`)
      navigate(`/journal/${j.id}`)
    } catch (e: any) {
      toast('创建失败：' + (e?.response?.data?.message || e.message || '未知错误'))
    }
  }

  const onDelete = async (b: Journal, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`确定撕去《${b.name}》全卷？`)) {
      await deleteJournal(b.id)
      toast('已撕去此卷')
    }
  }

  const onOpen = (b: Journal, e: React.MouseEvent) => {
    if (openingBook) return
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setOpeningBook({ journal: b, rect })
    window.setTimeout(() => {
      navigate(`/journal/${b.id}`)
    }, 1220)
  }

  const totalCount = useMemo(
    () => journals.reduce((s, b) => s + b.chapters.reduce((c, ch) => c + ch.entries.length, 0), 0),
    [journals],
  )

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return '今日'
    if (days === 1) return '昨日'
    if (days < 7) return `${days}日前`
    return `${d.getMonth() + 1}月${d.getDate()}日`
  }

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

      {/* 今日仪表盘 */}
      {journals.length > 0 && (
        <section className="mx-auto max-w-[1100px] px-4 pb-6 md:px-10">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
            {/* 每日一言 */}
            <div className="animate-fadeIn rounded-book border border-margin-line bg-[rgba(255,251,240,0.7)] p-4 md:p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-latin text-xs tracking-wider text-gold">❦</span>
                <span className="font-latin text-[11px] italic uppercase tracking-[3px] text-ink-faded">
                  每日一言
                </span>
              </div>
              <p className="mb-2 font-cn text-[14px] leading-[1.8] text-ink md:text-[15px]">
                {dailyQuote.text}
              </p>
              <p className="font-latin text-[11px] italic text-ink-faded">— {dailyQuote.author}</p>
            </div>

            {/* 写作统计 */}
            <div className="animate-fadeIn rounded-book border border-margin-line bg-[rgba(255,251,240,0.7)] p-4 md:p-5" style={{ animationDelay: '0.1s' }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-latin text-xs tracking-wider text-gold">§</span>
                <span className="font-latin text-[11px] italic uppercase tracking-[3px] text-ink-faded">
                  写作统计
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center">
                  <div className="font-latin text-xl font-semibold text-ink md:text-2xl">
                    {stats.totalEntries}
                  </div>
                  <div className="font-cn text-[10px] text-ink-faded">则日记</div>
                </div>
                <div className="text-center">
                  <div className="font-latin text-xl font-semibold text-ink md:text-2xl">
                    {stats.streakDays}
                  </div>
                  <div className="font-cn text-[10px] text-ink-faded">日连续</div>
                </div>
                <div className="text-center">
                  <div className="font-latin text-xl font-semibold text-ink md:text-2xl">
                    {stats.totalWords > 9999 ? `${Math.floor(stats.totalWords / 1000)}k` : stats.totalWords}
                  </div>
                  <div className="font-cn text-[10px] text-ink-faded">字成文</div>
                </div>
              </div>
            </div>

            {/* 最近日记 */}
            <div className="animate-fadeIn rounded-book border border-margin-line bg-[rgba(255,251,240,0.7)] p-4 md:p-5" style={{ animationDelay: '0.2s' }}>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-latin text-xs tracking-wider text-gold">·</span>
                <span className="font-latin text-[11px] italic uppercase tracking-[3px] text-ink-faded">
                  近日所记
                </span>
              </div>
              {stats.recent.length > 0 ? (
                <div className="space-y-2">
                  {stats.recent.map((e, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        navigate(`/journal/${e.journalId}`)
                      }}
                      className="flex w-full items-center justify-between gap-2 rounded-book px-2 py-1.5 text-left transition-colors hover:bg-[rgba(154,123,58,0.08)]"
                    >
                      <span className="truncate font-cn text-[13px] text-ink-soft">
                        {e.title}
                      </span>
                      <span className="shrink-0 font-latin text-[10px] italic text-ink-faded">
                        {formatDate(e.date)}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="font-serif text-[13px] italic text-ink-faded">尚未落笔，静待第一篇</p>
              )}
            </div>
          </div>
        </section>
      )}

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
          {/* 灵感阁入口 */}
          <button
            onClick={() => setInspirationOpen(true)}
            title="灵感阁"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gold bg-[rgba(154,123,58,0.15)] text-gold transition-all hover:scale-105 hover:bg-[rgba(154,123,58,0.3)] md:h-9 md:w-9"
          >
            <span className="text-sm md:text-base">✦</span>
          </button>
          {/* 用户头像 */}
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
          <div className="col-span-full py-10 text-center text-ink-faded">
            {/* 空状态 - 更丰富的引导 */}
            <div className="mb-6 animate-fadeIn">
              <div className="mb-3 font-latin text-[60px] text-margin-line md:text-[80px]">❦</div>
              <h3 className="mb-2.5 font-latin text-xl italic text-ink-soft md:text-2xl">书架空空，静待第一卷</h3>
              <p className="mx-auto max-w-[280px] font-serif text-sm leading-relaxed">
                笔墨纸砚已备，只欠你的第一篇文字
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <button onClick={openModal} className="btn-ink">
                <span className="font-latin text-[16px]">+</span> 立第一卷
              </button>
              <button onClick={() => setInspirationOpen(true)} className="btn-ghost">
                <span className="text-gold">✦</span> 前往灵感阁
              </button>
            </div>
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

      {/* 灵感阁弹层 */}
      <InspirationModal open={inspirationOpen} onClose={() => setInspirationOpen(false)} />

      {/* 书翻开浮层 */}
      {openingBook && (
        <OpeningBookOverlay journal={openingBook.journal} startRect={openingBook.rect} />
      )}
    </div>
  )
}

/** 计算连续写作天数 */
function calculateStreak(dates: number[]): number {
  if (dates.length === 0) return 0

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayTime = today.getTime()

  // 将所有日期按天分组（去重）
  const daySet = new Set<string>()
  for (const d of dates) {
    const date = new Date(d)
    date.setHours(0, 0, 0, 0)
    daySet.add(date.getTime().toString())
  }

  let streak = 0
  let currentDay = todayTime

  while (daySet.has(currentDay.toString())) {
    streak++
    currentDay -= 24 * 60 * 60 * 1000
  }

  return streak
}
