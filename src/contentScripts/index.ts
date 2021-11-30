import './style.css'

import { showCustomApi } from './custom_api/index'
import { run as runOtherScript } from './other_script'

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
(() => {
  console.info('[vitesse-webext] Hello world from content script', window.onesConfig)

  // mount component to context window
  showCustomApi()
  runOtherScript()
})()
