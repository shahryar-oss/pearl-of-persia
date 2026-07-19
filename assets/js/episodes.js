/* =========================================================
   Pearl of Persia — Rich per-episode page content
   Source: Stella's "PAGE STRUCTURE FOR EPISODE 1" (2026-06-19)
   Episodes with an entry here render her full structure:
   Welcome → Video → Pause → Steps 1–4 → Questions (blue) → Spiritual (yellow)
   Episodes without an entry fall back to the simple layout.
   Videos are added later via the admin dashboard (video URL per episode).
   ========================================================= */
window.EP_RICH = {
  1: {
    welcomeTitle: 'خوش‌آمدید',
    welcomeHtml: '<p>خوشحالیم که به ما پیوسته‌اید.<br>تماشای این اولین ویدیو، خود یک قدم مهم است.<br>با هر سرعتی که برای شما مناسب است، از شما دعوت می‌کنیم عمیق‌تر به این موضوعات نگاه کنید و در این مسیر، همراه ما، با مهربانی از خودتان مراقبت کنید.</p>',

    pauseTitle: 'مکثی پس از تماشا',
    pauseHtml: '<p>ممکن است ویدیوی امروز دردهای عمیق، سردرگمی، بی‌حسی، یا احساساتی را که مدت‌ها در درون خود نگه داشته بودید، به سطح آورده باشد.</p><p>در حالی که با کنجکاوی و مهربانی به مسیر زندگی خود نگاه می‌کنید و نسبت به واکنش‌های محافظتیِ خودکارِ خود آگاه‌‌تر می‌شوید، ممکن است بیشتر به قدرت و تاب‌آوریِ خود پی ببرید.</p><p>شفا اغلب از همین‌جا آغاز می‌شود.</p>',

    step1Title: 'گام اول: آرام گرفتن و حضور در لحظه',
    breatheCircle: true, // show the animated "دم… بازدم" breathing circle beside the exercise
    step1Html: '<h4>چند نفس آرام</h4><ol><li>یک نفس آرام و عمیق بکشید.</li><li>آن را برای ۳ تا ۵ ثانیه نگه دارید.</li><li>به‌آرامی بازدم کنید و به تنفس خود توجه کنید.</li></ol><p>حالا کمی به اطراف‌تان توجه کنید:</p><ul><li>پاهای‌تان را روی زمین احساس کنید و متوجه تکیه‌گاهی شوید که زیر شماست.</li><li>به یک صدا گوش بدهید.</li><li>به یکی از چیزهایی که می‌توانید ‌ببینید، توجه کنید.</li><li>به یک چیزی فکر کنید که بابت آن سپاسگزارید.</li></ul><p>حالا یک نفس آرام و عمیق دیگر بکشید.</p>',

    step2Title: 'گام دوم: یک قدم کوچک برای این هفته',
    step2Html: '<p>هر وقت احساس کردید تحت فشار قرار گرفته‌اید، واکنش‌های شدیدی دارید یا مضطرب هستید، کمی مکث کنید و همان تمرین آرام‌سازی و حضور در لحظه را که در بخش «چند نفس آرام» انجام دادیم، دوباره انجام دهید.</p>',

    step3Title: 'گام سوم: فرصتی برای تأمل بیشتر (اختیاری)',
    step3LinkQuestions: 'در صورت تمایل: پرسش‌ها و تمرین‌هایی برای تأمل بیشتر',
    step3LinkSpiritual: 'در صورت تمایل: کاوش و تأمل روحانی',

    step4Title: 'گام چهارم: ادامهٔ مسیر',
    step4Html: '<p>دلیلی وجود دارد که قلب و ذهن شما یاد گرفته‌اند به این شکل واکنش نشان دهند.</p><p>امیدواریم این هفته بتوانید با مهربانی بیشتری با خودتان رفتار کنید. و به کشف این حقیقت ادامه دهید که شفا و ترمیم ممکن است.</p>',
    askPearlLabel: 'اگر پرسشی دارید، می‌توانید از مروارید بپرسید.',
    nextLabel: 'و هر زمان که آماده بودید، می‌توانید ویدیوی بعدی را از اینجا تماشا کنید.',

    questionsTitle: 'پرسش‌ها و تمرین‌هایی برای تأمل بیشتر',
    questionsHtml: '<ol><li>هنگام تماشای این ویدیو، آیا احساس یا حالتی آشنا را در خودتان تشخیص دادید؟<br><span class="muted">مثل: همیشه گوش به زنگ یا در حالت آماده‌باش بودن، اضطراب یا نگرانی، سخت بودنِ اعتماد به دیگران، احساس بی‌حسی یا فاصلهٔ عاطفی، احساس تحت فشار قرار گرفتن، کلافگی یا تحریک‌پذیری، واکنش‌های شدیدی که کنترل آن‌ها دشوار است، مشکل در خواب، یا احساس شرم و سرزنش خود.</span></li><li>وقتی به این رفتارها و احساسات به‌چشم واکنش‌های خودکارِ بقا نگاه می‌کنید – واکنش‌هایی که زمانی تلاش می‌کرده‌اند از شما محافظت کنند - نگاه‌تان به آن‌ها چه تغییری می‌کند؟</li><li>آیا در ویدیوی امروز لحظه‌ای بود که به شما کمک کرد با مهربانی، درک یا آگاهی بیشتری به خودتان نگاه کنید؟</li></ol>',

    spiritualTitle: 'خدایی که می‌ماند',
    spiritualHtml: '<p>ویدیوی امروز به ما یادآوری می‌کند که خدا همیشه حاضر است؛ او ما را می‌بیند و در رنج، در بی‌حسی و حتی در سخت‌ترین لحظه‌های زندگی‌مان با ماست.</p><p>یکی از ویژگی‌های قابل توجه عیسی این است که همیشه به کسانی نزدیک می‌شد که در کشمکش، درد و سختی بودند. او با انسان‌ها درست در همان جایی که بودند روبه‌رو می‌شد؛ در درد، شرم، غم، ترس، ناامیدی… و حتی در تردیدشان. و با شفقت، توجهی عمیق، درک و همدلی با آن‌ها روبه‌رو می‌شد.</p><p>او حتی کسانی را که در عمیق‌ترین احساس شرم بودند یا از سوی دیگران طرد شده بودند، می‌دید، آن‌ها را به رسمیت می‌شناخت و به رابطه با خود دعوت می‌کرد.</p><p>در اشعیا ۵۳: ۳ دربارهٔ عیسی آمده است:</p><blockquote>«او نزد آدمیان خوار و مردود بود؛ مردی دردآشنا و رنجدیده.»</blockquote><p>بسیاری خدا را دور از رنج و درد تصور می‌کنند، اما عیسی رنج را از نزدیک و به‌خوبی می‌شناسد. او عمیق‌ترین شرم، طردشدگی و درد را تجربه کرد.</p><p>او آنچه را ما تجربه می‌کنیم، درک می‌کند. او ما را تنها نمی‌گذارد و از ما روی برنمی‌گرداند.</p>',
    thinkTitle: 'کمی فکر کنید',
    /* --- English draft translations (for Stella's review) --- */
    welcomeTitleEn: 'Welcome',
    welcomeHtmlEn: '<p>We are glad you have joined us.<br>Watching this first video is itself an important step.<br>At whatever pace feels right for you, we invite you to look more deeply at these themes — and along the way, together with us, to care for yourself with kindness.</p>',
    pauseTitleEn: 'A Pause After Watching',
    pauseHtmlEn: '<p>Today\u2019s video may have brought to the surface deep pain, confusion, numbness, or feelings you have carried inside for a long time.</p><p>As you look at your life\u2019s journey with curiosity and kindness, and become more aware of your automatic protective reactions, you may begin to discover more of your own strength and resilience.</p><p>Healing often begins right here.</p>',
    step1TitleEn: 'Step 1: Settling and Being Present',
    step1HtmlEn: '<h4>A Few Calm Breaths</h4><ol><li>Take a slow, deep breath.</li><li>Hold it for 3\u20135 seconds.</li><li>Breathe out gently, paying attention to your breath.</li></ol><p>Now notice your surroundings a little:</p><ul><li>Feel your feet on the floor and notice the support beneath you.</li><li>Listen to one sound.</li><li>Notice one thing you can see.</li><li>Think of one thing you are thankful for.</li></ul><p>Now take one more slow, deep breath.</p>',
    step2TitleEn: 'Step 2: One Small Step This Week',
    step2HtmlEn: '<p>Whenever you feel under pressure, notice strong reactions, or feel anxious, pause for a moment and repeat the same calming and grounding exercise we practised in \u201CA Few Calm Breaths\u201D.</p>',
    step3TitleEn: 'Step 3: An Opportunity for Further Reflection (optional)',
    step3LinkQuestionsEn: 'If you wish: questions and exercises for further reflection',
    step3LinkSpiritualEn: 'If you wish: spiritual exploration and reflection',
    step4TitleEn: 'Step 4: Continuing the Journey',
    step4HtmlEn: '<p>There is a reason your heart and mind have learned to react this way.</p><p>We hope that this week you can treat yourself with more kindness \u2014 and keep discovering the truth that healing and restoration are possible.</p>',
    askPearlLabelEn: 'If you have a question, you can ask Pearl.',
    nextLabelEn: 'And whenever you are ready, you can watch the next video from here.',
    questionsTitleEn: 'Questions and Exercises for Further Reflection',
    questionsHtmlEn: '<ol><li>While watching this video, did you recognise a familiar feeling or state in yourself?<br><span class="muted">For example: always being on guard or on high alert, anxiety or worry, finding it hard to trust others, feeling numb or emotionally distant, feeling overwhelmed, irritability, intense reactions that are hard to control, trouble sleeping, or feelings of shame and self-blame.</span></li><li>When you look at these behaviours and feelings as automatic survival responses \u2014 responses that once tried to protect you \u2014 how does your view of them change?</li><li>Was there a moment in today\u2019s video that helped you look at yourself with more kindness, understanding, or awareness?</li></ol>',
    spiritualTitleEn: 'The God Who Stays',
    spiritualHtmlEn: '<p>Today\u2019s video reminds us that God is always present; He sees us and is with us in our pain, in our numbness, and even in the hardest moments of our lives.</p><p>One of the remarkable things about Jesus is that he always drew near to those who were struggling, hurting, or in hardship. He met people exactly where they were \u2014 in pain, shame, grief, fear, despair\u2026 and even in their doubt \u2014 and he met them with compassion, deep attention, understanding, and empathy.</p><p>He saw even those trapped in the deepest shame, or rejected by others; he acknowledged them and invited them into relationship with himself.</p><p>Isaiah 53:3 says of Jesus:</p><blockquote>\u201CHe was despised and rejected by men; a man of sorrows, acquainted with grief.\u201D</blockquote><p>Many imagine God as distant from pain and suffering, but Jesus knows suffering closely and personally. He experienced the deepest shame, rejection, and pain.</p><p>He understands what we go through. He does not leave us alone, and he does not turn away from us.</p>',
    thinkTitleEn: 'Think About It for a Moment',
    thinkHtmlEn: '<p>You don\u2019t need to have all the answers, or even to know exactly what you believe. Just consider this question for a moment:</p><p>How does it feel to know that Jesus himself experienced suffering, and wants to walk with you in yours \u2014 so that you don\u2019t have to carry it alone?</p><p>If you could hand something over to him to carry with you, what would it be?</p>',

    thinkHtml: '<p>لازم نیست همهٔ پاسخ‌ها را داشته باشید یا حتی بدانید دقیقاً به چه چیزی باور دارید. فقط کمی به این سؤال فکر کنید:</p><p>این حقیقت که عیسی خودش رنج را تجربه کرده و می‌خواهد در رنج با شما همراه باشد تا مجبور نباشید آن را به‌تنهایی حمل کنید، چه احساسی در شما برمی‌انگیزد؟</p><p>اگر می‌توانستید چیزی را به او بسپارید تا با شما حمل کند، آن چه بود؟</p>'
  }
};

