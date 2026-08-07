import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useJournalStore } from '@/store/journalStore'
import ToastHost from '@/components/ToastHost'
import LoginPage from '@/pages/LoginPage'
import BookshelfPage from '@/pages/BookshelfPage'
import JournalLayout from '@/pages/JournalLayout'
import EntryEditorPage from '@/pages/EntryEditorPage'
import EmptyEditor from '@/components/EmptyEditor'

/** 路由守卫：未登录跳 /login */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user)
  const location = useLocation()
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return <>{children}</>
}

export default function App() {
  const user = useAuthStore((s) => s.user)
  const initJournals = useJournalStore((s) => s.init)

  // 登录态变化时，载入日记本数据
  useEffect(() => {
    if (user) {
      void initJournals()
    }
  }, [user, initJournals])

  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <BookshelfPage />
            </RequireAuth>
          }
        />

        <Route
          path="/journal/:journalId"
          element={
            <RequireAuth>
              <JournalLayout />
            </RequireAuth>
          }
        >
          <Route index element={<EmptyEditor />} />
          <Route path="entry/:entryId" element={<EntryEditorPage />} />
        </Route>

        {/* 兜底 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </>
  )
}
