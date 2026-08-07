import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TiptapImage from '@tiptap/extension-image'
import { Mark, mergeAttributes, type Command } from '@tiptap/core'
import { createLowlight, common } from 'lowlight'

/** lowlight 实例，注册常用语言 */
export const lowlight = createLowlight(common)

/**
 * 自定义代码块：在 <pre> 上加 class="code-block" 与 data-lang
 * 以便 CSS 渲染木匣质感 + 右上角语言标签
 */
export const InkCodeBlock = CodeBlockLowlight.extend({
  addOptions() {
    return {
      ...this.parent?.(),
      lowlight,
      languageClassPrefix: 'language-',
      exitOnTripleEnter: true,
      exitOnArrowDown: true,
      exitOnArrowUp: true,
      defaultLanguage: null,
      enableTabIndentation: false,
      tabSize: 4,
      HTMLAttributes: { class: 'code-block' },
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const lang = (node.attrs.language as string) || 'code'
    return [
      'pre',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-lang': lang }),
      [
        'code',
        {
          class: node.attrs.language
            ? `${this.options.languageClassPrefix}${node.attrs.language}`
            : null,
        },
        0,
      ],
    ]
  },
})

/** 为 editor.commands 注册 redMark 命令类型 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    redMark: {
      /** 切换朱砂批注 */
      toggleRedMark: () => ReturnType
    }
  }
}

/** 朱砂批注：自定义 mark，渲染为 <span class="highlight-red"> */
export const RedMark = Mark.create({
  name: 'redMark',
  inclusive: true,
  excludes: '',
  parseHTML() {
    return [{ tag: 'span.highlight-red' }]
  },
  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { class: 'highlight-red' }), 0]
  },
  addCommands() {
    return {
      toggleRedMark:
        () =>
        ({ commands }: Parameters<Command>[0]): boolean =>
          commands.toggleMark(this.name),
    } as unknown as { toggleRedMark: () => Command }
  },
})

/**
 * 自定义图片节点：支持 width / float 属性
 * - width: 行内样式 + data-width 持久化
 * - float: left / right / none，通过 data-float + class 控制
 */
export const InkImage = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null as string | null,
        parseHTML: (el) => {
          const style = (el as HTMLElement).getAttribute('style') || ''
          const m = style.match(/width\s*:\s*([\d.]+)(px|%)/i)
          if (m) return `${m[1]}${m[2]}`
          const w = (el as HTMLElement).getAttribute('data-width')
          return w || null
        },
        renderHTML: (attrs) => {
          const w = attrs.width as string | null
          if (!w) return {}
          return {
            style: `width:${w}`,
            'data-width': w,
          }
        },
      },
      float: {
        default: 'none' as 'none' | 'left' | 'right',
        parseHTML: (el) => {
          const f = (el as HTMLElement).getAttribute('data-float')
          if (f === 'left' || f === 'right') return f
          const cls = (el as HTMLElement).className || ''
          if (cls.includes('float-left')) return 'left'
          if (cls.includes('float-right')) return 'right'
          return 'none'
        },
        renderHTML: (attrs) => {
          const f = attrs.float as string
          if (!f || f === 'none') return {}
          return { 'data-float': f }
        },
      },
    }
  },
  renderHTML({ node, HTMLAttributes }) {
    const float = (node.attrs.float as string) || 'none'
    const cls = `img-float-${float}`
    const merged = mergeAttributes(HTMLAttributes, { class: cls })
    return ['img', merged]
  },
  addCommands() {
    return {
      ...(this.parent?.() as Record<string, unknown>),
      setImageWidth:
        (width: string | null) =>
        ({ state, tr, dispatch }: Parameters<Command>[0]) => {
          const { selection } = state
          if (selection.from !== selection.to) return false
          const nodeAfter = state.doc.nodeAt(selection.from)
          const nodeBefore = state.doc.nodeAt(Math.max(0, selection.from - 1))
          const pos =
            nodeAfter?.type.name === this.name
              ? selection.from
              : nodeBefore?.type.name === this.name
                ? selection.from - 1
                : -1
          if (pos < 0) return false
          if (dispatch) {
            tr.setNodeMarkup(pos, undefined, {
              ...state.doc.nodeAt(pos)!.attrs,
              width,
            })
          }
          return true
        },
      setImageFloat:
        (float: 'none' | 'left' | 'right') =>
        ({ state, tr, dispatch }: Parameters<Command>[0]) => {
          const { selection } = state
          if (selection.from !== selection.to) return false
          const nodeAfter = state.doc.nodeAt(selection.from)
          const nodeBefore = state.doc.nodeAt(Math.max(0, selection.from - 1))
          const pos =
            nodeAfter?.type.name === this.name
              ? selection.from
              : nodeBefore?.type.name === this.name
                ? selection.from - 1
                : -1
          if (pos < 0) return false
          if (dispatch) {
            tr.setNodeMarkup(pos, undefined, {
              ...state.doc.nodeAt(pos)!.attrs,
              float,
            })
          }
          return true
        },
    } as Record<string, unknown>
  },
})

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    inkImage: {
      setImageWidth: (width: string | null) => ReturnType
      setImageFloat: (float: 'none' | 'left' | 'right') => ReturnType
    }
  }
}
