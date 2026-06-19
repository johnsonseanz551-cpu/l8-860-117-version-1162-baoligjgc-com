(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
        startTimer();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var root = panel.parentElement || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.filter-card'));
    var input = panel.querySelector('[data-filter-input]');
    var group = panel.querySelector('[data-filter-group]');
    var type = panel.querySelector('[data-filter-type]');
    var year = panel.querySelector('[data-filter-year]');
    var genre = panel.querySelector('[data-filter-genre]');
    var count = panel.querySelector('[data-filter-count]');

    function normalized(value) {
      return (value || '').toString().trim().toLowerCase();
    }

    function cardText(card) {
      return normalized([
        card.dataset.title,
        card.dataset.region,
        card.dataset.group,
        card.dataset.type,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags,
        card.textContent
      ].join(' '));
    }

    function applyFilter() {
      var query = normalized(input && input.value);
      var groupValue = group ? group.value : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var genreValue = genre ? genre.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var matchesQuery = !query || cardText(card).indexOf(query) !== -1;
        var matchesGroup = !groupValue || card.dataset.group === groupValue;
        var matchesType = !typeValue || card.dataset.type === typeValue;
        var matchesYear = !yearValue || card.dataset.year === yearValue;
        var matchesGenre = !genreValue || (card.dataset.genre || '').indexOf(genreValue) !== -1;
        var shouldShow = matchesQuery && matchesGroup && matchesType && matchesYear && matchesGenre;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部';
      }
    }

    [input, group, type, year, genre].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    applyFilter();
  });
}());
