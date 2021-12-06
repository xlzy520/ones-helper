import { customApiService } from '../../service'
import { showCustomApiInfo, syncCustomApiInfo } from './show_custom_api_info'
import { CustomApiChange } from '~/common/message_type'
import { CUSTOM_API_PATTERNS } from '~/common/constants'
import { patternToRegExp } from '~/common/url_pattern'
import { PatternConfig } from '~/service/custom_api'

const checkIsMathUrl = async() => {
  const config = await customApiService.getCustomApi()
  const apiPatterns = config[CUSTOM_API_PATTERNS]
  const enableApiPatterns = apiPatterns.filter((item: PatternConfig) => item.enable)
  if (enableApiPatterns.length > 0) {
    return enableApiPatterns.some((item: PatternConfig) => {
      const { pattern } = item
      return patternToRegExp(pattern).test(window.location.href)
    })
  }
  return false
}

const addEventListeners = () => {
  browser.runtime.onMessage.addListener((message) => {
    const type = message ? message.type : null
    console.log(type)
    if (type === CustomApiChange)
      syncCustomApiInfo()
  })
}

export async function showCustomApi(): Promise<void> {
  const isMatchUrl = await checkIsMathUrl()
  console.log(isMatchUrl)
  if (!isMatchUrl)
    return

  showCustomApiInfo()
  addEventListeners()
}
