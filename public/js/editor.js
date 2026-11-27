'use strict';
/* editor.js: presentation studio */
const ED={L:null,i:0,sel:null,undo:[],redo:[],tab:'els',saving:'',drag:null};
const EMOJI={'تعليم':'📚✏️🎒🧮🔬🌍📐🖍️🏫🧪🔤🔢','طبيعة':'🌳🌸☀️🌙⭐🌈🌧️❄️🍂🌊🌵🌻','حيوانات':'🐱🐶🦁🐘🦒🐟🦋🐝🐪🐢🐇🐦','طعام':'🍎🍌🍇🥕🍓🍊🥒🍞🥛🧁🍉🥦','أشياء':'🏠🚗⚽🎈🎁⏰🔑☂️🧸🚀🪁🎨'};
const curS=()=>ED.L.slides[ED.i];
const selE=()=>curS()&&(curS().els||[]).find(e=>e.id===ED.sel);
function newLesson(o={}){return{id:uid(),title:o.title||'درس جديد',d:o.d||'adv',slides:o.slides||[L.cover(o.d||'adv',{title:o.title||'درس جديد'},1)],src:o.src||'blank',content:o.content||null,cat:o.cat||null,created:new Date().toISOString(),updated:new Date().toISOString()}}
async function openStudio(lesson,isNew){await ensureMe();if(isNew&&ME.lessons.length>=lim('saves'))return needPlan(`باقتك الحالية تحفظ ${ar(lim('saves'))} عروض فقط`);
 ED.L=lesson;ED.i=0;ED.sel=null;ED.undo=[];ED.redo=[];if(isNew){ME.lessons.unshift({...lesson,_id:'L_'+lesson.id});saveLesson(true)}
 if(location.hash==='#studio')route();else location.hash='studio'}
function vStudio(){if(!ED.L)return `<section class="band"><div class="wrap empty">${mascot('adv')}<h2>لا يوجد عرض مفتوح</h2><p class="lead">اختاري قالبًا أو درسًا جاهزًا، أو ابدئي عرضًا فارغًا.</p><div class="acts"><button class="btn pri" data-newblank>${ic('plus')}عرض فارغ</button><a class="btn sec" href="#templates">مكتبة القوالب</a></div></div></section>`;
 return `<section class="studio"><div class="stbar"><a class="ib" href="#dashboard" aria-label="العودة إلى لوحتي">${ic('arrow-right')}</a><input class="in sttitle" id="stTitle" value="${esc(ED.L.title)}" aria-label="عنوان العرض"><span class="svst" id="svst">${esc(ED.saving||'محفوظ')}</span><span class="grow"></span>
  <button class="ib" data-undo aria-label="تراجع">${ic('undo-2')}</button><button class="ib" data-redo aria-label="إعادة">${ic('redo-2')}</button><button class="btn sec" data-smart>${ic('wand-sparkles')}<span>تصميم ذكي</span></button><button class="btn sec" data-export>${ic('download')}<span>PowerPoint</span></button>${ED.L.content?`<button class="btn sec" data-myjr>${ic('map')}<span>رحلة</span></button>`:''}<button class="btn sec" data-playhere>${ic('eye')}<span>معاينة</span></button><button class="btn pri" data-playall>${ic('play')}<span>عرض</span></button></div>
  <div class="stmain"><aside class="stslides" id="stSlides" aria-label="الشرائح"></aside><div class="stcanvas"><div class="stage edit" id="edStage"></div><p class="note">اسحبي العناصر لتحريكها، واسحبي الزاوية لتغيير الحجم، وانقري مرتين على النص لتعديله. الأسهم للتحريك الدقيق وDelete للحذف.</p></div>
  <aside class="stpanel">${tabsHTML('ed',[['els','عناصر','shapes'],['bg','خلفية','palette'],['props','خصائص','sliders-horizontal'],['slide','الشريحة','layers']],ED.tab)}<div id="stPanel"></div></aside></div></section>`}
function stRender(){if(!ED.L)return;ED.i=Math.max(0,Math.min(ED.i,ED.L.slides.length-1));const s=curS();
 $('#edStage').innerHTML=slideHTML(s,{mode:'edit',sel:ED.sel});
 $('#stSlides').innerHTML=ED.L.slides.map((sl,k)=>`<div class="sth ${k===ED.i?'on':''}"><button class="sthb" data-go="${k}" aria-label="الشريحة ${ar(k+1)}"><span class="sthn">${ar(k+1)}</span>${thumb(sl)}</button>${k===ED.i?`<div class="sthc"><button class="ib sm" data-mv="-1" aria-label="لأعلى">${ic('arrow-up')}</button><button class="ib sm" data-mv="1" aria-label="لأسفل">${ic('arrow-down')}</button><button class="ib sm" data-dup aria-label="تكرار">${ic('copy')}</button><button class="ib sm" data-dels aria-label="حذف الشريحة">${ic('trash-2')}</button></div>`:''}</div>`).join('')+`<button class="btn sec addsl" data-addsl>${ic('plus')}شريحة</button>`;
 stPanel();icons()}
