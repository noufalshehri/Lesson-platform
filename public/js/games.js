'use strict';
/* games.js: 18 educational game engines, runner, editor */
const GFIELDS={
 g_mcq:{l:'الأسئلة',cols:[{l:'السؤال'},{l:'صورة',w:'s',img:1},{l:'الإجابة الصحيحة'},{l:'خيار خاطئ'},{l:'خيار خاطئ'}]},
 g_mcq4:{l:'الأسئلة',cols:[{l:'السؤال'},{l:'صورة',w:'s',img:1},{l:'الإجابة الصحيحة'},{l:'خيار خاطئ'},{l:'خيار خاطئ'},{l:'خيار خاطئ'}]},
 g_qa:{l:'الأسئلة والتحديات',cols:[{l:'السؤال أو التحدي'},{l:'الإجابة (اختياري)'}]},
 g_pairs:{l:'الأزواج: كلمة وصورتها',cols:[{l:'الكلمة'},{l:'صورة',w:'s',img:1}]},
 g_sort:{l:'العناصر ومجموعاتها (مجموعتان أو ثلاث)',cols:[{l:'العنصر'},{l:'صورة',w:'s',img:1},{l:'المجموعة'}]},
 g_who:{l:'الألغاز',cols:[{l:'تلميح ١'},{l:'تلميح ٢'},{l:'تلميح ٣'},{l:'الإجابة'},{l:'صورة',w:'s',img:1},{l:'خيار خاطئ'},{l:'خيار خاطئ'}]},
 g_tf:{l:'العبارات',cols:[{l:'العبارة'},{l:'صورة',w:'s',img:1},{l:'الإجابة',w:'m',opt:['صح','خطأ']}]},
 g_seq:{l:'جولات الترتيب',cols:[{l:'المطلوب'},{l:'العناصر بالترتيب الصحيح، بينها -'}]},
 g_lvl:{l:'بنك الأسئلة',cols:[{l:'السؤال'},{l:'صورة',w:'s',img:1},{l:'الإجابة الصحيحة'},{l:'خيار خاطئ'},{l:'خيار خاطئ'},{l:'المستوى',w:'m',opt:['سهل','متوسط','صعب']}]},
 g_match:{l:'أزواج المطابقة: بطاقة ونظيرتها',cols:[{l:'البطاقة الأولى (سؤال أو كلمة)'},{l:'صورة',w:'s',img:1},{l:'البطاقة المطابقة (الجواب)'}]},
 pieces:{l:'عدد قطع الصورة',t:'sel',opt:[['4','٤ قطع · سهل'],['9','٩ قطع · متوسط'],['16','١٦ قطعة · صعب']]},
 count:{l:'عدد الأسئلة في الجولة',t:'num',min:1,max:30,def:8},time:{l:'الوقت لكل سؤال بالثواني',t:'num',min:5,max:120,def:20},
 level:{l:'مستوى الصعوبة',t:'sel',opt:[['all','كل المستويات'],['سهل','سهل'],['متوسط','متوسط'],['صعب','صعب']]},gtitle:{l:'اسم اللعبة',t:'text'}
};
const GTYPES={
 wheel:{name:'عجلة الحظ',icon:'disc-3',f:'g_qa',desc:'لفّة عشوائية تختار سؤالًا أو تحديًا.'},
 boxes:{name:'افتح الصندوق',icon:'gift',f:'g_qa',desc:'صناديق تخفي أسئلة ومفاجآت.'},
 star:{name:'من سيربح النجمة؟',icon:'star',f:'g_mcq4',desc:'مسابقة بمراحل حتى النجمة الكبرى.'},
 catch:{name:'صيد الإجابة الصحيحة',icon:'fish',f:'g_mcq',timed:1,desc:'الإجابات تسبح، اصطادوا الصحيحة.'},
 memory:{name:'الذاكرة',icon:'brain',f:'g_pairs',desc:'طابقوا الصورة بالكلمة.'},
 drag:{name:'اسحب وأفلت',icon:'move',f:'g_sort',desc:'صنّفوا العناصر في مجموعاتها.'},
 maze:{name:'المتاهة التعليمية',icon:'route',f:'g_mcq',desc:'كل إجابة صحيحة خطوة نحو الهدف.'},
 speed:{name:'تحدي السرعة',icon:'timer',f:'g_mcq',timed:1,desc:'أجيبوا قبل انتهاء الوقت.'},
 balloons:{name:'البالونات',icon:'party-popper',f:'g_mcq',timed:1,desc:'فرقعوا بالون الإجابة الصحيحة.'},
 treasure:{name:'الكنز المفقود',icon:'map',f:'g_mcq',desc:'حلّوا الألغاز لتكشفوا خريطة الكنز.'},
 whoami:{name:'من أنا؟',icon:'circle-help',f:'g_who',desc:'تلميحات متتالية، خمّنوا الإجابة.'},
 tf:{name:'صح أم خطأ',icon:'circle-check-big',f:'g_tf',timed:1,desc:'تحديات سريعة بالوقت.'},
 order:{name:'الترتيب الصحيح',icon:'list-ordered',f:'g_seq',desc:'رتّبوا الأرقام أو الكلمات أو الأحداث.'},
 teams:{name:'تحدي المجموعات',icon:'swords',f:'g_mcq',timed:1,desc:'فريقان يتنافسان بشدّ الحبل.'},
 bank:{name:'بنك الأسئلة',icon:'landmark',f:'g_lvl',lvl:1,desc:'اختاروا المستوى واكسبوا النقاط.'},
 puzzle:{name:'تركيب القطع',icon:'puzzle',f:'g_pairs',ex:['pieces'],desc:'ركّبوا قطع الصورة واكتشفوا الكلمة.'},
 hunt:{name:'البحث عن الكنز',icon:'shovel',f:'g_mcq',desc:'احفروا الجزيرة: كل إجابة صحيحة حفرة جديدة.'},
 match:{name:'ذاكرة المطابقة',icon:'layers',f:'g_match',desc:'اقلبوا البطاقات وطابقوا السؤال بجوابه.'}
};
const GT_ORDER=Object.keys(GTYPES);
const gameLocked=t=>GT_ORDER.indexOf(t)>=lim('games');
function gameArt(t){const s=b=>`<svg viewBox="0 0 100 100" class="gart" aria-hidden="true">${b}</svg>`;const A={
 wheel:s(`${[0,1,2,3,4,5].map(i=>{const a0=i*60*Math.PI/180,a1=(i+1)*60*Math.PI/180;return `<path d="M50 52 L${(50+40*Math.cos(a0)).toFixed(1)} ${(52+40*Math.sin(a0)).toFixed(1)} A40 40 0 0 1 ${(50+40*Math.cos(a1)).toFixed(1)} ${(52+40*Math.sin(a1)).toFixed(1)}Z" fill="${['#ffc800','#0284c7','#ea580c','#db2777','#16a34a','#7c3aed'][i]}"/>`}).join('')}<circle cx="50" cy="52" r="8" fill="#fff" stroke="#171717" stroke-width="3"/><path d="M44 4 L56 4 L50 16Z" fill="#171717"/>`),
 boxes:s(`<rect x="10" y="40" width="36" height="34" rx="4" fill="#a855f7"/><rect x="8" y="32" width="40" height="10" rx="3" fill="#c084fc"/><rect x="25" y="32" width="6" height="42" fill="#fde047"/><rect x="54" y="48" width="36" height="34" rx="4" fill="#0ea5e9"/><rect x="52" y="40" width="40" height="10" rx="3" fill="#38bdf8"/><rect x="69" y="40" width="6" height="42" fill="#fde047"/><text x="72" y="32" font-size="22" font-weight="800" fill="#f59e0b" font-family="sans-serif">?</text>`),
 star:s(`${[0,1,2,3,4].map(i=>`<rect x="14" y="${78-i*14}" width="${30+i*8}" height="10" rx="3" fill="${i===4?'#facc15':'#c4b5fd'}"/>`).join('')}<path d="${starPath(78,30,18,.45)}" fill="#facc15" stroke="#f59e0b" stroke-width="3" stroke-linejoin="round"/>`),
 catch:s(`<rect width="100" height="100" rx="14" fill="#cffafe"/><path d="M18 50 Q34 36 50 50 Q34 64 18 50Z" fill="#fb923c"/><path d="M50 50 L60 42 L60 58Z" fill="#fb923c"/><circle cx="26" cy="47" r="2.5" fill="#0f172a"/><path d="M78 6 V54 Q78 64 70 64" stroke="#475569" stroke-width="3" fill="none"/><circle cx="70" cy="70" r="3" fill="#ef4444"/>`),
 memory:s(`<rect x="8" y="14" width="38" height="50" rx="6" fill="#db2777" transform="rotate(-8 27 39)"/><rect x="50" y="24" width="38" height="50" rx="6" fill="#fff" stroke="#db2777" stroke-width="4" transform="rotate(8 69 49)"/><text x="60" y="58" font-size="26" font-family="sans-serif">🍎</text><path d="${starPath(26,38,10,.45)}" fill="#fde047" transform="rotate(-8 27 39)"/>`),
 drag:s(`<rect x="8" y="58" width="38" height="32" rx="6" fill="#bfdbfe" stroke="#2563eb" stroke-width="3"/><rect x="54" y="58" width="38" height="32" rx="6" fill="#fbcfe8" stroke="#db2777" stroke-width="3"/><rect x="34" y="8" width="32" height="24" rx="6" fill="#facc15"/><path d="M50 34 V50 M42 44 L50 52 L58 44" stroke="#171717" stroke-width="4" fill="none" stroke-linecap="round"/>`),
 maze:s(`<path d="M14 84 H40 V60 H20 V36 H60 V14 H86" stroke="#7c3aed" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="14" cy="84" r="8" fill="#22c55e"/><path d="${starPath(86,14,11,.45)}" fill="#facc15"/>`),
 speed:s(`<circle cx="50" cy="56" r="36" fill="#fff" stroke="#ea580c" stroke-width="6"/><rect x="44" y="8" width="12" height="10" rx="2" fill="#ea580c"/><path d="M50 56 L50 32 M50 56 L66 64" stroke="#171717" stroke-width="5" stroke-linecap="round"/><path d="M50 20 A36 36 0 0 1 86 56 L50 56Z" fill="#fed7aa" opacity=".8"/>`),
 balloons:s(`<ellipse cx="30" cy="38" rx="17" ry="21" fill="#ef4444"/><ellipse cx="66" cy="32" rx="17" ry="21" fill="#3b82f6"/><ellipse cx="50" cy="52" rx="15" ry="19" fill="#facc15"/><path d="M30 59 Q34 76 46 92 M66 53 Q62 74 52 92 M50 71 V92" stroke="#64748b" stroke-width="2" fill="none"/>`),
 treasure:s(`<rect x="14" y="44" width="72" height="42" rx="6" fill="#a16207"/><path d="M14 44 Q50 10 86 44Z" fill="#ca8a04"/><rect x="14" y="52" width="72" height="6" fill="#facc15"/><rect x="44" y="48" width="12" height="16" rx="2" fill="#fde047" stroke="#92400e" stroke-width="2"/><circle cx="24" cy="30" r="4" fill="#fde047"/><circle cx="76" cy="28" r="3" fill="#fde047"/>`),
 whoami:s(`<circle cx="50" cy="50" r="40" fill="#e0e7ff"/><path d="M38 38 Q38 24 50 24 Q64 24 64 38 Q64 48 52 52 V60" stroke="#4f46e5" stroke-width="8" fill="none" stroke-linecap="round"/><circle cx="52" cy="74" r="5" fill="#4f46e5"/>`),
 tf:s(`<rect x="6" y="24" width="42" height="52" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="4"/><path d="M16 50 L24 58 L38 40" stroke="#16a34a" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="52" y="24" width="42" height="52" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="4"/><path d="M64 40 L82 58 M82 40 L64 58" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>`),
 order:s(`${[0,1,2].map(i=>`<rect x="${8+i*30}" y="${60-i*18}" width="26" height="${22+i*18}" rx="5" fill="${['#38bdf8','#a78bfa','#f472b6'][i]}"/><text x="${15+i*30}" y="${78-i*4}" font-size="18" font-weight="800" fill="#fff" font-family="sans-serif">${i+1}</text>`).join('')}`),
 teams:s(`<path d="M6 54 H94" stroke="#a16207" stroke-width="5"/><rect x="46" y="44" width="8" height="20" fill="#ef4444"/><circle cx="16" cy="40" r="9" fill="#38bdf8"/><circle cx="84" cy="40" r="9" fill="#f472b6"/><rect x="10" y="50" width="12" height="24" rx="5" fill="#38bdf8"/><rect x="78" y="50" width="12" height="24" rx="5" fill="#f472b6"/>`),
 bank:s(`<rect x="8" y="14" width="26" height="20" rx="4" fill="#bbf7d0"/><rect x="37" y="14" width="26" height="20" rx="4" fill="#fde68a"/><rect x="66" y="14" width="26" height="20" rx="4" fill="#fecaca"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${8+c*29}" y="${40+r*18}" width="26" height="14" rx="3" fill="${['#22c55e','#f59e0b','#ef4444'][c]}" opacity="${1-r*.2}"/>`).join('')).join('')}`)
,
 puzzle:s(`<path d="M10 10 H44 V22 Q52 16 52 26 Q52 36 44 30 V44 H10Z" fill="#f472b6"/><path d="M56 10 H90 V44 H76 Q82 52 72 52 Q62 52 68 44 H56Z" fill="#38bdf8"/><path d="M10 56 H24 Q18 48 28 48 Q38 48 32 56 H44 V90 H10Z" fill="#facc15"/><path d="M58 58 H92 V92 H58 V78 Q50 84 50 74 Q50 64 58 70Z" fill="#4ade80" transform="rotate(8 75 75)"/>`),
 hunt:s(`<rect width="100" height="100" rx="14" fill="#7dd3fc"/><ellipse cx="50" cy="60" rx="44" ry="30" fill="#fde68a"/>${[0,1,2].map(r=>[0,1,2].map(c=>`<rect x="${22+c*20}" y="${42+r*13}" width="16" height="10" rx="3" fill="${r===1&&c===2?'#a16207':'#eab308'}" opacity=".9"/>`).join('')).join('')}<path d="M62 56 L70 64 M70 56 L62 64" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/><path d="M14 30 L30 14" stroke="#78350f" stroke-width="5" stroke-linecap="round"/><path d="M26 10 L36 20 L30 26 L20 16Z" fill="#94a3b8"/>`),
 match:s(`<rect x="6" y="18" width="40" height="56" rx="8" fill="#fff" stroke="#7c3aed" stroke-width="4"/><text x="14" y="54" font-size="20" font-weight="800" fill="#7c3aed" font-family="sans-serif">٢+٣</text><rect x="54" y="26" width="40" height="56" rx="8" fill="#fff" stroke="#16a34a" stroke-width="4"/><text x="66" y="64" font-size="26" font-weight="800" fill="#16a34a" font-family="sans-serif">٥</text><path d="M40 86 Q50 96 60 86" stroke="#facc15" stroke-width="5" fill="none" stroke-linecap="round"/>`)
};return A[t]||A.wheel}
function allGames(){return [...GAMES,...ME.custom.filter(c=>c.kind==='game').map(c=>({...c.cfg,id:c._id,custom:1})),...ME.games.map(g=>({...g,id:g._id,mine:1}))].filter(g=>GTYPES[g.type]&&!ME.hidden.includes(g.id))}
const findGame=id=>id?allGames().find(g=>g.id===id)||GAMES.find(g=>g.id===id):null;
const gItems=g=>{const T=GTYPES[g.type];return rowsOK(g[T.f],GFIELDS[T.f].cols[0].img?1:0)};
function mcqOpts(r,n=3){return shuffle([{x:r[2],ok:1},{x:r[3]},{x:r[4]},...(n>3?[{x:r[5]}]:[])].filter(o=>String(o.x||'').trim()))}
const gPic=v=>v?`<span class="gpic">${picHTML(v)}</span>`:'';

/* ---------- runner ---------- */
const GR={on:false};
function openGameById(id){const g=findGame(id);if(!g)return toast('اللعبة غير موجودة');if(gameLocked(g.type))return needPlan('هذه اللعبة ضمن باقة أعلى');runGame(g)}
function runGame(cfg){closeGame(true);const g=clone(cfg),T=GTYPES[g.type],d=DESIGNS[g.d]?g.d:'adv',D=DESIGNS[d];
 let items=gItems(g);if(g.type==='bank'&&g.level&&g.level!=='all')items=items.filter(r=>r[5]===g.level);
 if(!items.length)return toast('أضيفي محتوى للعبة أولًا');
 if(!['memory','drag','bank','order','wheel','boxes'].includes(g.type))items=shuffle(items);
 const cnt=Math.max(1,num(g.count)||items.length);items=items.slice(0,g.type==='drag'?Math.max(cnt,12):cnt);
 const el=document.createElement('div');el.className=`gr d-${d}`;el.id='gr';el.style.cssText=`--wc:${D.c};--wc2:${D.c2};--wc3:${D.c3}`;
 el.innerHTML=`${scene(d)}<div class="grTop"><button class="ib" data-gx aria-label="إغلاق اللعبة">${ic('x')}</button><div class="grT"><b>${esc(g.title)}</b><small>${esc(T.name)}</small></div><div class="grTime" id="grTime"></div><div class="grScore">${D.reward} <b id="grScore">${ar(0)}</b></div><button class="ib" data-gm aria-label="الصوت">${ic(SND.muted?'volume-x':'volume-2')}</button></div><div class="grMain" id="grMain"></div>`;
 document.body.appendChild(el);document.body.style.overflow='hidden';
 el.addEventListener('click',e=>{if(e.target.closest('[data-gx]'))closeGame();else if(e.target.closest('[data-gm]')){SND.muted=!SND.muted;e.target.closest('[data-gm]').innerHTML=ic(SND.muted?'volume-x':'volume-2');icons()}});
 const tok=GR.tok=(GR.tok||0)+1;const live=()=>tok===GR.tok&&GR.on;Object.assign(GR,{on:true,g,items,score:0,max:0,stop:null,d});
 const A={add(n=1){if(!live())return;GR.score+=n;$('#grScore').textContent=ar(GR.score);sfx('win');confetti(50)},max(n){GR.max=n},
  timer(sec,onEnd){if(!live())return()=>0;A.stopT();const t=$('#grTime');let left=sec;t.innerHTML=`<span class="tb"><i style="width:100%"></i></span><b>${ar(left)}</b>`;
   const id=setInterval(()=>{left--;const b=$('#grTime');if(!b){clearInterval(id);return}b.querySelector('i').style.width=(left/sec*100)+'%';b.querySelector('b').textContent=ar(Math.max(0,left));if(left<=3&&left>0)sfx('tick');if(left<=0){clearInterval(id);GR.stop=null;onEnd&&onEnd()}},1000);GR.stop=()=>{clearInterval(id);const b=$('#grTime');if(b)b.innerHTML=''};return()=>left},
  stopT(){if(!live())return;GR.stop&&GR.stop();GR.stop=null},end(msg){if(!live())return;A.stopT();gameEnd(msg)},wrong(b,msg){if(!live())return;sfx('no');if(b){b.classList.remove('no');void b.offsetWidth;b.classList.add('no')}toast(msg||'محاولة جميلة! جرّبوا مرة أخرى')}};
 GR.A=A;icons();ENG[g.type]($('#grMain'),items,g,A)}
function closeGame(silent){if(GR.stop)GR.stop();const el=$('#gr');if(el)el.remove();if(!PL)document.body.style.overflow='';GR.on=false;if(!silent)MOT.flush()}
function gameEnd(msg){const g=GR.g,m=GR.max||GR.items.length,r=m?GR.score/m:1,st=r>=.85?3:r>=.5?2:1,D=DESIGNS[GR.d];sfx('end');confetti(200);
 $('#grMain').innerHTML=`<div class="gend">${TROPHY}<h2>${esc(msg||'أحسنتم!')}</h2><div class="gstars">${[1,2,3].map(i=>`<span class="${i<=st?'on':''}">${STK.star}</span>`).join('')}</div><p class="gsc">جمعتم ${ar(GR.score)} ${D.reward}</p><p class="hint">كل محاولة تجعلنا أذكى، حتى الإجابات الخاطئة!</p><div class="acts"><button class="btn pri" data-replay>${ic('rotate-ccw')}العبوا مرة أخرى</button><button class="btn sec" data-toteam>${ic('users-round')}أضيفي النقاط لفريق «${esc((MOT.teams()[MOT.active]||{}).n||'')}»</button><button class="btn ter" data-gx>إنهاء</button></div></div>`;icons();
 const mn=$('#grMain');mn.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-replay'))runGame(g);else if(b.hasAttribute('data-toteam')){MOT.awardTeam(MOT.active,Math.max(1,GR.score),'لعبة: '+g.title);b.disabled=true;b.textContent='أُضيفت النقاط';sfx('star')}}}
/* shared question card: mcq with callback */
function qCard(r,n,{big,onRight,onWrong,speakBtn=true}={}){const opts=mcqOpts(r,n);
 return {html:`<div class="gq"><div class="gqh">${gPic(r[1])}<h3>${esc(r[0])}</h3>${speakBtn?`<button class="spk" data-say="${esc(r[0])}" aria-label="استمعوا">${ICO_SPK}</button>`:''}</div><div class="gopts">${opts.map((o,i)=>`<button class="gopt" data-ok="${o.ok?1:0}"><span class="ol">${'أبجد'[i]}</span>${esc(o.x)}</button>`).join('')}</div></div>`,
  bind(root){if(!root)return;root.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.say)return speak(b.dataset.say);if(!b.classList.contains('gopt')||b.disabled)return;
   if(b.dataset.ok==='1'){$$('.gopt',root).forEach(x=>x.disabled=true);b.classList.add('won');onRight&&onRight(b)}else{onWrong?onWrong(b):GR.A.wrong(b)}}}}}
const revealRight=root=>{$$('.gopt',root).forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('won')})};
const nextBtn=(lbl='السؤال التالي')=>`<button class="btn pri gnext" data-next>${lbl} ${ic('arrow-left')}</button>`;

/* ---------- engines ---------- */
const ENG={
 wheel(M,items,g,A){let left=items.map((r,i)=>({r,i}));A.max(items.length);
  const draw=()=>{M.innerHTML=`<div class="gw">${wheelBox(false)}<div class="gwq" id="gwq"><p class="hint">لفّي العجلة لاختيار سؤال أو تحدٍ</p><p class="gcnt">باقي ${ar(left.length)} من ${ar(items.length)}</p></div></div>`;icons();
   mountWheel($('.wheel',M),{items:()=>left.map(x=>'تحدي '+ar(x.i+1)),onPick:k=>show(k)})};
  const show=k=>{const it=left[k],q=$('#gwq',M);q.innerHTML=`<div class="gq"><h3>${esc(it.r[0])}</h3>${it.r[1]?`<p class="ans" hidden>${esc(it.r[1])}</p><button class="btn sec" data-rev>أظهري الإجابة</button>`:''}<div class="acts"><button class="btn pri" data-y>${ic('check')}أحسنوا</button><button class="btn sec" data-n>لم ينجحوا</button></div></div>`;icons();
   q.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-rev')){$('.ans',q).hidden=false;b.remove();return}if(b.hasAttribute('data-y'))A.add(1);if(b.hasAttribute('data-y')||b.hasAttribute('data-n')){left.splice(k,1);if(!left.length)return A.end('انتهت العجلة!');draw()}}};
  draw()},
 boxes(M,items,g,A){const sur=[['مفاجأة! نقطتان إضافيتان','+2'],['نجمة ذهبية للفريق','+1'],['تحدي: صفّقوا ٥ مرات!','0']];const cells=shuffle([...items.map(r=>({r})),...sur.slice(0,Math.min(3,Math.ceil(items.length/3))).map(s=>({s}))]);let opened=0;A.max(items.length+3);
  M.innerHTML=`<div class="bxg">${cells.map((c,i)=>`<button class="bxc" data-i="${i}" aria-label="صندوق ${ar(i+1)}"><span class="bxn">${ar(i+1)}</span>${STK.gift}</button>`).join('')}</div><div class="bxq" id="bxq"><p class="hint">اختاروا صندوقًا</p></div>`;
  M.onclick=e=>{const b=e.target.closest('button');if(!b)return;const q=$('#bxq',M);
   if(b.classList.contains('bxc')){if(b.classList.contains('open')||$('#bxq .gq'))return;const c=cells[+b.dataset.i];b.classList.add('open');sfx('pop');opened++;
    if(c.s){b.innerHTML=`<span class="bxs">${STK.star}</span>`;q.innerHTML=`<div class="gq"><h3>${esc(c.s[0])}</h3></div>`;const n=num(c.s[1]);if(n>0)A.add(n);if(opened===cells.length)setTimeout(()=>A.end('فتحتم كل الصناديق!'),900);return}
    b.innerHTML=`<span class="bxs">?</span>`;q.innerHTML=`<div class="gq"><h3>${esc(c.r[0])}</h3>${c.r[1]?`<p class="ans" hidden>${esc(c.r[1])}</p><button class="btn sec" data-rev>أظهري الإجابة</button>`:''}<div class="acts"><button class="btn pri" data-y>${ic('check')}أحسنوا</button><button class="btn sec" data-n>لم ينجحوا</button></div></div>`;icons();return}
   if(b.hasAttribute('data-rev')){$('.ans',q).hidden=false;b.remove();return}
   if(b.hasAttribute('data-y')||b.hasAttribute('data-n')){if(b.hasAttribute('data-y'))A.add(1);q.innerHTML='<p class="hint">اختاروا صندوقًا آخر</p>';if(opened===cells.length)A.end('فتحتم كل الصناديق!')}}},
 star(M,items,g,A){let lv=0,fifty=1,help=1;A.max(items.length);
  const draw=()=>{const r=items[lv],c=qCard(r,4,{onRight:()=>{A.add(1);lv++;setTimeout(()=>lv>=items.length?A.end('ربحتم النجمة الكبرى!'):draw(),1100)},onWrong:b=>{sfx('no');b.classList.add('no');revealRight(M);setTimeout(()=>A.end(`وصلتم إلى المرحلة ${ar(lv)}`),1400)}});
   M.innerHTML=`<div class="sw"><ol class="ladder">${items.map((_,i)=>`<li class="${i<lv?'ok':i===lv?'cur':''}"><span>${ar(i+1)}</span>${i===items.length-1?STK.star:''}</li>`).join('')}</ol><div><div class="life"><button class="btn sec" data-fifty ${fifty?'':'disabled'}>حذف إجابتين</button><button class="btn sec" data-help ${help?'':'disabled'}>مساعدة الصف</button></div><div id="sq">${c.html}</div></div></div>`;
   const sq=$('#sq',M);c.bind(sq);
   M.querySelector('.life').onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-fifty')&&fifty){fifty=0;b.disabled=true;shuffle($$('.gopt[data-ok="0"]',sq)).slice(0,2).forEach(x=>{x.disabled=true;x.style.visibility='hidden'})}
    if(b.hasAttribute('data-help')&&help){help=0;b.disabled=true;$$('.gopt',sq).forEach(x=>{const p=x.dataset.ok==='1'?55+Math.random()*25|0:Math.random()*25|0;x.insertAdjacentHTML('beforeend',`<small class="poll">${ar(p)}٪</small>`)})}}};
  draw()},
 catch(M,items,g,A){let i=0;A.max(items.length);const sec=num(g.time)||20;
  const draw=()=>{const r=items[i],opts=mcqOpts(r);M.innerHTML=`<div class="gq gqh top">${gPic(r[1])}<h3>${esc(r[0])}</h3><button class="spk" data-say="${esc(r[0])}" aria-label="استمعوا">${ICO_SPK}</button></div><div class="pond">${opts.map((o,k)=>`<button class="fish" data-ok="${o.ok?1:0}" style="top:${12+k*28}%;animation-duration:${(7+Math.random()*5).toFixed(1)}s;animation-delay:-${(Math.random()*4).toFixed(1)}s;--fc:${['#fb923c','#f472b6','#facc15','#a78bfa'][k%4]}"><svg viewBox="0 0 120 60" aria-hidden="true"><path d="M8 30 Q40 2 84 30 Q40 58 8 30Z" fill="var(--fc)"/><path d="M82 30 L112 10 L112 50Z" fill="var(--fc)"/><circle cx="26" cy="26" r="4" fill="#0f172a"/></svg><span>${esc(o.x)}</span></button>`).join('')}</div>`;
   A.timer(sec,()=>{$$('.fish',M).forEach(f=>{f.disabled=true;if(f.dataset.ok==='1')f.classList.add('won')});toast('انتهى الوقت');setTimeout(nx,1300)});
   M.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.say)return speak(b.dataset.say);if(!b.classList.contains('fish')||b.disabled)return;if(b.dataset.ok==='1'){A.stopT();$$('.fish',M).forEach(f=>f.disabled=true);b.classList.add('won','caught');A.add(1);setTimeout(nx,1100)}else A.wrong(b)}};
  const nx=()=>{i++;i>=items.length?A.end():draw()};draw()},
 memory(M,items,g,A){const ps=items.slice(0,8);A.max(ps.length);const cards=shuffle(ps.flatMap((p,k)=>[{k,h:`<span class="mw">${esc(p[0])}</span>`},{k,h:`<span class="mp">${picHTML(p[1])}</span>`}]));let open=[],found=0,moves=0,lock=false;
  M.innerHTML=`<p class="hint">طابقوا كل صورة بكلمتها · المحاولات: <b id="mvs">${ar(0)}</b></p><div class="mem" style="--n:${cards.length>12?6:4}">${cards.map((c,i)=>`<button class="mc" data-i="${i}" aria-label="بطاقة"><span class="mci"><span class="mcb">${STK.star}</span><span class="mcf">${c.h}</span></span></button>`).join('')}</div>`;
  M.onclick=e=>{const b=e.target.closest('.mc');if(!b||lock||b.classList.contains('on'))return;b.classList.add('on');sfx('flip');open.push(b);if(open.length<2)return;moves++;$('#mvs').textContent=ar(moves);
   const[a,c]=open;if(cards[a.dataset.i].k===cards[c.dataset.i].k){a.classList.add('done');c.classList.add('done');open=[];found++;A.add(1);if(found===ps.length)setTimeout(()=>A.end(`أنهيتم في ${ar(moves)} محاولة`),700)}else{lock=true;setTimeout(()=>{a.classList.remove('on');c.classList.remove('on');open=[];lock=false},900)}}},
 drag(M,items,g,A){const cats=[...new Set(items.map(r=>String(r[2]||'').trim()).filter(Boolean))].slice(0,3);const its=shuffle(items.filter(r=>cats.includes(String(r[2]).trim())));A.max(its.length);let sel=null,placed=0;
  M.innerHTML=`<p class="hint">اسحبوا كل عنصر إلى مجموعته، أو اضغطوا عليه ثم على المجموعة</p><div class="pool">${its.map((r,i)=>`<button class="dgi" data-i="${i}">${gPic(r[1])}<span>${esc(r[0])}</span></button>`).join('')}</div><div class="bins" style="--n:${cats.length}">${cats.map(c=>`<div class="bin" data-cat="${esc(c)}"><h3>${esc(c)}</h3><div class="binin"></div></div>`).join('')}</div>`;
  const drop=(b,bin)=>{if(!bin)return;const r=its[+b.dataset.i];if(String(r[2]).trim()===bin.dataset.cat){$('.binin',bin).appendChild(b);b.classList.add('ok');b.disabled=true;placed++;A.add(1);if(placed===its.length)setTimeout(()=>A.end('صنّفتم كل العناصر!'),700)}else A.wrong(b,'ليست هذه مجموعتها، جرّبوا مرة أخرى')};
  M.onclick=e=>{const b=e.target.closest('.dgi');if(b&&!b.disabled){if(M._dragged){M._dragged=0;return}$$('.dgi',M).forEach(x=>x.classList.toggle('sel',x===b));sel=b;sfx('tap');return}const bin=e.target.closest('.bin');if(bin&&sel){drop(sel,bin);sel.classList.remove('sel');sel=null}};
  M.onpointerdown=e=>{const b=e.target.closest('.dgi');if(!b||b.disabled)return;const sx=e.clientX,sy=e.clientY;let gh=null;
   const mv=ev=>{if(!gh&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){gh=b.cloneNode(true);gh.className='dgi ghost';document.body.appendChild(gh)}if(gh){gh.style.left=ev.clientX+'px';gh.style.top=ev.clientY+'px';$$('.bin',M).forEach(x=>x.classList.remove('hov'));const t=document.elementFromPoint(ev.clientX,ev.clientY);const bn=t&&t.closest('.bin');if(bn)bn.classList.add('hov')}};
   const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(gh){gh.remove();M._dragged=1;$$('.bin',M).forEach(x=>x.classList.remove('hov'));const t=document.elementFromPoint(ev.clientX,ev.clientY);drop(b,t&&t.closest('.bin'))}};
   addEventListener('pointermove',mv);addEventListener('pointerup',up)}},
 maze(M,items,g,A){let pos=0;const n=items.length;A.max(n);
  const draw=()=>{const cols=Math.min(5,n+1),st=Array.from({length:n+1},(_,i)=>{const row=Math.floor(i/cols),c=i%cols,cc=row%2?cols-1-c:c;return{i,x:(cc+.5)/cols*100,y:row}}),rows=Math.ceil((n+1)/cols);
   const r=items[Math.min(pos,n-1)],q=qCard(r,3,{onRight:()=>{A.add(1);pos++;setTimeout(()=>pos>=n?A.end('وصلتم إلى الهدف!'):draw(),900)}});
   M.innerHTML=`<div class="mz"><div class="mzb" style="--rows:${rows}"><svg class="mzl" viewBox="0 0 100 ${rows*20}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${st.map(s=>`${s.x},${s.y*20+10}`).join(' ')}" fill="none" stroke="var(--wc3)" stroke-width="3" stroke-dasharray="2 2"/></svg>${st.map(s=>`<span class="mzs ${s.i<pos?'ok':''} ${s.i===n?'goal':''}" style="left:${s.x}%;top:${(s.y+.5)/rows*100}%">${s.i===n?STK.trophy:ar(s.i+1)}</span>`).join('')}<span class="mzt" style="left:${st[pos].x}%;top:${(st[pos].y+.5)/rows*100}%">${mascot(DESIGNS[g.d]?DESIGNS[g.d].m:'adv')}</span></div><div id="mq">${q.html}</div></div>`;q.bind($('#mq',M))};
  draw()},
 speed(M,items,g,A){let i=0,streak=0;const sec=num(g.time)||12;A.max(items.length*2);
  const draw=()=>{const r=items[i],q=qCard(r,3,{onRight:()=>{const left=get();A.stopT();streak++;A.add(left>sec/2?2:1);if(streak>=3)toast(`سلسلة رائعة: ${ar(streak)} إجابات متتالية!`);setTimeout(nx,900)},onWrong:b=>{streak=0;A.wrong(b)}});
   M.innerHTML=`<div id="sp">${q.html}</div><p class="hint">إجابة سريعة قبل منتصف الوقت = نقطتان</p>`;q.bind($('#sp',M));const get=A.timer(sec,()=>{revealRight(M);streak=0;toast('انتهى الوقت');setTimeout(nx,1300)})};
  const nx=()=>{i++;i>=items.length?A.end():draw()};draw()},
 balloons(M,items,g,A){let i=0;const sec=num(g.time)||20;A.max(items.length);
  const draw=()=>{const r=items[i],opts=mcqOpts(r);M.innerHTML=`<div class="gq gqh top">${gPic(r[1])}<h3>${esc(r[0])}</h3><button class="spk" data-say="${esc(r[0])}" aria-label="استمعوا">${ICO_SPK}</button></div><div class="sky">${opts.map((o,k)=>`<button class="bal" data-ok="${o.ok?1:0}" style="left:${10+k*(80/opts.length)}%;animation-duration:${(6+Math.random()*3).toFixed(1)}s;animation-delay:-${(Math.random()*3).toFixed(1)}s;--bc:${['#ef4444','#3b82f6','#22c55e','#a855f7'][k%4]}"><span class="bb"><span>${esc(o.x)}</span></span><i></i></button>`).join('')}</div>`;
   A.timer(sec,()=>{$$('.bal',M).forEach(b=>{b.disabled=true;if(b.dataset.ok==='1')b.classList.add('won')});toast('انتهى الوقت');setTimeout(nx,1300)});
   M.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.say)return speak(b.dataset.say);if(!b.classList.contains('bal')||b.disabled)return;sfx('pop');if(b.dataset.ok==='1'){A.stopT();$$('.bal',M).forEach(x=>x.disabled=true);b.classList.add('popped');A.add(1);setTimeout(nx,1000)}else{b.classList.add('popped');b.disabled=true;A.wrong(null)}}};
  const nx=()=>{i++;i>=items.length?A.end():draw()};draw()},
 treasure(M,items,g,A){let i=0;const n=items.length;A.max(n);
  const draw=()=>{const r=items[i],q=qCard(r,3,{onRight:()=>{A.add(1);i++;const t=$$('.tt',M)[i-1];if(t)t.classList.add('gone');setTimeout(()=>i>=n?fin():draw(),1000)}});
   M.innerHTML=`<div class="tr"><div class="tmap">${treasureMap()}<div class="tgrid" style="--n:${Math.ceil(Math.sqrt(n))}">${items.map((_,k)=>`<span class="tt ${k<i?'gone':''}">${ar(k+1)}</span>`).join('')}</div></div><div id="tq"><p class="hint">كل إجابة صحيحة تكشف جزءًا من الخريطة</p>${q.html}</div></div>`;q.bind($('#tq',M))};
  const fin=()=>{$('#tq',M).innerHTML=`<div class="chest">${gameArt('treasure')}<h3>وجدتم الكنز!</h3></div>`;setTimeout(()=>A.end('وجدتم الكنز المفقود!'),1600)};draw()},
 whoami(M,items,g,A){let i=0;A.max(items.length*3);
  const draw=()=>{const r=items[i];let shown=1;const opts=shuffle([{x:r[3],ok:1},{x:r[5]},{x:r[6]}].filter(o=>String(o.x||'').trim()));
   const paint=()=>{M.innerHTML=`<div class="who"><div class="wmask">${shown>3?gPic(r[4]):'<span class="qm">؟</span>'}</div><ol class="clues">${[0,1,2].map(k=>`<li class="${k<shown?'on':''}">${k<shown?esc(r[k]):'تلميح مخفي'}</li>`).join('')}</ol><div class="acts">${shown<3?`<button class="btn sec" data-more>${ic('lightbulb')}تلميح جديد</button>`:''}<span class="hint">النقاط الآن: ${ar(4-Math.min(shown,3))}</span></div><div class="gopts">${opts.map((o,k)=>`<button class="gopt" data-ok="${o.ok?1:0}"><span class="ol">${'أبج'[k]}</span>${esc(o.x)}</button>`).join('')}</div></div>`;icons()};paint();
   M.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-next')){i++;return i>=items.length?A.end():draw()}if(b.hasAttribute('data-more')){shown++;sfx('flip');paint();return}if(!b.classList.contains('gopt')||b.disabled)return;
    if(b.dataset.ok==='1'){A.add(4-Math.min(shown,3));shown=4;paint();$$('.gopt',M).forEach(x=>{x.disabled=true;if(x.dataset.ok==='1')x.classList.add('won')});M.insertAdjacentHTML('beforeend',nextBtn(i<items.length-1?'اللغز التالي':'النتيجة'));icons()}else A.wrong(b)}};
  draw()},
 tf(M,items,g,A){let i=0,streak=0;const sec=num(g.time)||8;A.max(items.length);
  const draw=()=>{const r=items[i],no=r[2]==='خطأ';M.innerHTML=`<div class="tfw"><div class="gq">${gPic(r[1])}<h3>${esc(r[0])}</h3></div><div class="tfb"><button class="tfx t-ok" data-ok="${no?0:1}">${ICO.ok}صح</button><button class="tfx t-no" data-ok="${no?1:0}">${ICO.no}خطأ</button></div><p class="hint">سلسلة الإجابات: ${ar(streak)} 🔥</p></div>`;
   A.timer(sec,()=>{streak=0;toast(`الإجابة: ${no?'خطأ':'صح'}`);setTimeout(nx,1200)});
   M.onclick=e=>{const b=e.target.closest('.tfx');if(!b||b.disabled)return;A.stopT();$$('.tfx',M).forEach(x=>x.disabled=true);if(b.dataset.ok==='1'){b.classList.add('won');streak++;A.add(1)}else{b.classList.add('no');streak=0;sfx('no');toast(`الإجابة الصحيحة: ${no?'خطأ':'صح'}`)}setTimeout(nx,1000)}};
  const nx=()=>{i++;i>=items.length?A.end():draw()};draw()},
 order(M,items,g,A){let i=0;A.max(items.length);
  const draw=()=>{const r=items[i],seq=String(r[1]||'').split(/\s*[-،,]\s*/).map(s=>s.trim()).filter(Boolean);let mix=shuffle(seq),k=0;while(seq.length>1&&mix.join('|')===seq.join('|')&&k++<10)mix=shuffle(seq);
   M.innerHTML=`<div class="ordw2"><h3 class="oq">${esc(r[0])}</h3><ol class="oslots">${seq.map((_,j)=>`<li><b>${ar(j+1)}</b><span></span></li>`).join('')}</ol><div class="otiles">${mix.map(x=>`<button class="otile" data-v="${esc(x)}">${esc(x)}</button>`).join('')}</div><button class="btn ter" data-reset>${ic('rotate-ccw')}ابدؤوا من جديد</button></div>`;icons();let got=[];
   M.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-next')){i++;return i>=items.length?A.end():draw()}if(b.hasAttribute('data-reset')){got=[];$$('.oslots span',M).forEach(s=>s.textContent='');$$('.otile',M).forEach(t=>t.disabled=false);return}
    if(!b.classList.contains('otile')||b.disabled)return;b.disabled=true;got.push(b.dataset.v);$$('.oslots span',M)[got.length-1].textContent=b.dataset.v;sfx('tap');
    if(got.length===seq.length){if(got.join('|')===seq.join('|')){A.add(1);M.querySelector('.oslots').classList.add('won');M.insertAdjacentHTML('beforeend',nextBtn(i<items.length-1?'الجولة التالية':'النتيجة'));icons()}else{A.wrong(null,'الترتيب غير صحيح، جرّبوا مرة أخرى');setTimeout(()=>{got=[];$$('.oslots span',M).forEach(s=>s.textContent='');$$('.otile',M).forEach(t=>t.disabled=false)},800)}}}};
  draw()},
 teams(M,items,g,A){const ts=MOT.teams(),T=[ts[0]?ts[0].n:'الفريق الأول',ts[1]?ts[1].n:'الفريق الثاني'];let i=0,turn=0,rope=0;const goal=Math.max(2,Math.ceil(items.length/3)),sec=num(g.time)||25;A.max(items.length);
  const draw=()=>{const r=items[i],q=qCard(r,3,{onRight:()=>{A.stopT();rope+=turn?-1:1;A.add(1);setTimeout(step,900)},onWrong:b=>{A.stopT();sfx('no');b.classList.add('no');revealRight(M);setTimeout(step,1300)}});
   M.innerHTML=`<div class="tug"><div class="tugT"><span class="${turn===0?'on':''}">${esc(T[0])}</span><span class="${turn===1?'on':''}">${esc(T[1])}</span></div><div class="rope"><i style="left:${50-rope/goal*42}%"></i><b class="fl"></b><b class="fr"></b></div><p class="hint">الدور الآن: <b>${esc(T[turn])}</b></p><div id="tq2">${q.html}</div></div>`;q.bind($('#tq2',M));A.timer(sec,()=>{revealRight(M);toast('انتهى الوقت');setTimeout(step,1300)})};
  const step=()=>{i++;turn=1-turn;if(Math.abs(rope)>=goal||i>=items.length){const w=rope===0?null:rope>0?T[0]:T[1];return A.end(w?`فاز ${w}!`:'تعادل رائع!')}draw()};draw()},
 bank(M,items,g,A){const lv=['سهل','متوسط','صعب'],pts={سهل:1,متوسط:2,صعب:3};const used=new Set();A.max(items.reduce((s,r)=>s+(pts[r[5]]||1),0));
  const board=()=>{M.innerHTML=`<div class="bank">${lv.map(L=>`<div class="bcol"><h3>${L} · ${ar(pts[L])} ${pts[L]>1?'نقاط':'نقطة'}</h3>${items.map((r,k)=>({r,k})).filter(x=>(x.r[5]||'سهل')===L).map(x=>`<button class="bq lv${pts[L]}" data-k="${x.k}" ${used.has(x.k)?'disabled':''}>${used.has(x.k)?ICO.ok:ar(pts[L])}</button>`).join('')}</div>`).join('')}</div><p class="hint">الدور: فريق «${esc((MOT.teams()[MOT.active]||{}).n||'')}»</p>`;
   M.onclick=e=>{const b=e.target.closest('.bq');if(!b||b.disabled)return;const k=+b.dataset.k,r=items[k];used.add(k);const q=qCard(r,3,{onRight:()=>{A.add(pts[r[5]]||1);MOT.awardTeam(MOT.active,pts[r[5]]||1,'بنك الأسئلة');setTimeout(back,900)},onWrong:bb=>{sfx('no');bb.classList.add('no');revealRight(M);setTimeout(back,1300)}});M.innerHTML=q.html;q.bind(M)}};
  const back=()=>{MOT.active=(MOT.active+1)%MOT.teams().length;used.size>=items.length?A.end('انتهى بنك الأسئلة!'):board()};board()},
 puzzle(M,items,g,A){const n=[4,9,16].includes(num(g.pieces))?num(g.pieces):9,k=Math.sqrt(n);let i=0;A.max(items.length);
  const draw=()=>{const r=items[i],pic=picHTML(r[1]);let order=shuffle([...Array(n).keys()]),t=0;while(order.every((v,j)=>v===j)&&t++<10)order=shuffle(order);let placed=0,sel=null;
   const piece=p=>{const x=p%k,y=Math.floor(p/k);return `<span class="pzc" style="--k:${k};--x:${x};--y:${y}"><span class="pzi">${pic}</span></span>`};
   M.innerHTML=`<div class="pz"><div class="pzb" style="--k:${k}">${[...Array(n).keys()].map(p=>`<div class="pzs" data-p="${p}"><span class="pzg">${piece(p)}</span></div>`).join('')}</div><div class="pzside"><p class="hint">اسحبوا كل قطعة إلى مكانها، أو اضغطوا عليها ثم على مكانها · الصورة ${ar(i+1)} من ${ar(items.length)}</p><div class="pzt">${order.map(p=>`<button class="pzp" data-p="${p}" aria-label="قطعة">${piece(p)}</button>`).join('')}</div><button class="btn ter" data-peek>${ic('eye')}نظرة على الصورة</button></div></div>`;icons();
   const put=(b,slot)=>{if(!slot||slot.classList.contains('ok'))return;if(slot.dataset.p===b.dataset.p){slot.classList.add('ok');b.remove();sfx('pop');placed++;if(placed===n){A.add(1);done()}}else A.wrong(b,'ليس هذا مكانها، جرّبوا مكانًا آخر')};
   const done=()=>{const s=$('.pzside',M);s.innerHTML=`<div class="pzdone"><h3>${esc(r[0])}</h3><button class="spk" data-say="${esc(r[0])}" aria-label="استمعوا">${ICO_SPK}</button></div>${nextBtn(i<items.length-1?'الصورة التالية':'النتيجة')}`;icons();$('.pzb',M).classList.add('won');speak(r[0])};
   M.onclick=e=>{const b=e.target.closest('button,.pzs');if(!b)return;if(b.dataset.say)return speak(b.dataset.say);if(b.hasAttribute('data-next')){i++;return i>=items.length?A.end('ركّبتم كل الصور!'):draw()}
    if(b.hasAttribute('data-peek')){const bd=$('.pzb',M);bd.classList.add('peek');b.disabled=true;setTimeout(()=>{bd.classList.remove('peek');b.disabled=false},1800);return}
    if(b.classList.contains('pzp')){if(M._dragged){M._dragged=0;return}sel=b;$$('.pzp',M).forEach(x=>x.classList.toggle('sel',x===b));sfx('tap');return}
    if(b.classList.contains('pzs')&&sel){put(sel,b);sel=null;$$('.pzp',M).forEach(x=>x.classList.remove('sel'))}};
   M.onpointerdown=e=>{const b=e.target.closest('.pzp');if(!b)return;const sx=e.clientX,sy=e.clientY;let gh=null;
    const mv=ev=>{if(!gh&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){gh=b.cloneNode(true);gh.classList.add('pzghost');gh.style.width=b.offsetWidth+'px';gh.style.height=b.offsetHeight+'px';document.body.appendChild(gh)}if(gh){gh.style.left=ev.clientX+'px';gh.style.top=ev.clientY+'px';$$('.pzs',M).forEach(x=>x.classList.remove('hov'));const t=document.elementFromPoint(ev.clientX,ev.clientY),sl=t&&t.closest('.pzs');if(sl)sl.classList.add('hov')}};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);if(gh){gh.remove();M._dragged=1;$$('.pzs',M).forEach(x=>x.classList.remove('hov'));const t=document.elementFromPoint(ev.clientX,ev.clientY);put(b,t&&t.closest('.pzs'))}};
    addEventListener('pointermove',mv);addEventListener('pointerup',up)}};
  draw()},
 hunt(M,items,g,A){const C=5,R=4,N=C*R,chest=Math.floor(Math.random()*N);let qi=0,found=false,coins=0;const dug=new Set();
  const coinSet=new Set(shuffle([...Array(N).keys()].filter(x=>x!==chest)).slice(0,6));A.max(items.length+3);
  const dir=c=>{const cx=chest%C,cy=Math.floor(chest/C),x=c%C,y=Math.floor(c/C),dx=cx-x,dy=cy-y;const a=Math.atan2(dy,-dx)*180/Math.PI,d=Math.max(Math.abs(dx),Math.abs(dy));return{a,near:d<=1}};
  const tile=c=>{if(!dug.has(c))return `<button class="htl" data-c="${c}" aria-label="مربع ${ar(c+1)}"><span>${ar(c+1)}</span></button>`;
   if(c===chest)return `<div class="htl dug chest1">${gameArt('treasure')}</div>`;if(coinSet.has(c))return `<div class="htl dug"><span class="hcoin">${STK.star}</span></div>`;
   const d=dir(c);return `<div class="htl dug"><span class="harr ${d.near?'near':''}" style="--a:${d.a}deg" title="${d.near?'الكنز قريب جدًا!':'الكنز في هذا الاتجاه'}">➜</span></div>`};
  const board=(msg)=>{M.innerHTML=`<div class="hunt"><div class="hisl"><div class="hgrid" style="--c:${C}">${[...Array(N).keys()].map(tile).join('')}</div></div><div class="hside" id="hside"><p class="hint">${msg||'اختاروا مربعًا لتحفروا فيه. أجيبوا صحيحًا ليُحفر!'}</p><p class="gcnt">الأسئلة الباقية: ${ar(items.length-qi)} · النجوم: ${ar(coins)}</p><p class="hint">الأسهم تشير إلى اتجاه الكنز 🧭</p></div></div>`;
   M.onclick=e=>{const b=e.target.closest('.htl');if(!b||!b.dataset.c||$('#hside .gq',M))return;$$('.htl',M).forEach(x=>x.classList.toggle('sel',x===b));sfx('tap');ask(+b.dataset.c)}};
  const ask=c=>{const r=items[qi],q=qCard(r,3,{onRight:()=>{qi++;dig(c)},onWrong:b=>{sfx('no');b.classList.add('no');revealRight($('#hside',M));qi++;setTimeout(()=>qi>=items.length?over():board('إجابة غير صحيحة، لم نحفر هذه المرة. اختاروا مربعًا آخر'),1400)}});
   $('#hside',M).innerHTML=`<p class="hint">مربع ${ar(c+1)}: أجيبوا لتحفروا</p>${q.html}`;q.bind($('#hside',M))};
  const dig=c=>{dug.add(c);sfx('pop');
   if(c===chest){found=true;A.add(3);board();$('#hside',M).innerHTML=`<div class="chest">${gameArt('treasure')}<h3>وجدتم الكنز!</h3></div>`;return setTimeout(()=>A.end('وجدتم الكنز المدفون!'),1700)}
   if(coinSet.has(c)){coins++;A.add(1);setTimeout(()=>qi>=items.length?over():board('وجدتم نجمة! واصلوا البحث عن الكنز'),700);return}
   const d=dir(c);setTimeout(()=>qi>=items.length?over():board(d.near?'الكنز قريب جدًا! احفروا بجانب هذا المربع':'لا كنز هنا، لكن السهم يدلّكم على الاتجاه'),700)};
  const over=()=>{dug.add(chest);board('انتهت الأسئلة! هذا مكان الكنز');setTimeout(()=>A.end(found?'وجدتم الكنز!':'كان الكنز قريبًا! حاولوا مرة أخرى'),1800)};
  board()},
 match(M,items,g,A){const ps=items.slice(0,8);A.max(ps.length);const cards=shuffle(ps.flatMap((p,k)=>[{k,h:`<span class="mw">${p[1]?`<span class="mp sm">${picHTML(p[1])}</span>`:''}${esc(p[0])}</span>`},{k,h:`<span class="mw ma">${esc(p[2])}</span>`}]));let open=[],found=0,moves=0,lock=false,peek=1;
  M.innerHTML=`<p class="hint">اقلبوا بطاقتين وطابقوا كل سؤال بجوابه · المحاولات: <b id="mvs">${ar(0)}</b></p><div class="mem" style="--n:${cards.length>12?6:4}">${cards.map((c,i)=>`<button class="mc" data-i="${i}" aria-label="بطاقة"><span class="mci"><span class="mcb">${STK.star}</span><span class="mcf">${c.h}</span></span></button>`).join('')}</div><button class="btn ter" data-peek>${ic('eye')}نظرة سريعة على البطاقات</button>`;icons();
  M.onclick=e=>{const pk=e.target.closest('[data-peek]');if(pk){if(!peek||lock)return;peek=0;pk.disabled=true;lock=true;$$('.mc:not(.done)',M).forEach(x=>x.classList.add('on'));setTimeout(()=>{$$('.mc:not(.done)',M).forEach(x=>x.classList.remove('on'));lock=false;open=[]},2500);return}
   const b=e.target.closest('.mc');if(!b||lock||b.classList.contains('on'))return;b.classList.add('on');sfx('flip');open.push(b);if(open.length<2)return;moves++;$('#mvs').textContent=ar(moves);
   const[a,c]=open;if(cards[a.dataset.i].k===cards[c.dataset.i].k){a.classList.add('done');c.classList.add('done');open=[];found++;A.add(1);if(found===ps.length)setTimeout(()=>A.end(`طابقتم كل البطاقات في ${ar(moves)} محاولة`),700)}else{lock=true;setTimeout(()=>{a.classList.remove('on');c.classList.remove('on');open=[];lock=false},1000)}}}
};
function treasureMap(){return `<svg viewBox="0 0 200 140" class="tsvg" aria-hidden="true"><rect width="200" height="140" fill="#38bdf8"/><path d="M20 70 Q30 20 90 24 Q160 14 176 60 Q190 110 120 120 Q40 132 20 70Z" fill="#fde68a"/><path d="M40 74 Q50 44 90 46 Q140 40 150 70 Q156 98 110 104 Q60 108 40 74Z" fill="#86efac"/><path d="M50 90 Q80 60 110 80 T150 60" stroke="#92400e" stroke-width="2.4" stroke-dasharray="5 4" fill="none"/><path d="M144 52 L156 64 M156 52 L144 64" stroke="#dc2626" stroke-width="4" stroke-linecap="round"/><circle cx="70" cy="60" r="6" fill="#16a34a"/><circle cx="100" cy="96" r="5" fill="#16a34a"/></svg>`}
