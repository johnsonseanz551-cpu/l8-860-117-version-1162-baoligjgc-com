import { H as Hls } from './hls-dru42stk.js';

function setStatus(message) {
  var status = document.querySelector('[data-player-status]');

  if (status) {
    status.textContent = message;
  }
}

function initializePlayer() {
  var video = document.getElementById('movie-player');
  var button = document.querySelector('[data-play-button]');

  if (!video || !button) {
    return;
  }

  var source = video.getAttribute('data-src');
  var hlsInstance = null;

  function attachSource() {
    if (!source) {
      setStatus('未找到播放源');
      return Promise.reject(new Error('Missing video source'));
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('正在使用浏览器原生 HLS 播放');
      return Promise.resolve();
    }

    if (Hls && Hls.isSupported()) {
      if (hlsInstance) {
        hlsInstance.destroy();
      }

      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        maxBufferLength: 60
      });

      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
        setStatus('播放源已加载');
      });
      hlsInstance.on(Hls.Events.ERROR, function (_, data) {
        if (data && data.fatal) {
          setStatus('播放源加载失败，请稍后重试');
        }
      });

      return Promise.resolve();
    }

    setStatus('当前浏览器不支持 HLS 播放');
    return Promise.reject(new Error('HLS is not supported'));
  }

  button.addEventListener('click', function () {
    button.classList.add('hidden');

    attachSource()
      .then(function () {
        return video.play();
      })
      .then(function () {
        setStatus('正在播放');
      })
      .catch(function () {
        button.classList.remove('hidden');
      });
  });
}

initializePlayer();
