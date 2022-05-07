import { Settings, Rule } from '../common/types'
import { DataMap, matchRule, removeTabs, getDomain } from './helpers'

// add a prefix before group title which created by domain rule
// so that we can use this prefix to check if a group was created by domain rule
const DOMAIN_GRUOP_PREFIX = '▴ '

export async function groupByRules(
  settings: Settings,
  tabMap: DataMap<chrome.tabs.Tab>,
  groupMap: DataMap<chrome.tabGroups.TabGroup>
) {
  const promises: Promise<any>[] = []
  const rules = settings.rules

  rules.forEach(rule => {
    if (!rule.title || !rule.patterns.filter(pattern => !!pattern.trim().length).length) {
      return
    }

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
    } else if (tabIds.length >= settings.minCount) {
      promises.push(createGroup(rule.title, tabIds))
    }
  })

  await Promise.all(promises)
}

export async function groupByDomain(
  settings: Settings,
  tabMap: DataMap<chrome.tabs.Tab>,
  groupMap: DataMap<chrome.tabGroups.TabGroup>
) {
  const domainMap: Map<string, Array<chrome.tabs.Tab>> = new Map()

  tabMap.forEach(tab => {
    if (!tab.id || !tab.url?.startsWith('http')) {
      return
    }

    let domain = getDomain(tab.url || '')

    if (!settings.strict) {
      // different sub-domain in same group
      domain = domain.split('.').slice(-2).join('.')
    }

    if (!domainMap.has(domain)) {
      domainMap.set(domain, [])
    }

    domainMap.get(domain)!.push(tab)
  })

  domainMap.forEach((tabs, domain) => {
    const groupName = DOMAIN_GRUOP_PREFIX + domain
    const group = groupMap.find(group => group.title === groupName)
    const tabIds = tabs.map(tab => tab.id!)
    if (group) {
      mergeGroup(group.id, tabIds)
    } else if (tabIds.length >= settings.minCount) {
      createGroup(groupName, tabIds)
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

export async function unGroupIfNotMatch(tab: chrome.tabs.Tab, rules: Rule[]) {
  try {
    const group = await chrome.tabGroups.get(tab.groupId)

    if (!group) {
      return
    }

    // check if this tab auto grouped by domain
    if (group.title?.startsWith(DOMAIN_GRUOP_PREFIX)) {
      const domain = group.title.slice(DOMAIN_GRUOP_PREFIX.length)
      const tabDomain = getDomain(tab.url!)
      if (!tabDomain.includes(domain)) {
        await chrome.tabs.ungroup([tab.id!])
        return
      }
    }

    // We assume that the name of user tab groups should be different with rule's title
    const matchedRule = rules.find(rule => rule.title === group.title)

    if (matchedRule) {
      const matchers = matchedRule.patterns
        .filter(pattern => pattern.trim().length)
        .map(p => new RegExp(`${p.trim()}`))

      const isMatch = matchers.some(matcher => {
        return matcher.test((matchedRule.type === 'url' ? tab.url : tab.title) || '') && tab.id
      })

      if (!isMatch) {
        // Tab url or title was changed and does not match the rule any more,
        // so that we should remove it from group
        await chrome.tabs.ungroup([tab.id!])
        return
      }
    }
  } catch {
    //
  }
}
