import get from 'lodash/get'

export function getCurrentTab(): Promise<browser.Tabs.Tab> {
  return new Promise<browser.Tabs.Tab>((resolve, reject) => {
    browser.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
    ).then((tabs) => {
      const tab = get(tabs, [0])
      if (tab)
        resolve(tab)
      else
        reject(new Error('tab not found'))
    })
  })
}
