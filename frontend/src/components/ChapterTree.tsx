import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import Modal from '@/components/Modal'
import type { Chapter, Journal } from '@/types'

interface Props {
  journal: Journal
  /** 移动端选中条目后关闭抽屉 */
  onNavigate?: () => void
}

/** 章节树：可折叠 / 重命名 / 删除 / 显示条目数；点击条目进入编辑 */
export default function ChapterTree({ journal, onNavigate }: Props) {
  const navigate = useNavigate()
  const { entryId } = useParams()
  const toast = useUIStore((s) => s.toast)
  const collapsed = useJournalStore((s) => s.collapsedChapters)
  const toggleChapter = useJournalStore((s) => s.toggleChapter)
  const createChapter = useJournalStore((s) => s.createChapter)
  const renameChapter = useJournalStore((s) => s.renameChapter)
  const deleteChapter = useJournalStore((s) => s.deleteChapter)
  const createEntry = useJournalStore((s) => s.createEntry)
  const deleteEntry = useJournalStore((s) => s.deleteEntry)

  const [newChapterOpen, setNewChapterOpen] = useState(false)
  const [chapterName, setChapterName] = useState('')
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null)
  const [renameVal, setRenameVal] = useState('')

  const openNewChapter = () => {
    setChapterName('')
    setNewChapterOpen(true)
  }

  const confirmNewChapter = async () => {
    if (!chapterName.trim()) {
      toast('请为章节命名')
      return
    }
    const c = await createChapter(journal.id, chapterName.trim())
    setNewChapterOpen(false)
    if (c) toast(`已建章"${c.name}"`)
  }

  const openRename = (c: Chapter) => {
    setRenameTarget({ id: c.id, name: c.name })
    setRenameVal(c.name)
    setRenameOpen(true)
  }

  const confirmRename = async () => {
    if (!renameTarget) return
    if (!renameVal.trim()) {
      toast('名称不可为空')
      return
    }
    await renameChapter(renameTarget.id, renameVal.trim())
    setRenameOpen(false)
    toast('已更名')
  }

  const onDeleteChapter = async (c: Chapter, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`删除章节"${c.name}"及 ${c.entries.length} 则？`)) {
      await deleteChapter(c.id)
      toast('已删除章节')
    }
  }

  const onAddEntry = async (c: Chapter, e: React.MouseEvent) => {
    e.stopPropagation()
    const entry = await createEntry(journal.id, c.id)
    if (entry) {
      toggleChapter(c.id) // 展开
      navigate(`/journal/${journal.id}/entry/${entry.id}`)
      onNavigate?.()
    }
  }

  const onEntryClick = (entryIdVal: string) => {
    navigate(`/journal/${journal.id}/entry/${entryIdVal}`)
    onNavigate?.()
  }

  const onDeleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('撕去此页？')) {
      await deleteEntry(id)
      if (entryId === id) navigate(`/journal/${journal.id}`)
      toast('已撕去此页')
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* 标题区 */}
      <div className="border-b border-[rgba(243,234,215,0.15)] px-[22px] pb-4 pt-[22px]">
        <h2
          className="font-brush text-[26px] leading-tight text-paper"
          style={{ letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
        >
          {journal.name}
        </h2>
        {journal.desc && (
          <p className="mt-1 font-latin text-xs italic tracking-wide text-paper-shadow">
            {journal.desc}
          </p>
        )}
      </div>

      {/* 目录标题 + 新建章节按钮 */}
      <div className="flex items-center justify-between px-[22px] pt-3.5 pb-2">
        <span className="font-latin text-[11px] uppercase tracking-[4px] text-paper-shadow">
          <span className="mr-2 text-gold opacity-70">§</span>
          目录 · Contents
        </span>
        <button
          onClick={openNewChapter}
          title="新建章节"
          className="flex h-[22px] w-[22px] items-center justify-center rounded-full border border-[rgba(243,234,215,0.3)] font-latin text-sm leading-none text-paper transition-all hover:rotate-90 hover:border-gold hover:bg-gold hover:text-shelf-deep"
        >
          +
        </button>
      </div>

      {/* 章节列表 */}
      <div className="flex-1 overflow-y-auto px-3.5 pb-4">
        {journal.chapters.length === 0 ? (
          <div className="px-5 py-7 text-center font-latin text-[13px] italic leading-relaxed text-paper-shadow">
            <span className="mb-1.5 block text-3xl text-[rgba(243,234,215,0.3)]">§</span>
            尚无章节
            <br />
            点击上方"+"新建一章
          </div>
        ) : (
          journal.chapters.map((c, idx) => {
            const isCollapsed = !!collapsed[c.id]
            return (
              <div
                key={c.id}
                className="mb-1 animate-slideInLeft"
                style={{ animationDelay: `${idx * 0.04}s` }}
              >
                {/* 章节头 */}
                <div
                  onClick={() => toggleChapter(c.id)}
                  className="group flex cursor-pointer items-center gap-2 rounded-[3px] border border-transparent px-2.5 py-2.5 transition-colors hover:bg-[rgba(243,234,215,0.05)]"
                >
                  <span
                    className="w-3 flex-shrink-0 text-center font-latin text-xs text-gold transition-transform"
                    style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'none' }}
                  >
                    ▾
                  </span>
                  <span className="flex-1 truncate font-cn text-sm font-medium text-paper">
                    {c.name}
                  </span>
                  <span className="rounded-lg bg-[rgba(243,234,215,0.08)] px-[7px] py-px font-latin text-[11px] italic text-paper-shadow">
                    {c.entries.length}
                  </span>
                  <span className="flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={(e) => onAddEntry(c, e)}
                      title="新建一则"
                      className="rounded-[2px] border-none bg-transparent px-1 py-0.5 font-cn text-[13px] leading-none text-paper-shadow hover:bg-[rgba(243,234,215,0.08)] hover:text-gold"
                    >
                      +
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        openRename(c)
                      }}
                      title="重命名"
                      className="rounded-[2px] border-none bg-transparent px-1 py-0.5 text-[13px] leading-none text-paper-shadow hover:bg-[rgba(243,234,215,0.08)] hover:text-gold"
                    >
                      ✎
                    </button>
                    <button
                      onClick={(e) => onDeleteChapter(c, e)}
                      title="删除章节"
                      className="rounded-[2px] border-none bg-transparent px-1 py-0.5 text-[13px] leading-none text-paper-shadow hover:bg-[rgba(243,234,215,0.08)] hover:text-accent-soft"
                    >
                      ×
                    </button>
                  </span>
                </div>

                {/* 条目列表 */}
                <div
                  className="overflow-hidden transition-[max-height] duration-400"
                  style={{
                    maxHeight: isCollapsed ? 0 : 2000,
                    marginLeft: '18px',
                    paddingLeft: '18px',
                    borderLeft: '1px dashed rgba(243,234,215,0.15)',
                  }}
                >
                  <div className="py-0.5 pb-1.5">
                    {c.entries.length === 0 ? (
                      <div className="px-2.5 py-1.5 font-latin text-xs italic text-paper-shadow opacity-60">
                        — 此章尚无篇章 —
                      </div>
                    ) : (
                      c.entries.map((en) => {
                        const active = en.id === entryId
                        return (
                          <div
                            key={en.id}
                            onClick={() => onEntryClick(en.id)}
                            className={`group relative flex cursor-pointer items-center gap-2 rounded-[3px] border-l-2 px-2.5 py-1.5 transition-all ${
                              active
                                ? 'border-accent bg-[rgba(154,123,58,0.18)]'
                                : 'border-transparent hover:border-gold hover:bg-[rgba(243,234,215,0.05)]'
                            }`}
                          >
                            {active && (
                              <span className="absolute -left-[18px] top-1/2 h-3/5 w-[3px] -translate-y-1/2 rounded-r-[3px] bg-gold" />
                            )}
                            <span
                              className={`h-[5px] w-[5px] flex-shrink-0 rounded-full ${
                                active ? 'bg-gold opacity-100' : 'bg-paper-shadow opacity-60'
                              }`}
                            />
                            <span className="flex-1 truncate font-cn text-[13px] text-paper">
                              {en.title || '无题'}
                            </span>
                            <button
                              onClick={(e) => onDeleteEntry(en.id, e)}
                              title="删除"
                              className="border-none bg-transparent px-1 text-xs text-paper-shadow opacity-0 transition-opacity hover:text-accent-soft group-hover:opacity-100"
                            >
                              ×
                            </button>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* 页脚箴言 */}
      <div className="border-t border-[rgba(243,234,215,0.12)] px-[22px] pt-3.5 pb-[22px] font-latin text-[11px] italic leading-relaxed tracking-wide text-paper-shadow">
        <span className="mr-1 text-[22px] text-gold leading-none align-[-6px]">"</span>
        每一卷书，
        <br />
        都是一段时光的标本。
      </div>

      {/* 新建章节弹层 */}
      <Modal
        open={newChapterOpen}
        onClose={() => setNewChapterOpen(false)}
        title="新建章节"
        subtitle="— A New Chapter —"
      >
        <div className="mb-2">
          <label className="modal-label">章节名</label>
          <input
            type="text"
            value={chapterName}
            onChange={(e) => setChapterName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmNewChapter()}
            placeholder="例如：春日随笔、京都之行"
            autoFocus
            className="modal-input"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={() => setNewChapterOpen(false)} className="btn-ghost">
            取消
          </button>
          <button onClick={confirmNewChapter} className="btn-ink">
            建章
          </button>
        </div>
      </Modal>

      {/* 重命名弹层 */}
      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="重命名章节"
        subtitle="— Rename —"
      >
        <div className="mb-2">
          <label className="modal-label">章节名</label>
          <input
            type="text"
            value={renameVal}
            onChange={(e) => setRenameVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && confirmRename()}
            autoFocus
            className="modal-input"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={() => setRenameOpen(false)} className="btn-ghost">
            取消
          </button>
          <button onClick={confirmRename} className="btn-ink">
            确定
          </button>
        </div>
      </Modal>
    </div>
  )
}
