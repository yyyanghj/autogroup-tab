export type Rule = {
  id: string
  title: string
  pattern: string
  type: 'url' | 'title'
  min: number
}

export const rules: Rule[] = [
  // { id: '123', title: '哔哩哔哩', pattern: 'bilibili.com', type: 'url', min: 3 },
  // { id: '456', title: 'GitHub', pattern: 'github.com', type: 'url', min: 3 },
]
