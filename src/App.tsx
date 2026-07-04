import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Placeholder } from './pages/Placeholder'
import { TrophyMemo } from './tools/TrophyMemo'
import { BirthdayCalendar } from './tools/BirthdayCalendar'
import { BirthdayAdmin } from './tools/BirthdayAdmin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* 実装済みツールは専用コンポーネントへ。未実装は下の Placeholder */}
      <Route path="/tools/trophy-memo" element={<TrophyMemo />} />
      <Route path="/tools/birthday-calendar" element={<BirthdayCalendar />} />
      {/* 非公開の管理ページ（トップに掲載しない・URL直打ちで利用） */}
      <Route path="/tools/birthday-admin" element={<BirthdayAdmin />} />
      <Route path="/tools/:id" element={<Placeholder category="tools" />} />
      <Route path="/games/:id" element={<Placeholder category="games" />} />
      {/* 未定義パスはトップへ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
