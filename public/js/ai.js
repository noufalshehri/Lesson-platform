'use strict';
/* ai.js: «مساعد مضبوط» AI workspace. The server returns validated JSON only; this file turns it into the
   platform's own objects (slides via L.* and compose(), games via GTYPES, class exams, printable sheets),
   so every interaction runs on the existing, tested components. No model HTML is ever inserted. */
const AI={st:null,stAt:0,view:'home',mod:null,busy:false,res:null,form:null,lib:null,gi:0,edit:false,tmp:[]};
const AIM={
 presentation:{n:'العرض التفاعلي',d:'شرائح كاملة بتهيئة وأمثلة وأنشطة تفاعلية وتقويم ختامي.',pic:'🚀',ic:'presentation',btn:'ولّدي العرض'},
 lesson:{n:'الدرس الكامل',d:'درس بمراحل الحصة وملاحظات المعلمة وتمايز، مع وضع رحلة الدرس.',pic:'📚',ic:'book-open-check',btn:'ولّدي الدرس'},
 quiz:{n:'الاختبار القصير',d:'أسئلة متنوعة بنموذجين ونموذج إجابة، تُضاف لاختبارات فصلك.',pic:'🎯',ic:'clipboard-check',btn:'ولّدي الاختبار'},
 game:{n:'اللعبة التعليمية',d:'لعبة جاهزة من ألعاب المنصة بأسئلة درسك.',pic:'🧩',ic:'gamepad-2',btn:'ولّدي اللعبة'},
 worksheet:{n:'ورقة العمل',d:'ورقة مطبوعة بأقسام متنوعة ونموذج إجابة.',pic:'✏️',ic:'file-pen-line',btn:'ولّدي ورقة العمل'},
 prep:{n:'تحضير الدرس',d:'خطة درس بالأهداف والمراحل والأزمنة والتقويم والتمايز.',pic:'📅',ic:'notebook-pen',btn:'ولّدي التحضير'}};
const AI_STAGES={'رياض الأطفال':['المستوى الأول','المستوى الثاني','المستوى الثالث'],'المرحلة الابتدائية':['الأول الابتدائي','الثاني الابتدائي','الثالث الابتدائي','الرابع الابتدائي','الخامس الابتدائي','السادس الابتدائي'],'المرحلة المتوسطة':['الأول المتوسط','الثاني المتوسط','الثالث المتوسط'],'المرحلة الثانوية':['الأول الثانوي','الثاني الثانوي','الثالث الثانوي']};
const AI_SUBJ={'رياض الأطفال':['وحدة تعلّم','لغتي (مهارات القراءة والكتابة)','الرياضيات','العلوم','التربية الإسلامية','المهارات الحياتية'],
 'المرحلة الابتدائية':['لغتي','الرياضيات','العلوم','الدراسات الإسلامية','القرآن الكريم','الدراسات الاجتماعية','اللغة الإنجليزية','المهارات الرقمية','التربية الفنية','التربية البدنية والدفاع عن النفس','المهارات الحياتية والأسرية'],
 'المرحلة المتوسطة':['لغتي الخالدة','الرياضيات','العلوم','الدراسات الإسلامية','الدراسات الاجتماعية','اللغة الإنجليزية','المهارات الرقمية','التفكير الناقد','التربية الفنية'],
 'المرحلة الثانوية':['اللغة العربية','الرياضيات','الفيزياء','الكيمياء','الأحياء','الدراسات الإسلامية','اللغة الإنجليزية','التقنية الرقمية','التفكير الناقد']};
const AI_STYLES=[['cartoon','كرتوني','gdn'],['adventure','مغامرة','adv'],['science','علمي','jgl'],['space','فضاء','space'],['storybook','قصصي','wcs'],['minimal','بسيط','calm']];
const AI_DIFF=['سهل','متوسط','متقدم','متدرج'];
const AI_ACTS=[['mcq','اختيار من متعدد'],['tf','صح أم خطأ'],['sort','اسحب وأفلت (تصنيف)'],['match','مطابقة','match'],['flip','بطاقات تنقلب'],['mystery','صناديق المفاجآت','boxes'],['wheel','عجلة الأسئلة','wheel'],['timed','تحدٍّ بالوقت','speed'],['story','قصة تفاعلية'],['puzzle','ألغاز وترتيب حروف','whoami']];
const AI_QT=[['mcq','اختيار من متعدد'],['tf','صح أو خطأ'],['fill','أكمل الفراغ'],['open','مقالي قصير']];
const AI_WK=[['mcq','اختيار من متعدد'],['tf','صح أو خطأ'],['fill','أكمل الفراغ'],['match','صِل'],['order','رتّب'],['short','أجب باختصار'],['circle','ضع دائرة'],['classify','صنّف'],['draw','ارسم']];
const AI_PART_N={hook:'سؤال التهيئة',pre:'التقويم القبلي',goals:'الأهداف',points:'نقاط الشرح',examples:'الأمثلة',model:'النمذجة',mistakes:'الأخطاء الشائعة',act:'النشاط التعاوني',cards:'البطاقات',order:'ترتيب الحروف',sort:'التصنيف',questions:'الأسئلة',tf:'صح أم خطأ',summary:'الملخص',diff:'الأنشطة المتمايزة',exit:'بطاقة الخروج',hw:'الواجب',
 objectives:'الأهداف',vocabulary:'المفردات',materials:'الوسائل',strategies:'الاستراتيجيات',values:'القيم',stages:'مراحل الدرس',assessment:'التقويم',differentiation:'التمايز',homework:'الواجب'};
const AI_SLIDE_N={hook:'تهيئة',objectives:'الأهداف',concept:'مفهوم',examples:'أمثلة',flip:'بطاقة',mcq:'سؤال',tf:'صح أم خطأ',sort:'تصنيف',order:'رتّب الحروف',count:'عُدّ معي',steps:'خطوات',mistakes:'أخطاء شائعة',activity:'نشاط تعاوني',story:'قصة',review:'مراجعة',exit:'بطاقة خروج',match:'مطابقة',mystery:'صناديق',wheel:'عجلة',timed:'تحدٍّ بالوقت',puzzle:'ألغاز'};
const AI_REASON={not_configured:'المساعد غير مفعّل بعد على المنصة.',disabled:'المساعد متوقف مؤقتًا من الإدارة.',blocked:'المساعد موقوف لهذا الحساب. تواصلي مع الإدارة.',cooldown:'المساعد مشغول الآن، جرّبي بعد دقيقة.',global_cap:'وصلت المنصة للحد اليومي للمساعد. يتجدد منتصف الليل.'};
const aiKey=k=>`mb_ai_${k}:${S.uid}`;
const aiLoad=k=>{try{return JSON.parse(localStorage.getItem(aiKey(k))||'null')}catch(e){return null}};
const aiStore=(k,v)=>{try{v==null?localStorage.removeItem(aiKey(k)):localStorage.setItem(aiKey(k),JSON.stringify(v))}catch(e){}};
const aiDesign=st=>(AI_STYLES.find(s=>s[0]===st)||AI_STYLES[0])[2];
const aiPic=e=>{const p=picSrc(e);return p?`<img src="${p}" alt="" class="aiPic">`:''};

async function aiCall(method,path,body){let r;try{r=await fetch('/api/ai'+path,{method,credentials:'same-origin',headers:body!==undefined?{'content-type':'application/json'}:{},body:body!==undefined?JSON.stringify(body):undefined})}catch(e){throw{code:'network',message:'تعذّر الاتصال بالإنترنت. تحققي من الشبكة وجرّبي مرة أخرى.'}}
 let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw{code:(j&&j.error)||'http_'+r.status,message:(j&&j.message)||(r.status===401?'سجّلي الدخول أولًا.':j&&j.error==='ai_not_migrated'?'قاعدة بيانات المساعد لم تُجهّز بعد (للإدارة: شغّلي ملف الترحيل).':'تعذّر تنفيذ الطلب. جرّبي مرة أخرى.'),status:r.status};return j}
async function aiStatus(force){if(S.mode!=='api'){AI.st={available:false,reason:'local',modules:{},regen:{left:0,limit:0}};return AI.st}
 if(!force&&AI.st&&Date.now()-AI.stAt<30000)return AI.st;try{AI.st=await aiCall('GET','/status');AI.stAt=Date.now()}catch(e){AI.st={available:false,reason:e.code,message:e.message,modules:{},regen:{left:0,limit:0}}}return AI.st}

/* ---------- shell ---------- */
function vAI(){return `<section class="aiw"><div class="aiHero"><div class="wrap aiHeroIn"><div><span class="aiKick">${ic('sparkles')}مساعد مضبوط الذكي</span><h1>حضّري درسك في دقيقة</h1><p>عروض تفاعلية، ودروس كاملة، واختبارات، وألعاب، وأوراق عمل، وتحضير — مجانًا ضمن حصة يومية. أنتِ تراجعين وتعدّلين، والمساعد يكتب المسودة.</p></div><div class="aiHeroArt" aria-hidden="true">${['🚀','📚','🎯','🧩'].map(aiPic).join('')}</div></div></div><div class="wrap" id="aiBody" aria-live="polite"></div></section>`}
async function aiMount(){const app=$('#app');app.onclick=aiClick;app.onchange=aiChange;app.oninput=aiInput;app.onsubmit=aiSubmit;
 if(!AI.res){const d=aiLoad('res');if(d&&d.module&&d.data)AI.res=d}if(!AI.form)AI.form=aiLoad('form')||{};
 if(AI.pendingMod){AI.mod=AI.pendingMod;AI.view='form';AI.pendingMod=null}
 aiRender();await aiStatus();aiRender()}
function aiRender(){const b=$('#aiBody');if(!b)return;b.innerHTML=({home:aiHome,form:aiFormView,loading:aiLoadingView,result:aiResult,lib:aiLibView}[AI.view]||aiHome)();icons();initGals(b);aiAfter(b)}
function aiBanner(){const st=AI.st;if(!st)return `<p class="note">جارٍ التحقق من الحصة اليومية…</p>`;if(st.reason==='local')return `<div class="aiNote warn">${ic('wifi-off')}<span>المساعد يعمل على موقع المنصة فقط، وليس في المعاينة المحلية.</span></div>`;
 if(!st.available)return `<div class="aiNote warn">${ic('pause-circle')}<span>${esc(st.notice||st.message||AI_REASON[st.reason]||'المساعد غير متاح الآن.')}</span></div>`;return ''}
