import Browser from 'webextension-polyfill';
import styles from './style.scss';

import { handleCustomApi } from './custom_api/index';
import { branchSelectEnhance } from './github_enhance/index';
import { run as runOtherScript } from './other_script';
import { addTaskCopyButton, addViewRelateImplementTask } from './task_action/index';
import $message from './antdMessage/index';
import { customApiService, onesConfigService } from '~/service';
import {
  $,
  isSaas,
  injectHead,
  injectScript,
  isDevDomain,
  isLocal,
  $All,
  isInLimitedKanban,
  isGithubOAuthUrl,
} from '~/common/utils';
import {
  getBuildOnesProcessEnv,
  getHostWindowObject,
} from '~/contentScripts/other_script/getBuildOnesProcessEnv';
import { handleKanban } from '~/contentScripts/task_action/kanban';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[ONES Helper] Hello world from content script');

  const isFEOnesDev = isDevDomain() || isLocal();

  const styleEl = document.createElement('style');
  styleEl.innerHTML = styles;
  injectHead(styleEl);

  // 开发环境注入特殊脚本获取环境变量
  if (isFEOnesDev) {
    if (!$('#buildOnesProcessEnv')) {
      injectScript(`${getBuildOnesProcessEnv};getBuildOnesProcessEnv()`, 'buildOnesProcessEnv');
      injectScript(`${getHostWindowObject};getHostWindowObject();`, 'getHostWindowObject');
    }
  }

  if (isGithubOAuthUrl()) {
    $message.success('获取code成功，再次打开插件即可');
  }

  // API转发
  customApiService.getCustomApi().then((customApiData) => {
    handleCustomApi(customApiData);
  });

  runOtherScript();

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
