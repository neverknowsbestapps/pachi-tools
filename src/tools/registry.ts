import type { Feature } from '../types'

// メモ補助系ツールの一覧。
// 機能を追加するときはこの配列に1要素足し、必要なら App.tsx のルートを
// Placeholder から専用コンポーネントに差し替える。
export const tools: Feature[] = [
  {
    id: 'trophy-memo',
    title: 'トロフィーメモ',
    description: '台番号ごとのトロフィー（0〜6）を表で記録・共有',
    category: 'tools',
  },
  {
    id: 'pachi-count',
    title: 'パチカウント',
    description: '遊技中に回転数を記録して回転率を計算',
    category: 'tools',
    href: 'https://neverknowsbestapps.github.io/rotation-counter/',
  },
]
