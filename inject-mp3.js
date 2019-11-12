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

if (!onMuseScoreDownloadMp3Ready) {
  function onMuseScoreDownloadMp3Ready(e) {
    chrome.runtime.sendMessage({ ...e.detail, type: 'MP3' })
  }
  document.addEventListener('musescore-download-ready', onMuseScoreDownloadMp3Ready)
}
