import { Rule } from '../rule'
import { DataMap, matchRule, removeTabs, getDomain } from './helpers'

export async function groupByRules(
  rules: Rule[],
  tabMap: DataMap<chrome.tabs.Tab>,
  groupMap: DataMap<chrome.tabGroups.TabGroup>
) {
  const promises: Promise<any>[] = []

  rules.forEach(rule => {
    const group = groupMap.find(
      group => !!(group.title && rule.title && group.title === rule.title)
    )

    const matches = matchRule(tabMap, rule)

    if (!matches.length) {
      return
    }

    const tabIds = matches.map(tab => tab.id!)
    removeTabs(tabMap, tabIds)

    if (group) {
      promises.push(mergeGroup(group.id, tabIds))
    } else if (tabIds.length >= rule.min) {
      promises.push(createGroup(rule.title, tabIds))
    }
  })

  await Promise.all(promises)
}

export async function groupByDomain(
  tabMap: DataMap<chrome.tabs.Tab>,
  groupMap: DataMap<chrome.tabGroups.TabGroup>,
  exact = false
) {
  const domainMap: Map<string, Array<chrome.tabs.Tab>> = new Map()

  tabMap.forEach(tab => {
    if (!tab.id || !tab.url?.startsWith('http')) {
      return
    }

    let domain = getDomain(tab.url || '')
    if (!exact) {
      // SLD
      domain = domain.split('.').slice(-2).join('.')
    }

    if (!domainMap.has(domain)) {
      domainMap.set(domain, [])
    }

    domainMap.get(domain)!.push(tab)
  })

  domainMap.forEach((item, domain) => {
    const group = groupMap.find(group => group.title === domain)
    const tabIds = item.map(tab => tab.id!)
    if (group) {
      mergeGroup(group.id, tabIds)
    } else if (tabIds.length >= 3) {
      createGroup(domain, tabIds)
    }
  })
}

async function mergeGroup(groupId: number, tabIds: number[]) {
  await Promise.all([
    chrome.tabGroups.update(groupId, {
      collapsed: false,
    }),
    chrome.tabs.group({
      groupId,
      tabIds: tabIds,
    }),
  ])
}

async function createGroup(title: string, tabIds: number[]) {
  const groupId = await chrome.tabs.group({
    tabIds,
    createProperties: {
      windowId: chrome.windows.WINDOW_ID_CURRENT,
    },
  })

  await Promise.all([
    chrome.tabGroups.update(groupId, {
      title,
      collapsed: false,
    }),
  ])
}