const aiLeft=m=>{const q=AI.st&&AI.st.modules&&AI.st.modules[m];return q?q:{left:0,limit:0,enabled:true}};
function aiHome(){const r=AI.res;
 return `${aiBanner()}${r?`<div class="aiDraft">${ic('file-clock')}<div><b>${r.saved?'آخر ما ولّدتِه':'مسودة غير محفوظة'}: ${esc(aiTitle(r))}</b><span class="note">${esc(AIM[r.module].n)} · ${esc(fmtDate(r.at))}</span></div><div class="acts"><button class="btn pri sm" data-aiopen>${ic('arrow-left')}تابعي</button>${r.saved?'':`<button class="btn ter sm" data-aidiscard>تجاهليها</button>`}</div></div>`:''}
 <div class="aiTop"><h2>ماذا تريدين أن تحضّري اليوم؟</h2><button class="btn sec sm" data-ailib>${ic('library-big')}مكتبتي من المساعد</button></div>
 <div class="aiMods">${Object.entries(AIM).map(([k,m])=>{const q=aiLeft(k),off=AI.st&&AI.st.modules&&AI.st.modules[k]&&!AI.st.modules[k].enabled;return `<button class="aiMod ${k==='presentation'?'hot':''}" data-aimod="${k}" ${off?'disabled':''}><span class="aiModP">${aiPic(m.pic)}</span><span class="aiModT"><b>${m.n}</b><small>${m.d}</small></span><span class="aiQ ${q.left?'':'none'}">${off?'متوقف':AI.st&&AI.st.available?`متبقٍ اليوم ${ar(q.left)} من ${ar(q.limit)}`:'—'}</span></button>`}).join('')}</div>
 <div class="aiTrust">${ic('shield-check')}<div><b>مراجعتك أساس الجودة</b><p class="note">المحتوى مولّد بالذكاء الاصطناعي وقد يخطئ. راجعيه قبل عرضه على الطلاب. لا يدّعي المساعد مطابقة المنهج إلا إذا أرفقتِ نص الدرس من الكتاب. لا تكتبي أسماء الطلاب أو بياناتهم؛ يُرسَل للمزوّد وصف الدرس فقط، ولا تُحفظ مدخلاتك أو النتائج على الخادم إلا في مكتبتك عند الحفظ.</p></div></div>`}
const aiTitle=r=>r.module==='lesson'?r.data.content.title:r.data.title||'';

/* ---------- form ---------- */
function aiDefForm(m){const f=AI.form||{};const stage=f.stage||((ME.p&&ME.p.stage==='رياض الأطفال')?'رياض الأطفال':'المرحلة الابتدائية');
 return{stage,grade:f.grade||AI_STAGES[stage][0],subject:f.subject||'',semester:f.semester||'',unit:f.unit||'',lesson:f.lesson||'',objectives:f.objectives||'',difficulty:f.difficulty||'متوسط',style:f.style||'cartoon',lang:f.lang||'ar',source:f.source||'',notes:'',
  count:(f.counts||{})[m]||{presentation:10,lesson:5,quiz:10,game:10,worksheet:5}[m],acts:f.acts||['mcq','tf','sort','flip','match'],types:f.types||['mcq','tf','fill'],kinds:f.kinds||['mcq','fill','match','short'],gameType:f.gameType||'star',duration:f.duration||45}}
function aiChips(name,list,sel,lockOf){return `<div class="aiChips" role="group">${list.map(([k,l,g])=>{const lk=lockOf&&g&&gameLocked(g);return `<label class="aiChip ${lk?'lk':''}"><input type="checkbox" name="${name}" value="${k}" ${sel.includes(k)&&!lk?'checked':''} ${lk?'disabled':''}><span>${l}${lk?ic('lock'):''}</span></label>`}).join('')}</div>`}
function aiFormView(){const m=AI.mod,M=AIM[m],f=aiDefForm(m),q=aiLeft(m),ok=AI.st&&AI.st.available&&q.left>0&&q.enabled!==false;
 const cnt={presentation:['عدد الشرائح',6,20],lesson:['عدد أسئلة الاختيار',3,12],quiz:['عدد الأسئلة',3,25],game:['عدد عناصر اللعبة',6,20],worksheet:['عدد العناصر في كل قسم',3,10]}[m];
 const styled=['presentation','lesson','game'].includes(m);
 return `<div class="aiFormH"><button class="btn ter sm" data-aihome>${ic('arrow-right')}كل الأدوات</button><span class="aiModP sm">${aiPic(M.pic)}</span><div><h2>${M.n}</h2><p class="note">${M.d}</p></div></div>${aiBanner()}
 <form class="aiForm" id="aiForm" novalidate><div class="aiCols"><div class="aiCard"><h3>${ic('graduation-cap')}بيانات الدرس</h3>
  <div class="aiG2"><label class="lab">المرحلة<select class="in" name="stage">${Object.keys(AI_STAGES).map(s=>`<option ${s===f.stage?'selected':''}>${s}</option>`).join('')}</select></label>
  <label class="lab">الصف<select class="in" name="grade" id="aiGrade">${AI_STAGES[f.stage].map(g=>`<option ${g===f.grade?'selected':''}>${g}</option>`).join('')}</select></label>
  <label class="lab">المادة<input class="in" name="subject" list="aiSubj" value="${esc(f.subject)}" maxlength="60" required placeholder="مثل: العلوم"><datalist id="aiSubj">${(AI_SUBJ[f.stage]||[]).map(s=>`<option value="${esc(s)}">`).join('')}</datalist></label>
  <label class="lab">الفصل الدراسي<select class="in" name="semester"><option value="">—</option>${['الفصل الدراسي الأول','الفصل الدراسي الثاني'].map(s=>`<option ${s===f.semester?'selected':''}>${s}</option>`).join('')}</select></label></div>
  <label class="lab">الوحدة (اختياري)<input class="in" name="unit" value="${esc(f.unit)}" maxlength="100" placeholder="مثل: الماء من حولنا"></label>
  <label class="lab">عنوان الدرس<input class="in" name="lesson" value="${esc(f.lesson)}" maxlength="120" required placeholder="مثل: حالات الماء"></label>
  <label class="lab">أهداف التعلم (اختياري)<textarea class="in" name="objectives" rows="3" maxlength="800" placeholder="اكتبي أهدافك أو اتركيها للمساعد">${esc(f.objectives)}</textarea></label>
  <details class="aiSrc" ${f.source?'open':''}><summary>${ic('book-open')}نص الدرس من الكتاب (اختياري، لدقة أعلى)</summary><p class="note">الصقي فقرة من كتاب الطالب ليعتمد عليها المساعد. بدون ذلك يكتب محتوى عامًا ولا يدّعي مطابقة المنهج.</p><textarea class="in" name="source" rows="5" maxlength="4000">${esc(f.source)}</textarea></details></div>
 <div class="aiCard"><h3>${ic('sliders-horizontal')}الإعدادات</h3>
  <div class="lab">مستوى الصعوبة<div class="aiSeg" role="radiogroup">${AI_DIFF.map(d=>`<label><input type="radio" name="difficulty" value="${d}" ${d===f.difficulty?'checked':''}><span>${d}</span></label>`).join('')}</div></div>
  <div class="aiG2">${cnt?`<label class="lab">${cnt[0]}<input class="in" type="number" name="count" min="${cnt[1]}" max="${cnt[2]}" value="${f.count}"></label>`:''}
  ${m==='prep'||m==='lesson'?`<label class="lab">زمن الحصة<select class="in" name="duration">${[35,40,45,90].map(x=>`<option value="${x}" ${+f.duration===x?'selected':''}>${ar(x)} دقيقة</option>`).join('')}</select></label>`:''}
  <label class="lab">لغة المحتوى<select class="in" name="lang"><option value="ar" ${f.lang==='ar'?'selected':''}>العربية</option><option value="en" ${f.lang==='en'?'selected':''}>الإنجليزية (لمادة اللغة الإنجليزية)</option></select></label></div>
  ${styled?`<div class="lab">الطابع البصري<div class="aiStyles">${AI_STYLES.map(([k,l,d])=>`<label class="aiSty"><input type="radio" name="style" value="${k}" ${k===f.style?'checked':''}><span class="stage pv">${noBtn(slideHTML({d,els:[]}))}</span><b>${l}</b></label>`).join('')}</div></div>`:''}
  ${m==='presentation'?`<div class="lab">الأنشطة التفاعلية${aiChips('acts',AI_ACTS,f.acts,1)}</div>`:''}
  ${m==='quiz'?`<div class="lab">أنواع الأسئلة${aiChips('types',AI_QT,f.types)}</div>`:''}
  ${m==='worksheet'?`<div class="lab">أقسام الورقة${aiChips('kinds',AI_WK,f.kinds)}</div>`:''}
  ${m==='game'?`<div class="lab">نوع اللعبة<div class="aiGames">${GT_ORDER.map(t=>{const lk=gameLocked(t);return `<label class="aiGT ${lk?'lk':''}"><input type="radio" name="gameType" value="${t}" ${t===f.gameType&&!lk?'checked':''} ${lk?'disabled':''}>${gameArt(t)}<b>${esc(GTYPES[t].name)}</b>${lk?`<small>${ic('lock')}باقة أعلى</small>`:''}</label>`}).join('')}</div></div>`:''}
  <label class="lab">ملاحظات للمساعد (اختياري)<textarea class="in" name="notes" rows="2" maxlength="400" placeholder="مثل: ركّزي على أمثلة من البيئة السعودية"></textarea></label>
  <p class="aiPriv">${ic('lock')}لا تكتبي أسماء الطلاب أو أرقامًا أو بيانات شخصية؛ تُحذف الأرقام والروابط والبريد تلقائيًا قبل الإرسال.</p></div></div>
 <div class="aiGo"><button class="btn pri lg" ${ok?'':'disabled'}>${ic('sparkles')}${M.btn}</button><span class="aiQ ${q.left?'':'none'}">${AI.st&&AI.st.available?`متبقٍ اليوم ${ar(q.left)} من ${ar(q.limit)} · تتجدد منتصف الليل`:''}</span></div></form>`}
function aiReadForm(){const fm=$('#aiForm'),fd=new FormData(fm),g=k=>String(fd.get(k)||'').trim(),m=AI.mod;
 const inp={stage:g('stage'),grade:g('grade'),subject:g('subject'),semester:g('semester'),unit:g('unit'),lesson:g('lesson'),objectives:g('objectives'),difficulty:g('difficulty')||'متوسط',style:g('style')||'cartoon',lang:g('lang')||'ar',source:g('source'),notes:g('notes')};
 if(fd.get('count')!=null)inp.count=+en(g('count'))||undefined;if(fd.get('duration')!=null)inp.duration=+g('duration');
 if(m==='presentation')inp.acts=fd.getAll('acts');if(m==='quiz')inp.types=fd.getAll('types');if(m==='worksheet')inp.kinds=fd.getAll('kinds');if(m==='game')inp.gameType=g('gameType')||'star';
 const F=AI.form||{};Object.assign(F,{stage:inp.stage,grade:inp.grade,subject:inp.subject,semester:inp.semester,unit:inp.unit,lesson:inp.lesson,objectives:inp.objectives,difficulty:inp.difficulty,style:inp.style,lang:inp.lang,source:inp.source});
 F.counts={...(F.counts||{}),[m]:inp.count};if(inp.acts)F.acts=inp.acts;if(inp.types)F.types=inp.types;if(inp.kinds)F.kinds=inp.kinds;if(inp.gameType)F.gameType=inp.gameType;if(inp.duration)F.duration=inp.duration;AI.form=F;aiStore('form',F);return inp}

