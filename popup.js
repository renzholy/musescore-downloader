document.querySelector('#pdf').onclick = () => {
  chrome.runtime.sendMessage({ action: 'inject', type: 'PDF' })
}

document.querySelector('#midi').onclick = () => {
  chrome.runtime.sendMessage({ action: 'inject', type: 'MIDI' })
}

document.querySelector('#mp3').onclick = () => {
  chrome.runtime.sendMessage({ action: 'inject', type: 'MP3' })
}
