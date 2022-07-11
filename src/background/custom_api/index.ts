import Browser from 'webextension-polyfill';
import { HeaderCustomer } from '../utils/header_customer';
import { customApiService } from '../../service';
import { updateSessionRules } from '../utils/index';
import { PatternConfig } from '~/service/custom_api';
import { isSaas } from '~/common/utils';

async function syncPatterns(headerCustomer: HeaderCustomer) {
  const customApiData = await customApiService.getCustomApi();
  const { customApiPatterns } = customApiData;
  const patterns: string[] = customApiPatterns
    .filter((patternConfig: PatternConfig) => {
      return patternConfig.enable;
    })
    .map((patternConfig: PatternConfig) => {
      return patternConfig.pattern;
    });
  headerCustomer.setPatterns(patterns || []);
}

export function customApi(): void {
  Browser.storage.local.get('proxyConfig').then(({ proxyConfig }) => {
    // 初次使用，没有配置
    if (!proxyConfig) {
      proxyConfig = {
        proxyEnable: true,
      };
    }
    if (!proxyConfig.proxyEnable) {
      updateSessionRules([]);
      return;
    }
    const headerCustomer = new HeaderCustomer();
    syncPatterns(headerCustomer);
  });
}

export const runCustomApi = () => {
  if (!isSaas()) {
    customApi();
  }
};
