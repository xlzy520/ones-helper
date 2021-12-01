
export function getOnesConfigApi(getAll = false): Promise<any> {
  // console.log()
  return browser.storage.local.get('onesConfigData').then((res) => {
    if (getAll) {
      console.log(res)
      return res.onesConfigData
    }
    const path = location.origin + location.pathname
    console.log(res, path, '===========打印的 ------ ')
    return res.onesConfigData[path]
  })
}

export function saveOnesConfigApi(onesConfigData: any, clear = false): Promise<void> {
  if (clear)
    return browser.storage.local.set({ })
  return getOnesConfigApi(true).then((preOnesConfigData) => {
    console.log(preOnesConfigData)
    const newOnesConfigData = { ...preOnesConfigData, ...onesConfigData }
    console.log(newOnesConfigData)
    return browser.storage.local.set({ onesConfigData: newOnesConfigData })
  })
}
