import Browser from 'webextension-polyfill';

import { updateSessionRules } from './index';
import { isFirefox } from '~/env';
import {
  DefaultPreset,
  DefaultPresetOptions,
  NetRequestIDMap,
  ONES_HOST_KEY,
  PROJECT_BRANCH_KEY,
} from '~/common/constants';
import { PresetOption } from '~/service/custom_api';
import { getCurrentTab } from '~/common/tabs';
import { isIp } from '~/common/utils';

const RuleActionType = chrome.declarativeNetRequest.RuleActionType;
const HeaderOperation = chrome.declarativeNetRequest.HeaderOperation;
const ResourceType = chrome.declarativeNetRequest.ResourceType;

export type Headers = Browser.WebRequest.HttpHeaders;

export enum ApiPath {
  Project = '/api/project',
  Wiki = '/api/wiki',
  Stripe = '/api/stripe',
}

export interface ProxyParams {
  id: number;
  value: string;
  urlFilter: string;
  isCustomHOST: boolean;
}

export interface HeaderCustomerOptions {
  headersBuilder: (details: Browser.WebRequest.OnBeforeSendHeadersDetailsType) => Headers;
}

const getAccessToken = (str = '') => {
  if (str.includes('access_token=')) {
    const tokenStr = str.split('&')[0];
    return tokenStr.split('=')[1];
  }
  return '';
};

const resourceTypes = [
  ResourceType.MAIN_FRAME,
  ResourceType.STYLESHEET,
  ResourceType.SCRIPT,
  ResourceType.FONT,
  ResourceType.XMLHTTPREQUEST,
  ResourceType.WEBSOCKET,
];

const setGithubAccessToken = (code: string) => {
  Browser.storage.local.get('GithubOAuthInfo').then(({ GithubOAuthInfo }) => {
    if (!GithubOAuthInfo) {
      return;
    }
    const { GithubOAuthClientID, GithubOAuthClientSecrets } = GithubOAuthInfo;
    const getAccessTokenUrl = `https://github.com/login/oauth/access_token?client_id=${GithubOAuthClientID}&client_secret=${GithubOAuthClientSecrets}&code=`;
    fetch(getAccessTokenUrl + code)
      .then((res) => res.text())
      .then((res) => {
        console.log(res);
        const token = getAccessToken(res);
        if (token) {
          browser.storage.local.set({
            githubAccessToken: token,
          });
          getCurrentTab().then((tab) => {
            const tabId = tab.id;
            if (tabId) {
              Browser.tabs.remove(tabId);
              function myAlert() {
                window.alert('Github Token获取成功，请打开插件');
              }
              getCurrentTab().then((tab) => {
                const newTabId = tab.id;
                if (newTabId) {
                  Browser.scripting.executeScript({
                    target: { tabId: newTabId },
                    func: myAlert,
                  });
                }
              });
            }
          });
        }
      });
  });
};

export class HeaderCustomer {
  // private patterns: string[] = [];
  private hostList: string[] = [];
  // private authHeaders: Headers = [];

  options: HeaderCustomerOptions = {
    headersBuilder: () => [],
  };

  constructor() {
    this.updateCustomHeadersRule();
  }

  setPatterns = (patterns: string[]): void => {
    // this.patterns = patterns;
    this.hostList = patterns.map((pattern) => {
      const url = new URL(pattern);
      return url.host;
    });
    this.onPatternsChange();
  };

  handleRequest = (details: Browser.WebRequest.OnBeforeSendHeadersDetailsType) => {
    if (details.type === 'main_frame') {
      const { url } = details;
      // GitHub授权，配置写死了http://localhost:9030/githubAuth
      const githubAuthStr = 'http://localhost:9030/githubAuth?code=';
      if (url.includes(githubAuthStr)) {
        const code = url.replace(githubAuthStr, '');
        setGithubAccessToken(code);
      }
    }
  };

  handleResponseHeaders = (
    details: Browser.WebRequest.OnHeadersReceivedDetailsType
  ): Browser.WebRequest.BlockingResponseOrPromise | void => {
    if (details.type === 'main_frame') {
      return;
    }

    const { responseHeaders = [], initiator, originUrl, url } = details;
    if (url.endsWith('/auth/login') || url.endsWith('/auth/token_info')) {
      const keys = ['Ones-User-Id', 'Ones-Auth-Token'];
      const results = responseHeaders.filter((v: any) => keys.includes(v.name));
      if (results.length) {
        // this.authHeaders = results;
      }
    }
    let corsOriginValue = '*';
    const link = initiator || originUrl;
    if (link) {
      const urlObject = new URL(link);
      corsOriginValue = urlObject.origin;
    }
    responseHeaders.push({
      name: 'Access-Control-Allow-Origin',
      value: corsOriginValue,
    });
    responseHeaders.push({
      name: 'Access-Control-Allow-Methods',
      value:
        'GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK',
    });
    responseHeaders.push({ name: 'Access-Control-Allow-Credentials', value: 'true' });

    responseHeaders.push({ name: 'Access-Control-Allow-Headers', value: '*' });

    responseHeaders.push({
      name: 'Access-Control-Expose-Headers',
      value: '*',
    });

    return { responseHeaders };
  };

