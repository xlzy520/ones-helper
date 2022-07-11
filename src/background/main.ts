// import { sendMessage } from 'webext-bridge';
import Browser from 'webextension-polyfill';
import { runCustomApi } from './custom_api';
import { getCurrentTab } from '~/common/tabs';
import { injectPageScript } from '~/background/utils/injectScript';
import { RuntimeMessage } from '~/common/types';
// import { groupAllTabs } from './background/groupTabs'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
  // load latest content script
  import('./contentScriptHMR');
}

runCustomApi();

browser.runtime.onMessage.addListener((request: RuntimeMessage) => {
  console.log('接收消息：', request);
  const { type, data } = request;
  switch (type) {
    case 'och_customApiChange':
    case 'proxyConfigUpdate':
      runCustomApi();
      break;
    case 'injectPageScript':
      getCurrentTab().then((tab) => {
        // console.log('onMessage injectPageScript', data, '===========打印的 ------ ');
        if (tab.id) {
          Browser.scripting.executeScript({
            target: { tabId: tab.id },
            func: injectPageScript,
            args: [data],
          });
        }
      });
      break;
    default:
      break;
  }
  // 由于tabGroups只支持manifest V3，所以暂时不做这个功能
  // else if (type === 'groupRightNow') {
  //   groupAllTabs()
  // }
});

browser.runtime.onInstalled.addListener((): void => {
  console.log('插件已安装');
});

// const previousTabId = 0;

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
// @ts-ignore
// browser.tabs.onActivated.addListener(async ({ tabId }) => {
// if (!previousTabId) {
//   previousTabId = tabId;
// }
// let tab: Tabs.Tab;
//
// try {
//   tab = await browser.tabs.get(previousTabId);
//   previousTabId = tabId;
// } catch {}
// eslint-disable-next-line no-console
// console.log('previous tab', tab);
// sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId });
// });

// browser.omnibox.setDefaultSuggestion({
//   description:
//     '玩法待有缘人去实现，比如支持部分功能矩阵的单词快速跳转，或者问题订单的跳转（#3333）等',
// });
