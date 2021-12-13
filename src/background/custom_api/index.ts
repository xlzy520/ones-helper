import { HeaderCustomer, HeaderCustomerOptions, Headers } from '../utils/header_customer'
import { customApiService } from '../../service'
import { PROJECT_BRANCH_KEY, ONES_HOST_KEY, DefaultPresetOptions, DefaultPreset } from '~/common/constants'
import { PatternConfig } from '~/service/custom_api'

const headerCustomer = new HeaderCustomer()

function syncApiSetting(headerCustomer: HeaderCustomer) {
  browser.storage.local.get(['customApiData', 'userInfo']).then(({ customApiData = {}, userInfo }) => {
    console.log(userInfo)
    const headerBuilder: HeaderCustomerOptions['headersBuilder'] = (details) => {
      const headers: Headers = []
      // 兼容火狐，第一次拿到customApiData的时候是undefined
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions } = customApiData
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config
      const customHOST = selectedConfig[ONES_HOST_KEY]
      const isProjectApi = details.url.includes('/api/project')
      console.log(details)
      if (customHOST) {
        if (customHOST.includes('localhost') || customHOST.includes('192.168')) {
          // headers.push({
          //   name: 'Ones-User-ID',
          //   value: 'B9ei3VVV',
          // })
          // headers.push({
          //   name: 'Ones-Auth-Token',
          //   value: 'y9w61wPTwRKg3LB8yRay83Mx7tuqsuK4cxRAnIoR1UfVBpwl6Q9uBOHlgwViIfJ5',
          // })
        }
        else {
          let value = customHOST
          if (!isProjectApi) {
            value = customHOST.replace('api/project/', 'api/wiki/')
          }
          headers.push({
            name: 'x-ones-api-host',
            value,
          })
        }
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
