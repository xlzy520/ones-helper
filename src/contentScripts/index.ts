import styles from './style.css'

import { showCustomApi } from './custom_api/index'
import { branchSelectEnhance } from './github_enhance/index'
import { run as runOtherScript } from './other_script'
import { addTaskCopyButton, addViewRelateImplementTask } from './task_action/index'
import { customApiService, onesConfigService } from '~/service'
import { $, isSaas, injectHead } from '~/common/utils'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  const styleEl = document.createElement('style')
  styleEl.innerHTML = styles
  injectHead(styleEl)

  // mount component to context window
  customApiService.getCustomApi().then((customApiData) => {
    console.log(customApiData)
    if (customApiData.showCustomApi) {
      showCustomApi()
    }
  })

  runOtherScript()

  onesConfigService.getOtherConfig().then((res) => {
    if (res.branchSelectEnhance) {
      branchSelectEnhance()
    }

    setInterval(() => {
      if (isSaas()) {
        if (res.copy && !$('.ones-helper.copy-task')) {
          addTaskCopyButton()
        }
        if (res.enableRelatedImplementVersion && !$('.ones-helper.search-task')) {
          addViewRelateImplementTask()
        }
      }
    }, 3000)
  })
})()
