let urls = []

chrome.webRequest.onCompleted.addListener(
  msg => {
    if (msg.initiator === 'https://musescore.com' && msg.url) {
      urls.push(msg.url.replace(/[\?@].*/, ''))
    }
  },
  {
    urls: [
      '*://musescore.com/static/musescore/scoredata/gen/*.svg*',
      '*://musescore.com/static/musescore/scoredata/gen/*.png*',
    ],
  },
  ['responseHeaders'],
)

chrome.pageAction.onClicked.addListener(async tab => {
  urls = [...new Set(urls)].sort()
  const doc = new PDFDocument({ autoFirstPage: false })
  const stream = doc.pipe(blobStream())
  if (urls[0] && urls[0].endsWith('.svg')) {
    const svgs = await Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    for (const svg of svgs) {
      doc.addPage()
      SVGtoPDF(doc, svg.replace(/width="\d+px"/, '').replace(/height="\d+px"/, ''), 0, 0)
    }
  } else if (urls[0] && urls[0].endsWith('.png')) {
    const pngs = await Promise.all(
      urls.map(url => fetch(url).then(response => response.arrayBuffer())),
    )
    for (const png of pngs) {
      doc.addPage()
      doc.image(png, 0, 0, { fit: [612, 792] })
    }
  }
  doc.end()
  stream.on('finish', () => {
    const url = stream.toBlobURL('application/pdf')
    chrome.downloads.download({
      filename: `${tab.title.replace(/ sheet music for Piano .*/, '')}.pdf`,
      url,
    })
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
