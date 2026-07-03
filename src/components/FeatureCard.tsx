import { Link } from 'react-router-dom'
import type { Feature } from '../types'

// 機能1件を表すカード型リンク。タップするとその機能ページへ遷移する。
export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <Link className="card" to={`/${feature.category}/${feature.id}`}>
      <h3 className="card-title">{feature.title}</h3>
      <p className="card-desc">{feature.description}</p>
    </Link>
  )
}
