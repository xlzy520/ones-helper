export const copyToClipboard = function(input: string) {
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
  catch (err) {}

  document.body.removeChild(el)
  return success
}

export const $ = function(query: string) {
  return document.querySelector(query)
}
export const $All = function(query: string) {
  return document.querySelectorAll(query)
}

export const injectScriptLink = function(src: string) {
  const head = $('head')
  if (head) {
    const scriptTag = document.createElement('script')
    scriptTag.src = src
    head.appendChild(scriptTag)
  }
}

export const injectScript = function(scriptContent: string) {
  const head = $('head')
  if (head) {
    const scriptTag = document.createElement('script')
    scriptTag.innerHTML = scriptContent
    head.appendChild(scriptTag)
  }
}

export const isSaas = () => {
  return location.href.includes('https://ones.ai/')
}

export const isDev = () => {
  return location.href.includes('https://dev.myones.net')
}

export const isPrivate = () => {
  return location.href.includes('https://mars-dev.myones.net:')
}
