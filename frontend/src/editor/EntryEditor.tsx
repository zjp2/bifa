import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import { fmtDate } from '@/utils'
import type { Chapter, Entry } from '@/types'
import Modal from '@/components/Modal'
import BubbleToolbar from './BubbleToolbar'
import BottomToolbar from './BottomToolbar'
import { InkCodeBlock, RedMark } from './extensions'

interface Props {
  entry: Entry
  chapter: Chapter | undefined
}

/** 转义代码内容（用于插入 HTML） */
function escapeCodeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function EntryEditor({ entry, chapter }: Props) {
  const toast = useUIStore((s) => s.toast)
  const updateEntry = useJournalStore((s) => s.updateEntry)

  const [title, setTitle] = useState(entry.title)
  const [subtitle, setSubtitle] = useState(entry.subtitle ?? '')
  const [date, setDate] = useState<number>(
    typeof entry.date === 'string' ? new Date(entry.date).getTime() : entry.date,
  )
  const [tags, setTags] = useState<string[]>(entry.tags ?? [])
  const [tagInput, setTagInput] = useState('')

  // 图片 / 代码弹层
  const [imgOpen, setImgOpen] = useState(false)
  const [imgData, setImgData] = useState<string | null>(null)
  const [imgCaption, setImgCaption] = useState('')
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeType, setCodeType] = useState<'block' | 'inline'>('block')
  const [codeLang, setCodeLang] = useState('')
  const [codeContent, setCodeContent] = useState('')

  // 灯箱
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const dateInfo = useMemo(() => fmtDate(date), [date])

  // 自动保存：脏标记 + 800ms 防抖
  const dirtyRef = useRef(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  // 用 ref 持有最新的 scheduleSave，供 onUpdate 调用，避免闭包时序问题
  const scheduleRef = useRef<(delay?: number) => void>(() => {})

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        code: { HTMLAttributes: { class: 'inline-code' } },
        heading: { levels: [3] },
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      TextStyle,
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: '此处落墨，记录此刻心绪……' }),
      InkCodeBlock,
      RedMark,
    ],
    content: entry.content || '',
    editorProps: {
      attributes: {
        class: 'ink-editor ProseMirror',
        'data-placeholder': '此处落墨，记录此刻心绪……',
      },
    },
    onUpdate: () => scheduleRef.current(800),
  })

  // editor ref，供保存逻辑读取最新 HTML
  const editorRef = useRef(editor)
  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  // 把最新字段塞进 ref，保证保存时拿到最新值
  const fieldsRef = useRef({ title, subtitle, date, tags })
  useEffect(() => {
    fieldsRef.current = { title, subtitle, date, tags }
  }, [title, subtitle, date, tags])

  const flushSave = useCallback(
    (silent = true) => {
      if (!dirtyRef.current) {
        if (!silent) toast('已是最新')
        return
      }
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
        saveTimerRef.current = undefined
      }
      const f = fieldsRef.current
      void updateEntry(entry.id, {
        title: f.title,
        subtitle: f.subtitle,
        date: f.date,
        tags: f.tags,
        content: editorRef.current?.getHTML() ?? entry.content,
      })
      dirtyRef.current = false
      if (!silent) toast('已存稿')
    },
    [entry.id, entry.content, updateEntry, toast],
  )

  const scheduleSave = useCallback(
    (delay = 800) => {
      dirtyRef.current = true
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => flushSave(true), delay)
    },
    [flushSave],
  )

  // 让 onUpdate 始终能调到最新的 scheduleSave
  useEffect(() => {
    scheduleRef.current = scheduleSave
  }, [scheduleSave])

  // 卸载时落盘
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (dirtyRef.current) {
        const f = fieldsRef.current
        void updateEntry(entry.id, {
          title: f.title,
          subtitle: f.subtitle,
          date: f.date,
          tags: f.tags,
          content: editorRef.current?.getHTML() ?? entry.content,
        })
        dirtyRef.current = false
      }
    }
  }, [entry.id, entry.content, updateEntry])

  // Ctrl/⌘ + S 手动存稿
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        flushSave(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [flushSave])

  // 点击编辑器内图片 → 灯箱
  useEffect(() => {
    const el = editor?.view.dom
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') setLightboxSrc((target as HTMLImageElement).src)
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [editor])

  /* ---------- 标签 ---------- */
  const addTag = (val: string) => {
    const v = val.trim()
    if (!v || tags.includes(v)) return
    setTags([...tags, v])
    scheduleSave()
  }
  const removeTag = (i: number) => {
    setTags(tags.filter((_, idx) => idx !== i))
    scheduleSave()
  }

  /* ---------- 图片 ---------- */
  const openImgModal = () => {
    setImgData(null)
    setImgCaption('')
    setImgOpen(true)
  }
  const onImgFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 4 * 1024 * 1024) {
      toast('请选小于 4MB 的图像')
      return
    }
    const r = new FileReader()
    r.onload = (ev) => setImgData(ev.target?.result as string)
    r.readAsDataURL(f)
  }
  const confirmImg = () => {
    if (!imgData) {
      toast('请先选取图像')
      return
    }
    editor?.chain().focus().setImage({ src: imgData, alt: imgCaption || 'illustration' }).run()
    setImgOpen(false)
    scheduleSave()
    toast('已嵌入图像')
  }

  /* ---------- 代码 ---------- */
  const openCodeModal = () => {
    const sel = editor?.state.selection
    const selectedText = sel ? editor?.state.doc.textBetween(sel.from, sel.to, '\n') ?? '' : ''
    setCodeType(selectedText ? 'inline' : 'block')
    setCodeLang('')
    setCodeContent(selectedText)
    setCodeOpen(true)
  }
  const confirmCode = () => {
    if (!codeContent.trim()) {
      toast('请输入代码内容')
      return
    }
    if (codeType === 'inline') {
      editor?.chain().focus().insertContent(`<code>${escapeCodeHtml(codeContent)}</code>`).run()
      toast('已插入行内代码')
    } else {
      const lang = codeLang.trim()
      const cls = lang ? ` class="language-${lang}"` : ''
      editor
        ?.chain()
        .focus()
        .insertContent(`<pre><code${cls}>${escapeCodeHtml(codeContent)}</code></pre><p></p>`)
        .run()
      toast('已嵌入代码块')
    }
    setCodeOpen(false)
    scheduleSave()
  }

  return (
    <div className="relative mx-auto max-w-[720px] px-[70px] pb-[120px] pt-[70px] max-md:px-4 max-md:pb-[calc(80px+env(safe-area-inset-bottom))] max-md:pt-4">
      {/* 章节标签 */}
      {chapter && (
        <div className="mb-2 text-center">
          <span className="inline-block rounded-book border border-accent bg-[rgba(138,47,31,0.04)] px-3 py-[3px] font-latin text-xs uppercase tracking-[3px] text-accent">
            第 · {chapter.name} · 章
          </span>
        </div>
      )}

      {/* 日期 + 装饰分割 */}
      <div className="relative mb-9 border-b border-margin-line pb-6 text-center">
        <div className="font-latin text-sm italic tracking-[2px] text-ink-faded">
          {dateInfo.full} <span className="mx-1.5 text-accent not-italic">·</span>{' '}
          <em>{dateInfo.en}</em>
        </div>
        <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-paper px-3 text-[18px] text-accent">
          ❦
        </span>
        <input
          type="date"
          value={dateInfo.iso}
          onChange={(e) => {
            const t = new Date(e.target.value).getTime()
            if (!Number.isNaN(t)) {
              setDate(t)
              scheduleSave()
            }
          }}
          className="absolute right-0 top-0 border-none bg-transparent font-latin text-xs italic text-ink-faded outline-none"
        />
      </div>

      {/* 标题 */}
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value)
          scheduleSave()
        }}
        placeholder="此篇题目……"
        className="mb-3 w-full border-none bg-transparent text-center font-cn text-[38px] font-semibold leading-tight text-ink outline-none max-md:text-[26px]"
        style={{ letterSpacing: '1px' }}
      />

      {/* 副标题 */}
      <input
        type="text"
        value={subtitle}
        onChange={(e) => {
          setSubtitle(e.target.value)
          scheduleSave()
        }}
        placeholder="a quiet subtitle"
        className="mb-5 w-full border-none bg-transparent text-center font-latin text-base italic text-ink-faded outline-none"
      />

      {/* 标签栏 */}
      <div className="mb-7 flex min-h-[50px] flex-wrap items-center gap-2 rounded-book border border-dashed border-margin-line bg-[rgba(154,123,58,0.06)] px-4 py-3.5">
        <span className="mr-1 font-latin text-xs uppercase tracking-[2px] text-ink-faded">
          标 · Marks
        </span>
        {tags.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-book bg-accent px-2.5 py-1 font-cn text-xs text-paper shadow-[1px_1px_0_rgba(0,0,0,0.15)]"
            style={{ animation: 'tagIn 0.3s ease' }}
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-[14px] leading-none opacity-70 transition-opacity hover:opacity-100 hover:text-gold"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault()
              addTag(tagInput)
              setTagInput('')
            } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
              removeTag(tags.length - 1)
            }
          }}
          placeholder="添加标记后回车…"
          className="min-w-[80px] flex-1 border-none bg-transparent font-cn text-[13px] text-ink outline-none placeholder:font-latin placeholder:italic placeholder:text-ink-faded"
        />
      </div>

      {/* Tiptap 编辑器 */}
      <EditorContent editor={editor} />

      {/* 气泡 + 底部工具条 */}
      <BubbleToolbar editor={editor} />
      <BottomToolbar
        editor={editor}
        onInsertImage={openImgModal}
        onInsertCode={openCodeModal}
        onSave={() => flushSave(false)}
      />

      {/* 插图弹层 */}
      <Modal
        open={imgOpen}
        onClose={() => setImgOpen(false)}
        title="插入一图"
        subtitle="— An Illustration —"
        widthClass="max-w-[520px]"
      >
        <div className="mb-3.5 flex min-h-[140px] items-center justify-center overflow-hidden rounded-[4px] border-2 border-dashed border-margin-line bg-[rgba(255,251,240,0.5)] font-latin italic text-ink-faded">
          {imgData ? (
            <img src={imgData} alt="preview" className="max-h-[240px] max-w-full" />
          ) : (
            <div className="px-7 py-7 text-center">选取图像后预览于此</div>
          )}
        </div>
        <div className="relative mb-3.5">
          <label className="block cursor-pointer rounded-book border border-margin-line bg-paper-deep px-3 py-3 text-center font-cn text-[13px] text-ink-soft transition-colors hover:bg-paper-shadow hover:text-ink">
            选取图像
            <input type="file" accept="image/*" onChange={onImgFile} className="hidden" />
          </label>
        </div>
        <div className="mb-2">
          <label className="modal-label">图注（可选）</label>
          <input
            type="text"
            value={imgCaption}
            onChange={(e) => setImgCaption(e.target.value)}
            placeholder="例如：晨光中的窗台"
            className="modal-input"
          />
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={() => setImgOpen(false)} className="btn-ghost">
            取消
          </button>
          <button onClick={confirmImg} className="btn-ink">
            嵌入
          </button>
        </div>
      </Modal>

      {/* 代码弹层 */}
      <Modal
        open={codeOpen}
        onClose={() => setCodeOpen(false)}
        title="嵌入代码"
        subtitle="— A Code Snippet —"
        widthClass="max-w-[560px]"
      >
        <div className="mb-4">
          <label className="modal-label">类型</label>
          <div className="flex gap-1.5 rounded-md border border-margin-line bg-paper-deep p-1">
            <button
              type="button"
              onClick={() => setCodeType('block')}
              className={`flex-1 rounded-[4px] px-2 py-2 font-cn text-[13px] tracking-wider transition-all ${
                codeType === 'block'
                  ? 'bg-paper text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                  : 'text-ink-faded hover:text-ink-soft'
              }`}
            >
              代码块
            </button>
            <button
              type="button"
              onClick={() => setCodeType('inline')}
              className={`flex-1 rounded-[4px] px-2 py-2 font-cn text-[13px] tracking-wider transition-all ${
                codeType === 'inline'
                  ? 'bg-paper text-ink shadow-[0_1px_4px_rgba(0,0,0,0.12)]'
                  : 'text-ink-faded hover:text-ink-soft'
              }`}
            >
              行内代码
            </button>
          </div>
        </div>
        {codeType === 'block' && (
          <div className="mb-4">
            <label className="modal-label">语言（可选）</label>
            <input
              type="text"
              value={codeLang}
              onChange={(e) => setCodeLang(e.target.value)}
              placeholder="例如：javascript、python、sql"
              className="modal-input"
            />
          </div>
        )}
        <div className="mb-2">
          <label className="modal-label">代码内容</label>
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder="粘贴或输入代码……"
            rows={8}
            className="min-h-[160px] w-full resize-y rounded-[4px] border border-shelf bg-[#2a1d12] px-3.5 py-3 font-mono text-[13px] leading-relaxed text-[#e8dcc4] outline-none placeholder:italic placeholder:text-[#8a7a60] focus:border-accent focus:shadow-[0_0_0_2px_rgba(138,47,31,0.15)]"
            style={{ whiteSpace: 'pre' }}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={() => setCodeOpen(false)} className="btn-ghost">
            取消
          </button>
          <button onClick={confirmCode} className="btn-ink">
            嵌入
          </button>
        </div>
      </Modal>

      {/* 灯箱 */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[300] flex cursor-zoom-out items-center justify-center p-10"
          style={{ background: 'rgba(20,12,6,0.92)' }}
          onClick={() => setLightboxSrc(null)}
        >
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[90%] max-w-[90%] border-8 border-paper shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          />
        </div>
      )}
    </div>
  )
}
