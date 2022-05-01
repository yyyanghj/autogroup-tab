export type Rule = {
  id: string
  title: string
  patterns: string[]
  type: 'url' | 'title'
  min: number
}

export type Settings = {
  autoGroup: boolean
  groupByDomain: boolean
  rules: Rule[]
}
