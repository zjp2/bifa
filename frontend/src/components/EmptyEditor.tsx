/** 书内页未选中条目时的空状态 */
export default function EmptyEditor() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 py-20 text-center text-ink-faded">
      <div className="mb-6 font-latin text-[64px] text-margin-line">❦</div>
      <h3 className="mb-3 font-latin text-3xl font-normal italic text-ink-soft">静待落笔之时</h3>
      <p className="max-w-[380px] font-serif text-sm leading-relaxed">
        选取左侧章节中的一篇，或新建一则，让心绪沉淀于纸上。
      </p>
    </div>
  )
}
