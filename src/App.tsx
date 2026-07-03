import { Navigate, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { Placeholder } from './pages/Placeholder'
import { TrophyMemo } from './tools/TrophyMemo'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* 実装済みツールは専用コンポーネントへ。未実装は下の Placeholder */}
      <Route path="/tools/trophy-memo" element={<TrophyMemo />} />
      <Route path="/tools/:id" element={<Placeholder category="tools" />} />
      <Route path="/games/:id" element={<Placeholder category="games" />} />
      {/* 未定義パスはトップへ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
