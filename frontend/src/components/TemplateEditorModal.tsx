import { useState } from 'react'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import {
  type StoryTemplates,
  TEMPLATE_CATEGORIES,
  BUILTIN_TEMPLATES,
  loadUserTemplates,
  saveUserTemplates,
} from '@/data/storyTemplates'

interface Props {
  open: boolean
  onClose: () => void
}

/** 素材管理弹层 - 用户可自定义灵感素材 */
export default function TemplateEditorModal({ open, onClose }: Props) {
  const [userTemplates, setUserTemplates] = useState<Partial<StoryTemplates>>(loadUserTemplates())
  const [activeCategory, setActiveCategory] = useState<keyof StoryTemplates>('opening')
  const [newItem, setNewItem] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2000)
  }

  const getCategoryItems = (key: keyof StoryTemplates) => {
    const builtin = BUILTIN_TEMPLATES[key]
    const user = userTemplates[key] || []
    return { builtin, user }
  }

  const handleAddItem = () => {
    const text = newItem.trim()
    if (!text) return
    const current = userTemplates[activeCategory] || []
    const updated = { ...userTemplates, [activeCategory]: [...current, text] }
    setUserTemplates(updated)
    saveUserTemplates(updated)
    setNewItem('')
    showToast('已添加素材')
  }

  const handleRemoveItem = (key: keyof StoryTemplates, index: number) => {
    const current = userTemplates[key] || []
    const updated = {
      ...userTemplates,
      [key]: current.filter((_, i) => i !== index),
    }
    setUserTemplates(updated)
    saveUserTemplates(updated)
    showToast('已删除素材')
  }

  const handleClearAll = () => {
    setUserTemplates({})
    saveUserTemplates({})
    setClearConfirmOpen(false)
    showToast('已清空')
  }

  const { builtin, user } = getCategoryItems(activeCategory)
  const categoryMeta = TEMPLATE_CATEGORIES.find((c) => c.key === activeCategory)!

  return (
    <>
    <Modal
      open={open}
      onClose={onClose}
      title="素材阁"
      subtitle="— Template Library —"
      widthClass="max-w-[560px]"
    >
      {/* 分类切换 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {TEMPLATE_CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            type="button"
            onClick={() => setActiveCategory(cat.key)}
            className={`rounded-book px-3 py-1.5 font-cn text-[12px] transition-all ${
              activeCategory === cat.key
                ? 'bg-ink text-paper'
                : 'border border-margin-line bg-paper-deep/50 text-ink-soft hover:border-ink'
            }`}
          >
            {cat.label}
            {(userTemplates[cat.key]?.length || 0) > 0 && (
              <span className="ml-1 text-[10px] text-gold">
                +{userTemplates[cat.key]?.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 分类描述 */}
      <div className="mb-3 rounded-book border border-margin-line bg-[rgba(154,123,58,0.06)] px-3 py-2">
        <div className="font-latin text-[11px] italic tracking-wider text-ink-faded">
          · {categoryMeta.hint} · 内置 {builtin.length} 条{user.length > 0 ? ` · 自定义 ${user.length} 条` : ''}
        </div>
      </div>

      {/* 添加新素材 */}
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
          placeholder={`添加${categoryMeta.label}素材…`}
          className="modal-input flex-1"
        />
        <button
          type="button"
          onClick={handleAddItem}
          disabled={!newItem.trim()}
          className="btn-ink !px-4 !py-2 text-xs disabled:opacity-50"
        >
          添加
        </button>
      </div>

      {/* 素材列表 - 内置 */}
      <div className="mb-3">
        <div className="mb-1.5 font-latin text-[10px] italic tracking-wider text-ink-faded">
          内置素材（只读）
        </div>
        <div className="max-h-[100px] overflow-y-auto rounded-book border border-margin-line bg-paper-deep/30 p-2">
          <div className="space-y-1">
            {builtin.map((item, i) => (
              <div
                key={i}
                className="truncate rounded-book bg-paper/60 px-2 py-1 font-serif text-[12px] text-ink-soft"
                title={item}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 素材列表 - 用户自定义 */}
      <div className="mb-3">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="font-latin text-[10px] italic tracking-wider text-gold">
            自定义素材（{user.length} 条）
          </span>
          {user.length > 0 && (
            <button
              type="button"
              onClick={() => setClearConfirmOpen(true)}
              className="font-latin text-[10px] italic text-ink-faded underline-offset-2 hover:text-accent hover:underline"
            >
              清空全部
            </button>
          )}
        </div>
        {user.length > 0 ? (
          <div className="max-h-[120px] overflow-y-auto rounded-book border border-gold/30 bg-[rgba(154,123,58,0.08)] p-2">
            <div className="space-y-1">
              {user.map((item, i) => (
                <div
                  key={i}
                  className="group flex items-center gap-2 rounded-book bg-paper/80 px-2 py-1"
                >
                  <span className="flex-1 truncate font-serif text-[12px] text-ink" title={item}>
                    {item}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(activeCategory, i)}
                    className="shrink-0 border-none bg-transparent text-[12px] text-ink-faded opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                    title="删除"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-book border border-dashed border-margin-line bg-paper-deep/20 px-3 py-4 text-center font-latin text-[11px] italic text-ink-faded">
            暂无自定义素材，添加一些吧
          </div>
        )}
      </div>

      {/* 提示信息 */}
      {toastMsg && (
        <div className="animate-fadeIn mt-2 rounded-book border border-gold bg-[rgba(154,123,58,0.1)] px-3 py-2 text-center font-cn text-[12px] text-ink">
          {toastMsg}
        </div>
      )}

      {/* 底部说明 */}
      <div className="mt-4 text-center font-latin text-[10px] italic leading-relaxed tracking-wide text-ink-faded">
        自定义素材保存在本地浏览器 · 与内置素材合并使用
      </div>
    </Modal>

    {/* 清空确认对话框 */}
    <ConfirmDialog
      open={clearConfirmOpen}
      title="清空素材"
      message="确定清空所有自定义素材？此操作不可恢复。"
      confirmText="清空"
      cancelText="取消"
      danger
      onConfirm={handleClearAll}
      onCancel={() => setClearConfirmOpen(false)}
    />
    </>
  )
}
