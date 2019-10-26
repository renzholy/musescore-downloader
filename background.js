function cleanUpUrls(urls) {
  if (urls.find(url => url.endsWith('svg'))) {
    return {
      type: 'svg',
      urls: urls.filter(url => url.endsWith('svg')),
    }
  }
  return {
    type: 'png',
    urls,
  }
}

chrome.runtime.onMessage.addListener(async message => {
  const filename = message.json.metadata.title.replace(/\n/g, ' ')

  console.log(message)

  if (message.type === 'MIDI') {
    chrome.downloads.download({
      filename: `${filename}.midi`,
      url: message.urls.midi,
    })
    return
  }

  if (message.type === 'MP3') {
    chrome.downloads.download({
      filename: `${filename}.mp3`,
      url: message.urls.mp3,
    })
    return
  }

  const array = []
  for (let page = 0; page < message.json.metadata.pages; page++) {
    array.push(
      `${message.urls.image_path}score_${page}.${message.render_vector ? 'svg' : 'png'}`.replace(
        /[\?@].*/,
        '',
      ),
    )
  }

  const { type, urls } = cleanUpUrls(array)
  const doc = new PDFDocument({ autoFirstPage: false })
  const stream = doc.pipe(blobStream())
  const [width, height] = message.json.metadata.dimensions.split('x').map(size => parseInt(size))
  if (type === 'svg') {
    const svgs = await Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    for (const svg of svgs) {
      doc.addPage({
        size: [width, height],
      })
      SVGtoPDF(doc, svg.replace(/width=".+px"/, '').replace(/height=".+px"/, ''), 0, 0)
    }
  } else if (type === 'png') {
    const pngs = await Promise.all(
      urls.map(url => fetch(url).then(response => response.arrayBuffer())),
    )
    for (const png of pngs) {
      doc.addPage({
        size: [width, height],
      })
      doc.image(png, 0, 0, {
        fit: [width, height],
        align: 'center',
        valign: 'center',
      })
    }
  }
  doc.end()

  stream.on('finish', () => {
    const url = stream.toBlobURL('application/pdf')
    chrome.downloads.download({
      filename: `${filename}.pdf`,
      url,
    })
  })
})

chrome.pageAction.onClicked.addListener(() => {
  chrome.tabs.executeScript({
    file: 'click.js',
  })
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlMatches: 'musescore\\.com/.*/.*',
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ])
  })
})
