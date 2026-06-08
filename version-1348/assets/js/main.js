(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (toggle && menu) {
            toggle.addEventListener('click', function () {
                menu.classList.toggle('is-open');
            });
        }

        document.querySelectorAll('[data-hero]').forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var prev = hero.querySelector('[data-hero-prev]');
            var next = hero.querySelector('[data-hero-next]');
            var index = 0;
            var timer = null;

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('is-active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('is-active', i === index);
                });
            }

            function schedule() {
                window.clearInterval(timer);
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener('click', function () {
                    show(index - 1);
                    schedule();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(index + 1);
                    schedule();
                });
            }

            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    schedule();
                });
            });

            show(0);
            schedule();
        });

        document.querySelectorAll('[data-filter-root]').forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var chips = Array.prototype.slice.call(root.querySelectorAll('[data-filter-chip]'));
            var items = Array.prototype.slice.call(root.querySelectorAll('[data-filter-item]'));
            var empty = root.querySelector('[data-empty-state]');
            var activeChip = '';

            function normalize(value) {
                return String(value || '').toLowerCase().replace(/\s+/g, '');
            }

            function apply() {
                var query = normalize(input ? input.value : '');
                var chip = normalize(activeChip);
                var visible = 0;

                items.forEach(function (item) {
                    var haystack = normalize(item.getAttribute('data-filter-text'));
                    var matchedQuery = !query || haystack.indexOf(query) !== -1;
                    var matchedChip = !chip || haystack.indexOf(chip) !== -1;
                    var matched = matchedQuery && matchedChip;
                    item.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
            }

            chips.forEach(function (chipButton) {
                chipButton.addEventListener('click', function () {
                    activeChip = chipButton.getAttribute('data-filter-chip') || '';
                    chips.forEach(function (button) {
                        button.classList.toggle('is-active', button === chipButton);
                    });
                    apply();
                });
            });

            apply();
        });
    });
})();
