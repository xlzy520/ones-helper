export default function proxyWebsocket(branch = 'master') {
  class MyWebSocket extends WebSocket {
    constructor(url = '') {
      // const localUrl = 'ws://dev.localhost:3000/api/wiki/editor/RDRWB1Yh/N3YzBJsm'
      // const devUrl = 'wss://dev.myones.net/wiki/B1002/api/wiki/editor/RDRWB1Yh/N3YzBJsm'
      const flagStr = '/api/wiki/'
      const index = url.indexOf(flagStr)
      let redirectUrl = url
      if (index > -1) {
        redirectUrl = `wss://dev.myones.net/wiki/${branch}${url.substr(index)}`
      }
      super(redirectUrl)
    }
  }
  // @ts-ignore
  window.WebSocket = MyWebSocket
}
