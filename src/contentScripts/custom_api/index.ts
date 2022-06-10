import Browser from 'webextension-polyfill';
import { customApiService } from '../../service';
import { hideCustomApiInfo, showCustomApiInfo, syncCustomApiInfo } from './show_custom_api_info';
import proxyAJAX from './proxyAJAX';
import proxyWebsocket from './proxyWebsocket';
import { CustomApiChange } from '~/common/message_type';
import { CUSTOM_API_PATTERNS } from '~/common/constants';
import { runtimeInjectPageScript, isDevDomain, isLocal } from '~/common/utils';
import { patternToRegExp } from '~/common/url_pattern';
import { PatternConfig, PresetOption, PresetOptionConfig } from '~/service/custom_api';

const checkIsMathUrl = async () => {
  const config = await customApiService.getCustomApi();
  const apiPatterns = config[CUSTOM_API_PATTERNS];
  const enableApiPatterns = apiPatterns.filter((item: PatternConfig) => item.enable);
  if (enableApiPatterns.length > 0) {
    return enableApiPatterns.some((item: PatternConfig) => {
      const { pattern } = item;
      return window.location.href.includes(pattern);
    });
  }
  return false;
};

const addEventListeners = () => {
  browser.runtime.onMessage.addListener(({ type, data }) => {
    if (type === 'proxyConfigUpdate' || type === CustomApiChange) {
      syncCustomApiInfo();
      if (data.showCustomApi) {
        showCustomApiInfo();
      } else {
        hideCustomApiInfo();
      }
    }
  });
};

export async function handleCustomApi(customApiData): Promise<void> {
  // console.log(customApiData, '===========打印的 ------ handleCustomApi');
  const isMatchUrl = await checkIsMathUrl();
  if (!isMatchUrl) return;
  const config: PresetOptionConfig = customApiData.presetOptions.find(
    (v: PresetOption) => v.value === customApiData.preset
  ).config;
  addEventListeners();
  const { customONESApiHost, customONESApiProjectBranch, websocket } = config;
  // console.log(websocket);
  const path = websocket || customONESApiProjectBranch;
  if (isDevDomain() || isLocal()) {
    if (path) {
      runtimeInjectPageScript({
        code: `${proxyWebsocket};proxyWebsocket('${path}')`,
        type: '',
      });
    }
  }
  Browser.storage.local.get('proxyConfig').then(({ proxyConfig: config }) => {
    if (!config || (config && config.showCustomApi)) {
      showCustomApiInfo();
    }
    if (config?.forceReplace || customONESApiHost.includes('http://localhost')) {
      runtimeInjectPageScript({
        code: `${proxyAJAX};run('${customONESApiHost}')`,
        type: '',
      });
    } else {
      const code = `window.XMLHttpRequest.prototype.open = window.XMLHttpRequest.prototype.originalOpen || window.XMLHttpRequest.prototype.open`;
      runtimeInjectPageScript({
        code,
        type: '',
      });
    }
  });
}
