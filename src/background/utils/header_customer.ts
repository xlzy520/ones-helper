export type Headers = browser.WebRequest.HttpHeaders

export interface HeaderCustomerOptions {
  headersBuilder: (details: browser.WebRequest.OnBeforeSendHeadersDetailsType) => Headers
}

export class HeaderCustomer {
  private patterns: string[] = []

  private authHeaders: Headers = []

  options: HeaderCustomerOptions = {
    headersBuilder: () => [],
  }

  constructor() {
    this.addCustomHeadersListener()
  }

  buildHeaders = (details: browser.WebRequest.OnBeforeSendHeadersDetailsType): Headers => {
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
    details: browser.WebRequest.OnBeforeSendHeadersDetailsType,
  ): browser.WebRequest.BlockingResponseOrPromise => {
    const { type } = details
    if (type === 'xmlhttprequest') {
      // console.log(details)
      if (details.requestHeaders) {
        details.requestHeaders.push(...this.buildHeaders(details))
        details.requestHeaders.push(...this.authHeaders)
      }
    }
    return { requestHeaders: details.requestHeaders }
  }

  handleResponseHeaders = (
    details: browser.WebRequest.OnHeadersReceivedDetailsType,
  ): browser.WebRequest.BlockingResponseOrPromise => {
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
    const o = new URL(initiator || originUrl)
    responseHeaders.push({
      name: 'Access-Control-Allow-Origin',
      value: o.origin || '*',
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
        types: ['xmlhttprequest'],
      },
      ['blocking', 'requestHeaders'],
    )

    browser.webRequest.onHeadersReceived.addListener(
      this.handleResponseHeaders,
      {
        urls: patterns,
        types: ['xmlhttprequest'],
      },
      ['blocking', 'responseHeaders', 'extraHeaders'])
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
