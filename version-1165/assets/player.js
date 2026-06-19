(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('.play-overlay');
      if (!video || !button) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var started = false;
      var hls = null;

      function playVideo() {
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function attach() {
        if (!stream) {
          return;
        }
        button.classList.add('is-hidden');
        if (started) {
          playVideo();
          return;
        }
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.load();
          playVideo();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          return;
        }
        video.src = stream;
        video.load();
        playVideo();
      }

      button.addEventListener('click', attach);
      video.addEventListener('click', function () {
        if (!started) {
          attach();
        }
      });
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  });
})();
