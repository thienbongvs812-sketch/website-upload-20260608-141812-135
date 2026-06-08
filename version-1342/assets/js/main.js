(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function htmlEscape(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function rootPath() {
    return document.body.getAttribute("data-root") || "./";
  }

  function bindMenu() {
    var toggle = qs(".menu-toggle");
    var panel = qs(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function bindSearchForms() {
    qsa(".site-search").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = qs("input[name='q']", form);
        if (!input || !input.value.trim()) {
          event.preventDefault();
          return;
        }
        if (!form.getAttribute("action")) {
          event.preventDefault();
          window.location.href = rootPath() + "search.html?q=" + encodeURIComponent(input.value.trim());
        }
      });
    });
  }

  function bindHero() {
    var slides = qsa(".hero-slide");
    if (!slides.length) {
      return;
    }
    var dots = qsa(".hero-dot");
    var prev = qs(".hero-prev");
    var next = qs(".hero-next");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-slide")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    qsa(".hero-carousel").forEach(function (carousel) {
      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
    });

    show(0);
    start();
  }

  function bindImageState() {
    qsa("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-muted");
      });
    });
  }

  function bindLibraryTools() {
    var search = qs(".library-search");
    var list = qs(".sortable-list");
    if (!list) {
      return;
    }
    var cards = qsa(".movie-card", list);
    if (search) {
      search.addEventListener("input", function () {
        var value = search.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var text = [
            card.getAttribute("data-title"),
            card.getAttribute("data-year"),
            card.getAttribute("data-region"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();
          card.classList.toggle("hidden-card", value && text.indexOf(value) === -1);
        });
      });
    }
    var sort = qs(".sort-select");
    if (sort) {
      sort.addEventListener("change", function () {
        var ordered = cards.slice();
        var mode = sort.value;
        ordered.sort(function (a, b) {
          var ay = Number(a.getAttribute("data-year")) || 0;
          var by = Number(b.getAttribute("data-year")) || 0;
          var at = a.getAttribute("data-title") || "";
          var bt = b.getAttribute("data-title") || "";
          if (mode === "year-desc") {
            return by - ay;
          }
          if (mode === "year-asc") {
            return ay - by;
          }
          if (mode === "title") {
            return at.localeCompare(bt, "zh-CN");
          }
          return cards.indexOf(a) - cards.indexOf(b);
        });
        ordered.forEach(function (card) {
          list.appendChild(card);
        });
      });
    }
  }

  function cardTemplate(movie) {
    return [
      '<article class="poster-card movie-card" data-title="' + htmlEscape(movie.title) + '" data-year="' + htmlEscape(movie.year) + '" data-region="' + htmlEscape(movie.region) + '" data-genre="' + htmlEscape(movie.genre) + '">',
      '  <a href="./movie/' + htmlEscape(movie.file) + '">',
      '    <span class="poster-frame">',
      '      <img src="./' + htmlEscape(movie.image) + '" alt="' + htmlEscape(movie.title) + '" loading="lazy">',
      '      <span class="play-mark">▶</span>',
      '      <span class="type-badge">' + htmlEscape(movie.type) + '</span>',
      '    </span>',
      '    <span class="poster-info">',
      '      <strong>' + htmlEscape(movie.title) + '</strong>',
      '      <small>' + htmlEscape(movie.year) + ' · ' + htmlEscape(movie.region) + '</small>',
      '      <em>' + htmlEscape(movie.oneLine) + '</em>',
      '    </span>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function bindSearchPage() {
    var box = qs("#searchResults");
    var title = qs("#searchTitle");
    if (!box || !title || !window.SEARCH_MOVIES) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var formInput = qs(".search-hero-form input[name='q']");
    if (formInput) {
      formInput.value = query;
    }
    if (!query) {
      return;
    }
    var value = query.toLowerCase();
    var results = window.SEARCH_MOVIES.filter(function (movie) {
      return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine]
        .join(" ")
        .toLowerCase()
        .indexOf(value) !== -1;
    });
    title.textContent = "“" + query + "” 的搜索结果";
    box.innerHTML = results.slice(0, 160).map(cardTemplate).join("");
    bindImageState();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindMenu();
    bindSearchForms();
    bindHero();
    bindImageState();
    bindLibraryTools();
    bindSearchPage();
  });
})();
