(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initHeader() {
        var header = qs('[data-header]');
        var backTop = qs('[data-back-top]');
        function update() {
            if (header) {
                header.classList.toggle('is-scrolled', window.scrollY > 16);
            }
            if (backTop) {
                backTop.classList.toggle('is-visible', window.scrollY > 420);
            }
        }
        update();
        window.addEventListener('scroll', update, { passive: true });
        if (backTop) {
            backTop.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function initMobileNav() {
        var toggle = qs('[data-mobile-toggle]');
        var nav = qs('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = qs('[data-hero]');
        if (!root) {
            return;
        }
        var slides = qsa('[data-hero-slide]', root);
        var dots = qsa('[data-hero-dot]', root);
        var index = 0;
        var timer = null;
        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || 0));
                start();
            });
        });
        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        qsa('[data-filter-panel]').forEach(function (panel) {
            var search = qs('[data-filter-search]', panel);
            var type = qs('[data-filter-type]', panel);
            var year = qs('[data-filter-year]', panel);
            var category = qs('[data-filter-category]', panel);
            var empty = qs('[data-empty-state]', panel);
            var cards = qsa('[data-movie-card]');
            function apply() {
                var keyword = normalize(search && search.value);
                var selectedType = normalize(type && type.value);
                var selectedYear = normalize(year && year.value);
                var selectedCategory = normalize(category && category.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-tags'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-category')
                    ].join(' '));
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (selectedType && normalize(card.getAttribute('data-type')) !== selectedType) {
                        ok = false;
                    }
                    if (selectedYear && normalize(card.getAttribute('data-year')) !== selectedYear) {
                        ok = false;
                    }
                    if (selectedCategory && normalize(card.getAttribute('data-category')) !== selectedCategory) {
                        ok = false;
                    }
                    card.hidden = !ok;
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }
            [search, type, year, category].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initPlayers() {
        qsa('[data-player]').forEach(function (player) {
            var video = qs('video', player);
            var trigger = qs('[data-player-trigger]', player);
            var message = qs('[data-player-message]', player);
            var url = player.getAttribute('data-video-url');
            var ready = false;
            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                    message.hidden = !text;
                }
            }
            function attach() {
                if (!video || !url || ready) {
                    return;
                }
                ready = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = url;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            setMessage('播放加载遇到问题，请稍后再试');
                        }
                    });
                } else {
                    video.src = url;
                }
            }
            function play() {
                attach();
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
                video.controls = true;
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        setMessage('点击视频区域继续播放');
                    });
                }
            }
            if (video && url) {
                attach();
                if (trigger) {
                    trigger.addEventListener('click', play);
                }
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    }
                });
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initMobileNav();
        initHero();
        initFilters();
        initPlayers();
    });
}());
