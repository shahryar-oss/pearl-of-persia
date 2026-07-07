/* =========================================================
   Pearl of Persia — prototype app logic
   - Bilingual FA(RTL) / EN(LTR)  via data-fa / data-en attrs
   - Anonymous, browser-only progress (localStorage)
   - Sequential video gating + journey rendering
   - Shared header / footer / Kairos widget injection
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Episode data (placeholder titles; Stella supplies real copy) ---------- */
  const CLUSTERS = [
    { key:'foundations',   fa:'پایه‌ها',                 en:'Foundations',                 range:[1,4],
      descFa:'جایی برای رسیدن به احساس امنیت و آرام شدن.', descEn:'A place to arrive, feel safe, and settle.' },
    { key:'understanding', fa:'شناختِ خود',              en:'Understanding Yourself',      range:[5,10],
      descFa:'با مهربانی به آنچه درون شماست نگاه می‌کنیم.', descEn:'Looking gently at what lives within you.' },
    { key:'pain',          fa:'وقتی درد سنگین می‌شود',    en:'When the Pain Feels Too Much', range:[11,12],
      descFa:'ابزارهایی برای لحظه‌های دشوار.',            descEn:'Tools for the hardest moments.' },
    { key:'relationships', fa:'رابطه‌ها و مرزها',         en:'Relationships & Boundaries',  range:[13,21],
      descFa:'دربارهٔ پیوند، اعتماد و فضای سالم.',         descEn:'On connection, trust, and healthy space.' },
    { key:'shame',         fa:'شرم، هویت و شفا',          en:'Shame, Identity & Healing',   range:[22,26],
      descFa:'به سوی پذیرش، معنا و امید.',                descEn:'Toward acceptance, meaning, and hope.' },
  ];

  // Build 26 episodes from clusters
  const EPISODES = [];
  CLUSTERS.forEach(c => {
    for (let n = c.range[0]; n <= c.range[1]; n++) {
      EPISODES.push({
        id: n,
        cluster: c.key,
        titleFa: 'گفت‌وگوی ' + toFa(n),
        titleEn: 'Conversation ' + n,
        descFa: 'توضیح کوتاه این گفت‌وگو در اینجا قرار می‌گیرد. (محتوای نمونه)',
        descEn: 'A short description of this conversation goes here. (placeholder content)',
        length: 12 + (n % 4),
      });
    }
  });

  // Merge content-manager overrides for sessions (titles, descriptions, length, video, worksheet)
  if (window.POPContent && typeof window.POPContent.getSessions === 'function'){
    var _ov = window.POPContent.getSessions() || {};
    EPISODES.forEach(function(e){
      var o = _ov[e.id] || _ov[String(e.id)];
      if (!o) return;
      ['titleFa','titleEn','descFa','descEn','length','videoUrl','worksheetUrl'].forEach(function(k){
        if (o[k] != null && o[k] !== '') e[k] = o[k];
      });
    });
  }

  function toFa(num){
    const d='۰۱۲۳۴۵۶۷۸۹';
    return String(num).replace(/\d/g, x => d[+x]);
  }

  /* ---------- State (localStorage) ---------- */
  const KEY = 'pop_state_v1';
  function getState(){
    let s;
    try { s = JSON.parse(localStorage.getItem(KEY)); } catch(e){ s = null; }
    if (!s || typeof s !== 'object') s = {};
    if (!Array.isArray(s.watched)) s.watched = [];
    if (!s.lang) s.lang = 'fa';
    if (!s.last) s.last = null;
    return s;
  }
  function setState(s){ try{ localStorage.setItem(KEY, JSON.stringify(s)); }catch(e){} }
  function markWatched(id){
    const s = getState();
    if (!s.watched.includes(id)) s.watched.push(id);
    s.last = id;
    setState(s);
  }
  function setLast(id){ const s=getState(); s.last=id; setState(s); }
  // highest unlocked = first unwatched after the contiguous watched run, capped at 26
  function highestUnlocked(){
    const s = getState();
    let unlocked = 1;
    for (let n = 1; n <= EPISODES.length; n++){
      if (s.watched.includes(n)) unlocked = Math.min(n + 1, EPISODES.length);
      else break;
    }
    return unlocked;
  }
  function isUnlocked(id){ return id <= highestUnlocked(); }
  function isWatched(id){ return getState().watched.includes(id); }
  function clusterReached(c){ return highestUnlocked() >= c.range[0] || c.range.some(()=>false); }

  window.POP = { getState, setState, markWatched, setLast, highestUnlocked, isUnlocked, isWatched, EPISODES, CLUSTERS, toFa };

  /* ---------- i18n: swap textContent / attrs by data-fa / data-en ---------- */
  function applyLang(lang){
    const isFa = lang === 'fa';
    document.body.classList.toggle('lang-fa', isFa);
    document.body.classList.toggle('lang-en', !isFa);
    document.body.setAttribute('dir', isFa ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', isFa ? 'fa' : 'en');

    document.querySelectorAll('[data-fa]').forEach(el => {
      const val = el.getAttribute(isFa ? 'data-fa' : 'data-en');
      if (val !== null) el.textContent = val;
    });
    document.querySelectorAll('[data-fa-ph]').forEach(el => {
      const val = el.getAttribute(isFa ? 'data-fa-ph' : 'data-en-ph');
      if (val !== null) el.setAttribute('placeholder', val);
    });
    document.querySelectorAll('[data-fa-html]').forEach(el => {
      const val = el.getAttribute(isFa ? 'data-fa-html' : 'data-en-html');
      if (val !== null) el.innerHTML = val;
    });

    document.querySelectorAll('.lang-toggle button').forEach(b => {
      b.classList.toggle('on', b.dataset.lang === lang);
    });
    const s = getState(); s.lang = lang; setState(s);
    // let pages re-render dynamic bits
    document.dispatchEvent(new CustomEvent('pop:lang', { detail:{ lang } }));
  }
  window.applyLang = applyLang;

  /* ---------- SVG snippets ---------- */
  const SVG = {
    symbol: '<svg viewBox="0 0 64 56" class="logo-symbol" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 26c0-9 5-15 9-13M58 26c0-9-5-15-9-13M32 6v0M6 26c2 16 13 24 26 24s24-8 26-24c-3 3-7 4-10 2-3 3-7 3-10 1-3 4-9 4-12 0-3 2-7 2-10-1-3 2-7 1-10-2Z"/><circle cx="32" cy="33" r="8"/><path d="M32 9v9M24 14l4 8M40 14l-4 8"/></svg>',
    menu: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    chat: '<svg class="ic" viewBox="0 0 24 24"><path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
    close:'<svg class="ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    lock: '<svg class="ic" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
    check:'<svg class="ic" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg>',
    leaf: '<svg class="ic" viewBox="0 0 24 24"><path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14ZM5 19c4-4 7-7 9-9"/></svg>',
    pause:'<svg class="ic" viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></svg>',
    depth:'<svg class="ic" viewBox="0 0 24 24"><path d="M12 3v14M6 11l6 6 6-6M5 21h14"/></svg>',
    doc:  '<svg class="ic" viewBox="0 0 24 24"><path d="M7 3h7l5 5v13H7zM14 3v5h5M9 13h6M9 17h6"/></svg>',
    heart:'<svg class="ic" viewBox="0 0 24 24"><path d="M12 20s-7-4.5-9.5-9A4.5 4.5 0 0 1 12 6a4.5 4.5 0 0 1 9.5 5C19 15.5 12 20 12 20Z"/></svg>',
    wind: '<svg class="ic" viewBox="0 0 24 24"><path d="M3 8h11a3 3 0 1 0-3-3M3 16h14a3 3 0 1 1-3 3M3 12h7"/></svg>',
  };

  /* ---------- NAV definition ---------- */
  const NAV = [
    { href:'index.html',      fa:'خانه',           en:'Home' },
    { href:'start-here.html', fa:'از اینجا شروع کنید', en:'Start Here' },
    { href:'journey.html',    fa:'مسیر',           en:'The Journey' },
    { href:'grounding.html',  fa:'آرامش و حمایت',   en:'Grounding & Support' },
    { href:'about.html',      fa:'دربارهٔ ما',     en:'About Us' },
    { href:'connection.html', fa:'ارتباط انسانی',  en:'Human Connection' },
  ];

  function currentPage(){
    const p = location.pathname.split('/').pop();
    return p === '' ? 'index.html' : p;
  }

  /* ---------- Build header ---------- */
  function buildHeader(){
    const here = currentPage();
    const navLinks = NAV.map(n =>
      `<a href="${n.href}" class="${n.href===here?'active':''}" data-fa="${n.fa}" data-en="${n.en}">${n.fa}</a>`
    ).join('');
    return `
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="Pearl of Persia home">
          <img class="brand-logo" src="assets/img/logo-full.png" alt="Pearl of Persia">
        </a>
        <button class="menu-toggle" id="menuToggle" aria-label="Menu">${SVG.menu}</button>
        <nav class="nav" id="mainNav">${navLinks}</nav>
        <div class="header-actions">
          <a class="btn btn-gold" href="start-here.html"><span data-fa="شروع" data-en="Start">شروع</span></a>
          <div class="lang-toggle" role="group" aria-label="Language">
            <button data-lang="fa" onclick="applyLang('fa')">فا</button>
            <button data-lang="en" onclick="applyLang('en')">EN</button>
          </div>
        </div>
      </div>
    </header>`;
  }

  /* ---------- Build footer ---------- */
  function buildFooter(){
    return `
    <div class="crisis-strip">
      <div class="container">
        <span data-fa="اگر در خطر آسیب فوری هستید، لطفاً با خدمات اورژانس محلی تماس بگیرید."
              data-en="If you are in immediate danger, please contact your local emergency services.">اگر در خطر آسیب فوری هستید، لطفاً با خدمات اورژانس محلی تماس بگیرید.</span>
        <a href="terms.html#crisis" data-fa="منابع بحران" data-en="Crisis support">منابع بحران</a>
      </div>
    </div>
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="brand">
            <img class="brand-logo brand-logo-light" src="assets/img/logo-full.png" alt="Pearl of Persia">
          </div>
          <small data-fa="بخشی از خدمت ترنسفورم ایران. این فضا حمایت آموزشی و معنوی ارائه می‌دهد و جایگزین مراقبت پزشکی یا روان‌پزشکی حرفه‌ای نیست."
                 data-en="A ministry of Transform Iran. This space offers educational and spiritual support and is not a substitute for professional medical or psychiatric care.">بخشی از خدمت ترنسفورم ایران.</small>
        </div>
        <div>
          <h4 data-fa="پیمایش" data-en="Explore">پیمایش</h4>
          <div class="footer-links">
            <a href="start-here.html" data-fa="از اینجا شروع کنید" data-en="Start Here">از اینجا شروع کنید</a>
            <a href="journey.html" data-fa="مسیر" data-en="The Journey">مسیر</a>
            <a href="grounding.html" data-fa="آرامش و حمایت" data-en="Grounding & Support">آرامش و حمایت</a>
            <a href="connection.html" data-fa="ارتباط انسانی" data-en="Human Connection">ارتباط انسانی</a>
          </div>
        </div>
        <div>
          <h4 data-fa="اطلاعات" data-en="Information">اطلاعات</h4>
          <div class="footer-links">
            <a href="terms.html" data-fa="شرایط و سلب مسئولیت" data-en="Terms & Disclaimer">شرایط و سلب مسئولیت</a>
            <a href="terms.html#privacy" data-fa="حریم خصوصی" data-en="Privacy">حریم خصوصی</a>
            <a href="terms.html#crisis" data-fa="حمایت در بحران" data-en="Crisis Support">حمایت در بحران</a>
            <a href="about.html#ministries" data-fa="خدمت‌های مرتبط" data-en="Related Ministries">خدمت‌های مرتبط</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; Pearl of Persia</span>
        <span data-fa="با مهربانی ساخته شده — نمونهٔ اولیه" data-en="Made with care — prototype">با مهربانی ساخته شده — نمونهٔ اولیه</span>
      </div>
    </footer>`;
  }

  /* ---------- Build Pearl assistant widget (Kairos embed under the hood) ---------- */
  const PEARL_ICON = '<img src="assets/img/logo-symbol.png" alt="" style="width:62%;height:auto;display:block">';
  function getAssistant(){
    return (window.POPContent && window.POPContent.getAssistant) ? window.POPContent.getAssistant() : { enabled:false, mode:'panel' };
  }
  function buildKairos(){
    var a = getAssistant();
    var connected = a.enabled && a.mode === 'panel' && a.url;   // their chat shown inside our branded panel
    var body, foot;
    if (connected){
      body = '<iframe src="' + a.url + '" title="Pearl" style="width:100%;height:380px;border:0;border-radius:14px;background:#fff" allow="microphone; clipboard-write"></iframe>';
      foot = '<p class="tiny muted" style="margin:.3rem 0 0" data-fa="مروارید یک راهنمای هوش مصنوعی است و می‌تواند اشتباه کند. برای تصمیم‌های اضطراری به آن تکیه نکنید." data-en="Pearl is an AI guide and can make mistakes. Do not rely on it for emergency decisions.">مروارید یک راهنمای هوش مصنوعی است.</p>';
    } else {
      body = '<div class="kairos-bubble" data-fa="سلام، من مروارید هستم. می‌توانم کمک کنم گام بعدی مناسب را پیدا کنید یا منبعی برای آرام شدن بیابید. عجله‌ای نیست." data-en="Hello, I\'m Pearl. I can help you find the next gentle step or a resource to feel calmer. There\'s no rush.">سلام، من مروارید هستم.</div>';
      foot =
        '<div class="kairos-input"><input type="text" data-fa-ph="پیام خود را بنویسید…" data-en-ph="Type a message…" aria-label="Message"><button class="btn" style="padding:.6rem 1rem" data-fa="ارسال" data-en="Send">ارسال</button></div>' +
        '<p class="fallback" id="kairosFallback" data-fa="' + (a.fallbackFa || 'مروارید هنوز متصل نشده است. به‌زودی اینجا در دسترس خواهد بود.') + '" data-en="' + (a.fallbackEn || 'Pearl is not connected yet. It will be available here soon.') + '" style="margin:.6rem 0 0">مروارید هنوز متصل نشده است.</p>' +
        '<p class="tiny muted" style="margin:.6rem 0 0" data-fa="مروارید یک راهنمای هوش مصنوعی است و می‌تواند اشتباه کند. برای تصمیم‌های اضطراری به آن تکیه نکنید." data-en="Pearl is an AI guide and can make mistakes. Do not rely on it for emergency decisions.">مروارید یک راهنمای هوش مصنوعی است.</p>';
    }
    return `
    <button class="kairos-fab" id="kairosFab" aria-label="Pearl">
      <span class="ic-circle">${PEARL_ICON}</span>
      <span data-fa="گفت‌وگو با مروارید" data-en="Talk with Pearl">گفت‌وگو با مروارید</span>
    </button>
    <div class="kairos-panel" id="kairosPanel" role="dialog" aria-label="Pearl">
      <div class="kairos-head">
        <span class="ic-circle">${PEARL_ICON}</span>
        <div>
          <b data-fa="مروارید" data-en="Pearl">مروارید</b>
          <small data-fa="راهنمای آرام شما" data-en="Your gentle guide">راهنمای آرام شما</small>
        </div>
        <button class="close" id="kairosClose" aria-label="Close">${SVG.close}</button>
      </div>
      <div class="kairos-body">${body}</div>
      <div class="kairos-foot">${foot}</div>
    </div>`;
  }
  // Their own self-contained widget script (executes script tags safely).
  function injectAssistantEmbed(code){
    try {
      var tpl = document.createElement('div'); tpl.innerHTML = code;
      [].slice.call(tpl.children).forEach(function(node){
        if (node.tagName === 'SCRIPT'){
          var s = document.createElement('script');
          if (node.src) s.src = node.src; else s.textContent = node.textContent;
          if (node.async) s.async = true;
          document.body.appendChild(s);
        } else { document.body.appendChild(node); }
      });
    } catch(e){ /* ignore in prototype */ }
  }

  /* ---------- Wire interactions ---------- */
  function wire(){
    const mt = document.getElementById('menuToggle');
    const nav = document.getElementById('mainNav');
    if (mt && nav) mt.addEventListener('click', () => nav.classList.toggle('open'));

    const fab = document.getElementById('kairosFab');
    const panel = document.getElementById('kairosPanel');
    const close = document.getElementById('kairosClose');
    if (fab && panel){
      fab.addEventListener('click', () => panel.classList.toggle('open'));
      if (close) close.addEventListener('click', () => panel.classList.remove('open'));
    }

    // fade-up on scroll
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold:.08 });
    document.querySelectorAll('.fade-up').forEach(el => io.observe(el));
    // Safety net: reveal anything already in view shortly after load, so content is
    // never left invisible if the observer's initial callback is delayed.
    setTimeout(function(){
      document.querySelectorAll('.fade-up:not(.in)').forEach(function(el){
        if (el.getBoundingClientRect().top < window.innerHeight * 1.15) el.classList.add('in');
      });
    }, 450);
  }

  /* ---------- Scattered 3D pearls (brand decoration) ---------- */
  function scatterPearls(){
    if (document.getElementById('pearlField')) return;
    var docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    var field = document.createElement('div');
    field.id = 'pearlField';
    field.setAttribute('aria-hidden', 'true');
    field.style.height = docH + 'px';
    var mobile = window.innerWidth < 760;
    var count = mobile ? 7 : 14;
    for (var i = 0; i < count; i++){
      var p = document.createElement('span');
      p.className = 'pearl3d';
      // mostly small pearls, with a couple of larger feature ones on desktop
      var size = mobile ? (10 + Math.random() * 22) : (12 + Math.random() * 46);
      if (!mobile && i < 2) size = 64 + Math.random() * 42;
      if (size >= 56) p.className += ' shine';
      // keep pearls in the real side gutters (in px) so they never cover reading text;
      // they may bleed slightly off-screen, which reads as natural scatter
      var gutter = Math.max((window.innerWidth - 1140) / 2, 28);
      var leftSide = Math.random() < 0.5;
      var px = leftSide
        ? (Math.random() * gutter - size * 0.45)
        : (window.innerWidth - gutter + Math.random() * gutter - size * 0.55);
      // clamp so a pearl's inner edge never crosses into the reading column —
      // oversized pearls bleed off-screen instead
      if (leftSide) px = Math.min(px, gutter + 14 - size);
      else px = Math.max(px, window.innerWidth - gutter - 14);
      var y = 3 + Math.random() * 93;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.round(px) + 'px';
      p.style.top = y + '%';
      p.style.setProperty('--dur', (7 + Math.random() * 7).toFixed(1) + 's');
      p.style.setProperty('--delay', (-Math.random() * 8).toFixed(1) + 's');
      field.appendChild(p);
    }
    document.body.appendChild(field);
  }

  /* ---------- Parallax: background photo drifts slowly on scroll ---------- */
  function initParallax(){
    var items = [].slice.call(document.querySelectorAll('.parallax'));
    if (!items.length) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      items.forEach(function(img){ img.style.transform = 'scale(1.05)'; });
      return;
    }
    var ticking = false;
    function update(){
      var vh = window.innerHeight;
      items.forEach(function(img){
        var host = img.parentElement;
        var r = host.getBoundingClientRect();
        if (r.bottom < -120 || r.top > vh + 120) return; // skip off-screen
        // progress ~ +0.5 (just entering from below) .. -0.5 (leaving at top)
        var progress = ((r.top + r.height / 2) - vh / 2) / (vh + r.height);
        var shift = Math.max(-1, Math.min(1, progress)) * 6; // gentle %
        img.style.transform = 'translateY(' + shift.toFixed(2) + '%) scale(1.14)';
      });
      ticking = false;
    }
    function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', onScroll, { passive:true });
    window.addEventListener('resize', onScroll, { passive:true });
    update();
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    const h = document.getElementById('site-header');
    if (h) h.outerHTML = buildHeader();
    const f = document.getElementById('site-footer');
    if (f) f.outerHTML = buildFooter();
    const k = document.getElementById('site-kairos');
    const asst = getAssistant();
    if (asst.enabled && asst.mode === 'embed' && asst.code){
      // Their team's self-contained chat widget renders itself; drop our placeholder button.
      if (k) k.remove();
      injectAssistantEmbed(asst.code);
    } else if (k){
      k.outerHTML = buildKairos();
    }

    wire();
    applyLang(getState().lang || 'fa');

    if (typeof window.popPageInit === 'function') window.popPageInit();
    // scatter after page init so the field height matches the rendered page
    setTimeout(scatterPearls, 80);
    initParallax();
  });
})();
