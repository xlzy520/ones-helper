
export function getOnesConfigApi(): Promise<any> {
  return browser.storage.local.get('onesConfigData').then(res => res.onesConfigData)
}

export function saveOnesConfigApi(onesConfigData: any): Promise<void> {
  return browser.storage.local.set({ onesConfigData })
}
