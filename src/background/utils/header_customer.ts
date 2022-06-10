import { useDebounceFn } from '@vueuse/core';
import Browser from 'webextension-polyfill';

import { isFirefox } from '~/env';
import {
  DefaultPreset,
  DefaultPresetOptions,
  GithubOAuthClientID,
  GithubOAuthClientSecrets,
  NetRequestIDMap,
  ONES_HOST_KEY,
  PROJECT_BRANCH_KEY,
} from '~/common/constants';
import { PresetOption } from '~/service/custom_api';

const RuleActionType = chrome.declarativeNetRequest.RuleActionType;
const HeaderOperation = chrome.declarativeNetRequest.HeaderOperation;
const ResourceType = chrome.declarativeNetRequest.ResourceType;

export type Headers = Browser.WebRequest.HttpHeaders;

export enum ApiPath {
  Project = '/api/project',
  Wiki = '/api/wiki',
}

export interface ProxyParams {
  id: number;
  value: string;
  urlFilter: string;
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

const myDomains = ['localhost', 'dev.myones.net', 'ones.ai'];

const setGithubAccessToken = useDebounceFn((code) => {
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
      }
    });
}, 1000);

export class HeaderCustomer {
  private patterns: string[] = [];

  private authHeaders: Headers = [];

  options: HeaderCustomerOptions = {
    headersBuilder: () => [],
  };

  constructor() {
    this.updateCustomHeadersRule();
  }

  setPatterns = (patterns: string[]): void => {
    this.patterns = patterns.length === 0 ? myDomains : patterns;
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
        this.authHeaders = results;
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
      'http://dev.localhost/*',
      'http://localhost/*',
    ];
    const patterns = this.patterns.length === 0 ? myDomains : this.patterns;

    browser.webRequest.onBeforeSendHeaders.addListener(
      this.handleRequest,
      {
        urls: patterns,
        types: ['xmlhttprequest', 'stylesheet', 'main_frame'],
      },
      ['requestHeaders']
    );

    const extraInfoSpec: Browser.WebRequest.OnHeadersReceivedOptions[] = ['responseHeaders'];
    if (!isFirefox) {
      extraInfoSpec.push('extraHeaders');
    }
    browser.webRequest.onHeadersReceived.addListener(
      this.handleResponseHeaders,
      {
        urls: patterns,
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

  getModifyHeadersApiHostRule = ({ id, value, urlFilter }: ProxyParams) => {
    return {
      id,
      action: {
        type: RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
          {
            header: 'x-ones-api-host',
            operation: HeaderOperation.SET,
            value: `${value}/project/api/project/`,
          },
        ],
      },
      condition: {
        domains: myDomains,
        urlFilter,
        resourceTypes,
      },
    };
  };

  getModifyHeadersBranchRule = ({ id, value, urlFilter }: ProxyParams) => {
    return {
      id,
      action: {
        type: RuleActionType.MODIFY_HEADERS,
        requestHeaders: [
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
        ],
      },
      condition: {
        domains: myDomains,
        urlFilter,
        resourceTypes,
      },
    };
  };

  onPatternsChange = (): void => {
    browser.storage.local.get('customApiData').then(({ customApiData = {} as any }) => {
      // const headers: Headers = [];
      const rules: chrome.declarativeNetRequest.Rule[] = [];
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions as PresetOption[] } =
        customApiData;
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config;
      const customHOST = selectedConfig[ONES_HOST_KEY];
      if (customHOST) {
        const projectRule = this.getModifyHeadersApiHostRule({
          id: NetRequestIDMap.ProjectAPI,
          value: customHOST,
          urlFilter: ApiPath.Project,
        });
        const wikiRule = this.getModifyHeadersApiHostRule({
          id: NetRequestIDMap.WikiAPI,
          value: customHOST.replace(ApiPath.Project, ApiPath.Wiki),
          urlFilter: ApiPath.Wiki,
        });
        rules.push(projectRule, wikiRule);
      } else {
        const projectBranch = selectedConfig[PROJECT_BRANCH_KEY];
        if (projectBranch) {
          const projectRule = this.getModifyHeadersBranchRule({
            id: NetRequestIDMap.ProjectAPI,
            value: `/project/${projectBranch}/`,
            urlFilter: ApiPath.Project,
          });
          const wikiRule = this.getModifyHeadersBranchRule({
            id: NetRequestIDMap.WikiAPI,
            value: `/wiki/${projectBranch}/`,
            urlFilter: ApiPath.Wiki,
          });
          rules.push(projectRule, wikiRule);
        }
      }

      console.log(this.authHeaders);

      browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [NetRequestIDMap.WikiAPI, NetRequestIDMap.ProjectAPI],
        addRules: rules,
      });
    });

    this.removeCustomHeadersListener();
    this.updateCustomHeadersRule();
  };
}
