import { onMessage } from 'webext-bridge'
import { debounce } from 'lodash-es'
import { DataMap } from './helpers'
import { Rule } from '../rule'
import { groupByRules, groupByDomain } from './group'
// import { useStorageLocal } from '../composables/useStorageLocal'

let rules: Rule[] = []

async function init() {
  const store = await chrome.storage.local.get('autogroup-tab-rules')

  rules = store['autogroup-tab-rules'] || []
}

init()

chrome.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

chrome.tabs.onCreated.addListener(() => {
  groupTabs()
})

chrome.tabs.onUpdated.addListener(() => {
  groupTabs()
})

onMessage('group-tabs', async () => {
  groupTabs()
})

onMessage('get-rules', async () => {
  return rules
})

onMessage('update-rules', async message => {
  const { data } = message
  rules = (data as { rules: Rule[] }).rules
  chrome.storage.local.set({
    'autogroup-tab-rules': rules,
  })
})

const groupTabs = debounce(async function () {
  const groups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  })
  const tabs = await chrome.tabs.query({
    currentWindow: true,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  })

  const groupMap = new DataMap(groups)
  const tabMap = new DataMap(tabs)

  await groupByRules(rules, tabMap, groupMap)
  await groupByDomain(tabMap, groupMap)
}, 200)
