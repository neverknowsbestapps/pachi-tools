import { FeatureCard } from '../components/FeatureCard'
import { tools } from '../tools/registry'
import { games } from '../games/registry'
import type { Feature } from '../types'

// 機能が無いカテゴリはセクションごと表示しない
function Section({ title, features }: { title: string; features: Feature[] }) {
  if (features.length === 0) return null
  return (
    <section className="section">
      <h2 className="section-title">{title}</h2>
      <div className="card-grid">
        {features.map((feature) => (
          <FeatureCard key={feature.id} feature={feature} />
        ))}
      </div>
    </section>
  )
}

export function Home() {
  return (
    <main className="container">
      <header className="page-header">
        <h1>pachi-tools</h1>
        <p className="lead">パチンコ・スロットのメモ補助ツール集</p>
      </header>
      <Section title="ツール" features={tools} />
      <Section title="ゲーム" features={games} />
    </main>
  )
}
