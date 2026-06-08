(function () {
  function initMoviePlayer(sourceUrl) {
    var video = document.getElementById("movieVideo");
    var overlay = document.getElementById("playOverlay");
    var message = document.querySelector("[data-video-message]");
    var hls = null;
    var attached = false;

    if (!video || !overlay || !sourceUrl) {
      return;
    }

    function setMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text || "";
      message.classList.toggle("is-hidden", !text);
    }

    function showOverlay() {
      overlay.classList.remove("is-hidden");
    }

    function hideOverlay() {
      overlay.classList.add("is-hidden");
    }

    function playVideo() {
      hideOverlay();
      setMessage("");
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          showOverlay();
        });
      }
    }

    function attachAndPlay() {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        if (!video.src) {
          video.src = sourceUrl;
        }
        playVideo();
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            attached = true;
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setMessage("播放加载失败，请稍后重试");
              showOverlay();
            }
          });
          return;
        }

        if (attached || video.readyState > 0) {
          playVideo();
        }
        return;
      }

      setMessage("当前环境暂时无法播放此视频");
      showOverlay();
    }

    overlay.addEventListener("click", attachAndPlay);
    video.addEventListener("click", function () {
      if (video.paused) {
        attachAndPlay();
      }
    });
    video.addEventListener("play", hideOverlay);
    video.addEventListener("pause", function () {
      if (!video.ended) {
        showOverlay();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
