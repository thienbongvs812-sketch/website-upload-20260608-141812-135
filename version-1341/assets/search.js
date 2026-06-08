(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.url) + "\">" +
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + " 在线观看\" loading=\"lazy\">" +
      "<span class=\"quality-badge\">HD</span>" +
      "<span class=\"year-badge\">" + escapeHtml(movie.year) + "</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
      "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-list\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  ready(function () {
    var params = new URLSearchParams(window.location.search);
    var form = document.querySelector("[data-search-page-form]");
    var input = document.querySelector("[data-search-page-input]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var empty = document.querySelector("[data-search-empty]");

    function render(query) {
      var q = normalize(query);
      if (!results || !summary || !empty) {
        return;
      }
      if (!q) {
        results.innerHTML = "";
        summary.textContent = "";
        empty.textContent = "请输入关键词";
        empty.classList.add("show");
        return;
      }

      var matches = (window.SEARCH_MOVIES || SEARCH_MOVIES || []).filter(function (movie) {
        return normalize(movie.search).indexOf(q) !== -1;
      }).slice(0, 120);

      if (!matches.length) {
        results.innerHTML = "";
        summary.textContent = "";
        empty.textContent = "未找到匹配影片";
        empty.classList.add("show");
        return;
      }

      empty.classList.remove("show");
      summary.textContent = "搜索：" + query;
      results.innerHTML = matches.map(card).join("");
    }

    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }
    render(initial);

    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var query = input ? input.value.trim() : "";
        var url = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
        window.history.replaceState(null, "", url);
        render(query);
      });
    }
  });
}());
