import { getCurrentTab } from '~/common/tabs'

export const copyToClipboard = function (input: string) {
  const el = document.createElement('textarea')
  el.style.fontSize = '12pt'
  el.style.border = '0'
  el.style.padding = '0'
  el.style.margin = '0'
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  el.setAttribute('readonly', '')
  el.value = input

  document.body.appendChild(el)
  el.select()

  let success = false
  try {
    success = document.execCommand('copy', true)
  }
  catch (err) { }

  document.body.removeChild(el)
  return success
}

export const $ = function (query: string) {
  return document.querySelector(query)
}
export const $All = function (query: string) {
  return document.querySelectorAll(query)
}

export const injectHead = (content: HTMLElement) => {
  const head = $('head')
  if (head) {
    head.appendChild(content)
  }
}

export const injectScriptLink = function (src: string) {
  const scriptTag = document.createElement('script')
  scriptTag.src = src
  injectHead(scriptTag)
}

export const injectScript = function (scriptContent: string, id = '') {
  const scriptTag = document.createElement('script')
  scriptTag.setAttribute('id', id)
  scriptTag.innerHTML = scriptContent
  injectHead(scriptTag)
}

export const isSaas = () => {
  return location.href.includes('https://ones.ai/')
}

export const isDevDomain = () => {
  return location.href.includes('https://dev.myones.net')
}

export const isPrivate = () => {
  return location.href.includes('https://mars-dev.myones.net:')
}

export const sendMessage = (message: any) => {
  getCurrentTab().then((tab) => {
    const { id } = tab
    if (id) {
      browser.tabs.sendMessage(id, message)
    }
  })
}

export const isDev = () => {
  return process.env.NODE_ENV !== 'production'
}
