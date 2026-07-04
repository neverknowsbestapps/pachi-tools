// 誕生日カレンダーの「表示ON/OFF（enabled）」と「カスタム追加キャラ」を
// ブラウザの localStorage で管理する共通モジュール。
//
// - 公開カレンダー（BirthdayCalendar）と 管理ページ（BirthdayAdmin）で共有する。
// - enabled: ファイル側の既定値に localStorage の上書きを重ねて「実際に表示するか」を決める。
// - custom : 管理ページから手動追加したキャラ。localStorage に配列で保存。
// - localStorage は端末（ブラウザ）ごとなので、選択・追加内容は公開サイトには出ない。

import { birthdays, birthdayId, type Birthday } from './birthday-data'

const STORAGE_KEY = 'pachi-tools:birthday-selection'
const CUSTOM_KEY = 'pachi-tools:birthday-custom'

// エントリごとの既定の表示状態（enabled 省略時は true）
export function defaultEnabled(b: Birthday): boolean {
  return b.enabled !== false
}

// ── enabled 上書き（id -> boolean）──
export function loadOverrides(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, boolean>) : {}
  } catch {
    return {}
  }
}

export function saveOverrides(overrides: Record<string, boolean>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // 保存できなくても致命的ではないので握りつぶす
  }
}

export function isEnabled(b: Birthday, overrides: Record<string, boolean>): boolean {
  const id = birthdayId(b)
  return id in overrides ? overrides[id] : defaultEnabled(b)
}

// ── カスタム追加キャラ（localStorage 配列）──
export function loadCustom(): Birthday[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (c) =>
          c &&
          typeof c.name === 'string' &&
          typeof c.machine === 'string' &&
          typeof c.month === 'number' &&
          typeof c.day === 'number',
      )
      .map((c) => ({ ...c, custom: true }))
  } catch {
    return []
  }
}

export function saveCustom(list: Birthday[]): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list))
  } catch {
    // 握りつぶす
  }
}

// custom エントリの一意IDを作る
export function newCustomId(): string {
  return `custom:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`
}

// ファイル定義＋カスタムを合わせた全エントリ
export function getAllBirthdays(): Birthday[] {
  return [...birthdays, ...loadCustom()]
}

// 公開カレンダー用：表示対象（enabled）の誕生日だけを返す（カスタム含む）
export function getEnabledBirthdays(): Birthday[] {
  const overrides = loadOverrides()
  return getAllBirthdays().filter((b) => isEnabled(b, overrides))
}

export { STORAGE_KEY, CUSTOM_KEY }
