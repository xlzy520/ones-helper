
export function getOnesConfigApi(getAll = false): Promise<any> {
  return browser.storage.local.get('onesConfigData').then((res) => {
    const data = res.onesConfigData || {}
    if (getAll)
      return data

    const path = location.origin + location.pathname
    return data[path]
  })
}

export function saveOnesConfigApi(onesConfigData: any, clear = false): Promise<void> {
  if (clear)
    return browser.storage.local.set({ })
  return getOnesConfigApi(true).then((preOnesConfigData) => {
    const newOnesConfigData = { ...preOnesConfigData, ...onesConfigData }
    return browser.storage.local.set({ onesConfigData: newOnesConfigData })
  })
}

// 一些开关的配置
export function getOtherConfig(): Promise<any> {
  return browser.storage.local.get('otherConfigData').then((res) => {
    return res.otherConfigData || {}
  })
}

export function saveOtherConfig(otherConfigData: any): Promise<void> {
  return browser.storage.local.set({ otherConfigData })
}
