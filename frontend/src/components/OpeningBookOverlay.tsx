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
 * 书翻开浮层：聚焦背景 + 木质承托 + 镜头推近 + 翻开封面
 *
 * 分层：
 * - 背景层：深色 radial vignette 聚焦，推近时渐入
 * - 承托层：书下方木质"手掌"面 + 投影，给书一个落脚点（不空旷）
 * - 内页光层：封面翻开时从缝隙透出的暖白纸光（呼应进入书内页）
 * - zoom 层：从书卡原位推近到居中放大
 * - flip 层：rotateY 翻开 + 淡出
 */
export default function OpeningBookOverlay({ journal, startRect }: Props) {
  const [zoomed, setZoomed] = useState(false)
  const [opening, setOpening] = useState(false)

  useEffect(() => {
    const r = requestAnimationFrame(() => setZoomed(true))
    return () => cancelAnimationFrame(r)
  }, [])

  useEffect(() => {
    if (!zoomed) return
    const t = window.setTimeout(() => setOpening(true), 80)
    return () => clearTimeout(t)
  }, [zoomed])

  // 放大尺寸：桌面 440×600（更大更饱满），移动端按视口比例缩小
  const baseW = 440
  const baseH = 600
  const fitScale = Math.min(1, (window.innerWidth - 40) / baseW, (window.innerHeight - 120) / baseH)
  const targetW = baseW * fitScale
  const targetH = baseH * fitScale

  const cx = (window.innerWidth - targetW) / 2
  const cy = (window.innerHeight - targetH) / 2

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
      style={{ perspective: '1800px', pointerEvents: 'none' }}
    >
      {/* ① 聚焦背景：深色 radial vignette，推近时渐入 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(40,24,12,0.55) 0%, rgba(20,12,6,0.88) 55%, rgba(10,6,3,0.96) 100%)',
          opacity: zoomed ? 1 : 0,
          transition: 'opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />

      {/* ② 承托面：书下方的木质水平面 + 投影，给书一个"放着的地方" */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: `calc(50% + ${targetH / 2 + 14}px)`,
          width: targetW * 1.8,
          height: 180,
          transform: 'translate(-50%, -50%) rotateX(72deg)',
          transformOrigin: 'center center',
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.18) 45%, transparent 100%), repeating-linear-gradient(90deg, #3a2410 0px, #4a2f16 6px, #2e1d0d 14px)',
          borderRadius: '50%',
          boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
          opacity: zoomed ? (opening ? 0.55 : 0.85) : 0,
          transition: 'opacity 0.5s ease',
          filter: 'blur(1px)',
        }}
      />
      {/* 书直接接触平面的软阴影（更真实） */}
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy + targetH - 6,
          width: targetW,
          height: 26,
          background: 'radial-gradient(ellipse at 35% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)',
          borderRadius: '50%',
          filter: 'blur(6px)',
          opacity: zoomed ? (opening ? 0.2 : 0.8) : 0,
          transition: 'opacity 0.45s ease',
        }}
      />

      {/* ③ 内页光：封面翻开时，从左缝透出的暖白纸光 */}
      <div
        style={{
          position: 'absolute',
          left: cx - 80,
          top: cy - 40,
          width: targetW + 160,
          height: targetH + 80,
          background:
            'radial-gradient(ellipse at 12% 50%, rgba(255,240,208,0.75) 0%, rgba(255,228,184,0.22) 30%, transparent 65%)',
          opacity: opening ? 1 : 0,
          transition: 'opacity 0.55s ease 0.1s',
          pointerEvents: 'none',
        }}
      />

      {/* ④ zoom 层：从原位推近到居中 */}
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
        {/* 书后面的纸张"内页"（白/米黄），翻开时会从封面后面露出来 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(180deg, #f7edd5 0%, #e8d9b5 100%)',
            borderRadius: '6px 6px 6px 2px',
            boxShadow:
              'inset 2px 0 0 rgba(180,140,80,0.25), 6px 12px 28px rgba(0,0,0,0.45)',
            opacity: opening ? 1 : 0,
            transform: opening ? 'translateX(6px)' : 'translateX(0)',
            transition: 'opacity 0.4s ease 0.12s, transform 0.65s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* 内页模拟文字行（只在翻开时出现） */}
          <div
            style={{
              position: 'absolute',
              left: 28,
              right: 22,
              top: 44,
              bottom: 40,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              opacity: opening ? 1 : 0,
              transition: 'opacity 0.5s ease 0.32s',
            }}
          >
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  height: 10,
                  width: `${70 + ((i * 13) % 25)}%`,
                  background: `linear-gradient(90deg, rgba(90,60,30,0.22) 0%, rgba(90,60,30,0.14) 100%)`,
                  borderRadius: 2,
                }}
              />
            ))}
          </div>
        </div>

        {/* ⑤ flip 层：封面本身 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            transformOrigin: 'left center',
            transform: opening
              ? 'rotateY(-155deg)'
              : 'rotateY(0deg)',
            transition:
              'transform 0.75s cubic-bezier(0.45, 0.05, 0.55, 0.95), opacity 0.4s ease 0.3s, filter 0.75s ease',
            opacity: opening ? 0.35 : 1,
            filter: opening ? 'brightness(1.22)' : 'brightness(1)',
            willChange: 'transform, opacity',
          }}
        >
          {/* 封面翻开时背面会看到，所以加一个镜像翻转的"封面里层"（纸纹） */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <BookCover journal={journal} />
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              background:
                'linear-gradient(180deg, #f0e2c2 0%, #d9c493 100%)',
              borderRadius: '6px 6px 6px 2px',
              boxShadow: 'inset 10px 0 20px rgba(0,0,0,0.12)',
              opacity: opening ? 1 : 0,
            }}
          />
        </div>
      </div>
    </div>,
    document.body,
  )
}
