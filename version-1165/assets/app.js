(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.menu-toggle');
    if (menuButton) {
      menuButton.addEventListener('click', function () {
        document.body.classList.toggle('nav-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var index = 0;
      var timer = null;

      function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === index);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          if (timer) {
            window.clearInterval(timer);
          }
          show(i);
          start();
        });
      });

      if (slides.length > 1) {
        start();
      }
    }

    document.querySelectorAll('[data-filterable]').forEach(function (grid) {
      var panel = grid.parentElement.querySelector('.filter-panel');
      var input = panel ? panel.querySelector('[data-filter-input]') : null;
      var yearSelect = panel ? panel.querySelector('[data-filter-year]') : null;
      var typeSelect = panel ? panel.querySelector('[data-filter-type]') : null;
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

      function fill(select, values) {
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

      fill(yearSelect, Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-year') || '';
      }).filter(Boolean))).sort().reverse());

      fill(typeSelect, Array.from(new Set(cards.map(function (card) {
        return card.getAttribute('data-type') || '';
      }).filter(Boolean))).sort());

      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = yearSelect ? yearSelect.value : '';
        var t = typeSelect ? typeSelect.value : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title'),
            card.getAttribute('data-meta'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();
          var ok = (!q || text.indexOf(q) !== -1) && (!y || card.getAttribute('data-year') === y) && (!t || card.getAttribute('data-type') === t);
          card.style.display = ok ? '' : 'none';
        });
      }

      [input, yearSelect, typeSelect].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    });

    var rankInput = document.querySelector('[data-rank-search]');
    var rankList = document.querySelector('[data-rank-list]');
    if (rankInput && rankList) {
      var rows = Array.prototype.slice.call(rankList.querySelectorAll('.rank-row'));
      rankInput.addEventListener('input', function () {
        var q = rankInput.value.trim().toLowerCase();
        rows.forEach(function (row) {
          row.style.display = !q || row.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
        });
      });
    }

    var searchInput = document.querySelector('[data-site-search]');
    var searchResults = document.querySelector('[data-search-results]');
    if (searchInput && searchResults && window.SiteMovieIndex) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      searchInput.value = initial;

      function card(movie) {
        return [
          '<article class="movie-card card-hover" data-title="', escapeHtml(movie.title), '">',
          '<a class="poster-wrap" href="', movie.url, '">',
          '<img src="', movie.cover, '" alt="', escapeHtml(movie.title), '" loading="lazy">',
          '<span class="poster-gradient"></span>',
          '<span class="badge top-badge">', escapeHtml(movie.category), '</span>',
          '<span class="play-mini">▶</span>',
          '</a>',
          '<div class="movie-info">',
          '<div class="movie-meta"><span>', escapeHtml(movie.year), '</span><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span></div>',
          '<h3><a href="', movie.url, '">', escapeHtml(movie.title), '</a></h3>',
          '<p>', escapeHtml(movie.line), '</p>',
          '</div>',
          '</article>'
        ].join('');
      }

      function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (ch) {
          return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
          }[ch];
        });
      }

      function render() {
        var q = searchInput.value.trim().toLowerCase();
        var data = window.SiteMovieIndex;
        var list = q ? data.filter(function (movie) {
          return [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.line].join(' ').toLowerCase().indexOf(q) !== -1;
        }).slice(0, 120) : data.slice(0, 24);
        searchResults.innerHTML = list.map(card).join('');
      }

      searchInput.addEventListener('input', render);
      render();
    }
  });
})();
