export default function proxyFetch(host = 'http://192.168.1.210:9001/') {
  class ProxyRequest extends Request {
    constructor(input: RequestInfo, init?: RequestInit) {
      let url = input.toString();
      if (url.startsWith('api/')) {
        url = host + url.replace('api/project/', '');
      }
      super(url, init);
    }
  }

  // @ts-ignore
  window.Request = ProxyRequest;
}
