// スロット登場キャラの誕生日データ（設置台数の多い機種ベース）。
//
// ■ このデータについて
// 誕生日を機械的に取得できる公開APIは無いため、ここは「手作業で集めた一覧」です。
// 対象機種は pworld.db から集計した「パチスロ設置台数（ジャグラー除く）上位機種」（topMachines）。
// そのうち登場キャラ本人の誕生日が公開情報で確認できた機種を収録しています。
// ※声優の誕生日は収録しません（キャラ本人の誕生日のみ）。
//
// ■ enabled（公開カレンダーに表示するか）
// - 省略時は true。管理ページ（/tools/birthday-admin）でON/OFFを切り替えると、
//   その状態はブラウザの localStorage に保存され、カレンダー表示に反映されます。
// - チェックを外したキャラも、このファイルからは消しません（enabled で制御）。
//
// ■ custom（管理ページから手動追加したエントリ）
// - この配列には含めません。custom エントリは localStorage に保存されます
//   （birthday-selection.ts の loadCustom / saveCustom）。
//
// ■ 追記のしかた
//   { name: 'キャラ名', machine: '機種名', month: 7, day: 7 },

export type Birthday = {
  name: string // キャラ名
  machine: string // 機種名（作品タイトル）
  month: number // 1-12
  day: number // 1-31
  enabled?: boolean // 省略時 true
  official?: boolean // 公式にキャラ本人の誕生日設定があるなら true
  note?: string // 補足（任意）
  custom?: boolean // 管理ページから手動追加したエントリ
  cid?: string // custom エントリの一意ID（削除用）
}

// パチスロ設置台数（ジャグラー除く）上位機種（pworld.db / 集計日 2026-07-01）
export type MachineRank = {
  rank: number
  name: string
  count: number
  maker: string
  work: string | null // 誕生日データを持つ作品名（birthdays.machine と一致）
}

export const TOP30_DATE = '2026-07-01'