function stRefreshStage(){$('#edStage').innerHTML=slideHTML(curS(),{mode:'edit',sel:ED.sel});const t=$$('#stSlides .sthb')[ED.i];if(t)t.innerHTML=`<span class="sthn">${ar(ED.i+1)}</span>${thumb(curS())}`}
function push(){ED.undo.push(JSON.stringify(ED.L.slides));if(ED.undo.length>50)ED.undo.shift();ED.redo=[]}
function changed(full){if(full)stRender();else stRefreshStage();saveLesson()}
let _svT=0;
function saveLesson(now){clearTimeout(_svT);setSv('جارٍ الحفظ…');_svT=setTimeout(async()=>{const L0=ED.L;if(!L0)return;L0.updated=new Date().toISOString();const body=clone(L0);const size=JSON.stringify(body).length;
 if(size>250000){setSv('حجم كبير');toast('العرض كبير بسبب الصور. صغّري عدد الصور أو استخدمي رموزًا بدلًا منها.');return}
 try{await S.set(S.up('L_'+L0.id),body);const k=ME.lessons.findIndex(x=>x._id==='L_'+L0.id);if(k>=0)ME.lessons[k]={...body,_id:'L_'+L0.id};else ME.lessons.unshift({...body,_id:'L_'+L0.id});setSv('محفوظ')}catch(e){setSv('تعذّر الحفظ');toast(e&&e.code==='quota_exceeded'?'المساحة ممتلئة':'تعذّر الحفظ، سنحاول مع التعديل القادم')}},now?10:1100)}
function setSv(t){ED.saving=t;const e=$('#svst');if(e)e.textContent=t}
/* ---------- panels ---------- */
function stPanel(){const p=$('#stPanel');if(!p)return;const s=curS(),e=selE();
 if(ED.tab==='els')p.innerHTML=`<h3 class="ph">نصوص</h3><div class="pgrid">${[['title','عنوان كبير'],['body','نص عادي'],['tag','شارة عنوان'],['kick','عنوان صغير'],['bubble','فقاعة كلام']].map(([k,l])=>`<button class="pbtn" data-addtx="${k}">${l}</button>`).join('')}</div>
  <h3 class="ph">تفاعلي</h3><div class="pgrid">${[['mcq','اختيار من متعدد'],['tf','صح أم خطأ'],['order','رتّب الحروف'],['flip','بطاقة تنقلب'],['list','قائمة نقاط'],['goals','أهداف'],['steps','خطوات'],['cards','بطاقات أمثلة'],['scale','قيّم نفسك'],['game','لعبة'],['podium','منصة التتويج']].map(([k,l])=>`<button class="pbtn" data-addw="${k}">${l}</button>`).join('')}</div>
  <h3 class="ph">شخصيات</h3><div class="sgrid">${Object.keys(MASCOTS).map(k=>`<button class="sbtn tall" data-addm="${k}" aria-label="${MASCOTS[k]}">${mascot(k)}</button>`).join('')}</div>
  <h3 class="ph">ملصقات</h3><div class="sgrid">${Object.keys(STK).map(k=>`<button class="sbtn" data-adds="${k}" aria-label="${STK_NAMES[k]}">${STK[k]}</button>`).join('')}</div>
  <h3 class="ph">صور ورموز</h3>${Object.entries(EMOJI).map(([c,es])=>`<p class="note">${c}</p><div class="egrid">${Array.from(es.matchAll(/\p{Extended_Pictographic}️?/gu)).map(m=>`<button class="ebtn" data-adde="${m[0]}">${m[0]}</button>`).join('')}</div>`).join('')}<button class="btn sec" data-addimg>${ic('image-up')}ارفعي صورة</button>
  <h3 class="ph">أشكال</h3><div class="pgrid">${[['card','بطاقة'],['mini','بطاقة صغيرة'],['note','ورقة ملاحظة'],['ribbon','شريط'],['page','صفحة كتاب'],['circle','دائرة']].map(([k,l])=>`<button class="pbtn" data-addbx="${k}">${l}</button>`).join('')}</div>`;
 else if(ED.tab==='bg')p.innerHTML=`<h3 class="ph">عوالم مرسومة</h3><div class="bgg">${DK.map(k=>`<button class="bgb ${s.bg==null&&s.d===k?'on':''}" data-bgd="${k}"><div class="stage pv">${noBtn(slideHTML({d:k,els:[]}))}</div><span>${DESIGNS[k].name}</span></button>`).join('')}</div>
  <h3 class="ph">ألوان وتدرّجات</h3><div class="pgrid sw">${GRADS.map((g,i)=>`<button class="swb ${s.bg===i?'on':''}" data-bgg="${i}" style="background:${g}" aria-label="خلفية ${ar(i+1)}"></button>`).join('')}</div><button class="btn sec" data-bgall>${ic('copy-check')}طبّقي على كل الشرائح</button>`;
 else if(ED.tab==='slide')p.innerHTML=`<label class="lab">الانتقال إلى هذه الشريحة<select class="in" data-str>${[['fade','تلاشي'],['slide','انزلاق'],['zoom','تكبير'],['flip','قلب'],['none','بدون']].map(([k,l])=>`<option value="${k}" ${s.tr===k?'selected':''}>${l}</option>`).join('')}</select></label><div class="acts"><button class="btn sec" data-dup>${ic('copy')}تكرار الشريحة</button><button class="btn sec" data-dels>${ic('trash-2')}حذف الشريحة</button></div><h3 class="ph">إضافة شريحة جاهزة</h3>${layoutMenu()}`;
 else{if(!e){p.innerHTML=`<p class="note">اختاري عنصرًا من الشريحة لتعديل خصائصه.</p>`;return}p.innerHTML=propsHTML(e)}
 icons()}
