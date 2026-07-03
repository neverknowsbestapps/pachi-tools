export type Category = 'tools' | 'games'

export type Feature = {
  id: string
  title: string
  description: string
  category: Category
  // 別アプリ（外部URL）へのカードの場合に指定。無ければ内部ページ /{category}/{id} へ
  href?: string
}
