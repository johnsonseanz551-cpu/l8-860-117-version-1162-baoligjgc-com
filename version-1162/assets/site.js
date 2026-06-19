(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-menu-panel]');
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener('click', function () {
            panel.classList.toggle('is-open');
        });
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot') || '0'));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        start();
    }

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function initFilters() {
        document.querySelectorAll('[data-filter-root]').forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var region = root.querySelector('[data-region-select]');
            var type = root.querySelector('[data-type-select]');
            var year = root.querySelector('[data-year-select]');
            var result = root.querySelector('[data-filter-result]');
            var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));
            var quickFilters = Array.prototype.slice.call(root.querySelectorAll('[data-quick-filter]'));

            if (root.getAttribute('data-query-source') === 'url' && input) {
                var params = new URLSearchParams(window.location.search);
                var keyword = params.get('q');
                if (keyword) {
                    input.value = keyword;
                }
            }

            function currentQuickValue() {
                var active = root.querySelector('[data-quick-filter].is-active');
                return active ? normalize(active.getAttribute('data-quick-filter')) : '';
            }

            function apply() {
                var keywordValue = normalize(input && input.value);
                var regionValue = normalize(region && region.value);
                var typeValue = normalize(type && type.value);
                var yearValue = normalize(year && year.value);
                var quickValue = currentQuickValue();
                var shown = 0;

                cards.forEach(function (card) {
                    var searchValue = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardGenre = normalize(card.getAttribute('data-genre'));
                    var visible = true;

                    if (keywordValue && searchValue.indexOf(keywordValue) === -1) {
                        visible = false;
                    }
                    if (regionValue && cardRegion !== regionValue) {
                        visible = false;
                    }
                    if (typeValue && cardType !== typeValue) {
                        visible = false;
                    }
                    if (yearValue && cardYear !== yearValue) {
                        visible = false;
                    }
                    if (quickValue && searchValue.indexOf(quickValue) === -1 && cardGenre.indexOf(quickValue) === -1) {
                        visible = false;
                    }

                    card.classList.toggle('is-filtered-out', !visible);
                    if (visible) {
                        shown += 1;
                    }
                });

                if (result) {
                    result.textContent = shown ? '已匹配到相关影片' : '没有找到匹配影片';
                }
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            quickFilters.forEach(function (button) {
                button.addEventListener('click', function () {
                    quickFilters.forEach(function (item) {
                        if (item !== button) {
                            item.classList.remove('is-active');
                        }
                    });
                    button.classList.toggle('is-active');
                    apply();
                });
            });

            apply();
        });
    }

    function initPlayer() {
        var shell = document.querySelector('.player-shell[data-video-src]');
        var video = document.getElementById('movie-player');
        var start = document.querySelector('[data-player-start]');
        if (!shell || !video || !start) {
            return;
        }
        var url = shell.getAttribute('data-video-src');
        var loaded = false;
        var hls = null;

        function load() {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({ enableWorker: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }
            video.src = url;
            return Promise.resolve();
        }

        function play() {
            start.classList.add('is-hidden');
            load().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        start.addEventListener('click', play);
        shell.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                play();
            }
        });
        video.addEventListener('play', function () {
            start.classList.add('is-hidden');
        });
        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
