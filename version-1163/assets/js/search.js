(function () {
  var form = document.getElementById('search-form');
  var input = document.getElementById('search-input');
  var type = document.getElementById('search-type');
  var results = document.getElementById('search-results');
  var summary = document.getElementById('search-summary');
  var movies = window.SEARCH_MOVIES || [];

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return '' +
      '<a class="movie-card" href="' + escapeHtml(movie.href) + '">' +
        '<span class="poster-wrap">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="year-badge">' + escapeHtml(movie.year) + '</span>' +
        '</span>' +
        '<span class="card-body">' +
          '<strong>' + escapeHtml(movie.title) + '</strong>' +
          '<em>' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.type) + '</em>' +
          '<span class="card-line">' + escapeHtml(movie.oneLine) + '</span>' +
          '<span class="tag-row">' + tags + '</span>' +
        '</span>' +
      '</a>';
  }

  function runSearch() {
    var query = (input.value || '').trim().toLowerCase();
    var selectedType = type.value;

    if (!query) {
      summary.textContent = '热门内容';
      results.innerHTML = movies.slice(0, 12).map(card).join('');
      return;
    }

    var matched = movies.filter(function (movie) {
      var text = [
        movie.title,
        movie.region,
        movie.type,
        movie.year,
        movie.genre,
        movie.oneLine,
        movie.category,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase();

      var typeMatched = selectedType === 'all' ||
        (selectedType === 'movie' && movie.type.indexOf('电影') !== -1) ||
        (selectedType === 'series' && movie.type.indexOf('剧') !== -1);

      return typeMatched && text.indexOf(query) !== -1;
    }).slice(0, 80);

    summary.textContent = matched.length ? '搜索结果' : '暂无匹配内容';
    results.innerHTML = matched.length ? matched.map(card).join('') : '';
  }

  function applyQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';

    if (q) {
      input.value = q;
    }

    runSearch();
  }

  if (form && input && type && results && summary) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      runSearch();
      var params = new URLSearchParams();
      if (input.value.trim()) {
        params.set('q', input.value.trim());
      }
      history.replaceState(null, '', params.toString() ? './search.html?' + params.toString() : './search.html');
    });

    input.addEventListener('input', runSearch);
    type.addEventListener('change', runSearch);
    applyQuery();
  }
})();