/* ---------- generation ---------- */
const AI_STEPS=['نقرأ بيانات درسك','نكتب المحتوى التعليمي','نتحقق من الإجابات والصيغة','نجهّز الشرائح والأنشطة'];
function aiLoadingView(){return `<div class="aiLoad" role="status"><div class="aiOrb">${aiPic(AIM[AI.mod].pic)}<i></i><i></i><i></i></div><h2>يحضّر المساعد ${esc(AIM[AI.mod].n)}…</h2><ol class="aiSteps">${AI_STEPS.map((s,i)=>`<li data-st="${i}">${ic('check')}<span>${s}</span></li>`).join('')}</ol><p class="note">يستغرق عادةً من ١٠ إلى ٤٠ ثانية. لا تغلقي الصفحة.</p><div class="aiSkel"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div></div>`}
let _aiTick=0;
function aiTicker(){clearInterval(_aiTick);let i=0;const paint=()=>$$('.aiSteps li').forEach((li,k)=>{li.classList.toggle('done',k<i);li.classList.toggle('on',k===i)});paint();_aiTick=setInterval(()=>{if(!$('.aiSteps')){clearInterval(_aiTick);return}i=Math.min(i+1,AI_STEPS.length-1);paint()},5000)}
async function aiGenerate(inp){if(AI.busy)return toast('يوجد طلب قيد التنفيذ، انتظري لحظات ثم أعيدي المحاولة');const m=AI.mod;
 if(!inp.lesson||inp.lesson.length<2){toast('اكتبي عنوان الدرس');$('#aiForm [name=lesson]')?.focus();return}if(!inp.subject){toast('اكتبي المادة');$('#aiForm [name=subject]')?.focus();return}
 if(m==='quiz'&&!inp.types.length)return toast('اختاري نوعًا واحدًا من الأسئلة على الأقل');if(m==='worksheet'&&!inp.kinds.length)return toast('اختاري قسمًا واحدًا على الأقل');
 if(AI.res&&!AI.res.saved&&!await confirmBox('لديك مسودة غير محفوظة. ستُستبدل بالنتيجة الجديدة. هل تتابعين؟','نعم، ولّدي'))return;
 AI.busy=true;AI.view='loading';aiRender();aiTicker();
 try{const r=await aiCall('POST','/generate',{module:m,input:inp});
  AI.res={id:uid(),module:m,input:r.input,data:r.data,warnings:r.warnings||[],at:new Date().toISOString(),saved:null,d:aiDesign(r.input.style)};AI.tmp=[];AI.gi=0;AI.edit=false;aiStore('res',AI.res);AI.view='result';sfx('star')}
 catch(e){AI.view='form';aiRender();aiErr(e)}
 finally{AI.busy=false;clearInterval(_aiTick);aiStatus(true).then(()=>{if(AI.view!=='loading')aiRender()})}}
function aiErr(e){const d=openDialog(`<div class="aiErr">${ic('cloud-off')}<h2 class="dh">لم يكتمل التوليد</h2><p class="lead">${esc(e.message||'حدث خطأ. جرّبي مرة أخرى.')}</p>${e.code==='quota'?`<p class="note">لم تُحتسب المحاولات الفاشلة من حصتك.</p>`:'<p class="note">المحاولة الفاشلة لا تُخصم من حصتك اليومية.</p>'}<div class="acts"><button class="btn pri" data-close>حسنًا</button></div></div>`,{focus:false})}
// Regenerates one part. The current content is replaced only after a valid answer arrives.
async function aiRegen(part,current,apply,btn){if(AI.busy)return toast('يوجد طلب قيد التنفيذ، انتظري لحظات');const r=AI.res;if(!r)return;if(!(AI.st&&AI.st.regen&&AI.st.regen.left>0))return toast('انتهت حصة إعادة التوليد لليوم');
 AI.busy=true;const old=btn&&btn.innerHTML;if(btn){btn.disabled=true;btn.innerHTML=`<span class="aiSpin"></span>جارٍ…`}
 try{const j=await aiCall('POST','/regen',{module:r.module,part,input:r.input,current});apply(j.value);if(j.warnings&&j.warnings.length)r.warnings=[...new Set([...j.warnings,...r.warnings])].slice(0,12);r.saved=r.saved?{...r.saved,dirty:1}:null;AI.busy=false;
  // the teacher may have moved on: only touch the screen and the draft if this result is still the one on show
  if(AI.res===r){aiStore('res',r);if(AI.view==='result'){const y=scrollY;aiRender();window.scrollTo(0,y)}}toast('تم إعادة التوليد');sfx('pop')}
 catch(e){AI.busy=false;if(btn&&btn.isConnected){btn.disabled=false;btn.innerHTML=old}toast(e.message||'تعذّرت إعادة التوليد، بقي المحتوى كما هو')}
 finally{AI.busy=false;aiStatus(true).then(()=>{const c=$('#aiRegenLeft');if(c&&AI.st.regen)c.textContent=ar(AI.st.regen.left)})}}
const aiDirty=()=>{const r=AI.res;if(r.saved)r.saved.dirty=1;aiStore('res',r)};

/* ---------- converters to the platform's own objects ---------- */
function aiTmpGame(type,title,rows,o={}){const T=GTYPES[type];const g={id:'aitmp_'+uid(),type,title:String(title||T.name).slice(0,60),d:AI.res.d,count:rows.length,time:o.time||20,level:'all',[T.f]:rows,updated:new Date().toISOString(),ai:1};AI.tmp.push(g);return g.id}
{const _ag=allGames;allGames=function(){return [..._ag(),...AI.tmp]}}
function aiDeckSlides(D,d){AI.tmp=AI.tmp.filter(g=>g.keep);const out=[L.cover(d,{title:D.title,sub:D.subtitle},1)],map=[-1];let k=0;
 const push=(s,i)=>{out.push(s);map.push(i)};
 D.slides.forEach((s,i)=>{const v=((k++)%3)+1;switch(s.type){
  case 'hook':push(L.hook(d,{hook:s.question,hookPic:s.pic||'💡',reveal:s.reveal},1),i);break;
  case 'objectives':if(D.objectives.length)push(L.goals(d,D.objectives,v),i);break;
  case 'concept':push(L.concept(d,[s.title,s.text,s.pic||'💡'],v),i);break;
  case 'examples':push(L.cards(d,s.items.map(x=>({pic:x.pic,txt:x.text})),s.title),i);break;
  case 'flip':push(L.flip(d,[s.word,s.pic,s.info]),i);break;
  case 'mcq':push(L.mcq(d,[s.question,s.pic,s.answer,s.distractors[0],s.distractors[1]||''],s.section==='assessment'?'التقويم الختامي':'تحقّق من فهمك'),i);break;
  case 'tf':push(L.tf(d,[s.statement,s.pic,s.answer?'صح':'خطأ']),i);break;
  case 'sort':push(L.sort(d,s.items.map(x=>[x.text,x.pic,x.group])),i);break;
  case 'order':push(L.order(d,[s.word,s.pic]),i);break;
  case 'count':push(L.count(d,[s.pic,s.n]),i);break;
  case 'steps':push(L.steps(d,s.title,s.steps),i);break;
  case 'mistakes':push(L.mistakes(d,s.items.map(x=>[x.wrong,x.right])),i);break;
  case 'activity':push(L.activity(d,s.strategy,s.steps,s.minutes),i);break;
  case 'story':s.pages.forEach((p,j)=>push(L.story(d,[p.text,p.pic],j,s.pages.length),i));break;
  case 'review':push(L.list(d,s.title,s.points,'check'),i);break;
  case 'exit':push(L.exit(d,s.prompt),i);break;
  // a game type above the teacher's plan falls back to free slides with the same content
  case 'match':if(gameLocked('match')){s.pairs.slice(0,4).forEach(x=>push(L.flip(d,[x.a,x.pic||'⭐',x.b]),i));break}push(L.game(d,aiTmpGame('match',s.title,s.pairs.map(x=>[x.a,x.pic,x.b]))),i);break;
  case 'mystery':if(gameLocked('boxes')){push(L.list(d,s.title,s.items.map(x=>x.q),'gift'),i);break}push(L.game(d,aiTmpGame('boxes',s.title,s.items.map(x=>[x.q,x.a]))),i);break;
  case 'wheel':if(gameLocked('wheel')){push(L.list(d,s.title,s.items.map(x=>x.q),'star'),i);break}push(L.game(d,aiTmpGame('wheel',s.title,s.items.map(x=>[x.q,x.a]))),i);break;
  case 'timed':if(gameLocked('speed')){s.questions.slice(0,4).forEach(x=>push(L.mcq(d,[x.q,x.pic,x.answer,x.distractors[0],x.distractors[1]||''],'تحدٍّ سريع'),i));break}push(L.game(d,aiTmpGame('speed',s.title,s.questions.map(x=>[x.q,x.pic,x.answer,x.distractors[0],x.distractors[1]||'']),{time:15})),i);break;
  case 'puzzle':if(gameLocked('whoami')){s.riddles.forEach(x=>push(L.mcq(d,[x.hints.join('، ')+'. من أنا؟',x.pic,x.answer,x.distractors[0],x.distractors[1]||''],'لغز'),i));break}push(L.game(d,aiTmpGame('whoami',s.title,s.riddles.map(x=>[...x.hints,x.answer,x.pic,x.distractors[0],x.distractors[1]||'']))),i);break}});
 push(L.reward(d),-1);return{slides:out,map}}
function aiSlides(r){if(r.module==='presentation')return aiDeckSlides(r.data,r.d);AI.tmp=AI.tmp.filter(g=>g.keep);if(r.module==='lesson'){const s=compose('lesson',r.data.content,r.d,1);return{slides:s,map:s.map(()=>-1)}}
 if(r.module==='quiz'){const d=r.d,out=[L.cover(d,{title:r.data.title,sub:r.input.subject},1)];r.data.questions.forEach(q=>{if(q.t==='mcq'){const o=q.o.filter(x=>String(x).trim()),ok=q.o[q.a];out.push(L.mcq(d,['' + q.q,'',ok,...o.filter(x=>x!==ok).slice(0,2)],'سؤال'))}else if(q.t==='tf')out.push(L.tf(d,[q.q,'',q.a==='1'?'صح':'خطأ']))});out.push(L.reward(d));return{slides:out,map:out.map(()=>-1)}}
 return{slides:[],map:[]}}
function aiGameCfg(r){const T=GTYPES[r.data.type];return{type:r.data.type,title:r.data.title,d:r.d,count:r.data.rows.length,time:T.timed?20:20,level:'all',[T.f]:clone(r.data.rows),updated:new Date().toISOString()}}
function aiExam(r){const D=r.data;return{id:'ai'+r.id,title:D.title,subj:r.input.subject,grade:r.input.grade,dur:30,ins:D.instructions||'',qs:D.questions.map((q,i)=>({...q,id:q.id||(r.id+'q'+i),o:q.t==='mcq'?[...q.o,'','','',''].slice(0,4):undefined})),created:new Date().toISOString()}}

