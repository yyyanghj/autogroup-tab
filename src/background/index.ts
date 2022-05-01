import { onMessage } from 'webext-bridge'
import { throttle } from 'lodash-es'
import { DataMap } from './helpers'
import { Settings } from '../common/types'
import { groupByRules, groupByDomain } from './group'
import { GET_SETTINGS, UPDATE_SETTINGS, GROUP_TABS, STORE_KEY } from '../common/constants'
import { cloneDeep } from 'lodash-es'

const settings: Settings = {
  autoGroup: true,
  groupByDomain: true,
  rules: [],
  minCount: 3,
}

async function initSettings() {
  const store = await chrome.storage.local.get(STORE_KEY)
  const state: Settings = store[STORE_KEY] || {}

  settings.rules = state.rules || []
  settings.autoGroup = state.autoGroup || settings.autoGroup
  settings.groupByDomain = state.groupByDomain || settings.groupByDomain
  settings.minCount = Math.max(1, state.minCount || 3)

  chrome.tabs.onCreated.addListener(() => {
    if (settings.autoGroup) {
      groupTabs()
    }
  })

  chrome.tabs.onUpdated.addListener(() => {
    if (settings.autoGroup) {
      groupTabs()
    }
  })
}

chrome.runtime.onInstalled.addListener((): void => {
  console.info('Extension installed')
})

const promise = initSettings()

onMessage(GROUP_TABS, async () => {
  groupTabs()
})

onMessage(GET_SETTINGS, async () => {
  try {
    await promise
  } catch {
    //
  }

  return cloneDeep(settings)
})

onMessage(UPDATE_SETTINGS, async message => {
  const { data } = message

  Object.assign(settings, data)

  chrome.storage.local.set({
    [STORE_KEY]: settings,
  })
})

const groupTabs = throttle(async function () {
  const groups = await chrome.tabGroups.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
  })

  const tabs = await chrome.tabs.query({
    currentWindow: true,
    groupId: chrome.tabGroups.TAB_GROUP_ID_NONE,
  })

  const groupMap = new DataMap(groups)
  const tabMap = new DataMap(tabs)

  await groupByRules(settings, tabMap, groupMap)

  if (settings.groupByDomain) {
    await groupByDomain(settings, tabMap, groupMap)
  }
}, 200)