// ジャグラーシリーズ（キャラ設定が無い）を除いた設置台数の上位機種
export const topMachines: MachineRank[] = [
  { rank: 1, name: 'スマスロ北斗の拳', count: 46995, maker: 'サミー', work: null },
  { rank: 2, name: 'L 東京喰種', count: 45489, maker: 'スパイキー', work: '東京喰種' },
  { rank: 3, name: 'スマスロ 北斗の拳 転生の章2', count: 44473, maker: 'サミー', work: null },
  { rank: 4, name: 'スマスロモンキーターンV', count: 41402, maker: '山佐', work: 'モンキーターン' },
  { rank: 5, name: 'スマスロ 甲鉄城のカバネリ 海門決戦', count: 38949, maker: 'サミー', work: '甲鉄城のカバネリ' },
  { rank: 6, name: 'Lパチスロ 革命機ヴァルヴレイヴ2', count: 27535, maker: 'SANKYO', work: '革命機ヴァルヴレイヴ' },
  { rank: 7, name: 'スマスロ ミリオンゴッド‐神々の軌跡‐', count: 26300, maker: 'ミズホ', work: null },
  { rank: 8, name: 'L戦国乙女5 業火を穿つ宿焔の双刃', count: 22844, maker: 'オリンピア', work: null },
  { rank: 9, name: 'パチスロ かぐや様は告らせたい', count: 19518, maker: 'SANKYO', work: 'かぐや様は告らせたい' },
  { rank: 10, name: 'スマスロ ゴッドイーター リザレクション', count: 19177, maker: 'セブンリーグ', work: 'ゴッドイーター' },
  { rank: 11, name: 'スマスロ 新鬼武者3', count: 16984, maker: 'レオスター', work: null },
  { rank: 12, name: 'スマスロ マギアレコード 魔法少女まどか☆マギカ外伝', count: 16872, maker: 'ミズホ', work: 'マギアレコード（まどか☆マギカ外伝）' },
  { rank: 13, name: 'パチスロ からくりサーカス', count: 16678, maker: 'SANKYO', work: 'からくりサーカス' },
  { rank: 14, name: 'スマスロ 沖ドキ!DUO アンコール', count: 15975, maker: 'メーシー', work: null },
  { rank: 15, name: 'スマスロ バイオハザードRE:3', count: 15883, maker: 'エンターライズ', work: null },
  { rank: 16, name: 'スマスロ モンスターハンターライズ', count: 15736, maker: 'アデリオン', work: null },
  { rank: 17, name: '沖ドキ!BLACK', count: 15388, maker: 'ミズホ', work: null },
  { rank: 18, name: 'パチスロ甲鉄城のカバネリ', count: 15318, maker: 'サミー', work: '甲鉄城のカバネリ' },
  { rank: 19, name: 'Lパチスロ 炎炎ノ消防隊2', count: 14951, maker: 'SANKYO', work: '炎炎ノ消防隊' },
  { rank: 20, name: 'スマスロ 化物語', count: 14793, maker: 'サミー', work: '化物語' },
  { rank: 21, name: '沖ドキ!GOLD‐30', count: 14624, maker: 'ミズホ', work: null },
  { rank: 22, name: 'スマスロ 東京リベンジャーズ', count: 14624, maker: 'サミー', work: '東京リベンジャーズ' },
  { rank: 23, name: 'いざ!番長', count: 13909, maker: 'サボハニ', work: '番長シリーズ' },
  { rank: 24, name: '沖ドキ!GOLD', count: 13819, maker: 'ユニバーサルブロス', work: null },
  { rank: 25, name: 'スマスロ鉄拳6', count: 13763, maker: '山佐', work: '鉄拳' },
  { rank: 26, name: 'L戦国乙女4 戦乱に閃く炯眼の軍師', count: 13655, maker: 'オリンピアエステート', work: null },
  { rank: 27, name: 'スロット ソードアート・オンラインII', count: 12665, maker: 'パオン・ディーピー', work: 'ソードアート・オンライン' },
  { rank: 28, name: 'キングハナハナ‐30', count: 12226, maker: 'パイオニア', work: null },
  { rank: 29, name: '真打 吉宗', count: 11479, maker: '大都技研', work: null },
  { rank: 30, name: 'スマスロスーパーブラックジャック', count: 11261, maker: 'セブンリーグ', work: null },
]