const LAYOUTS=[['cover','غلاف'],['model','نمذجة'],['mistakes','خطأ شائع'],['activity','نشاط بمؤقت'],['levels','أنشطة متمايزة'],['exit','بطاقة خروج'],['text','نص'],['textPic','نص وصورة'],['goals','أهداف'],['mcq','سؤال اختيار'],['tf','صح أم خطأ'],['order','رتّب الحروف'],['flip','بطاقة'],['count','عُدّ معي'],['list','قائمة'],['steps','خطوات'],['story','صفحة قصة'],['scale','قيّم نفسك'],['game','لعبة'],['reward','تتويج'],['blank','فارغة']];
const layoutMenu=()=>`<div class="lgrid">${LAYOUTS.map(([k,l])=>`<button class="lbtn" data-lay="${k}">${thumb(mkLayout(k,curS()?curS().d:'adv'))}<span>${l}</span></button>`).join('')}</div>`;
function mkLayout(k,d){switch(k){case 'cover':return L.cover(d,{title:'عنوان الدرس'},1);case 'goals':return L.goals(d,['الهدف الأول','الهدف الثاني','الهدف الثالث'],1);case 'mcq':return L.mcq(d,['اكتبي السؤال هنا','❓','الإجابة الصحيحة','خيار','خيار']);case 'tf':return L.tf(d,['اكتبي العبارة هنا','🤔','صح']);case 'order':return L.order(d,['قلم','✏️']);case 'flip':return L.flip(d,['كلمة','⭐','معلومة قصيرة']);case 'count':return L.count(d,['🍎','3']);case 'list':return L.list(d,'تذكّروا',['النقطة الأولى','النقطة الثانية','النقطة الثالثة']);case 'steps':return L.steps(d,'الخطوات',['الخطوة الأولى','الخطوة الثانية','الخطوة الثالثة']);case 'story':return L.story(d,['كان يا ما كان…','📖'],0,1);case 'scale':return L.scale(d);case 'game':return L.game(d,'g-wheel');case 'reward':return L.reward(d);case 'blank':return L.blank(d);case 'model':return L.model(d,['الخطوة الأولى','الخطوة الثانية','الخطوة الثالثة']);case 'mistakes':return L.mistakes(d,[['الخطأ الشائع','الصواب']]);case 'activity':return L.activity(d,'فكّر · زاوج · شارك',['فكّر وحدك','ناقش زميلك','شاركا الصف'],3);case 'levels':return L.levels(d,'أنشطة متمايزة',[{lv:'أنطلق',t:'نشاط الدعم'},{lv:'أتقدّم',t:'النشاط الأساسي'},{lv:'أتميّز',t:'نشاط الإثراء'}]);case 'exit':return L.exit(d,'اكتبي سؤال بطاقة الخروج');default:return L[k](d)}}
function propsHTML(e){const com=`<div class="pcom"><label class="lab">الحركة عند الظهور<select class="in" data-pa="anim">${[['none','بدون'],['pop','قفزة'],['fly','دخول جانبي'],['bounce','ارتداد'],['fade','تلاشي']].map(([k,l])=>`<option value="${k}" ${e.anim===k?'selected':''}>${l}</option>`).join('')}</select></label><label class="lab">الدوران<input type="range" min="-30" max="30" value="${num(e.r)}" data-pa="r"></label><div class="acts"><button class="ib" data-front aria-label="للأمام">${ic('bring-to-front')}</button><button class="ib" data-back aria-label="للخلف">${ic('send-to-back')}</button><button class="ib" data-dupe aria-label="تكرار العنصر">${ic('copy')}</button><button class="ib" data-dele aria-label="حذف العنصر">${ic('trash-2')}</button></div></div>`;
 let h='';
 if(e.t==='text')h=`<label class="lab">النص<textarea class="in" rows="3" data-pa="txt">${esc(e.txt)}</textarea></label><label class="lab">الحجم<input type="range" min="2" max="18" step=".2" value="${num(e.fs)||5}" data-pa="fs"></label><label class="lab">النمط<select class="in" data-pa="s">${[['title','عنوان'],['body','نص'],['tag','شارة'],['kick','عنوان صغير'],['bubble','فقاعة'],['story','قصة'],['label','تسمية']].map(([k,l])=>`<option value="${k}" ${e.s===k?'selected':''}>${l}</option>`).join('')}</select></label><div class="lab">اللون<div class="pgrid sw">${PALETTE.map(c=>`<button class="swb ${e.c===c?'on':''}" data-pcol="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}<button class="swb clr" data-pcol="" aria-label="اللون الافتراضي">${ic('rotate-ccw')}</button></div></div><div class="acts"><button class="ib ${e.al==='right'||!e.al?'on':''}" data-pal="right" aria-label="يمين">${ic('align-right')}</button><button class="ib ${e.al==='center'?'on':''}" data-pal="center" aria-label="وسط">${ic('align-center')}</button><button class="ib ${e.al==='left'?'on':''}" data-pal="left" aria-label="يسار">${ic('align-left')}</button><button class="ib ${e.b?'on':''}" data-pbold aria-label="عريض">${ic('bold')}</button></div>`;
 if(e.t==='pic')h=`<div class="lab">الصورة<div class="row">${isSrc(e.src)?`<img class="pimg" src="${safeSrc(e.src)}" alt="">`:`<input class="in" data-pa="emo" value="${esc(e.emo||'')}">`}<button class="btn sec" data-repimg>${ic('image-up')}ارفعي صورة</button></div></div><label class="lab">الإطار<select class="in" data-pa="fr">${[['none','بدون'],['spot','دائرة أشعة'],['circle','دائرة'],['frame','إطار صورة']].map(([k,l])=>`<option value="${k}" ${e.fr===k?'selected':''}>${l}</option>`).join('')}</select></label>`;
 if(e.t==='stk')h=`<div class="sgrid">${Object.keys(STK).map(k=>`<button class="sbtn ${e.k===k?'on':''}" data-pstk="${k}" aria-label="${STK_NAMES[k]}">${STK[k]}</button>`).join('')}</div>`;
 if(e.t==='masc')h=`<label class="lab">الشخصية<select class="in" data-pa="k">${Object.entries(MASCOTS).map(([k,l])=>`<option value="${k}" ${e.k===k?'selected':''}>${l}</option>`).join('')}</select></label><label class="lab">ماذا تقول؟<input class="in" data-pa="say" value="${esc(e.say||'')}"></label>`;
 if(e.t==='box')h=`<label class="lab">الشكل<select class="in" data-pa="s">${[['card','بطاقة'],['cover','غلاف'],['mini','بطاقة صغيرة'],['note','ورقة ملاحظة'],['ribbon','شريط'],['page','صفحة كتاب'],['circle','دائرة']].map(([k,l])=>`<option value="${k}" ${e.s===k?'selected':''}>${l}</option>`).join('')}</select></label>`;
 if(e.t==='w')h=widgetProps(e);
 return `<h3 class="ph">${{text:'نص',pic:'صورة',stk:'ملصق',masc:'شخصية',box:'شكل',w:'عنصر تفاعلي'}[e.t]}</h3>${h}${com}`}
