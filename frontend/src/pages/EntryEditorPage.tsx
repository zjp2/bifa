import { useParams } from 'react-router-dom'
import { useJournalStore } from '@/store/journalStore'
import EmptyEditor from '@/components/EmptyEditor'
import EntryEditor from '@/editor/EntryEditor'
import type { Chapter, Entry } from '@/types'

/** 编辑器路由页：解析 journalId / entryId，定位条目后渲染编辑器 */
export default function EntryEditorPage() {
  const { journalId, entryId } = useParams()
  const journals = useJournalStore((s) => s.journals)

  const journal = journals.find((j) => j.id === journalId)
  let chapter: Chapter | undefined
  let entry: Entry | undefined
  if (journal) {
    for (const c of journal.chapters) {
      const e = c.entries.find((en) => en.id === entryId)
      if (e) {
        chapter = c
        entry = e
        break
      }
    }
  }

  if (!journal || !entry) {
    return <EmptyEditor />
  }

  // 用 entryId 作 key，切换条目时整体重建，保证内容与状态正确同步
  return <EntryEditor key={entry.id} entry={entry} chapter={chapter} />
}
