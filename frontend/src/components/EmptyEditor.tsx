import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import InspirationModal from './InspirationModal'
import { getDailyQuote } from '@/data/quotes'

/** 书内页未选中条目时的空状态 - 增强版 */
export default function EmptyEditor() {
  const { journalId } = useParams()
  const navigate = useNavigate()
  const journals = useJournalStore((s) => s.journals)
  const createChapter = useJournalStore((s) => s.createChapter)
  const createEntry = useJournalStore((s) => s.createEntry)
  const toast = useUIStore((s) => s.toast)

  const [inspirationOpen, setInspirationOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const dailyQuote = getDailyQuote()

  const journal = journals.find((j) => j.id === journalId)
  const firstChapter = journal?.chapters[0]

  const handleQuickCreate = async () => {
    if (!journalId) return
    setCreating(true)
    try {
      let chapterId = firstChapter?.id
      if (!chapterId) {
        const newChapter = await createChapter(journalId, '新章节')
        chapterId = newChapter?.id
      }
      if (chapterId) {
        const entry = await createEntry(journalId, chapterId, {
          title: '新的一页',
          date: Date.now(),
          content: '',
          tags: [],
        })
        if (entry) {
          toast('已开启新的一页')
          navigate(`/journal/${journalId}/entry/${entry.id}`)
        }
      }
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-12 text-center md:py-20">
      {/* 装饰性元素 */}
      <div className="animate-fadeIn mb-6">
        <div className="mb-4 font-latin text-[56px] text-margin-line md:text-[72px]">❦</div>
        <h3 className="mb-3 font-latin text-2xl font-normal italic text-ink-soft md:text-3xl">
          静待落笔之时
        </h3>
        <p className="mx-auto max-w-[340px] font-serif text-sm leading-relaxed text-ink-faded">
          选取左侧章节中的一篇，或新建一则，让心绪沉淀于纸上
        </p>
      </div>

      {/* 每日一言 */}
      <div className="animate-fadeIn mb-8 max-w-[320px] rounded-book border border-margin-line bg-[rgba(255,251,240,0.6)] px-4 py-3" style={{ animationDelay: '0.1s' }}>
        <p className="mb-1 font-cn text-[13px] leading-[1.7] text-ink-soft">{dailyQuote.text}</p>
        <p className="font-latin text-[10px] italic text-ink-faded">— {dailyQuote.author}</p>
      </div>

      {/* 操作按钮 */}
      <div className="animate-fadeIn flex flex-col gap-3" style={{ animationDelay: '0.2s' }}>
        <button
          onClick={handleQuickCreate}
          disabled={creating}
          className="btn-ink w-full min-w-[180px] disabled:opacity-60"
        >
          {creating ? '· · ·' : '✎  新开一则'}
        </button>
        <button
          onClick={() => setInspirationOpen(true)}
          className="btn-ghost w-full min-w-[180px]"
        >
          <span className="text-gold">✦</span>  前往灵感阁
        </button>
      </div>

      {/* 底部提示 */}
      <div className="animate-fadeIn mt-8 font-latin text-[11px] italic tracking-wide text-ink-faded" style={{ animationDelay: '0.3s' }}>
        笔墨已备 · 只待你的故事
      </div>

      {/* 灵感阁弹层 */}
      <InspirationModal
        open={inspirationOpen}
        onClose={() => setInspirationOpen(false)}
        targetJournalId={journal?.id}
        targetChapterId={firstChapter?.id}
      />
    </div>
  )
}
