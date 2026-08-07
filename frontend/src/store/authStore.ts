import { create } from 'zustand'
import { authApi } from '@/api'
import type { User } from '@/types'

const TOKEN_KEY = 'inkwell_token'
const USER_KEY = 'inkwell_user'

interface AuthState {
  user: User | null
  token: string | null
  isGuest: boolean
  loading: boolean
  /** 启动时从 localStorage 恢复登录态 */
  hydrate: () => void
  /** 登录 */
  login: (email: string, password: string) => Promise<void>
  /** 注册 */
  register: (name: string, email: string, password: string) => Promise<void>
  /** 访客模式：纯本地，不调后端 */
  enterGuest: () => void
  /** 退出 */
  logout: () => void
}

function readUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: readUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isGuest: readUser()?.guest === true,
  loading: false,

  hydrate: () => {
    set({
      user: readUser(),
      token: localStorage.getItem(TOKEN_KEY),
      isGuest: readUser()?.guest === true,
    })
  },

  login: async (email, password) => {
    set({ loading: true })
    try {
      const { access_token, user } = await authApi.login({ email, password })
      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, token: access_token, isGuest: false, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  register: async (name, email, password) => {
    set({ loading: true })
    try {
      const { access_token, user } = await authApi.register({ name, email, password })
      localStorage.setItem(TOKEN_KEY, access_token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      set({ user, token: access_token, isGuest: false, loading: false })
    } catch (e) {
      set({ loading: false })
      throw e
    }
  },

  enterGuest: () => {
    const guest: User = {
      name: '墨客',
      email: 'guest@inkwell',
      guest: true,
      loginAt: Date.now(),
    }
    localStorage.setItem(USER_KEY, JSON.stringify(guest))
    localStorage.removeItem(TOKEN_KEY)
    set({ user: guest, token: null, isGuest: true })
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    set({ user: null, token: null, isGuest: false })
  },
}))

// 开发调试用
if (typeof window !== 'undefined') {
  ;(window as any).__authStore = useAuthStore
}
