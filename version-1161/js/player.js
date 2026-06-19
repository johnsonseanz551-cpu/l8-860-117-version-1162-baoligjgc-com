(function () {
  window.initMoviePlayer = function (source) {
    var video = document.getElementById('movie-video');
    var start = document.getElementById('player-start');
    var wrap = document.querySelector('[data-player-wrap]');
    if (!video || !start || !source) {
      return;
    }

    var hls = null;
    var initialized = false;

    function hideStart() {
      start.classList.add('is-hidden');
      if (wrap) {
        wrap.classList.add('is-playing');
      }
    }

    function showStart() {
      start.classList.remove('is-hidden');
      if (wrap) {
        wrap.classList.remove('is-playing');
      }
    }

    function attemptPlay() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          showStart();
        });
      }
    }

    function startPlayback() {
      hideStart();
      if (initialized) {
        attemptPlay();
        return;
      }
      initialized = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', attemptPlay, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          attemptPlay();
        });
      } else {
        video.src = source;
        video.addEventListener('loadedmetadata', attemptPlay, { once: true });
        video.load();
      }
    }

    start.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideStart);
    video.addEventListener('pause', function () {
      if (!video.ended) {
        showStart();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
