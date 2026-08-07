import { create } from 'zustand'
import { chapterApi, entryApi, journalApi } from '@/api'
import { useAuthStore } from './authStore'
import { uid } from '@/utils'
import type { Chapter, Entry, Journal } from '@/types'

const GUEST_DATA_KEY = 'inkwell_data_v3'

interface GuestData {
  journals: Journal[]
  collapsedChapters: Record<string, boolean>
}

interface JournalState {
  journals: Journal[]
  loading: boolean
  /** 折叠的章节 id 集合 */
  collapsedChapters: Record<string, boolean>

  /** 初始化：根据是否访客决定从本地或后端载入 */
  init: () => Promise<void>
  /** 持久化（仅访客模式写 localStorage） */
  persist: () => void

  /** 新建日记本 */
  createJournal: (input: { name: string; description?: string; color?: string; coverImage?: string | null }) => Promise<Journal>
  /** 更新日记本 */
  updateJournal: (id: string, patch: Partial<Pick<Journal, 'name' | 'description' | 'color' | 'coverImage'>>) => Promise<void>
  /** 删除日记本 */
  deleteJournal: (id: string) => Promise<void>

  /** 新建章节 */
  createChapter: (journalId: string, name: string) => Promise<Chapter | null>
  /** 重命名章节 */
  renameChapter: (id: string, name: string) => Promise<void>
  /** 删除章节 */
  deleteChapter: (id: string) => Promise<void>

  /** 新建条目 */
  createEntry: (
    journalId: string,
    chapterId: string,
    partial?: Partial<Entry>,
  ) => Promise<Entry | null>
  /** 更新条目 */
  updateEntry: (id: string, patch: Partial<Entry>) => Promise<void>
  /** 删除条目 */
  deleteEntry: (id: string) => Promise<void>

  /** 折叠/展开章节 */
  toggleChapter: (id: string) => void

  /** 根据 id 查找 */
  getJournal: (id: string) => Journal | undefined
  getChapter: (journalId: string, chapterId: string) => Chapter | undefined
  getEntry: (journalId: string, chapterId: string, entryId: string) => Entry | undefined
}

const isGuest = () => useAuthStore.getState().isGuest

/** 后端 date 字段要求 ISO 字符串：把时间戳/字符串统一成 ISO 字符串 */
const toIsoDate = (d: number | string | undefined): string | undefined =>
  d === undefined ? undefined : typeof d === 'number' ? new Date(d).toISOString() : d

/** 访客模式：示例数据 */
function seedSample(): Journal[] {
  const now = Date.now()
  return [
    {
      id: 'b1',
      name: '随想录',
      desc: '日常所思所感',
      description: '日常所思所感',
      color: '#8a2f1f',
      chapters: [
        {
          id: 'c1',
          name: '春日随笔',
          entries: [
            {
              id: 'e1',
              title: '雨后的清晨',
              subtitle: 'after the rain',
              date: now - 86400000,
              tags: ['清晨', '雨', '随想'],
              content:
                '<p>清晨推窗，空气里满是湿润的泥土气息。檐角还滴着昨夜的雨，一滴、一滴，敲在青石板上，像是谁在数着时光的步子。</p><p>泡一壶龙井，看茶叶在杯中翻转沉浮，心也跟着静了下来。这样的早晨，宜读几页旧书，宜写几行字，宜什么都不做。</p><blockquote>雨后万物新，人心亦当如是。</blockquote>',
            },
            {
              id: 'e2',
              title: '巷口的老书店',
              subtitle: 'the old bookshop',
              date: now - 2 * 86400000,
              tags: ['书店', '怀旧'],
              content:
                '<p>巷口那家老书店还在。推门进去，木地板吱呀作响，老板抬头看了我一眼，又低下头继续读他的书。</p><p>我在角落翻到一本八十年代的诗集，封皮已经泛黄，扉页上还有前任主人的题字。书是有记忆的，每一任读者都留下了自己的痕迹。</p>',
            },
          ],
        },
        {
          id: 'c2',
          name: '夜读札记',
          entries: [
            {
              id: 'e3',
              title: '灯下读庄子',
              subtitle: 'reading Zhuangzi',
              date: now - 3 * 86400000,
              tags: ['夜读', '庄子'],
              content:
                '<p>夜深人静，挑灯读《逍遥游》。庄子的文字像一阵风，吹散日间积攒的琐碎。</p><p>"乘天地之正，而御六气之辩，以游无穷者。"——这样的境界，凡人虽不能至，心向往之。</p>',
            },
          ],
        },
      ],
    },
    {
      id: 'b2',
      name: '旅次手记',
      desc: '行走于山海之间',
      description: '行走于山海之间',
      color: '#5a6b3a',
      chapters: [
        {
          id: 'c3',
          name: '海边',
          entries: [
            {
              id: 'e4',
              title: '海边的黄昏',
              subtitle: 'dusk by the sea',
              date: now - 5 * 86400000,
              tags: ['旅行', '海', '黄昏'],
              content:
                '<p>抵达海边时，太阳正沉入海平面。整片海被染成金红色，浪花一层层涌上来，像是大海在低声诉说着什么。</p>',
            },
          ],
        },
      ],
    },
  ]
}

