// Realistic provider answers used by the tests and the local preview server (no real API calls).
// Some items are deliberately broken to prove the validators drop or fix them.
export const FIX = {
  presentation: {
    title: 'حالات الماء', subtitle: 'العلوم', objectives: ['تسمّي حالات الماء الثلاث', 'تصنّف أمثلة حسب حالة الماء', 'تفسّر تحوّل الماء بالحرارة'],
    slides: [
      { type: 'hook', question: 'أين يذهب ماء الملابس المبلولة عندما تجف؟', reveal: 'يتبخر ويصعد إلى الهواء!', pic: '💧' },
      { type: 'objectives' },
      { type: 'concept', title: 'الماء السائل', text: 'الماء السائل يجري ويأخذ شكل الإناء الذي يوضع فيه.', pic: '🌊' },
      { type: 'concept', title: 'الجليد', text: 'عندما يبرد الماء كثيرًا يتجمد ويصبح جليدًا صلبًا.', pic: '🧊' },
      { type: 'examples', title: 'أمثلة من حياتنا', items: [{ pic: '🌧️', text: 'المطر' }, { pic: '❄️', text: 'الثلج' }, { pic: '☁️x', text: 'بخار الماء' }] },
      { type: 'flip', word: 'التبخر', pic: '☀️', info: 'تحوّل الماء من سائل إلى بخار بالحرارة' },
      { type: 'sort', title: 'صنّفوا', groups: ['صلب', 'سائل'], items: [{ text: 'مكعب ثلج', pic: '🧊', group: 'صلب' }, { text: 'عصير', pic: '🥛', group: 'سائل' }, { text: 'ندفة ثلج', pic: '❄️', group: 'صلب' }, { text: 'مطر', pic: '🌧️', group: 'سائل' }, { text: 'بخار', group: 'غاز' }] },
      { type: 'mcq', section: 'practice', question: 'ماذا يحدث للماء إذا وضعناه في المجمّد؟', pic: '🧊', answer: 'يتجمد', distractors: ['يتبخر', 'يختفي'] },
      { type: 'mcq', section: 'practice', question: 'سؤال بلا بدائل', answer: 'أ', distractors: ['أ'] },
      { type: 'match', title: 'طابقوا', pairs: [{ a: 'جليد', pic: '🧊', b: 'صلب' }, { a: 'ماء', pic: '💧', b: 'سائل' }, { a: 'بخار', pic: '🌀', b: 'غاز' }] },
      { type: 'mystery', title: 'صناديق المفاجآت', items: [{ q: 'اذكروا مكانًا نجد فيه الجليد', a: 'المجمّد' }, { q: 'ما الذي يجفف الملابس؟', a: 'الشمس والهواء' }, { q: 'مثّلوا حركة المطر', a: '' }] },
      { type: 'timed', title: 'تحدي السرعة', questions: [{ q: 'الثلج حالة…', answer: 'صلبة', distractors: ['سائلة', 'غازية'] }, { q: 'المطر حالة…', answer: 'سائلة', distractors: ['صلبة', 'غازية'] }, { q: 'البخار حالة…', answer: 'غازية', distractors: ['صلبة', 'سائلة'] }] },
      { type: 'order', word: 'مطر', pic: '🌧️' },
      { type: 'story', pages: [{ text: 'قطرة صغيرة كانت في البحر.', pic: '🌊' }, { text: 'سخّنتها الشمس فطارت إلى السماء.', pic: '☀️' }, { text: 'ثم عادت مطرًا إلى الأرض.', pic: '🌧️' }] },
      { type: 'puzzle', title: 'من أنا؟', riddles: [{ hints: ['أنا بارد', 'أنا صلب', 'أذوب في الشمس'], answer: 'الجليد', pic: '🧊', distractors: ['البخار', 'المطر'] }, { hints: ['أنزل من السماء', 'أسقي الزرع', 'أنا قطرات'], answer: 'المطر', pic: '🌧️', distractors: ['الثلج', 'الشمس'] }] },
      { type: 'review', title: 'تذكّروا', points: ['للماء ثلاث حالات', 'الحرارة تبخّر الماء', 'البرودة تجمّده'] },
      { type: 'tf', section: 'assessment', statement: 'الجليد ماء متجمد', pic: '🧊', answer: true },
      { type: 'mcq', section: 'assessment', question: 'أي مما يلي غاز؟', pic: '', answer: 'البخار', distractors: ['الجليد', 'العصير'] },
      { type: 'exit', prompt: 'اذكر مثالًا على تبخر الماء في بيتك' },
      { type: 'script', html: '<script>alert(1)</script>' }
    ]
  },
  lesson: {
    title: 'الجمع ضمن ١٠', sub: 'الرياضيات', hook: 'معي ٣ تفاحات وأعطتني أمي ٢، كم صار معي؟', hookPic: '🍎',
    pre: [{ q: 'كم عدد الأصابع في يد واحدة؟', pic: '✋', answer: '٥', distractors: ['٤', '٦'] }],
    goals: ['أجمع عددين ناتجهما لا يزيد عن ١٠', 'أستعمل الصور لأجد الناتج'],
    points: [{ title: 'معنى الجمع', text: 'الجمع يعني أن نضمّ مجموعتين معًا ونعدّ الكل.', pic: '🧮' }, { title: 'رمز الجمع', text: 'نكتب + بين العددين و = قبل الناتج.', pic: '✏️' }],
    examples: [{ pic: '🍎', text: '٢ + ١ = ٣' }, { pic: '🍌', text: '٤ + ٢ = ٦' }],
    model: ['أعدّ المجموعة الأولى', 'أكمل العدّ على المجموعة الثانية', 'أكتب الناتج'], mistakes: [{ wrong: '٣ + ٢ = ٣٢', right: '٣ + ٢ = ٥' }],
    strategy: 'فكّر، زاوج، شارك', act: ['كل طالبين يرسمان مسألة جمع', 'يتبادلان الحل'], actTime: 4,
    cards: [{ word: 'المجموع', pic: '🎯', info: 'ناتج عملية الجمع' }], order: [{ word: 'جمع', pic: '😀' }], count: [{ pic: '🍓', n: 4 }],
    sort: [{ text: '٢+٢', group: 'أقل من ٥' }, { text: '٣+٤', group: '٥ فأكثر' }, { text: '١+١', group: 'أقل من ٥' }, { text: '٥+٣', group: '٥ فأكثر' }],
    questions: [{ q: 'ما ناتج ٣ + ٤؟', pic: '', answer: '٨', distractors: ['٧', '٦'], level: '' }, { q: 'ما ناتج ٢ + ٢؟', pic: '', answer: '٤', distractors: ['٣', '٥'], level: 'أنطلق' }, { q: 'ما ناتج ٥ + ٤؟', answer: '٩', distractors: ['٨', '١٠'], level: 'أتقدّم' }, { q: 'عندي ٦ أقلام وأخذت ٣، كم معي؟', answer: '٩', distractors: ['٨', '٣'], level: 'أتميّز' }],
    tf: [{ statement: '٤ + ١ = ٥', answer: 'صح' }, { statement: '٢ + ٣ = ٦', answer: false }],
    summary: ['الجمع ضمّ', 'نعدّ الكل لنجد الناتج'], diff: [{ level: 'أنطلق', task: 'اجمع بالعدّ على الصور' }, { level: 'أتقدّم', task: 'حل ٥ مسائل' }, { level: 'أتميز', task: 'اكتب مسألة جمع من حياتك' }],
    exit: 'ما ناتج ١ + ٦؟', hw: [{ level: 'أنطلق', task: 'لوّن ثم اجمع' }, { level: 'أتقدّم', task: 'حل تمارين الكتاب' }, { level: 'أتميّز', task: 'ابتكر لغز جمع' }]
  },
  quiz: {
    title: 'اختبار قصير: الجمع', instructions: 'اقرأ كل سؤال جيدًا ثم أجب.',
    questions: [
      { type: 'mcq', q: 'ما ناتج ٣ + ٤؟', options: ['٨', '٦', '٥', '٩'], answer: '٨', points: 1 },
      { type: 'mcq', q: 'ما ناتج ٢ + ٥؟', options: ['٧', '٦', '٨', '٩'], answer: '٧', points: 1, explanation: 'نعد من ٥: ٦، ٧' },
      { type: 'mcq', q: 'خيارات مكررة', options: ['١', '١', '١'], answer: '٢' },
      { type: 'tf', q: '٦ + ٠ = ٦', answer: true, points: 1 },
      { type: 'fill', q: '٤ + ٤ = ......', answer: '٨', points: 1 },
      { type: 'open', q: 'اكتب مسألة جمع عن الحلوى ثم حلّها.', answer: 'مثال: ٣ حلوى + ٢ = ٥', lines: 3, points: 2 },
      { type: 'tf', q: '٩ + ١ = ١١', answer: 'خطأ' }
    ]
  },
  game: { type: 'star', title: 'نجمة الجمع', items: [
    { q: 'ما ناتج ١ + ١؟', answer: '٢', distractors: ['٣', '١', '٤'] }, { q: 'ما ناتج ٢ + ٣؟', answer: '٥', distractors: ['٤', '٦', '٧'] },
    { q: 'ما ناتج ٤ + ٤؟', answer: '٨', distractors: ['٦', '٧', '٩'] }, { q: 'ما ناتج ٥ + ٥؟', answer: '١٠', distractors: ['٨', '٩', '١١'] },
    { q: 'ناقص', answer: '١', distractors: ['٢'] }, { q: 'ما ناتج ٦ + ٢؟', answer: '٨', distractors: ['٧', '٩', '١٠'] }] },
  worksheet: { title: 'ورقة عمل: حالات الماء', instructions: 'اقرأ ثم أجب.', sections: [
    { kind: 'mcq', title: 'اختر الإجابة الصحيحة', items: [{ q: 'الثلج حالة…', options: ['صلبة', 'سائلة', 'غازية'], answer: 'صلبة' }, { q: 'المطر حالة…', options: ['سائلة', 'صلبة', 'غازية'], answer: 'سائلة' }] },
    { kind: 'fill', title: 'أكمل', bank: ['يتبخر', 'يتجمد'], items: [{ sentence: 'عندما يسخن الماء ......', answer: 'يتبخر' }, { sentence: 'عندما يبرد الماء كثيرًا', answer: 'يتجمد' }] },
    { kind: 'match', title: 'صِل', items: [{ a: 'جليد', b: 'صلب' }, { a: 'ماء', b: 'سائل' }, { a: 'بخار', b: 'غاز' }] },
    { kind: 'short', title: 'أجب', items: [{ q: 'لماذا تجف الملابس في الشمس؟', answer: 'لأن الحرارة تبخر الماء', lines: 2 }] },
    { kind: 'draw', title: 'ارسم', items: [{ prompt: 'ارسم سحابة تمطر' }] },
    { kind: 'circle', title: 'ضع دائرة', items: [{ prompt: 'ضع دائرة حول الأشياء الصلبة', options: ['ثلج', 'حليب', 'حجر'], answers: ['ثلج', 'حجر'] }] }
  ] },
  prep: { title: 'حالات الماء', objectives: ['أن يسمّي الطالب حالات الماء الثلاث', 'أن يصنّف أمثلة حسب حالتها'], vocabulary: ['صلب', 'سائل', 'غاز', 'تبخر'], materials: ['أكواب ماء', 'مكعبات ثلج', 'السبورة التفاعلية'],
    prior: 'يعرف الطالب أن الماء يشرب ويستخدم في النظافة', strategies: ['التعلم باللعب', 'فكّر زاوج شارك'], values: ['المحافظة على الماء'],
    stages: [{ name: 'التهيئة', minutes: 5, teacher: 'تعرض المعلمة ملابس مبلولة وتسأل', students: 'يتوقعون' }, { name: 'العرض', minutes: 15, teacher: 'تشرح الحالات الثلاث بتجربة', students: 'يلاحظون ويسجلون' }, { name: 'التطبيق', minutes: 15, teacher: 'توزع بطاقات تصنيف', students: 'يصنفون في مجموعات' }, { name: 'التقويم والغلق', minutes: 10, teacher: 'بطاقة خروج', students: 'يجيبون' }],
    assessment: ['ما حالات الماء؟', 'صنّف: ثلج، عصير، بخار'], differentiation: { support: 'صور مساندة', core: 'تصنيف ٦ أمثلة', enrich: 'تفسير دورة الماء' }, homework: 'ارسم دورة الماء', notes: 'احرصي على السلامة مع الماء الساخن' }
};

