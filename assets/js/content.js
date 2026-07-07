/* =========================================================
   Pearl of Persia — Content layer (prototype CMS bridge)
   - Shared between the public site and the /admin dashboard
   - Public pages: applies editable overrides + injects Google Analytics
   - Storage: localStorage (PROTOTYPE ONLY — production uses a server/DB)
   ========================================================= */
(function () {
  'use strict';

  var KEYS = {
    content:  'pop_content_v1',   // { "home.hero.title": {fa,en}, "home.hero.photo": {src} }
    sessions: 'pop_sessions_v1',  // { "1": {titleFa,titleEn,descFa,descEn,length,videoUrl,worksheetUrl} }
    ga:       'pop_ga_v1',        // { id: "G-XXXX", enabled: true }
    users:    'pop_users_v1',     // [ {id,name,email,role,active} ]
    assistant:'pop_assistant_v1'  // { enabled, mode:'panel'|'embed', url, code, fallbackFa, fallbackEn }
  };

  function read(key, fallback){
    try { var v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; }
    catch(e){ return fallback; }
  }
  function write(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); return true; } catch(e){ return false; } }

  /* ---- Editable-field registry (the admin builds its forms from this) ----
     Each field's `key` matches a data-edit="..." attribute in the HTML.
     type: text | textarea | image | video  ·  bilingual text carries fa + en. */
  var SCHEMA = [
    { group:'صفحهٔ خانه — معرفی', groupEn:'Home — Hero', page:'index.html', fields:[
      { key:'home.hero.eyebrow', type:'text',     labelFa:'برچسب بالا', labelEn:'Eyebrow' },
      { key:'home.hero.title',   type:'textarea', labelFa:'عنوان اصلی', labelEn:'Main title' },
      { key:'home.hero.lede',    type:'textarea', labelFa:'متن معرفی',  labelEn:'Intro paragraph' },
      { key:'home.hero.micro',   type:'text',     labelFa:'جملهٔ کوتاه',labelEn:'Micro line' },
      { key:'home.hero.photo',   type:'image',    labelFa:'عکس معرفی',  labelEn:'Hero photo' },
      { key:'home.hero.btnStart',    type:'text', labelFa:'دکمهٔ «شروع»', labelEn:'Button — Start' },
      { key:'home.hero.btnContinue', type:'text', labelFa:'دکمهٔ «ادامه»', labelEn:'Button — Continue' }
    ]},
    { group:'صفحهٔ خانه — آنچه می‌یابید', groupEn:'Home — What you’ll find', page:'index.html', fields:[
      { key:'home.find.heading', type:'text',  labelFa:'عنوان بخش', labelEn:'Section heading' },
      { key:'home.f1.title', type:'text',     labelFa:'کارت ۱ — عنوان', labelEn:'Card 1 — title' },
      { key:'home.f1.body',  type:'textarea', labelFa:'کارت ۱ — متن',   labelEn:'Card 1 — body' },
      { key:'home.f1.photo', type:'image',    labelFa:'کارت ۱ — عکس',   labelEn:'Card 1 — photo' },
      { key:'home.f2.title', type:'text',     labelFa:'کارت ۲ — عنوان', labelEn:'Card 2 — title' },
      { key:'home.f2.body',  type:'textarea', labelFa:'کارت ۲ — متن',   labelEn:'Card 2 — body' },
      { key:'home.f2.photo', type:'image',    labelFa:'کارت ۲ — عکس',   labelEn:'Card 2 — photo' },
      { key:'home.f3.title', type:'text',     labelFa:'کارت ۳ — عنوان', labelEn:'Card 3 — title' },
      { key:'home.f3.body',  type:'textarea', labelFa:'کارت ۳ — متن',   labelEn:'Card 3 — body' },
      { key:'home.f3.photo', type:'image',    labelFa:'کارت ۳ — عکس',   labelEn:'Card 3 — photo' }
    ]},
    { group:'صفحهٔ خانه — نوار تمام‌عرض', groupEn:'Home — Full-width band', page:'index.html', fields:[
      { key:'home.band.title', type:'text',     labelFa:'عنوان', labelEn:'Title' },
      { key:'home.band.body',  type:'textarea', labelFa:'متن',   labelEn:'Body' },
      { key:'home.band.photo', type:'image',    labelFa:'عکس پس‌زمینه', labelEn:'Background photo' }
    ]},
    { group:'صفحهٔ خانه — فراخوان پایانی', groupEn:'Home — Closing call', page:'index.html', fields:[
      { key:'home.cta.title', type:'text',     labelFa:'عنوان', labelEn:'Title' },
      { key:'home.cta.body',  type:'textarea', labelFa:'متن',   labelEn:'Body' },
      { key:'home.cta.photo', type:'image',    labelFa:'عکس',   labelEn:'Photo' },
      { key:'home.cta.btnStart', type:'text', labelFa:'دکمهٔ «شروع مسیر»', labelEn:'Button — Start journey' },
      { key:'home.cta.btnSee',   type:'text', labelFa:'دکمهٔ «نگاهی به مسیر»', labelEn:'Button — See journey' }
    ]},
    { group:'معرفی ۹۰ ثانیه‌ای', groupEn:'90-second intro', page:'index.html', fields:[
      { key:'home.teaser.video', type:'video', labelFa:'نشانی ویدئوی معرفی', labelEn:'Intro video URL' }
    ]},

    { group:'از اینجا شروع کنید', groupEn:'Start Here', page:'start-here.html', fields:[
      { key:'start.head.title', type:'text',     labelFa:'عنوان صفحه', labelEn:'Page title' },
      { key:'start.head.sub',   type:'textarea', labelFa:'زیرعنوان',   labelEn:'Subtitle' },
      { key:'start.watch.title',    type:'text', labelFa:'گام ۱ — عنوان', labelEn:'Step 1 — title' },
      { key:'start.watch.body',     type:'text', labelFa:'گام ۱ — متن',   labelEn:'Step 1 — body' },
      { key:'start.pause.title',    type:'text', labelFa:'گام ۲ — عنوان', labelEn:'Step 2 — title' },
      { key:'start.pause.body',     type:'text', labelFa:'گام ۲ — متن',   labelEn:'Step 2 — body' },
      { key:'start.continue.title', type:'text', labelFa:'گام ۳ — عنوان', labelEn:'Step 3 — title' },
      { key:'start.continue.body',  type:'text', labelFa:'گام ۳ — متن',   labelEn:'Step 3 — body' },
      { key:'start.safety',     type:'textarea', labelFa:'نکتهٔ ایمنی', labelEn:'Safety note' },
      { key:'start.btnJourney', type:'text',     labelFa:'دکمهٔ پایین', labelEn:'Bottom button' }
    ]},

    { group:'مسیر', groupEn:'The Journey', page:'journey.html', fields:[
      { key:'journey.head.eyebrow', type:'text',     labelFa:'برچسب بالا', labelEn:'Eyebrow' },
      { key:'journey.head.title',   type:'text',     labelFa:'عنوان صفحه', labelEn:'Page title' },
      { key:'journey.head.sub',     type:'textarea', labelFa:'زیرعنوان',   labelEn:'Subtitle' },
      { key:'journey.btnGrounding', type:'text',     labelFa:'دکمهٔ آرامش و حمایت', labelEn:'Grounding button' }
    ]},

    { group:'آرامش و حمایت', groupEn:'Grounding & Support', page:'grounding.html', fields:[
      { key:'grounding.head.title', type:'text',     labelFa:'عنوان صفحه', labelEn:'Page title' },
      { key:'grounding.head.sub',   type:'textarea', labelFa:'زیرعنوان',   labelEn:'Subtitle' },
      { key:'grounding.breathe.title', type:'text',     labelFa:'تنفس — عنوان', labelEn:'Breathe — title' },
      { key:'grounding.breathe.body',  type:'textarea', labelFa:'تنفس — متن',   labelEn:'Breathe — body' },
      { key:'grounding.c1.title', type:'text', labelFa:'کارت ۱ — عنوان', labelEn:'Card 1 — title' },
      { key:'grounding.c2.title', type:'text', labelFa:'کارت ۲ — عنوان', labelEn:'Card 2 — title' },
      { key:'grounding.c3.title', type:'text', labelFa:'کارت ۳ — عنوان', labelEn:'Card 3 — title' },
      { key:'grounding.c4.title', type:'text', labelFa:'کارت ۴ — عنوان', labelEn:'Card 4 — title' },
      { key:'grounding.warn',     type:'textarea', labelFa:'پیام هشدار بحران', labelEn:'Crisis note' },
      { key:'grounding.btnReturn',type:'text',     labelFa:'دکمهٔ پایین', labelEn:'Bottom button' }
    ]},

    { group:'دربارهٔ ما', groupEn:'About Us', page:'about.html', fields:[
      { key:'about.head.title', type:'text', labelFa:'عنوان صفحه', labelEn:'Page title' },
      { key:'about.head.sub',   type:'text', labelFa:'زیرعنوان',   labelEn:'Subtitle' },
      { key:'about.pop.title',  type:'text',     labelFa:'پرل آو پرشیا — عنوان', labelEn:'Pearl of Persia — title' },
      { key:'about.pop.body1',  type:'textarea', labelFa:'پرل آو پرشیا — متن ۱', labelEn:'Pearl of Persia — body 1' },
      { key:'about.pop.body2',  type:'textarea', labelFa:'پرل آو پرشیا — متن ۲', labelEn:'Pearl of Persia — body 2' },
      { key:'about.pop.photo',  type:'image',    labelFa:'عکس', labelEn:'Photo' },
      { key:'about.ti.title',   type:'text',     labelFa:'ترنسفورم ایران — عنوان', labelEn:'Transform Iran — title' },
      { key:'about.ti.body',    type:'textarea', labelFa:'ترنسفورم ایران — متن', labelEn:'Transform Iran — body' },
      { key:'about.faq.title',  type:'text', labelFa:'پرسش‌ها — عنوان', labelEn:'FAQ — heading' },
      { key:'about.min.title',  type:'text', labelFa:'خدمت‌های مرتبط — عنوان', labelEn:'Ministries — title' },
      { key:'about.min.body',   type:'text', labelFa:'خدمت‌های مرتبط — متن', labelEn:'Ministries — body' },
      { key:'about.btnStart',   type:'text', labelFa:'دکمهٔ پایین', labelEn:'Bottom button' }
    ]},

    { group:'ارتباط انسانی', groupEn:'Human Connection', page:'connection.html', fields:[
      { key:'conn.head.title', type:'text',     labelFa:'عنوان صفحه', labelEn:'Page title' },
      { key:'conn.head.sub',   type:'textarea', labelFa:'زیرعنوان',   labelEn:'Subtitle' },
      { key:'conn.btnSend',    type:'text',     labelFa:'دکمهٔ «ارسال پیام»', labelEn:'Send button' },
      { key:'conn.formNote',   type:'text',     labelFa:'یادداشت زیر فرم', labelEn:'Note under form' },
      { key:'conn.warn',       type:'textarea', labelFa:'پیام ایمنی', labelEn:'Safety note' },
      { key:'conn.other.title',type:'text',     labelFa:'راه‌های دیگر — عنوان', labelEn:'Other ways — title' },
      { key:'conn.other.body', type:'text',     labelFa:'راه‌های دیگر — متن', labelEn:'Other ways — body' },
      { key:'conn.btnPearl',   type:'text',     labelFa:'دکمهٔ «گفت‌وگو با مروارید»', labelEn:'Talk with Pearl button' }
    ]},

    { group:'شرایط و سلب مسئولیت', groupEn:'Terms & Disclaimer', page:'terms.html', fields:[
      { key:'terms.head.title', type:'text',     labelFa:'عنوان صفحه', labelEn:'Page title' },
      { key:'terms.crisis',     type:'textarea', labelFa:'حمایت در بحران', labelEn:'Crisis support' },
      { key:'terms.disc.title', type:'text',     labelFa:'سلب مسئولیت — عنوان', labelEn:'Disclaimer — title' },
      { key:'terms.disc.body',  type:'textarea', labelFa:'سلب مسئولیت — متن', labelEn:'Disclaimer — body' },
      { key:'terms.btnHome',    type:'text',     labelFa:'دکمهٔ پایین', labelEn:'Bottom button' }
    ]}
  ];

  function getContent(){ return read(KEYS.content, {}); }
  function setField(key, value){ var c = getContent(); c[key] = value; return write(KEYS.content, c); }

  /* ---- Apply text/image overrides to the current public page ---- */
  function applyContent(){
    var data = getContent();
    Object.keys(data).forEach(function(key){
      var el = document.querySelector('[data-edit="' + cssEscape(key) + '"]');
      if (!el) return;
      var v = data[key];
      if (!v) return;
      if (el.tagName === 'IMG'){
        if (v.src) el.setAttribute('src', v.src);
      } else if (el.dataset.editType === 'video'){
        if (v.url) el.setAttribute('data-video-url', v.url);
      } else {
        if (v.fa != null) el.setAttribute('data-fa', v.fa);
        if (v.en != null) el.setAttribute('data-en', v.en);
      }
    });
  }
  function cssEscape(s){ return String(s).replace(/"/g, '\\"'); }

  /* ---- Google Analytics (real gtag injection when an ID is set) ---- */
  function injectAnalytics(){
    var ga = read(KEYS.ga, null);
    if (!ga || !ga.enabled || !ga.id || !/^G-[A-Z0-9]{4,}$/i.test(ga.id)) return;
    if (document.getElementById('ga-tag')) return;
    var s = document.createElement('script');
    s.async = true; s.id = 'ga-tag';
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ga.id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', ga.id);
  }

  /* ---- Session (video) overrides — merged into EPISODES by app.js ---- */
  function getSessions(){ return read(KEYS.sessions, {}); }

  /* ---- Pearl assistant (Kairos) connection — set by the admin ---- */
  function getAssistant(){
    return read(KEYS.assistant, { enabled:false, mode:'panel', url:'', code:'', fallbackFa:'', fallbackEn:'' });
  }

  window.POPContent = {
    KEYS: KEYS,
    SCHEMA: SCHEMA,
    read: read, write: write,
    getContent: getContent, setField: setField,
    getSessions: getSessions,
    getAssistant: getAssistant,
    applyContent: applyContent,
    injectAnalytics: injectAnalytics
  };

  // Run early so overrides are in place before app.js renders/translates.
  injectAnalytics();
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', applyContent);
  } else { applyContent(); }
})();
