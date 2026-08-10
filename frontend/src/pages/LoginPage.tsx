import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const navigate = useNavigate()
  const toast = useUIStore((s) => s.toast)
  const { login, register, enterGuest, loading } = useAuthStore()
  const user = useAuthStore((s) => s.user)

  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // 已登录则直接跳走
  useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  const submit = async () => {
    setError('')
    if (mode === 'register' && !name.trim()) {
      setError('请填写你的姓名')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      setError('请填写有效邮箱')
      return
    }
    if (password.length < 4) {
      setError('密码至少 4 位')
      return
    }
    try {
      if (mode === 'register') {
        await register(name.trim(), email.trim(), password)
        toast(`欢迎入册，${name.trim()}`)
      } else {
        await login(email.trim(), password)
        toast('已登记入册')
      }
      navigate('/', { replace: true })
    } catch (e) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '登录失败，请稍后再试（或以访客身份进入）'
      setError(msg)
    }
  }

  const onGuest = () => {
    enterGuest()
    toast('欢迎，过客')
    navigate('/', { replace: true })
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
  }

  return (
    <div
      className="flex h-[100dvh] w-full items-center justify-center overflow-y-auto p-6"
      style={{
        background:
          'radial-gradient(ellipse at top, rgba(154,123,58,0.15), transparent 60%), linear-gradient(180deg, var(--paper) 0%, var(--paper-deep) 100%)',
      }}
    >
      <div className="animate-slideUp relative w-full max-w-[420px] rounded-[8px] border border-paper-shadow bg-paper p-12 px-9 pb-10 shadow-card">
        {/* 内描边装饰 */}
        <div className="pointer-events-none absolute inset-[10px] rounded-[4px] border border-margin-line" />

        {/* 品牌标识 */}
        <div className="mb-9 text-center">
          <div
            className="font-brush text-[52px] leading-none text-ink"
            style={{ letterSpacing: '6px', textShadow: '1px 2px 0 rgba(154,123,58,0.2)' }}
          >
            墨笺
          </div>
          <div className="mt-1.5 font-latin text-[13px] uppercase tracking-[6px] text-ink-faded">
            Inkwell Journal
          </div>
          <div className="mx-auto mt-[18px] h-px w-20 bg-gradient-to-r from-transparent via-gold to-transparent" />
        </div>

        <div className="mb-6 text-center font-latin text-[15px] italic tracking-wide text-ink-faded">
          — 以笔墨，叩开时光之门 —
        </div>

        {/* 模式切换 */}
        <div className="mb-6 flex items-center justify-center gap-5 font-latin text-[13px] italic tracking-wider">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`border-b pb-0.5 transition-colors ${
              mode === 'login' ? 'border-accent text-accent' : 'border-transparent text-ink-faded hover:text-ink'
            }`}
          >
            登记 · Sign In
          </button>
          <span className="text-margin-line">·</span>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`border-b pb-0.5 transition-colors ${
              mode === 'register' ? 'border-accent text-accent' : 'border-transparent text-ink-faded hover:text-ink'
            }`}
          >
            新册 · Register
          </button>
        </div>

        {/* 姓名（仅注册） */}
        {mode === 'register' && (
          <div className="mb-[18px]">
            <label className="modal-label">姓名 / Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={onKey}
              placeholder="请输入你的名字"
              autoComplete="name"
              className="modal-input"
            />
          </div>
        )}

        <div className="mb-[18px]">
          <label className="modal-label">邮箱 / Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={onKey}
            placeholder="name@example.com"
            autoComplete="email"
            className="modal-input"
          />
        </div>

        <div className="mb-[18px]">
          <label className="modal-label">密码 / Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={onKey}
            placeholder="至少 4 位"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            className="modal-input"
          />
        </div>

        {error && (
          <div className="mb-4 border-l-[3px] border-accent bg-[rgba(138,47,31,0.08)] px-3.5 py-2.5 font-cn text-[13px] text-accent">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="btn-ink w-full disabled:opacity-70"
          >
            {loading ? '· · ·' : mode === 'login' ? '登 · 记' : '立 · 册'}
          </button>
          <button type="button" onClick={onGuest} className="btn-ghost w-full">
            过客 · 以访客身份进入
          </button>
        </div>

        <div className="mt-[22px] text-center font-latin text-[11px] italic leading-relaxed tracking-wide text-ink-faded">
          访客模式 · 数据仅存于浏览器本地
          <br />
          按 <kbd className="rounded-[3px] border border-margin-line bg-paper-deep px-1.5 py-px font-mono text-[10px] not-italic text-ink-soft">Esc</kbd> 关闭弹窗 ·
          <kbd className="ml-1 rounded-[3px] border border-margin-line bg-paper-deep px-1.5 py-px font-mono text-[10px] not-italic text-ink-soft">Ctrl/⌘ + S</kbd> 存稿
        </div>
      </div>
    </div>
  )
}
