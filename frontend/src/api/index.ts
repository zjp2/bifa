import http from './http'
import type {
  AuthResponse,
  Chapter,
  CreateChapterInput,
  CreateEntryInput,
  CreateJournalInput,
  Entry,
  Journal,
  UpdateEntryInput,
  User,
} from '@/types'

/** 认证相关 API */
export const authApi = {
  /** 注册 */
  register: (data: { name: string; email: string; password: string }) =>
    http.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  /** 登录 */
  login: (data: { email: string; password: string }) =>
    http.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  /** 获取当前用户 */
  me: () => http.get<{ user: User }>('/auth/me').then((r) => r.data),
}

/** 日记本 API */
export const journalApi = {
  /** 获取所有日记本（含 chapters.entries） */
  list: () => http.get<Journal[]>('/journals').then((r) => r.data),

  /** 创建日记本 */
  create: (data: CreateJournalInput) =>
    http.post<Journal>('/journals', data).then((r) => r.data),

  /** 更新日记本 */
  update: (id: string, data: Partial<CreateJournalInput>) =>
    http.patch<Journal>(`/journals/${id}`, data).then((r) => r.data),

  /** 删除日记本 */
  remove: (id: string) => http.delete(`/journals/${id}`).then((r) => r.data),
}

/** 章节 API */
export const chapterApi = {
  /** 创建章节 */
  create: (data: CreateChapterInput) =>
    http.post<Chapter>('/chapters', data).then((r) => r.data),

  /** 更新章节名 */
  update: (id: string, data: { name: string }) =>
    http.patch<Chapter>(`/chapters/${id}`, data).then((r) => r.data),

  /** 删除章节 */
  remove: (id: string) => http.delete(`/chapters/${id}`).then((r) => r.data),
}

/** 条目 API */
export const entryApi = {
  /** 获取单个条目 */
  get: (id: string) => http.get<Entry>(`/entries/${id}`).then((r) => r.data),

  /** 创建条目 */
  create: (data: CreateEntryInput) =>
    http.post<Entry>('/entries', data).then((r) => r.data),

  /** 更新条目 */
  update: (id: string, data: UpdateEntryInput) =>
    http.patch<Entry>(`/entries/${id}`, data).then((r) => r.data),

  /** 删除条目 */
  remove: (id: string) => http.delete(`/entries/${id}`).then((r) => r.data),
}