/* ---------- saving to the teacher's library ---------- */
async function aiSaveGames(slides){const ids={};for(const g of AI.tmp.filter(x=>!x.keep&&slides.some(s=>s.els.some(e=>e.kind==='game'&&e.data&&e.data.ref===x.id)))){const id='G_'+uid(),o={...g};delete o.id;await S.set(S.up(id),o);ME.games.unshift({...o,_id:id});ids[g.id]=id}
 slides.forEach(s=>s.els.forEach(e=>{if(e.kind==='game'&&e.data&&ids[e.data.ref])e.data.ref=ids[e.data.ref]}));return Object.keys(ids).length}
async function aiSaveLesson(open){const r=AI.res;if(!await ensureMe())return;const ex=r.saved&&r.saved.kind==='L'&&ME.lessons.find(l=>l._id===r.saved.id);
 if(!ex&&ME.lessons.length>=lim('saves'))return needPlan(`باقتك الحالية تحفظ ${ar(lim('saves'))} عروض فقط`);
 const {slides}=aiSlides(r);let ng=0;try{ng=await aiSaveGames(slides)}catch(e){return toast('تعذّر حفظ الألعاب المرتبطة')}
 const L0=ex?{...clone(ex),slides,title:aiTitle(r),d:r.d,updated:new Date().toISOString()}:newLesson({title:aiTitle(r),d:r.d,slides,src:'ai:'+r.module,content:r.module==='lesson'?clone(r.data.content):null,cat:r.module==='lesson'?'lesson':null});
 delete L0._id;if(r.module==='lesson')L0.content=clone(r.data.content);L0.ai={module:r.module,input:r.input,data:r.data,d:r.d,warnings:r.warnings};
 try{await S.set(S.up('L_'+L0.id),L0)}catch(e){return toast('تعذّر الحفظ. جرّبي مرة أخرى.')}
 const k=ME.lessons.findIndex(x=>x._id==='L_'+L0.id);if(k>=0)ME.lessons[k]={...L0,_id:'L_'+L0.id};else ME.lessons.unshift({...L0,_id:'L_'+L0.id});
 r.saved={kind:'L',id:'L_'+L0.id};aiStore('res',r);regTeacher();toast(ng?`حُفظ في «دروسي» مع ${ar(ng)} لعبة في «ألعابي»`:'حُفظ في «دروسي»');
 if(open)openStudio(L0,false);else aiRender()}
async function aiSaveGame(edit){const r=AI.res;if(!await ensureMe())return;const id=r.saved&&r.saved.kind==='G'?r.saved.id:'G_'+uid(),o={...aiGameCfg(r),ai:{module:'game',input:r.input,data:r.data,d:r.d}};
 try{await S.set(S.up(id),o)}catch(e){return toast('تعذّر الحفظ')}const k=ME.games.findIndex(x=>x._id===id);if(k>=0)ME.games[k]={...o,_id:id};else ME.games.unshift({...o,_id:id});
 r.saved={kind:'G',id};aiStore('res',r);regTeacher();toast('حُفظت في «ألعابي»');if(edit)gameEditor(o.type,{...o,_id:id});else aiRender()}
async function aiSaveDoc(){const r=AI.res;if(!await ensureMe())return;const id=r.saved&&r.saved.kind==='A'?r.saved.id:'A_'+uid();
 const o={module:r.module,title:aiTitle(r),input:r.input,data:r.data,warnings:r.warnings,d:r.d,created:r.at,updated:new Date().toISOString()};
 try{await S.set(S.up(id),o)}catch(e){return toast('تعذّر الحفظ')}r.saved={kind:'A',id};aiStore('res',r);AI.lib=null;toast('حُفظ في مكتبتك');aiRender()}
const aiSave=()=>({presentation:()=>aiSaveLesson(false),lesson:()=>aiSaveLesson(false),game:()=>aiSaveGame(false)}[AI.res.module]||aiSaveDoc)();

/* ---------- result views ---------- */
function aiResult(){const r=AI.res;if(!r){AI.view='home';return aiHome()}const M=AIM[r.module],I=r.input;
 const saved=r.saved?`<span class="bd ok">${ic('check')}${r.saved.dirty?'محفوظ (تعديلات جديدة غير محفوظة)':'محفوظ في مكتبتك'}</span>`:`<span class="bd warn">مسودة غير محفوظة</span>`;
 return `<div class="aiResH"><button class="btn ter sm" data-aihome>${ic('arrow-right')}كل الأدوات</button><span class="aiModP sm">${aiPic(M.pic)}</span><div class="grow"><span class="bd y">${M.n}</span> ${saved}<h2>${esc(aiTitle(r))}</h2><p class="note">${esc([I.stage,I.grade,I.subject,I.unit,I.semester].filter(Boolean).join(' · '))}</p></div>
 <div class="acts"><button class="btn pri" data-aisave>${ic('save')}${r.saved?'احفظي التعديلات':'احفظي في مكتبتي'}</button><button class="btn sec" data-airedo title="توليد جديد بنفس البيانات">${ic('refresh-cw')}توليد جديد</button></div></div>
 <div class="aiReview">${ic('badge-alert')}<p><b>محتوى مولّد بالذكاء الاصطناعي يحتاج مراجعتك.</b> تحققي من صحة المعلومات والإجابات ومناسبتها لطلابك قبل الاستخدام. ${I.source?'اعتمد المساعد على النص الذي أرفقتِه.':'لم يُتحقَّق من مطابقته للمنهج لأنه لم يُرفق نص من الكتاب.'}</p></div>
 ${r.warnings&&r.warnings.length?`<details class="aiWarn" open><summary>${ic('triangle-alert')}ملاحظات التحقق التلقائي (${ar(r.warnings.length)})</summary><ul>${r.warnings.map(w=>`<li>${esc(w)}</li>`).join('')}</ul></details>`:''}
 <p class="note aiRgN">${ic('refresh-ccw')}يمكنك إعادة توليد أي جزء وحده. متبقٍ اليوم: <b id="aiRegenLeft">${ar((AI.st&&AI.st.regen&&AI.st.regen.left)|0)}</b> إعادة توليد. إن فشلت إعادة التوليد يبقى المحتوى كما هو.</p>
 <div id="aiRB">${({presentation:aiResDeck,lesson:aiResLesson,quiz:aiResQuiz,game:aiResGame,worksheet:aiResWs,prep:aiResPrep}[r.module])()}</div>`}
function aiDesignRow(){return `<div class="aiDz"><span class="note">التصميم</span>${designBtns(AI.res.d,'data-aidz')}</div>`}
function aiResDeck(){const r=AI.res,{slides,map}=aiSlides(r);AI._map=map;AI._slides=slides;const gi=Math.min(AI.gi,slides.length-1);
 return `${aiDesignRow()}${gallery('aiGal',slides.map((s,i)=>({slide:s,label:ar(i+1)})),{label:'شرائح العرض'})}
 <div class="aiSlTools" id="aiSlTools">${aiSlTools(gi)}</div>
 <div class="acts aiBig"><button class="btn pri" data-aiplay>${ic('play')}اعرضي الآن (ملء الشاشة)</button><button class="btn sec" data-aistudio>${ic('palette')}افتحي في الاستوديو للتعديل والتصدير</button></div>
 <p class="note">في الاستوديو: تعديل أي نص أو صورة، وإعادة ترتيب الشرائح وتكرارها، والتصدير إلى PowerPoint. الأنشطة كلها تعمل داخل العرض.</p>`}
function aiSlTools(gi){const r=AI.res,di=(AI._map||[])[gi];if(di==null||di<0)return `<span class="note">الغلاف وشريحة التتويج تُضافان تلقائيًا.</span>`;const s=r.data.slides[di],canRegen=s.type!=='objectives';
 return `<span class="bd">${ar(gi+1)} · ${esc(AI_SLIDE_N[s.type]||s.type)}</span>${canRegen?`<button class="btn sec sm" data-airgs="${di}">${ic('refresh-ccw')}أعيدي توليد هذه الشريحة</button>`:''}<button class="ib" data-aimv="${di}" data-dir="-1" aria-label="قدّمي الشريحة" ${di?'':'disabled'}>${ic('arrow-up')}</button><button class="ib" data-aimv="${di}" data-dir="1" aria-label="أخّري الشريحة" ${di<r.data.slides.length-1?'':'disabled'}>${ic('arrow-down')}</button><button class="ib" data-aidup="${di}" aria-label="كرّري الشريحة">${ic('copy')}</button><button class="ib" data-aidel="${di}" aria-label="احذفي الشريحة">${ic('trash-2')}</button>`}
function aiResLesson(){const r=AI.res,{slides}=aiSlides(r),c=r.data.content;
 return `${aiDesignRow()}${gallery('aiGal',slides.map((s,i)=>({slide:s,label:ar(i+1)})),{label:'شرائح الدرس'})}
 <div class="aiPartRow"><label class="lab inl">أعيدي توليد<select class="in" id="aiPart">${(AI.st&&AI.st.parts?AI.st.parts.lesson:Object.keys(AI_PART_N).slice(0,17)).map(k=>`<option value="${k}">${esc(AI_PART_N[k]||k)}</option>`).join('')}</select></label><button class="btn sec" data-airgp>${ic('refresh-ccw')}أعيدي توليد هذا الجزء</button></div>
 <div class="acts aiBig"><button class="btn pri" data-aiplay>${ic('play')}اعرضي الدرس</button><button class="btn sec" data-aijr>${ic('map')}وضع رحلة الدرس</button><button class="btn sec" data-aistudio>${ic('palette')}افتحي في الاستوديو</button><button class="btn sec" data-aiedit aria-expanded="${AI.edit}">${ic('pencil')}${AI.edit?'إخفاء المحرر':'عدّلي المحتوى'}</button></div>
 ${AI.edit?`<div class="aiCard"><h3>${ic('pencil')}محتوى الدرس</h3><p class="note">كل تعديل يظهر في الشرائح فورًا.</p><div id="aiLF"></div></div>`:''}`}
/* generic editor for list-shaped content (quiz questions, worksheet items) */
const AI_ED={
 quiz:{mcq:[['q','السؤال','area'],['o','الخيارات (خيار في كل سطر)','lines'],['a','الإجابة الصحيحة','pickidx:o'],['pts','الدرجة','num']],tf:[['q','العبارة','area'],['a','الإجابة','tf10'],['pts','الدرجة','num']],fill:[['q','السؤال (...... مكان الفراغ)','area'],['a','الإجابة'],['pts','الدرجة','num']],open:[['q','السؤال','area'],['a','إجابة نموذجية'],['lines','عدد الأسطر','num'],['pts','الدرجة','num']]},
 ws:{mcq:[['q','السؤال'],['options','الخيارات (خيار في كل سطر)','lines'],['answer','الإجابة الصحيحة','pick:options']],tf:[['statement','العبارة'],['answer','الإجابة','bool']],fill:[['sentence','الجملة (...... مكان الفراغ)'],['answer','الإجابة']],match:[['a','العمود الأول'],['b','ما يقابله']],order:[['prompt','المطلوب'],['parts','العناصر بالترتيب الصحيح (عنصر في كل سطر)','lines']],short:[['q','السؤال'],['answer','إجابة نموذجية'],['lines','عدد الأسطر','num']],circle:[['prompt','المطلوب'],['options','الخيارات (في كل سطر)','lines'],['answers','الصحيحة (في كل سطر)','lines']],classify:[['text','العنصر'],['group','المجموعة','pick:groups']],draw:[['prompt','المطلوب']]}};
