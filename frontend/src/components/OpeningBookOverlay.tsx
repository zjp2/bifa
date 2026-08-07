import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import BookCover from './BookCover'
import type { Journal } from '@/types'

interface Props {
  journal: Journal
  /** 书卡在视口中的初始位置（点击瞬间获取） */
  startRect: DOMRect
}

/**
 * 书翻开浮层：镜头推近 + 翻开封面
 *
 * 两层结构：
 * - 外层（zoom 层）：从 startRect 位置/尺寸过渡到屏幕居中放大，负责"镜头推近"
 * - 内层（flip 层）：推近到位后执行 rotateY 翻开 + 淡出，负责"翻封面"
 *
 * 时序：推近 0.45s → 短暂停 → 翻开 0.65s → 淡出
 */
export default function OpeningBookOverlay({ journal, startRect }: Props) {
  const [zoomed, setZoomed] = useState(false)
  const [opening, setOpening] = useState(false)

  // 下一帧触发推近过渡（让初始 transform 先渲染一帧）
  useEffect(() => {
    const r = requestAnimationFrame(() => setZoomed(true))
    return () => cancelAnimationFrame(r)
  }, [])

  // 推近完成后触发翻开
  useEffect(() => {
    if (!zoomed) return
    const t = window.setTimeout(() => setOpening(true), 80)
    return () => clearTimeout(t)
  }, [zoomed])

  // 目标尺寸（居中放大的书），移动端按比例缩小
  const baseW = 340
  const baseH = 460
  const fitScale = Math.min(1, window.innerWidth / 440, window.innerHeight / 580)
  const targetW = baseW * fitScale
  const targetH = baseH * fitScale

  // 居中位置
  const cx = (window.innerWidth - targetW) / 2
  const cy = (window.innerHeight - targetH) / 2

  // 初始偏移：让浮层看起来在书卡原位
  const scaleX = startRect.width / targetW
  const scaleY = startRect.height / targetH
  const dx = startRect.left - cx
  const dy = startRect.top - cy

  const zoomTransform = zoomed
    ? 'translate(0, 0) scale(1, 1)'
    : `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`

  return createPortal(
    <div
      className="fixed inset-0 z-[200]"
      style={{ perspective: '1600px', pointerEvents: 'none' }}
    >
      {/* 外层：镜头推近 */}
      <div
        style={{
          position: 'absolute',
          width: targetW,
          height: targetH,
          left: cx,
          top: cy,
          transform: zoomTransform,
          transition: 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* 内层：翻开封面 + 淡出 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            transformOrigin: 'left center',
            transform: opening
              ? 'rotateY(-108deg) scale(1.06)'
              : 'rotateY(0deg) scale(1)',
            transition:
              'transform 0.65s cubic-bezier(0.5, 0.05, 0.55, 0.95), opacity 0.35s ease 0.3s, filter 0.65s ease',
            opacity: opening ? 0 : 1,
            filter: opening ? 'brightness(1.2)' : 'brightness(1)',
          }}
        >
          <BookCover journal={journal} />
        </div>
      </div>
    </div>,
    document.body,
  )
}
