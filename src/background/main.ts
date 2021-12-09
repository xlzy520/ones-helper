import { sendMessage, onMessage } from 'webext-bridge'
import { Tabs } from 'webextension-polyfill'
import { customApi } from './custom_api'
// import { groupAllTabs } from './background/groupTabs'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

customApi()

browser.runtime.onMessage.addListener((request) => {
  const { type } = request
  if (type === 'och_customApiChange') {
    customApi()
  }
  // 由于tabGroups只支持manifest V3，所以暂时不做这个功能
  // else if (type === 'groupRightNow') {
  //   groupAllTabs()
  // }
  console.log('接收消息：', request)
})

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed')
})

let previousTabId = 0

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId
    return
  }

  let tab: Tabs.Tab

  try {
    tab = await browser.tabs.get(previousTabId)
    previousTabId = tabId
  }
  catch {
    return
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab)
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId })
})

onMessage('get-current-tab', async() => {
  try {
    const tab = await browser.tabs.get(previousTabId)
    return {
      title: tab?.id,
    }
  }
  catch {
    return {
      title: undefined,
    }
  }
})
