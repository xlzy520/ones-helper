import { featuresList } from '~/common/constants'

export function getFeaturesConfig(): Promise<any> {
  return browser.storage.local.get('featuresConfig').then((res: any) => {
    if (res.featuresConfig.length !== featuresList.length) {
      return Object.assign(featuresList, res.featuresConfig)
    }
    return res.featuresConfig || featuresList
  })
}

export function saveFeaturesConfig(featuresConfig: any): Promise<void> {
  return browser.storage.local.set({ featuresConfig })
}
