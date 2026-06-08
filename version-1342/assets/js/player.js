(function () {
  function setupPlayer(wrapper) {
    var video = wrapper.querySelector("video");
    var overlay = wrapper.querySelector(".play-overlay");
    if (!video || !overlay) {
      return;
    }

    var stream = video.getAttribute("data-stream");
    var prepared = false;
    var instance = null;

    function prepare() {
      if (prepared || !stream) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        instance.loadSource(stream);
        instance.attachMedia(video);
        instance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (!data || !data.fatal || !instance) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            instance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            instance.recoverMediaError();
          } else {
            instance.destroy();
            instance = null;
          }
        });
      } else {
        video.src = stream;
      }
    }

    function start() {
      prepare();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    Array.prototype.slice.call(document.querySelectorAll(".movie-player")).forEach(setupPlayer);
  });
})();
