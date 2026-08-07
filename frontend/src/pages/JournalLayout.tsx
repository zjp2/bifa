import { useEffect, useState } from 'react'
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useJournalStore } from '@/store/journalStore'
import ChapterTree from '@/components/ChapterTree'
import { IconBack, IconMenu } from '@/components/icons'
import { initialsOf } from '@/utils'

/** 书内页布局：左侧木纹章节树侧栏 + 右侧编辑器（Outlet） */
export default function JournalLayout() {
  const navigate = useNavigate()
  const { journalId } = useParams()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const journals = useJournalStore((s) => s.journals)

  const journal = journals.find((j) => j.id === journalId)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // 切换书时关闭抽屉
  useEffect(() => {
    setDrawerOpen(false)
  }, [journalId])

  if (!journal) {
    // 可能是加载中或 id 无效
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-4 text-ink-faded">
        <div className="font-latin text-[64px] text-margin-line">❦</div>
        <p className="font-cn text-sm">
          {journals.length === 0 ? '正在展开卷帙……' : '此卷已不存在'}
        </p>
        <button onClick={() => navigate('/')} className="btn-ghost">
          ← 返回书架
        </button>
      </div>
    )
  }

  return (
    <div className="grid h-[100dvh] w-full grid-cols-[300px_1fr] max-md:grid-cols-1">
      {/* 桌面侧栏 */}
      <aside
        className="wood-texture relative h-full overflow-hidden border-r-2 border-[#1a0f08] text-paper max-md:hidden"
        style={{
          background: 'linear-gradient(180deg, var(--shelf) 0%, var(--shelf-deep) 100%)',
          boxShadow: 'inset -8px 0 24px rgba(0,0,0,0.4), 4px 0 16px rgba(0,0,0,0.15)',
        }}
      >
        <ChapterTree journal={journal} />
      </aside>

      {/* 右侧编辑区 */}
      <section
        className="relative h-full overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, var(--paper) 0%, var(--paper-deep) 100%)',
          boxShadow: 'inset 0 8px 20px rgba(60,40,20,0.1)',
        }}
      >
        {/* 移动端顶栏 */}
        <header className="safe-top sticky top-0 z-40 flex items-center justify-between border-b border-margin-line bg-[rgba(243,234,215,0.95)] px-4 py-3 backdrop-blur md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-[rgba(60,40,20,0.08)]"
            aria-label="菜单"
          >
            <IconMenu className="text-xl" />
          </button>
          <div className="font-brush text-[22px] text-ink" style={{ letterSpacing: '2px' }}>
            {journal.name}
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full font-cn text-[13px] font-medium text-paper"
            style={{ background: 'linear-gradient(135deg, var(--accent), var(--gold))' }}
            title={user?.email}
          >
            {initialsOf(user?.name)}
          </button>
        </header>

        {/* 移动端返回书架按钮（在编辑器顶部） */}
        <Link
          to="/"
          className="safe-top absolute left-4 z-10 hidden items-center gap-1 font-latin text-[13px] italic tracking-wide text-paper-shadow hover:text-gold md:flex"
          style={{ top: '24px' }}
        >
          <IconBack className="text-base" /> 返回书架
        </Link>

        <div className="h-full overflow-y-auto">
          <Outlet />
        </div>
      </section>

      {/* 移动端抽屉 */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[90] md:hidden">
          <div
            className="absolute inset-0 bg-[rgba(20,12,6,0.55)] backdrop-blur-[3px]"
            onClick={() => setDrawerOpen(false)}
          />
          <aside
            className="wood-texture absolute left-0 top-0 bottom-0 flex w-[82%] max-w-[320px] flex-col text-paper shadow-[8px_0_30px_rgba(0,0,0,0.4)]"
            style={{ background: 'linear-gradient(180deg, var(--shelf) 0%, var(--shelf-deep) 100%)' }}
          >
            <ChapterTree journal={journal} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}
    </div>
  )
}
