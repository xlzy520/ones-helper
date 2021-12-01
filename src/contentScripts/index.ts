import './style.css'

import { showCustomApi } from './custom_api/index'
import { branchSelectEnhance } from './github_enhance/index'
import { run as runOtherScript } from './other_script'
import { onesConfigService } from '~/service';

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script')

  // mount component to context window
  showCustomApi()
  runOtherScript()
  onesConfigService.getOtherConfig().then((res) => {
    if (res.branchSelectEnhance)
      branchSelectEnhance()
  })
})()
