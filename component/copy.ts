import { ShyAlert } from "./lib/alert"

export const CopyText = (text, fn?: any) => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(
        () => {
          //console.log('Async: Copying to clipboard was successful!')
        },
        err => {
          console.error('Async: Could not copy text: ', err)
        },
      )
      .finally(() => {
        if (fn) {
          fn()
        }
      })
  } else if ((window as any).clipboardData && (window as any).clipboardData.setData) {
    // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
    ; (window as any).clipboardData.setData('Text', text)
    if (fn) {
      fn()
    }
  } else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    let textarea = null
    if (document.getElementById('copyTextarea')) {
      textarea = document.getElementById('copyTextarea')
    } else {
      textarea = document.createElement('textarea')
      textarea.id = 'copyTextarea'
      textarea.style.position = 'fixed' // Prevent scrolling to bottom of page in Microsoft Edge.
      document.body.appendChild(textarea)
    }
    textarea.textContent = text
    textarea.select()
    try {
      return document.execCommand('copy') // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex)
      return false
    } finally {
      document.body.removeChild(textarea)
      if (fn) {
        fn()
      }
    }
  }
}


export const CopyAlert = (text: string, alert: string) => {
  CopyText(text, () => {
    ShyAlert(alert)
  })
}


export async function WriteClipboardHtml(html: string) {
  const bo = new Blob([html], { type: 'text/html' });
  var item = new ClipboardItem({
    'text/html': bo
  } as any) as any
  await navigator.clipboard.write([item]);
}