function readGuestData(): GuestData {
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY)
    if (raw) {
      const d = JSON.parse(raw) as GuestData
      return {
        journals: d.journals || [],
        collapsedChapters: d.collapsedChapters || {},
      }
    }
  } catch {
    /* ignore */
  }
  return { journals: [], collapsedChapters: {} }
}

/** 标准化后端返回的 journal：把 date 字符串统一成 number */
function normalizeJournal(j: Journal): Journal {
  return {
    ...j,
    desc: j.desc ?? j.description ?? '',
    description: j.description ?? j.desc ?? '',
    chapters: (j.chapters || []).map((c) => ({
      ...c,
      entries: (c.entries || []).map((e) => ({
        ...e,
        date: typeof e.date === 'string' ? new Date(e.date).getTime() : e.date,
        tags: e.tags || [],
      })),
    })),
  }
}

export const useJournalStore = create<JournalState>((set, get) => ({
  journals: [],
  loading: false,
  collapsedChapters: {},

  init: async () => {
    if (isGuest()) {
      let data = readGuestData()
      if (data.journals.length === 0) {
        data = { journals: seedSample(), collapsedChapters: {} }
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data))
      }
      set({ journals: data.journals, collapsedChapters: data.collapsedChapters })
      return
    }
    // 后端模式
    set({ loading: true })
    try {
      const list = await journalApi.list()
      set({ journals: (list || []).map(normalizeJournal), loading: false })
    } catch (e) {
      set({ loading: false })
      // 后端不可用时，回退为空，避免阻塞 UI
      console.warn('[journalStore] 拉取日记本失败：', e)
    }
  },

  persist: () => {
    if (!isGuest()) return
    const { journals, collapsedChapters } = get()
    localStorage.setItem(GUEST_DATA_KEY, JSON.stringify({ journals, collapsedChapters }))
  },

  createJournal: async (input) => {
    if (isGuest()) {
      const journal: Journal = {
        id: uid('b'),
        name: input.name,
        desc: input.description ?? '',
        description: input.description ?? '',
        color: input.color ?? '#8a2f1f',
        coverImage: input.coverImage ?? null,
        chapters: [],
      }
      set((s) => ({ journals: [...s.journals, journal] }))
      get().persist()
      return journal
    }
    const created = await journalApi.create({
      name: input.name,
      description: input.description,
      color: input.color,
      coverImage: input.coverImage,
    })
    const j = normalizeJournal(created)
    set((s) => ({ journals: [...s.journals, j] }))
    return j
  },

  updateJournal: async (id, patch) => {
    set((s) => ({
      journals: s.journals.map((j) =>
        j.id === id
          ? {
              ...j,
              name: patch.name ?? j.name,
              desc: patch.description ?? j.desc,
              description: patch.description ?? j.description,
              color: patch.color ?? j.color,
              coverImage: patch.coverImage !== undefined ? patch.coverImage : j.coverImage,
            }
          : j,
      ),
    }))
    get().persist()
    if (!isGuest()) {
      await journalApi.update(id, {
        name: patch.name,
        description: patch.description,
        color: patch.color,
        coverImage: patch.coverImage,
      }).catch((e) => console.warn('[journalStore] 更新日记本失败：', e))
    }
  },

  deleteJournal: async (id) => {
    set((s) => ({ journals: s.journals.filter((j) => j.id !== id) }))
    get().persist()
    if (!isGuest()) {
      await journalApi.remove(id).catch((e) => console.warn('[journalStore] 删除日记本失败：', e))
    }
  },

  createChapter: async (journalId, name) => {
    if (isGuest()) {
      const chapter: Chapter = { id: uid('c'), name, entries: [] }
      set((s) => ({
        journals: s.journals.map((j) =>
          j.id === journalId ? { ...j, chapters: [...j.chapters, chapter] } : j,
        ),
      }))
      get().persist()
      return chapter
    }
    try {
      const created = await chapterApi.create({ journalId, name })
      const c: Chapter = { ...created, entries: created.entries || [] }
      set((s) => ({
        journals: s.journals.map((j) =>
          j.id === journalId ? { ...j, chapters: [...j.chapters, c] } : j,
        ),
      }))
      return c
    } catch (e) {
      console.warn('[journalStore] 创建章节失败：', e)
      return null
    }
  },

  renameChapter: async (id, name) => {
    set((s) => ({
      journals: s.journals.map((j) => ({
        ...j,
        chapters: j.chapters.map((c) => (c.id === id ? { ...c, name } : c)),
      })),
    }))
    get().persist()
    if (!isGuest()) {
      await chapterApi.update(id, { name }).catch((e) => console.warn('[journalStore] 重命名章节失败：', e))
    }
  },

  deleteChapter: async (id) => {
    set((s) => ({
      journals: s.journals.map((j) => ({
        ...j,
        chapters: j.chapters.filter((c) => c.id !== id),
      })),
    }))
    get().persist()
    if (!isGuest()) {
      await chapterApi.remove(id).catch((e) => console.warn('[journalStore] 删除章节失败：', e))
    }
  },

  createEntry: async (journalId, chapterId, partial) => {
    const now = Date.now()
    if (isGuest()) {
      const entry: Entry = {
        id: uid('e'),
        title: partial?.title ?? '',
        subtitle: partial?.subtitle ?? '',
        date: partial?.date ?? now,
        content: partial?.content ?? '',
        tags: partial?.tags ?? [],
      }
      set((s) => ({
        journals: s.journals.map((j) =>
          j.id === journalId
            ? {
                ...j,
                chapters: j.chapters.map((c) =>
                  c.id === chapterId ? { ...c, entries: [entry, ...c.entries] } : c,
                ),
              }
            : j,
        ),
      }))
      get().persist()
      return entry
    }
    try {
      const created = await entryApi.create({
        chapterId,
        title: partial?.title ?? '',
        subtitle: partial?.subtitle ?? '',
        content: partial?.content ?? '',
        tags: partial?.tags ?? [],
        date: toIsoDate(partial?.date ?? now),
      })
      const e: Entry = {
        ...created,
        date: typeof created.date === 'string' ? new Date(created.date).getTime() : created.date,
        tags: created.tags || [],
      }
      set((s) => ({
        journals: s.journals.map((j) =>
          j.id === journalId
            ? {
                ...j,
                chapters: j.chapters.map((c) =>
                  c.id === chapterId ? { ...c, entries: [e, ...c.entries] } : c,
                ),
              }
            : j,
        ),
      }))
      return e
    } catch (err) {
      console.warn('[journalStore] 创建条目失败：', err)
      return null
    }
  },

  updateEntry: async (id, patch) => {
    set((s) => ({
      journals: s.journals.map((j) => ({
        ...j,
        chapters: j.chapters.map((c) => ({
          ...c,
          entries: c.entries.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      })),
    }))
    get().persist()
    if (!isGuest()) {
      await entryApi
        .update(id, {
          title: patch.title,
          subtitle: patch.subtitle,
          content: patch.content,
          tags: patch.tags,
          date: toIsoDate(patch.date),
        })
        .catch((e) => console.warn('[journalStore] 更新条目失败：', e))
    }
  },

  deleteEntry: async (id) => {
    set((s) => ({
      journals: s.journals.map((j) => ({
        ...j,
        chapters: j.chapters.map((c) => ({
          ...c,
          entries: c.entries.filter((e) => e.id !== id),
        })),
      })),
    }))
    get().persist()
    if (!isGuest()) {
      await entryApi.remove(id).catch((e) => console.warn('[journalStore] 删除条目失败：', e))
    }
  },

  toggleChapter: (id) => {
    set((s) => ({
      collapsedChapters: { ...s.collapsedChapters, [id]: !s.collapsedChapters[id] },
    }))
    get().persist()
  },

  getJournal: (id) => get().journals.find((j) => j.id === id),
  getChapter: (journalId, chapterId) =>
    get().journals.find((j) => j.id === journalId)?.chapters.find((c) => c.id === chapterId),
  getEntry: (journalId, chapterId, entryId) =>
    get()
      .journals.find((j) => j.id === journalId)
      ?.chapters.find((c) => c.id === chapterId)
      ?.entries.find((e) => e.id === entryId),
}))