function widgetProps(e){const w=e.data=e.data||{};const lines=a=>esc((a||[]).join('\n'));
 switch(e.kind){
  case 'mcq':return w.tf?`<label class="lab">العبارة<input class="in" data-pw="q" value="${esc(w.q)}"></label><label class="lab">الرمز<input class="in" data-pw="pic" value="${esc(isSrc(w.pic)?'':w.pic||'')}"></label><label class="lab">الإجابة الصحيحة<select class="in" data-pwtf>${['صح','خطأ'].map(o=>`<option ${(w.opts||[]).find(x=>x.ok)&&(w.opts||[]).find(x=>x.ok).x===o?'selected':''}>${o}</option>`).join('')}</select></label>`
   :`<label class="lab">السؤال<input class="in" data-pw="q" value="${esc(w.q)}"></label><label class="lab">الرمز أو الصورة<input class="in" data-pw="pic" value="${esc(isSrc(w.pic)?'':w.pic||'')}"></label>${w.n?`<label class="lab">العدد في السلة<input class="in" type="number" min="1" max="12" data-pw="n" value="${w.n}"></label>`:''}<fieldset class="rows"><legend>الخيارات (اختاري الصحيح)</legend>${(w.opts||[]).map((o,i)=>`<div class="row"><input type="radio" name="okopt" data-pok="${i}" ${o.ok?'checked':''} aria-label="الإجابة الصحيحة"><input class="in" data-popt="${i}" value="${esc(o.x)}">${o.p!=null?`<input class="in s" data-popp="${i}" value="${esc(isSrc(o.p)?'':o.p)}" aria-label="رمز">`:''}<button class="ib" data-pdel="${i}" aria-label="حذف">${ic('x')}</button></div>`).join('')}${(w.opts||[]).length<4?`<button class="btn ter" data-padd>${ic('plus')}خيار</button>`:''}</fieldset>`;
  case 'order':return `<label class="lab">الكلمة<input class="in" data-pw="word" value="${esc(w.word)}"></label><label class="lab">الرمز<input class="in" data-pw="pic" value="${esc(w.pic||'')}"></label>`;
  case 'flip':return `<label class="lab">الكلمة<input class="in" data-pw="word" value="${esc(w.word)}"></label><label class="lab">الرمز<input class="in" data-pw="pic" value="${esc(w.pic||'')}"></label><label class="lab">المعلومة خلف البطاقة<input class="in" data-pw="info" value="${esc(w.info)}"></label>`;
  case 'levels':return `<label class="lab">نشاط أنطلق<input class="in" data-plv="0" value="${esc((w.items[0]||{}).t||'')}"></label><label class="lab">نشاط أتقدّم<input class="in" data-plv="1" value="${esc((w.items[1]||{}).t||'')}"></label><label class="lab">نشاط أتميّز<input class="in" data-plv="2" value="${esc((w.items[2]||{}).t||'')}"></label>`;
  case 'list':case 'goals':case 'steps':case 'tasks':return `<label class="lab">العناصر، كل عنصر في سطر<textarea class="in" rows="5" data-pwl="items">${lines(w.items)}</textarea></label>`;
  case 'cards':return `<label class="lab">الأمثلة، كل سطر: رمز ثم النص<textarea class="in" rows="5" data-pwc>${esc((w.items||[]).map(x=>(isSrc(x.pic)?'🖼️':x.pic)+' '+x.txt).join('\n'))}</textarea></label>`;
  case 'scale':return `<label class="lab">السؤال<input class="in" data-pw="q" value="${esc(w.q||'')}"></label>`;
  case 'game':return `<label class="lab">اللعبة<select class="in" data-pw="ref">${allGames().map(g=>`<option value="${esc(g.id)}" ${w.ref===g.id?'selected':''}>${esc(g.title)}</option>`).join('')}</select></label>`;
  case 'podium':return `<p class="note">تعرض أفضل ثلاثة فرق من الفصل المختار تلقائيًا.</p>`}return ''}
