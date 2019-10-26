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
injectScript(chrome.extension.getURL('contentScript.js'), 'body')
if (!onMuseScoreDownloadType) {
  function onMuseScoreDownloadType(e) {
    chrome.runtime.sendMessage(e.detail)
  }
  document.addEventListener('musescore-download-type', onMuseScoreDownloadType)
}
