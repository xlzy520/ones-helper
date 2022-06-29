import Browser from 'webextension-polyfill';

import { onMessage } from 'webext-bridge';
import { handleCustomApi } from './custom_api/index';
import { branchSelectEnhance } from './github_enhance/index';
import { addTaskCopyButton, addViewRelateImplementTask } from './task_action/index';
import $message from './antdMessage/index';
import { saveOnesConfig, initOnesConfig } from './onesConfig';
import { customApiService, onesConfigService } from '~/service';

import {
  $,
  isSaas,
  injectScript,
  isInLimitedKanban,
  isGithubOAuthUrl,
  runtimeInjectPageScript,
} from '~/common/utils';
import { handleKanban } from '~/contentScripts/task_action/kanban';
import { getJenkinsToken } from '~/contentScripts/Jenkins';
import { initInjectContent } from '~/contentScripts/inject';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[ONES Helper] Hello world from content script');

  // 初始化插入样式、脚本
  initInjectContent();

  getJenkinsToken(); // 获取Jenkins token

  // API转发
  customApiService.getCustomApi().then((customApiData) => {
    handleCustomApi(customApiData);
  });

  // 统一消息监听
  browser.runtime.onMessage.addListener((request: any) => {
    const { type, data } = request;
    if (type === 'onesConfig') {
      saveOnesConfig(data);
      const reloadScript = 'window && window.location.reload()';
      runtimeInjectPageScript({
        code: reloadScript,
        type: '',
      });
    } else if (type === 'githubAccessToken') {
      window.alert('获取code成功，请重新打开ONES Helper即可');
    }
    // else if (type === 'copyAllTasks') {
    //   handleCopyAllTasks(data);
    // }

    console.log('接收消息：', request);
  });

  onMessage('githubAccessToken', (data) => {
    window.alert('获取code成功，请重新打开ONES Helper即可');
  });

  initOnesConfig();

  onesConfigService.getOtherConfig().then((res) => {
    setInterval(() => {
      if (isSaas()) {
        // console.log(document.body, window.document.querySelector('body')?.kanbanState)
        if (res.copy && !$('.ones-helper.copy-task')) {
          addTaskCopyButton();
        }
        if (res.enableRelatedImplementVersion && !$('.ones-helper.search-task')) {
          addViewRelateImplementTask();
        }
      }
      if (res.branchSelectEnhance) {
        branchSelectEnhance();
      }

      if (isInLimitedKanban()) {
        handleKanban();
      }

      if (false) {
        let currentBuildHref = '';
        const scripts = document.querySelectorAll('script:not([src])');
        const targetScript = scripts[1];
        const crumb = targetScript.innerHTML.substring(29, 93);
        const button = document.querySelector('#yui-gen1-button');
        if (button && crumb) {
          const getAPi = () => {
            return fetch(
              'https://marsdev-ci.myones.net/view/BUILD_PACKAGE/job/build-image/buildHistory/ajax',
              {
                method: 'POST',
                headers: {
                  'jenkins-crumb': crumb,
                  'x-requested-with': 'XMLHttpRequest',
                  'content-type': 'application/json; charset=UTF-8',
                },
              }
            ).then((res) => {
              console.log(res);
            });
          };

          // getAPi()
          const latestBuild = document.querySelector(
            '.build-row-cell .pane.build-name .display-name'
          );
          if (latestBuild) {
            if (!currentBuildHref) {
              currentBuildHref = latestBuild.href;
            }
            if (currentBuildHref !== latestBuild.href) {
              // alert('请')
              return;
            }
            fetch(`${currentBuildHref}statusIcon`, {
              headers: {
                'jenkins-crumb': crumb,
                'x-requested-with': 'XMLHttpRequest',
                'content-type': 'application/json; charset=UTF-8',
              },
            })
              .then((res) => {
                return res.text();
              })
              .then((res) => {
                console.log(res);
                if (res.includes('alt="成功"')) {
                  Browser.runtime.sendMessage({
                    type: 'buildInstallPak',
                  });
                } else if (res.includes('alt="已终止"')) {
                  console.log(444);
                } else if (res.includes('alt="执行中"')) {
                  console.log(666);
                } else {
                  console.log('失败了');
                }
              });
          }

          button.addEventListener('click', () => {});
        }
      }
    }, 3000);
  });
})();
