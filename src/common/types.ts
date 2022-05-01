export type Rule = {
  id: string
  title: string
  patterns: string[]
  type: 'url' | 'title'
  min: number
}

export type Settings = {
  autogroup: boolean
  groupByDomain: boolean
  rules: Rule[]
}
