import { HeaderCustomer, HeaderCustomerOptions, Headers } from '../utils/header_customer'
import { customApiService } from '../../service'
import { PROJECT_BRANCH_KEY, ONES_HOST_KEY, DefaultPresetOptions, DefaultPreset } from '~/common/constants'
import { PatternConfig } from '~/service/custom_api'

const headerCustomer = new HeaderCustomer()

function syncApiSetting(headerCustomer: HeaderCustomer) {
  browser.storage.local.get('customApiData').then(({ customApiData = {} }) => {
    const headerBuilder: HeaderCustomerOptions['headersBuilder'] = (details) => {
      const headers: Headers = []
      // 兼容火狐，第一次拿到customApiData的时候是undefined
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions } = customApiData
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config
      const customHOST = selectedConfig[ONES_HOST_KEY]
      const isProjectApi = details.url.includes('/api/project')
      if (customHOST) {
        let value = customHOST
        if (!isProjectApi)
          value = customHOST.replace('api/project/', 'api/wiki/')
        headers.push({
          name: 'x-ones-api-host',
          value,
        })
      }
      else {
        const projectBranch = selectedConfig[PROJECT_BRANCH_KEY]
        if (projectBranch) {
          const prefix = isProjectApi ? '/project' : '/wiki'
          const value = `${prefix}/${projectBranch}/`
          headers.push({
            name: 'x-ones-api-branch-project',
            value,
          })
          headers.push({
            name: 'x-ones-api-branch-wiki',
            value,
          })
        }
      }
      return headers
    }
    headerCustomer.setHeadersBuilder(headerBuilder)
  })
}

async function syncPatterns(headerCustomer: HeaderCustomer) {
  const customApiData = await customApiService.getCustomApi()
  const { customApiPatterns } = customApiData
  const patterns: string[] = customApiPatterns
    .filter((patternConfig: PatternConfig) => {
      return patternConfig.enable
    })
    .map((patternConfig: PatternConfig) => {
      return patternConfig.pattern
    })
  headerCustomer.setPatterns(patterns || [])
}

export function customApi(): void {
  syncApiSetting(headerCustomer)
  syncPatterns(headerCustomer)
}
