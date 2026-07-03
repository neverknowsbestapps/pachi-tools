import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './TrophyMemo.css'

// 列の見出しの種類：回転数（0〜9000）か 時間。どちらも表ヘッダーのプルダウンで選ぶ
type ColumnMode = 'count' | 'time'
// セルの表示：数字（2〜6）か トロフィー（絵文字）
type TrophyMode = 'num' | 'emoji'
// 表の向き：通常 or 行列入替（転置）
type Orientation = 'normal' | 'swap'

type Column = { id: string; count: string; time: string }
type Row = { id: string; dai: string } // dai = 台番号（4桁）
type Cells = Record<string, string> // key: `${rowId}:${colId}` -> トロフィー値

type SavedState = {
  mode: ColumnMode
  trophyMode: TrophyMode
  orientation: Orientation
  columns: Column[]
  rows: Row[]
  cells: Cells
}

const STORAGE_KEY = 'pachi-tools:trophy-memo'

// 先頭列のデフォルト値
const START_COUNT = '0'
const START_TIME = '09:00'

// 回転数の選択肢（0〜9000・1000刻み）。ヘッダーの先頭に "-"（未入力）も出す
const COUNT_OPTIONS = Array.from({ length: 10 }, (_, i) => String(i * 1000))
// 時間の選択肢（1時間おき・全日）
const TIME_OPTIONS = Array.from({ length: 24 }, (_, h) => `${String(h).padStart(2, '0')}:00`)

// セルの値。内部値(value)は共通で、表示だけ数字/絵文字を切替える
const TROPHY_VALUES: { value: string; num: string; emoji: string }[] = [
  { value: '', num: '-', emoji: '-' },
  { value: 'none', num: 'なし', emoji: 'なし' },
  { value: '2', num: '2', emoji: '🥉' },
  { value: '3', num: '3', emoji: '🥈' },
  { value: '4', num: '4', emoji: '🥇' },
  { value: '5', num: '5', emoji: '🦒' },
  { value: '6', num: '6', emoji: '🌈' },
]

const clampCount = (n: number) => Math.max(0, Math.min(9000, n))

// "HH:MM" に時間を足す（24時間で循環、2桁表記）
function addHoursToTime(hhmm: string, hours: number): string {
  const [h, m] = hhmm.split(':').map(Number)
  const total = ((h || 0) * 60 + (m || 0) + hours * 60 + 24 * 60) % (24 * 60)
  const hh = String(Math.floor(total / 60)).padStart(2, '0')
  const mm = String(total % 60).padStart(2, '0')
  return `${hh}:${mm}`
}

// 直前の列から +1000 / +1時間 した新しい列
function nextColumn(cols: Column[]): Column {
  const last = cols[cols.length - 1]
  if (!last) return { id: crypto.randomUUID(), count: START_COUNT, time: START_TIME }
  return {
    id: crypto.randomUUID(),
    count: String(clampCount((Number(last.count) || 0) + 1000)),
    time: addHoursToTime(last.time, 1),
  }
}

// 初期状態：行1・列2（0/09:00, 1000/10:00）
function createDefaultState(): SavedState {
  const first: Column = { id: crypto.randomUUID(), count: START_COUNT, time: START_TIME }
  return {
    mode: 'count',
    trophyMode: 'num',
    orientation: 'normal',
    columns: [first, nextColumn([first])],
    rows: [{ id: crypto.randomUUID(), dai: '' }],
    cells: {},
  }
}

function loadState(): SavedState {
  const base = createDefaultState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<SavedState>
    const columns = (parsed.columns ?? base.columns).map((c) => ({
      id: c.id ?? crypto.randomUUID(),
      count: c.count ?? START_COUNT,
      time: c.time ?? START_TIME,
    }))
    return {
      mode: parsed.mode ?? base.mode,
      trophyMode: parsed.trophyMode ?? base.trophyMode,
      orientation: parsed.orientation ?? base.orientation,
      columns,
      rows: parsed.rows ?? base.rows,
      cells: parsed.cells ?? {},
    }
  } catch {
    return base
  }
}

const cellKey = (rowId: string, colId: string) => `${rowId}:${colId}`