function aiField(path,val,[k,l,t='text'],item,sec){const p=esc(path+'.'+k);
 if(t==='area')return `<label class="lab">${l}<textarea class="in" rows="2" data-aie="${p}">${esc(val)}</textarea></label>`;
 if(t==='lines')return `<label class="lab">${l}<textarea class="in" rows="3" data-aie="${p}" data-t="lines">${esc((val||[]).join('\n'))}</textarea></label>`;
 if(t==='num')return `<label class="lab sm">${l}<input class="in" type="number" min="0" step="0.5" data-aie="${p}" data-t="num" value="${esc(val)}"></label>`;
 if(t==='tf10')return `<label class="lab sm">${l}<select class="in" data-aie="${p}"><option value="1" ${val==='1'?'selected':''}>صح</option><option value="0" ${val==='0'?'selected':''}>خطأ</option></select></label>`;
 if(t==='bool')return `<label class="lab sm">${l}<select class="in" data-aie="${p}" data-t="bool"><option value="1" ${val?'selected':''}>صح</option><option value="0" ${!val?'selected':''}>خطأ</option></select></label>`;
 if(t.startsWith('pickidx:')){const o=(item[t.slice(8)]||[]);return `<label class="lab sm">${l}<select class="in" data-aie="${p}" data-t="num">${o.map((x,i)=>String(x).trim()?`<option value="${i}" ${+val===i?'selected':''}>${esc(x)}</option>`:'').join('')}</select></label>`}
 if(t.startsWith('pick:')){const src=t.slice(5),o=(src==='groups'?sec.groups:item[src])||[];return `<label class="lab sm">${l}<select class="in" data-aie="${p}">${o.map(x=>`<option ${x===val?'selected':''}>${esc(x)}</option>`).join('')}</select></label>`}
 return `<label class="lab">${l}<input class="in" data-aie="${p}" value="${esc(val)}"></label>`}
const aiGet=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
function aiSet(o,p,v){const ks=p.split('.'),last=ks.pop();const t=ks.reduce((a,k)=>a[k],o);t[last]=v}
function aiResQuiz(){const D=AI.res.data,tot=D.questions.reduce((a,q)=>a+(+q.pts||0),0);
 return `<div class="aiCard"><div class="aiG2"><label class="lab">عنوان الاختبار<input class="in" data-aie="title" value="${esc(D.title)}"></label><label class="lab">التعليمات<input class="in" data-aie="instructions" value="${esc(D.instructions)}"></label></div><p class="note">${ar(D.questions.length)} سؤالًا · المجموع ${ar(tot)} درجة</p></div>
 <ol class="aiQs">${D.questions.map((q,i)=>`<li class="aiCard aiQ1"><div class="aiQh"><span class="bd">${ar(i+1)} · ${esc((AI_QT.find(x=>x[0]===q.t)||[,''])[1])}</span><span class="grow"></span><button class="btn ter sm" data-airgq="${i}">${ic('refresh-ccw')}سؤال بديل</button><button class="ib" data-aiqmv="${i}" data-dir="-1" aria-label="أعلى" ${i?'':'disabled'}>${ic('arrow-up')}</button><button class="ib" data-aiqmv="${i}" data-dir="1" aria-label="أسفل" ${i<D.questions.length-1?'':'disabled'}>${ic('arrow-down')}</button><button class="ib" data-aiqdel="${i}" aria-label="احذفي السؤال">${ic('trash-2')}</button></div>
  <div class="aiEdG">${AI_ED.quiz[q.t].map(f=>aiField('questions.'+i,q[f[0]],f,q)).join('')}</div>${q.ex?`<p class="note">${ic('lightbulb')}${esc(q.ex)}</p>`:''}</li>`).join('')}</ol>
 <div class="acts aiBig"><button class="btn pri" data-aiqprint="A">${ic('printer')}اطبعي الاختبار</button><button class="btn sec" data-aiqprint="B">${ic('shuffle')}النموذج (ب)</button><button class="btn sec" data-aiqprint="key">${ic('key-round')}نموذج الإجابة</button><button class="btn sec" data-aiqcls>${ic('users-round')}أضيفيه لاختبارات فصلي</button><button class="btn sec" data-aiplay>${ic('presentation')}اعرضيه أسئلة تفاعلية</button><button class="btn sec" data-aiq2g>${ic('gamepad-2')}حوّليه إلى لعبة</button></div>`}