/* Standard section titles & fixed labels — used when an episode
   doesn't define its own (admin can override titles per episode). */
window.EP_STD = {
  fa: {
    welcome: 'خوش‌آمدید',
    pause: 'مکثی پس از تماشا',
    step1: 'گام اول: آرام گرفتن و حضور در لحظه',
    step2: 'گام دوم: یک قدم کوچک برای این هفته',
    step3: 'گام سوم: فرصتی برای تأمل بیشتر (اختیاری)',
    step4: 'گام چهارم: ادامهٔ مسیر',
    questions: 'پرسش‌ها و تمرین‌هایی برای تأمل بیشتر',
    spiritual: 'کاوش و تأمل روحانی',
    think: 'کمی فکر کنید',
    linkQuestions: 'در صورت تمایل: پرسش‌ها و تمرین‌هایی برای تأمل بیشتر',
    linkSpiritual: 'در صورت تمایل: کاوش و تأمل روحانی',
    askPearl: 'اگر پرسشی دارید، می‌توانید از مروارید بپرسید.',
    next: 'و هر زمان که آماده بودید، می‌توانید ویدیوی بعدی را از اینجا تماشا کنید.'
  },
  en: {
    welcome: 'Welcome',
    pause: 'A Pause After Watching',
    step1: 'Step 1: Settling and Being Present',
    step2: 'Step 2: One Small Step This Week',
    step3: 'Step 3: An Opportunity for Further Reflection (optional)',
    step4: 'Step 4: Continuing the Journey',
    questions: 'Questions and Exercises for Further Reflection',
    spiritual: 'Spiritual Exploration and Reflection',
    think: 'Think About It for a Moment',
    linkQuestions: 'If you wish: questions and exercises for further reflection',
    linkSpiritual: 'If you wish: spiritual exploration and reflection',
    askPearl: 'If you have a question, you can ask Pearl.',
    next: 'And whenever you are ready, you can watch the next video from here.'
  }
};

