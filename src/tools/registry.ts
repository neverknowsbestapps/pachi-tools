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
  {
    id: 'birthday-calendar',
    title: 'スロット誕生日カレンダー',
    description: 'スロット登場キャラの誕生日をカレンダー・一覧で表示',
    category: 'tools',
  },
  {
    id: 'birthday-admin',
    title: '誕生日カレンダー：表示設定',
    description: 'カレンダーに載せる登場キャラをチェックで選択（この端末に保存）',
    category: 'tools',
  },
]
