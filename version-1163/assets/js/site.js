(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var expanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', expanded ? 'false' : 'true');
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var previous = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
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

  function restartTimer() {
    if (!slides.length) {
      return;
    }

    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5000);
  }

  if (slides.length) {
    showSlide(0);
    restartTimer();
  }

  if (previous) {
    previous.addEventListener('click', function () {
      showSlide(current - 1);
      restartTimer();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      restartTimer();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      restartTimer();
    });
  });

  var filterArea = document.querySelector('[data-filter-area]');
  var filterGrid = document.querySelector('.filter-grid');

  if (filterArea && filterGrid) {
    var filterButtons = Array.prototype.slice.call(filterArea.querySelectorAll('[data-filter]'));
    var cards = Array.prototype.slice.call(filterGrid.querySelectorAll('.movie-card'));

    filterButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var keyword = button.getAttribute('data-filter');

        filterButtons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });

        cards.forEach(function (card) {
          var content = card.textContent || '';
          var visible = keyword === 'all' || content.indexOf(keyword) !== -1;
          card.classList.toggle('is-hidden', !visible);
        });
      });
    });
  }
})();
