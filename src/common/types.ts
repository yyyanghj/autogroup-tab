export type Rule = {
  id: string
  title: string
  patterns: string[]
  type: 'url' | 'title'
}

export type Settings = {
  autoGroup: boolean
  groupByDomain: boolean
  minCount: number
  rules: Rule[]
  strict: boolean
}
