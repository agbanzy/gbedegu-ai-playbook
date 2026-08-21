/* GBEDEGU '26 AI Playbook — WebGL hero: 3D robot + neural field.
   Loaded lazily, after first paint. Skipped entirely on reduced motion,
   on small screens, or when WebGL is unavailable. */
(function () {
  'use strict';
  var canvas = document.getElementById('scene');
  if (!canvas) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 720) return;                 /* phones keep the SVG robot only */
  if (navigator.connection && navigator.connection.saveData) return;

  /* WebGL support probe before we pull 600 KB down the wire */
  try {
    var probe = document.createElement('canvas');
    if (!(probe.getContext('webgl') || probe.getContext('experimental-webgl'))) return;
  } catch (e) { return; }

  function load(src) {
    return new Promise(function (res, rej) {
      var s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  function boot() {
    load('/vendor/three.min.js').then(init).catch(function () { /* silent — SVG robot carries it */ });
  }
  if (document.readyState === 'complete') setTimeout(boot, 350);
  else window.addEventListener('load', function () { setTimeout(boot, 350); });

  function init() {
    if (typeof THREE === 'undefined') return;

    var BLUE = 0x29A9E1, TEAL = 0x2FB7A8, YELLOW = 0xF0C93C, PALE = 0xE3ECFF;

    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(46, 1, 0.1, 120);
    camera.position.set(0, 0.4, 15);

    scene.add(new THREE.AmbientLight(0xB9CBF0, 0.62));
    var key = new THREE.DirectionalLight(0xffffff, 1.0); key.position.set(4, 7, 8); scene.add(key);
    var rimA = new THREE.PointLight(BLUE, 2.4, 40); rimA.position.set(-9, 3, 5); scene.add(rimA);
    var rimB = new THREE.PointLight(TEAL, 2.0, 40); rimB.position.set(9, -3, 4); scene.add(rimB);

    /* ---------- neural field ---------- */
    var N = 108, R = 13;
    var pts = [], pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      var v = new THREE.Vector3(
        (Math.random() - 0.5) * R * 2.3,
        (Math.random() - 0.5) * R * 1.35,
        (Math.random() - 0.5) * 9 - 4
      );
      v.vel = new THREE.Vector3((Math.random() - .5) * .008, (Math.random() - .5) * .008, (Math.random() - .5) * .004);
      pts.push(v);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    var nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    var nodes = new THREE.Points(nodeGeo, new THREE.PointsMaterial({
      color: PALE, size: 0.12, transparent: true, opacity: 0.6, sizeAttenuation: true
    }));
    scene.add(nodes);

    var MAXL = 460;
    var linePos = new Float32Array(MAXL * 6);
    var lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    var lines = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({
      color: BLUE, transparent: true, opacity: 0.15
    }));
    scene.add(lines);

    /* ---------- the 3D robot ---------- */
    var bot = new THREE.Group();
    bot.position.set(0, -0.3, 0);
    scene.add(bot);

    function mat(color, opts) {
      return new THREE.MeshStandardMaterial(Object.assign({
        color: color, roughness: 0.34, metalness: 0.42
      }, opts || {}));
    }
    var shell = mat(0xF2F6FF, { roughness: .28, metalness: .3 });
    var accent = mat(TEAL, { roughness: .22, metalness: .55 });

    /* torso */
    var torso = new THREE.Mesh(new THREE.CapsuleGeometry(1.28, 1.15, 6, 22), shell);
    bot.add(torso);
    /* chest core */
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.42, 22, 22),
      new THREE.MeshStandardMaterial({ color: YELLOW, emissive: YELLOW, emissiveIntensity: 1.5, roughness: .3 }));
    core.position.set(0, 0.1, 1.12); bot.add(core);
    var coreLight = new THREE.PointLight(YELLOW, 2.2, 8); coreLight.position.copy(core.position); bot.add(coreLight);

    /* head — its own group so it can track the pointer */
    var headG = new THREE.Group(); headG.position.set(0, 2.05, 0); bot.add(headG);
    var head = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.5, 1.55), shell);
    head.geometry.translate(0, 0, 0); headG.add(head);
    var visor = new THREE.Mesh(new THREE.BoxGeometry(1.62, 0.82, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x121A3C, roughness: .12, metalness: .75 }));
    visor.position.set(0, 0.08, 0.79); headG.add(visor);
    var eyeMat = new THREE.MeshStandardMaterial({ color: 0x63D8FF, emissive: 0x38C6F0, emissiveIntensity: 2.6, roughness: .2 });
    var eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.17, 18, 18), eyeMat); eyeL.position.set(-0.36, 0.09, 0.88); headG.add(eyeL);
    var eyeR = eyeL.clone(); eyeR.position.x = 0.36; headG.add(eyeR);
    /* ears */
    var earL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.28, 18), accent);
    earL.rotation.z = Math.PI / 2; earL.position.set(-1.08, 0.06, 0); headG.add(earL);
    var earR = earL.clone(); earR.position.x = 1.08; headG.add(earR);
    /* antenna */
    var stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.72, 10), mat(0xB7C6E6));
    stalk.position.set(0, 1.1, 0); headG.add(stalk);
    var bulb = new THREE.Mesh(new THREE.SphereGeometry(0.19, 18, 18),
      new THREE.MeshStandardMaterial({ color: YELLOW, emissive: YELLOW, emissiveIntensity: 2.2, roughness: .3 }));
    bulb.position.set(0, 1.5, 0); headG.add(bulb);

    /* arms */
    function arm(x) {
      var g = new THREE.Group(); g.position.set(x, 0.72, 0);
      var a = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.95, 5, 14), shell);
      a.position.y = -0.68; g.add(a);
      var h = new THREE.Mesh(new THREE.SphereGeometry(0.29, 18, 18), accent);
      h.position.y = -1.34; g.add(h);
      bot.add(g); return g;
    }
    var armL = arm(-1.5), armR = arm(1.5);

    /* orbiting ring */
    var ring = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.035, 10, 120),
      new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: .5 }));
    ring.rotation.x = Math.PI / 2.35; bot.add(ring);
    var ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.7, 0.02, 10, 120),
      new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, opacity: .34 }));
    ring2.rotation.x = Math.PI / 1.75; ring2.rotation.y = 0.5; bot.add(ring2);

    /* ---------- sizing ---------- */
    function resize() {
      var w = canvas.clientWidth || window.innerWidth;
      var h = canvas.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      /* keep the robot clear of the copy column on wide screens */
      bot.position.x = w > 1180 ? 4.4 : (w > 940 ? 3.4 : 0);
      bot.scale.setScalar(w > 1180 ? 1 : (w > 940 ? 0.86 : 0.72));
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    /* ---------- pointer ---------- */
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    window.addEventListener('pointermove', function (e) {
      tmx = (e.clientX / window.innerWidth) * 2 - 1;
      tmy = -((e.clientY / window.innerHeight) * 2 - 1);
    }, { passive: true });

    /* ---------- run only while the hero is on screen AND the tab is in front ----------
       Both conditions are tracked separately so returning from a background tab
       resumes the scene instead of leaving it frozen. */
    var onScreen = true, pageVisible = !document.hidden, visible = true;
    function updateVisible() { visible = onScreen && pageVisible; }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting; updateVisible();
      }, { threshold: 0 }).observe(document.querySelector('.hero'));
    }
    document.addEventListener('visibilitychange', function () {
      pageVisible = !document.hidden; updateVisible();
    });

    var t0 = performance.now();
    function tick(now) {
      requestAnimationFrame(tick);
      if (!visible) return;
      var t = (now - t0) / 1000;

      mx += (tmx - mx) * 0.045;
      my += (tmy - my) * 0.045;

      /* nodes drift, wrap, and link when close */
      var p = nodeGeo.attributes.position.array, li = 0;
      for (var i = 0; i < N; i++) {
        var a = pts[i];
        a.add(a.vel);
        if (Math.abs(a.x) > R * 1.2) a.vel.x *= -1;
        if (Math.abs(a.y) > R * 0.72) a.vel.y *= -1;
        if (Math.abs(a.z + 4) > 5) a.vel.z *= -1;
        p[i * 3] = a.x; p[i * 3 + 1] = a.y; p[i * 3 + 2] = a.z;

        for (var j = i + 1; j < N && li < MAXL; j++) {
          var b = pts[j];
          var dx = a.x - b.x, dy = a.y - b.y, dz = a.z - b.z;
          if (dx * dx + dy * dy + dz * dz < 8.4) {
            linePos[li * 6]     = a.x; linePos[li * 6 + 1] = a.y; linePos[li * 6 + 2] = a.z;
            linePos[li * 6 + 3] = b.x; linePos[li * 6 + 4] = b.y; linePos[li * 6 + 5] = b.z;
            li++;
          }
        }
      }
      for (var k = li; k < MAXL; k++) {
        for (var q = 0; q < 6; q++) linePos[k * 6 + q] = 0;
      }
      nodeGeo.attributes.position.needsUpdate = true;
      lineGeo.attributes.position.needsUpdate = true;
      nodes.rotation.y = lines.rotation.y = mx * 0.12 + t * 0.012;
      nodes.rotation.x = lines.rotation.x = my * 0.07;

      /* robot idle + tracking */
      bot.position.y = -0.3 + Math.sin(t * 1.05) * 0.24;
      bot.rotation.y = mx * 0.34 + Math.sin(t * 0.42) * 0.07;
      headG.rotation.y = mx * 0.42;
      headG.rotation.x = -my * 0.24;
      headG.position.y = 2.05 + Math.sin(t * 1.05 + 0.4) * 0.05;

      armL.rotation.x = Math.sin(t * 1.2) * 0.22;
      armR.rotation.x = Math.sin(t * 1.2 + 1.2) * 0.22;
      armL.rotation.z = 0.12; armR.rotation.z = -0.12;

      var pulse = 1 + Math.sin(t * 2.4) * 0.12;
      core.scale.setScalar(pulse);
      core.material.emissiveIntensity = 1.2 + Math.sin(t * 2.4) * 0.5;
      bulb.material.emissiveIntensity = 1.8 + Math.sin(t * 3.1) * 0.7;
      coreLight.intensity = 1.8 + Math.sin(t * 2.4) * 0.7;

      ring.rotation.z = t * 0.34;
      ring2.rotation.z = -t * 0.22;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
    canvas.classList.add('on');
    /* the 3D robot now owns the hero — the SVG rig moves to the corner buddy */
    document.documentElement.classList.add('webgl');
    if (window.GBrobot && window.GBrobot.toBuddy) window.GBrobot.toBuddy();
  }
})();