const WDEF={mcq:{q:'اكتبي السؤال هنا',pic:'❓',opts:[{x:'الإجابة الصحيحة',ok:1},{x:'خيار'},{x:'خيار'}]},tf:{q:'اكتبي العبارة',pic:'🤔',tf:1,opts:[{x:'صح',ok:1},{x:'خطأ'}]},order:{word:'قلم',pic:'✏️'},flip:{word:'كلمة',pic:'⭐',info:'معلومة'},list:{items:['النقطة الأولى','النقطة الثانية']},goals:{items:['الهدف الأول','الهدف الثاني']},steps:{items:['الخطوة الأولى','الخطوة الثانية']},cards:{items:[{pic:'🍎',txt:'مثال'},{pic:'🍌',txt:'مثال'}]},scale:{q:'كيف كان فهمك للدرس؟'},game:{ref:'g-wheel'},podium:{}};
function addEl(el){push();const s=curS();s.els=s.els||[];el.z=Math.max(0,...s.els.map(x=>x.z|0))+1;s.els.push(el);ED.sel=el.id;ED.tab='props';$$('.stpanel .tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.k==='props'));changed(true)}
/* ---------- events ---------- */
function bindStudio(){const app=$('#app');
 app.onclick=async e=>{const b=e.target.closest('button');if(!b){return}const d=b.dataset;if(!ED.L){if(b.hasAttribute('data-newblank'))openStudio(newLesson(),true);return}const s=curS(),el=selE();
  if(d.tab==='ed'){ED.tab=d.k;$$('.tab',b.parentElement).forEach(x=>x.setAttribute('aria-selected',x===b));return stPanel()}
  if(d.go!=null){ED.i=+d.go;ED.sel=null;return stRender()}
  if(d.mv){const j=ED.i+ +d.mv;if(j<0||j>=ED.L.slides.length)return;push();const a=ED.L.slides;[a[ED.i],a[j]]=[a[j],a[ED.i]];ED.i=j;return changed(true)}
  if(b.hasAttribute('data-dup')){push();const c=clone(s);c.id=uid();c.els.forEach(x=>x.id=uid());ED.L.slides.splice(ED.i+1,0,c);ED.i++;return changed(true)}
  if(b.hasAttribute('data-dels')){if(ED.L.slides.length<2)return toast('يجب أن يبقى في العرض شريحة واحدة على الأقل');push();ED.L.slides.splice(ED.i,1);ED.sel=null;return changed(true)}
  if(b.hasAttribute('data-addsl')){const dl=openDialog(`<h2 class="dh">إضافة شريحة</h2>${layoutMenu()}`,{wide:1,focus:false});dl.onclick=ev=>{const x=ev.target.closest('[data-lay]');if(!x)return;push();ED.L.slides.splice(ED.i+1,0,mkLayout(x.dataset.lay,s.d));ED.i++;ED.sel=null;closeDialog(dl);changed(true)};return}
  if(d.lay){push();ED.L.slides.splice(ED.i+1,0,mkLayout(d.lay,s.d));ED.i++;ED.sel=null;return changed(true)}
  if(b.hasAttribute('data-undo')){if(!ED.undo.length)return;ED.redo.push(JSON.stringify(ED.L.slides));ED.L.slides=JSON.parse(ED.undo.pop());ED.sel=null;return changed(true)}
  if(b.hasAttribute('data-redo')){if(!ED.redo.length)return;ED.undo.push(JSON.stringify(ED.L.slides));ED.L.slides=JSON.parse(ED.redo.pop());ED.sel=null;return changed(true)}
  if(b.hasAttribute('data-playhere'))return openPlayer(ED.L.slides,ED.L.title,{start:ED.i});
  if(b.hasAttribute('data-playall'))return openPlayer(ED.L.slides,ED.L.title);
  if(b.hasAttribute('data-myjr'))return openJourney({id:ED.L.id,title:ED.L.title,c:ED.L.content,d:ED.L.d,subj:ED.L.content.sub});
  if(b.hasAttribute('data-export'))return exportPptx(ED.L);
  if(b.hasAttribute('data-smart'))return smartDialog();
  if(d.addtx){const st={title:[7,'عنوان جديد'],body:[4.4,'نص جديد'],tag:[3.6,'شارة'],kick:[3.6,'عنوان صغير'],bubble:[4,'مرحبًا!']}[d.addtx];return addEl(EL('text',{txt:st[1],s:d.addtx,fs:st[0],x:30,y:40,w:d.addtx==='tag'||d.addtx==='kick'?24:44,al:d.addtx==='tag'?'center':'right'}))}
  if(d.addw)return addEl(EL('w',{kind:d.addw==='tf'?'mcq':d.addw,data:clone(WDEF[d.addw]),x:24,y:18,w:66,h:66,anim:'pop'}));
  if(d.addm)return addEl(EL('masc',{k:d.addm,x:4,y:46,w:16,say:''}));
  if(d.adds)return addEl(EL('stk',{k:d.adds,x:44,y:40,w:10}));
  if(d.adde)return addEl(EL('pic',{emo:d.adde,fr:'none',x:42,y:36,w:16}));
  if(d.addbx)return addEl(EL('box',{s:d.addbx,x:30,y:25,w:40,h:d.addbx==='circle'?50:40,z:0}));
  if(b.hasAttribute('data-addimg')||b.hasAttribute('data-repimg')){if(!lim('upload'))return needPlan('رفع الصور متاح في الباقة الأساسية فما فوق');const src=await pickImage();if(!src)return;if(b.hasAttribute('data-repimg')&&el){push();el.src=src;delete el.emo;return changed(true)}return addEl(EL('pic',{src,fr:'frame',x:35,y:25,w:30}))}
  if(d.bgd!=null){push();s.d=d.bgd;delete s.bg;return changed(true)}
  if(d.bgg!=null){push();s.bg=+d.bgg;return changed(true)}
  if(b.hasAttribute('data-bgall')){push();ED.L.slides.forEach(x=>{x.d=s.d;if(s.bg!=null)x.bg=s.bg;else delete x.bg});ED.L.d=s.d;toast('طُبّقت الخلفية على كل الشرائح');return changed(true)}
  if(!el)return;
  if(d.pcol!=null){push();if(d.pcol)el.c=d.pcol;else delete el.c;return changed(true)}
  if(d.pal){push();el.al=d.pal;return changed(true)}
  if(b.hasAttribute('data-pbold')){push();el.b=!el.b;return changed(true)}
  if(d.pstk){push();el.k=d.pstk;return changed(true)}
  if(b.hasAttribute('data-front')){push();el.z=Math.max(...s.els.map(x=>x.z|0))+1;return changed(true)}
  if(b.hasAttribute('data-back')){push();el.z=Math.min(...s.els.map(x=>x.z|0))-1;return changed(true)}
  if(b.hasAttribute('data-dupe')){const c=clone(el);c.id=uid();c.x=num(c.x)+3;c.y=num(c.y)+3;return addEl(c)}
  if(b.hasAttribute('data-dele')){push();s.els=s.els.filter(x=>x!==el);ED.sel=null;return changed(true)}
  if(d.pdel!=null){push();el.data.opts.splice(+d.pdel,1);if(!el.data.opts.some(o=>o.ok)&&el.data.opts[0])el.data.opts[0].ok=1;return changed(true)}
  if(b.hasAttribute('data-padd')){push();el.data.opts.push({x:'خيار',p:el.data.big?'⭐':undefined});return changed(true)}};
 app.oninput=e=>{const t=e.target,el=selE();if(t.id==='stTitle'){ED.L.title=t.value.slice(0,80);return saveLesson()}if(!el)return;const d=t.dataset;
  if(!ED._typing){push();ED._typing=1}clearTimeout(ED._tt);ED._tt=setTimeout(()=>ED._typing=0,800);
  if(d.pa){el[d.pa]=['fs','r'].includes(d.pa)?num(t.value):t.value}
  else if(d.pw){el.data[d.pw]=d.pw==='n'?Math.min(12,Math.max(1,num(t.value)|0)):t.value}
  else if(d.plv!==undefined){const it=el.data.items||(el.data.items=[]);const k=+d.plv;it[k]=it[k]||{lv:['أنطلق','أتقدّم','أتميّز'][k],t:''};it[k].t=t.value}
  else if(d.pwl)el.data[d.pwl]=t.value.split('\n').map(x=>x.trim()).filter(Boolean);
  else if(d.pwc!=null)el.data.items=t.value.split('\n').map(x=>x.trim()).filter(Boolean).map(x=>{const m=x.match(/^(\S+)\s+(.*)$/);return m?{pic:m[1],txt:m[2]}:{pic:'⭐',txt:x}});
  else if(d.popt!=null)el.data.opts[+d.popt].x=t.value;else if(d.popp!=null)el.data.opts[+d.popp].p=t.value;else return;
  if(el.kind==='order'&&d.pw==='word'){const w=String(el.data.word||'').replace(/\s/g,'');el.data.mix=shuffle(Array.from(w))}
  stRefreshStage();saveLesson()};
 app.onchange=e=>{const t=e.target,s=curS(),el=selE();if(!s)return;
  if(t.dataset.str){push();s.tr=t.value;return saveLesson()}
  if(!el)return;if(t.dataset.pok!=null){push();el.data.opts.forEach((o,i)=>o.ok=i===+t.dataset.pok?1:0);return changed()}
  if(t.dataset.pwtf!=null){push();el.data.opts=[{x:'صح',ok:t.value==='صح'},{x:'خطأ',ok:t.value==='خطأ'}];return changed()}
  if(t.tagName==='SELECT'&&(t.dataset.pa||t.dataset.pw)){if(t.dataset.pa)el[t.dataset.pa]=t.value;else el.data[t.dataset.pw]=t.value;changed(true)}};
 const stg=$('#edStage');if(!stg)return;
 stg.onpointerdown=e=>{if(!ED.L)return;const tgt=e.target.closest('.el');if(!tgt){if(ED.sel){ED.sel=null;stRefreshStage();stPanel()}return}if(tgt.querySelector('[contenteditable=true]'))return;
  const s=curS(),el=s.els.find(x=>x.id===tgt.dataset.id);if(!el)return;const rh=e.target.closest('[data-rh]');
  if(ED.sel!==el.id){ED.sel=el.id;stRefreshStage();if(ED.tab!=='props'){ED.tab='props';$$('.stpanel .tab').forEach(b=>b.setAttribute('aria-selected',b.dataset.k==='props'))}stPanel()}
  const r=stg.getBoundingClientRect(),sx=e.clientX,sy=e.clientY,x0=num(el.x),y0=num(el.y),w0=num(el.w)||20,h0=num(el.h);let moved=false;const node=()=>$(`[data-id="${CSS.escape(el.id)}"]`,stg);
  const mv=ev=>{const dx=(ev.clientX-sx)/r.width*100,dy=(ev.clientY-sy)/r.height*100;if(!moved&&Math.hypot(ev.clientX-sx,ev.clientY-sy)<3)return;if(!moved){push();moved=true}const n=node();if(!n)return;
   if(rh){el.w=Math.max(4,Math.min(100,+(w0+dx).toFixed(1)));n.style.width=el.w+'%';if(h0){el.h=Math.max(4,Math.min(100,+(h0+dy).toFixed(1)));n.style.height=el.h+'%'}}
   else{el.x=Math.max(-10,Math.min(98,+(x0+dx).toFixed(1)));el.y=Math.max(-10,Math.min(98,+(y0+dy).toFixed(1)));n.style.left=el.x+'%';n.style.top=el.y+'%'}};
  const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(moved)changed()};addEventListener('pointermove',mv);addEventListener('pointerup',up)};
 stg.ondblclick=e=>{const tgt=e.target.closest('.el-text');if(!tgt)return;const el=selE();if(!el)return;const tx=$('.tx',tgt);tx.contentEditable='true';tx.focus();const rg=document.createRange();rg.selectNodeContents(tx);const sl=getSelection();sl.removeAllRanges();sl.addRange(rg);
  tx.onblur=()=>{tx.contentEditable='false';const v=tx.innerText.trim();if(v!==el.txt){push();el.txt=v;changed()}else stRefreshStage();stPanel()}}}
function studioKeys(e){if(location.hash!=='#studio'||!ED.L||PL||GR.on||$('.dlg'))return;const ae=document.activeElement;if(ae&&(/INPUT|TEXTAREA|SELECT/.test(ae.tagName)||ae.isContentEditable))return;const el=selE(),mod=e.ctrlKey||e.metaKey;
 if(mod&&e.key.toLowerCase()==='z'){e.preventDefault();$(e.shiftKey?'[data-redo]':'[data-undo]').click();return}if(mod&&e.key.toLowerCase()==='y'){e.preventDefault();$('[data-redo]').click();return}
 if(!el)return;if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();$('[data-dele]')&&$('[data-dele]').click();return}
 if(mod&&e.key.toLowerCase()==='d'){e.preventDefault();$('[data-dupe]')&&$('[data-dupe]').click();return}
 const st={ArrowLeft:[-.5,0],ArrowRight:[.5,0],ArrowUp:[0,-.5],ArrowDown:[0,.5]}[e.key];if(st){e.preventDefault();push();el.x=+(num(el.x)+st[0]*(e.shiftKey?4:1)).toFixed(1);el.y=+(num(el.y)+st[1]*(e.shiftKey?4:1)).toFixed(1);changed()}}
