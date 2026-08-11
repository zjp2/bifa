import { type Editor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { useUIStore } from '@/store/uiStore'
import {
  IconCode,
  IconCopy,
  IconHighlight,
  IconH3,
  IconQuote,
  IconRedMark,
  IconStrike,
} from '@/components/icons'

interface Props {
  editor: Editor | null
}

/** 选中文本浮出的气泡工具条 */
export default function BubbleToolbar({ editor }: Props) {
  const toast = useUIStore((s) => s.toast)

  if (!editor) return null

  /** 复制选中文字 */
  const handleCopy = () => {
    const text = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to,
      '\n',
    )
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        toast('已复制到剪贴板')
      })
    }
  }

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={({ editor: e, from, to }) => from !== to && !e.isActive('codeBlock')}
      options={{ placement: 'top' }}
      className="ink-bubble"
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`ink-bubble-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
        title="加粗"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`ink-bubble-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
        title="斜体"
      >
        <i>I</i>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`ink-bubble-btn ${editor.isActive('underline') ? 'is-active' : ''}`}
        title="下划线"
      >
        <u>U</u>
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`ink-bubble-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
        title="删除线"
      >
        <IconStrike />
      </button>
      <span className="ink-bubble-sep" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`ink-bubble-btn ${editor.isActive('highlight') ? 'is-active' : ''}`}
        title="金墨高亮"
      >
        <IconHighlight />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleRedMark().run()}
        className={`ink-bubble-btn ${editor.isActive('redMark') ? 'is-active' : ''}`}
        title="朱砂批注"
      >
        <IconRedMark />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`ink-bubble-btn ${editor.isActive('code') ? 'is-active' : ''}`}
        title="行内代码"
      >
        <IconCode />
      </button>
      <span className="ink-bubble-sep" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`ink-bubble-btn ${editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}`}
        title="转为小标题"
      >
        <IconH3 />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`ink-bubble-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
        title="转为引言"
      >
        <IconQuote />
      </button>
      <span className="ink-bubble-sep" />
      <button
        type="button"
        onClick={handleCopy}
        className="ink-bubble-btn"
        title="复制选中文本"
      >
        <IconCopy />
      </button>
    </BubbleMenu>
  )
}
