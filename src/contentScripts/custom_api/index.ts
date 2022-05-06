import { customApiService } from '../../service';
import { hideCustomApiInfo, showCustomApiInfo, syncCustomApiInfo } from './show_custom_api_info';
import proxyAJAX from './proxyAJAX';
import proxyWebsocket from './proxyWebsocket';
import proxyFetch from './proxyFetch';
import { CustomApiChange } from '~/common/message_type';
import { CUSTOM_API_PATTERNS } from '~/common/constants';
import { patternToRegExp } from '~/common/url_pattern';
import { PatternConfig, PresetOption, PresetOptionConfig } from '~/service/custom_api';
import {injectScript, isDevDomain, isLocal} from '~/common/utils';

const checkIsMathUrl = async () => {
  const config = await customApiService.getCustomApi();
  const apiPatterns = config[CUSTOM_API_PATTERNS];
  const enableApiPatterns = apiPatterns.filter((item: PatternConfig) => item.enable);
  if (enableApiPatterns.length > 0) {
    return enableApiPatterns.some((item: PatternConfig) => {
      const { pattern } = item;
      return patternToRegExp(pattern).test(window.location.href);
    });
  }
  return false;
};

const addEventListeners = () => {
  browser.runtime.onMessage.addListener(({ type, customApiData }) => {
    // console.log(type)
    if (type === CustomApiChange) {
      syncCustomApiInfo();
      if (customApiData.showCustomApi) {
        showCustomApiInfo();
      } else {
        hideCustomApiInfo();
      }
    }
  });
};

export async function handleCustomApi(customApiData): Promise<void> {
  const isMatchUrl = await checkIsMathUrl();
  if (!isMatchUrl) return;

  const config: PresetOptionConfig = customApiData.presetOptions.find(
    (v: PresetOption) => v.value === customApiData.preset
  ).config;
  if (customApiData.showCustomApi) {
    showCustomApiInfo();
  }
  addEventListeners();
  const { customONESApiHost, customONESApiProjectBranch, websocket } = config;
  console.log(websocket);
  const path = websocket || customONESApiProjectBranch;
  if (isDevDomain() || isLocal()) {
    injectScript(`${proxyWebsocket};proxyWebsocket('${path}')`, 'proxyWebSocket');
  }
  if (customONESApiHost.includes('http://localhost')) {
    if (isDevDomain()) {
      injectScript(`${proxyAJAX};run$1('${customONESApiHost}')`, 'proxyXHR');
      injectScript(`${proxyFetch};proxyFetch('${customONESApiHost}')`, 'proxyFetch');
    }
  }
}
