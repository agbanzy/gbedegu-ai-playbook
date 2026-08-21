/* GBEDEGU '26 AI Playbook — scroll choreography */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* counters run even without GSAP or with reduced motion — the numbers matter */
  function runCounters() {
    $$('[data-count],[data-naira]').forEach(function (el) {
      var naira = el.hasAttribute('data-naira');
      var target = parseFloat(el.getAttribute(naira ? 'data-naira' : 'data-count'));
      var suffix = el.getAttribute('data-suffix') || '';
      var fmt = function (v) {
        return naira ? '₦' + Math.round(v).toLocaleString('en-NG') : Math.round(v) + suffix;
      };
      if (reduce) { el.textContent = fmt(target); return; }
      var started = false;
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting || started) return;
          started = true;
          var t0 = performance.now(), dur = 1500;
          (function step(now) {
            var p = Math.min(1, (now - t0) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = fmt(target * eased);
            if (p < 1) requestAnimationFrame(step);
          })(t0);
          io.disconnect();
        });
      }, { threshold: 0.4 });
      io.observe(el);
    });
  }

  /* section awareness for the robot — cheap, works with or without GSAP */
  function watchSections() {
    if (!window.GBrobot) return;
    var last = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && e.target.id !== last) {
          last = e.target.id;
          window.GBrobot.onSection(last);
        }
      });
    }, { threshold: 0.22 });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }

  if (reduce || typeof gsap === 'undefined') {
    $$('.rv,.rv-l,.rv-r,.rv-s').forEach(function (el) { el.style.opacity = 1; el.style.transform = 'none'; });
    runCounters();
    watchSections();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  var EASE = 'power3.out';

  /* ---------- hero entrance ---------- */
  /* Kept deliberately short — the primary download button is on screen by ~1.2s.
     A long cinematic intro is the wrong trade for someone scanning a QR mid-session. */
  var tl = gsap.timeline({ defaults: { ease: EASE } });
  tl.from('.badge', { y: 16, opacity: 0, duration: .45 })
    .from('.hero h1 .ln > span', { yPercent: 118, duration: .72, stagger: .08 }, '-=.28')
    .from('.hero .sub', { y: 18, opacity: 0, duration: .5 }, '-=.44')
    .from('.hero .meta span', { y: 12, opacity: 0, duration: .4, stagger: .05 }, '-=.38')
    .from('.cta-row .btn', { y: 16, opacity: 0, duration: .42, stagger: .07 }, '-=.3')
    .from('.hstat', { y: 18, opacity: 0, duration: .45, stagger: .055 }, '-=.3')
    .from('.robot-stage', { scale: .86, opacity: 0, duration: .9, ease: 'back.out(1.4)' }, '-=.95')
    .from('.scroll-hint', { opacity: 0, duration: .4 }, '-=.2');

  /* hero parallax on scroll out */
  gsap.to('.robot-stage', {
    yPercent: 16, opacity: .25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
  });
  gsap.to('.hero-in > .hero-cols > div:first-child', {
    yPercent: -8, opacity: .2, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
  });

  /* ---------- generic reveals ---------- */
  function reveals(root) {
    $$('.rv,.rv-l,.rv-r,.rv-s', root).forEach(function (el) {
      if (el.dataset.rvDone) return;
      el.dataset.rvDone = '1';
      var narrow = window.innerWidth < 860;
      var from = { opacity: 0, duration: .85, ease: EASE };
      if (el.classList.contains('rv'))   from.y = 34;
      /* sideways reveals only where there is room for them — on a phone an
         x-offset makes the document wider than the screen */
      if (el.classList.contains('rv-l')) { if (narrow) from.y = 34; else from.x = -46; }
      if (el.classList.contains('rv-r')) { if (narrow) from.y = 34; else from.x = 46; }
      if (el.classList.contains('rv-s')) from.scale = .9;
      from.scrollTrigger = { trigger: el, start: 'top 88%', once: true };
      gsap.from(el, from);
    });
  }
  reveals(document);

  /* stagger the grids that read as one unit */
  ['.dl-grid', '.flipgrid', '.toolgrid', '.weeks', '.clinks', '.linklist'].forEach(function (sel) {
    $$(sel).forEach(function (grid) {
      gsap.from(grid.children, {
        y: 30, opacity: 0, duration: .7, stagger: { each: .045, from: 'start' }, ease: EASE,
        scrollTrigger: { trigger: grid, start: 'top 86%', once: true }
      });
    });
  });

  /* ---------- pinned horizontal timeline ---------- */
  var track = $('#track'), pinwrap = $('#pinwrap');
  if (track && pinwrap && window.innerWidth > 640) {
    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth + 80); };
    gsap.to(track, {
      x: function () { return -dist(); },
      ease: 'none',
      scrollTrigger: {
        trigger: pinwrap, start: 'top top', end: function () { return '+=' + dist() * 1.15; },
        scrub: .8, invalidateOnRefresh: true
      }
    });
    gsap.from('.era', {
      opacity: 0, y: 40, duration: .7, stagger: .09, ease: EASE,
      scrollTrigger: { trigger: pinwrap, start: 'top 60%', once: true }
    });
  }

  /* ---------- leverage ladder lights up ---------- */
  var ladder = $('#ladder');
  if (ladder) {
    $$('.rung', ladder).forEach(function (r, i) {
      ScrollTrigger.create({
        trigger: r, start: 'top 72%', end: 'bottom 40%',
        onEnter:     function () { r.classList.add('lit'); },
        onEnterBack: function () { r.classList.add('lit'); },
        onLeave:     function () { if (i < 4) r.classList.remove('lit'); },
        onLeaveBack: function () { r.classList.remove('lit'); }
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (window.matchMedia('(pointer:fine)').matches) {
    $$('.mag').forEach(function (btn) {
      var xTo = gsap.quickTo(btn, 'x', { duration: .45, ease: 'power3' });
      var yTo = gsap.quickTo(btn, 'y', { duration: .45, ease: 'power3' });
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
        yTo((e.clientY - (r.top + r.height / 2)) * 0.42);
      });
      btn.addEventListener('pointerleave', function () { xTo(0); yTo(0); });
    });

    /* ---------- tilt cards ---------- */
    $$('.tilt').forEach(function (card) {
      var rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3' });
      var ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3' });
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        rx((0.5 - py) * 8); ry((px - 0.5) * 10);
        card.style.setProperty('--mx', (px * 100) + '%');
        card.style.setProperty('--my', (py * 100) + '%');
      });
      card.addEventListener('pointerleave', function () { rx(0); ry(0); });
    });
  }

  /* ---------- section colour shift on the hero glow ---------- */
  var glow = $('.hero-glow');
  if (glow) {
    gsap.to(glow, {
      filter: 'hue-rotate(38deg)', ease: 'none',
      scrollTrigger: { trigger: 'main', start: 'top bottom', end: 'bottom bottom', scrub: 1 }
    });
  }

  runCounters();
  watchSections();

  window.GBmotion = {
    refresh: function () { reveals(document); ScrollTrigger.refresh(); }
  };
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
