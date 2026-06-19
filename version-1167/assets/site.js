(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
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

            function start() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    showSlide(current + 1);
                }, 5200);
            }

            dots.forEach(function (dot, index) {
                dot.addEventListener("click", function () {
                    showSlide(index);
                    start();
                });
            });

            if (slides.length > 1) {
                start();
            }
        }

        var searchInput = document.querySelector("[data-search-input]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var filterButtons = Array.prototype.slice.call(document.querySelectorAll("[data-filter-value]"));
        var emptyState = document.querySelector("[data-empty-state]");
        var currentFilter = "全部";

        function applySearch() {
            var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search-text") || "").toLowerCase();
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesFilter = currentFilter === "全部" || text.indexOf(currentFilter.toLowerCase()) !== -1;
                var visible = matchesQuery && matchesFilter;
                card.style.display = visible ? "" : "none";
                if (visible) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visibleCount === 0);
            }
        }

        if (searchInput && cards.length) {
            searchInput.addEventListener("input", applySearch);
        }

        filterButtons.forEach(function (button) {
            if (button.getAttribute("data-filter-value") === currentFilter) {
                button.classList.add("is-active");
            }
            button.addEventListener("click", function () {
                currentFilter = button.getAttribute("data-filter-value") || "全部";
                filterButtons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applySearch();
            });
        });
    });

    window.initMoviePlayer = function (videoSource) {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }

        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var hlsInstance = null;
        var prepared = false;

        function prepare() {
            if (prepared || !videoSource || !video) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoSource;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(videoSource);
                hlsInstance.attachMedia(video);
            } else {
                video.src = videoSource;
            }
        }

        function play() {
            prepare();
            if (button) {
                button.classList.add("is-hidden");
            }
            var playResult = video.play();
            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(function () {
                    if (button) {
                        button.classList.remove("is-hidden");
                    }
                });
            }
        }

        if (button) {
            button.addEventListener("click", play);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });

        video.addEventListener("play", function () {
            if (button) {
                button.classList.add("is-hidden");
            }
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 && button) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    };
})();
