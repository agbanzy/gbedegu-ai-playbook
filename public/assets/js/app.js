/* GBEDEGU '26 AI Playbook — interaction layer */
(function () {
  'use strict';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var GB = window.GB || {};

  var ICONS = {
    copy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5 9.5 18 20 6.5"/></svg>',
    star:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3 2.7 5.9 6.3.7-4.7 4.3 1.3 6.1L12 17l-5.6 3 1.3-6.1L3 9.6l6.3-.7z"/></svg>',
    chat:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5Z"/></svg>',
    search:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    chart:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
    pen:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4.5 19.5 9 8 20.5 3 21l.5-5z"/></svg>'
  };

  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]; }); }
  /* highlight [bracket slots] without letting raw HTML through */
  function fmt(s){ return esc(s).replace(/\[([^\]]+)\]/g, '<span class="slot">[$1]</span>'); }

  /* ---------------- toast ---------------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg){
    if(!toastEl) return;
    toastEl.innerHTML = ICONS.check.replace('viewBox','width="15" height="15" viewBox') + '<span>' + esc(msg) + '</span>';
    toastEl.classList.add('on');
    clearTimeout(toastT);
    toastT = setTimeout(function(){ toastEl.classList.remove('on'); }, 2200);
  }
  window.GBtoast = toast;

  /* ---------------- clipboard ---------------- */
  function legacyCopy(text){
    return new Promise(function(res, rej){
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly','');
      ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, ta.value.length);
      var ok = false;
      try { ok = document.execCommand('copy'); } catch(e){ ok = false; }
      document.body.removeChild(ta);
      ok ? res() : rej(new Error('copy failed'));
    });
  }
  function copyText(text){
    if (navigator.clipboard && window.isSecureContext) {
      /* writeText rejects without transient user activation and on some mobile
         browsers — always keep the legacy path as a real fallback, not a branch */
      return navigator.clipboard.writeText(text).catch(function(){ return legacyCopy(text); });
    }
    return legacyCopy(text);
  }

  document.addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.copy') : null;
    if(!btn) return;
    var text = btn.getAttribute('data-copy');
    if(!text){
      var box = btn.closest('.promptbox');
      var body = box && box.querySelector('.pb');
      text = body ? body.textContent : '';
    }
    if(!text) return;
    copyText(text).then(function(){
      var label = btn.querySelector('span');
      var was = label ? label.textContent : '';
      btn.classList.add('done');
      if(label) label.textContent = 'Copied';
      toast('Copied — now paste it into your assistant');
      if(window.GBrobot && window.GBrobot.cheer) window.GBrobot.cheer();
      setTimeout(function(){ btn.classList.remove('done'); if(label) label.textContent = was; }, 1900);
    }).catch(function(){ toast('Could not copy — select the text and copy manually'); });
  });

  /* ---------------- theme ---------------- */
  var themeBtn = $('#themeBtn');
  if(themeBtn) themeBtn.addEventListener('click', function(){
    var cur = document.documentElement.getAttribute('data-theme');
    if(!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('gbedegu-theme', next); } catch(e){}
    toast(next === 'dark' ? 'Dark mode' : 'Light mode');
  });

  /* ---------------- role prompts ---------------- */
  var rp = $('#rolePrompts');
  if(rp && GB.rolePrompts){
    rp.innerHTML = GB.rolePrompts.map(function(p){
      return '<div class="promptbox rv">' +
        '<div class="ph"><b><span class="role">'+(ICONS[p.icon]||ICONS.star)+'</span>'+esc(p.title)+'</b>' +
        '<button class="copy" type="button">'+ICONS.copy+'<span>Copy</span></button></div>' +
        '<div class="pb">'+fmt(p.text)+'</div></div>';
    }).join('');
  }

  /* ---------------- prompt bank ---------------- */
  var egGrid = $('#egGrid'), egChips = $('#egChips'), egCount = $('#egCount');
  var egCat = 'All';
  function renderPrompts(){
    if(!egGrid || !GB.prompts) return;
    var list = GB.prompts.filter(function(p){ return egCat === 'All' || p.cat === egCat; });
    egGrid.innerHTML = list.map(function(p){
      return '<div class="promptbox">' +
        '<div class="ph"><b><span class="role">'+ICONS.pen+'</span>'+esc(p.title)+'</b>' +
        '<button class="copy" type="button">'+ICONS.copy+'<span>Copy</span></button></div>' +
        '<div class="pb">'+fmt(p.text)+'</div></div>';
    }).join('');
    if(egCount) egCount.textContent = list.length + (list.length === 1 ? ' prompt' : ' prompts') +
      (egCat === 'All' ? ' — every one written with the six parts.' : ' in ' + egCat + '.');
    if(window.GBmotion && window.GBmotion.refresh) window.GBmotion.refresh();
  }
  if(egChips && GB.prompts){
    var cats = ['All'].concat(GB.prompts.map(function(p){ return p.cat; }).filter(function(v,i,a){ return a.indexOf(v) === i; }));
    egChips.innerHTML = cats.map(function(c,i){
      return '<button class="chip'+(i===0?' on':'')+'" type="button" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
    }).join('');
    egChips.addEventListener('click', function(e){
      var b = e.target.closest('.chip'); if(!b) return;
      $$('.chip', egChips).forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on'); egCat = b.getAttribute('data-cat'); renderPrompts();
    });
    renderPrompts();
  }

  /* ---------------- tools ---------------- */
  var tGrid = $('#toolGrid'), tChips = $('#toolChips'), tCount = $('#toolCount'),
      tSearch = $('#toolSearch'), tClear = $('#toolClear'), tFree = $('#freeOnly'), tEmpty = $('#toolEmpty');
  var tCat = 'All', tQ = '';

  function isFree(t){ return /free|₦0|self-host/i.test(t.free || ''); }

  function renderTools(){
    if(!tGrid || !GB.tools) return;
    var q = tQ.trim().toLowerCase();
    var list = GB.tools.filter(function(t){
      if(tCat !== 'All' && t.c !== tCat) return false;
      if(tFree && tFree.checked && !isFree(t)) return false;
      if(!q) return true;
      return (t.n + ' ' + t.d + ' ' + t.c + ' ' + t.free + ' ' + t.paid).toLowerCase().indexOf(q) !== -1;
    });
    tGrid.innerHTML = list.map(function(t){
      var host = t.u.replace(/^https?:\/\//,'').replace(/\/$/,'');
      return '<article class="tool">' +
        '<div class="th"><b>'+esc(t.n)+'</b><span class="cat">'+esc(t.c)+'</span></div>' +
        '<p>'+esc(t.d)+'</p>' +
        '<div class="pr">' +
          (t.free ? '<span class="tag free">'+esc(t.free)+'</span>' : '') +
          (t.paid && t.paid !== '—' ? '<span class="tag">'+esc(t.paid)+'</span>' : '') +
          (t.ng ? '<span class="tag ng">Priced in Nigeria</span>' : '') +
        '</div>' +
        '<a class="go" href="'+esc(t.u)+'" target="_blank" rel="noopener">'+esc(host)+
        ' <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></a>' +
      '</article>';
    }).join('');
    if(tEmpty) tEmpty.classList.toggle('on', list.length === 0);
    if(tCount) tCount.textContent = list.length + ' of ' + GB.tools.length + ' tools' +
      (tCat !== 'All' ? ' in ' + tCat : '') + (tFree && tFree.checked ? ' with a free tier' : '') +
      (q ? ' matching “' + tQ.trim() + '”' : '') + '.';
    if(tClear) tClear.classList.toggle('on', !!q);
  }

  if(tChips && GB.tools){
    var tc = ['All'].concat(GB.tools.map(function(t){ return t.c; }).filter(function(v,i,a){ return a.indexOf(v) === i; }));
    tChips.innerHTML = tc.map(function(c,i){
      return '<button class="chip'+(i===0?' on':'')+'" type="button" data-cat="'+esc(c)+'">'+esc(c)+'</button>';
    }).join('');
    tChips.addEventListener('click', function(e){
      var b = e.target.closest('.chip'); if(!b) return;
      $$('.chip', tChips).forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on'); tCat = b.getAttribute('data-cat'); renderTools();
    });
  }
  var deb;
  if(tSearch) tSearch.addEventListener('input', function(){
    clearTimeout(deb); var v = tSearch.value;
    deb = setTimeout(function(){ tQ = v; renderTools(); }, 130);
  });
  if(tClear) tClear.addEventListener('click', function(){ tSearch.value=''; tQ=''; renderTools(); tSearch.focus(); });
  if(tFree) tFree.addEventListener('change', renderTools);
  renderTools();

  /* ---------------- 30-day checklist ---------------- */
  var KEY = 'gbedegu-plan-v1';
  var weeksEl = $('#weeks'), ringFg = $('#ringFg'), ringLbl = $('#ringLbl'),
      planMsg = $('#planMsg'), planTitle = $('#planTitle'), planReset = $('#planReset');
  var CIRC = 2 * Math.PI * 48;

  function loadState(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch(e){ return {}; } }
  function saveState(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); } catch(e){} }

  var MSGS = [
    'Nothing ticked yet. Start with Week 1 — picking one assistant takes four minutes.',
    'Started. The hardest part was opening the page, and you already did that.',
    'Week 1 territory. Get the Project set up and every later step gets easier.',
    'Good pace. Remember: a few evenings a week is enough.',
    'Halfway. This is where most people stop — and where the compounding starts.',
    'Past halfway. Your site is the one that changes how people see you. Ship it.',
    'Nearly there. Build the one automation, then review what actually saved time.',
    'Done. Now run it for 90 days — consistency beats brilliance. Send me the link.'
  ];

  function updateRing(){
    var boxes = $$('.task input', weeksEl);
    var total = boxes.length;
    var done = boxes.filter(function(b){ return b.checked; }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    if(ringFg) ringFg.style.strokeDashoffset = String(CIRC * (1 - pct / 100));
    if(ringLbl) ringLbl.textContent = pct + '%';
    if(planTitle) planTitle.textContent = done + ' of ' + total + ' steps done';
    /* index 0 is reserved for a genuinely empty list; the rest spread across the range */
    var mi = done === 0 ? 0 : Math.min(MSGS.length - 1, 1 + Math.floor(pct / 100 * (MSGS.length - 2)));
    if(planMsg) planMsg.textContent = MSGS[mi];
    $$('.week', weeksEl).forEach(function(w){
      var bs = $$('.task input', w);
      w.classList.toggle('done', bs.length > 0 && bs.every(function(b){ return b.checked; }));
    });
  }

  if(weeksEl && GB.weeks){
    var state = loadState();
    weeksEl.innerHTML = GB.weeks.map(function(w){
      return '<div class="week rv">' +
        '<div class="wh"><span class="wn">'+w.n+'</span><h3>'+esc(w.t)+'<small>'+esc(w.s)+'</small></h3></div>' +
        '<ul class="tasks">' + w.tasks.map(function(t, i){
          var id = 'w' + w.n + 't' + i;
          return '<li><label class="task">' +
            '<input type="checkbox" data-id="'+id+'"'+(state[id] ? ' checked' : '')+'>' +
            '<span class="box">'+ICONS.check+'</span>' +
            '<span class="tx">'+t+'</span></label></li>';
        }).join('') + '</ul></div>';
    }).join('');

    weeksEl.addEventListener('change', function(e){
      var i = e.target;
      if(!i || i.type !== 'checkbox') return;
      var s = loadState();
      if(i.checked) s[i.getAttribute('data-id')] = 1; else delete s[i.getAttribute('data-id')];
      saveState(s);
      updateRing();
      var boxes = $$('.task input', weeksEl);
      if(i.checked && boxes.every(function(b){ return b.checked; })){
        toast('All 21 steps done. Send me the site you shipped.');
        if(window.GBrobot && window.GBrobot.cheer) window.GBrobot.cheer();
      }
    });

    if(planReset) planReset.addEventListener('click', function(){
      try { localStorage.removeItem(KEY); } catch(e){}
      $$('.task input', weeksEl).forEach(function(b){ b.checked = false; });
      updateRing();
      toast('Checklist reset');
    });
    updateRing();
  }

  /* ---------------- QR codes ---------------- */
  function makeQR(el, text){
    if(!el || typeof QRCode === 'undefined') return;
    el.innerHTML = '';
    try {
      new QRCode(el, { text:text, width:200, height:200, colorDark:'#151F4A', colorLight:'#ffffff',
                       correctLevel: QRCode.CorrectLevel.M });
    } catch(e){}
  }
  function initQR(){
    var here = location.protocol === 'file:' ? 'https://jci.innoedgetech.com' : location.origin + '/';
    makeQR($('#qrHub'), here);
    makeQR($('#qrCard'), 'https://thenfchq.com/godwin');
  }
  if(typeof QRCode !== 'undefined') initQR(); else window.addEventListener('load', initQR);

  /* ---------------- lead form → WhatsApp / mailto ---------------- */
  var FORM_ENDPOINT = '';                 /* set to a Formspree/Google Form URL to POST instead */
  var WHATSAPP = '2347060961678';
  var EMAIL    = 'agbane6@gmail.com';

  var form = $('#leadForm'), lfStatus = $('#lfStatus'), lfMail = $('#lfMail');
  function compose(){
    var n = ($('#lfName')||{}).value || '';
    var l = ($('#lfLink')||{}).value || '';
    var m = ($('#lfMsg') ||{}).value || '';
    return 'Hi Godwin — from the GBEDEGU \'26 AI session.\n\n' +
           'Name: ' + (n.trim() || '(not given)') + '\n' +
           (l.trim() ? 'Site/handle: ' + l.trim() + '\n' : '') +
           (m.trim() ? '\n' + m.trim() : '');
  }
  function validate(){
    var n = $('#lfName');
    if(n && !n.value.trim()){
      if(lfStatus) lfStatus.textContent = 'Add your name first.';
      n.focus();
      return false;
    }
    if(lfStatus) lfStatus.textContent = '';
    return true;
  }
  if(form) form.addEventListener('submit', function(e){
    e.preventDefault();
    if(!validate()) return;
    var body = compose();
    if(FORM_ENDPOINT){
      fetch(FORM_ENDPOINT, { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ name:$('#lfName').value, link:$('#lfLink').value, message:$('#lfMsg').value }) })
        .then(function(){ if(lfStatus) lfStatus.textContent = 'Sent — thank you.'; form.reset(); })
        .catch(function(){ if(lfStatus) lfStatus.textContent = 'Could not send. Try WhatsApp below.'; });
      return;
    }
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(body), '_blank', 'noopener');
    if(lfStatus) lfStatus.textContent = 'WhatsApp opened — hit send there.';
  });
  if(lfMail) lfMail.addEventListener('click', function(){
    if(!validate()) return;
    window.location.href = 'mailto:' + EMAIL +
      '?subject=' + encodeURIComponent("GBEDEGU '26 — the site I shipped") +
      '&body=' + encodeURIComponent(compose());
    if(lfStatus) lfStatus.textContent = 'Your email app should be opening.';
  });

  /* ---------------- nav: read bar, sticky, active section ---------------- */
  var topbar = $('#topbar'), readbar = $('#readbar');
  var navLinks = $$('#topnav a').concat($$('#rail a'));
  var targets = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); });

  var ticking = false;
  function onScroll(){
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(function(){
      var y = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if(readbar) readbar.style.width = (h > 0 ? Math.min(100, y / h * 100) : 0) + '%';
      if(topbar) topbar.classList.toggle('stuck', y > 12);

      var best = 0, mid = y + window.innerHeight * 0.34;
      for(var i = 0; i < targets.length; i++){
        var t = targets[i];
        if(t && t.offsetTop <= mid) best = i;
      }
      var id = targets[best] ? targets[best].id : null;
      navLinks.forEach(function(a){
        a.classList.toggle('active', id && a.getAttribute('href') === '#' + id);
      });
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------------- marquee ---------------- */
  var mrow = $('#mrow');
  if(mrow && GB.tools){
    var names = GB.tools.map(function(t){ return t.n.replace(/\s*\(.*\)$/, ''); });
    var one = names.map(function(n){ return '<span class="mitem"><i></i>' + esc(n) + '</span>'; }).join('');
    mrow.innerHTML = one + one;
  }

  /* ---------------- flip cards: tap support ---------------- */
  $$('.flip').forEach(function(f){
    f.addEventListener('click', function(){ f.classList.toggle('flipped'); });
    f.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); f.classList.toggle('flipped'); }
    });
  });
})();
