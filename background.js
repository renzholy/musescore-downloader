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

chrome.pageAction.onClicked.addListener(tab => {
  // chrome.downloads.download({ url: msg.url })
  console.log(urls)
  urls = []
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
