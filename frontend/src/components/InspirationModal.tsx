import { useEffect, useState } from 'react'
import Modal from './Modal'
import TemplateEditorModal from './TemplateEditorModal'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import { generateStory } from '@/data/storyTemplates'

interface Props {
  open: boolean
  onClose: () => void
  targetJournalId?: string
  targetChapterId?: string
}

export default function InspirationModal({
  open,
  onClose,
  targetJournalId,
  targetChapterId,
}: Props) {
  const [story, setStory] = useState('')
  const [generating, setGenerating] = useState(false)
  const [variations, setVariations] = useState<string[]>([])
  const [templateEditorOpen, setTemplateEditorOpen] = useState(false)
  const toast = useUIStore((s) => s.toast)
  const createEntry = useJournalStore((s) => s.createEntry)

  /** 是否有明确的收录目标（由调用方提供，不在此自动推断） */
  const canSave = !!(targetJournalId && targetChapterId)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      const newVariations = Array.from({ length: 4 }, () => generateStory())
      setVariations(newVariations)
      setStory(newVariations[0])
      setGenerating(false)
    }, 500)
  }

  const handleSelectVariation = (text: string) => {
    setStory(text)
  }

  const handleSaveAsEntry = async () => {
    if (!story) {
      toast('请先生成一段灵感')
      return
    }
    if (!canSave) return

    await createEntry(targetJournalId!, targetChapterId!, {
      title: '灵感偶拾',
      subtitle: '— from 灵感阁 —',
      content: `<p>${story}</p>`,
      tags: ['灵感', '生成'],
      date: Date.now(),
    })
    toast('已收录至笔下')
    onClose()
  }

  const handleCopy = () => {
    if (!story) return
    navigator.clipboard.writeText(story).then(
      () => toast('已复制到剪贴板'),
      () => toast('复制失败，请手动选择'),
    )
  }

  // 打开时重置状态
  useEffect(() => {
    if (open) {
      setStory('')
      setGenerating(false)
      setVariations([])
    }
  }, [open])

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="灵感阁"
        subtitle="— Inspiration Pavilion —"
        widthClass="max-w-[520px]"
      >
        {/* 顶部工具栏 */}
        <div className="mb-3 flex items-center justify-between">
          <span className="font-latin text-[10px] italic tracking-wider text-ink-faded">
            素材可自定义 · 不写死
          </span>
          <button
            type="button"
            onClick={() => setTemplateEditorOpen(true)}
            className="flex items-center gap-1 rounded-book border border-gold/50 bg-[rgba(154,123,58,0.1)] px-2.5 py-1 font-cn text-[11px] text-gold transition-colors hover:bg-[rgba(154,123,58,0.25)]"
          >
            <span>✎</span> 管理素材
          </button>
        </div>

        {/* 生成按钮 */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="btn-ink mb-4 w-full disabled:opacity-60"
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-paper border-t-transparent" />
              墨涌中…
            </span>
          ) : (
            <>
              <span className="text-lg leading-none">✦</span> 偶拾一段灵感
            </>
          )}
        </button>

        {/* 生成的故事展示 */}
        {story && (
          <div className="animate-fadeIn rounded-book border border-margin-line bg-[rgba(154,123,58,0.06)] p-4">
            <div className="mb-2 text-center font-latin text-[11px] italic tracking-wider text-ink-faded">
              · 今日所得 ·
            </div>
            <p className="font-serif text-[15px] leading-[2] text-ink-soft">{story}</p>
          </div>
        )}

        {/* 变体选择 */}
        {variations.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-center font-latin text-[11px] italic tracking-wider text-ink-faded">
              · 其他灵感 ·
            </div>
            <div className="grid grid-cols-2 gap-2">
              {variations.map((v, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectVariation(v)}
                  className={`rounded-book border p-2.5 text-left transition-all hover:border-ink ${
                    story === v
                      ? 'border-accent bg-[rgba(138,47,31,0.08)]'
                      : 'border-margin-line bg-paper-deep/50'
                  }`}
                >
                  <span className="block truncate font-serif text-[12px] leading-relaxed text-ink-soft">
                    {v.slice(0, 28)}…
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 操作按钮 */}
        {story && (
          <div className="animate-fadeIn mt-5 flex justify-end gap-2">
            <button type="button" onClick={handleCopy} className="btn-ghost">
              复制
            </button>
            {canSave && (
              <button type="button" onClick={handleSaveAsEntry} className="btn-ink">
                收录为文
              </button>
            )}
          </div>
        )}

        {/* 底部提示 */}
        <div className="mt-4 text-center font-latin text-[10px] italic leading-relaxed tracking-wide text-ink-faded">
          {canSave
            ? '灵感来自于生活的碎片 · 可收录为日记条目继续创作'
            : '灵感来自于生活的碎片 · 复制后粘贴到日记中继续创作'}
        </div>
      </Modal>

      {/* 素材管理器 */}
      <TemplateEditorModal open={templateEditorOpen} onClose={() => setTemplateEditorOpen(false)} />
    </>
  )
}
