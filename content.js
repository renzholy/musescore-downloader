;(function() {
  document.dispatchEvent(
    new CustomEvent('musescore-download-ready', {
      detail: window.UGAPP.store.jmuse_settings.score_player,
    }),
  )
})()
