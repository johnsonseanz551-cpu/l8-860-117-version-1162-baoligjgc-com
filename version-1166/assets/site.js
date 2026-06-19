(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!isOpen));
            mobileNav.hidden = isOpen;
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5600);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        hero.addEventListener('mouseenter', stopTimer);
        hero.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));

    grids.forEach(function (grid) {
        var scope = grid.closest('section') || document;
        var search = scope.querySelector('[data-filter-search]');
        var selects = Array.prototype.slice.call(scope.querySelectorAll('[data-filter-field]'));
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var emptyState = scope.querySelector('[data-empty-state]');

        function cardMatches(card) {
            var keyword = search ? search.value.trim().toLowerCase() : '';
            var haystack = [
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.genre,
                card.dataset.tags
            ].join(' ').toLowerCase();

            if (keyword && haystack.indexOf(keyword) === -1) {
                return false;
            }

            return selects.every(function (select) {
                var value = select.value;
                var field = select.dataset.filterField;

                if (!value) {
                    return true;
                }

                return String(card.dataset[field] || '').indexOf(value) !== -1;
            });
        }

        function applyFilter() {
            var visible = 0;

            cards.forEach(function (card) {
                var matches = cardMatches(card);
                card.hidden = !matches;

                if (matches) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visible !== 0;
            }
        }

        if (search) {
            search.addEventListener('input', applyFilter);
        }

        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });
    });

    var hlsPromise = null;

    function loadHlsLibrary() {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }

        if (hlsPromise) {
            return hlsPromise;
        }

        hlsPromise = new Promise(function (resolve) {
            var existing = document.querySelector('script[data-hls-lib]');

            if (existing) {
                existing.addEventListener('load', function () {
                    resolve(window.Hls || null);
                });
                existing.addEventListener('error', function () {
                    resolve(null);
                });
                return;
            }

            var script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
            script.async = true;
            script.setAttribute('data-hls-lib', 'true');
            script.onload = function () {
                resolve(window.Hls || null);
            };
            script.onerror = function () {
                resolve(null);
            };
            document.head.appendChild(script);
        });

        return hlsPromise;
    }

    function setupPlayer(shell) {
        var video = shell.querySelector('video');
        var cover = shell.querySelector('[data-play-cover]');
        var stream = video ? video.getAttribute('data-stream') : '';
        var loaded = false;
        var hlsInstance = null;

        if (!video || !stream) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return Promise.resolve();
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return Promise.resolve();
            }

            return loadHlsLibrary().then(function (Hls) {
                if (Hls && Hls.isSupported()) {
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                    return;
                }

                video.src = stream;
            });
        }

        function playVideo() {
            if (cover) {
                cover.classList.add('is-hidden');
            }

            attachStream().then(function () {
                var playPromise = video.play();

                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {});
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', playVideo);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playVideo();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance && typeof hlsInstance.destroy === 'function') {
                hlsInstance.destroy();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]')).forEach(setupPlayer);
})();