/* ---------------------------------------------------------------
   Final episode titles — Stella's documents (14 Jul 2026):
   "تیترها.docx" (Farsi) + "Titles - Final.docx" (English).
   Ep 2 uses her preferred longer Farsi title (short fallback:
   «امید در دلِ تنهایی» if layout ever needs it). Ep 13's Farsi and
   English subtitles differ between her two documents; both kept as
   authored, pending her confirmation. sub = subtitle (optional).
   --------------------------------------------------------------- */
window.EP_TITLES = {
  1:  { fa: 'یافتن آرامش در دلِ ترس و نبود امنیت', en: 'Finding Calm in the Midst of Fear and Uncertainty' },
  2:  { fa: 'امید در دلِ تنهایی و فرسودگی احساسی', en: 'Finding Hope in Times of Loneliness and Emotional Exhaustion' },
  3:  { fa: 'تروما و بدن در حالت بقا – ۱', subFa: 'چرا واکنش‌ها‌تون قابل درک‌اند', en: 'Trauma and the Body, Part 1', subEn: 'Why Your Reactions Make Sense' },
  4:  { fa: 'تروما و بدن در حالت بقا – ۲', subFa: 'چه چیزهایی به بدن کمک می‌کنند', en: 'Trauma and the Body, Part 2', subEn: 'What Helps the Body Feel Safe' },
  5:  { fa: 'شرمِ گره‌خورده به هویت – ۱', subFa: 'باری که هیچ‌وقت مال شما نبود', en: 'Shame Bound to Identity, Part 1', subEn: 'A Burden That Was Never Yours' },
  6:  { fa: 'شرمِ گره‌خورده به هویت – ۲', subFa: 'شرم ابزاری برای کنترل', en: 'Shame Bound to Identity, Part 2', subEn: 'Shame as a Tool for Control' },
  7:  { fa: 'شرمِ گره‌خورده به هویت – ۳', subFa: 'رهایی از شرمی که مال شما نیست', en: 'Shame Bound to Identity, Part 3', subEn: 'Freedom from Shame That Was Never Yours' },
  8:  { fa: 'آسیب مذهبی و رابطه با خدا – ۱', subFa: 'نام بردن آسیب‌های مذهبی بدون کنار گذاشتن خدا', en: 'Religious Harm and God, Part 1', subEn: 'Naming Religious Harm Without Abandoning God' },
  9:  { fa: 'آسیب مذهبی و رابطه با خدا – ۲', subFa: 'عیسی: مردی که زن‌ها را با شرم تعریف نکرد', en: 'Religious Harm and God, Part 2', subEn: 'Jesus: A Man Who Did Not Define Women by Shame' },
  10: { fa: 'آسیب مذهبی و رابطه با خدا – ۳', subFa: 'ایمان پس از سرخوردگی مذهبی', en: 'Religious Harm and God, Part 3', subEn: 'Faith After Disillusionment' },
  11: { fa: 'فرار از درد و میل به ناپدید شدن', subFa: 'وقتی دوام آوردن سخت می‌شه', en: 'Escaping Pain and the Desire to Disappear', subEn: 'When Enduring Feels Too Hard' },
  12: { fa: 'موج‌های درد', subFa: 'چطور در میان موج‌ها دوام بیاریم', en: 'Waves of Pain', subEn: 'How to Endure the Waves' },
  13: { fa: 'خدا، دین و ارزش زن – ۱', subFa: 'وقتی امن نبود که خودت باشی', en: "God, Religion, and Women's Worth, Part 1", subEn: 'Childhood Conditioning and Survival Roles' },
  14: { fa: 'خدا، دین و ارزش زن – ۲', subFa: 'الگوهای بقا در رابطه‌ها', en: "God, Religion, and Women's Worth, Part 2", subEn: 'Survival Patterns in Relationships' },
  15: { fa: 'رابطه، امنیت و الگوهای بقا – ۱', subFa: 'وابستگی‌هایی که برای بقا شکل گرفتند', en: 'Relationships, Safety and Survival Patterns, Part 1', subEn: 'Attachment as Survival' },
  16: { fa: 'رابطه، امنیت و الگوهای بقا – ۲', subFa: 'بهای گفتن «بله» و «نه»', en: 'Relationships, Safety and Survival Patterns, Part 2', subEn: 'The Cost of Saying “No” or “Yes”' },
  17: { fa: 'خیانت، بی‌اعتمادی و آسیب اخلاقی – ۱', subFa: 'زندگی پس از خیانت', en: 'Betrayal, Mistrust, and Moral Injury, Part 1', subEn: 'Living with Betrayal' },
  18: { fa: 'خیانت، بی‌اعتمادی و آسیب اخلاقی – ۲', subFa: 'شک به صدای درون', en: 'Betrayal, Mistrust, and Moral Injury, Part 2', subEn: 'Losing Trust in Your Inner Voice' },
  19: { fa: 'خشم، عصبانیت و فریاد برای عدالت – ۱', subFa: 'خشم؛ واکنشی انسانی به بی‌عدالتی', en: 'Rage, Anger, and the Cry for Justice, Part 1', subEn: 'Anger as a Human Response to Injustice' },
  20: { fa: 'خشم، عصبانیت و فریاد برای عدالت – ۲', subFa: 'وقتی خشم جایی برای رفتن ندارد', en: 'Rage, Anger, and the Cry for Justice, Part 2', subEn: 'When Anger Has Nowhere to Go' },
  21: { fa: 'مرزهای سالم در رابطه‌های ناامن', subFa: 'حفظِ خود در محیط‌های کنترل‌گر', en: 'Healthy Boundaries in Unsafe or Controlling Environments' },
  22: { fa: 'گذشتهٔ جنسی، شرم و ارزشمندی – ۱', subFa: 'ارزش انسان فراتر از گذشته‌ٔ اوست', en: 'Sexual History, Shame, and Worth, Part 1', subEn: 'Your Worth Is Greater Than Your Past' },
  23: { fa: 'گذشتهٔ جنسی، شرم و ارزشمندی – ۲', subFa: 'بدن، تروما و بازگشتِ احساس امنیت', en: 'Sexual History, Shame, and Worth, Part 2', subEn: 'The Body, Trauma, and Returning to Safety' },
  24: { fa: 'پیدا کردن صدا برای تروما', subFa: 'چه وقت حرف بزنیم، و چه وقت نه', en: 'Finding Voice for Trauma', subEn: 'When, How, and When Not To' },
  25: { fa: 'زندگی با غمِ ناتمام و سؤال‌های بی‌پاسخ', subFa: 'غم، ابهام و ادامهٔ زندگی', en: 'Living with Unfinished Grief and Unanswered Questions' },
  26: { fa: 'ارزش و هویتِ واقعی', subFa: 'فراتر از بقا و نقش‌هایی که بر دوش ما گذاشته شده', en: 'True Worth and Identity', subEn: 'Beyond Survival and the Roles Placed on Us' }
};
