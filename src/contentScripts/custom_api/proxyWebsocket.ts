export default function proxyWebsocket(path = 'master') {
  class MyWebSocket extends WebSocket {
    constructor(url = '') {
      // const localUrl = 'ws://dev.localhost:3000/api/wiki/editor/RDRWB1Yh/N3YzBJsm'
      // const devUrl = 'wss://dev.myones.net/wiki/B1002/api/wiki/editor/RDRWB1Yh/K1u8hx1d'
      const flagStr = '/api/'
      const index = url.indexOf(flagStr)
      let redirectUrl = url
      if (path.startsWith('ws')) {
        redirectUrl = `${path}${url.substring(index)}`
      }
      else {
        if (index > -1) {
          redirectUrl = `wss://dev.myones.net/wiki/${path}${url.substring(index)}`
        }
      }
      super(redirectUrl)
    }
  }
  // @ts-ignore
  window.WebSocket = MyWebSocket
}
