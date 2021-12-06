import { DefaultPreset, DefaultPresetOptions, ONES_HOST_KEY, PROJECT_BRANCH_KEY } from '~/common/constants'

const DOM_SCOPE = 'och__'
const WRAPPER_EL_ID = 'och__custom-api-info'

function createOptionEl({ name, value }: { name: string; value: string }) {
  const optionEl = document.createElement('div')
  optionEl.className = `${DOM_SCOPE}api-info-option`
  optionEl.textContent = `${name}：${value}`
  return optionEl
}

function getInfoOptionElList(): Promise<HTMLElement[]> {
  return new Promise((resolve) => {
    browser.storage.local.get('customApiData').then(({ customApiData = {} }) => {
    // browser.storage.local.get([ONES_HOST_KEY, PROJECT_BRANCH_KEY]).then((data) => {
      // 兼容火狐，第一次拿到customApiData的时候是undefined
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions } = customApiData
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config
      const onesHost = selectedConfig[ONES_HOST_KEY]
      const onesHostInfoEL = createOptionEl({
        name: 'API Host',
        value: onesHost || '默认',
      })

      const projectBranch = selectedConfig[PROJECT_BRANCH_KEY]
      const projectBranchInfoEl = createOptionEl({
        name: 'API 分支',
        value: projectBranch || '默认',
      })
      if (projectBranch)
        console.log('通过 ONES Helper 设定分支：', projectBranch)

      resolve([onesHostInfoEL, projectBranchInfoEl])
    })
  })
}

export async function showCustomApiInfo(): Promise<void> {
  console.log(333)
  const wrapperEl = document.createElement('div')
  wrapperEl.className = `${DOM_SCOPE}api-info-wrapper`
  wrapperEl.id = WRAPPER_EL_ID
  const optionElList = await getInfoOptionElList()
  wrapperEl.append(...optionElList)
  document.body.append(wrapperEl)
}

export async function syncCustomApiInfo(): Promise<void> {
  const wrapperEl = document.querySelector(`#${WRAPPER_EL_ID}`)
  if (wrapperEl) {
    const optionElList = await getInfoOptionElList()
    wrapperEl.innerHTML = ''
    wrapperEl.append(...optionElList)
  }
}
