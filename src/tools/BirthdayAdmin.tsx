import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { birthdays, topMachines, birthdayId, type Birthday } from './birthday-data'
import {
  loadOverrides,
  saveOverrides,
  isEnabled,
  loadCustom,
  saveCustom,
  newCustomId,
} from './birthday-selection'
import './BirthdayAdmin.css'

// 機種を設置台数の順に並べるための rank 索引
const MACHINE_RANK = new Map(
  topMachines.filter((m) => m.work).map((m) => [m.work as string, m.rank]),
)
function machineRank(m: string): number {
  return MACHINE_RANK.get(m) ?? 999
}

// 機種名の入力候補（既存の対象機種）
const MACHINE_SUGGEST = Array.from(
  new Set(topMachines.filter((m) => m.work).map((m) => m.work as string)),
)

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)

// その月の最大日数（うるう年の 2/29 は許容するため 2月は 29）
function daysInMonth(month: number): number {
  if (month === 2) return 29
  return [4, 6, 9, 11].includes(month) ? 30 : 31
}

export function BirthdayAdmin() {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => loadOverrides())
  const [custom, setCustom] = useState<Birthday[]>(() => loadCustom())
  const [query, setQuery] = useState('')
  const [copied, setCopied] = useState(false)

  // 追加フォーム
  const [fName, setFName] = useState('')
  const [fMachine, setFMachine] = useState('')
  const [fMonth, setFMonth] = useState(1)
  const [fDay, setFDay] = useState(1)
  const [formError, setFormError] = useState('')

  // ファイル定義＋カスタムの全エントリ
  const allBirthdays = useMemo(() => [...birthdays, ...custom], [custom])

  // 機種ごと（rank順）にグループ化
  const groups = useMemo(() => {
    const map = new Map<string, Birthday[]>()
    for (const b of allBirthdays) {
      const arr = map.get(b.machine)
      if (arr) arr.push(b)
      else map.set(b.machine, [b])
    }
    const q = query.trim()
    return Array.from(map.entries())
      .map(([machine, items]) => ({
        machine,
        items: items.filter((b) => !q || b.name.includes(q) || b.machine.includes(q)),
      }))
      .filter((g) => g.items.length > 0)
      .sort((a, b) => machineRank(a.machine) - machineRank(b.machine))
  }, [allBirthdays, query])

  const enabledCount = useMemo(
    () => allBirthdays.filter((b) => isEnabled(b, overrides)).length,
    [allBirthdays, overrides],
  )

  function commitOverrides(next: Record<string, boolean>) {
    setOverrides(next)
    saveOverrides(next)
    setCopied(false)
  }
  function setMany(list: Birthday[], val: boolean) {
    const next = { ...overrides }
    for (const b of list) next[birthdayId(b)] = val
    commitOverrides(next)
  }
  function toggleOne(b: Birthday) {
    setMany([b], !isEnabled(b, overrides))
  }
  function resetAll() {
    commitOverrides({})
  }

  function commitCustom(next: Birthday[]) {
    setCustom(next)
    saveCustom(next)
    setCopied(false)
  }
  function addCustom() {
    const name = fName.trim()
    const machine = fMachine.trim()
    if (!name || !machine) {
      setFormError('キャラ名と機種名を入力してください')
      return
    }
    const entry: Birthday = {
      name,
      machine,
      month: fMonth,
      day: fDay,
      custom: true,
      cid: newCustomId(),
    }
    commitCustom([...custom, entry])
    setFName('')
    setFMonth(1)
    setFDay(1)
    setFormError('')
    // 機種名は続けて追加しやすいよう残す
  }
  function removeCustom(cid?: string) {
    if (!cid) return
    commitCustom(custom.filter((c) => c.cid !== cid))
  }

  // 公開用エクスポート（表示ONのキャラを機種ごと・月日順のテキストに）
  const exportText = useMemo(() => {
    const on = allBirthdays.filter((b) => isEnabled(b, overrides))
    const byMachine = new Map<string, Birthday[]>()
    for (const b of on) {
      const arr = byMachine.get(b.machine)
      if (arr) arr.push(b)
      else byMachine.set(b.machine, [b])
    }
    const lines: string[] = [`# 誕生日カレンダー 表示ONリスト（計${on.length}件）`]
    const machines = Array.from(byMachine.keys()).sort((a, b) => machineRank(a) - machineRank(b))
    for (const m of machines) {
      lines.push('', `【${m}】`)
      const items = byMachine
        .get(m)!
        .slice()
        .sort((a, b) => a.month - b.month || a.day - b.day)
      for (const b of items) {
        lines.push(`${b.month}/${b.day}　${b.name}${b.custom ? '（追加）' : ''}`)
      }
    }
    return lines.join('\n')
  }, [allBirthdays, overrides])

  function copyExport() {
    navigator.clipboard?.writeText(exportText).then(
      () => setCopied(true),
      () => setCopied(false),
    )
  }

  return (
    <main className="container bda">
      <p className="breadcrumb">
        <Link to="/tools/birthday-calendar">← 誕生日カレンダーへ</Link>
      </p>
      <header className="page-header">
        <h1>誕生日カレンダー 管理</h1>
        <p className="lead">
          カレンダーに表示するキャラを選ぶ・追加するページ。選択はこの端末（ブラウザ）だけに保存されます。
        </p>
      </header>

      {/* キャラを個別に追加 */}
      <section className="bda-add">
        <h2 className="bda-add-title">キャラを追加</h2>
        <div className="bda-add-form">
          <input
            type="text"
            placeholder="キャラ名"
            value={fName}
            onChange={(e) => setFName(e.target.value)}
          />
          <input
            type="text"
            placeholder="機種名"
            list="bda-machine-list"
            value={fMachine}
            onChange={(e) => setFMachine(e.target.value)}
          />
          <datalist id="bda-machine-list">
            {MACHINE_SUGGEST.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
          <select
            value={fMonth}
            onChange={(e) => {
              const m = Number(e.target.value)
              setFMonth(m)
              // 月を変えて日数を超えたら、その月の末日に丸める（2/31 等の無効日を防ぐ）
              if (fDay > daysInMonth(m)) setFDay(daysInMonth(m))
            }}
            aria-label="月"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}月
              </option>
            ))}
          </select>
          <select value={fDay} onChange={(e) => setFDay(Number(e.target.value))} aria-label="日">
            {Array.from({ length: daysInMonth(fMonth) }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}日
              </option>
            ))}
          </select>
          <button onClick={addCustom}>追加</button>
        </div>
        {formError ? <p className="bda-add-error">{formError}</p> : null}
        <p className="bda-add-note">
          追加したキャラはこの端末に保存され、カレンダーにも表示されます。機種名は既存機種を選んでも、新しい機種名を入力してもOKです。
        </p>
      </section>

      {/* サマリ＋一括操作 */}
      <div className="bda-panel">
        <div className="bda-summary">
          表示ON <b>{enabledCount}</b> / 全 {allBirthdays.length} 件
        </div>
        <div className="bda-bulk">
          <button onClick={() => setMany(allBirthdays, true)}>全てON</button>
          <button onClick={() => setMany(allBirthdays, false)}>全てOFF</button>
          <button className="ghost" onClick={resetAll}>
            既定に戻す
          </button>
        </div>
      </div>

      {/* 検索 */}
      <div className="bda-filters">
        <input
          type="search"
          placeholder="キャラ名・機種名で検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* 機種ごとのチェックリスト */}
      {groups.map((g) => {
        const onCount = g.items.filter((b) => isEnabled(b, overrides)).length
        return (
          <section key={g.machine} className="bda-group">
            <div className="bda-group-head">
              <span className="bda-group-title">{g.machine}</span>
              <span className="bda-group-count">
                {onCount}/{g.items.length}
              </span>
              <button className="bda-mini" onClick={() => setMany(g.items, true)}>
                全ON
              </button>
              <button className="bda-mini" onClick={() => setMany(g.items, false)}>
                全OFF
              </button>
            </div>
            <div className="bda-grid">
              {g.items.map((b) => {
                const on = isEnabled(b, overrides)
                return (
                  <div key={birthdayId(b)} className={`bda-item${on ? ' on' : ''}`}>
                    <label className="bda-item-label">
                      <input type="checkbox" checked={on} onChange={() => toggleOne(b)} />
                      <span className="bda-name">
                        {b.name}
                        {b.custom ? <span className="bda-custom">追加</span> : null}
                      </span>
                      <span className="bda-date">
                        {b.month}/{b.day}
                      </span>
                    </label>
                    {b.custom ? (
                      <button
                        className="bda-del"
                        onClick={() => removeCustom(b.cid)}
                        aria-label="削除"
                        title="このカスタムキャラを削除"
                      >
                        ×
                      </button>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}

      {/* エクスポート */}
      <section className="bda-export">
        <h2 className="bda-export-title">エクスポート</h2>
        <p className="bda-export-note">
          現在ONにしている内容です。このテキストを渡してもらえれば、公開サイト（GitHub Pages）側にも同じ内容を反映できます。
        </p>
        <textarea className="bda-export-area" readOnly value={exportText} rows={10} />
        <div className="bda-export-actions">
          <button onClick={copyExport}>コピー</button>
          {copied ? <span className="bda-copied">コピーしました</span> : null}
        </div>
      </section>

      <section className="bda-help">
        <ul className="help-list">
          <li>チェックを入れたキャラだけが、この端末のカレンダーに表示されます。</li>
          <li>
            <b>キャラを追加</b>で、一覧に無いキャラを個別に足せます（この端末に保存。<b>追加</b>タグ付き、×で削除）。
          </li>
          <li>選択・追加はブラウザに保存され、他の人には見えません。ページを閉じても保持されます。</li>
          <li>チェックを外したキャラもデータからは消えません（いつでも再表示できます）。</li>
        </ul>
      </section>
    </main>
  )
}
