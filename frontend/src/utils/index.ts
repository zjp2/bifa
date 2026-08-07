/** 生成短随机 id */
export const uid = (prefix = ''): string =>
  prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3)

/** 转义 HTML，防注入 */
export function escapeHtml(s: unknown): string {
  return String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      (
        ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;',
        }) as Record<string, string>
      )[c],
  )
}

/** 把日期格式化为中英双行 */
export function fmtDate(ts: number | string | Date): {
  full: string
  en: string
  short: string
  iso: string
} {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) {
    return { full: '—', en: '—', short: '—', iso: '' }
  }
  const enMon = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const cnMon = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    full: `${d.getFullYear()} · ${cnMon[d.getMonth()]}月 · ${d.getDate()}日`,
    en: `${enMon[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`,
    short: `${d.getMonth() + 1}月${d.getDate()}日`,
    iso: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
  }
}

/** 取姓名首字作为头像 */
export function initialsOf(name?: string | null): string {
  if (!name) return '墨'
  const t = name.trim()
  return t ? t.charAt(0) : '墨'
}

/** debounce */
export function debounce<T extends (...args: never[]) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout> | undefined
  const wrapped = (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
  wrapped.cancel = () => {
    if (timer) clearTimeout(timer)
  }
  return wrapped
}
