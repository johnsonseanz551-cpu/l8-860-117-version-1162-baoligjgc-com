(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
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
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    show(0);
    restart();
  }

  function setupPageFilter() {
    var input = document.querySelector('[data-page-filter]');
    if (!input) {
      return;
    }
    var items = Array.prototype.slice.call(document.querySelectorAll('[data-filter-item]'));
    input.addEventListener('input', function () {
      var keyword = input.value.trim().toLowerCase();
      items.forEach(function (item) {
        var text = (item.getAttribute('data-filter-text') || '').toLowerCase();
        item.classList.toggle('hidden-by-filter', keyword && text.indexOf(keyword) === -1);
      });
    });
  }

  function cardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '<a href="' + movie.url + '" class="movie-card-link">',
      '<div class="movie-cover">',
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '<span class="movie-year">' + escapeHtml(movie.year) + '</span>',
      '<span class="movie-region">' + escapeHtml(movie.region) + '</span>',
      '<span class="movie-play">▶</span>',
      '</div>',
      '<div class="movie-card-body">',
      '<h3>' + escapeHtml(movie.title) + '</h3>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="movie-meta"><span>' + escapeHtml(movie.type) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupSearch() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var output = document.querySelector('[data-search-results]');
    if (!form || !input || !output || !window.MOVIE_SEARCH_INDEX) {
      return;
    }

    function render(query) {
      var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) {
        output.innerHTML = '<div class="empty-state">输入片名、地区、类型或标签即可搜索。</div>';
        return;
      }
      var results = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var text = movie.searchText.toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 80);
      if (!results.length) {
        output.innerHTML = '<div class="empty-state">未找到匹配内容，换个关键词再试试。</div>';
        return;
      }
      output.innerHTML = '<div class="movie-grid">' + results.map(cardTemplate).join('') + '</div>';
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
    });
    input.addEventListener('input', function () {
      render(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (q) {
      input.value = q;
    }
    render(input.value);
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupPageFilter();
    setupSearch();
  });
})();
