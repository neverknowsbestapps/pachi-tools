import { Link } from 'react-router-dom'
import type { Feature } from '../types'

// 機能1件を表すカード型リンク。タップするとその機能ページ（または別アプリ）へ遷移する。
export function FeatureCard({ feature }: { feature: Feature }) {
  const content = (
    <>
      <h3 className="card-title">{feature.title}</h3>
      <p className="card-desc">{feature.description}</p>
    </>
  )
  // href があれば別アプリ（外部URL）へのリンク、無ければ内部ページへ
  if (feature.href) {
    return (
      <a className="card" href={feature.href}>
        {content}
      </a>
    )
  }
  return (
    <Link className="card" to={`/${feature.category}/${feature.id}`}>
      {content}
    </Link>
  )
}
