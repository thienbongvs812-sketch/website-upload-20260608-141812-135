var hlsLoaderPromise = import("./hls-vendor.js")
  .then(function (module) {
    return module.H;
  })
  .catch(function () {
    return null;
  });

function ready(fn) {
  if (document.readyState !== "loading") {
    fn();
    return;
  }
  document.addEventListener("DOMContentLoaded", fn);
}

ready(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
  players.forEach(setupPlayer);
});

function setupPlayer(shell) {
  var video = shell.querySelector("video");
  var button = shell.querySelector("[data-player-button]");
  var message = shell.querySelector("[data-player-message]");
  var source = shell.getAttribute("data-video-src");

  if (!video || !button || !source) {
    return;
  }

  var initialized = false;
  var hlsInstance = null;

  function setMessage(text) {
    if (message) {
      message.textContent = text || "";
    }
  }

  function playVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        setMessage("播放器已加载，请再次点击播放按钮开始播放。");
      });
    }
  }

  function initializeWithNativeHls() {
    video.src = source;
    video.addEventListener("loadedmetadata", playVideo, { once: true });
    video.load();
  }

  function initializeWithHlsLibrary(Hls) {
    if (!Hls || !Hls.isSupported()) {
      initializeWithNativeHls();
      return;
    }

    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      playVideo();
    });
    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setMessage("网络连接暂时不稳定，播放器正在重新连接。");
        hlsInstance.startLoad();
        return;
      }

      if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setMessage("媒体加载异常，播放器正在自动恢复。");
        hlsInstance.recoverMediaError();
        return;
      }

      setMessage("当前播放源暂时不可用，请刷新页面后重试。");
      hlsInstance.destroy();
      hlsInstance = null;
    });
  }

  button.addEventListener("click", function () {
    shell.classList.add("is-playing");

    if (initialized) {
      playVideo();
      return;
    }

    initialized = true;
    hlsLoaderPromise.then(function (Hls) {
      var canPlayNative = video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL");

      if (canPlayNative) {
        initializeWithNativeHls();
        return;
      }

      initializeWithHlsLibrary(Hls);
    });
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