export const REGEN = {
  presentation: { slide: { question: 'لماذا يتكوّن الندى على النباتات صباحًا؟', pic: '🌱', answer: 'لأن بخار الماء يبرد', distractors: ['لأن النبات يعرق', 'لأن الشمس تمطر'], title: 'الندى', text: 'قطرات ماء صغيرة تتكوّن على النباتات صباحًا.', statement: 'الندى ماء', word: 'الندى', info: 'بخار ماء يبرد فيصير قطرات', prompt: 'أين رأيت الندى؟', points: ['الندى ماء', 'يتكوّن صباحًا'], steps: ['نلاحظ', 'نسجّل'], reveal: '' } },
  quiz: { question: { q: 'ما ناتج ٤ + ٣؟', options: ['٧', '٦', '٨', '٥'], answer: '٧', points: 1 } },
  lesson: { questions: [{ q: 'ما ناتج ١ + ٨؟', answer: '٩', distractors: ['٨', '٧'], level: '' }] },
  worksheet: { section: { title: 'صح أو خطأ', items: [{ statement: 'الماء يغلي بالحرارة', answer: true }] } },
  worksheetFill: { section: { title: 'أكمل بكلمة مناسبة', items: [{ sentence: 'يتحوّل الجليد إلى ماء عندما ......', answer: 'يذوب' }] } },
  game: { items: [{ q: 'ما ناتج ٣ + ٣؟', answer: '٦', distractors: ['٥', '٧', '٨'] }, { q: 'ما ناتج ٢ + ٧؟', answer: '٩', distractors: ['٨', '١٠', '٦'] }, { q: 'ما ناتج ٠ + ٤؟', answer: '٤', distractors: ['٠', '٥', '٣'] }] },
  prep: { homework: 'اكتب ثلاثة أمثلة على الماء في حالته الصلبة' }
};

