import { $, $All } from '~/common/utils'

const getButton = (name: string) => {
  const button = document.createElement('a')
  const text = document.createTextNode(name)
  button.className = 'btn btn-sm btn-primary mr-2 ones-helper'
  button.appendChild(text)
  const pathname = location.pathname
  const index = pathname.indexOf('compare/')
  const prePathName = pathname.substring(0, index)
  button.href = `${prePathName}compare/${name}...${name}`
  return button
}

const addCompareButtons = () => {
  const onesHelper = $('.ones-helper')
  if (onesHelper)
    return

  const comparePanel = $('.range-editor.color-fg-muted.js-range-editor ')
  if (comparePanel) {
    const pair = $All('.range-cross-repo-pair')
    const last = pair[1]
    last.appendChild(getButton('preview1'))
    last.appendChild(getButton('preview2'))
    last.appendChild(getButton('preview3'))
  }
}

export const branchSelectEnhance = () => {
  if (location.href.includes('https://github.com/BangWork/')) {
    addCompareButtons()
    window.addEventListener('click', () => {
      setTimeout(() => {
        addCompareButtons()
      }, 1000)
    })
  }
}
