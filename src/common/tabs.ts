import Browser from 'webextension-polyfill'

export function getCurrentTab(): Promise<Browser.Tabs.Tab> {
  return new Promise<Browser.Tabs.Tab>((resolve, reject) => {
    browser.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
    ).then((tabs: Browser.Tabs.Tab[]) => {
      const tab = tabs[0]
      if (tab)
        resolve(tab)
      else
        reject(new Error('tab not found'))
    })
  })
}
