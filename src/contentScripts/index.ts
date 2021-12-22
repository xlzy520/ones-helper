import styles from './style.css'

import { showCustomApi } from './custom_api/index'
import { branchSelectEnhance } from './github_enhance/index'
import { run as runOtherScript } from './other_script'
import { addTaskCopyButton, addViewRelateImplementTask } from './task_action/index'
import { customApiService, onesConfigService } from '~/service'
import { $, isSaas, isPrivate, injectHead, injectScript, isDevDomain } from '~/common/utils'
import ajaxProxy from '~/contentScripts/other_script/ajax_proxy'
import getBuildOnesProcessEnv from '~/contentScripts/other_script/getBuildOnesProcessEnv';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  const styleEl = document.createElement('style')
  styleEl.innerHTML = styles
  const isFEOnesDev = !(isPrivate() || isSaas())
  injectHead(styleEl)

  // 开发环境注入特殊脚本获取环境变量
  if (isFEOnesDev) {
    if (!$('#buildOnesProcessEnv')) {
      console.log(`${getBuildOnesProcessEnv}`)
      injectScript(`${getBuildOnesProcessEnv};getBuildOnesProcessEnv()`, 'buildOnesProcessEnv')
    }
  }

  // API转发
  customApiService.getCustomApi().then((customApiData) => {
    console.log(customApiData)
    const config = customApiData.presetOptions.find((v: any) => v.value === customApiData.preset).config
    if (customApiData.showCustomApi) {
      showCustomApi()
    }
    const { customONESApiHost } = config
    if (customONESApiHost.includes('http://localhost')) {
      if (isDevDomain()) {
        injectScript(`${ajaxProxy};run('${customONESApiHost}')`)
        // injectScript(`${ajaxProxy};run('${customONESApiHost}')`)
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
