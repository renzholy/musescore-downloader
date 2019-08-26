let urls = []

chrome.webRequest.onCompleted.addListener(
  msg => {
    console.log(msg)
    if (msg.initiator === 'https://musescore.com' && msg.url) {
      urls.push(msg.url.replace(/\?.*/, ''))
    }
  },
  {
    urls: ['*://musescore.com/static/musescore/scoredata/gen/*.svg*'],
  },
  ['responseHeaders'],
)

chrome.pageAction.onClicked.addListener(async () => {
  urls = [...new Set(urls)].sort()
  const svgs = await Promise.all(urls.map(url => fetch(url).then(response => response.text())))
  const doc = new PDFDocument({ autoFirstPage: false })
  const stream = doc.pipe(blobStream())
  for (const svg of svgs) {
    doc.addPage()
    SVGtoPDF(doc, svg.replace(/width="\d+px"/, '').replace(/height="\d+px"/, ''), 0, 0)
  }
  doc.end()
  stream.on('finish', () => {
    const url = stream.toBlobURL('application/pdf')
    chrome.downloads.download({ url })
  })
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlMatches: 'musescore\\.com/user/.*/scores/.*',
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ])
  })
})

console.log(SVGtoPDF)
console.log(PDFDocument)
