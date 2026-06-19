(function () {
  function init(url) {
    var video = document.getElementById('player-video');
    var cover = document.getElementById('player-cover');
    var prepared = false;
    var hls = null;

    if (!video || !cover || !url) {
      return;
    }

    function prepare() {
      if (prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        return;
      }

      video.src = url;
    }

    function start() {
      prepare();
      cover.classList.add('is-hidden');
      video.controls = true;

      var action = video.play();

      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          cover.classList.remove('is-hidden');
        });
      }
    }

    cover.addEventListener('click', start);

    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });

    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        cover.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.SitePlayer = {
    init: init
  };
})();
