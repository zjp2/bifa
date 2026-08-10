// 墨笺 · Inkwell Journal 类型定义

/** 用户身份 */
export interface User {
  id?: string
  name: string
  email: string
  guest?: boolean
  loginAt?: number
}

/** 登录 / 注册响应 */
export interface AuthResponse {
  access_token: string
  user: User
}

/** 日记条目 */
export interface Entry {
  id: string
  title: string
  subtitle?: string
  content: string // 富文本 HTML
  tags: string[]
  date: number | string // timestamp 或 ISO 字符串
  createdAt?: string
  updatedAt?: string
}

/** 章节 */
export interface Chapter {
  id: string
  name: string
  entries: Entry[]
  sortOrder?: number
}

/** 日记本 / 书 */
export interface Journal {
  id: string
  name: string
  description?: string
  desc?: string // 兼容原型字段
  color: string
  coverImage?: string | null
  chapters: Chapter[]
  sortOrder?: number
}

/** 创建日记本入参 */
export interface CreateJournalInput {
  name: string
  description?: string
  color?: string
  coverImage?: string | null
}

/** 创建章节入参 */
export interface CreateChapterInput {
  journalId: string
  name: string
}

/** 创建条目入参 */
export interface CreateEntryInput {
  chapterId: string
  title?: string
  subtitle?: string
  content?: string
  tags?: string[]
  date?: number | string
}

/** 更新条目入参 */
export interface UpdateEntryInput {
  title?: string
  subtitle?: string
  content?: string
  tags?: string[]
  date?: number | string
}

/** 6 种封面色 */
export const BOOK_COLORS: { name: string; value: string }[] = [
  { name: '朱砂红', value: '#8a2f1f' },
  { name: '鎏金', value: '#9a7b3a' },
  { name: '墨绿', value: '#5a6b3a' },
  { name: '深褐', value: '#4a3a2a' },
  { name: '藏青', value: '#2a3a5a' },
  { name: '紫檀', value: '#5a2a4a' },
]
