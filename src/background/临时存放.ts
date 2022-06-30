import Browser from 'webextension-polyfill';

const type = '';
if (type === 'getOnesConfig') {
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
