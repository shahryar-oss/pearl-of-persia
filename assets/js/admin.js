/* =========================================================
   Pearl of Persia — Admin dashboard logic (PROTOTYPE)
   Data lives in localStorage via window.POPContent.
   ========================================================= */
(function () {
  'use strict';
  var C = window.POPContent;
  var BUST = Date.now(); // fresh-load token for fetched/previewed pages this session
  function $(s, r){ return (r||document).querySelector(s); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function flash(el, msg){ el.textContent = msg||'ذخیره شد ✓'; el.classList.add('show'); setTimeout(function(){ el.classList.remove('show'); }, 1600); }
  function toFa(n){ var d='۰۱۲۳۴۵۶۷۸۹'; return String(n).replace(/\d/g, function(x){ return d[+x]; }); }

  /* ---------- Navigation ---------- */
  var TITLES = { overview:'نمای کلی', content:'محتوای صفحات', sessions:'گفت‌وگوها و ویدئوها', analytics:'گوگل آنالیتیکس', users:'کاربران و نقش‌ها', tickets:'تیکت‌ها و درخواست‌ها', assistant:'دستیار مروارید', help:'راهنما' };
  document.getElementById('nav').addEventListener('click', function(e){
    var b = e.target.closest('.navlink'); if (!b) return;
    var p = b.dataset.panel;
    [].forEach.call(document.querySelectorAll('.navlink'), function(n){ n.classList.toggle('active', n===b); });
    [].forEach.call(document.querySelectorAll('.panel'), function(pn){ pn.classList.toggle('active', pn.id==='panel-'+p); });
    document.getElementById('panelTitle').textContent = TITLES[p] || '';
    window.scrollTo(0,0);
  });
  document.getElementById('logout').addEventListener('click', function(){ sessionStorage.removeItem('pop_admin'); location.href='login.html'; });

  /* ---------- Defaults read from each live page ---------- */
  var DEFAULTS = {}; // key -> {fa,en,src,url}
  var PAGE_OF = {};  // key -> page filename (so the preview can switch pages)
  function pagesInSchema(){
    var set = {}; C.SCHEMA.forEach(function(g){ set[g.page || 'index.html'] = 1; }); return Object.keys(set);
  }
  function loadDefaults(){
    // remember which page each field lives on
    C.SCHEMA.forEach(function(g){ g.fields.forEach(function(f){ PAGE_OF[f.key] = g.page || 'index.html'; }); });
    return Promise.all(pagesInSchema().map(function(page){
      return fetch('../' + page + '?v=' + BUST).then(function(r){ return r.text(); }).then(function(html){
        var doc = new DOMParser().parseFromString(html, 'text/html');
        [].forEach.call(doc.querySelectorAll('[data-edit]'), function(el){
          var k = el.getAttribute('data-edit');
          if (el.tagName === 'IMG') DEFAULTS[k] = { src: el.getAttribute('src') };
          else if (el.dataset.editType === 'video') DEFAULTS[k] = { url: el.getAttribute('data-video-url')||'' };
          else DEFAULTS[k] = { fa: el.getAttribute('data-fa')||'', en: el.getAttribute('data-en')||'' };
        });
      }).catch(function(){ /* page missing/offline — its fields start empty */ });
    }));
  }

  /* ---------- OVERVIEW ---------- */
  function renderOverview(){
    var content = C.getContent(); var nEdits = Object.keys(content).length;
    var sessions = C.getSessions(); var nSess = Object.keys(sessions).length;
    var ga = C.read(C.KEYS.ga, null);
    var users = C.read(C.KEYS.users, null) || [];
    $('#panel-overview').innerHTML =
      '<div class="notice notice-info" style="margin-bottom:1.1rem">به پنل مدیریت محتوای پرل آو پرشیا خوش آمدید. اینجا می‌توانید متن‌ها، عکس‌ها و ویدئوها را تغییر دهید — بدون نیاز به برنامه‌نویس.</div>' +
      '<div class="grid-kpi" style="margin-bottom:1.2rem">' +
        kpi(toFa(nEdits), 'بخش‌های ویرایش‌شده') +
        kpi(toFa(nSess)+'/۲۶', 'گفت‌وگوهای سفارشی‌شده') +
        kpi(ga&&ga.id?'فعال':'خاموش', 'گوگل آنالیتیکس') +
        kpi(toFa((users.length||2)), 'کاربران') +
      '</div>' +
      '<div class="card"><h3>چه چیزی را می‌توانید تغییر دهید؟</h3>' +
        '<div class="notice notice-info" style="margin:.4rem 0">✓ متن‌ها و عنوان‌ها · ✓ عکس‌ها · ✓ ویدئوها · ✓ توضیح هر گفت‌وگو · ✓ کاربرگ‌ها</div>' +
        '<div class="notice notice-lock">قفل‌شده (فقط توسعه‌دهنده): چیدمان صفحه، فونت‌ها، رنگ‌ها، طراحی و جای‌گذاری عناصر — تا ظاهر و هویت برند همیشه یک‌دست بماند.</div>' +
      '</div>' +
      '<div class="card"><h3>شروع سریع</h3><div style="display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.4rem">' +
        '<button class="btn btn-gold btn-sm" data-go="content">ویرایش متن و عکس صفحه‌ها</button>' +
        '<button class="btn btn-soft btn-sm" data-go="sessions">مدیریت گفت‌وگوها و ویدئوها</button>' +
        '<button class="btn btn-soft btn-sm" data-go="analytics">اتصال گوگل آنالیتیکس</button>' +
      '</div></div>';
    [].forEach.call($('#panel-overview').querySelectorAll('[data-go]'), function(b){
      b.addEventListener('click', function(){ document.querySelector('.navlink[data-panel="'+b.dataset.go+'"]').click(); });
    });
  }
  function kpi(n,l){ return '<div class="kpi"><div class="n">'+n+'</div><div class="l">'+l+'</div></div>'; }

  /* ---------- CONTENT EDITOR ---------- */
  function curVal(key){ var o = C.getContent()[key]; var d = DEFAULTS[key]||{}; return {
    fa: (o&&o.fa!=null)?o.fa:(d.fa||''), en:(o&&o.en!=null)?o.en:(d.en||''),
    src:(o&&o.src)?o.src:(d.src||''), url:(o&&o.url!=null)?o.url:(d.url||''),
    overridden: !!o }; }

  var previewLang = 'fa';
  function cssid(k){ return k.replace(/[^a-z0-9]/gi,'_'); }
  function cssAttr(k){ return k.replace(/"/g,'\\"'); }

  function renderContent(){
    var pages = pagesInSchema();
    var pageNames = { 'index.html':'خانه', 'start-here.html':'از اینجا شروع کنید', 'journey.html':'مسیر', 'grounding.html':'آرامش و حمایت', 'about.html':'دربارهٔ ما', 'connection.html':'ارتباط انسانی', 'terms.html':'شرایط' };
    var fieldsHtml = '<p class="autosave-tag" style="margin:.2rem 0 1rem">✓ هر تغییری همان لحظه ذخیره می‌شود و در پیش‌نمایش سمت چپ دیده می‌شود.</p>';
    C.SCHEMA.forEach(function(group, gi){
      fieldsHtml += '<details class="editor-group" data-page="'+esc(group.page||'index.html')+'"'+(gi===0?' open':'')+'><summary><span>'+esc(group.group)+' <span class="muted tiny">'+esc(group.groupEn)+'</span></span><span class="muted tiny">'+group.fields.length+'</span></summary><div class="editor-body">';
      group.fields.forEach(function(f){ fieldsHtml += fieldHtml(f); });
      fieldsHtml += '</div></details>';
    });
    var opts = pages.map(function(p){ return '<option value="'+p+'">'+(pageNames[p]||p)+'</option>'; }).join('');
    var previewHtml =
      '<div class="preview-pane">'+
        '<div class="preview-bar">'+
          '<select id="pvPage">'+opts+'</select>'+
          '<span class="seg"><button id="pvFa" class="on">فا</button><button id="pvEn">EN</button></span>'+
          '<a class="btn btn-soft btn-sm" id="pvOpen" href="../index.html" target="_blank">باز ↗</a>'+
        '</div>'+
        '<iframe class="preview-frame" id="pvFrame" src="../index.html?v='+BUST+'"></iframe>'+
        '<div class="preview-hint">پیش‌نمایش زنده — وقتی روی یک فیلد کلیک کنید، صفحهٔ مربوط به آن اینجا باز می‌شود.</div>'+
      '</div>';
    $('#panel-content').innerHTML = '<div class="editor-layout"><div class="editor-fields">'+fieldsHtml+'</div>'+previewHtml+'</div>';
    wireContent();
    wirePreview();
  }

  function fieldHtml(f){
    var v = curVal(f.key);
    var head = '<div class="efhead"><b>'+esc(f.labelFa)+' <span class="muted tiny">'+esc(f.labelEn)+'</span></b>'+
      '<span style="display:flex;gap:.6rem;align-items:center"><span class="saved-flash" id="flash-'+cssid(f.key)+'">ذخیره شد ✓</span>'+
      '<button class="btn btn-soft btn-sm" data-reset="'+esc(f.key)+'">بازگردانی</button></span></div>';
    var body = '';
    if (f.type === 'image'){
      body = '<div class="img-row" data-field="'+esc(f.key)+'">'+
        '<img class="thumb" id="thumb-'+cssid(f.key)+'" src="'+esc(v.src)+'" alt="">'+
        '<div style="flex:1; min-width:200px">'+
          '<label>بارگذاری عکس تازه</label>'+
          '<input type="file" accept="image/*" data-imgfile="'+esc(f.key)+'">'+
          '<input type="url" style="margin-top:.4rem" placeholder="یا نشانی عکس https://…" data-imgurl="'+esc(f.key)+'" value="'+esc(/^https?:|^assets\//.test(v.src)?v.src:'')+'">'+
        '</div></div>';
    } else if (f.type === 'video'){
      body = '<div data-field="'+esc(f.key)+'"><input type="url" data-vidurl="'+esc(f.key)+'" dir="ltr" placeholder="https://… (MP4 / یوتیوب / ویمئو)" value="'+esc(v.url)+'"></div>';
    } else {
      var faIn = f.type==='textarea' ? '<textarea data-fa="'+esc(f.key)+'">'+esc(v.fa)+'</textarea>' : '<input type="text" data-fa="'+esc(f.key)+'" value="'+esc(v.fa)+'">';
      var enIn = f.type==='textarea' ? '<textarea data-en="'+esc(f.key)+'" dir="ltr">'+esc(v.en)+'</textarea>' : '<input type="text" dir="ltr" data-en="'+esc(f.key)+'" value="'+esc(v.en)+'">';
      body = '<div class="row2" data-field="'+esc(f.key)+'">'+
        '<div><label><span class="lang-tag">فارسی</span></label>'+faIn+'</div>'+
        '<div><label><span class="lang-tag">English</span></label>'+enIn+'</div></div>';
    }
    return '<div class="edit-field" id="ef-'+cssid(f.key)+'" data-key="'+esc(f.key)+'" data-page="'+esc(PAGE_OF[f.key]||'index.html')+'">'+head+body+'</div>';
  }

  /* ---- live preview helpers ---- */
  function pvFrame(){ return document.getElementById('pvFrame'); }
  function applyToPreview(){
    var fr = pvFrame(); if (!fr) return; var w = fr.contentWindow;
    try { if (w && w.POPContent && w.applyLang && w.POP){ w.POPContent.applyContent(); w.applyLang(previewLang); } } catch(e){}
  }
  function setPreviewPage(page){
    var fr = pvFrame(); if (!fr) return;
    var want = '../' + page + '?v=' + BUST;
    var openLink = document.getElementById('pvOpen'); if (openLink) openLink.setAttribute('href', '../' + page);
    var sel = document.getElementById('pvPage'); if (sel && sel.value !== page) sel.value = page;
    if (fr.getAttribute('src') === want) { applyToPreview(); return; }
    fr.onload = function(){ applyToPreview(); };
    fr.setAttribute('src', want);
  }
  function wirePreview(){
    var fr = pvFrame(); if (fr) fr.onload = function(){ applyToPreview(); };
    var sel = document.getElementById('pvPage');
    if (sel) sel.addEventListener('change', function(){ setPreviewPage(sel.value); });
    var fa = document.getElementById('pvFa'), en = document.getElementById('pvEn');
    if (fa) fa.addEventListener('click', function(){ previewLang='fa'; fa.classList.add('on'); en.classList.remove('on'); applyToPreview(); });
    if (en) en.addEventListener('click', function(){ previewLang='en'; en.classList.add('on'); fa.classList.remove('on'); applyToPreview(); });
  }
  var saveTimer;
  function autosaveText(k, fa, en){ C.setField(k, { fa:fa, en:en }); flash($('#flash-'+cssid(k))); scheduleApply(); }
  function scheduleApply(){ clearTimeout(saveTimer); saveTimer = setTimeout(applyToPreview, 180); }
  function ensurePreviewForKey(k){ var p = PAGE_OF[k]||'index.html'; setPreviewPage(p); }

  function wireContent(){
    var root = $('#panel-content');
    // when a field gains focus, show its page in the preview
    [].forEach.call(root.querySelectorAll('.edit-field'), function(ef){
      ef.addEventListener('focusin', function(){ ensurePreviewForKey(ef.getAttribute('data-key')); });
    });
    // text: autosave on input
    [].forEach.call(root.querySelectorAll('[data-fa],[data-en]'), function(inp){
      inp.addEventListener('input', function(){
        var k = inp.getAttribute('data-fa') || inp.getAttribute('data-en');
        var fa = (root.querySelector('[data-fa="'+cssAttr(k)+'"]')||{}).value || '';
        var en = (root.querySelector('[data-en="'+cssAttr(k)+'"]')||{}).value || '';
        ensurePreviewForKey(k);
        autosaveText(k, fa, en);
      });
    });
    // image URL: autosave on input
    [].forEach.call(root.querySelectorAll('[data-imgurl]'), function(inp){
      inp.addEventListener('input', function(){
        var k = inp.getAttribute('data-imgurl'); var url = inp.value.trim();
        if (url){ C.setField(k, { src:url }); $('#thumb-'+cssid(k)).src = url; flash($('#flash-'+cssid(k))); ensurePreviewForKey(k); scheduleApply(); }
      });
    });
    // image file -> dataURL autosave
    [].forEach.call(root.querySelectorAll('[data-imgfile]'), function(inp){
      inp.addEventListener('change', function(){
        var k = inp.getAttribute('data-imgfile'); var file = inp.files[0]; if (!file) return;
        if (file.size > 2*1024*1024){ if(!confirm('این عکس بزرگ است (بیش از ۲ مگابایت). در نمونهٔ اولیه ممکن است ذخیره نشود. ادامه می‌دهید؟')){ inp.value=''; return; } }
        var reader = new FileReader();
        reader.onload = function(){
          try { C.setField(k, { src: reader.result }); $('#thumb-'+cssid(k)).src = reader.result; flash($('#flash-'+cssid(k)), 'بارگذاری شد ✓'); ensurePreviewForKey(k); scheduleApply(); }
          catch(e){ alert('ذخیره نشد — عکس برای حافظهٔ مرورگر بزرگ است. در نسخهٔ نهایی روی سرور ذخیره می‌شود.'); }
        };
        reader.readAsDataURL(file);
      });
    });
    // video URL autosave
    [].forEach.call(root.querySelectorAll('[data-vidurl]'), function(inp){
      inp.addEventListener('input', function(){
        var k = inp.getAttribute('data-vidurl'); C.setField(k, { url: inp.value.trim() }); flash($('#flash-'+cssid(k))); ensurePreviewForKey(k); scheduleApply();
      });
    });
    // reset one field
    [].forEach.call(root.querySelectorAll('[data-reset]'), function(b){
      b.addEventListener('click', function(){
        var k = b.getAttribute('data-reset'); var c = C.getContent(); delete c[k]; C.write(C.KEYS.content, c);
        renderContent(); setPreviewPage(PAGE_OF[k]||'index.html');
      });
    });
  }

  /* ---------- SESSIONS ---------- */
  // Stella's final 6 groups (14 Jul 2026) — keep in sync with app.js CLUSTERS
  var CLUSTERS = [
    { fa:'مبانی: امنیت، آرامش، و معنا', en:'Foundations: Safety, Calm, and Meaning', range:[1,2] },
    { fa:'درک آنچه در درون ما در حال رخ دادن است', en:'Understanding What Is Happening Inside Us', range:[3,10] },
    { fa:'وقتی درد بیش از حد سنگین می‌شود', en:'When the Pain Feels Too Much', range:[11,12] },
    { fa:'رابطه‌ها زیر فشار', en:'Relationships Under Pressure', range:[13,23] },
    { fa:'یکپارچه‌سازی تروما', en:'Trauma Integration', range:[24,25] },
    { fa:'هویت، ارزشمندی، و ادامه دادن زندگی', en:'Identity, Worth, and Continuing to Live', range:[26,26] }
  ];
  function clusterOf(n){ for (var i=0;i<CLUSTERS.length;i++){ if (n>=CLUSTERS[i].range[0] && n<=CLUSTERS[i].range[1]) return CLUSTERS[i]; } return CLUSTERS[0]; }
  function sessDefault(n){
    var t = (window.EP_TITLES || {})[n] || {};
    return { titleFa: t.fa || ('گفت‌وگوی '+toFa(n)), titleEn: t.en || ('Conversation '+n),
             subFa: t.subFa || '', subEn: t.subEn || '',
             descFa:'', descEn:'', length:12+(n%4), videoUrl:'', worksheetUrl:'' };
  }

  // Maps a form section key → the EP_RICH field base it mirrors.
  var SEC_BASE = { w:'welcome', p:'pause', s1:'step1', s2:'step2', s4:'step4', q:'questions', sp:'spiritual', th:'think' };

  // The site stores default text as HTML; the editor works in plain text.
  // Turn HTML back into the same simple text conventions textToHtml expects.
  function htmlToText(html){
    if (!html) return '';
    var s = String(html);
    s = s.replace(/<li>\s*/gi, '\n').replace(/<\/li>/gi, '');
    s = s.replace(/<\/(p|div|h[1-6]|ul|ol)>/gi, '\n\n');
    s = s.replace(/<br\s*\/?>/gi, '\n');
    s = s.replace(/<[^>]+>/g, '');
    s = s.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/&zwnj;/g,'‌');
    s = s.replace(/[ \t]+\n/g,'\n').replace(/\n{3,}/g,'\n\n');
    return s.replace(/^\s+|\s+$/g,'');
  }

  // Worked-example seed: prefill a form from the site's built-in default content
  // (EP_RICH) so an episode like #1 opens already written out, ready to edit.
  function sessSeed(n){
    var r = (window.EP_RICH || {})[n]; if (!r) return {};
    var seed = {};
    for (var k in SEC_BASE){
      var base = SEC_BASE[k];
      if (r[base+'Title'])   seed[k+'_titleFa'] = r[base+'Title'];
      if (r[base+'TitleEn']) seed[k+'_titleEn'] = r[base+'TitleEn'];
      if (r[base+'Html'])    seed[k+'_bodyFa']  = htmlToText(r[base+'Html']);
      if (r[base+'HtmlEn'])  seed[k+'_bodyEn']  = htmlToText(r[base+'HtmlEn']);
    }
    return seed;
  }

  // Rich page sections per episode (Stella's structure). Empty field = the site keeps
  // its current/default text; filled field = replaces it. Bodies are plain text.
  var RICH_SECTIONS = [
    { k:'w',  labelFa:'خوش‌آمدید (بالای ویدئو)' },
    { k:'p',  labelFa:'مکثی پس از تماشا' },
    { k:'s1', labelFa:'گام اول — تمرین آرام‌سازی', breathe:true },
    { k:'s2', labelFa:'گام دوم — یک قدم کوچک برای این هفته' },
    { k:'s4', labelFa:'گام چهارم — ادامهٔ مسیر (متن پایانی)' },
    { k:'q',  labelFa:'پرسش‌های تأمل (هر پرسش در یک خط)' },
    { k:'sp', labelFa:'کاوش و تأمل روحانی' },
    { k:'th', labelFa:'کمی فکر کنید (داخل بخش روحانی)' }
  ];

  function sessBodyHtml(n){
    var ov = C.getSessions(); var o = ov[n]||ov[String(n)]||{};
    var d = sessDefault(n);
    var seed = sessSeed(n);
    // Field value = saved override if present, else the worked-example seed.
    function fv(key){ return esc(o[key] != null ? o[key] : (seed[key] || '')); }
    var hasDefault = !!(window.EP_RICH && window.EP_RICH[n]);
    var breatheDefault = hasDefault ? !!window.EP_RICH[n].breatheCircle : false;
    var breatheOn = (o.breatheCircle != null && o.breatheCircle !== '') ? o.breatheCircle === '1' : breatheDefault;
    var html =
      '<div class="row2">'+
        '<div class="field"><label>عنوان قسمت (فارسی)</label><input type="text" data-s="titleFa" value="'+esc(o.titleFa!=null?o.titleFa:d.titleFa)+'"></div>'+
        '<div class="field"><label>Episode title (English)</label><input type="text" dir="ltr" data-s="titleEn" value="'+esc(o.titleEn!=null?o.titleEn:d.titleEn)+'"></div>'+
      '</div>'+
      '<div class="row2">'+
        '<div class="field"><label>زیرعنوان (فارسی — اختیاری)</label><input type="text" data-s="subFa" value="'+esc(o.subFa!=null?o.subFa:d.subFa)+'"></div>'+
        '<div class="field"><label>Subtitle (English — optional)</label><input type="text" dir="ltr" data-s="subEn" value="'+esc(o.subEn!=null?o.subEn:d.subEn)+'"></div>'+
      '</div>'+
      '<div class="row2">'+
        '<div class="field"><label>مدت (دقیقه)</label><input type="text" data-s="length" value="'+esc(o.length!=null?o.length:d.length)+'"></div>'+
        '<div class="field"><label>نشانی ویدئو (MP4 / یوتیوب / ویمئو)</label><input type="url" dir="ltr" data-s="videoUrl" placeholder="https://…" value="'+esc(o.videoUrl||'')+'"></div>'+
      '</div>'+
      '<div class="field"><label>نشانی کاربرگ (PDF — اختیاری)</label><input type="url" dir="ltr" data-s="worksheetUrl" placeholder="https://…" value="'+esc(o.worksheetUrl||'')+'"></div>'+
      '<div class="notice notice-info tiny" style="margin:.6rem 0 1rem">'+
        (hasDefault
          ? 'این قسمت به‌عنوان «نمونه» با متن آماده پُر شده است تا ببینید هر بخش چگونه نوشته می‌شود. متن را بخوانید، هرجا خواستید تغییر دهید و «ذخیره» کنید. پاراگراف‌ها را با یک خط خالی جدا کنید؛ در بخش پرسش‌ها هر پرسش را در یک خط بنویسید.'
          : 'متن هر بخش را اینجا بنویسید. پاراگراف‌ها را با یک خط خالی جدا کنید؛ در بخش پرسش‌ها هر پرسش را در یک خط بنویسید. اگر عنوان بخش را خالی بگذارید، عنوان استاندارد استفاده می‌شود. (می‌توانید قسمت اول را باز کنید تا یک نمونهٔ کامل ببینید.)')+
      '</div>';
    RICH_SECTIONS.forEach(function(sec){
      html += '<div style="border-top:1px dashed var(--line); padding-top:.9rem; margin-top:.9rem">'+
        '<b style="color:var(--gold-deep)">'+esc(sec.labelFa)+'</b>'+
        (sec.breathe ? ' <label style="display:inline-flex; gap:.35rem; align-items:center; font-weight:500; margin-inline-start:.8rem"><input type="checkbox" data-s="breatheCircle" data-checkbox="1" '+(breatheOn?'checked':'')+' style="width:auto"> نمایش دایرهٔ تنفس</label>' : '')+
        '<div class="row2" style="margin-top:.5rem">'+
          '<div class="field"><label>عنوان بخش (فارسی — اختیاری)</label><input type="text" data-s="'+sec.k+'_titleFa" value="'+fv(sec.k+'_titleFa')+'"></div>'+
          '<div class="field"><label>Section title (English — optional)</label><input type="text" dir="ltr" data-s="'+sec.k+'_titleEn" value="'+fv(sec.k+'_titleEn')+'"></div>'+
        '</div>'+
        '<div class="row2">'+
          '<div class="field"><label>متن (فارسی)</label><textarea data-s="'+sec.k+'_bodyFa">'+fv(sec.k+'_bodyFa')+'</textarea></div>'+
          '<div class="field"><label>Text (English)</label><textarea dir="ltr" data-s="'+sec.k+'_bodyEn">'+fv(sec.k+'_bodyEn')+'</textarea></div>'+
        '</div>'+
      '</div>';
    });
    html += '<div style="display:flex; gap:.6rem; align-items:center; margin-top:1rem; position:sticky; bottom:0; background:#fffdfb; padding:.6rem 0">'+
      '<button class="btn btn-gold" data-ssave="'+n+'">ذخیرهٔ این قسمت</button>'+
      '<a class="btn btn-soft btn-sm" href="../session.html?ep='+n+'" target="_blank">مشاهده ↗</a>'+
      '<span class="saved-flash" id="sflash-'+n+'">ذخیره شد ✓</span></div>';
    return html;
  }

  function wireSessSave(row, n){
    var b = row.querySelector('[data-ssave]');
    b.addEventListener('click', function(){
      var body = b.closest('.sess-body'); var obj = {};
      [].forEach.call(body.querySelectorAll('[data-s]'), function(inp){
        var key = inp.getAttribute('data-s');
        if (inp.getAttribute('data-checkbox')){ obj[key] = inp.checked ? '1' : '0'; return; }
        var val = inp.value.trim();
        if (key==='length') val = val.replace(/[^\d۰-۹]/g,'') || '';
        obj[key] = val;
      });
      var all = C.getSessions(); all[n] = obj; C.write(C.KEYS.sessions, all);
      flash($('#sflash-'+n));
    });
  }

  function renderSessions(){
    var ov = C.getSessions();
    var html = '<div class="notice notice-info" style="margin-bottom:1rem">برای هر یک از ۲۶ قسمت می‌توانید همهٔ متن‌های صفحه (خوش‌آمد، مکث، گام‌ها، پرسش‌ها، بخش روحانی)، عنوان، مدت و نشانی ویدئو را تعیین کنید. ترتیب بخش‌ها و قفلِ مرحله‌ای ثابت می‌ماند. ویدئوها با «لینک» اضافه می‌شوند؛ بارگذاری مستقیم فایل در نسخهٔ نهایی (روی سرور) فراهم می‌شود.</div>';
    for (var n=1; n<=26; n++){
      var d = sessDefault(n); var o = ov[n]||ov[String(n)]||{};
      var titleFa = o.titleFa||d.titleFa; var cl = clusterOf(n);
      var hasVid = (o.videoUrl&&o.videoUrl.length) ? '🎬' : '';
      var hasContent = (window.EP_RICH && window.EP_RICH[n]) || o.w_bodyFa || o.p_bodyFa;
      html += '<details class="sess-row" data-ep="'+n+'"><summary>'+
        '<span class="badge">'+toFa(n)+'</span><b>'+esc(titleFa)+'</b> '+hasVid+(hasContent?' <span class="tiny" style="color:var(--ok); font-weight:700">متن ✓</span>':'')+
        '<span class="cl">'+esc(cl.fa)+'</span></summary>'+
        '<div class="sess-body" data-sess="'+n+'"><p class="muted tiny">در حال آماده‌سازی فرم…</p></div></details>';
    }
    $('#panel-sessions').innerHTML = html;
    // build each episode's form lazily on first open (keeps the page fast)
    [].forEach.call($('#panel-sessions').querySelectorAll('.sess-row'), function(row){
      row.addEventListener('toggle', function(){
        if (!row.open || row.dataset.built) return;
        row.dataset.built = '1';
        var n = row.getAttribute('data-ep');
        row.querySelector('.sess-body').innerHTML = sessBodyHtml(n);
        wireSessSave(row, n);
      });
    });
  }

  /* ---------- ANALYTICS ---------- */
  function renderAnalytics(){
    var ga = C.read(C.KEYS.ga, { id:'', enabled:false });
    $('#panel-analytics').innerHTML =
      '<div class="card"><h3>اتصال به گوگل آنالیتیکس (GA4)</h3>'+
      '<p class="muted">شناسهٔ اندازه‌گیری (Measurement ID) خود را از حساب گوگل آنالیتیکس کپی کنید و اینجا بچسبانید. به‌شکل <b dir="ltr">G-XXXXXXXXXX</b> است. پس از ذخیره، کد ردیابی به‌صورت خودکار در همهٔ صفحه‌های سایت قرار می‌گیرد.</p>'+
      '<div class="field" style="max-width:340px"><label>Measurement ID</label><input type="text" id="gaId" dir="ltr" placeholder="G-XXXXXXXXXX" value="'+esc(ga.id||'')+'"></div>'+
      '<label style="display:flex; gap:.5rem; align-items:center; font-weight:500"><input type="checkbox" id="gaEnabled" '+(ga.enabled?'checked':'')+' style="width:auto"> فعال باشد</label>'+
      '<div style="display:flex; gap:.6rem; align-items:center; margin-top:1rem"><button class="btn btn-gold" id="gaSave">ذخیره و اتصال</button><span class="saved-flash" id="gaFlash">ذخیره شد ✓</span></div>'+
      '<div id="gaStatus" style="margin-top:1rem"></div>'+
      '</div>'+
      '<div class="notice notice-warn">نکته: ردیابی فقط وقتی داده ثبت می‌کند که سایت روی یک دامنهٔ واقعی منتشر شده باشد. روی این نسخهٔ آزمایشی، کد بارگذاری می‌شود اما گوگل بازدیدها را از localhost نادیده می‌گیرد.</div>';
    function status(){
      var g = C.read(C.KEYS.ga, {id:'',enabled:false});
      var ok = g.enabled && /^G-[A-Z0-9]{4,}$/i.test(g.id);
      $('#gaStatus').innerHTML = '<div class="notice '+(ok?'notice-info':'notice-lock')+'">وضعیت: '+(ok?('متصل ✓ — کد <b dir="ltr">'+esc(g.id)+'</b> روی همهٔ صفحه‌ها بارگذاری می‌شود.'):'هنوز متصل نیست.')+'</div>';
    }
    status();
    $('#gaSave').addEventListener('click', function(){
      var id = $('#gaId').value.trim(); var enabled = $('#gaEnabled').checked;
      if (enabled && !/^G-[A-Z0-9]{4,}$/i.test(id)){ alert('شناسه باید به شکل G-XXXXXXXX باشد.'); return; }
      C.write(C.KEYS.ga, { id:id, enabled:enabled }); flash($('#gaFlash')); status();
    });
  }

  /* ---------- USERS & ROLES ---------- */
  var ROLE_LABEL = { admin:'مدیر کل', manager:'مدیر محتوا', editor:'ویراستار' };
  var ROLE_PILL  = { admin:'pill-admin', manager:'pill-manager', editor:'pill-editor' };
  function seedUsers(){ return [
    { id:'u1', name:'مدیر اصلی', email:'admin@pearlofpersia', role:'admin', active:true },
    { id:'u2', name:'استلا — مدیر محتوا', email:'stella@pearlofpersia', role:'manager', active:true }
  ]; }
  function getUsers(){ var u = C.read(C.KEYS.users, null); if (!u){ u = seedUsers(); C.write(C.KEYS.users, u); } return u; }

  function renderUsers(){
    var users = getUsers();
    var rows = users.map(function(u){
      return '<tr><td><b>'+esc(u.name)+'</b><br><span class="muted tiny" dir="ltr">'+esc(u.email)+'</span></td>'+
        '<td><span class="pill '+ROLE_PILL[u.role]+'">'+ROLE_LABEL[u.role]+'</span></td>'+
        '<td><span class="pill '+(u.active?'pill-manager':'pill-off')+'">'+(u.active?'فعال':'غیرفعال')+'</span></td>'+
        '<td style="text-align:end; white-space:nowrap">'+
          '<button class="btn btn-soft btn-sm" data-toggle="'+u.id+'">'+(u.active?'غیرفعال':'فعال')+'</button> '+
          '<button class="btn btn-danger btn-sm" data-del="'+u.id+'">حذف</button>'+
        '</td></tr>';
    }).join('');
    $('#panel-users').innerHTML =
      '<div class="notice notice-warn" style="margin-bottom:1rem">این بخش نمایشی است؛ حساب‌ها و گذرواژه‌های واقعی در نسخهٔ نهایی روی سرور امن ساخته می‌شوند. اینجا فقط مدل نقش‌ها و دسترسی‌ها را می‌بینید و تأیید می‌کنید.</div>'+
      '<div class="card"><h3>کاربران</h3><table><thead><tr><th>کاربر</th><th>نقش</th><th>وضعیت</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
      '<div class="card"><h3>افزودن کاربر</h3><div class="row2">'+
        '<div class="field"><label>نام</label><input type="text" id="nuName" placeholder="نام و نام خانوادگی"></div>'+
        '<div class="field"><label>ایمیل</label><input type="email" id="nuEmail" dir="ltr" placeholder="name@example.com"></div>'+
      '</div><div class="row2"><div class="field"><label>نقش</label><select id="nuRole">'+
        '<option value="manager">مدیر محتوا — متن، عکس، ویدئو</option>'+
        '<option value="editor">ویراستار — فقط متن</option>'+
        '<option value="admin">مدیر کل — همه‌چیز + کاربران و آنالیتیکس</option>'+
      '</select></div><div class="field" style="display:flex; align-items:end"><button class="btn btn-gold" id="nuAdd" style="width:100%; justify-content:center">افزودن کاربر</button></div></div></div>'+
      rolesMatrix();
    // wire
    [].forEach.call($('#panel-users').querySelectorAll('[data-del]'), function(b){ b.addEventListener('click', function(){
      if(!confirm('این کاربر حذف شود؟')) return;
      C.write(C.KEYS.users, getUsers().filter(function(u){ return u.id!==b.getAttribute('data-del'); })); renderUsers();
    }); });
    [].forEach.call($('#panel-users').querySelectorAll('[data-toggle]'), function(b){ b.addEventListener('click', function(){
      var us = getUsers().map(function(u){ if(u.id===b.getAttribute('data-toggle')) u.active=!u.active; return u; }); C.write(C.KEYS.users, us); renderUsers();
    }); });
    $('#nuAdd').addEventListener('click', function(){
      var name=$('#nuName').value.trim(), email=$('#nuEmail').value.trim(), role=$('#nuRole').value;
      if(!name||!email){ alert('نام و ایمیل لازم است.'); return; }
      var us = getUsers(); us.push({ id:'u'+Date.now(), name:name, email:email, role:role, active:true }); C.write(C.KEYS.users, us); renderUsers();
    });
  }
  function rolesMatrix(){
    function row(label, a, m, e){ return '<tr><td>'+label+'</td><td>'+yn(a)+'</td><td>'+yn(m)+'</td><td>'+yn(e)+'</td></tr>'; }
    function yn(v){ return v?'<span class="yes">✓</span>':'<span class="no">—</span>'; }
    return '<div class="card"><h3>نقش‌ها و دسترسی‌ها</h3><table class="matrix"><thead><tr><th>اجازه</th><th>مدیر کل</th><th>مدیر محتوا</th><th>ویراستار</th></tr></thead><tbody>'+
      row('ویرایش متن و عنوان‌ها', 1,1,1)+
      row('تغییر عکس‌ها', 1,1,0)+
      row('بارگذاری/تغییر ویدئوها', 1,1,0)+
      row('مدیریت گوگل آنالیتیکس', 1,0,0)+
      row('مدیریت کاربران و نقش‌ها', 1,0,0)+
      row('چیدمان، فونت، رنگ، طراحی', 0,0,0)+
      '</tbody></table><p class="muted tiny" style="margin-top:.6rem">ردیف آخر برای همه قفل است؛ طراحی و هویت برند فقط توسط توسعه‌دهنده تغییر می‌کند.</p></div>';
  }

  /* ---------- TICKETS (change requests → saved as files on the server) ---------- */
  var TK_ST = { open:'باز', in_progress:'در حال انجام', resolved:'انجام شد' };
  var TK_CAT = { change:'تغییر متن', video:'ویدئو', photo:'عکس', bug:'اشکال', suggestion:'پیشنهاد', other:'دیگر' };

  function renderTickets(){
    var root = $('#panel-tickets');
    root.innerHTML = '<div class="card"><p class="muted">در حال بررسی سرور تیکت‌ها…</p></div>';
    fetch('../api/ping').then(function(r){ return r.json(); }).then(function(){
      root.innerHTML =
        '<div class="notice notice-info" style="margin-bottom:1rem">درخواست تغییر یا اشکال را اینجا ثبت کنید — می‌توانید فایل Word یا PDF هم پیوست کنید. درخواست‌ها به‌صورت فایل روی همین سیستم ذخیره می‌شوند تا دستیار (Claude) بتواند مستقیم آن‌ها را بخواند و انجام دهد.</div>'+
        '<div class="card"><h3>ثبت درخواست تازه</h3>'+
          '<div class="row2">'+
            '<div class="field"><label>نام شما</label><input type="text" id="tkName" placeholder="مثلاً استلا یا لانا"></div>'+
            '<div class="field"><label>نوع درخواست</label><select id="tkCat">'+
              '<option value="change">تغییر متن</option><option value="video">ویدئو</option><option value="photo">عکس</option>'+
              '<option value="bug">اشکال</option><option value="suggestion">پیشنهاد</option><option value="other">دیگر</option>'+
            '</select></div>'+
          '</div>'+
          '<div class="field"><label>عنوان درخواست</label><input type="text" id="tkSubject" placeholder="مثلاً: متن قسمت ۳ را جایگزین کنید"></div>'+
          '<div class="field"><label>توضیح</label><textarea id="tkBody" placeholder="هرچه دقیق‌تر بنویسید، سریع‌تر انجام می‌شود…"></textarea></div>'+
          '<div class="field"><label>پیوست (Word / PDF — اختیاری، تا ۵ فایل)</label><input type="file" id="tkFiles" multiple accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"></div>'+
          '<div style="display:flex; gap:.6rem; align-items:center"><button class="btn btn-gold" id="tkSend">ثبت تیکت</button><span class="saved-flash" id="tkFlash">ثبت شد ✓</span></div>'+
        '</div>'+
        '<div class="card"><h3 style="display:flex; justify-content:space-between; align-items:center">تیکت‌ها <select id="tkFilter" style="width:auto; font-size:.85rem"><option value="">همه</option><option value="open">باز</option><option value="in_progress">در حال انجام</option><option value="resolved">انجام شد</option></select></h3>'+
          '<div id="tkList"><p class="muted">در حال بارگذاری…</p></div>'+
        '</div>';
      wireTicketForm(); loadTickets();
      $('#tkFilter').addEventListener('change', loadTickets);
    }).catch(function(){
      root.innerHTML = '<div class="notice notice-warn">سرور تیکت‌ها در دسترس نیست. سایت را با «Start Pearl Website» (فایل داخل پوشهٔ پروژه) دوباره راه‌اندازی کنید تا ثبت تیکت و پیوست فایل فعال شود.</div>';
    });
  }

  function wireTicketForm(){
    $('#tkSend').addEventListener('click', function(){
      var subject = $('#tkSubject').value.trim();
      if (!subject){ alert('عنوان درخواست لازم است.'); return; }
      var fd = new FormData();
      fd.append('name', $('#tkName').value.trim());
      fd.append('category', $('#tkCat').value);
      fd.append('subject', subject);
      fd.append('body', $('#tkBody').value.trim());
      var files = $('#tkFiles').files;
      for (var i=0; i<files.length && i<5; i++) fd.append('attachments', files[i], files[i].name);
      $('#tkSend').disabled = true;
      fetch('../api/tickets', { method:'POST', body: fd })
        .then(function(r){ return r.json(); })
        .then(function(res){
          $('#tkSend').disabled = false;
          if (res && res.ok){ flash($('#tkFlash'), 'ثبت شد ✓ — '+res.ticket.id); $('#tkSubject').value=''; $('#tkBody').value=''; $('#tkFiles').value=''; loadTickets(); }
          else alert('ثبت نشد: '+((res&&res.error)||'خطا'));
        })
        .catch(function(){ $('#tkSend').disabled=false; alert('اتصال به سرور برقرار نشد.'); });
    });
  }

  function loadTickets(){
    var box = $('#tkList'); if (!box) return;
    fetch('../api/tickets').then(function(r){ return r.json(); }).then(function(data){
      var filter = ($('#tkFilter')||{}).value || '';
      var list = (data.tickets||[]).filter(function(t){ return !filter || t.status===filter; });
      if (!list.length){ box.innerHTML = '<p class="muted">تیکتی نیست.</p>'; return; }
      box.innerHTML = list.map(function(t){
        var atts = (t.attachments||[]).map(function(a,i){
          return '<a class="tk-att" href="../api/tickets/'+t.id+'/file/'+i+'">📎 '+esc(a.file)+'</a>';
        }).join('');
        var replies = (t.replies||[]).map(function(r){
          return '<div class="tk-reply"><b>'+esc(r.author)+'</b> <span class="muted">'+esc(r.at)+'</span><br>'+esc(r.body)+'</div>';
        }).join('');
        return '<details class="tk-row"><summary>'+
          '<span class="badge">'+esc(t.id)+'</span><b>'+esc(t.subject)+'</b>'+
          '<span class="pill pill-editor">'+esc(TK_CAT[t.category]||t.category)+'</span>'+
          '<span class="pill tk-'+esc(t.status)+'">'+esc(TK_ST[t.status]||t.status)+'</span>'+
          '<span class="cl">'+esc(t.name||'')+' · '+esc(t.created)+'</span></summary>'+
          '<div class="tk-detail">'+
            (t.body ? '<div class="tk-body">'+esc(t.body)+'</div>' : '')+
            (atts ? '<div style="margin-top:.6rem">'+atts+'</div>' : '')+
            (replies ? '<div style="margin-top:.8rem">'+replies+'</div>' : '')+
            '<div class="row2" style="margin-top:.9rem"><div class="field"><input type="text" data-tkauthor="'+esc(t.id)+'" placeholder="نام"></div>'+
            '<div class="field"><input type="text" data-tkreply="'+esc(t.id)+'" placeholder="پاسخ / یادداشت…"></div></div>'+
            '<div style="display:flex; gap:.5rem; flex-wrap:wrap">'+
              '<button class="btn btn-soft btn-sm" data-tksendreply="'+esc(t.id)+'">ارسال پاسخ</button>'+
              '<button class="btn btn-soft btn-sm" data-tkst="in_progress" data-tkid="'+esc(t.id)+'">در حال انجام</button>'+
              '<button class="btn btn-soft btn-sm" data-tkst="resolved" data-tkid="'+esc(t.id)+'">انجام شد</button>'+
              '<button class="btn btn-soft btn-sm" data-tkst="open" data-tkid="'+esc(t.id)+'">بازکردن دوباره</button>'+
              '<button class="btn btn-soft btn-sm" data-tkdel="'+esc(t.id)+'" style="color:#a33; margin-inline-start:auto">حذف</button>'+
            '</div>'+
          '</div></details>';
      }).join('');
      // status buttons
      [].forEach.call(box.querySelectorAll('[data-tkst]'), function(b){
        b.addEventListener('click', function(){
          fetch('../api/tickets/'+b.getAttribute('data-tkid')+'/status', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({status:b.getAttribute('data-tkst')}) })
            .then(function(){ loadTickets(); });
        });
      });
      // delete
      [].forEach.call(box.querySelectorAll('[data-tkdel]'), function(b){
        b.addEventListener('click', function(){
          var id = b.getAttribute('data-tkdel');
          if (!confirm('این تیکت («'+id+'») برای همیشه حذف شود؟')) return;
          fetch('../api/tickets/'+id, { method:'DELETE' }).then(function(){ loadTickets(); });
        });
      });
      // replies
      [].forEach.call(box.querySelectorAll('[data-tksendreply]'), function(b){
        b.addEventListener('click', function(){
          var id = b.getAttribute('data-tksendreply');
          var body = (box.querySelector('[data-tkreply="'+id+'"]')||{}).value || '';
          var author = (box.querySelector('[data-tkauthor="'+id+'"]')||{}).value || '';
          if (!body.trim()){ alert('متن پاسخ خالی است.'); return; }
          fetch('../api/tickets/'+id+'/reply', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({author:author, body:body}) })
            .then(function(){ loadTickets(); });
        });
      });
    }).catch(function(){ box.innerHTML = '<p class="muted">خطا در بارگذاری تیکت‌ها.</p>'; });
  }

  /* ---------- PEARL ASSISTANT (Kairos connection) ---------- */
  function renderAssistant(){
    var a = C.read(C.KEYS.assistant, { enabled:false, mode:'panel', url:'', code:'', fallbackFa:'', fallbackEn:'' });
    $('#panel-assistant').innerHTML =
      '<div class="notice notice-warn" style="margin-bottom:1rem">⚠️ هرگز کلید API اوپن‌ای‌آی (OpenAI) را اینجا وارد نکنید. کلید باید روی سرور تیم هوش مصنوعی بماند. اینجا فقط «کد جای‌گذاری» یا «نشانی» که تیم کایروس به شما می‌دهد را قرار دهید.<br><span class="muted">Never paste an OpenAI API key here — only the embed snippet / URL the AI team gives you.</span></div>' +
      '<div class="card"><h3>اتصال دستیار مروارید</h3>' +
        '<label style="display:flex; gap:.5rem; align-items:center; font-weight:500"><input type="checkbox" id="aEnabled" '+(a.enabled?'checked':'')+' style="width:auto"> دستیار فعال باشد</label>' +
        '<div class="field" style="margin-top:1rem"><label>روش اتصال</label><select id="aMode">' +
          '<option value="panel"'+(a.mode==='panel'?' selected':'')+'>نمایش داخل پنل مروارید (نشانی/URL را بچسبانید) — حفظ برند شما</option>' +
          '<option value="embed"'+(a.mode==='embed'?' selected':'')+'>ویجت اختصاصی تیم (کد جای‌گذاری را بچسبانید)</option>' +
        '</select></div>' +
        '<div class="field" id="aUrlWrap"><label>نشانی ویجت/گفت‌وگو (URL)</label><input type="url" id="aUrl" dir="ltr" placeholder="https://chat.kairos.example/embed/…" value="'+esc(a.url||'')+'"></div>' +
        '<div class="field" id="aCodeWrap"><label>کد جای‌گذاری (Embed snippet)</label><textarea id="aCode" dir="ltr" placeholder="&lt;script src=&quot;https://…&quot;&gt;&lt;/script&gt;">'+esc(a.code||'')+'</textarea></div>' +
        '<div class="row2"><div class="field"><label>پیام زمانی‌که در دسترس نیست (فارسی)</label><input type="text" id="aFbFa" value="'+esc(a.fallbackFa||'')+'" placeholder="مروارید هنوز متصل نشده است…"></div>' +
        '<div class="field"><label>Fallback message (English)</label><input type="text" id="aFbEn" dir="ltr" value="'+esc(a.fallbackEn||'')+'" placeholder="Pearl is not connected yet…"></div></div>' +
        '<div style="display:flex; gap:.6rem; align-items:center"><button class="btn btn-gold" id="aSave">ذخیره و اتصال</button>' +
        '<a class="btn btn-soft btn-sm" href="../index.html" target="_blank">آزمایش روی سایت ↗</a>' +
        '<span class="saved-flash" id="aFlash">ذخیره شد ✓</span></div>' +
      '</div>' +
      '<div class="notice notice-info">جای دکمهٔ مروارید در همهٔ صفحه‌ها از قبل آماده است (گوشهٔ پایین). وقتی تیم کایروس آماده شد، فقط همین‌جا اتصال را وارد و فعال کنید.</div>';
    function sync(){ var m=$('#aMode').value; $('#aUrlWrap').style.display = m==='panel'?'block':'none'; $('#aCodeWrap').style.display = m==='embed'?'block':'none'; }
    $('#aMode').addEventListener('change', sync); sync();
    $('#aSave').addEventListener('click', function(){
      var code = $('#aCode').value;
      if (/sk-[A-Za-z0-9]/.test(code) || /sk-[A-Za-z0-9]/.test($('#aUrl').value)){ alert('به نظر می‌رسد یک کلید API وارد کرده‌اید. لطفاً کلید را اینجا قرار ندهید — فقط کد/نشانی تیم کایروس.'); return; }
      C.write(C.KEYS.assistant, { enabled:$('#aEnabled').checked, mode:$('#aMode').value, url:$('#aUrl').value.trim(), code:code, fallbackFa:$('#aFbFa').value.trim(), fallbackEn:$('#aFbEn').value.trim() });
      flash($('#aFlash'));
    });
  }

  /* ---------- HELP ---------- */
  function renderHelp(){
    $('#panel-help').innerHTML =
      '<div class="card"><h3>این داشبورد چه می‌کند؟</h3><ul class="help-list">'+
        '<li>متن‌ها، عنوان‌ها، عکس‌ها و ویدئوهای هر بخش را خودتان تغییر می‌دهید — بدون برنامه‌نویس.</li>'+
        '<li>تغییرات بلافاصله روی سایت دیده می‌شوند.</li>'+
        '<li>طراحی، چیدمان، فونت و رنگ‌ها قفل هستند تا برند یک‌دست بماند.</li>'+
      '</ul></div>'+
      '<div class="card"><h3>نمونهٔ اولیه در برابر نسخهٔ نهایی</h3>'+
        '<div class="notice notice-warn" style="margin-bottom:.6rem">اکنون داده‌ها فقط در همین مرورگر ذخیره می‌شوند (نمونه). در نسخهٔ نهایی همه‌چیز روی سرور امن با پایگاه‌داده، حساب‌های واقعی، و بارگذاری مطمئن ویدئو/عکس ذخیره می‌شود و برای همهٔ کاربران مشترک است.</div>'+
        '<ul class="help-list">'+
          '<li><b>ویدئوها:</b> فعلاً با «نشانی/لینک» اضافه می‌شوند (همان روشی که در نسخهٔ نهایی هم برای ویدئوهای میزبانی‌شده استفاده می‌شود).</li>'+
          '<li><b>عکس‌ها:</b> بارگذاری مستقیم کار می‌کند؛ عکس‌های خیلی بزرگ در نمونه ممکن است ذخیره نشوند.</li>'+
          '<li><b>کاربران:</b> اینجا فقط مدل نقش‌ها نمایش داده می‌شود؛ ورود امن واقعی روی سرور ساخته می‌شود.</li>'+
        '</ul></div>'+
      '<div class="card"><h3>بازنشانی</h3><p class="muted">برای بازگرداندن همهٔ متن‌ها و عکس‌ها به حالت اصلی:</p>'+
        '<button class="btn btn-danger" id="resetAll">بازنشانی همهٔ تغییرات محتوا</button></div>';
    $('#resetAll').addEventListener('click', function(){
      if(!confirm('همهٔ تغییرات متن و عکس به حالت اصلی برگردد؟')) return;
      C.write(C.KEYS.content, {}); alert('انجام شد. صفحه‌ها به متن اصلی برگشتند.');
      renderContent(); renderOverview();
    });
  }

  /* ---------- Boot ---------- */
  loadDefaults().then(function(){
    renderOverview(); renderContent(); renderSessions(); renderAnalytics(); renderUsers(); renderTickets(); renderAssistant(); renderHelp();
  });
})();