export const birthdays: Birthday[] = [
  // ── 東京喰種 ──
  { name: '金木研', machine: '東京喰種', month: 12, day: 20, official: true },
  { name: '霧嶋董香', machine: '東京喰種', month: 7, day: 1, official: true },
  { name: '霧嶋絢都', machine: '東京喰種', month: 7, day: 4, official: true },
  { name: '月山習', machine: '東京喰種', month: 3, day: 3, official: true },
  { name: '西尾錦', machine: '東京喰種', month: 2, day: 4, official: true },
  { name: '鈴屋什造', machine: '東京喰種', month: 6, day: 8, official: true },
  { name: '亜門鋼太朗', machine: '東京喰種', month: 4, day: 7, official: true },
  { name: '有馬貴将', machine: '東京喰種', month: 12, day: 20, official: true },
  { name: 'ウタ', machine: '東京喰種', month: 12, day: 2, official: true },
  { name: '佐々木琲世', machine: '東京喰種', month: 4, day: 2, official: true },
  { name: '永近英良', machine: '東京喰種', month: 6, day: 10, official: true },
  { name: '真戸暁', machine: '東京喰種', month: 6, day: 6, official: true },
  { name: 'ナキ', machine: '東京喰種', month: 1, day: 28, official: true },
  { name: '神代利世', machine: '東京喰種', month: 10, day: 8, official: true },

  // ── モンキーターン ──
  { name: '波多野憲二', machine: 'モンキーターン', month: 7, day: 25, official: true },
  { name: '青島優子', machine: 'モンキーターン', month: 3, day: 7, official: true },
  { name: '洞口雄大', machine: 'モンキーターン', month: 9, day: 1, official: true },

  // ── 甲鉄城のカバネリ ──
  { name: '生駒', machine: '甲鉄城のカバネリ', month: 2, day: 28, official: true },
  { name: '無名', machine: '甲鉄城のカバネリ', month: 10, day: 20, official: true },
  { name: '四方川菖蒲', machine: '甲鉄城のカバネリ', month: 6, day: 6, official: true },
  { name: '来栖', machine: '甲鉄城のカバネリ', month: 9, day: 24, official: true },
  { name: '逞生', machine: '甲鉄城のカバネリ', month: 8, day: 8, official: true },
  { name: '侑那', machine: '甲鉄城のカバネリ', month: 1, day: 26, official: true },
  { name: '巣刈', machine: '甲鉄城のカバネリ', month: 4, day: 10, official: true },
  { name: '吉備土', machine: '甲鉄城のカバネリ', month: 6, day: 24, official: true },
  { name: '鰍', machine: '甲鉄城のカバネリ', month: 8, day: 18, official: true },
  { name: '天鳥美馬', machine: '甲鉄城のカバネリ', month: 12, day: 6, official: true },

  // ── 革命機ヴァルヴレイヴ ──
  { name: '時縞ハルト', machine: '革命機ヴァルヴレイヴ', month: 10, day: 15, official: true },
  { name: 'エルエルフ', machine: '革命機ヴァルヴレイヴ', month: 5, day: 25, official: true },
  { name: '指南ショーコ', machine: '革命機ヴァルヴレイヴ', month: 4, day: 11, official: true },
  { name: '連坊小路アキラ', machine: '革命機ヴァルヴレイヴ', month: 2, day: 2, official: true },
  { name: '犬塚キューマ', machine: '革命機ヴァルヴレイヴ', month: 1, day: 9, official: true },
  { name: '流木野サキ', machine: '革命機ヴァルヴレイヴ', month: 9, day: 4, official: true },
  { name: '連坊小路サトミ', machine: '革命機ヴァルヴレイヴ', month: 8, day: 14, official: true },
  { name: '二宮タカヒ', machine: '革命機ヴァルヴレイヴ', month: 6, day: 30, official: true },
  { name: '貴生川タクミ', machine: '革命機ヴァルヴレイヴ', month: 8, day: 26, official: true },
  { name: '陽本ジン', machine: '革命機ヴァルヴレイヴ', month: 7, day: 15, official: true },
  { name: '山田ライゾウ', machine: '革命機ヴァルヴレイヴ', month: 12, day: 10, official: true },

  // ── かぐや様は告らせたい ──
  { name: '四宮かぐや', machine: 'かぐや様は告らせたい', month: 1, day: 1, official: true },
  { name: '白銀御行', machine: 'かぐや様は告らせたい', month: 9, day: 9, official: true },
  { name: '藤原千花', machine: 'かぐや様は告らせたい', month: 3, day: 3, official: true },
  { name: '石上優', machine: 'かぐや様は告らせたい', month: 3, day: 3, official: true },
  { name: '早坂愛', machine: 'かぐや様は告らせたい', month: 4, day: 2, official: true },
  { name: '伊井野ミコ', machine: 'かぐや様は告らせたい', month: 5, day: 5, official: true },
  { name: '柏木渚', machine: 'かぐや様は告らせたい', month: 6, day: 25, official: true },
  { name: '子安つばめ', machine: 'かぐや様は告らせたい', month: 4, day: 4, official: true },
  { name: '大仏こばち', machine: 'かぐや様は告らせたい', month: 6, day: 6, official: true },
  { name: '白銀圭', machine: 'かぐや様は告らせたい', month: 8, day: 1, official: true },
  { name: '四条眞妃', machine: 'かぐや様は告らせたい', month: 1, day: 1, official: true },
  { name: '藤原萌葉', machine: 'かぐや様は告らせたい', month: 6, day: 26, official: true },

  // ── ゴッドイーター ──
  { name: '空木レンカ', machine: 'ゴッドイーター', month: 11, day: 3, official: true },
  { name: 'アリサ', machine: 'ゴッドイーター', month: 3, day: 25, official: true },
  { name: 'ソーマ', machine: 'ゴッドイーター', month: 8, day: 28, official: true },
  { name: '雨宮リンドウ', machine: 'ゴッドイーター', month: 10, day: 12, official: true },
  { name: '橘サクヤ', machine: 'ゴッドイーター', month: 6, day: 10, official: true },
  { name: '藤木コウタ', machine: 'ゴッドイーター', month: 6, day: 20, official: true },
  { name: '楠リッカ', machine: 'ゴッドイーター', month: 7, day: 22, official: true },
  { name: '雨宮ツバキ', machine: 'ゴッドイーター', month: 8, day: 18, official: true },
  { name: '香月ナナ', machine: 'ゴッドイーター', month: 2, day: 22, official: true },
  { name: '台場カノン', machine: 'ゴッドイーター', month: 2, day: 28, official: true },
  { name: '九条ソウヘイ', machine: 'ゴッドイーター', month: 6, day: 30, official: true },
  { name: 'ヨハネス', machine: 'ゴッドイーター', month: 7, day: 29, official: true },

  // ── マギアレコード（まどか☆マギカ外伝）──
  { name: '環いろは', machine: 'マギアレコード（まどか☆マギカ外伝）', month: 8, day: 22, official: true },
  { name: '鹿目まどか', machine: 'マギアレコード（まどか☆マギカ外伝）', month: 10, day: 3, official: true, note: 'まどか☆マギカ本編主人公。外伝にも登場' },

  // ── からくりサーカス ──
  { name: '才賀エレオノール', machine: 'からくりサーカス', month: 1, day: 1, official: true },

  // ── 炎炎ノ消防隊 ──
  { name: '森羅日下部', machine: '炎炎ノ消防隊', month: 10, day: 29, official: true },
  { name: 'アーサー・ボイル', machine: '炎炎ノ消防隊', month: 7, day: 10, official: true },
  { name: '環古達（タマキ）', machine: '炎炎ノ消防隊', month: 2, day: 22, official: true },
  { name: '新門紅丸', machine: '炎炎ノ消防隊', month: 2, day: 20, official: true },
  { name: 'アイリス', machine: '炎炎ノ消防隊', month: 4, day: 10, official: true },
  { name: 'プリンセス火華', machine: '炎炎ノ消防隊', month: 3, day: 3, official: true },
  { name: 'ヴァルカン・ジョゼフ', machine: '炎炎ノ消防隊', month: 4, day: 18, official: true },
  { name: '秋樽桜備', machine: '炎炎ノ消防隊', month: 3, day: 27, official: true },
  { name: '武久火縄', machine: '炎炎ノ消防隊', month: 9, day: 23, official: true },
  { name: 'オグン・モンゴメリ', machine: '炎炎ノ消防隊', month: 3, day: 3, official: true },
  { name: 'カリム・フラム', machine: '炎炎ノ消防隊', month: 12, day: 12, official: true },
  { name: '象日下部', machine: '炎炎ノ消防隊', month: 12, day: 25, official: true },
  { name: 'ヴィクトル・リヒト', machine: '炎炎ノ消防隊', month: 3, day: 14, official: true },

  // ── 化物語 ──
  { name: '戦場ヶ原ひたぎ', machine: '化物語', month: 7, day: 7, official: true },
  { name: '千石撫子', machine: '化物語', month: 6, day: 3, official: true },

  // ── 東京リベンジャーズ ──
  { name: '花垣武道', machine: '東京リベンジャーズ', month: 6, day: 25, official: true },
  { name: '佐野万次郎（マイキー）', machine: '東京リベンジャーズ', month: 8, day: 20, official: true },
  { name: '龍宮寺堅（ドラケン）', machine: '東京リベンジャーズ', month: 5, day: 10, official: true },
  { name: '三ツ谷隆', machine: '東京リベンジャーズ', month: 6, day: 12, official: true },
  { name: '柴八戒', machine: '東京リベンジャーズ', month: 9, day: 4, official: true },
  { name: '灰谷蘭', machine: '東京リベンジャーズ', month: 5, day: 26, official: true },
  { name: '黒川イザナ', machine: '東京リベンジャーズ', month: 8, day: 30, official: true },
  { name: '稀咲鉄太', machine: '東京リベンジャーズ', month: 1, day: 20, official: true },
  { name: '河田ナホヤ', machine: '東京リベンジャーズ', month: 5, day: 25, official: true },
  { name: '河田ソウヤ', machine: '東京リベンジャーズ', month: 5, day: 25, official: true },
  { name: '柴大寿', machine: '東京リベンジャーズ', month: 7, day: 24, official: true },
  { name: '佐野真一郎', machine: '東京リベンジャーズ', month: 8, day: 1, official: true },
  { name: '望月莞爾', machine: '東京リベンジャーズ', month: 3, day: 9, official: true },
  { name: '武藤泰宏', machine: '東京リベンジャーズ', month: 4, day: 28, official: true },

  // ── 番長シリーズ（押忍!番長 / サラリーマン番長）──
  { name: '轟金剛', machine: '番長シリーズ', month: 10, day: 16, official: true },
  { name: '青山操', machine: '番長シリーズ', month: 3, day: 30, official: true },
  { name: 'コパンダ', machine: '番長シリーズ', month: 5, day: 8, official: true },
  { name: '鏡慶志郎', machine: '番長シリーズ', month: 1, day: 11, official: true },
  { name: '清澄雫', machine: '番長シリーズ', month: 4, day: 29, official: true },

  // ── 鉄拳 ──
  { name: '三島一八', machine: '鉄拳', month: 11, day: 2, official: true },
  { name: '風間仁', machine: '鉄拳', month: 8, day: 5, official: true },

  // ── ソードアート・オンライン ──
  { name: 'キリト', machine: 'ソードアート・オンライン', month: 10, day: 7, official: true },
  { name: 'アスナ', machine: 'ソードアート・オンライン', month: 9, day: 30, official: true },
  { name: 'シノン', machine: 'ソードアート・オンライン', month: 8, day: 21, official: true },
  { name: 'リーファ', machine: 'ソードアート・オンライン', month: 4, day: 19, official: true },
  { name: 'シリカ', machine: 'ソードアート・オンライン', month: 10, day: 4, official: true },
  { name: 'リズベット', machine: 'ソードアート・オンライン', month: 5, day: 18, official: true },
  { name: 'クライン', machine: 'ソードアート・オンライン', month: 11, day: 28, official: true },
  { name: 'エギル', machine: 'ソードアート・オンライン', month: 3, day: 9, official: true },
  { name: 'ユイ', machine: 'ソードアート・オンライン', month: 8, day: 1, official: true },
  { name: 'ユウキ', machine: 'ソードアート・オンライン', month: 5, day: 23, official: true },
  { name: 'アルゴ', machine: 'ソードアート・オンライン', month: 6, day: 5, official: true },
  { name: 'サチ', machine: 'ソードアート・オンライン', month: 2, day: 11, official: true },
  { name: 'アリス・ツーベルク', machine: 'ソードアート・オンライン', month: 4, day: 9, official: true },
  { name: 'ユージオ', machine: 'ソードアート・オンライン', month: 4, day: 10, official: true },
  { name: 'ロニエ', machine: 'ソードアート・オンライン', month: 9, day: 13, official: true },
  { name: 'ティーゼ・シュトリーネン', machine: 'ソードアート・オンライン', month: 7, day: 2, official: true },
]

// 一意キー（selection管理・重複判定に使用）
export function birthdayId(b: Birthday): string {
  if (b.cid) return b.cid
  return `${b.machine}|${b.name}|${b.month}/${b.day}`
}
