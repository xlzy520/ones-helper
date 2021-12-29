import { useDebounceFn } from '@vueuse/core'
import Browser from 'webextension-polyfill'
import { isFirefox } from '~/env'

export type Headers = Browser.WebRequest.HttpHeaders

export interface HeaderCustomerOptions {
  headersBuilder: (details: Browser.WebRequest.OnBeforeSendHeadersDetailsType) => Headers
}

const getAccessToken = (str = '') => {
  if (str.includes('access_token=')) {
    const tokenStr = str.split('&')[0]
    return tokenStr.split('=')[1]
  }
  return ''
}

const setGithubAccessToken = useDebounceFn((code) => {
  const getAccessTokenUrl = 'https://github.com/login/oauth/access_token?client_id=86195e808441e12f0de9&client_secret=b7c885a910febde53135e674db6a41c34053e0ac&code='
  fetch(getAccessTokenUrl + code).then(res => res.text()).then((res) => {
    console.log(res)
    const token = getAccessToken(res)
    if (token) {
      browser.storage.local.set({
        githubAccessToken: token,
      })
    }
  })
}, 2000)

export class HeaderCustomer {
  private patterns: string[] = []

  private authHeaders: Headers = []

  options: HeaderCustomerOptions = {
    headersBuilder: () => [],
  }

  constructor() {
    this.addCustomHeadersListener()
  }

  buildHeaders = (details: Browser.WebRequest.OnBeforeSendHeadersDetailsType): Headers => {
    return this.options.headersBuilder ? this.options.headersBuilder(details) : []
  }

  setHeadersBuilder = (headersBuilder: HeaderCustomerOptions['headersBuilder']): void => {
    this.options.headersBuilder = headersBuilder
  }

  // getPatterns = (): string[] => {
  //   return this.patterns
  // }

  setPatterns = (patterns: string[]): void => {
    this.patterns = patterns
    this.onPatternsChange()
  }

  handleRequest = (
    details: Browser.WebRequest.OnBeforeSendHeadersDetailsType,
  ): Browser.WebRequest.BlockingResponseOrPromise => {
    // console.log(details)
    if (details.type === 'main_frame') {
      const { url } = details
      // GitHub授权，配置写死了http://localhost:9030/githubAuth
      if (url.includes('http://localhost:9030/githubAuth?code=')) {
        const urlObj = new URL(url)
        const code = urlObj.searchParams.get('code')
        setGithubAccessToken(code)
      }
      console.log(details)
    }
    else if (details.requestHeaders) {
      details.requestHeaders.push(...this.buildHeaders(details))
      details.requestHeaders.push(...this.authHeaders)
    }
    return { requestHeaders: details.requestHeaders }
  }

  handleResponseHeaders = (
    details: Browser.WebRequest.OnHeadersReceivedDetailsType,
  ): Browser.WebRequest.BlockingResponseOrPromise|void => {
    if (details.type === 'main_frame') {
      return
    }

    const { responseHeaders = [], initiator, originUrl, url } = details
    if (url.endsWith('/auth/login')) {
      const keys = ['Ones-User-Id', 'Ones-Auth-Token']
      const results = responseHeaders.filter((v: any) => keys.includes(v.name))
      if (results.length) {
        this.authHeaders = results
      }
    }
    let corsOriginValue = '*'
    const link = initiator || originUrl
    if (link) {
      const urlObject = new URL(link)
      corsOriginValue = urlObject.origin
    }
    responseHeaders.push({
      name: 'Access-Control-Allow-Origin',
      value: corsOriginValue,
    })
    responseHeaders.push({
      name: 'Access-Control-Allow-Methods',
      value: 'GET, PUT, POST, DELETE, HEAD, OPTIONS, PATCH, PROPFIND, PROPPATCH, MKCOL, COPY, MOVE, LOCK',
    })
    responseHeaders.push({ name: 'Access-Control-Allow-Credentials', value: 'true' })

    responseHeaders.push({ name: 'Access-Control-Allow-Headers', value: '*' })

    responseHeaders.push({
      name: 'Access-Control-Expose-Headers',
      value: '*',
    })

    return { responseHeaders }
  }

  addCustomHeadersListener = (): void => {
    const defaultS = [
      'https://dev.myones.net/*',
      'http://dev.localhost:3000/*',
      'http://dev.localhost/*',
      'http://192.168.1.45:9001/*',
      'http://192.168.1.210:9001/*',
      'http://localhost/*',
    ]
    const patterns = this.patterns.length === 0 ? defaultS : this.patterns
    browser.webRequest.onBeforeSendHeaders.addListener(
      this.handleRequest,
      {
        urls: patterns,
        types: ['xmlhttprequest', 'stylesheet', 'script', 'main_frame'],
      },
      ['blocking', 'requestHeaders'],
    )

    const extraInfoSpec: Browser.WebRequest.OnHeadersReceivedOptions[] = ['blocking', 'responseHeaders']
    if (!isFirefox) {
      extraInfoSpec.push('extraHeaders')
    }
    browser.webRequest.onHeadersReceived.addListener(
      this.handleResponseHeaders,
      {
        urls: patterns,
        types: ['xmlhttprequest'],
      },
      extraInfoSpec)
  }

  removeCustomHeadersListener = (): void => {
    if (browser.webRequest.onBeforeSendHeaders.hasListener(this.handleRequest))
      browser.webRequest.onBeforeSendHeaders.removeListener(this.handleRequest)
  }

  onPatternsChange = (): void => {
    this.removeCustomHeadersListener()
    this.addCustomHeadersListener()
  }
}
