import { sendMessage, onMessage } from 'webext-bridge';
import Browser, { Tabs } from 'webextension-polyfill';
import { customApi } from './custom_api';
import { isSaas } from '~/common/utils';
// import { groupAllTabs } from './background/groupTabs'

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
  // load latest content script
  import('./contentScriptHMR');
}

const runCustomApi = () => {
  if (!isSaas()) {
    customApi();
  }
};

runCustomApi();

browser.runtime.onMessage.addListener((request) => {
  const { type } = request;
  console.log(type);
  if (type === 'och_customApiChange') {
    runCustomApi();
  } else if (type === 'privateDeploy') {
    console.log(999);
    Browser.tabs
      .create({
        url: 'https://marsdev-ci.myones.net/view/BUILD_PACKAGE/job/build-image/build?delay=0sec',
        active: false,
      })
      .then((res) => {
        console.log(res);
        // Browser.runtime.sendMessage({
        //   type: '7777',
        // })
        const listener = (tabId, changeInfo) => {
          console.log(tabId, changeInfo);
          if (tabId === res.id) {
            if (changeInfo.status === 'complete') {
              Browser.tabs.update(res.id, {
                active: true,
              });
              Browser.tabs.onUpdated.removeListener(listener);
              alert('构建私有部署镜像已经打开了, 请配置');
            }
          }
        };
        Browser.tabs.onUpdated.addListener(listener);
      });
  } else if (type === 'buildInstallPak') {
    Browser.tabs
      .create({
        url: 'https://marsdev-ci.myones.net/view/BUILD_PACKAGE/job/build-image/build?delay=0sec',
        active: false,
      })
      .then((res) => {
        const listener = (tabId, changeInfo) => {
          console.log(tabId, changeInfo);
          if (tabId === res.id) {
            if (changeInfo.status === 'complete') {
              Browser.tabs.update(res.id, {
                active: true,
              });

              Browser.tabs.onUpdated.removeListener(listener);
              Browser.tabs.executeScript(tabId, {
                code: `  const button = document.querySelector('#yui-gen1-button')
            button.click()`,
              });
              alert('构建私有部署镜像已经打开了, 请配置');
            }
          }
        };
        Browser.tabs.onUpdated.addListener(listener);
      });
  }
  // 由于tabGroups只支持manifest V3，所以暂时不做这个功能
  // else if (type === 'groupRightNow') {
  //   groupAllTabs()
  // }
  console.log('接收消息：', request);
});

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed');
});

let previousTabId = 0;

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId;
    return;
  }

  let tab: Tabs.Tab;

  try {
    tab = await browser.tabs.get(previousTabId);
    previousTabId = tabId;
  } catch {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab);
  sendMessage('tab-prev', { title: tab.title }, { context: 'content-script', tabId });
});

// onMessage('get-current-tab', async () => {
//   try {
//     const tab = await browser.tabs.get(previousTabId);
//     return {
//       title: tab?.id,
//     };
//   } catch {
//     return {
//       title: undefined,
//     };
//   }
// });

// Browser.action.openPopup() // 能自动打开插件？

browser.omnibox.setDefaultSuggestion({
  description:
    '玩法待有缘人去实现，比如支持部分功能矩阵的单词快速跳转，或者问题订单的跳转（#3333）等',
});
