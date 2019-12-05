;(function() {
  document.dispatchEvent(
    new CustomEvent('musescore-download-ready', {
      detail: JSON.stringify(window.UGAPP.store.jmuse_settings.score_player),
    }),
  )
})()
