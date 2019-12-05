function injectScript(file_path, tag) {
  var node = document.getElementsByTagName(tag)[0]
  var script = document.createElement('script')
  script.setAttribute('type', 'text/javascript')
  script.setAttribute('src', file_path)
  script.onload = () => {
    script.remove()
  }
  node.appendChild(script)
}

injectScript(chrome.extension.getURL('content.js'), 'body')
;(function() {
  let onMuseScoreDownloadReady = e => {
    chrome.runtime.sendMessage({ detail: e.detail, type: 'MP3' })
    document.removeEventListener('musescore-download-ready', onMuseScoreDownloadReady)
  }
  document.addEventListener('musescore-download-ready', onMuseScoreDownloadReady)
})()