document.addEventListener('keydown',studioKeys);

/* ---------- smart design: enter content, the platform designs the lesson ---------- */
function smartDialog(prefill){const st={cat:(prefill&&prefill.cat)||'explain',d:(prefill&&prefill.d)||(ED.L?curS().d:'adv'),v:1,c:clone((prefill&&prefill.c)||TPL_SAMPLES[(prefill&&prefill.cat)||'explain'])};
 const d=openDialog(`<h2 class="dh">${ic('wand-sparkles')} أدخلي المحتوى ودعي المنصة تصمّم الدرس</h2><div class="smart"><div><label class="lab">نوع العرض<select class="in" id="smCat">${CATS.map(c=>`<option value="${c.id}" ${c.id===st.cat?'selected':''}>${c.name}</option>`).join('')}</select></label><div class="lab">نمط التصميم${designBtns(st.d,'data-smd')}</div><div class="lab">ترتيب العناصر<div class="chips">${STYLE_NAMES.map((n,i)=>`<button type="button" class="chip" data-smv="${i+1}" aria-pressed="${i===0}">${n}</button>`).join('')}</div></div><div id="smForm"></div></div><div class="smprev"><div id="smPrev"></div><div class="acts">${ED.L&&location.hash==='#studio'?`<button class="btn sec" data-smapp>${ic('plus')}أضيفي إلى العرض الحالي</button>`:''}<button class="btn pri" data-smnew>${ic('wand-sparkles')}صمّمي عرضًا جديدًا</button></div><p class="note">يمكنك تعديل كل شريحة بعد التصميم.</p></div></div>`,{wide:1,focus:false});
 const prev=()=>{const sl=compose(st.cat,st.c,st.d,st.v);$('#smPrev',d).innerHTML=gallery('smGal',sl.map((s,i)=>({slide:s,label:ar(i+1)})),{label:'معاينة'});icons();initGals($('#smPrev',d))};
 const form=()=>{bindForm($('#smForm',d),CAT_FIELDS[st.cat],st.c,prev);prev()};form();
 d.addEventListener('change',e=>{if(e.target.id==='smCat'){st.cat=e.target.value;st.c=clone(TPL_SAMPLES[st.cat]);form()}});
 d.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.smd){st.d=b.dataset.smd;$$('[data-smd]',d).forEach(x=>{x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});prev()}
  if(b.dataset.smv){st.v=+b.dataset.smv;$$('[data-smv]',d).forEach(x=>x.setAttribute('aria-pressed',x===b));prev()}
  if(b.hasAttribute('data-smapp')){push();ED.L.slides.push(...compose(st.cat,st.c,st.d,st.v));closeDialog(d);changed(true);toast('أُضيفت الشرائح إلى العرض')}
  if(b.hasAttribute('data-smnew')){closeDialog(d);openStudio(newLesson({title:st.c.title||'درس جديد',d:st.d,slides:compose(st.cat,st.c,st.d,st.v),src:'smart:'+st.cat,content:clone(st.c),cat:st.cat}),true)}})}

