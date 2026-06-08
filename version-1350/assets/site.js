(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');

    if (menuButton && navLinks) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    var sliders = document.querySelectorAll('[data-hero-slider]');
    sliders.forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var current = 0;

        function activate(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                activate(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                activate(current + 1);
            }, 5600);
        }
    });

    var searchInput = document.querySelector('.movie-search-input');
    var typeFilter = document.querySelector('.movie-type-filter');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-grid .movie-card, .searchable-grid .rank-item'));
    var emptyState = document.querySelector('.empty-state');

    function getQueryFromUrl() {
        try {
            return new URLSearchParams(window.location.search).get('q') || '';
        } catch (error) {
            return '';
        }
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-tags') || '',
            card.textContent || ''
        ].join(' ').toLowerCase();
    }

    function applyFilter() {
        if (!cards.length) {
            return;
        }
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var typeValue = typeFilter ? typeFilter.value.trim().toLowerCase() : '';
        var visible = 0;

        cards.forEach(function (card) {
            var text = cardText(card);
            var typeText = (card.getAttribute('data-type') || '').toLowerCase() + ' ' + (card.getAttribute('data-tags') || '').toLowerCase();
            var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
            var matchedType = !typeValue || typeText.indexOf(typeValue) !== -1;
            var shown = matchedKeyword && matchedType;
            card.hidden = !shown;
            if (shown) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (searchInput) {
        var query = getQueryFromUrl();
        if (query) {
            searchInput.value = query;
        }
        searchInput.addEventListener('input', applyFilter);
    }

    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilter);
    }

    applyFilter();

    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var stream = shell.getAttribute('data-stream') || '';

        if (!video || !stream) {
            return;
        }

        if (!video.getAttribute('data-ready')) {
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls();
                hls.loadSource(stream);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
            } else {
                video.src = stream;
            }
            video.setAttribute('data-ready', '1');
        }

        shell.classList.add('is-playing');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {});
        }
    }

    document.querySelectorAll('.player-shell').forEach(function (shell) {
        var button = shell.querySelector('.video-start');
        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayer(shell);
            });
        }
        shell.addEventListener('click', function (event) {
            if (!shell.classList.contains('is-playing') && event.target.tagName !== 'VIDEO') {
                startPlayer(shell);
            }
        });
    });
})();
