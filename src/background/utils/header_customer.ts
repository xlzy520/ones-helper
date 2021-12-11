export type Headers = browser.WebRequest.HttpHeaders

export interface HeaderCustomerOptions {
  headersBuilder: (details: browser.WebRequest.OnBeforeSendHeadersDetailsType) => Headers
}

export class HeaderCustomer {
  private patterns: string[] = []

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
    if (details.type === 'xmlhttprequest') {
      console.log(details)
    }
    if (details.requestHeaders) {
      details.requestHeaders.push(...this.buildHeaders(details))
    }

    return { requestHeaders: details.requestHeaders }
  }

  handleResponseHeaders = (
    details: browser.WebRequest.OnHeadersReceivedDetailsType,
  ): browser.WebRequest.BlockingResponseOrPromise => {
    if (details.type === 'main_frame') {
      return {}
    }

    const { responseHeaders = [] } = details
    responseHeaders.push({
      name: 'Access-Control-Allow-Origin',
      value: '*',
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
      'http://localhost/*',
    ]
    const patterns = this.patterns.length === 0 ? defaultS : this.patterns
    browser.webRequest.onBeforeSendHeaders.addListener(
      this.handleRequest,
      {
        urls: patterns,
      },
      ['blocking', 'requestHeaders'],
    )

    browser.webRequest.onHeadersReceived.addListener(
      this.handleResponseHeaders,
      {
        urls: patterns,
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
