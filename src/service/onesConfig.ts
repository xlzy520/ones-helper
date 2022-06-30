export function getOnesConfigApi(getAll = false): Promise<any> {
  return browser.storage.local.get('onesConfigData').then((res: any) => {
    const data = res.onesConfigData || {};
    if (getAll) return data;

    const path = location.origin + location.pathname;
    return data[path];
  });
}

export function saveOnesConfigApi(onesConfigData: any): Promise<void> {
  return getOnesConfigApi(true).then((preOnesConfigData) => {
    const newOnesConfigData = { ...preOnesConfigData, ...onesConfigData };
    return browser.storage.local.set({ onesConfigData: newOnesConfigData });
  });
}

// 一些开关的配置
export function getOtherConfig(): Promise<any> {
  return browser.storage.local.get('otherConfigData').then((res: any) => {
    return res.otherConfigData || {};
  });
}

export function saveOtherConfig(otherConfigData: any): Promise<void> {
  return browser.storage.local.set({ otherConfigData });
}
