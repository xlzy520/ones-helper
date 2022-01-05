import styles from './style.scss'

import { showCustomApi } from './custom_api/index'
import { branchSelectEnhance } from './github_enhance/index'
import { run as runOtherScript } from './other_script'
import { addTaskCopyButton, addViewRelateImplementTask } from './task_action/index'
import $message from './antdMessage/index'
import { customApiService, onesConfigService } from '~/service'
import { $, isSaas, injectHead, injectScript, isDevDomain, isLocal, $All, isInLimitedKanban } from '~/common/utils'
import proxyAJAX from '~/contentScripts/other_script/proxyAJAX'
import getBuildOnesProcessEnv from '~/contentScripts/other_script/getBuildOnesProcessEnv'
import proxyWebsocket from '~/contentScripts/other_script/proxyWebsocket'
import { PresetOption, PresetOptionConfig } from '~/service/custom_api'
import { handleKanban } from '~/contentScripts/task_action/kanban';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[ONES Helper] Hello world from content script')

  const isFEOnesDev = isDevDomain() || isLocal()

  const styleEl = document.createElement('style')
  styleEl.innerHTML = styles
  injectHead(styleEl)

  $message.success(123)

  // 开发环境注入特殊脚本获取环境变量
  if (isFEOnesDev) {
    if (!$('#buildOnesProcessEnv')) {
      injectScript(`${getBuildOnesProcessEnv};getBuildOnesProcessEnv()`, 'buildOnesProcessEnv')
    }
  }

  if (location.href.includes('http://localhost:9030/githubAuth?code=')) {
    $message.success('获取code成功，再次打开插件即可')
  }

  // API转发
  customApiService.getCustomApi().then((customApiData) => {
    const config: PresetOptionConfig = customApiData.presetOptions.find((v: PresetOption) => v.value === customApiData.preset).config
    if (customApiData.showCustomApi) {
      showCustomApi()
    }
    const { customONESApiHost, customONESApiProjectBranch } = config
    injectScript(`${proxyWebsocket};proxyWebsocket('${customONESApiProjectBranch}')`)
    if (customONESApiHost.includes('http://localhost')) {
      if (isDevDomain()) {
        injectScript(`${proxyAJAX};run('${customONESApiHost}')`)
      }
    }
  })

  runOtherScript()

  onesConfigService.getOtherConfig().then((res) => {
    setInterval(() => {
      if (isSaas()) {
        // console.log(document.body, window.document.querySelector('body')?.kanbanState)
        if (res.copy && !$('.ones-helper.copy-task')) {
          addTaskCopyButton()
        }
        if (res.enableRelatedImplementVersion && !$('.ones-helper.search-task')) {
          addViewRelateImplementTask()
        }
      }
      if (res.branchSelectEnhance) {
        branchSelectEnhance()
      }

      if (isInLimitedKanban()) {
        handleKanban()
      }
    }, 3000)
  })
})()
