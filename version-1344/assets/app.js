(function () {
    var hlsPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (hlsPromise) {
            return hlsPromise;
        }
        hlsPromise = new Promise(function (resolve, reject) {
            var script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js";
            script.async = true;
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = function () {
                reject(new Error("load failed"));
            };
            document.head.appendChild(script);
        });
        return hlsPromise;
    }

    function preparePlayer(source, poster) {
        var shells = document.querySelectorAll("[data-player]");
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            var started = false;
            var hlsInstance = null;

            if (!video || !overlay) {
                return;
            }

            if (poster) {
                video.poster = poster;
            }

            function attachMedia() {
                if (started) {
                    return Promise.resolve();
                }
                started = true;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    return Promise.resolve();
                }
                return loadHlsLibrary().then(function (Hls) {
                    if (Hls && Hls.isSupported()) {
                        hlsInstance = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                            backBufferLength: 90
                        });
                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                }).catch(function () {
                    video.src = source;
                });
            }

            function playVideo() {
                overlay.classList.add("is-hidden");
                attachMedia().then(function () {
                    var promise = video.play();
                    if (promise && typeof promise.catch === "function") {
                        promise.catch(function () {
                            overlay.classList.remove("is-hidden");
                        });
                    }
                });
            }

            overlay.addEventListener("click", playVideo);
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                overlay.classList.add("is-hidden");
            });
            video.addEventListener("ended", function () {
                overlay.classList.remove("is-hidden");
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    function initMobileMenu() {
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            var isOpen = !panel.hidden;
            panel.hidden = isOpen;
            toggle.setAttribute("aria-expanded", String(!isOpen));
        });
    }

    function initHeroCarousel() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector(".hero-prev");
        var next = hero.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === index);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            window.clearInterval(timer);
            start();
        }

        dots.forEach(function (dot, position) {
            dot.addEventListener("click", function () {
                show(position);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        if (slides.length > 1) {
            start();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function applyFilters(scope) {
        var root = scope || document;
        var input = root.querySelector(".movie-search-input");
        var activeChip = root.querySelector(".filter-chip.is-active");
        var cards = Array.prototype.slice.call(root.querySelectorAll(".movie-card, .horizontal-card"));
        var empty = root.querySelector(".empty-state");
        var query = normalize(input ? input.value : "");
        var filter = activeChip ? normalize(activeChip.getAttribute("data-filter-value")) : "all";
        var visible = 0;

        cards.forEach(function (card) {
            var text = normalize(card.getAttribute("data-search"));
            var tags = normalize(card.getAttribute("data-filter"));
            var matchesQuery = !query || text.indexOf(query) !== -1;
            var matchesFilter = filter === "all" || tags.indexOf(filter) !== -1;
            var shouldShow = matchesQuery && matchesFilter;
            card.classList.toggle("is-search-hidden", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }
    }

    function initFiltering() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search-input"));
        inputs.forEach(function (input) {
            var section = input.closest("section") || document;
            input.addEventListener("input", function () {
                applyFilters(section);
            });
        });

        var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var wrap = chip.closest("section") || document;
                Array.prototype.slice.call(wrap.querySelectorAll(".filter-chip")).forEach(function (item) {
                    item.classList.remove("is-active");
                });
                chip.classList.add("is-active");
                applyFilters(wrap);
            });
        });
    }

    function initSearchPage() {
        var input = document.getElementById("searchPageInput");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        input.value = query;
        applyFilters(input.closest("section") || document);
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMobileMenu();
        initHeroCarousel();
        initFiltering();
        initSearchPage();
    });

    window.preparePlayer = preparePlayer;
})();