/* ---------- PowerPoint export ---------- */
function loadScript(src){return new Promise((res,rej)=>{if($(`script[src="${src}"]`))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
function svgPng(svg,w,h){return new Promise(res=>{const x=svg.replace('<svg ',`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" `);const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);try{res(c.toDataURL('image/png'))}catch(e){res(null)}};im.onerror=()=>res(null);im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(x)})}
async function exportPptx(Ls){if(!lim('export'))return needPlan('تصدير PowerPoint متاح في الباقة الأساسية فما فوق');toast('جارٍ تجهيز ملف PowerPoint…');
 try{await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.bundle.js')}catch(e){return toast('تعذّر تحميل أداة التصدير، حاولي لاحقًا')}
 try{const P=new PptxGenJS();P.layout='LAYOUT_16x9';P.rtlMode=true;P.title=Ls.title;const H=5.625,Wd=10,pt=v=>Math.max(8,Math.round(num(v)*H*72/100));
  for(const s of Ls.slides){const sl=P.addSlide();const D=DESIGNS[s.d]||DESIGNS.adv;
   if(s.bg!=null&&GRADS[s.bg]){const m=GRADS[s.bg].match(/#[0-9a-f]{6}/i);sl.background={color:(m?m[0]:'#ffffff').slice(1)}}else{const bg=await svgPng(scene(s.d||'adv'),1600,900);if(bg)sl.background={data:bg.replace(/^data:/,'')}}
   if(s.n&&sl.addNotes)sl.addNotes(s.n);
   for(const e of (s.els||[]).slice().sort((a,b)=>(a.z|0)-(b.z|0))){const x=num(e.x)/100*Wd,y=num(e.y)/100*H,w=(num(e.w)||20)/100*Wd,h=e.h?num(e.h)/100*H:null;const tx={fontFace:'Arial',rtlMode:true,align:e.al==='left'?'left':e.al==='center'?'center':'right',valign:'top'};
    if(e.t==='box'){sl.addShape(P.ShapeType.roundRect,{x,y,w,h:h||1,fill:{color:e.s==='note'?'FEF9C3':'FFFFFF',transparency:e.s==='card'||e.s==='cover'?6:0},rectRadius:.2,line:{color:D.c3.slice(1),width:1}});continue}
    if(e.t==='text'){const tag=e.s==='tag'||e.s==='kick';sl.addText(String(e.txt||''),{...tx,x,y,w,h:h||Math.max(.4,pt(e.fs)/72*1.6*Math.ceil(String(e.txt||'').length/Math.max(8,w*7))),fontSize:pt(e.fs),bold:e.s==='title'||!!e.b,color:(hex(e.c)||(tag&&e.s==='tag'?'#ffffff':'#1f2937')).slice(1),fill:e.s==='tag'?{color:D.c.slice(1)}:undefined});continue}
    if(e.t==='pic'){const src=safeSrc(e.src);if(src&&src.startsWith('data:'))sl.addImage({data:src.replace(/^data:/,''),x,y,w,h:w*.75});else sl.addText(e.emo||'⭐',{x,y,w,h:w*1.1,fontSize:Math.round(w*72*.7),align:'center'});continue}
    if(e.t==='stk'||e.t==='masc'){const svg=e.t==='stk'?(STK[e.k]||STK.star):mascot(e.k||D.m);const ar_=e.t==='masc'?256/200:1;const png=await svgPng(svg,400,Math.round(400*ar_));if(png)sl.addImage({data:png.replace(/^data:/,''),x,y,w,h:w*ar_*Wd/Wd});if(e.say)sl.addText(e.say,{...tx,x:x+w*.3,y:Math.max(0,y-.4),w:w*1.6,h:.35,fontSize:11,fill:{color:'FFFFFF'},color:'1F2937',align:'center'});continue}
    if(e.t==='w'){const wd=e.data||{};let lines=[];
     if(e.kind==='mcq'){sl.addText(String(wd.q||''),{...tx,x,y,w,h:.6,fontSize:22,bold:true,color:'1F2937',align:'center'});(wd.opts||[]).forEach((o,i)=>{const n=(wd.opts||[]).length,bw=w/n-.15;sl.addText((wd.tf?'':'أبجد'[i]+'. ')+String(o.x||o.p||''),{...tx,x:x+i*(bw+.15),y:y+(h||3)*.55,w:bw,h:.6,fontSize:18,bold:true,align:'center',color:'1F2937',fill:{color:'FFFFFF'},line:{color:'CBD5E1',width:1.5}})});continue}
     if(['list','goals','steps','tasks'].includes(e.kind))lines=(wd.items||[]).map((t,i)=>(e.kind==='steps'?ar(i+1)+'. ':'• ')+t);
     else if(e.kind==='cards')lines=(wd.items||[]).map(t=>(isSrc(t.pic)?'':t.pic+' ')+t.txt);else if(e.kind==='flip')lines=[`${wd.pic||''} ${wd.word||''}`,wd.info||''];
     else if(e.kind==='order')lines=['رتّبوا الحروف: '+(wd.mix||Array.from(String(wd.word||''))).join('  ')];else if(e.kind==='scale')lines=[...(wd.p?['بطاقة الخروج: '+wd.p,'']:[]),wd.q||'','😀  🙂  🤔'];
     else if(e.kind==='levels')lines=(wd.items||[]).map(t=>{const k=LVK(t.lv);return `${k?LVL[k].n+' ('+LVL[k].d+')':t.lv}: ${t.t}`});
     else if(e.kind==='compare')lines=(wd.items||[]).flatMap(r=>['✗ '+r[0],'✓ '+r[1],'']);
     else if(e.kind==='timer')lines=[`${wd.strategy||'نشاط تعاوني'} · ${ar(num(wd.min)||3)} دقائق`,...(wd.steps||[]).map((t,i)=>ar(i+1)+'. '+t)];
     else if(e.kind==='game'){const g=findGame(wd.ref);lines=['لعبة الدرس: '+(g?g.title:'')]}else if(e.kind==='podium')lines=['أحسنتم يا أبطال! 🏆'];
     sl.addText(lines.join('\n'),{...tx,x,y,w,h:h||3,fontSize:20,color:'1F2937',paraSpaceAfter:6})}}}
  const blob=await P.write({outputType:'blob'}),fn=(Ls.title||'عرض').replace(/[\\/:*?"<>|]/g,'')+'.pptx';
  if(S.dl){try{await S.dl.save({filename:fn,data:blob});toast('تم حفظ الملف')}catch(e){if(e&&e.code!=='declined')toast('تعذّر حفظ الملف هنا')}}else{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=fn;a.click()}}
 catch(e){console.error(e);toast('حدث خطأ أثناء التصدير')}}
