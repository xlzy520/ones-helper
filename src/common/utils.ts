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
