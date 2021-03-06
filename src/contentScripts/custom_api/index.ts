import Browser from 'webextension-polyfill';
import { customApiService } from '../../service';
import { hideCustomApiInfo, showCustomApiInfo, syncCustomApiInfo } from './show_custom_api_info';
import proxyAJAX from './proxyAJAX';
import proxyWebsocket from './proxyWebsocket';
import { CustomApiChange } from '~/common/message_type';
import { CUSTOM_API_PATTERNS } from '~/common/constants';
import { runtimeInjectPageScript, isDevDomain, isLocal, isIp } from '~/common/utils';
import {
  CustomApiData,
  PatternConfig,
  PresetOption,
  PresetOptionConfig,
} from '~/service/custom_api';
import { RuntimeMessage } from '~/common/types';

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
  browser.runtime.onMessage.addListener((request: RuntimeMessage) => {
    const { type, data } = request;
    if (type === 'proxyConfigUpdate' || type === CustomApiChange) {
      if (data?.proxyEnable && data?.showCustomApi) {
        syncCustomApiInfo();
        showCustomApiInfo();
      } else {
        hideCustomApiInfo();
      }
    }
  });
};

export async function handleCustomApi(customApiData: CustomApiData): Promise<void> {
  const isMatchUrl = await checkIsMathUrl();
  console.log('isMatchUrl', isMatchUrl);
  if (!isMatchUrl) return;
  const config: PresetOptionConfig | undefined = customApiData.presetOptions.find(
    (v: PresetOption) => v.value === customApiData.preset
  )?.config;
  if (!config) {
    return;
  }
  const { customONESApiHost, customONESApiProjectBranch, websocket } = config;
  const path = websocket || customONESApiProjectBranch;
  if (isDevDomain() || isLocal()) {
    if (path) {
      runtimeInjectPageScript({
        code: `${proxyWebsocket};proxyWebsocket('${path}')`,
        type: '',
      });
    }
  }
  Browser.storage.local.get('proxyConfig').then(({ proxyConfig }) => {
    if (!proxyConfig || (proxyConfig?.proxyEnable && proxyConfig?.showCustomApi)) {
      showCustomApiInfo();
    }
    if (customONESApiHost.includes('http://localhost') || isIp(customONESApiHost)) {
      runtimeInjectPageScript({
        code: `${proxyAJAX};run('${customONESApiHost}')`,
        type: '',
      });
    } else {
      addEventListeners();
      const code = `window.XMLHttpRequest.prototype.open = window.XMLHttpRequest.prototype.originalOpen || window.XMLHttpRequest.prototype.open`;
      runtimeInjectPageScript({
        code,
        type: '',
      });
    }
  });
}
