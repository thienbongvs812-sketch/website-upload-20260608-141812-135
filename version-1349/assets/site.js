(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle('is-active', itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle('is-active', itemIndex === current);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    start();
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initFilterScope(scope) {
    var gridId = scope.getAttribute('data-filter-scope');
    var grid = document.getElementById(gridId);
    if (!grid) {
      return;
    }
    var input = qs('[data-search-input]', scope);
    var yearFilter = qs('[data-year-filter]', scope);
    var typeFilter = qs('[data-type-filter]', scope);
    var sortSelect = qs('[data-sort-select]', scope);
    var cards = qsa('[data-movie-card]', grid);
    var years = [];
    var types = [];

    cards.forEach(function (card) {
      var year = card.getAttribute('data-year');
      var type = card.getAttribute('data-type');
      if (year && years.indexOf(year) === -1) {
        years.push(year);
      }
      if (type && types.indexOf(type) === -1) {
        types.push(type);
      }
    });

    years.sort(function (a, b) {
      return Number(b) - Number(a);
    });
    types.sort();
    fillSelect(yearFilter, years);
    fillSelect(typeFilter, types);

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = yearFilter ? yearFilter.value : '';
      var typeValue = typeFilter ? typeFilter.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = true;
        if (query && haystack.indexOf(query) === -1) {
          matched = false;
        }
        if (yearValue && card.getAttribute('data-year') !== yearValue) {
          matched = false;
        }
        if (typeValue && card.getAttribute('data-type') !== typeValue) {
          matched = false;
        }
        card.classList.toggle('is-hidden', !matched);
      });
    }

    function sortCards() {
      var mode = sortSelect ? sortSelect.value : 'year-desc';
      cards.sort(function (a, b) {
        if (mode === 'rating-desc') {
          return Number(b.getAttribute('data-rating')) - Number(a.getAttribute('data-rating'));
        }
        if (mode === 'views-desc') {
          return Number(b.getAttribute('data-views')) - Number(a.getAttribute('data-views'));
        }
        if (mode === 'title-asc') {
          return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-Hans-CN');
        }
        return Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
      });
      cards.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }

    [input, yearFilter, typeFilter].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
    if (sortSelect) {
      sortSelect.addEventListener('change', sortCards);
    }
    sortCards();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(initFilterScope);
  }

  function initPageSearch() {
    var input = qs('[data-page-search]');
    if (!input) {
      return;
    }
    var cards = qsa('[data-movie-card]');
    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        card.classList.toggle('is-hidden', query && haystack.indexOf(query) === -1);
      });
    });
  }

  window.initDetailPlayer = function (url, playerId) {
    var root = document.getElementById(playerId);
    if (!root) {
      return;
    }
    var video = qs('video', root);
    var layer = qs('[data-player-cover]', root);
    var button = qs('[data-player-button]', root);
    var prepared = false;
    var hls = null;

    function prepare() {
      if (prepared || !video) {
        return;
      }
      prepared = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function play() {
      prepare();
      if (layer) {
        layer.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', play);
    }
    if (layer) {
      layer.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!prepared) {
          play();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPageSearch();
  });
})();
