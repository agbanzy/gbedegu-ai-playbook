/* GBEDEGU '26 AI Playbook — SVG robot rig */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s) { return document.querySelector(s); };

  var svg   = $('#robot');
  var head  = $('#head');
  var pupL  = $('#pupL'),  pupR  = $('#pupR');
  var glL   = $('#glL'),   glR   = $('#glR');
  var lidL  = $('#lidL'),  lidR  = $('#lidR');
  var armL  = $('#armL'),  armR  = $('#armR');
  var mouth = $('#mouth');
  var core  = $('#core');
  var antBall = $('#antBall');
  var bubble  = $('#bubble');
  if (!svg || !head) return;

  /* eye home positions, straight from the markup */
  var EYES = [
    { pup: pupL, gl: glL, cx: 122, cy: 135 },
    { pup: pupR, gl: glR, cx: 178, cy: 135 }
  ];
  var MOUTH_NEUTRAL = 'M136 158 Q150 167 164 158';
  var MOUTH_HAPPY   = 'M133 156 Q150 172 167 156';
  var MOUTH_OH      = 'M141 158 Q150 156 159 158 Q150 172 141 158';

  /* ---------- pointer tracking ---------- */
  var tx = 0, ty = 0, cx = 0, cy = 0, hx = 0, hy = 0;

  function onMove(e) {
    var r = svg.getBoundingClientRect();
    if (!r.width) return;
    var px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    var py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    tx = Math.max(-1, Math.min(1, px));
    ty = Math.max(-1, Math.min(1, py));
  }
  if (!reduce) {
    window.addEventListener('pointermove', onMove, { passive: true });
  }

  /* ---------- blinking ---------- */
  var blinking = false;
  function blink(double) {
    if (blinking || reduce) return;
    blinking = true;
    var open = 0, shut = 26, dur = 85;
    function set(h, y) {
      if (lidL) { lidL.setAttribute('height', h); lidL.setAttribute('y', y); }
      if (lidR) { lidR.setAttribute('height', h); lidR.setAttribute('y', y); }
    }
    set(shut, 117);
    setTimeout(function () {
      set(open, 117);
      if (double) { setTimeout(function () { set(shut, 117); setTimeout(function () { set(open, 117); blinking = false; }, dur); }, 110); }
      else blinking = false;
    }, dur);
  }
  function scheduleBlink() {
    var wait = 2200 + Math.random() * 4200;
    setTimeout(function () { blink(Math.random() < 0.22); scheduleBlink(); }, wait);
  }
  if (!reduce) scheduleBlink();

  /* ---------- expressions ---------- */
  var expiry = 0;
  function express(kind, ms) {
    if (!mouth) return;
    if (kind === 'happy') mouth.setAttribute('d', MOUTH_HAPPY);
    else if (kind === 'oh') mouth.setAttribute('d', MOUTH_OH);
    else mouth.setAttribute('d', MOUTH_NEUTRAL);
    expiry = Date.now() + (ms || 1400);
  }

  /* ---------- waving ---------- */
  var waving = 0;
  function wave() {
    if (reduce) return;
    waving = Date.now() + 1500;
    express('happy', 1700);
  }
  function cheer() {
    wave();
    blink(true);
    pulse();
  }
  var pulseUntil = 0;
  function pulse() { pulseUntil = Date.now() + 1200; }

  /* ---------- speech bubble ---------- */
  var LINES = [
    'AI drafts — you approve.',
    'Your voice is the moat.',
    'Brief it like a colleague, not a search box.',
    'One assistant, mastered, beats ten tabs.',
    'Show it examples. It copies your taste.',
    'Never paste secrets into a chat.',
    'Consistency for 90 days beats brilliance for one week.',
    'Ask it to plan first. Then let it write.',
    'Pay for a tool the day it removes a bottleneck.',
    'Done beats planned. Ship the one-pager.'
  ];
  var lineIx = Math.floor(Math.random() * LINES.length);
  function nextLine() { lineIx = (lineIx + 1) % LINES.length; return LINES[lineIx]; }

  var buddyMode = false;
  function say(text, ms) {
    /* once the 3D robot has the hero, everything the robot says shows in the corner */
    if (buddyMode) { showTip(text, ms || 4200); return; }
    if (!bubble) return;
    bubble.textContent = text;
    bubble.classList.add('show');
    express('happy', (ms || 4200) - 200);
    clearTimeout(say._t);
    say._t = setTimeout(function () { bubble.classList.remove('show'); }, ms || 4200);
  }

  /* first hello, once the hero has settled */
  setTimeout(function () { say('Hi — I’m your guide. Everything from the talk is on this page.', 5200); }, 1400);
  if (!reduce) {
    setInterval(function () {
      if (window.scrollY < window.innerHeight * 0.8 && !document.hidden) say(nextLine(), 4600);
    }, 11000);
  }

  /* hero robot responds to taps */
  svg.style.cursor = 'pointer';
  svg.addEventListener('click', function () { cheer(); say(nextLine(), 4200); });

  /* ---------- render loop ---------- */
  function frame() {
    var now = Date.now();

    /* eased follow */
    cx += (tx - cx) * 0.085;
    cy += (ty - cy) * 0.085;
    hx += (tx - hx) * 0.05;
    hy += (ty - hy) * 0.05;

    /* pupils */
    EYES.forEach(function (e) {
      if (!e.pup) return;
      var dx = cx * 5.6, dy = cy * 4.4;
      e.pup.setAttribute('cx', e.cx + dx);
      e.pup.setAttribute('cy', e.cy + dy);
      if (e.gl) { e.gl.setAttribute('cx', e.cx + 4 + dx * 1.15); e.gl.setAttribute('cy', e.cy - 4 + dy * 1.15); }
    });

    /* head tilt + slight parallax */
    head.setAttribute('transform',
      'translate(' + (hx * 7).toFixed(2) + ' ' + (hy * 4).toFixed(2) + ') ' +
      'rotate(' + (hx * 4.5).toFixed(2) + ' 150 134)');

    /* arms: idle sway, or a wave */
    var t = now / 1000;
    var idleL = Math.sin(t * 1.15) * 3.2;
    var idleR = Math.sin(t * 1.15 + 1.1) * 3.2;
    if (waving > now) {
      var p = (waving - now) / 1500;
      var swing = Math.sin((1 - p) * Math.PI * 6) * 34 - 26;
      if (armR) armR.setAttribute('transform', 'rotate(' + swing.toFixed(2) + ' 244 196)');
      if (armL) armL.setAttribute('transform', 'rotate(' + idleL.toFixed(2) + ' 56 196)');
    } else {
      if (armR) armR.setAttribute('transform', 'rotate(' + idleR.toFixed(2) + ' 244 196)');
      if (armL) armL.setAttribute('transform', 'rotate(' + idleL.toFixed(2) + ' 56 196)');
    }

    /* core + antenna glow */
    var beat = pulseUntil > now ? 1 : 0.5;
    var s = 1 + Math.sin(t * (pulseUntil > now ? 9 : 2.1)) * 0.07 * beat * 2;
    if (core) core.setAttribute('r', (18 * s).toFixed(2));
    if (antBall) antBall.setAttribute('r', (9 + Math.sin(t * 2.6) * 0.9).toFixed(2));

    /* expression reset */
    if (expiry && now > expiry) { if (mouth) mouth.setAttribute('d', MOUTH_NEUTRAL); expiry = 0; }

    requestAnimationFrame(frame);
  }
  if (!reduce) requestAnimationFrame(frame);

  /* ---------- corner buddy ---------- */
  var buddy = $('#buddy'), buddyTip = $('#buddyTip');
  var tipT;
  function showTip(text, ms) {
    if (!buddyTip) return;
    buddyTip.textContent = text;
    buddyTip.classList.add('show');
    clearTimeout(tipT);
    tipT = setTimeout(function () { buddyTip.classList.remove('show'); }, ms || 4200);
  }
  if (buddy) {
    buddy.addEventListener('click', function () { cheer(); showTip(nextLine()); });
    buddy.addEventListener('mouseenter', function () { express('happy', 1200); });

    var seen = false;
    window.addEventListener('scroll', function () {
      var past = window.scrollY > window.innerHeight * 0.9;
      buddy.classList.toggle('on', past);
      if (past && !seen) { seen = true; setTimeout(function () { showTip('Still here. Tap me for a tip.', 3600); }, 900); }
    }, { passive: true });
  }

  /* section-aware lines, driven by motion.js */
  var SECTION_LINES = {
    downloads: 'Grab the ZIP — it has everything in one file.',
    shift:     'You are still early. That is the whole point.',
    prompts:   'Six parts. Miss one and the answer disappoints you.',
    examples:  'Tap Copy, paste, fill the brackets. That is it.',
    coworker:  'Brief it like a colleague, not a search box.',
    tools:     'Start in the free column. Always.',
    oss:       'Free and open source. Self-host what saves you money.',
    shelf:     'Pick one category. Open three links. Go deep on one.',
    plan:      'Tick these off — this page remembers on your device.',
    connect:   'Send me the site you shipped. I read every one.'
  };
  window.GBrobot = {
    toBuddy: function () {
      buddyMode = true;
      if (bubble) bubble.classList.remove('show');
      setTimeout(function () { showTip('Hi — I’m your guide. Tap me any time.', 4600); }, 900);
    },
    cheer: cheer,
    wave: wave,
    say: say,
    tip: showTip,
    onSection: function (id) {
      var line = SECTION_LINES[id];
      if (!line) return;
      if (window.scrollY > window.innerHeight * 0.9) showTip(line, 4000);
      else say(line, 4000);
    }
  };
})();
