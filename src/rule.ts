export type Rule = {
  id: string
  title: string
  patterns: string[]
  type: 'url' | 'title'
  min: number
}

export const rules: Rule[] = [
  { id: '123', title: '哔哩哔哩', patterns: ['bilibili.com'], type: 'url', min: 3 },
  { id: '456', title: 'GitHub', patterns: ['github.com'], type: 'url', min: 3 },
]
