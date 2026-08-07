import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
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

/**
 * 朱砂批注：自定义 mark，渲染为 <span class="highlight-red">
 */
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