// --- テキスト出力用 ---
const displayCount = (c: string) => (c === '' ? '-' : c)
const displayDai = (d: string) => (d === '' ? '-' : d)
const displayTrophy = (value: string, mode: TrophyMode) => {
  const v = TROPHY_VALUES.find((x) => x.value === value) ?? TROPHY_VALUES[0]
  return mode === 'num' ? v.num : v.emoji
}

// 現在の表を2次元配列に（向き・見出し種別・数字/トロフィーを反映）
function buildGrid(s: SavedState): string[][] {
  const colHeader = (col: Column) =>
    s.mode === 'count' ? displayCount(col.count) : col.time
  const cell = (row: Row, col: Column) =>
    displayTrophy(s.cells[cellKey(row.id, col.id)] ?? '', s.trophyMode)
  const grid: string[][] = []
  if (s.orientation === 'normal') {
    grid.push(['台番号', ...s.columns.map(colHeader)])
    for (const row of s.rows) {
      grid.push([displayDai(row.dai), ...s.columns.map((col) => cell(row, col))])
    }
  } else {
    grid.push([s.mode === 'count' ? '回転数' : '時間', ...s.rows.map((r) => displayDai(r.dai))])
    for (const col of s.columns) {
      grid.push([colHeader(col), ...s.rows.map((row) => cell(row, col))])
    }
  }
  return grid
}

// 文字の表示幅（全角・絵文字は2、半角は1）— 等幅フォントでの桁揃え用
function charWidth(ch: string): number {
  const code = ch.codePointAt(0) ?? 0
  if (
    (code >= 0x1100 && code <= 0x115f) ||
    code === 0x2329 ||
    code === 0x232a ||
    (code >= 0x2e80 && code <= 0xa4cf && code !== 0x303f) ||
    (code >= 0xac00 && code <= 0xd7a3) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xfe30 && code <= 0xfe6f) ||
    (code >= 0xff00 && code <= 0xff60) ||
    (code >= 0xffe0 && code <= 0xffe6) ||
    (code >= 0x1f300 && code <= 0x1fbff) ||
    (code >= 0x20000 && code <= 0x3fffd)
  ) {
    return 2
  }
  return 1
}

function strWidth(str: string): number {
  let w = 0
  for (const ch of str) w += charWidth(ch)
  return w
}

// 桁を揃えたテキストに整形
function formatText(s: SavedState): string {
  const grid = buildGrid(s)
  const colCount = Math.max(0, ...grid.map((r) => r.length))
  const widths = Array.from({ length: colCount }, (_, c) =>
    Math.max(0, ...grid.map((r) => strWidth(r[c] ?? ''))),
  )
  return grid
    .map((row) =>
      row
        .map((cell, c) => cell + ' '.repeat(Math.max(0, widths[c] - strWidth(cell))))
        .join('  ')
        .replace(/\s+$/, ''),
    )
    .join('\n')
}