  updateCustomHeadersRule = (): void => {
    const myDomains = [
      'https://dev.myones.net/*',
      'http://dev.localhost:3000/*',
      'http://dev.localhost:9001/*',
      'http://localhost/*',
    ];

    browser.webRequest.onBeforeRequest.addListener(
      this.handleRequest,
      {
        urls: myDomains,
        types: ['xmlhttprequest', 'stylesheet', 'main_frame'],
      },
      ['requestBody']
    );

    const extraInfoSpec: Browser.WebRequest.OnHeadersReceivedOptions[] = ['responseHeaders'];
    if (!isFirefox) {
      extraInfoSpec.push('extraHeaders');
    }
    browser.webRequest.onHeadersReceived.addListener(
      this.handleResponseHeaders,
      {
        urls: myDomains,
        types: ['xmlhttprequest'],
      },
      extraInfoSpec
    );
  };

  removeCustomHeadersListener = (): void => {
    if (browser.webRequest.onBeforeSendHeaders.hasListener(this.handleRequest)) {
      browser.webRequest.onBeforeSendHeaders.removeListener(this.handleRequest);
    }
  };

  getModifyHeadersRules = ({ id, value, urlFilter, isCustomHOST }: ProxyParams) => {
    let requestHeaders;
    if (isCustomHOST) {
      requestHeaders = [
        {
          header: 'x-ones-api-host',
          operation: HeaderOperation.SET,
          value: `${value}/project/api/project/`,
        },
      ];
    } else {
      requestHeaders = [
        {
          header: 'x-ones-api-branch-project',
          operation: HeaderOperation.SET,
          value,
        },
        {
          header: 'x-ones-api-branch-wiki',
          operation: HeaderOperation.SET,
          value,
        },
        {
          header: 'x-ones-api-branch-stripe',
          operation: HeaderOperation.SET,
          value,
        },
      ];
    }
    return {
      id,
      action: {
        type: RuleActionType.MODIFY_HEADERS,
        requestHeaders,
      },
      condition: {
        domains: this.hostList,
        urlFilter,
        resourceTypes,
      },
    };
  };

  getRule = (isCustomHOST: boolean, value: string) => {
    const rules = [];
    const projectRule = this.getModifyHeadersRules({
      id: NetRequestIDMap.ProjectAPI,
      value: isCustomHOST ? value : `/project/${value}/`,
      urlFilter: ApiPath.Project,
      isCustomHOST,
    });
    const wikiRule = this.getModifyHeadersRules({
      id: NetRequestIDMap.WikiAPI,
      value: isCustomHOST ? value.replace(ApiPath.Project, ApiPath.Wiki) : `/wiki/${value}/`,
      urlFilter: ApiPath.Wiki,
      isCustomHOST,
    });
    const StripeRule = this.getModifyHeadersRules({
      id: NetRequestIDMap.StipeAPI,
      value: isCustomHOST ? value.replace(ApiPath.Project, ApiPath.Stripe) : `/stripe/${value}/`,
      urlFilter: ApiPath.Stripe,
      isCustomHOST,
    });
    rules.push(projectRule, wikiRule, StripeRule);
    return rules;
  };

  onPatternsChange = (): void => {
    browser.storage.local.get('customApiData').then(({ customApiData = {} as any }) => {
      // const headers: Headers = [];
      let rules: chrome.declarativeNetRequest.Rule[] = [];
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions as PresetOption[] } =
        customApiData;
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config;
      const customHOST = selectedConfig[ONES_HOST_KEY];
      if (customHOST) {
        if (customHOST.includes('localhost') || isIp(customHOST)) {
          updateSessionRules([]);
          return;
        }
        rules = this.getRule(true, customHOST);
      } else {
        const projectBranch = selectedConfig[PROJECT_BRANCH_KEY];
        if (projectBranch) {
          rules = this.getRule(false, projectBranch);
        }
      }

      // console.log(this.authHeaders);
      updateSessionRules(rules);
    });

    this.removeCustomHeadersListener();
    this.updateCustomHeadersRule();
  };
}
