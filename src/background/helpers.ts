import { Rule } from '../rule'

function getKey(item: any) {
  return item.id || ''
}

export class DataMap<T> extends Map<string | number, T> {
  constructor(data: T[]) {
    super()

    data.forEach(item => {
      const key = getKey(item)
      if (key) {
        this.set(key, item)
      }
    })
  }

  find(predicate: (item: T, index: number) => boolean) {
    return Array.from(this.values()).find(predicate)
  }
}

export function matchRule(tabMap: DataMap<chrome.tabs.Tab>, rule: Rule) {
  const matchers = rule.patterns.filter(pattern => pattern.length).map(p => new RegExp(`${p}`))

  if (!matchers.length) {
    return []
  }

  return Array.from(tabMap.values()).filter(tab => {
    return matchers.some(
      matcher => matcher.test((rule.type === 'url' ? tab.url : tab.title) || '') && tab.id
    )
  })
}

export function removeTabs(tabMap: DataMap<chrome.tabs.Tab>, ids: number[]) {
  ids.forEach(id => {
    if (tabMap.has(id)) {
      tabMap.delete(id)
    }
  })
}

export function getDomain(url: string) {
  return new URL(url).hostname
}
