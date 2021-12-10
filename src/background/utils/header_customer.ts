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
  ): browser.WebRequest.BlockingResponse => {
    if (details.requestHeaders)
      details.requestHeaders.push(...this.buildHeaders(details))

    return { requestHeaders: details.requestHeaders }
  }

  // handleBeRequest = (
  //   details: browser.WebRequest.OnBeforeSendHeadersDetailsType,
  // ): browser.WebRequest.BlockingResponse => {
  //   const paramsStr = String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes))
  //   const params = JSON.parse(paramsStr)
  //   console.log(params)
  //   if (details.requestHeaders)
  //     details.requestHeaders.push(...this.buildHeaders(details))
  //
  //   return { requestHeaders: details.requestHeaders }
  // }

  addCustomHeadersListener = (): void => {
    const defaultS = ['https://dev.myones.net/*', 'http://dev.localhost:3000/*', 'http://dev.localhost/*']
    const patterns = this.patterns.length === 0 ? defaultS : this.patterns
    browser.webRequest.onBeforeSendHeaders.addListener(
      this.handleRequest,
      {
        urls: patterns,
      },
      ['blocking', 'requestHeaders'],
    )
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