function aiResGame(){const r=AI.res,D=r.data,T=GTYPES[D.type],cols=GFIELDS[T.f].cols;
 return `${aiDesignRow()}<div class="aiGameC"><div class="aiGameArt">${gameArt(D.type)}</div><div class="grow"><span class="bd">${esc(T.name)}</span><label class="lab">اسم اللعبة<input class="in" data-aie="title" value="${esc(D.title)}"></label><p class="note">${esc(T.desc)} · ${ar(D.rows.length)} عنصرًا</p></div></div>
 <div class="scroll"><table class="tbl aiTbl"><thead><tr><th>#</th>${cols.map(c=>`<th>${esc(c.l)}</th>`).join('')}</tr></thead><tbody>${D.rows.map((row,i)=>`<tr><td>${ar(i+1)}</td>${cols.map((c,j)=>`<td>${c.img?picHTML(row[j]):`<input class="in sm" data-aie="rows.${i}.${j}" value="${esc(row[j])}" aria-label="${esc(c.l)}">`}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <div class="acts aiBig"><button class="btn pri" data-aigplay>${ic('play')}جرّبي اللعبة</button><button class="btn sec" data-aigedit>${ic('pencil')}احفظيها وافتحي محرر الألعاب</button><button class="btn sec" data-airgi>${ic('refresh-ccw')}عناصر جديدة</button></div>`}
function aiWsBody(W,key){const rnd=typeof seeded==='function'?seeded(W.title):Math.random,sh=a=>typeof sShuffle==='function'?sShuffle(a,rnd):shuffle(a),L3='أبجدهو';
 const ln=n=>`<div class="wsLn">${'<i></i>'.repeat(n)}</div>`,blank=t=>esc(t).replace(/\.{3,}|_{3,}|…/,`<span class="wsBl">${key?'':'&nbsp;'}</span>`);
 return W.sections.map((s,i)=>{let b='';const its=s.items||[];
  switch(s.kind){
   case 'mcq':b=`<ol>${its.map(x=>`<li><p>${esc(x.q)}</p><div class="wsOpts">${x.options.map((o,k)=>`<span class="${key&&o===x.answer?'k':''}"><b>${L3[k]}</b> ${esc(o)}</span>`).join('')}</div></li>`).join('')}</ol>`;break;
   case 'tf':b=`<ol>${its.map(x=>`<li class="wsTf"><p>${esc(x.statement)}</p><span class="wsBox">${key?(x.answer?'✓':'✗'):''}</span></li>`).join('')}</ol>`;break;
   case 'fill':b=`${s.bank&&s.bank.length?`<div class="wsBank">${s.bank.map(esc).join(' · ')}</div>`:''}<ol>${its.map(x=>`<li><p>${blank(x.sentence)}${key?` <b class="k">${esc(x.answer)}</b>`:''}</p></li>`).join('')}</ol>`;break;
   case 'match':{const B=sh(its.map((x,k)=>({b:x.b,k})));b=`<div class="wsMatch"><ol>${its.map((x,k)=>`<li><p>${esc(x.a)}${key?` <b class="k">← ${L3[B.findIndex(y=>y.k===k)]||''}</b>`:''}</p></li>`).join('')}</ol><ol class="wsB">${B.map((y,k)=>`<li><p><b>${L3[k]||''}</b> ${esc(y.b)}</p></li>`).join('')}</ol></div>`;break}
   case 'order':b=`<ol>${its.map(x=>`<li><p>${esc(x.prompt)}</p><div class="wsChips">${(key?x.parts:sh(x.parts)).map(p=>`<span>${esc(p)}</span>`).join(key?' ← ':'')}</div>${key?'':`<div class="wsSlots">${x.parts.map(()=>'<i></i>').join('')}</div>`}</li>`).join('')}</ol>`;break;
   case 'short':b=`<ol>${its.map(x=>`<li><p>${esc(x.q)}</p>${key?`<p class="k">${esc(x.answer)}</p>`:ln(x.lines||2)}</li>`).join('')}</ol>`;break;
   case 'circle':b=`<ol>${its.map(x=>`<li><p>${esc(x.prompt)}</p><div class="wsChips">${x.options.map(o=>`<span class="${key&&x.answers.includes(o)?'kc':''}">${esc(o)}</span>`).join('')}</div></li>`).join('')}</ol>`;break;
   case 'classify':b=`${key?'':`<div class="wsBank">${sh(s.items.map(x=>x.text)).map(esc).join(' · ')}</div>`}<table class="wsCls"><thead><tr>${s.groups.map(g=>`<th>${esc(g)}</th>`).join('')}</tr></thead><tbody><tr>${s.groups.map(g=>`<td>${key?s.items.filter(x=>x.group===g).map(x=>esc(x.text)).join('<br>'):'<br><br><br>'}</td>`).join('')}</tr></tbody></table>`;break;
   case 'draw':b=its.map(x=>`<p>${esc(x.prompt)}</p><div class="wsDraw"></div>`).join('');break}
  return `<section class="wsS"><h2><b>${ar(i+1)}</b> ${esc(s.title||(AI_WK.find(k=>k[0]===s.kind)||[,''])[1])}<span class="wsTools" data-noprint><button class="btn ter sm" data-airgw="${i}">${ic('refresh-ccw')}قسم بديل</button><button class="ib sm" data-aiwdel="${i}" aria-label="احذفي القسم">${ic('trash-2')}</button></span></h2>${b}</section>`}).join('')}
const aiWsHead=r=>`<div class="wsHd"><span>الاسم: ............................</span><span>الصف: ${esc(r.input.grade)}</span><span>التاريخ: ........</span></div>${r.data.instructions?`<p class="wsIns">${esc(r.data.instructions)}</p>`:''}`;
function aiResWs(){const r=AI.res,W=r.data;
 return `<div class="acts aiTabsS">${tabsHTML('aiws',[['view','معاينة الورقة','eye'],['edit','تعديل','pencil'],['key','نموذج الإجابة','key-round']],AI.wsTab||'view')}</div>
 ${(AI.wsTab||'view')==='edit'?aiWsEdit(W):`<div class="wsP"><h1>${esc(W.title)}</h1>${aiWsHead(r)}${aiWsBody(W,AI.wsTab==='key')}</div>`}
 <div class="acts aiBig"><button class="btn pri" data-aiwprint="0">${ic('printer')}اطبعي الورقة / PDF</button><button class="btn sec" data-aiwprint="1">${ic('key-round')}اطبعيها مع نموذج الإجابة</button></div>`}
function aiWsEdit(W){return `<div class="aiCard"><label class="lab">عنوان الورقة<input class="in" data-aie="title" value="${esc(W.title)}"></label><label class="lab">التعليمات<input class="in" data-aie="instructions" value="${esc(W.instructions)}"></label></div>
 ${W.sections.map((s,i)=>`<div class="aiCard"><div class="aiQh"><span class="bd">${ar(i+1)} · ${esc((AI_WK.find(k=>k[0]===s.kind)||[,''])[1])}</span><span class="grow"></span><button class="btn ter sm" data-airgw="${i}">${ic('refresh-ccw')}قسم بديل</button></div>
  <label class="lab">عنوان القسم<input class="in" data-aie="sections.${i}.title" value="${esc(s.title)}"></label>${s.kind==='fill'?`<label class="lab">بنك الكلمات (كلمة في كل سطر)<textarea class="in" rows="2" data-aie="sections.${i}.bank" data-t="lines">${esc((s.bank||[]).join('\n'))}</textarea></label>`:''}${s.kind==='classify'?`<label class="lab">المجموعات (في كل سطر)<textarea class="in" rows="2" data-aie="sections.${i}.groups" data-t="lines">${esc(s.groups.join('\n'))}</textarea></label>`:''}
  ${s.items.map((x,k)=>`<div class="aiEdItem"><span class="bd">${ar(k+1)}</span><div class="aiEdG">${AI_ED.ws[s.kind].map(f=>aiField(`sections.${i}.items.${k}`,x[f[0]],f,x,s)).join('')}</div><button class="ib sm" data-aiwidel="${i}.${k}" aria-label="احذفي العنصر">${ic('x')}</button></div>`).join('')}</div>`).join('')}`}
function aiPrepBody(r){const P=r.data,I=r.input,li=a=>a&&a.length?`<ul>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'<p class="note">—</p>';
 const sec=(k,t,h)=>`<section class="ppS"><h3>${t}<button class="btn ter sm" data-airgf="${k}" data-noprint>${ic('refresh-ccw')}بديل</button></h3>${h}</section>`;
 return `<table class="ppHd"><tbody><tr><th>المادة</th><td>${esc(I.subject)}</td><th>الصف</th><td>${esc(I.grade)}</td></tr><tr><th>الوحدة</th><td>${esc(I.unit||'—')}</td><th>الزمن</th><td>${ar(P.duration)} دقيقة</td></tr><tr><th>الدرس</th><td>${esc(P.title)}</td><th>التاريخ</th><td>....../....../......</td></tr></tbody></table>
 <div class="ppG">${sec('objectives','الأهداف',li(P.objectives))}${sec('vocabulary','المفردات',`<div class="wsChips">${P.vocabulary.map(v=>`<span>${esc(v)}</span>`).join('')}</div>`)}${sec('materials','الوسائل ومصادر التعلم',li(P.materials))}${sec('strategies','الاستراتيجيات',li(P.strategies))}</div>
 ${P.prior?`<section class="ppS"><h3>التعلم القبلي</h3><p>${esc(P.prior)}</p></section>`:''}
 ${sec('stages','سير الدرس',`<table class="ppT"><thead><tr><th>المرحلة</th><th>الزمن</th><th>دور المعلمة</th><th>دور الطلاب</th></tr></thead><tbody>${P.stages.map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${ar(s.minutes)} د</td><td>${esc(s.teacher)}</td><td>${esc(s.students)}</td></tr>`).join('')}</tbody></table>`)}
 <div class="ppG">${sec('assessment','التقويم',li(P.assessment))}${sec('values','القيم',li(P.values))}</div>
 ${sec('differentiation','التعليم المتمايز',`<div class="ppD"><div><b>دعم</b><p>${esc(P.differentiation.support||'—')}</p></div><div><b>أساسي</b><p>${esc(P.differentiation.core||'—')}</p></div><div><b>إثراء</b><p>${esc(P.differentiation.enrich||'—')}</p></div></div>`)}
 ${sec('homework','الواجب',`<p>${esc(P.homework||'—')}</p>`)}${P.notes?`<section class="ppS"><h3>ملاحظات</h3><p>${esc(P.notes)}</p></section>`:''}`}
function aiResPrep(){const r=AI.res,P=r.data;
 return `<div class="acts aiTabsS">${tabsHTML('aipp',[['view','معاينة','eye'],['edit','تعديل','pencil']],AI.ppTab||'view')}</div>
 ${(AI.ppTab||'view')==='edit'?`<div class="aiCard"><label class="lab">عنوان الدرس<input class="in" data-aie="title" value="${esc(P.title)}"></label>${[['objectives','الأهداف'],['vocabulary','المفردات'],['materials','الوسائل'],['strategies','الاستراتيجيات'],['values','القيم'],['assessment','التقويم']].map(([k,l])=>`<label class="lab">${l} (سطر لكل عنصر)<textarea class="in" rows="3" data-aie="${k}" data-t="lines">${esc(P[k].join('\n'))}</textarea></label>`).join('')}
  <label class="lab">التعلم القبلي<textarea class="in" rows="2" data-aie="prior">${esc(P.prior)}</textarea></label></div>
  <div class="aiCard"><h3>سير الدرس</h3>${P.stages.map((s,i)=>`<div class="aiEdItem"><div class="aiEdG"><label class="lab">المرحلة<input class="in" data-aie="stages.${i}.name" value="${esc(s.name)}"></label><label class="lab sm">الدقائق<input class="in" type="number" min="1" data-aie="stages.${i}.minutes" data-t="num" value="${s.minutes}"></label><label class="lab">دور المعلمة<textarea class="in" rows="2" data-aie="stages.${i}.teacher">${esc(s.teacher)}</textarea></label><label class="lab">دور الطلاب<textarea class="in" rows="2" data-aie="stages.${i}.students">${esc(s.students)}</textarea></label></div><button class="ib sm" data-aistdel="${i}" aria-label="احذفي المرحلة">${ic('x')}</button></div>`).join('')}<button class="btn sec sm" data-aistadd>${ic('plus')}مرحلة</button><p class="note">المجموع: ${ar(P.stages.reduce((a,s)=>a+(+s.minutes||0),0))} من ${ar(P.duration)} دقيقة</p></div>
  <div class="aiCard">${[['support','دعم'],['core','أساسي'],['enrich','إثراء']].map(([k,l])=>`<label class="lab">تمايز: ${l}<textarea class="in" rows="2" data-aie="differentiation.${k}">${esc(P.differentiation[k])}</textarea></label>`).join('')}<label class="lab">الواجب<textarea class="in" rows="2" data-aie="homework">${esc(P.homework)}</textarea></label><label class="lab">ملاحظات<textarea class="in" rows="2" data-aie="notes">${esc(P.notes)}</textarea></label></div>`
 :`<div class="wsP pp"><h1>تحضير درس: ${esc(P.title)}</h1>${aiPrepBody(r)}</div>`}
 <div class="acts aiBig"><button class="btn pri" data-aipprint>${ic('printer')}اطبعي التحضير / PDF</button><button class="btn sec" data-ai2lesson>${ic('book-open-check')}ولّدي درسًا كاملًا من هذا التحضير</button></div>`}
function aiAfter(b){if(AI.view!=='result')return;const r=AI.res;
 if(r.module==='presentation'){const g=$('#aiGal',b);if(g){g.addEventListener('galchange',e=>{AI.gi=e.detail;const t=$('#aiSlTools');if(t){t.innerHTML=aiSlTools(e.detail);icons()}});if(AI.gi)goTo(g,AI.gi,false)}}
 if(r.module==='lesson'&&AI.edit){const box=$('#aiLF',b);if(box)bindForm(box,CAT_FIELDS.lesson,r.data.content,()=>{aiDirty();const g=$('#aiGal');const i=g?+g.dataset.i:0;const {slides}=aiSlides(r);g.outerHTML=gallery('aiGal',slides.map((s,k)=>({slide:s,label:ar(k+1)})),{label:'شرائح الدرس'});icons();const ng=$('#aiGal');initGals(ng.parentElement);goTo(ng,Math.min(i,slides.length-1),false)})}}

/* ---------- library ---------- */
async function aiLibLoad(){const all=S.signedIn?await S.list(`data/users/${S.uid}`):[];AI.lib=[...all.filter(d=>d._id.startsWith('A_')),...ME.lessons.filter(l=>l.ai),...ME.games.filter(g=>g.ai&&g.ai.module)].map(d=>({id:d._id,module:d.module||(d.ai&&d.ai.module),title:d.title,updated:d.updated,kind:d._id.slice(0,1)})).filter(x=>AIM[x.module]).sort((a,b)=>String(b.updated).localeCompare(String(a.updated)));if(AI.view==='lib')aiRender()}
function aiLibView(){if(!AI.lib){aiLibLoad();return `<p class="note">جارٍ تحميل مكتبتك…</p>`}
 return `<div class="aiFormH"><button class="btn ter sm" data-aihome>${ic('arrow-right')}كل الأدوات</button><div><h2>مكتبتي من المساعد</h2><p class="note">العروض والدروس تظهر أيضًا في «دروسي»، والألعاب في «ألعابي».</p></div></div>
 ${AI.lib.length?`<div class="aiLib">${AI.lib.map(x=>`<article class="aiCard aiLibI"><span class="aiModP sm">${aiPic(AIM[x.module].pic)}</span><div class="grow"><span class="bd">${esc(AIM[x.module].n)}</span><h3>${esc(x.title)}</h3><p class="note">${esc(fmtDate(x.updated))}</p></div><div class="acts"><button class="btn pri sm" data-ailibo="${esc(x.id)}">افتحي</button>${x.kind==='A'?`<button class="ib" data-ailibd="${esc(x.id)}" aria-label="احذفي">${ic('trash-2')}</button>`:''}</div></article>`).join('')}</div>`:`<div class="empty sm">${ic('library-big')}<h3>لا شيء محفوظ بعد</h3><p class="note">ما تحفظينه من المساعد يظهر هنا لتعودي إليه وتعيدي استخدامه.</p></div>`}`}
async function aiLibOpen(id){let src=null;if(id.startsWith('A_'))src=await S.get(S.up(id));else if(id.startsWith('L_')){const l=ME.lessons.find(x=>x._id===id);src=l&&l.ai}else{const g=ME.games.find(x=>x._id===id);src=g&&g.ai}
 if(!src||!src.data)return toast('تعذّر فتح العنصر');AI.res={id:uid(),module:src.module,input:src.input,data:clone(src.data),warnings:src.warnings||[],d:src.d||aiDesign(src.input&&src.input.style),at:src.created||new Date().toISOString(),saved:{kind:id[0],id}};AI.tmp=[];AI.gi=0;aiStore('res',AI.res);AI.view='result';aiRender()}

/* ---------- printing ---------- */
function aiPrintWs(withKey){const r=AI.res;printHTML(r.data.title,`<div class="wsP pr">${aiWsHead(r)}${aiWsBody(r.data,false)}</div>`+(withKey?`<div class="pgb"></div><h1>نموذج الإجابة</h1><div class="wsP pr">${aiWsBody(r.data,true)}</div>`:''))}

/* ---------- events ---------- */
async function aiClick(e){const b=e.target.closest('button,[data-aimod]');if(!b)return pageClick(e);const d=b.dataset,r=AI.res;
 if(d.tab==='aiws'){AI.wsTab=d.k;return aiRender()}if(d.tab==='aipp'){AI.ppTab=d.k;return aiRender()}
 if(d.aimod){if(!S.signedIn&&!await ensureMe())return;AI.mod=d.aimod;AI.view='form';aiRender();return window.scrollTo(0,$('#aiBody').offsetTop-80)}
 if(b.hasAttribute('data-aihome')){AI.view='home';return aiRender()}
 if(b.hasAttribute('data-ailib')){AI.view='lib';AI.lib=null;return aiRender()}
 if(d.ailibo)return aiLibOpen(d.ailibo);
 if(d.ailibd){if(!await confirmBox('حذف هذا العنصر من مكتبتك؟','احذفي'))return;await S.del(S.up(d.ailibd));if(r&&r.saved&&r.saved.id===d.ailibd)r.saved=null;AI.lib=null;return aiRender()}
 if(b.hasAttribute('data-aiopen')){AI.view='result';return aiRender()}
 if(b.hasAttribute('data-aidiscard')){if(!await confirmBox('حذف المسودة غير المحفوظة؟','احذفيها'))return;AI.res=null;aiStore('res',null);return aiRender()}
 if(!r)return pageClick(e);
 if(b.hasAttribute('data-aisave'))return aiSave();
 if(b.hasAttribute('data-airedo')){AI.mod=r.module;AI.form={...(AI.form||{}),...r.input};AI.view='form';return aiRender()}
 if(d.aidz){r.d=d.aidz;aiDirty();return aiRender()}
 if(b.hasAttribute('data-aiplay')){const {slides}=aiSlides(r);return openPlayer(slides,aiTitle(r))}
 if(b.hasAttribute('data-aistudio'))return aiSaveLesson(true);
 if(b.hasAttribute('data-aijr'))return openJourney({id:'ai'+r.id,title:aiTitle(r),c:r.data.content,d:r.d,subj:r.data.content.sub});
 if(b.hasAttribute('data-aiedit')){AI.edit=!AI.edit;return aiRender()}
 const S_=r.data.slides;
 if(d.airgs!=null){const i=+d.airgs,s=S_[i];return aiRegen(s.type,s,v=>{S_[i]=v},b)}
 if(d.aimv!=null){const i=+d.aimv,j=i+ +d.dir;if(j<0||j>=S_.length)return;[S_[i],S_[j]]=[S_[j],S_[i]];AI.gi=Math.max(0,AI.gi+ +d.dir);aiDirty();return aiRender()}
 if(d.aidup!=null){S_.splice(+d.aidup+1,0,clone(S_[+d.aidup]));aiDirty();return aiRender()}
 if(d.aidel!=null){if(S_.length<3)return toast('يجب أن يبقى في العرض شريحتان على الأقل');S_.splice(+d.aidel,1);AI.gi=Math.max(0,AI.gi-1);aiDirty();return aiRender()}
 if(b.hasAttribute('data-airgp')){const k=$('#aiPart').value,c=r.data.content,cur=k==='act'?{strategy:c.strategy,act:c.act}:c[k];return aiRegen(k,cur,v=>{if(k==='act'){c.act=v.act;c.strategy=v.strategy||c.strategy}else c[k]=v},b)}
 const Q=r.data.questions;
 if(d.airgq!=null){const i=+d.airgq;return aiRegen(Q[i].t,Q[i],v=>{Q[i]={...v,id:Q[i].id}},b)}
 if(d.aiqmv!=null){const i=+d.aiqmv,j=i+ +d.dir;[Q[i],Q[j]]=[Q[j],Q[i]];aiDirty();return aiRender()}
 if(d.aiqdel!=null){if(Q.length<2)return toast('يجب أن يبقى سؤال واحد على الأقل');Q.splice(+d.aiqdel,1);aiDirty();return aiRender()}
 if(d.aiqprint){const x=aiExam(r);return d.aiqprint==='key'?printHTML(`نموذج الإجابة · ${x.title}`,examKey(x,'A')+'<div class="pgb"></div>'+examKey(x,'B')):printHTML(x.title,examPaper(x,d.aiqprint))}
 if(b.hasAttribute('data-aiqcls')){const c=typeof crCls==='function'?crCls():null;if(!c){toast('أنشئي فصلًا أولًا من «فصلي»');return}const x=aiExam(r);x.id=uid();c.exams=c.exams||[];c.exams.push(x);crSave();await MOT.flush();toast(`أُضيف إلى اختبارات «${c.name}»`);return}
 if(b.hasAttribute('data-aiq2g')){const mc=Q.filter(q=>q.t==='mcq'&&q.o.filter(x=>String(x).trim()).length>=3),tf=Q.filter(q=>q.t==='tf');let type,rows;
  if(mc.length>=2){const four=mc.every(q=>q.o.filter(x=>String(x).trim()).length>=4);type=four?'star':'speed';rows=mc.map(q=>{const ok=q.o[q.a],o=q.o.filter(x=>String(x).trim()&&x!==ok);return [q.q,'',ok,...o.slice(0,four?3:2)]})}
  else if(tf.length>=2){type='tf';rows=tf.map(q=>[q.q,'',q.a==='1'?'صح':'خطأ'])}else return toast('يلزم سؤالا اختيار أو صح وخطأ على الأقل');
  if(gameLocked(type))return needPlan('هذا النوع من الألعاب ضمن باقة أعلى');const T=GTYPES[type],o={type,title:r.data.title.slice(0,60),d:r.d,count:rows.length,time:20,level:'all',[T.f]:rows,updated:new Date().toISOString()},id='G_'+uid();
  try{await S.set(S.up(id),o);ME.games.unshift({...o,_id:id});toast(`حُفظت لعبة «${T.name}» في «ألعابي»`);runGame({...o,id})}catch(err){toast('تعذّر الحفظ')}return}
 if(b.hasAttribute('data-aigplay')){const g=aiGameCfg(r);if(gameLocked(g.type))return needPlan('هذه اللعبة ضمن باقة أعلى');return runGame({...g,id:'preview'})}
 if(b.hasAttribute('data-aigedit'))return aiSaveGame(true);
 if(b.hasAttribute('data-airgi'))return aiRegen('items',r.data.rows.slice(0,6),v=>{r.data.rows=v.rows},b);
 if(d.airgw!=null){const i=+d.airgw,s=r.data.sections[i];return aiRegen(s.kind,s,v=>{r.data.sections[i]=v},b)}
 if(d.aiwdel!=null){if(r.data.sections.length<2)return toast('يجب أن يبقى قسم واحد');r.data.sections.splice(+d.aiwdel,1);aiDirty();return aiRender()}
 if(d.aiwidel){const [i,k]=d.aiwidel.split('.').map(Number);const it=r.data.sections[i].items;if(it.length<2)return toast('يجب أن يبقى عنصر واحد');it.splice(k,1);aiDirty();return aiRender()}
 if(d.aiwprint!=null)return aiPrintWs(d.aiwprint==='1');
 if(d.airgf){const k=d.airgf;return aiRegen(k,r.data[k],v=>{r.data[k]=v},b)}
 if(b.hasAttribute('data-aipprint'))return printHTML('تحضير درس: '+r.data.title,`<div class="wsP pp pr">${aiPrepBody(r)}</div>`);
 if(d.aistdel!=null){if(r.data.stages.length<2)return;r.data.stages.splice(+d.aistdel,1);aiDirty();return aiRender()}
 if(b.hasAttribute('data-aistadd')){r.data.stages.push({name:'مرحلة',minutes:5,teacher:'',students:''});aiDirty();return aiRender()}
 if(b.hasAttribute('data-ai2lesson')){AI.mod='lesson';AI.form={...(AI.form||{}),...r.input,objectives:r.data.objectives.join('\n')};AI.view='form';return aiRender()}
 return pageClick(e)}
function aiEditVal(t){let v=t.value;if(t.dataset.t==='lines')v=v.split('\n').map(x=>x.trim()).filter(Boolean);else if(t.dataset.t==='num')v=num(v);else if(t.dataset.t==='bool')v=v==='1';return v}
function aiInput(e){const t=e.target;if(t.dataset.aie&&AI.res){if(t.dataset.t==='lines')return;aiSet(AI.res.data,t.dataset.aie,aiEditVal(t));aiDirty();return}return pageInput(e)}
function aiChange(e){const t=e.target;
 if(t.name==='stage'&&t.form&&t.form.id==='aiForm'){const g=$('#aiGrade');g.innerHTML=AI_STAGES[t.value].map(x=>`<option>${x}</option>`).join('');$('#aiSubj').innerHTML=(AI_SUBJ[t.value]||[]).map(s=>`<option value="${esc(s)}">`).join('');return}
 if(t.dataset.aie&&AI.res){aiSet(AI.res.data,t.dataset.aie,aiEditVal(t));aiDirty();const p=t.dataset.aie;
  // options changed or quiz answer picked: refresh dependent selects/previews
  if(t.dataset.t==='lines'||t.tagName==='SELECT'){const y=scrollY;aiRender();window.scrollTo(0,y)}return}
 return pageChange(e)}
function aiSubmit(e){if(e.target.id==='aiForm'){e.preventDefault();return aiGenerate(aiReadForm())}return pageSubmit(e)}

/* ---------- admin: AI management ---------- */
const AIA={st:null,user:null};
async function aiAdminPanel(p){p.innerHTML='<p class="note">جارٍ تحميل إحصائيات المساعد…</p>';try{AIA.st=await aiCall('GET','/admin/stats')}catch(e){p.innerHTML=`<div class="aiNote warn">${ic('triangle-alert')}<span>${esc(e.message)}</span></div>`;return}aiAdminPaint(p)}
function aiAdminPaint(p){const s=AIA.st,c=s.config,mx=Math.max(1,...s.series.map(x=>(x.ok|0)+(x.fail|0))),prov=s.providers,M=Object.keys(AIM);
 const errN={provider_quota:'نفاد حصة المزوّد',rate_limited:'ضغط طلبات',provider_down:'تعذّر الوصول',timeout:'انتهاء الوقت',bad_output:'صيغة غير صالحة',blocked:'رفض أمان',off_topic:'خارج التعليم',not_configured:'لا يوجد مفتاح',bad_key:'مفتاح غير صالح',region:'المنطقة غير مدعومة',model_unavailable:'نموذج غير متاح',bad_request:'طلب مرفوض'};
 p.innerHTML=`<div class="mtop"><div class="stat"><b>${ar(s.total)}</b><span>إجمالي التوليدات الناجحة</span></div><div class="stat"><b>${ar(s.today.ok)}</b><span>اليوم${c.globalDaily?` من ${ar(c.globalDaily)}`:''}</span></div><div class="stat"><b>${ar(s.today.users)}</b><span>معلمة استخدمت المساعد اليوم</span></div><div class="stat"><b>${ar(s.today.fail)}</b><span>طلبات فاشلة اليوم</span></div><div class="stat"><b>${ar(Math.round(s.tokens.today/1000))}k</b><span>رموز اليوم (${ar(Math.round(s.tokens.month/1000))}k في ٣٠ يومًا)</span></div></div>
 <div class="aiAdG"><div class="aiCard"><h3>${ic('plug-zap')}حالة المزوّد</h3>${Object.entries(prov).map(([k,v])=>`<p><span class="bd ${v.configured?'ok':'warn'}">${v.configured?'مفعّل':'لا يوجد مفتاح'}</span> <b>${esc(v.label)}</b> <small class="note">${esc(v.models.join('، '))}</small></p>`).join('')}
  <p class="note">آخر نجاح: ${s.last.ok?esc(fmtDate(new Date(s.last.ok.t).toISOString()))+' · '+esc(s.last.ok.model):'—'}<br>آخر فشل: ${s.last.fail?esc(fmtDate(new Date(s.last.fail.t).toISOString()))+' · '+esc(errN[s.last.fail.err]||s.last.fail.err):'—'}${s.cooldownUntil?`<br><b>إيقاف مؤقت تلقائي حتى ${esc(new Date(s.cooldownUntil).toLocaleTimeString('ar-SA'))}</b> بسبب حد المزوّد`:''}</p>
  <div class="acts"><button class="btn sec sm" data-aiatest>${ic('activity')}اختبري الاتصال</button></div><p class="note">الطبقة المجانية من Gemini: يستخدم Google المدخلات والمخرجات لتحسين منتجاته وقد يراجعها بشر. لا تُرسل المنصة بيانات الطلاب. للخصوصية الأعلى فعّلي الفوترة في Google AI Studio.</p></div>
 <div class="aiCard"><h3>${ic('chart-column')}آخر ١٤ يومًا</h3><div class="aiBars">${s.series.map(x=>`<div title="${esc(x.day)}: ${x.ok|0} ناجح، ${x.fail|0} فاشل"><i style="height:${Math.round(((x.ok|0)+(x.fail|0))/mx*100)}%"><em style="height:${(x.ok|0)+(x.fail|0)?Math.round((x.fail|0)/((x.ok|0)+(x.fail|0))*100):0}%"></em></i><span>${esc(x.day.slice(8))}</span></div>`).join('')||'<p class="note">لا يوجد استخدام بعد.</p>'}</div>
  <h3>أسباب الفشل (١٤ يومًا)</h3>${s.failures.length?`<ul class="aiFl">${s.failures.map(f=>`<li><span>${esc(errN[f.err]||f.err)}</span><b>${ar(f.n)}</b></li>`).join('')}</ul>`:'<p class="note">لا توجد أخطاء.</p>'}</div></div>
 <form class="aiCard" id="aiaCfg"><h3>${ic('settings-2')}الإعدادات والحصص اليومية</h3>
  <label class="sw2"><input type="checkbox" name="enabled" ${c.enabled?'checked':''}> تشغيل المساعد لجميع المعلمات</label>
  <label class="lab">رسالة للمعلمات عند الإيقاف<input class="in" name="notice" maxlength="240" value="${esc(c.notice)}" placeholder="مثل: المساعد متوقف للصيانة حتى المساء"></label>
  <div class="scroll"><table class="tbl"><thead><tr><th>الأداة</th><th>مفعّلة</th><th>الحصة اليومية لكل معلمة</th><th>اليوم</th><th>الإجمالي</th><th>فشل</th></tr></thead><tbody>${M.map(k=>{const u=s.byModule.find(x=>x.module===k)||{};return `<tr><td>${esc(AIM[k].n)}</td><td><input type="checkbox" name="mod_${k}" ${c.modules[k]?'checked':''} aria-label="تفعيل ${esc(AIM[k].n)}"></td><td><input class="in sm" type="number" min="0" max="100" name="q_${k}" value="${c.quotas[k]}"></td><td>${ar(u.today|0)}</td><td>${ar(u.total|0)}</td><td>${ar(u.fails|0)}</td></tr>`}).join('')}<tr><td>إعادة توليد جزء</td><td>—</td><td><input class="in sm" type="number" min="0" max="100" name="q_regen" value="${c.quotas.regen}"></td><td colspan="3"></td></tr></tbody></table></div>
  <div class="pgrid2"><label class="lab">الحد اليومي للمنصة كلها (٠ = بلا حد)<input class="in" type="number" min="0" name="globalDaily" value="${c.globalDaily}"></label><label class="lab">محاولات كل معلمة في ١٠ دقائق<input class="in" type="number" min="1" max="60" name="burst" value="${c.burst}"></label><label class="lab">انتظار الحساب الجديد (دقائق)<input class="in" type="number" min="0" name="minAccountMinutes" value="${c.minAccountMinutes}"></label>
  <label class="lab">المزوّد<select class="in" name="provider"><option value="gemini" ${c.provider==='gemini'?'selected':''}>Google Gemini</option><option value="openai" ${c.provider==='openai'?'selected':''} ${prov.openai.configured?'':'disabled'}>OpenAI-compatible${prov.openai.configured?'':' (لا يوجد مفتاح)'}</option></select></label><label class="lab">النموذج (اختياري)<input class="in" name="model" value="${esc(c.model)}" placeholder="${esc(prov.gemini.models[0]||'')}"></label></div>
  <label class="sw2"><input type="checkbox" name="fallback" ${c.fallback?'checked':''}> عند ضغط الطلبات جرّبي النموذج الاحتياطي ثم المزوّد الآخر</label>
  <div class="acts"><button class="btn pri">${ic('save')}احفظي الإعدادات</button></div></form>
 <div class="aiAdG"><div class="aiCard"><h3>${ic('user-cog')}حدود معلمة محددة</h3><form id="aiaU" class="acts"><input class="in grow" name="email" type="email" placeholder="بريد المعلمة" value="${esc(AIA.user?AIA.user.email:'')}" required><button class="btn sec">${ic('search')}ابحثي</button></form><div id="aiaUB">${aiAdminUser()}</div></div>
 <div class="aiCard"><h3>${ic('users')}الأكثر استخدامًا اليوم</h3>${s.topUsers.length?`<ol class="logl">${s.topUsers.map(u=>`<li><span>${esc(u.email)}</span><b>${ar(u.n)}</b></li>`).join('')}</ol>`:'<p class="note">لا يوجد.</p>'}
 <h3>آخر الطلبات الفاشلة</h3>${s.recentFailures.length?`<ol class="logl">${s.recentFailures.map(f=>`<li><time>${esc(new Date(f.created).toLocaleString('ar-SA'))}</time><span>${esc(AIM[f.module]?AIM[f.module].n:f.module)} · ${esc(errN[f.err]||f.err)}</span></li>`).join('')}</ol>`:'<p class="note">لا يوجد.</p>'}<p class="note">لا يُخزَّن نص الطلبات ولا المحتوى المولّد على الخادم؛ السجل يحفظ النوع والوقت والحالة وعدد الرموز فقط.</p></div></div>`;
 icons();
 p.onsubmit=async e=>{e.preventDefault();const f=e.target;
  if(f.id==='aiaCfg'){const fd=new FormData(f),cfg={enabled:fd.has('enabled'),notice:fd.get('notice'),provider:fd.get('provider'),model:String(fd.get('model')||'').trim(),fallback:fd.has('fallback'),globalDaily:+fd.get('globalDaily'),burst:+fd.get('burst'),minAccountMinutes:+fd.get('minAccountMinutes'),quotas:Object.fromEntries([...M,'regen'].map(k=>[k,+fd.get('q_'+k)])),modules:Object.fromEntries(M.map(k=>[k,fd.has('mod_'+k)]))};
   try{const j=await aiCall('PUT','/admin/config',cfg);AIA.st.config=j.config;AI.st=null;toast('حُفظت إعدادات المساعد');aiAdminPaint(p)}catch(err){toast(err.message)}}
  if(f.id==='aiaU'){try{AIA.user=await aiCall('GET','/admin/user?email='+encodeURIComponent(new FormData(f).get('email')))}catch(err){AIA.user=null;toast(err.code==='not_found'?'لا يوجد حساب بهذا البريد':err.message)}$('#aiaUB').innerHTML=aiAdminUser();icons()}
  if(f.id==='aiaUL'){const fd=new FormData(f),body={blocked:fd.has('blocked'),note:fd.get('note'),quotas:Object.fromEntries([...M,'regen'].map(k=>[k,fd.get('u_'+k)]))};try{AIA.user=await aiCall('PUT','/admin/user?email='+encodeURIComponent(AIA.user.email),body);toast('حُفظت حدود المعلمة');$('#aiaUB').innerHTML=aiAdminUser();icons()}catch(err){toast(err.message)}}};
 p.onclick=async e=>{const b=e.target.closest('[data-aiatest]');if(!b)return;b.disabled=true;try{const j=await aiCall('POST','/admin/test',{});if(j.ok){toast(`يعمل: ${j.model} (${ar(j.ms)} ملي ثانية)`);return aiAdminPanel(p)}openDialog(`<h2 class="dh">فشل الاتصال بالمزوّد</h2><p class="lead"><b>${esc(errN[j.error]||j.error)}</b></p><p class="note">ردّ المزوّد:</p><pre class="aiPre" dir="ltr">${esc(j.detail||'—')}</pre><div class="acts"><button class="btn pri" data-close>حسنًا</button></div>`,{focus:false})}catch(err){toast(err.message)}b.disabled=false}}
function aiAdminUser(){const u=AIA.user;if(!u)return `<p class="note">ابحثي ببريد المعلمة لتغيير حصتها أو إيقاف المساعد لها. اتركي الخانة فارغة لتتبع الحصة العامة.</p>`;const q=(u.limits&&u.limits.quotas)||{},t=Object.fromEntries((u.today||[]).map(x=>[x.bucket,x.ok|0]));
 return `<form id="aiaUL"><p><b>${esc(u.email)}</b></p><label class="sw2"><input type="checkbox" name="blocked" ${u.limits&&u.limits.blocked?'checked':''}> إيقاف المساعد لهذه المعلمة</label><div class="pgrid2">${[...Object.keys(AIM),'regen'].map(k=>`<label class="lab">${esc(k==='regen'?'إعادة التوليد':AIM[k].n)} <small class="note">(اليوم ${ar(t[k]|0)})</small><input class="in sm" type="number" min="0" max="200" name="u_${k}" value="${q[k]??''}" placeholder="عام"></label>`).join('')}</div><label class="lab">ملاحظة<input class="in" name="note" maxlength="200" value="${esc((u.limits&&u.limits.note)||'')}"></label><button class="btn pri sm">${ic('save')}احفظي</button></form>`}
