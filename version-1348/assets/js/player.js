var MoviePlayer = (function () {
    function start(config) {
        var video = document.getElementById(config.videoId);
        var button = document.getElementById(config.buttonId);
        var src = config.src;
        var loaded = false;
        var hls = null;

        if (!video || !button || !src) {
            return;
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = src;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
            } else {
                video.src = src;
            }
        }

        function play() {
            load();
            var playResult = video.play();
            if (playResult && typeof playResult.then === 'function') {
                playResult.then(function () {
                    button.classList.add('is-hidden');
                }).catch(function () {
                    button.classList.remove('is-hidden');
                });
            } else {
                button.classList.add('is-hidden');
            }
        }

        button.addEventListener('click', function () {
            play();
        });

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });

        video.addEventListener('pause', function () {
            button.classList.remove('is-hidden');
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    return {
        start: start
    };
})();
