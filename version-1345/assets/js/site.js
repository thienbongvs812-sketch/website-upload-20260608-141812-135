(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupFilters();
  });

  function setupMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    if (slides.length <= 1) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (form) {
      var root = form.closest("section") || document;
      var cards = Array.prototype.slice.call(root.querySelectorAll(".searchable-card"));
      var queryInput = form.querySelector("[data-filter-query]");
      var typeSelect = form.querySelector("[data-filter-type]");
      var yearSelect = form.querySelector("[data-filter-year]");
      var categorySelect = form.querySelector("[data-filter-category]");
      var resetButton = form.querySelector("[data-filter-reset]");
      var result = form.querySelector("[data-filter-result]");

      function normalize(value) {
        return String(value || "").trim().toLowerCase();
      }

      function cardText(card) {
        return normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-category"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags")
        ].join(" "));
      }

      function apply() {
        var query = normalize(queryInput && queryInput.value);
        var type = normalize(typeSelect && typeSelect.value);
        var year = normalize(yearSelect && yearSelect.value);
        var category = normalize(categorySelect && categorySelect.value);
        var shown = 0;

        cards.forEach(function (card) {
          var text = cardText(card);
          var match = true;

          if (query && text.indexOf(query) === -1) {
            match = false;
          }

          if (type && normalize(card.getAttribute("data-type")) !== type) {
            match = false;
          }

          if (year && normalize(card.getAttribute("data-year")) !== year) {
            match = false;
          }

          if (category && normalize(card.getAttribute("data-category")) !== category) {
            match = false;
          }

          card.classList.toggle("is-hidden", !match);
          if (match) {
            shown += 1;
          }
        });

        if (result) {
          result.textContent = shown > 0 ? "筛选结果已更新" : "没有匹配影片，请调整条件。";
        }
      }

      [queryInput, typeSelect, yearSelect, categorySelect].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      });

      if (resetButton) {
        resetButton.addEventListener("click", function () {
          if (queryInput) {
            queryInput.value = "";
          }
          if (typeSelect) {
            typeSelect.value = "";
          }
          if (yearSelect) {
            yearSelect.value = "";
          }
          if (categorySelect) {
            categorySelect.value = "";
          }
          apply();
        });
      }

      apply();
    });
  }
})();
