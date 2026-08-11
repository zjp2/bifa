import type { Journal } from '@/types'

interface Props {
  journal: Journal
  className?: string
  style?: React.CSSProperties
}

/** 书封面渲染（不含外层尺寸/hover/3D 容器，仅封面内容） */
export default function BookCover({ journal: b, className = '', style }: Props) {
  const entryCount = b.chapters.reduce((s, c) => s + c.entries.length, 0)
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-r-[6px] rounded-l-[2px] p-3 pl-4 text-paper sm:p-4 sm:pl-5 md:p-5 md:pl-7 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${b.color} 0%, rgba(0,0,0,0.5) 100%)`,
        boxShadow:
          'inset 4px 0 0 rgba(255,255,255,0.1), inset -2px 0 8px rgba(0,0,0,0.4), 4px 6px 16px rgba(0,0,0,0.3), 8px 10px 24px rgba(0,0,0,0.15)',
        ...style,
      }}
    >
      {/* 装订线 */}
      <div className="absolute left-1.5 top-0 bottom-0 w-px bg-white/20 sm:left-2.5" />
      {/* 内描边 */}
      <div className="pointer-events-none absolute inset-1.5 left-3.5 rounded-[2px] border border-white/15 sm:inset-2 sm:left-4" />
      <div className="mb-1 text-center font-latin text-[18px] text-white/40 sm:text-[24px]">❦</div>
      <h3
        className="text-center font-brush text-[20px] font-semibold leading-tight text-paper sm:text-[24px] md:text-[28px]"
        style={{ letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}
      >
        {b.name}
      </h3>
      {/* 封面图：嵌入中央区域，保留封面色边框 */}
      {b.coverImage && (
        <div
          className="mx-auto mt-1.5 w-[78%] overflow-hidden rounded-[2px] border border-white/25 shadow-[0_2px_8px_rgba(0,0,0,0.35)] sm:mt-2.5"
          style={{ aspectRatio: '4 / 3' }}
        >
          <img src={b.coverImage} alt={b.name} className="h-full w-full object-cover" />
        </div>
      )}
      <p
        className={`text-center font-latin text-[11px] italic leading-relaxed text-[rgba(243,234,215,0.75)] sm:text-[13px] ${
          b.coverImage ? 'mt-1' : 'mt-1 flex-1'
        }`}
      >
        {b.desc || b.description || ''}
      </p>
      <div className="mt-auto flex justify-between border-t border-white/15 pt-1.5 font-latin text-[10px] italic tracking-wide text-[rgba(243,234,215,0.7)] sm:pt-2 sm:text-[11px]">
        <span>{b.chapters.length} 章</span>
        <span>{entryCount} 则</span>
      </div>
    </div>
  )
}
