;(function() {
  console.log(
    Array.from(
      document.querySelector('#download-modal .modal-body .score-download-list__items').children,
    ).filter(({ nodeName }) => nodeName === 'H3'),
  )
  Array.from(
    document.querySelector('#download-modal .modal-body .score-download-list__items').children,
  )
    .filter(({ nodeName }) => nodeName === 'H3')
    .forEach(h3 => {
      const type = h3.innerText
      if (type === 'PDF' || type === 'MIDI' || type === 'MP3') {
        const a = document.createElement('a')
        a.innerText = ` [Free ${type}]`
        a.style.color = 'green'
        a.onclick = () =>
          document.dispatchEvent(
            new CustomEvent('musescore-download-type', {
              detail: { ...window.UGAPP.store.jmuse_settings.score_player, type },
            }),
          )
        h3.appendChild(a)
      }
    })
})()
