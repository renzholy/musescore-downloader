;(function() {
  const timer = setInterval(() => {
    const root = document.querySelector('article section div:nth-child(3) section section')
    if (root) {
      clearInterval(timer)
    } else {
      return
    }
    Array.from(root.children)
      .map(({ children }) => children[0].children[0])
      .filter(({ nodeName }) => nodeName === 'H3')
      .forEach(h3 => {
        const type = h3.innerText
        if (type === 'PDF' || type === 'MIDI' || type === 'MP3') {
          const a = document.createElement('a')
          a.innerText = ` [Free ${type}]`
          a.style.color = 'green'
          a.className = 'musescore-free'
          a.onclick = () =>
            document.dispatchEvent(
              new CustomEvent('musescore-download-type', {
                detail: { ...window.UGAPP.store.jmuse_settings.score_player, type },
              }),
            )
          h3.appendChild(a)
        }
      })
  }, 500)
})()