export function moduleOf(userText) {
  if (userText.includes('— المطلوب الآن')) return 'regen';
  if (userText.includes('اكتب عرضًا تعليميًا')) return 'presentation';
  if (userText.includes('اكتب درسًا كاملًا')) return 'lesson';
  if (userText.includes('اكتب اختبارًا قصيرًا')) return 'quiz';
  if (userText.includes('محتوى لعبة')) return 'game';
  if (userText.includes('ورقة عمل')) return 'worksheet';
  if (userText.includes('تحضيرًا')) return 'prep';
  return 'test';
}
function regenFor(userText) {
  if (userText.includes('شريحة واحدة')) return REGEN.presentation;
  if (userText.includes('سؤالًا واحدًا')) return REGEN.quiz;
  if (userText.includes('قسمًا واحدًا')) return userText.includes('من النوع "fill"') ? REGEN.worksheetFill : REGEN.worksheet;
  if (userText.includes('قائمة عناصر جديدة')) return REGEN.game;
  if (userText.includes('"questions"') && userText.includes('درسًا كاملًا')) return REGEN.lesson;
  return REGEN.prep;
}

// A fetch() stand-in for generativelanguage.googleapis.com. opts.mode: ok | 429 | 429day | 500 | badjson | slow
export function mockFetch(opts = {}) {
  const calls = [];
  const f = async (url, init) => {
    const body = JSON.parse(init.body); calls.push({ url, body });
    const mode = typeof opts.mode === 'function' ? opts.mode(calls.length, body) : (opts.mode || 'ok');
    if (opts.delay) await new Promise(r => setTimeout(r, opts.delay));
    if (mode === '429') return new Response('{"error":{"code":429,"message":"Resource exhausted per minute"}}', { status: 429 });
    if (mode === '429day') return new Response('{"error":{"code":429,"message":"Quota exceeded for metric GenerateRequestsPerDayPerProjectPerModel"}}', { status: 429 });
    if (mode === '500') return new Response('oops', { status: 500 });
    const user = body.contents[0].parts[0].text;
    const mod = moduleOf(user);
    let out = mod === 'regen' ? regenFor(user) : mod === 'test' ? { ok: true } : FIX[mod];
    let text = JSON.stringify(out);
    if (mode === 'badjson') text = 'Sure! here is the lesson: {not json';
    if (mode === 'fenced') text = '```json\n' + text + '\n```';
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1200, candidatesTokenCount: 900 } }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  f.calls = calls;
  return f;
}
