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
  if (message.action === 'inject') {
    chrome.tabs.executeScript({
      file: `inject-${message.type.toLowerCase()}.js`,
    })
    return
  }

  const detail = JSON.parse(message.detail)
  console.log(detail)
  const filename = detail.json.metadata.title.replace(/\n/g, ' ')

  if (message.type === 'MIDI') {
    chrome.downloads.download({
      filename: `${filename}.midi`,
      url: detail.urls.midi,
    })
    return
  }

  if (message.type === 'MP3') {
    chrome.downloads.download({
      filename: `${filename}.mp3`,
      url: detail.urls.mp3,
    })
    return
  }

  const array = []
  for (let page = 0; page < detail.json.metadata.pages; page++) {
    array.push(
      `${detail.urls.image_path}score_${page}.${detail.render_vector ? 'svg' : 'png'}`.replace(
        /[\?@].*/,
        '',
      ),
    )
  }

  const { type, urls } = cleanUpUrls(array)
  const doc = new PDFDocument({ autoFirstPage: false })
  const stream = doc.pipe(blobStream())
  const [width, height] = detail.json.metadata.dimensions.split('x').map(size => parseInt(size))
  if (type === 'svg') {
    const svgs = await Promise.all(urls.map(url => fetch(url).then(response => response.text())))
    for (const svg of svgs) {
      const matchedWidth = svg.match(/width="(.+px|\d+\.\d+)"/)
      const width2 =
        matchedWidth && matchedWidth[1] ? parseFloat(matchedWidth[1].replace('px', '')) : width
      const matchedHeight = svg.match(/height="(.+px|\d+\.\d+)"/)
      const height2 =
        matchedHeight && matchedHeight[1] ? parseFloat(matchedHeight[1].replace('px', '')) : height
      doc.addPage({
        size: [width2, height2],
      })
      SVGtoPDF(doc, svg, 0, 0, {
        assumePt: true,
      })
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

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: {
              urlMatches: 'musescore\\.com/.*',
            },
          }),
        ],
        actions: [new chrome.declarativeContent.ShowPageAction()],
      },
    ])
  })
})
