import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'

import Placeholder from '@tiptap/extension-placeholder'
import { useJournalStore } from '@/store/journalStore'
import { useUIStore } from '@/store/uiStore'
import { fmtDate } from '@/utils'
import type { Chapter, Entry } from '@/types'
import Modal from '@/components/Modal'
import BubbleToolbar from './BubbleToolbar'
import BottomToolbar from './BottomToolbar'
import { InkCodeBlock, RedMark, InkImage } from './extensions'

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
  /** 检查当前 entry 所属 journal 是否还在 store 里（已删除则跳过一切保存行为）。
   *  用 getState() 读取最新值，不订阅 journals，避免 journals 变化导致本回调重建
   *  进而触发依赖它的 effect（图片位置同步等）反复重跑 → 无限 setState 循环。 */
  const entryStillAlive = useCallback(() => {
    for (const j of useJournalStore.getState().journals) {
      for (const c of j.chapters) {
        if (c.entries.some((e) => e.id === entry.id)) return true
      }
    }
    return false
  }, [entry.id])

  const [title, setTitle] = useState(entry.title)
  const [subtitle, setSubtitle] = useState(entry.subtitle ?? '')
  const [date, setDate] = useState<number>(
    typeof entry.date === 'string' ? new Date(entry.date).getTime() : entry.date,
  )
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tags, _setTags] = useState<string[]>(entry.tags ?? [])

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

  // 图片选中 & 拖拽调整尺寸
  const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null)
  const [imgWrapperStyle, setImgWrapperStyle] = useState<React.CSSProperties | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_imgFloat, setImgFloat] = useState<'none' | 'left' | 'right'>('none')
  const resizeDragRef = useRef<{
    startX: number
    startY: number
    startW: number
    startH: number
    ratio: number
    corner: string
    shift: boolean
    img: HTMLImageElement
  } | null>(null)
  // 拖拽移动图片（非缩放）时的状态
  const moveDragRef = useRef<{
    startX: number
    img: HTMLImageElement
    editorRect: DOMRect
  } | null>(null)

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
      InkImage.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: '此处落墨，记录此刻心绪……' }),
      InkCodeBlock,
      RedMark,
    ],
    content: entry.content || '',
    editorProps: {
      attributes: {
        class: 'ink-editor ProseMirror',
        'data-placeholder': '此处落墨，记录此刻心绪……',
        'style': '-webkit-touch-callout: none; -webkit-user-select: text; user-select: text;',
      },
    },
    onUpdate: () => scheduleRef.current(800),
  })

  // editor ref，供保存逻辑读取最新 HTML
  const editorRef = useRef(editor)
  useEffect(() => {
    editorRef.current = editor
    // 测试用途：暴露 editor 到 window
    if (editor) (window as any).__inkEditor = editor
  }, [editor])

  // 把最新字段塞进 ref，保证保存时拿到最新值
  const fieldsRef = useRef({ title, subtitle, date, tags })
  useEffect(() => {
    fieldsRef.current = { title, subtitle, date, tags }
  }, [title, subtitle, date, tags])

  const flushSave = useCallback(
    (silent = true) => {
      if (!entryStillAlive()) return
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
    [entry.id, entry.content, updateEntry, toast, entryStillAlive],
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

  // 卸载时落盘（只有 entry 仍然存在才执行，防止删除书籍期间对已移除实体写回导致崩溃）
  // 注意：依赖项不含 entry.content —— cleanup 用 ref 读取最新值，
  // 若依赖 content，每次自动保存后 content 变化会触发 cleanup 重新执行，
  // 可能形成"保存→content变→cleanup再保存→"的循环。
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (dirtyRef.current) {
        // 卸载前做一次 alive 检查：如果 entry 已不在 store（所属 journal/chapter 已被删），直接跳过
        const latest = useJournalStore.getState().journals
        let alive = false
        for (const j of latest) {
          for (const c of j.chapters) {
            if (c.entries.some((e) => e.id === entry.id)) {
              alive = true
              break
            }
          }
          if (alive) break
        }
        if (alive) {
          const f = fieldsRef.current
          void updateEntry(entry.id, {
            title: f.title,
            subtitle: f.subtitle,
            date: f.date,
            tags: f.tags,
            content: editorRef.current?.getHTML() ?? '',
          })
        }
        dirtyRef.current = false
      }
    }
  }, [entry.id, updateEntry])

  // 移动端：彻底阻止系统选择菜单
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android|HarmonyOS/i.test(navigator.userAgent) || 'ontouchstart' in window

    if (!isMobile || !editor) return

    const view = editor.view.dom

    // 1. 阻止 contextmenu
    const onContextMenu = (e: Event) => e.preventDefault()
    view.addEventListener('contextmenu', onContextMenu)

    // 2. 监听 selectionchange，选择发生后立即清除系统选择
    // 让系统菜单无内容可显示，Tiptap BubbleMenu 接管
    const onSelectionChange = () => {
      const sel = window.getSelection()
      if (sel && sel.rangeCount > 0) {
        const anchor = sel.anchorNode
        if (anchor && view.contains(anchor)) {
          // 用 requestAnimationFrame 延迟清除
          requestAnimationFrame(() => {
            const currentSel = window.getSelection()
            if (currentSel && currentSel.anchorNode === anchor) {
              currentSel.removeAllRanges()
            }
          })
        }
      }
    }
    document.addEventListener('selectionchange', onSelectionChange)

    // 3. 触摸事件：手指抬起后清除选择
    const onTouchEnd = () => {
      setTimeout(() => {
        const sel = window.getSelection()
        if (sel && sel.rangeCount > 0) {
          sel.removeAllRanges()
        }
      }, 30)
    }
    view.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      view.removeEventListener('contextmenu', onContextMenu)
      view.removeEventListener('touchend', onTouchEnd)
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [editor])

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

  // 选中图片的 DOM 位置同步：当选中图片存在时，持续计算其在编辑区中的位置 → 更新手柄容器位置
  useEffect(() => {
    if (!selectedImg) {
      setImgWrapperStyle(null)
      return
    }
    const sync = () => {
      // 安全门：entry 所属 journal 已被删 → 停掉 interval，避免无效渲染 + 内存增长
      if (!entryStillAlive()) {
        clearInterval(t)
        window.removeEventListener('scroll', sync, true)
        window.removeEventListener('resize', sync)
        setImgWrapperStyle(null)
        return
      }
      const el = editor?.view.dom as HTMLElement | undefined
      if (!el) return
      const imgRect = selectedImg.getBoundingClientRect()
      const containerRect = el.getBoundingClientRect()
      setImgWrapperStyle({
        position: 'absolute',
        left: imgRect.left - containerRect.left,
        top: imgRect.top - containerRect.top,
        width: imgRect.width,
        height: imgRect.height,
        pointerEvents: 'none',
      })
    }
    sync()
    const t = setInterval(sync, 120)
    window.addEventListener('scroll', sync, true)
    window.addEventListener('resize', sync)
    return () => {
      clearInterval(t)
      window.removeEventListener('scroll', sync, true)
      window.removeEventListener('resize', sync)
    }
  }, [selectedImg, editor, entryStillAlive])

  // 选中图片时在 Tiptap 中定位对应节点（以便 setImageWidth 更新）
  const setWidthForSelectedImg = useCallback(
    (widthPx: number) => {
      if (!selectedImg || !editor) return
      const view = editor.view
      const pos = view.posAtDOM(selectedImg, 0)
      if (pos == null) return
      // 尝试向前/向后寻找图片节点
      for (const p of [pos, Math.max(0, pos - 1), Math.min(view.state.doc.nodeSize - 1, pos + 1)]) {
        const node = view.state.doc.nodeAt(p)
        if (node && node.type.name === 'image') {
          const w = `${Math.round(widthPx)}px`
          editor
            .chain()
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                tr.setNodeMarkup(p, undefined, { ...node.attrs, width: w })
              }
              return true
            })
            .run()
          return
        }
      }
    },
    [selectedImg, editor],
  )

  // 设置选中图片的 float 属性
  const setFloatForSelectedImg = useCallback(
    (float: 'none' | 'left' | 'right') => {
      if (!selectedImg || !editor) return
      const view = editor.view
      const pos = view.posAtDOM(selectedImg, 0)
      if (pos == null) return
      for (const p of [pos, Math.max(0, pos - 1), Math.min(view.state.doc.nodeSize - 1, pos + 1)]) {
        const node = view.state.doc.nodeAt(p)
        if (node && node.type.name === 'image') {
          editor
            .chain()
            .command(({ tr, dispatch }) => {
              if (dispatch) {
                tr.setNodeMarkup(p, undefined, { ...node.attrs, float })
              }
              return true
            })
            .run()
          // 更新 DOM class
          selectedImg.classList.remove('img-float-none', 'img-float-left', 'img-float-right')
          selectedImg.classList.add(`img-float-${float}`)
          setImgFloat(float)
          return
        }
      }
    },
    [selectedImg, editor],
  )

  // 拖拽调整尺寸：全局 mousemove / mouseup
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = resizeDragRef.current
      if (!d) return
      e.preventDefault()
      const dx = e.clientX - d.startX
      const dy = e.clientY - d.startY
      let newW = d.startW
      let newH = d.startH
      const ratio = d.ratio
      const shift = e.shiftKey || d.shift
      const expand = (x: number, y: number) => {
        if (shift) {
          // 以宽度为准，保持比例
          newW = Math.max(80, d.startW + x)
          newH = newW / ratio
        } else {
          newW = Math.max(80, d.startW + x)
          newH = Math.max(60, d.startH + y)
        }
      }
      switch (d.corner) {
        case 'se':
          expand(dx, dy)
          break
        case 'sw':
          expand(-dx, dy)
          break
        case 'ne':
          expand(dx, -dy)
          break
        case 'nw':
          expand(-dx, -dy)
          break
        case 'e':
          newW = Math.max(80, d.startW + dx)
          newH = shift ? newW / ratio : d.startH
          break
        case 'w':
          newW = Math.max(80, d.startW - dx)
          newH = shift ? newW / ratio : d.startH
          break
        case 's':
          newH = Math.max(60, d.startH + dy)
          newW = shift ? newH * ratio : d.startW
          break
        case 'n':
          newH = Math.max(60, d.startH - dy)
          newW = shift ? newH * ratio : d.startW
          break
      }
      // 实时修改 DOM 宽度（先不写入文档，mouseup 再 commit）
      d.img.style.width = `${Math.round(newW)}px`
      d.img.style.height = shift ? `${Math.round(newH)}px` : ''
      setImgWrapperStyle((s) => (s ? { ...s, width: Math.round(newW), height: Math.round(newH) } : s))
    }
    const onUp = () => {
      const d = resizeDragRef.current
      if (!d) return
      resizeDragRef.current = null
      // 若保持比例且设置了 height，把 height 清掉（以 width 为准）
      if (d.img.style.height) d.img.style.height = ''
      const rect = d.img.getBoundingClientRect()
      setWidthForSelectedImg(rect.width)
      scheduleSave(300)
      document.body.style.cursor = ''
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [setWidthForSelectedImg, scheduleSave])

  const startResize = (corner: string) => (e: React.MouseEvent) => {
    if (!selectedImg) return
    e.stopPropagation()
    e.preventDefault()
    const w = selectedImg.offsetWidth
    const h = selectedImg.offsetHeight
    resizeDragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: w,
      startH: h,
      ratio: w / h,
      corner,
      shift: e.shiftKey,
      img: selectedImg,
    }
    document.body.style.cursor =
      corner === 'n' || corner === 's'
        ? 'ns-resize'
        : corner === 'e' || corner === 'w'
          ? 'ew-resize'
          : `${corner}-resize`
  }

  // 拖拽移动：全局 mousemove 检测方向
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = moveDragRef.current
      if (!d) return
      const dx = e.clientX - d.startX
      const threshold = 40
      if (Math.abs(dx) < threshold) return
      // 判断图片在编辑区的相对位置
      const imgCenter = d.img.getBoundingClientRect().left + d.img.offsetWidth / 2
      const editorCenter = d.editorRect.left + d.editorRect.width / 2
      if (dx > threshold && imgCenter > editorCenter - 50) {
        // 向右拖 → 右浮
        setFloatForSelectedImg('right')
        moveDragRef.current = null
      } else if (dx < -threshold && imgCenter < editorCenter + 50) {
        // 向左拖 → 左浮
        setFloatForSelectedImg('left')
        moveDragRef.current = null
      }
    }
    const onUp = () => {
      moveDragRef.current = null
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
  }, [setFloatForSelectedImg])

  // 点击编辑器：选中图片 / 取消选中 / 灯箱
  useEffect(() => {
    const el = editor?.view.dom as HTMLElement | undefined
    if (!el) return
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') {
        const img = target as HTMLImageElement
        // 同一图片被再次点击（已选中）→ 打开灯箱查看大图
        if (img === selectedImg) {
          setLightboxSrc(img.src)
          return
        }
        // 给所有图片移除选中态 class
        ;(el.querySelectorAll('img.img-selected') as NodeListOf<HTMLImageElement>).forEach((i) =>
          i.classList.remove('img-selected'),
        )
        img.classList.add('img-selected')
        setSelectedImg(img)
        // 读取当前 float 值
        const cls = img.className || ''
        if (cls.includes('img-float-left')) setImgFloat('left')
        else if (cls.includes('img-float-right')) setImgFloat('right')
        else setImgFloat('none')
      } else {
        // 点空白：取消选中
        ;(el.querySelectorAll('img.img-selected') as NodeListOf<HTMLImageElement>).forEach((i) =>
          i.classList.remove('img-selected'),
        )
        setSelectedImg(null)
      }
    }
    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [editor, selectedImg])

  // 条目切换/卸载时：取消选中
  useEffect(() => {
    return () => {
      setSelectedImg(null)
      const el = editor?.view.dom as HTMLElement | undefined
      el?.querySelectorAll('img.img-selected').forEach((i) => i.classList.remove('img-selected'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

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
    // 确保在光标位置插入新图片，而不是替换已有图片
    // 使用 setImage 时，如果光标不在图片上，会在光标位置插入
    editor?.chain().focus().setImage({ src: imgData, alt: imgCaption || 'illustration' }).run()
    setImgOpen(false)
    scheduleSave()
    toast('已嵌入图像')
  }

  // 删除选中的图片
  const deleteSelectedImg = () => {
    if (!selectedImg || !editor) return
    const pos = editor.view.posAtDOM(selectedImg, 0)
    if (pos == null) return
    editor.chain().focus().deleteRange({ from: pos, to: pos + 1 }).run()
    setSelectedImg(null)
    scheduleSave()
    toast('已删除图像')
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

      {/* Tiptap 编辑器 */}
      <div className="relative">
        <EditorContent editor={editor} />
        <BubbleToolbar editor={editor} />
      </div>

      {/* 底部工具栏 */}
      <BottomToolbar
        onInsertImage={openImgModal}
        onInsertCode={openCodeModal}
        onSave={() => flushSave(false)}
        editor={editor}
      />

      {/* 图片弹层 */}
      <Modal open={imgOpen} onClose={() => setImgOpen(false)} title="嵌入图像">
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-3">
            {imgData ? (
              <img src={imgData} alt="预览" className="max-h-48 rounded border border-margin-line" />
            ) : (
              <div className="flex h-32 w-48 items-center justify-center rounded border-2 border-dashed border-margin-line text-ink-faded">
                图像预览
              </div>
            )}
            <label className="cursor-pointer rounded-book bg-[rgba(138,47,31,0.08)] px-4 py-2 text-sm text-accent hover:bg-[rgba(138,47,31,0.12)]">
              选取图像
              <input type="file" accept="image/*" className="hidden" onChange={onImgFile} />
            </label>
          </div>
          <input
            type="text"
            value={imgCaption}
            onChange={(e) => setImgCaption(e.target.value)}
            placeholder="添加图注（可选）"
            className="w-full rounded border border-margin-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setImgOpen(false)}
              className="rounded px-4 py-2 text-sm text-ink-faded hover:bg-margin-line"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmImg}
              className="rounded-book bg-accent px-4 py-2 text-sm text-paper hover:opacity-90"
            >
              嵌入
            </button>
          </div>
        </div>
      </Modal>

      {/* 代码弹层 */}
      <Modal open={codeOpen} onClose={() => setCodeOpen(false)} title={codeType === 'inline' ? '行内代码' : '代码块'}>
        <div className="space-y-4">
          {codeType === 'block' && (
            <input
              type="text"
              value={codeLang}
              onChange={(e) => setCodeLang(e.target.value)}
              placeholder="语言（可选，如 javascript）"
              className="w-full rounded border border-margin-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
            />
          )}
          <textarea
            value={codeContent}
            onChange={(e) => setCodeContent(e.target.value)}
            placeholder={codeType === 'inline' ? '输入行内代码…' : '输入代码块内容…'}
            rows={codeType === 'inline' ? 2 : 8}
            className="w-full rounded border border-margin-line bg-paper px-3 py-2 font-mono text-sm outline-none focus:border-accent"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCodeOpen(false)}
              className="rounded px-4 py-2 text-sm text-ink-faded hover:bg-margin-line"
            >
              取消
            </button>
            <button
              type="button"
              onClick={confirmCode}
              className="rounded-book bg-accent px-4 py-2 text-sm text-paper hover:opacity-90"
            >
              嵌入
            </button>
          </div>
        </div>
      </Modal>

      {/* 灯箱 */}
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setLightboxSrc(null)}
        >
          <img src={lightboxSrc} alt="预览" className="max-h-full max-w-full rounded" />
          <button
            type="button"
            onClick={() => setLightboxSrc(null)}
            className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
          >
            ✕
          </button>
        </div>
      )}

      {/* 选中图片的调整手柄容器 */}
      {selectedImg && imgWrapperStyle && (
        <div
          className="pointer-events-auto absolute z-10"
          style={{
            left: imgWrapperStyle.left,
            top: imgWrapperStyle.top,
            width: imgWrapperStyle.width,
            height: imgWrapperStyle.height,
          }}
        >
          {/* 边框 */}
          <div className="pointer-events-none absolute inset-0 rounded border-2 border-accent/60" />
          {/* 删除按钮 */}
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation()
              deleteSelectedImg()
            }}
            className="absolute -right-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-500 bg-paper text-red-500 shadow-md hover:bg-red-500 hover:text-white transition-colors"
            title="删除图片"
          >
            ✕
          </button>
          {/* 四角手柄 */}
          {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
            <div
              key={corner}
              onMouseDown={startResize(corner)}
              className="absolute h-3 w-3 cursor-nwse-resize rounded-full border-2 border-accent bg-paper"
              style={{
                left: corner.includes('w') ? -6 : undefined,
                right: corner.includes('e') ? -6 : undefined,
                top: corner.includes('n') ? -6 : undefined,
                bottom: corner.includes('s') ? -6 : undefined,
                cursor:
                  corner === 'nw' || corner === 'se'
                    ? 'nwse-resize'
                    : 'nesw-resize',
              }}
            />
          ))}
          {/* 四边手柄（用于单方向调整） */}
          {(['n', 's', 'e', 'w'] as const).map((corner) => (
            <div
              key={corner}
              onMouseDown={startResize(corner)}
              className="absolute h-2 w-2 rounded-full border border-accent bg-paper"
              style={{
                left: corner === 'w' ? -4 : corner === 'e' ? undefined : '50%',
                right: corner === 'e' ? -4 : undefined,
                top: corner === 'n' ? -4 : corner === 's' ? undefined : '50%',
                bottom: corner === 's' ? -4 : undefined,
                transform: corner === 'n' || corner === 's' ? 'translateX(-50%)' : 'translateY(-50%)',
                cursor: corner === 'n' || corner === 's' ? 'ns-resize' : 'ew-resize',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
