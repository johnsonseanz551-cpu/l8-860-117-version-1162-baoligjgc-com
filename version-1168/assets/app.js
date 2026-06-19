(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var active = 0;
        var timer;
        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === active);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }
        function restart() {
            window.clearInterval(timer);
            start();
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                show(index);
                restart();
            });
        });
        start();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
        if (!inputs.length) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        function apply(value) {
            var keyword = String(value || "").trim().toLowerCase();
            inputs.forEach(function (input) {
                if (input.value !== value) {
                    input.value = value;
                }
            });
            cards.forEach(function (card) {
                var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                card.classList.toggle("is-hidden", Boolean(keyword) && haystack.indexOf(keyword) === -1);
            });
        }
        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                apply(input.value);
            });
        });
        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = chip.getAttribute("data-filter-chip") || "";
                apply(value);
            });
        });
        if (query) {
            apply(query);
        }
    }

    function attachStream(video, streamUrl) {
        if (!video || !streamUrl) {
            return Promise.resolve();
        }
        if (video.getAttribute("data-ready") === "1") {
            return Promise.resolve();
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
            video.setAttribute("data-ready", "1");
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            video.hlsPlayer = hls;
            video.setAttribute("data-ready", "1");
            return new Promise(function (resolve) {
                var resolved = false;
                function done() {
                    if (resolved) {
                        return;
                    }
                    resolved = true;
                    resolve();
                }
                hls.on(window.Hls.Events.MANIFEST_PARSED, done);
                window.setTimeout(done, 1200);
            });
        }
        video.src = streamUrl;
        video.setAttribute("data-ready", "1");
        return Promise.resolve();
    }

    function setupPlayers() {
        var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-play-target]"));
        buttons.forEach(function (button) {
            var target = button.getAttribute("data-play-target");
            var video = document.getElementById(target);
            var streamUrl = button.getAttribute("data-stream") || (video && video.getAttribute("data-stream"));
            var shell = button.closest(".video-shell");
            function start() {
                attachStream(video, streamUrl).then(function () {
                    if (shell) {
                        shell.classList.add("is-playing");
                    }
                    if (video) {
                        var promise = video.play();
                        if (promise && typeof promise.catch === "function") {
                            promise.catch(function () {});
                        }
                    }
                });
            }
            button.addEventListener("click", function (event) {
                event.preventDefault();
                start();
            });
            if (video) {
                video.addEventListener("click", function () {
                    if (video.getAttribute("data-ready") !== "1") {
                        start();
                    }
                });
            }
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupFilters();
        setupPlayers();
    });
})();
