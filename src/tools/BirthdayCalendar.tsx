import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { topMachines, birthdayId, type Birthday } from './birthday-data'
import { getEnabledBirthdays, getAllBirthdays } from './birthday-selection'
import './BirthdayCalendar.css'

type ViewMode = 'calendar' | 'list'

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']
const MONTH_LABELS = Array.from({ length: 12 }, (_, i) => `${i + 1}月`)

// 機種を設置台数の順に並べるための rank 索引
const MACHINE_RANK = new Map(
  topMachines.filter((m) => m.work).map((m) => [m.work as string, m.rank]),
)

function machineRank(m: string): number {
  return MACHINE_RANK.get(m) ?? 999
}

// month(1-12)/day をキーにした誕生日の索引を作る
function indexByDate(list: Birthday[]): Map<string, Birthday[]> {
  const map = new Map<string, Birthday[]>()
  for (const b of list) {
    const key = `${b.month}-${b.day}`
    const arr = map.get(key)
    if (arr) arr.push(b)
    else map.set(key, [b])
  }
  return map
}

// 指定した年月（year, month0=0-11）のカレンダーを週ごとの配列で返す。
// 各セルは day（その月の日）か null（前後の月の空白）。
function buildWeeks(year: number, month0: number): (number | null)[][] {
  const first = new Date(year, month0, 1)
  const daysInMonth = new Date(year, month0 + 1, 0).getDate()
  const leading = first.getDay() // 週の頭（日曜）までの空白数
  const cells: (number | null)[] = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

export function BirthdayCalendar() {
  const today = new Date()
  const [view, setView] = useState<ViewMode>('calendar')
  // カレンダー表示の対象年月（既定は今月）
  const [year, setYear] = useState(today.getFullYear())
  const [month0, setMonth0] = useState(today.getMonth())

  // 表示ONのキャラだけを取得（管理ページの選択＝localStorageを反映）
  const enabled = useMemo(() => getEnabledBirthdays(), [])

  // 対象機種（データが入っている機種）を rank 順・重複除去で（カスタム機種も含む）
  const coveredWorks = useMemo(() => {
    const present = Array.from(new Set(getAllBirthdays().map((b) => b.machine)))
    return present.sort((a, b) => machineRank(a) - machineRank(b))
  }, [])

  // フィルタに出す機種（表示ONのキャラがいる機種を、設置台数の順で）
  const machineOptions = useMemo(() => {
    const present = Array.from(new Set(enabled.map((b) => b.machine)))
    return present.sort((a, b) => machineRank(a) - machineRank(b))
  }, [enabled])

  // 機種フィルタ（複数選択・チェックボックス）。初期は全機種ON
  const [selected, setSelected] = useState<string[]>(() => machineOptions)
  const selectedSet = useMemo(() => new Set(selected), [selected])

  function toggleMachine(m: string) {
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  // 機種フィルタを適用した一覧
  const filtered = useMemo(
    () => enabled.filter((b) => selectedSet.has(b.machine)),
    [selectedSet, enabled],
  )
  const byDate = useMemo(() => indexByDate(filtered), [filtered])

  // 一覧表示用：月→日の昇順に並べ替え
  const sorted = useMemo(
    () => [...filtered].sort((a, b) => a.month - b.month || a.day - b.day || a.name.localeCompare(b.name)),
    [filtered],
  )

  const weeks = useMemo(() => buildWeeks(year, month0), [year, month0])
  const displayMonth = month0 + 1 // 1-12

  function shiftMonth(delta: number) {
    const d = new Date(year, month0 + delta, 1)
    setYear(d.getFullYear())
    setMonth0(d.getMonth())
  }
  function goToday() {
    setYear(today.getFullYear())
    setMonth0(today.getMonth())
  }

  const isThisMonthOfToday = year === today.getFullYear() && month0 === today.getMonth()

  return (
    <main className="container bd">
      <p className="breadcrumb">
        <Link to="/">← トップへ</Link>
      </p>
      <header className="page-header">
        <h1>スロット誕生日カレンダー</h1>
        <p className="lead">スロット登場キャラの誕生日をまとめて表示</p>
      </header>

      <p className="bd-admin-link">
        <Link to="/tools/birthday-admin">登場キャラの表示を管理 →</Link>
      </p>

      {/* 表示切替 */}
      <div className="bd-controls">
        <div className="mode-toggle">
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
            カレンダー
          </button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            一覧
          </button>
        </div>
      </div>

      {/* 機種フィルタ（展開式・チェックボックスで複数選択） */}
      <details className="bd-machine-filter">
        <summary>
          機種で絞り込み（{selected.length}/{machineOptions.length} 機種）
        </summary>
        <div className="bd-machine-actions">
          <button onClick={() => setSelected(machineOptions)}>全選択</button>
          <button onClick={() => setSelected([])}>全解除</button>
        </div>
        <div className="bd-machine-grid">
          {machineOptions.map((m) => (
            <label key={m} className={`bd-machine-item${selectedSet.has(m) ? ' on' : ''}`}>
              <input
                type="checkbox"
                checked={selectedSet.has(m)}
                onChange={() => toggleMachine(m)}
              />
              {m}
            </label>
          ))}
        </div>
      </details>

      {view === 'calendar' ? (
        <section className="bd-calendar">
          <div className="bd-monthbar">
            <button className="bd-navbtn" onClick={() => shiftMonth(-1)} aria-label="前の月">
              ‹
            </button>
            <span className="bd-monthlabel">
              {year}年 {displayMonth}月
            </span>
            <button className="bd-navbtn" onClick={() => shiftMonth(1)} aria-label="次の月">
              ›
            </button>
            <button className="bd-today" onClick={goToday} disabled={isThisMonthOfToday}>
              今日
            </button>
          </div>

          <div className="bd-grid">
            {WEEKDAYS.map((w, i) => (
              <div key={w} className={`bd-wday${i === 0 ? ' sun' : ''}${i === 6 ? ' sat' : ''}`}>
                {w}
              </div>
            ))}
            {weeks.flat().map((day, i) => {
              if (day === null) return <div key={`e${i}`} className="bd-cell empty" />
              const list = byDate.get(`${displayMonth}-${day}`) ?? []
              const isToday =
                isThisMonthOfToday && day === today.getDate()
              return (
                <div key={`d${day}`} className={`bd-cell${isToday ? ' today' : ''}`}>
                  <div className="bd-daynum">{day}</div>
                  <div className="bd-chips">
                    {list.map((b) => (
                      <span key={birthdayId(b)} className="bd-chip">
                        {b.name}【{b.machine}】
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <section className="bd-list">
          {MONTH_LABELS.map((label, mi) => {
            const items = sorted.filter((b) => b.month === mi + 1)
            if (items.length === 0) return null
            return (
              <div key={label} className="bd-list-month">
                <h2 className="bd-list-mlabel">{label}</h2>
                <ul className="bd-list-items">
                  {items.map((b) => (
                    <li key={birthdayId(b)}>
                      <span className="bd-date">
                        {b.month}/{b.day}
                      </span>
                      <span className="bd-name">{b.name}</span>
                      <span className="bd-machine">{b.machine}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </section>
      )}

      <section className="bd-help">
        <details className="bd-top30">
          <summary>対象機種（{coveredWorks.length}機種）</summary>
          <ul className="bd-top30-list">
            {coveredWorks.map((w) => (
              <li key={w}>
                <span className="bd-top30-name">{w}</span>
              </li>
            ))}
          </ul>
        </details>

        <h2 className="bd-help-title">使い方</h2>
        <ul className="help-list">
          <li>
            <b>カレンダー</b>：月ごとに、その日が誕生日のキャラを表示します。前月/翌月に移動でき、<b>今日</b>ボタンで当月に戻ります。
          </li>
          <li>
            <b>一覧</b>：1月から順に、誕生日順で並べて表示します。
          </li>
          <li>
            <b>機種で絞り込み</b>から機種を選べます。カレンダーの各キャラは「名前【機種名】」で表示します。
          </li>
          <li>
            誕生日は公開情報を手作業でまとめたもので、<b>網羅的ではありません</b>。
          </li>
          <li>
            表示するキャラの選択や<b>個別追加</b>は <Link to="/tools/birthday-admin">管理ページ</Link> でできます（この端末に保存）。
          </li>
        </ul>
      </section>
    </main>
  )
}