export function TrophyMemo() {
  const [state, setState] = useState<SavedState>(loadState)
  const [copied, setCopied] = useState(false)
  const outputRef = useRef<HTMLTextAreaElement>(null)

  // 変更のたびに localStorage へ自動保存 & コピー表示をリセット
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    setCopied(false)
  }, [state])

  const setMode = (mode: ColumnMode) => setState((s) => ({ ...s, mode }))
  const setTrophyMode = (trophyMode: TrophyMode) =>
    setState((s) => ({ ...s, trophyMode }))
  const setOrientation = (orientation: Orientation) =>
    setState((s) => ({ ...s, orientation }))

  // 台番号（データ上の行）
  const addRow = () =>
    setState((s) => ({
      ...s,
      rows: [...s.rows, { id: crypto.randomUUID(), dai: '' }],
    }))

  const removeRow = (id: string) =>
    setState((s) => {
      const cells = { ...s.cells }
      for (const k of Object.keys(cells)) {
        if (k.startsWith(`${id}:`)) delete cells[k]
      }
      return { ...s, rows: s.rows.filter((r) => r.id !== id), cells }
    })

  const setDai = (id: string, value: string) =>
    setState((s) => ({
      ...s,
      rows: s.rows.map((r) =>
        r.id === id ? { ...r, dai: value.replace(/\D/g, '').slice(0, 4) } : r,
      ),
    }))

  // 見出し（データ上の列）
  const addColumn = () =>
    setState((s) => ({ ...s, columns: [...s.columns, nextColumn(s.columns)] }))

  const removeColumn = (colId: string) =>
    setState((s) => {
      const cells = { ...s.cells }
      for (const k of Object.keys(cells)) {
        if (k.endsWith(`:${colId}`)) delete cells[k]
      }
      return { ...s, columns: s.columns.filter((c) => c.id !== colId), cells }
    })

  const setColumnField = (colId: string, patch: Partial<Column>) =>
    setState((s) => ({
      ...s,
      columns: s.columns.map((c) => (c.id === colId ? { ...c, ...patch } : c)),
    }))

  const setCell = (rowId: string, colId: string, value: string) =>
    setState((s) => ({ ...s, cells: { ...s.cells, [cellKey(rowId, colId)]: value } }))

  const clearAll = () => {
    if (window.confirm('入力内容をすべて消去しますか？')) setState(createDefaultState())
  }

  const copyText = async () => {
    const text = outputRef.current?.value ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      return
    } catch {
      /* フォールバックへ */
    }
    const ta = outputRef.current
    if (ta) {
      ta.focus()
      ta.select()
      try {
        if (document.execCommand('copy')) {
          setCopied(true)
          return
        }
      } catch {
        /* noop */
      }
    }
    setCopied(false) // 失敗時はテキスト欄から手動でコピー可能
  }

  // --- セル・見出しの描画部品（向きが変わっても中身は共通） ---
  const renderDaiHead = (row: Row) => (
    <span className="dai-head">
      <input
        className="dai-input"
        inputMode="numeric"
        value={row.dai}
        placeholder="-"
        maxLength={4}
        onChange={(e) => setDai(row.id, e.target.value)}
      />
      <button
        type="button"
        className="del"
        aria-label="この台番号を削除"
        onClick={() => removeRow(row.id)}
      >
        ×
      </button>
    </span>
  )

  const renderValueHead = (col: Column) => (
    <span className="col-head">
      {state.mode === 'count' ? (
        <select
          className="head-select"
          value={col.count}
          onChange={(e) => setColumnField(col.id, { count: e.target.value })}
        >
          <option value="">-</option>
          {COUNT_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      ) : (
        <select
          className="head-select"
          value={col.time}
          onChange={(e) => setColumnField(col.id, { time: e.target.value })}
        >
          {TIME_OPTIONS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        className="col-del"
        aria-label="この見出しを削除"
        onClick={() => removeColumn(col.id)}
      >
        ×
      </button>
    </span>
  )

  const renderCell = (row: Row, col: Column) => (
    <select
      value={state.cells[cellKey(row.id, col.id)] ?? ''}
      onChange={(e) => setCell(row.id, col.id, e.target.value)}
    >
      {TROPHY_VALUES.map((v) => (
        <option key={v.value} value={v.value}>
          {state.trophyMode === 'num' ? v.num : v.emoji}
        </option>
      ))}
    </select>
  )

  const swap = state.orientation === 'swap'
  const modeLabel = state.mode === 'count' ? '回転数' : '時間'
  // 「列を追加（右端）」「行を追加（下端）」は、向きに応じて対象を入れ替える
  const addVisualColumn = swap ? addRow : addColumn
  const addVisualRow = swap ? addColumn : addRow
  const addColBtn = (
    <th className="add-col">
      <button type="button" className="add-btn" aria-label="列を追加" onClick={addVisualColumn}>
        ＋
      </button>
    </th>
  )
  const addRowSpan = (swap ? state.rows.length : state.columns.length) + 2
  const addRowTr = (
    <tr className="add-row-tr">
      <td className="add-row-cell" colSpan={addRowSpan}>
        <button type="button" className="add-btn" onClick={addVisualRow}>
          ＋ 行を追加
        </button>
      </td>
    </tr>
  )

  const outputText = formatText(state)

  return (
    <main className="container trophy">
      <p className="breadcrumb">
        <Link to="/">← トップへ戻る</Link>
      </p>
      <h1>トロフィーメモ</h1>

      {/* 1. 表 */}
      <div className="trophy-table-wrap">
        <table className="trophy-table">
          {!swap ? (
            // 通常：行＝台番号、列＝見出し（回転数/時間）
            <>
              <thead>
                <tr>
                  <th className="corner">台番号</th>
                  {state.columns.map((col) => (
                    <th key={col.id}>{renderValueHead(col)}</th>
                  ))}
                  {addColBtn}
                </tr>
              </thead>
              <tbody>
                {state.rows.map((row) => (
                  <tr key={row.id}>
                    <td className="rowhead">{renderDaiHead(row)}</td>
                    {state.columns.map((col) => (
                      <td key={col.id}>{renderCell(row, col)}</td>
                    ))}
                    <td className="add-col-cell" />
                  </tr>
                ))}
                {addRowTr}
              </tbody>
            </>
          ) : (
            // 行列入替：行＝見出し（回転数/時間）、列＝台番号
            <>
              <thead>
                <tr>
                  <th className="corner">{modeLabel}</th>
                  {state.rows.map((row) => (
                    <th key={row.id}>{renderDaiHead(row)}</th>
                  ))}
                  {addColBtn}
                </tr>
              </thead>
              <tbody>
                {state.columns.map((col) => (
                  <tr key={col.id}>
                    <td className="rowhead">{renderValueHead(col)}</td>
                    {state.rows.map((row) => (
                      <td key={row.id}>{renderCell(row, col)}</td>
                    ))}
                    <td className="add-col-cell" />
                  </tr>
                ))}
                {addRowTr}
              </tbody>
            </>
          )}
        </table>
      </div>

      {/* 2. 設定 */}
      <section className="trophy-section">
        <h2 className="trophy-section-title">設定</h2>
        <div className="trophy-config">
          <div className="toggle-group">
            <div className="mode-toggle">
              <button
                type="button"
                className={state.mode === 'count' ? 'active' : ''}
                onClick={() => setMode('count')}
              >
                回転数
              </button>
              <button
                type="button"
                className={state.mode === 'time' ? 'active' : ''}
                onClick={() => setMode('time')}
              >
                時間
              </button>
            </div>
            <div className="mode-toggle">
              <button
                type="button"
                className={state.trophyMode === 'num' ? 'active' : ''}
                onClick={() => setTrophyMode('num')}
              >
                数字
              </button>
              <button
                type="button"
                className={state.trophyMode === 'emoji' ? 'active' : ''}
                onClick={() => setTrophyMode('emoji')}
              >
                トロフィー
              </button>
            </div>
            <div className="mode-toggle">
              <button
                type="button"
                className={!swap ? 'active' : ''}
                onClick={() => setOrientation('normal')}
              >
                通常
              </button>
              <button
                type="button"
                className={swap ? 'active' : ''}
                onClick={() => setOrientation('swap')}
              >
                行列入替
              </button>
            </div>
          </div>
          <button type="button" className="ghost-btn" onClick={clearAll}>
            全消去
          </button>
        </div>
      </section>

      {/* 3. テキスト出力 */}
      <section className="trophy-section">
        <h2 className="trophy-section-title">テキスト出力</h2>
        <textarea
          ref={outputRef}
          className="text-output-area"
          readOnly
          value={outputText}
          rows={Math.min(Math.max(outputText.split('\n').length, 3), 16)}
        />
        <div className="text-output-actions">
          <button type="button" onClick={copyText}>
            コピー
          </button>
          {copied && <span className="copied-msg">コピーしました</span>}
        </div>
      </section>

      {/* 4. 使い方 */}
      <section className="trophy-section trophy-help">
        <h2 className="trophy-section-title">使い方</h2>
        <ul className="help-list">
          <li>台番号（4桁）を入力し、各マスでトロフィー（数字）を選びます。</li>
          <li>
            表のふちの <b>＋</b> で行・列を追加、<b>×</b> で削除できます。
          </li>
          <li>
            設定の切り替え：
            <ul>
              <li>
                <b>回転数 / 時間</b> … 列見出しの種類
              </li>
              <li>
                <b>数字 / トロフィー</b> … マスの表示（🥉🥈🥇🦒🌈）
              </li>
              <li>
                <b>通常 / 行列入替</b> … 表の縦横を入れ替え
              </li>
            </ul>
          </li>
          <li>「テキスト出力」の <b>コピー</b> でメモを共有できます。</li>
          <li>入力内容はこの端末に自動保存されます。</li>
        </ul>
      </section>
    </main>
  )
}
