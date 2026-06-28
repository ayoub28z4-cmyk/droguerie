export function printDocument(html: string): void {
  const iframe = document.createElement('iframe')
  iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px;top:-9999px;'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return

  doc.open()
  doc.write(html)
  doc.close()

  iframe.contentWindow?.focus()
  setTimeout(() => {
    iframe.contentWindow?.print()
    setTimeout(() => document.body.removeChild(iframe), 1000)
  }, 350)
}
