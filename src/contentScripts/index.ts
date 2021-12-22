import styles from './style.css'

import { showCustomApi } from './custom_api/index'
import { branchSelectEnhance } from './github_enhance/index'
import { run as runOtherScript } from './other_script'
import { addTaskCopyButton, addViewRelateImplementTask } from './task_action/index'
import { customApiService, onesConfigService } from '~/service'
import { $, isSaas, injectHead, injectScript, isDevDomain, isLocal } from '~/common/utils'
import proxyAJAX from '~/contentScripts/other_script/proxyAJAX'
import getBuildOnesProcessEnv from '~/contentScripts/other_script/getBuildOnesProcessEnv'
import proxyWebsocket from '~/contentScripts/other_script/proxyWebsocket'
import { PresetOption, PresetOptionConfig } from '~/service/custom_api';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[ONES Helper] Hello world from content script')

  const isFEOnesDev = isDevDomain() || isLocal()

  const styleEl = document.createElement('style')
  styleEl.innerHTML = styles
  injectHead(styleEl)

  // 开发环境注入特殊脚本获取环境变量
  if (isFEOnesDev) {
    if (!$('#buildOnesProcessEnv')) {
      injectScript(`${getBuildOnesProcessEnv};getBuildOnesProcessEnv()`, 'buildOnesProcessEnv')
    }
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
    }, 3000)
  })
})()
