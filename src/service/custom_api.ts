import { CustomApiChange } from '~/common/message_type'
import { getCurrentTab } from '~/common/tabs'
import {
  DefaultPatterns,
  DefaultPresetOptions,
  ONES_HOST_KEY,
  PROJECT_BRANCH_KEY,
  CUSTOM_API_PATTERNS,
} from '~/common/constants'

export interface PatternConfig {
  enable: boolean
  pattern: string
}

export interface BranchData {
  [ONES_HOST_KEY]: string|null
  [PROJECT_BRANCH_KEY]: string|null
  [CUSTOM_API_PATTERNS]: PatternConfig[]
}

export interface CustomApiData {
  [ONES_HOST_KEY]: string|null
  [PROJECT_BRANCH_KEY]: string|null
  [CUSTOM_API_PATTERNS]: PatternConfig[]
}

export function getCustomApi(): Promise<any> {
  return new Promise((resolve) => {
    // [ONES_HOST_KEY, PROJECT_BRANCH_KEY, CUSTOM_API_PATTERNS, 'preset', 'presetOptions']
    browser.storage.local.get('customApiData').then(({ customApiData = {} }) => {
      const result = {
        ...customApiData,
        preset: customApiData.preset || '默认',
        [CUSTOM_API_PATTERNS]: customApiData[CUSTOM_API_PATTERNS] || DefaultPatterns,
        presetOptions: customApiData.presetOptions || DefaultPresetOptions,
      }
      resolve(result)
    })
  })
}

export function saveCustomApi(customApiData: any): Promise<void> {
// export function saveCustomApi(branchData: Partial<BranchData>): Promise<void> {
  return browser.storage.local.set({ customApiData }).then(() => {
    getCurrentTab().then((tab) => {
      const { id } = tab
      if (id) {
        browser.tabs.sendMessage(id, {
          type: CustomApiChange,
          customApiData,
        })
        browser.runtime.sendMessage({
          type: CustomApiChange,
          customApiData,
        })
      }
    })
  })
}
