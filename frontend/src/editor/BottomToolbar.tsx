import type { Editor } from '@tiptap/react'
import {
  IconCode,
  IconDivider,
  IconImage,
  IconListOl,
  IconListUl,
  IconRedo,
  IconSave,
  IconUndo,
} from '@/components/icons'

interface Props {
  editor: Editor | null
  onInsertImage: () => void
  onInsertCode: () => void
  onSave: () => void
}

/** 编辑器底部工具条 */
export default function BottomToolbar({
  editor,
  onInsertImage,
  onInsertCode,
  onSave,
}: Props) {
  if (!editor) return null
  return (
    <div className="sticky bottom-0 left-0 right-0 z-[5] flex justify-center gap-1.5 bg-gradient-to-t from-paper-deep via-paper-deep/80 to-transparent px-0 pb-5 pt-8">
      <div className="ink-toolbar">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="ink-tool-btn disabled:opacity-30"
          data-tooltip="撤销"
          title="撤销"
        >
          <IconUndo />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="ink-tool-btn disabled:opacity-30"
          data-tooltip="重做"
          title="重做"
        >
          <IconRedo />
        </button>
        <span className="ink-tool-divider" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`ink-tool-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
          data-tooltip="无序列表"
          title="无序列表"
        >
          <IconListUl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`ink-tool-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
          data-tooltip="有序列表"
          title="有序列表"
        >
          <IconListOl />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="ink-tool-btn"
          data-tooltip="分割线"
          title="分割线"
        >
          <IconDivider />
        </button>
        <span className="ink-tool-divider" />
        <button
          type="button"
          onClick={onInsertCode}
          className="ink-tool-btn"
          data-tooltip="代码块"
          title="代码块"
        >
          <IconCode />
        </button>
        <button
          type="button"
          onClick={onInsertImage}
          className="ink-tool-btn"
          data-tooltip="插图"
          title="插图"
        >
          <IconImage />
        </button>
        <span className="ink-tool-divider" />
        <button
          type="button"
          onClick={onSave}
          className="ink-tool-btn"
          data-tooltip="存稿 (Ctrl/⌘+S)"
          title="存稿"
        >
          <IconSave />
        </button>
      </div>
    </div>
  )
}
