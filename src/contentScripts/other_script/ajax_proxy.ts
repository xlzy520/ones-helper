export default function run(sUrl = 'http://localhost:9001/') {
  class MyXHR extends XMLHttpRequest {
    originalOpen: any
  }

  MyXHR.prototype.originalOpen = XMLHttpRequest.prototype.open

  // @ts-ignore
  MyXHR.prototype.open = function(...args) {
    console.log(args)
    let url = args[1]
    // const reg = /https:\/\/dev.myones.net.*?api/
    if (url.toString().startsWith('api/')) {
      url = sUrl + url.toString().replace('api/project/', '')
    }
    console.log(url)
    args[1] = url
    // @ts-ignore
    // eslint-disable-next-line prefer-spread
    this.originalOpen && this.originalOpen.apply(this, args)
  }
  window.XMLHttpRequest = MyXHR
}
