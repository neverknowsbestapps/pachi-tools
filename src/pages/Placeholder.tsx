import { Link, useParams } from 'react-router-dom'
import { tools } from '../tools/registry'
import { games } from '../games/registry'
import type { Category } from '../types'

const registries = { tools, games }

// 各機能の中身がまだ無い間の共通ページ。
// 実機能を作るときは App.tsx のルートをこのコンポーネントから差し替える。
export function Placeholder({ category }: { category: Category }) {
  const { id } = useParams()
  const feature = registries[category].find((f) => f.id === id)

  return (
    <main className="container">
      <p className="breadcrumb">
        <Link to="/">← トップへ戻る</Link>
      </p>
      <h1>{feature ? feature.title : '不明な機能'}</h1>
      <p className="placeholder-note">
        {feature
          ? 'この機能は準備中です。'
          : '指定された機能は見つかりませんでした。'}
      </p>
    </main>
  )
}
