import { create } from 'zustand'

interface Toast {
  id: number
  msg: string
}

interface UIState {
  toasts: Toast[]
  toast: (msg: string) => void
  dismiss: (id: number) => void
}

let seq = 0

export const useUIStore = create<UIState>((set) => ({
  toasts: [],
  toast: (msg) => {
    const id = ++seq
    set((s) => ({ toasts: [...s.toasts, { id, msg }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 2200)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))
