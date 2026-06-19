(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var timer = null;

      function showSlide(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === current);
        });
      }

      function startTimer() {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(index);
          startTimer();
        });
      });

      if (slides.length > 1) {
        startTimer();
      }
    }

    var searchInput = document.querySelector("[data-search-input]");
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var selectedFilter = "all";

    function normalize(value) {
      return String(value || "").toLowerCase().trim();
    }

    function cardText(card) {
      return normalize([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" "));
    }

    function applySearch() {
      var keyword = searchInput ? normalize(searchInput.value) : "";
      cards.forEach(function (card) {
        var text = cardText(card);
        var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
        var filterMatch = selectedFilter === "all" || text.indexOf(normalize(selectedFilter)) !== -1;
        card.hidden = !(keywordMatch && filterMatch);
      });
    }

    if (searchInput && cards.length) {
      searchInput.addEventListener("input", applySearch);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        selectedFilter = chip.getAttribute("data-filter-value") || "all";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        applySearch();
      });
    });
  });

  window.initMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var hlsInstance = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          maxBufferLength: 30,
          enableWorker: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function startPlay() {
      attachStream();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
      if (!attached) {
        startPlay();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
