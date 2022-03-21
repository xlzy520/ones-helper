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

export type Headers = Browser.WebRequest.HttpHeaders;

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
        alert('获取code成功，请重新打开ONES Helper即可');
      }
    });
}, 2000);

export class HeaderCustomer {
  private patterns: string[] = [];

  private authHeaders: Headers = [];

  options: HeaderCustomerOptions = {
    headersBuilder: () => [],
  };

  constructor() {
    this.addCustomHeadersListener();
  }

  buildHeaders = (details: Browser.WebRequest.OnBeforeSendHeadersDetailsType): Headers => {
    return this.options.headersBuilder ? this.options.headersBuilder(details) : [];
  };

  setHeadersBuilder = (headersBuilder: HeaderCustomerOptions['headersBuilder']): void => {
    this.options.headersBuilder = headersBuilder;
  };

  // getPatterns = (): string[] => {
  //   return this.patterns
  // }

  setPatterns = (patterns: string[]): void => {
    this.patterns = patterns;
    this.onPatternsChange();
  };

  handleRequest = (
    details: Browser.WebRequest.OnBeforeSendHeadersDetailsType
  ): Browser.WebRequest.BlockingResponseOrPromise => {
    let shouldAddHeaders = false;
    if (details.type === 'main_frame') {
      const { url } = details;
      // GitHub授权，配置写死了http://localhost:9030/githubAuth
      if (url.includes('http://localhost:9030/githubAuth?code=')) {
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get('code');
        setGithubAccessToken(code);
      } else if (url.includes('download_export_task')) {
        shouldAddHeaders = true;
      }
    } else if (details.requestHeaders) {
      shouldAddHeaders = true;
    }
    if (shouldAddHeaders) {
      details.requestHeaders.push(...this.buildHeaders(details));
      details.requestHeaders.push(...this.authHeaders);
    }
    return { requestHeaders: details.requestHeaders };
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

  addCustomHeadersListener = (): void => {
    return;
    const defaultS = [
      'https://dev.myones.net/*',
      'http://dev.localhost:3000/*',
      'http://dev.localhost/*',
      'http://192.168.1.45:9001/*',
      'http://192.168.1.210:9001/*',
      'http://localhost/*',
    ];
    const patterns = this.patterns.length === 0 ? defaultS : this.patterns;

    // const ruleId = 1;
    //
    // const rules = {
    //   removeRuleIds: [ruleId],
    //   addRules: [
    //     {
    //       id: ruleId,
    //       priority: 1,
    //       condition: {
    //         domains: defaultS,
    //         resourceTypes: ['main_frame', 'xmlhttprequest'],
    //       },
    //       action: {
    //         type: 'modifyHeaders',
    //         requestHeaders: [
    //           {
    //             header: 'X-DeclarativeNetRequest-Sample',
    //             operation: 'set',
    //             value: 'request',
    //           },
    //         ],
    //         responseHeaders: [
    //           {
    //             header: 'X-DeclarativeNetRequest-Sample',
    //             operation: 'set',
    //             value: 'response',
    //           },
    //         ],
    //       },
    //     },
    //   ],
    // };
    //
    // chrome.declarativeNetRequest.updateDynamicRules(rules, () => {
    //   if (browser.runtime.lastError) {
    //     console.error(browser.runtime.lastError);
    //   } else {
    //     browser.declarativeNetRequest.getDynamicRules((rules) => console.log(rules));
    //   }
    // });

    // browser.webRequest.onBeforeSendHeaders.addListener(
    //   this.handleRequest,
    //   {
    //     urls: patterns,
    //     types: ['xmlhttprequest', 'stylesheet', 'script', 'main_frame'],
    //   },
    //   ['blocking', 'requestHeaders']
    // );
    //
    // const extraInfoSpec: Browser.WebRequest.OnHeadersReceivedOptions[] = [
    //   'blocking',
    //   'responseHeaders',
    // ];
    // if (!isFirefox) {
    //   extraInfoSpec.push('extraHeaders');
    // }
    // browser.webRequest.onHeadersReceived.addListener(
    //   this.handleResponseHeaders,
    //   {
    //     urls: patterns,
    //     types: ['xmlhttprequest'],
    //   },
    //   extraInfoSpec
    // );
  };

  removeCustomHeadersListener = (): void => {
    // if (browser.webRequest.onBeforeSendHeaders.hasListener(this.handleRequest))
    //   browser.webRequest.onBeforeSendHeaders.removeListener(this.handleRequest);
  };

  onPatternsChange = (): void => {
    console.log(3333);

    const defaultS = [
      'https://dev.myones.net/*',
      'http://dev.localhost:3000/*',
      'http://dev.localhost/*',
      'http://192.168.1.45:9001/*',
      'http://192.168.1.210:9001/*',
      'http://localhost/*',
      'https://www.bilibili.com/',
      'https://api.bilibili.com/',
      'api.bilibili.com',
      'bilibili.com',
    ];
    const patterns = this.patterns.length === 0 ? defaultS : this.patterns;

    console.log(this.buildHeaders());
    console.log(this.authHeaders);

    browser.storage.local.get('customApiData').then(({ customApiData = {} as any }) => {
      const headers: Headers = [];
      const rules = [];
      const { preset = DefaultPreset, presetOptions = DefaultPresetOptions as PresetOption[] } =
        customApiData;
      const selectedConfig = presetOptions.find((v: any) => v.value === preset).config;
      const customHOST = selectedConfig[ONES_HOST_KEY];
      if (customHOST) {
        const value = customHOST;
        rules.push({
          id: NetRequestIDMap.ProjectAPI,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'x-ones-api-host',
                operation: 'set',
                value,
              },
            ],
          },
          condition: {
            domains: defaultS,
            urlFilter: '/api/project/',
            resourceTypes: [
              'main_frame',
              'sub_frame',
              'stylesheet',
              'script',
              'image',
              'font',
              'object',
              'xmlhttprequest',
              'ping',
              'csp_report',
              'media',
              'websocket',
              'webtransport',
              'webbundle',
              'other',
            ],
          },
        });
        rules.push({
          id: NetRequestIDMap.WikiAPI,
          action: {
            type: 'modifyHeaders',
            requestHeaders: [
              {
                header: 'x-ones-api-host',
                operation: 'set',
                value: customHOST.replace('api/project/', 'api/wiki/'),
              },
            ],
          },
          condition: {
            domains: defaultS,
            urlFilter: '/api/wiki/',
            resourceTypes: [
              'main_frame',
              'sub_frame',
              'stylesheet',
              'script',
              'image',
              'font',
              'object',
              'xmlhttprequest',
              'ping',
              'csp_report',
              'media',
              'websocket',
              'webtransport',
              'webbundle',
              'other',
            ],
          },
        });
      } else {
        const projectBranch = selectedConfig[PROJECT_BRANCH_KEY];
        if (projectBranch) {
          rules.push({
            id: NetRequestIDMap.ProjectAPI,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                {
                  header: 'x-ones-api-branch-project',
                  operation: 'set',
                  value: `/project/${projectBranch}/`,
                },
                {
                  header: 'x-ones-api-branch-wiki',
                  operation: 'set',
                  value: `/project/${projectBranch}/`,
                },
              ],
            },
            condition: {
              domains: defaultS,
              urlFilter: '/api/project/',
              resourceTypes: [
                'main_frame',
                'sub_frame',
                'stylesheet',
                'script',
                'image',
                'font',
                'object',
                'xmlhttprequest',
                'ping',
                'csp_report',
                'media',
                'websocket',
                'webtransport',
                'webbundle',
                'other',
              ],
            },
          });
          rules.push({
            id: NetRequestIDMap.WikiAPI,
            action: {
              type: 'modifyHeaders',
              requestHeaders: [
                {
                  header: 'x-ones-api-branch-project',
                  operation: 'set',
                  value: `/wiki/${projectBranch}/`,
                },
                {
                  header: 'x-ones-api-branch-wiki',
                  operation: 'set',
                  value: `/wiki/${projectBranch}/`,
                },
              ],
            },
            condition: {
              domains: defaultS,
              urlFilter: '/api/wiki/',
              resourceTypes: [
                'main_frame',
                'sub_frame',
                'stylesheet',
                'script',
                'image',
                'font',
                'object',
                'xmlhttprequest',
                'ping',
                'csp_report',
                'media',
                'websocket',
                'webtransport',
                'webbundle',
                'other',
              ],
            },
          });
        }
      }

      console.log(rules);
      browser.declarativeNetRequest.updateSessionRules({
        removeRuleIds: [NetRequestIDMap.WikiAPI, NetRequestIDMap.ProjectAPI],
        addRules: rules,
      });
    });

    // browser.declarativeNetRequest.updateSessionRules({
    //   removeRuleIds: [1],
    //   addRules: [
    //     {
    //       id: 1,
    //       action: {
    //         type: 'modifyHeaders',
    //         requestHeaders: [
    //           {
    //             header: 'user-agent',
    //             operation: 'set',
    //             value: 'ones788999',
    //           },
    //         ],
    //       },
    //       condition: {
    //         domains: defaultS,
    //         // urlFilter: '|https*',
    //         // tabIds: [tab.id],
    //         resourceTypes: [
    //           'main_frame',
    //           'sub_frame',
    //           'stylesheet',
    //           'script',
    //           'image',
    //           'font',
    //           'object',
    //           'xmlhttprequest',
    //           'ping',
    //           'csp_report',
    //           'media',
    //           'websocket',
    //           'webtransport',
    //           'webbundle',
    //           'other',
    //         ],
    //       },
    //     },
    //     {
    //       id: 2,
    //       action: {
    //         type: 'modifyHeaders',
    //         requestHeaders: [
    //           {
    //             header: 'user-agent',
    //             operation: 'set',
    //             value: 'ones788999',
    //           },
    //         ],
    //       },
    //       condition: {
    //         domains: defaultS,
    //         // urlFilter: '|https*',
    //         // tabIds: [tab.id],
    //         resourceTypes: [
    //           'main_frame',
    //           'sub_frame',
    //           'stylesheet',
    //           'script',
    //           'image',
    //           'font',
    //           'object',
    //           'xmlhttprequest',
    //           'ping',
    //           'csp_report',
    //           'media',
    //           'websocket',
    //           'webtransport',
    //           'webbundle',
    //           'other',
    //         ],
    //       },
    //     },
    //   ],
    // });
    // this.removeCustomHeadersListener();
    // this.addCustomHeadersListener();
  };
}
