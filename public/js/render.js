'use strict';
/* render.js: slide model, widgets, composer, player, gallery, forms */
const GRADS=['linear-gradient(135deg,#fde68a,#f9a8d4)','linear-gradient(135deg,#a5f3fc,#c4b5fd)','linear-gradient(135deg,#bbf7d0,#fde68a)','linear-gradient(160deg,#1e1b4b,#7c3aed)','linear-gradient(135deg,#fecaca,#fef3c7)','linear-gradient(180deg,#e0f2fe,#ffffff)','#fff7ed','#fdf4ff','#ffffff','#14532d'];
const PALETTE=['#1f2937','#ffffff','#0284c7','#db2777','#7c3aed','#ea580c','#16a34a','#ca8a04','#dc2626','#0891b2'];
const isSrc=v=>!!safeSrc(v);
const picHTML=v=>{const s=safeSrc(v);return s?`<img src="${s}" alt="">`:`<span class="emo">${esc(v||'⭐')}</span>`};
const EL=(t,o)=>({id:uid(),t,...o});
const rowsOK=(a,k=0)=>(a||[]).filter(r=>Array.isArray(r)&&String(r[k]||'').trim());

/* ---------- elements ---------- */
function elInner(e,d,ctx){const D=DESIGNS[d]||DESIGNS.adv;
 switch(e.t){
  case 'text':{const al=e.al==='left'?'left':e.al==='center'?'center':'right';return `<div class="tx tx-${esc(e.s||'body')}" style="font-size:${num(e.fs)||5}cqmin;text-align:${al};${hex(e.c)?`color:${e.c};`:''}${e.b?'font-weight:800;':''}">${esc(e.txt)}</div>`}
  case 'pic':return `<div class="pf pf-${esc(e.fr||'none')}">${picHTML(e.src||e.emo)}</div>`;
  case 'stk':return STK[e.k]||STK.star;
  case 'masc':return mascot(e.k||D.m)+(e.say?`<span class="bub">${esc(e.say)}</span>`:'');
  case 'w':return widget(e,d,ctx);
 }return ''}
function elHTML(e,d,ctx,i){const play=ctx.mode==='play';
 const st=`left:${num(e.x)}%;top:${num(e.y)}%;width:${num(e.w)||20}%;${e.h?`height:${num(e.h)}%;`:''}${e.r?`rotate:${num(e.r)}deg;`:''}z-index:${(e.z|0)+2};${play&&e.anim&&e.anim!=='none'?`animation-delay:${(i*.1).toFixed(2)}s;`:''}`;
 return `<div class="el el-${e.t} ${e.t==='box'?'bx-'+esc(e.s||'card'):''} ${play&&e.anim&&e.anim!=='none'?'an-'+esc(e.anim):''} ${ctx.sel===e.id?'sel':''}" data-id="${esc(e.id)}" style="${st}">${elInner(e,d,ctx)}${ctx.mode==='edit'&&ctx.sel===e.id?'<span class="rh" data-rh aria-hidden="true"></span>':''}</div>`}
function slideHTML(s,ctx={}){ctx={mode:'view',...ctx};s=s||{els:[]};const d=DESIGNS[s.d]?s.d:'adv',D=DESIGNS[d];
 const g=s.bg!=null&&GRADS[s.bg]!=null?`<div class="bgc" style="background:${GRADS[s.bg]}"></div>`:scene(d);
 const dust=ctx.d3?`<div class="dust" aria-hidden="true">${Array.from({length:9},(_,k)=>`<i style="left:${(k*37+11)%92+4}%;top:${(k*53+7)%80+6}%;--z:${4+(k*7)%22}cqmin;animation-delay:-${k*.7}s"></i>`).join('')}</div>`:'';
 return `<div class="sl d-${d} ${ctx.mode==='play'&&s.tr&&!ctx.d3?'tr-'+esc(s.tr):''} ${ctx.cls||''}" style="--wc:${D.c};--wc2:${D.c2};--wc3:${D.c3}">${g}${dust}${(s.els||[]).map((e,i)=>elHTML(e,d,ctx,i)).join('')}</div>`}
const noBtn=h=>h.replace(/<button\b/g,'<span').replace(/<\/button>/g,'</span>');
const thumb=s=>`<div class="stage pv">${noBtn(slideHTML(s))}</div>`;

/* ---------- widgets ---------- */
const ICO={ok:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',no:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3.2" fill="none" stroke-linecap="round"/></svg>'};
function widget(e,d,ctx){const w=e.data||{},done=!!(ctx.done&&ctx.done.has(e.id)),play=ctx.mode==='play',L='أبجد';const wid=esc(e.id);
 switch(e.kind){
  case 'mcq':{const opts=(w.opts||[]).map((o,i)=>`<button class="opt ${w.tf?'tf '+(o.x==='صح'?'t-ok':'t-no'):''} ${done&&o.ok?'won':''}" data-wid="${wid}" data-ok="${o.ok?1:0}" ${done?'disabled':''} aria-label="${esc(o.x)}">${w.tf?ICO[o.x==='صح'?'ok':'no']:`<span class="ol">${L[i]||''}</span>`}${o.p?`<span class="op">${picHTML(o.p)}</span>`:''}${w.big?'':`<span>${esc(o.x)}</span>`}</button>`).join('');
   const cnt=w.n?`<div class="tray">${Array.from({length:Math.min(12,w.n|0)},()=>`<span>${picHTML(w.pic)}</span>`).join('')}</div>`:'';
   return `<div class="wg wg-mcq"><div class="qrow">${w.pic&&!w.n?`<div class="mpic">${picHTML(w.pic)}</div>`:''}<h3 class="kq">${esc(w.q)}</h3>${play?`<button class="spk" data-speak="${esc(w.q)}" aria-label="استمعوا للسؤال">${ICO_SPK}</button>`:''}</div>${cnt}<div class="opts ${w.big?'big':''}">${opts}</div></div>`}
  case 'order':{const word=String(w.word||'').replace(/\s/g,''),Ls=Array.from(word),mix=w.mix&&w.mix.length===Ls.length?w.mix:Ls;
   return `<div class="wg ord ${done?'won':''}" data-wid="${wid}" data-w="${esc(word)}">${w.pic?`<div class="mpic">${picHTML(w.pic)}</div>`:''}<div class="slots">${Ls.map(c=>`<span class="slot ${done?'f':''}">${done?esc(c):''}</span>`).join('')}</div><div class="tiles">${mix.map(c=>`<button class="tile ${done?'u':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div><p class="ordw">${done?esc(word):''}</p></div>`}
  case 'flip':return `<div class="wg"><button class="flip" aria-label="اقلبوا البطاقة"><div class="fi"><div class="ff"><div class="spot"><span>${picHTML(w.pic)}</span></div><p class="wword">${esc(w.word)}</p></div><div class="fb"><p class="kb">${esc(w.info)}</p><p class="hint">${esc(w.word)}</p></div></div></button><p class="hint">اضغطوا على البطاقة لقلبها</p></div>`;
  case 'list':return `<ul class="wg wl">${(w.items||[]).map(t=>`<li><span class="li-ic">${STK[w.ico||'star']||STK.star}</span><span>${esc(t)}</span></li>`).join('')}</ul>`;
  case 'goals':return `<ul class="wg gl">${(w.items||[]).map(t=>`<li><button class="gchk" aria-label="تحقق الهدف">${ICO.ok}</button><span>${esc(t)}</span></li>`).join('')}</ul>`;
  case 'tasks':return `<ul class="wg gl tk">${(w.items||[]).map(t=>`<li><button class="gchk" aria-label="أنجزت المهمة">${ICO.ok}</button><span>${esc(t)}</span></li>`).join('')}</ul>`;
  case 'steps':return `<ol class="wg stp">${(w.items||[]).map((t,i)=>`<li><b>${ar(i+1)}</b><span>${esc(t)}</span></li>`).join('')}</ol>`;
  case 'cards':return `<div class="wg exg">${(w.items||[]).map(t=>`<div class="exc"><div class="exp">${picHTML(t.pic)}</div><span>${esc(t.txt)}</span></div>`).join('')}</div>`;
  case 'sort':{const cats=w.cats||[],its=(w.items||[]);return `<div class="wg sortw" data-n="${its.length}"><div class="sbins">${cats.map((c,k)=>`<div class="sbin sb${k}" data-bin="${k}" role="button" tabindex="0" aria-label="ضعوا هنا: ${esc(c)}"><b>${esc(c)}</b><div class="sbz"></div></div>`).join('')}</div><div class="stray">${its.map((x,k)=>`<button class="sitem" data-sc="${x.c}" data-k="${k}">${x.pic?`<span class="sp">${picHTML(x.pic)}</span>`:''}<span>${esc(x.t)}</span></button>`).join('')}</div></div>`}
  case 'levels':return `<div class="wg lvw">${(w.items||[]).map(t=>{const k=LVK(t.lv);return `<div class="lvc lv-${k}"><div class="lvh"><span class="lvi">${STK[LVL[k].s]}</span><b>${esc(LVL[k].n)}</b><small>${esc(LVL[k].d)}</small></div><p>${esc(t.t)}</p></div>`}).join('')}</div>`;
  case 'compare':return `<div class="wg cmpw"><div class="cmph"><span class="cx">${ICO.no} خطأ شائع</span><span class="cv">${ICO.ok} الصواب</span></div>${(w.items||[]).map(r=>`<div class="cmpr"><p class="cx">${esc(r[0])}</p><p class="cv">${esc(r[1])}</p></div>`).join('')}</div>`;
  case 'timer':{const sec=Math.max(30,Math.min(1200,(num(w.min)||3)*60));return `<div class="wg tmw"><div class="tml"><span class="kick">استراتيجية</span><h3 class="kq">${esc(w.strategy||'نشاط تعاوني')}</h3><ol class="stp">${(w.steps||[]).map((t,i)=>`<li><b>${ar(i+1)}</b><span>${esc(t)}</span></li>`).join('')}</ol></div><div class="tmr" data-sec="${sec}"><div class="tmc" style="--p:1"><b class="tmv">${ar(Math.floor(sec/60))}:${ar('00')}</b></div>${play?`<div class="acts"><button class="btn pri sm" data-timer="go">ابدؤوا</button><button class="btn sec sm" data-timer="reset">من جديد</button></div>`:''}</div></div>`}
  case 'scale':return `<div class="wg scale">${w.p?`<div class="exitp"><span class="kick">بطاقة الخروج</span><h3 class="kq">${esc(w.p)}</h3></div>`:''}<h3 class="kq ${w.p?'sm':''}">${esc(w.q||'كيف كان فهمك للدرس؟')}</h3><div class="faces">${[['#22c55e','فهمت جيدًا'],['#facc15','فهمت أغلبه'],['#ef4444','أحتاج مساعدة']].map(([f,l])=>`<button class="face" data-face="${esc(l)}"><span><svg viewBox="0 0 40 40" width="1em" height="1em" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="${f}" stroke="#1f2937" stroke-width="3"/><circle cx="14" cy="13" r="5" fill="#fff" opacity=".55"/></svg></span><small>${l}</small></button>`).join('')}</div></div>`;
  case 'game':{const g=findGame(w.ref);return `<div class="wg gm"><div class="gmi">${g?gameArt(g.type):STK.gift}</div><div><span class="kick">لعبة الدرس</span><h3 class="kq">${esc(g?g.title:'لعبة')}</h3><p class="hint">${esc(g?GTYPES[g.type].name:'')}</p>${play?`<button class="btn pri gmb" data-game="${esc(w.ref)}">ابدؤوا اللعبة</button>`:''}</div></div>`}
  case 'podium':{const r=((typeof MOT!=="undefined"?MOT.teams():[])).slice().sort((a,b)=>b.s-a.s).slice(0,3);return `<div class="wg endv"><h2 class="kt">أحسنتم يا أبطال!</h2><div class="podium">${[1,0,2].map(k=>r[k]?`<div class="pod p${k+1}">${k===0?TROPHY:''}<span class="pn">${esc(r[k].n)}</span><span class="ps">${(DESIGNS[d]||DESIGNS.adv).reward} ${ar(r[k].s)}</span><div class="pb">${ar(k+1)}</div></div>`:'').join('')}</div>${play?`<button class="btn pri" data-a="cert">شهادة للفريق الفائز</button>`:''}</div>`}
 }return ''}
const ICO_SPK='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

/* ---------- composer: layouts ---------- */
const CARD=o=>EL('box',{x:19,y:12,w:77,h:78,s:'card',...o});
const PEEK=(d,say)=>EL('masc',{k:DESIGNS[d].m,x:1,y:50,w:16,say,anim:'fly'});
const TAG=t=>EL('text',{txt:t,s:'tag',x:45.5,y:7.4,w:24,fs:3.6,al:'center',z:3});
const W=(kind,data,o)=>EL('w',{kind,data,x:22,y:17,w:71,h:70,anim:'pop',...o});
const T=(txt,o)=>EL('text',{txt,...o});
const SL=(d,els,tr='fade')=>({id:uid(),d,tr,els});
const L={
 cover(d,c,v){const D=DESIGNS[d],kick=c.sub||D.name;
  if(v===2)return SL(d,[EL('box',{x:12,y:10,w:76,h:34,s:'ribbon'}),T(c.title||'',{s:'title',x:14,y:16,w:72,fs:10,al:'center',anim:'pop'}),T(kick,{s:'kick',x:35,y:47,w:30,fs:3.6,al:'center'}),EL('masc',{k:D.m,x:41.5,y:55,w:17,anim:'bounce'}),EL('stk',{k:'star',x:20,y:62,w:9,r:-12,anim:'pop'}),EL('stk',{k:'balloon',x:70,y:56,w:9,r:10,anim:'pop'})],'zoom');
  if(v===3)return SL(d,[EL('box',{x:6,y:10,w:88,h:80,s:'cover'}),EL('pic',{emo:c.pic||'📚',fr:'spot',x:10,y:20,w:32,anim:'pop'}),T(kick,{s:'kick',x:48,y:22,w:42,fs:3.6}),T(c.title||'',{s:'title',x:46,y:32,w:46,fs:10}),T('هيا نتعلّم معًا',{s:'body',x:46,y:66,w:46,fs:4.6,c:'#475569'}),EL('stk',{k:'star',x:84,y:6,w:9,r:12})],'slide');
  return SL(d,[EL('box',{x:8,y:14,w:84,h:72,s:'cover'}),EL('masc',{k:D.m,x:11,y:18,w:22,anim:'bounce'}),T(kick,{s:'kick',x:38,y:24,w:52,fs:3.6}),T(c.title||'',{s:'title',x:36,y:33,w:54,fs:10.5,anim:'pop'}),T('هيا نتعلّم معًا',{s:'body',x:36,y:62,w:54,fs:4.6,c:'#475569'})],'zoom')},
 hook(d,c,v){const els=[CARD(),TAG('تهيئة'),PEEK(d,'فكّروا معي!')];
  if(c.reveal)els.push(T(c.hook,{s:'title',x:22,y:19,w:71,fs:6.4,al:'center'}),W('flip',{word:'المفاجأة',pic:c.hookPic||'🎁',info:c.reveal},{x:36,y:36,w:43,h:50}));
  else els.push(EL('pic',{emo:c.hookPic||'💡',fr:'spot',x:23,y:22,w:28,anim:'pop'}),T('هل تعلم؟',{s:'kick',x:56,y:26,w:36,fs:3.6}),T(c.hook,{s:'title',x:54,y:36,w:38,fs:6.4}));
  return SL(d,els,'slide')},
 goals(d,items,v,title='أهداف الدرس'){items=items.slice(0,4);
  if(v===2){const n=items.length||1,wd=74/n;return SL(d,[TAG(title),...items.flatMap((t,i)=>[EL('box',{x:21+i*wd,y:20,w:wd-2,h:62,s:'mini'}),EL('stk',{k:['star','bulb','rocket','heart'][i%4],x:21+i*wd+wd/2-6,y:24,w:10,anim:'pop'}),T(t,{s:'body',x:22+i*wd,y:46,w:wd-4,fs:4,al:'center'})]),PEEK(d,'سنتعلّم اليوم')],'slide')}
  if(v===3)return SL(d,[CARD(),TAG('سأتعلّم اليوم'),W('steps',{items}),PEEK(d,'هيا بنا!')],'slide');
  return SL(d,[CARD(),TAG(title),W('goals',{items}),PEEK(d,'سنتعلّم اليوم')],'slide')},
 concept(d,p,v){const [title,text,pic]=p;
  if(v===2)return SL(d,[CARD(),TAG('مفهوم'),T(title,{s:'title',x:22,y:18,w:71,fs:7,al:'center'}),EL('pic',{emo:pic||'💡',fr:'circle',x:47.5,y:32,w:20,anim:'pop'}),T(text,{s:'body',x:24,y:70,w:67,fs:4.4,al:'center'}),PEEK(d,'انتبهوا!')],'fade');
  if(v===3)return SL(d,[EL('box',{x:21,y:14,w:46,h:72,s:'note',r:-2}),T(title,{s:'title',x:24,y:22,w:40,fs:6.4}),T(text,{s:'body',x:24,y:40,w:40,fs:4.3}),EL('pic',{emo:pic||'💡',fr:'spot',x:70,y:26,w:24,anim:'pop'}),EL('stk',{k:'bulb',x:61,y:8,w:8,r:10}),PEEK(d,'معلومة جديدة')],'slide');
  return SL(d,[CARD(),TAG('مفهوم'),EL('pic',{emo:pic||'💡',fr:'spot',x:23,y:22,w:28,anim:'pop'}),T(title,{s:'title',x:54,y:23,w:39,fs:7}),T(text,{s:'body',x:54,y:40,w:39,fs:4.4}),PEEK(d,'ردّدوا معي')],'fade')},
 cards(d,items,title){return SL(d,[CARD(),TAG(title),W('cards',{items:items.slice(0,4)},{y:20,h:64}),PEEK(d,'لاحظوا الأمثلة')],'slide')},
 list(d,title,items,ico='star',say='تذكّروا'){return SL(d,[CARD(),TAG(title),W('list',{items:items.slice(0,6),ico}),PEEK(d,say)],'fade')},
 steps(d,title,items){return SL(d,[CARD(),TAG(title),W('steps',{items:items.slice(0,6)}),PEEK(d,'خطوة خطوة')],'slide')},
 tasks(d,items,note){const els=[CARD(),TAG('واجبي'),W('tasks',{items:items.slice(0,5)},{h:note?52:70}),PEEK(d,'أنتم قادرون!')];if(note)els.push(EL('box',{x:24,y:72,w:67,h:13,s:'mini'}),T('لولي الأمر: '+note,{s:'body',x:26,y:74.5,w:63,fs:3.4}));return SL(d,els,'slide')},
 mcq(d,q,tag='سؤال',say='فكّروا جيدًا!'){const [qq,pic,a,o1,o2]=q,k=LVK(q[5]);const els=[CARD(),TAG(tag)];if(k)els.push(EL('stk',{k:LVL[k].s,x:84,y:13,w:7,anim:'pop'}));return SL(d,[...els,W('mcq',{q:qq,pic,opts:shuffle([{x:a,ok:1},{x:o1},{x:o2}].filter(o=>String(o.x||'').trim()))}),PEEK(d,say)],'slide')},
 sort(d,rows){const cats=[...new Set(rows.map(r=>String(r[2]||'').trim()).filter(Boolean))].slice(0,3);const items=shuffle(rows.filter(r=>cats.includes(String(r[2]).trim())).slice(0,8).map(r=>({t:r[0],pic:r[1],c:cats.indexOf(String(r[2]).trim())})));return SL(d,[CARD(),TAG('صنّفوا البطاقات'),W('sort',{cats,items}),PEEK(d,'اسحبوا وصنّفوا!')],'slide')},
 levels(d,title,items,say='اختاروا تحدّيكم'){return SL(d,[CARD(),TAG(title),W('levels',{items}),PEEK(d,say)],'slide')},
 mistakes(d,items){return SL(d,[CARD(),TAG('انتبهوا! أخطاء شائعة'),W('compare',{items:items.slice(0,3)}),PEEK(d,'لا نقع فيها!')],'slide')},
 model(d,items){return SL(d,[CARD(),TAG('نمذجة: مثال محلول'),W('steps',{items:items.slice(0,6)}),PEEK(d,'شاهدوا معي')],'slide')},
 activity(d,strategy,steps,min){return SL(d,[CARD(),TAG('نشاط تعاوني'),W('timer',{strategy,steps:steps.slice(0,4),min}),PEEK(d,'نعمل معًا')],'zoom')},
 exit(d,p){return SL(d,[CARD(),TAG('تقويم ختامي'),W('scale',{p,q:'كيف كان فهمك للدرس اليوم؟'}),PEEK(d,'قبل أن نخرج')],'fade')},
 phase(d,n,title,sub){return SL(d,[EL('box',{x:14,y:24,w:72,h:52,s:'cover'}),T(ar(n),{s:'kick',x:20,y:32,w:60,fs:5,al:'center'}),T(title,{s:'title',x:20,y:40,w:60,fs:9,al:'center',anim:'pop'}),T(sub,{s:'body',x:20,y:60,w:60,fs:4,al:'center',c:'#475569'})],'zoom')},
 mcqPic(d,q,L){return SL(d,[CARD(),TAG('سؤال'),W('mcq',q),PEEK(d,'أيّها الصحيح؟')],'slide')},
 tf(d,t){const [q,pic,ans]=t,no=ans==='خطأ';return SL(d,[CARD(),TAG('صح أم خطأ؟'),W('mcq',{q,pic,tf:1,opts:[{x:'صح',ok:!no},{x:'خطأ',ok:no}]}),PEEK(d,'صح أم خطأ؟')],'slide')},
 order(d,o){const word=String(o[0]||'').replace(/\s/g,''),Ls=Array.from(word);let m=shuffle(Ls),k=0;while(Ls.length>1&&m.join('')===word&&k++<10)m=shuffle(Ls);return SL(d,[CARD(),TAG('رتّب الحروف'),W('order',{word,pic:o[1],mix:m}),PEEK(d,'رتّبوها!')],'slide')},
 count(d,c){const n=Math.min(10,Math.max(1,num(c[1])|0||1));const near=shuffle([n-1,n+1,n+2,n-2].filter(x=>x>=1&&x<=10)).slice(0,2);return SL(d,[CARD(),TAG('عُدّ معي'),W('mcq',{q:'كم عددها؟',pic:c[0],n,opts:shuffle([{x:ar(n),ok:1},...near.map(x=>({x:ar(x)}))])}),PEEK(d,'عُدّوا معي')],'slide')},
 flip(d,f){return SL(d,[CARD(),TAG('بطاقة'),W('flip',{word:f[0],pic:f[1],info:f[2]},{x:30,w:55}),PEEK(d,'اقلبوا البطاقة')],'flip')},
 story(d,p,i,n){return SL(d,[EL('box',{x:6,y:8,w:88,h:84,s:'page'}),EL('pic',{emo:p[1]||'📖',fr:'frame',x:10,y:16,w:36,anim:'pop'}),T(p[0],{s:'story',x:50,y:20,w:40,fs:5}),T(`${ar(i+1)} / ${ar(n)}`,{s:'label',x:50,y:80,w:40,fs:3,al:'left'})],'flip')},
 scale(d){return SL(d,[CARD(),TAG('قيّم نفسك'),W('scale',{q:'كيف كان فهمك للدرس اليوم؟'}),PEEK(d,'كونوا صادقين')],'fade')},
 game(d,ref){return SL(d,[CARD(),TAG('وقت اللعب'),W('game',{ref},{x:24,y:20,w:68,h:64}),PEEK(d,'هيا نلعب!')],'zoom')},
 reward(d){return SL(d,[CARD({y:8,h:84}),W('podium',{},{x:22,y:10,w:71,h:80}),PEEK(d,'أحسنتم!')],'zoom')},
 blank(d){return SL(d,[])},
 text(d){return SL(d,[CARD(),T('عنوان الشريحة',{s:'title',x:24,y:18,w:67,fs:7}),T('اكتبي هنا شرحًا قصيرًا وواضحًا.',{s:'body',x:24,y:36,w:67,fs:4.6}),PEEK(d,'')])},
 textPic(d){return L.concept(d,['عنوان المفهوم','اكتبي هنا شرحًا مبسّطًا للمفهوم.','💡'],1)}
};

/* ---------- categories & recipes ---------- */
const CATS=[
 {id:'explain',name:'شرح الدروس',icon:'presentation'},{id:'intro',name:'التهيئة للدرس',icon:'sparkles'},{id:'goals',name:'عرض الأهداف',icon:'target'},
 {id:'concepts',name:'المفاهيم والمعلومات',icon:'lightbulb'},{id:'review',name:'الأسئلة والمراجعة',icon:'circle-help'},{id:'assess',name:'التقويم الختامي',icon:'clipboard-check'},
 {id:'tasks',name:'الواجبات والأنشطة',icon:'notebook-pen'},{id:'story',name:'القصص التعليمية',icon:'book-open'},{id:'lab',name:'التجارب والاكتشاف',icon:'flask-conical'},{id:'exam',name:'المراجعة قبل الاختبار',icon:'graduation-cap'}];
const FIELDS={
 title:{l:'عنوان الدرس',t:'text'},sub:{l:'المادة أو عنوان فرعي',t:'text'},pic:{l:'صورة الغلاف (رمز أو صورة)',t:'pic'},
 hook:{l:'سؤال التهيئة',t:'text'},hookPic:{l:'صورة التهيئة',t:'pic'},reveal:{l:'الإجابة المفاجئة (اختياري)',t:'text'},
 goals:{l:'أهداف الدرس',cols:[{l:'الهدف'}]},points:{l:'نقاط الشرح',cols:[{l:'العنوان'},{l:'الشرح'},{l:'صورة',w:'s',img:1}]},
 examples:{l:'أمثلة توضيحية',k:1,cols:[{l:'صورة',w:'s',img:1},{l:'المثال'}]},cards:{l:'بطاقات تنقلب',cols:[{l:'الكلمة'},{l:'صورة',w:'s',img:1},{l:'معلومة'}]},
 questions:{l:'أسئلة اختيار من متعدد (اختاري المستوى للتقويم المتمايز)',cols:[{l:'السؤال'},{l:'صورة',w:'s',img:1},{l:'الإجابة الصحيحة'},{l:'خيار آخر'},{l:'خيار آخر'},{l:'المستوى',w:'m',opt:['بنائي','أنطلق','أتقدّم','أتميّز']}]},
 sort:{l:'نشاط تصنيف بالسحب (اكتبي اسم المجموعة لكل عنصر)',cols:[{l:'العنصر'},{l:'صورة',w:'s',img:1},{l:'المجموعة'}],k:2},
 pre:{l:'تقويم قبلي: ماذا يعرف الطلاب؟',cols:[{l:'السؤال'},{l:'صورة',w:'s',img:1},{l:'الإجابة الصحيحة'},{l:'خيار آخر'},{l:'خيار آخر'}]},
 model:{l:'نمذجة: مثال محلول خطوة بخطوة',cols:[{l:'الخطوة'}]},mistakes:{l:'أخطاء شائعة وتصحيحها',cols:[{l:'الخطأ الشائع'},{l:'الصواب'}]},
 strategy:{l:'استراتيجية النشاط التعاوني',t:'text'},act:{l:'خطوات النشاط',cols:[{l:'الخطوة'}]},actTime:{l:'وقت النشاط بالدقائق',t:'num',min:1,max:20,def:3},
 diff:{l:'أنشطة متمايزة حسب المستوى',cols:[{l:'المستوى',w:'m',opt:['أنطلق','أتقدّم','أتميّز']},{l:'النشاط'}]},
 exit:{l:'بطاقة الخروج',t:'text'},hw:{l:'واجب متمايز',cols:[{l:'المستوى',w:'m',opt:['أنطلق','أتقدّم','أتميّز']},{l:'الواجب'}]},
 tf:{l:'صح أم خطأ',cols:[{l:'العبارة'},{l:'صورة',w:'s',img:1},{l:'الإجابة',w:'m',opt:['صح','خطأ']}]},
 order:{l:'رتّب الحروف',cols:[{l:'الكلمة'},{l:'صورة',w:'s',img:1}]},count:{l:'عدّ وأجب',k:1,cols:[{l:'صورة',w:'s',img:1},{l:'العدد'}]},
 story:{l:'صفحات القصة',cols:[{l:'نص الصفحة'},{l:'صورة',w:'s',img:1}]},moral:{l:'العبرة من القصة',t:'text'},
 tools:{l:'الأدوات',k:1,cols:[{l:'صورة',w:'s',img:1},{l:'الأداة'}]},steps:{l:'الخطوات',cols:[{l:'الخطوة'}]},result:{l:'النتيجة أو الاستنتاج',t:'text'},
 tasks:{l:'المهام',cols:[{l:'المهمة'}]},note:{l:'ملاحظة لولي الأمر',t:'text'},tips:{l:'نصائح المراجعة',cols:[{l:'النصيحة'}]},summary:{l:'ملخص الدرس',cols:[{l:'نقطة'}]},
 game:{l:'لعبة مرتبطة بالدرس',t:'game'}
};
const CAT_FIELDS={explain:['title','sub','hook','hookPic','pre','goals','points','examples','model','mistakes','questions','summary','diff','exit','game'],intro:['title','sub','hook','hookPic','reveal','cards','goals'],goals:['title','sub','goals','steps'],
 concepts:['title','sub','points','cards','summary'],review:['title','sub','questions','tf','order','game'],assess:['title','sub','questions','tf','order','count','exit'],tasks:['title','sub','tasks','hw','steps','note'],
 story:['title','sub','pic','story','questions','moral'],lab:['title','sub','hook','hookPic','tools','steps','tf','result'],exam:['title','sub','summary','questions','tf','tips','game'],
 lesson:['title','sub','hook','hookPic','pre','goals','points','examples','model','mistakes','strategy','act','actTime','cards','order','count','sort','questions','tf','summary','diff','exit','hw','game']};
const LVL={a:{n:'أنطلق',d:'دعم',s:'heart'},b:{n:'أتقدّم',d:'أساسي',s:'star'},c:{n:'أتميّز',d:'إثراء',s:'rocket'}};
const LVK=v=>v==='أنطلق'?'a':v==='أتقدّم'?'b':v==='أتميّز'?'c':'';
const NT=(s,n)=>{s.n=n;return s};
/* full lesson following the lesson-plan stages, with teacher notes on every slide */
function fullLesson(d,c,v,P,R,goals,ex,vv,full){const Q=R('questions'),form=Q.filter(q=>!LVK(q[5])),lvQ=Q.filter(q=>LVK(q[5])).sort((a,b)=>LVK(a[5]).localeCompare(LVK(b[5]))),pts=R('points'),diff=R('diff',1),hw=R('hw',1),sum=R('summary');let n=0;
 if(c.hook)P(NT(L.hook(d,c,1),'التهيئة (دقيقتان): اطرحي السؤال، واستمعي لإجابات ثلاثة طلاب دون تصحيح، ثم اربطي إجاباتهم بموضوع الدرس.'));
 R('pre').forEach(q=>P(NT(L.mcq(d,q,'تقويم قبلي: ماذا أعرف؟','ماذا تعرفون؟'),'التقويم القبلي: لا تُحتسب الإجابة. لاحظي من يعرف المفهوم ومن يحتاج دعمًا لتوزّعي الأنشطة المتمايزة لاحقًا.')));
 if(goals.length)P(NT(L.goals(d,goals,v),'اقرئي الأهداف بصوت واضح، واطلبي من الطلاب ترديدها. سنعود إليها في الغلق لنتحقق منها.'));
 const fq=form.slice();pts.forEach((p,i)=>{P(NT(L.concept(d,p,vv(i)),'العرض: اشرحي المفهوم بمثال من حياة الطلاب، واطلبي من طالب أن يعيده بأسلوبه.'));const q=fq.shift();if(q)P(NT(L.mcq(d,q,'تحقّق من فهمك','من يعرف الجواب؟'),'تقويم بنائي: استخدمي الرؤوس المرقّمة أو بطاقات الإجابة ليجيب الجميع، وأعيدي الشرح إن أخطأ أكثر من ثلث الصف.'))});
 if(ex.length)P(NT(L.cards(d,ex,'أمثلة'),'اعرضي الأمثلة واطلبي من الطلاب مثالًا إضافيًا من عندهم.'));
 const md=R('model');if(md.length)P(NT(L.model(d,md.map(r=>r[0])),'النمذجة (أنا أعمل ← نعمل معًا ← أنت تعمل): نفّذي الخطوات أمامهم بصوت مسموع، ثم كرّريها معهم، ثم اطلبي من طالب تنفيذها وحده.'));
 const ms=R('mistakes');if(ms.length)P(NT(L.mistakes(d,ms),'اسألي: لماذا نقع في هذا الخطأ؟ ثم اطلبي تصحيحه من طالب.'));
 R('cards').forEach(f=>P(NT(L.flip(d,f),'اطلبي التوقع قبل قلب البطاقة.')));
 const ac=R('act');if(full&&(c.strategy||ac.length))P(NT(L.activity(d,c.strategy,ac.map(r=>r[0]),num(c.actTime)||3),'النشاط التعاوني: وزّعي الأدوار، وشغّلي المؤقت، وتجوّلي بين المجموعات لتقديم التغذية الراجعة.'));
 {const so=R('sort');if(so.length>=2)P(NT(L.sort(d,so),'تدريب تفاعلي: يأتي طالب ويسحب بطاقة إلى مجموعتها، ويسأل الصف: هل توافقون؟ زر «إظهار الإجابة» يرتّب الكل.'))}
 R('order').forEach(o=>P(NT(L.order(d,o),'تدريب موجّه: يأتي طالب إلى السبورة ويرتّب، والبقية يتحققون.')));R('count').forEach(x=>P(NT(L.count(d,x),'تدريب موجّه: العدّ بصوت مسموع جماعيًا.')));
 fq.forEach(q=>P(NT(L.mcq(d,q,'تحقّق من فهمك'),'تقويم بنائي.')));
 if(sum.length)P(NT(L.list(d,'تذكّروا',sum.map(r=>r[0]),'check'),'الغلق: اطلبي من الطلاب إكمال الجمل قبل عرضها، ثم ارجعي إلى الأهداف.'));
 if(diff.length)P(NT(L.levels(d,'أنشطة متمايزة',diff.map(r=>({lv:r[0],t:r[1]}))),'التعليم المتمايز: وجّهي كل طالب للمستوى المناسب حسب التقويم القبلي والبنائي، واسمحي بالانتقال للمستوى الأعلى عند الإنجاز. أنطلق = دعم، أتقدّم = المستوى الأساسي، أتميّز = إثراء.'));
 lvQ.forEach(q=>P(NT(L.mcq(d,q,'تقويم متمايز · '+q[5],{أنطلق:'سؤال الانطلاق',أتقدّم:'سؤال التقدّم',أتميّز:'تحدّي التميّز'}[q[5]]),`تقويم ختامي متمايز (${q[5]} · ${LVL[LVK(q[5])].d}): وجّهي السؤال لطلاب هذا المستوى أولًا، ثم افتحيه للجميع.`)));
 R('tf').forEach(t=>P(NT(L.tf(d,t),'تقويم ختامي: اطلبي الإجابة بالإبهام للأعلى أو للأسفل ليشارك الجميع.')));
 if(c.exit)P(NT(L.exit(d,c.exit),'بطاقة الخروج: يجيب كل طالب ويختار وجهًا يعبّر عن فهمه. راجعي البطاقات لتخطيط الحصة القادمة.'));else if(full)P(L.scale(d));
 if(hw.length)P(NT(L.levels(d,'واجب متمايز',hw.map(r=>({lv:r[0],t:r[1]})),'اختاروا واجبكم'),'الواجب المتمايز: كل طالب يختار مستوى واجبه أو تحدّدينه له، والتميّز اختياري للجميع.'))}
function compose(cat,c,d,v=1){d=DESIGNS[d]?d:'adv';const out=[],P=s=>out.push(s),R=(k,i=0)=>rowsOK(c[k],FIELDS[k]&&FIELDS[k].k!=null?FIELDS[k].k:i);
 const goals=R('goals').map(r=>r[0]),ex=R('examples').map(r=>({pic:r[0],txt:r[1]})),vv=n=>((v+n-1)%3)+1;
 P(L.cover(d,c,v));
 switch(cat){
  case 'explain':fullLesson(d,c,v,P,R,goals,ex,vv,false);break;
  case 'intro':if(c.hook)P(L.hook(d,c,v));R('cards').forEach(f=>P(L.flip(d,f)));if(goals.length)P(L.goals(d,goals,vv(1),'ماذا سنتعلّم؟'));break;
  case 'goals':if(goals.length)P(L.goals(d,goals,v));if(goals.length)P(L.goals(d,goals,vv(1)));if(R('steps').length)P(L.steps(d,'خطة الدرس',R('steps').map(r=>r[0])));break;
  case 'concepts':R('points').forEach((p,i)=>P(L.concept(d,p,vv(i))));R('cards').forEach(f=>P(L.flip(d,f)));if(R('summary').length)P(L.list(d,'الخلاصة',R('summary').map(r=>r[0]),'bulb'));break;
  case 'review':R('questions').forEach(q=>P(L.mcq(d,q)));R('tf').forEach(t=>P(L.tf(d,t)));R('order').forEach(o=>P(L.order(d,o)));break;
  case 'assess':{const Q=R('questions'),qb=Q.filter(q=>!LVK(q[5])),lv=Q.filter(q=>LVK(q[5])).sort((a,b)=>LVK(a[5]).localeCompare(LVK(b[5])));qb.forEach(q=>P(L.mcq(d,q)));lv.forEach(q=>P(L.mcq(d,q,'تقويم متمايز · '+q[5])));R('tf').forEach(t=>P(L.tf(d,t)));R('order').forEach(o=>P(L.order(d,o)));R('count').forEach(n=>P(L.count(d,n)));P(c.exit?L.exit(d,c.exit):L.scale(d));break}
  case 'tasks':if(R('tasks').length)P(L.tasks(d,R('tasks').map(r=>r[0]),c.note));if(R('hw',1).length)P(L.levels(d,'واجب متمايز',R('hw',1).map(r=>({lv:r[0],t:r[1]})),'اختاروا واجبكم'));if(R('steps').length)P(L.steps(d,'طريقة التنفيذ',R('steps').map(r=>r[0])));break;
  case 'story':{const pg=R('story');pg.forEach((p,i)=>P(L.story(d,p,i,pg.length)));R('questions').forEach(q=>P(L.mcq(d,q)));if(c.moral)P(L.concept(d,['العبرة',c.moral,'💡'],2));break}
  case 'lab':if(c.hook)P(L.hook(d,c,1));{const tl=R('tools').map(r=>({pic:r[0],txt:r[1]}));if(tl.length)P(L.cards(d,tl,'الأدوات'))}if(R('steps').length)P(L.steps(d,'خطوات التجربة',R('steps').map(r=>r[0])));R('tf').forEach(t=>P(L.tf(d,t)));if(c.result)P(L.concept(d,['ماذا اكتشفنا؟',c.result,'🔬'],v));break;
  case 'exam':if(R('summary').length)P(L.list(d,'ملخص المراجعة',R('summary').map(r=>r[0]),'check'));R('questions').forEach(q=>P(L.mcq(d,q)));R('tf').forEach(t=>P(L.tf(d,t)));if(R('tips').length)P(L.list(d,'نصائح للاختبار',R('tips').map(r=>r[0]),'bulb','بالتوفيق!'));break;
  case 'lesson':fullLesson(d,c,v,P,R,goals,ex,vv,true);break;
 }
 if(c.game&&(cat==='lesson'||CAT_FIELDS[cat].includes('game')))P(L.game(d,c.game));
 P(L.reward(d));return out}

/* ---------- player ---------- */
let PL=null;
function openPlayer(slides,title,o={}){if(!slides||!slides.length)return toast('لا توجد شرائح للعرض');PL={slides,title,i:Math.max(0,Math.min(o.start|0,slides.length-1)),done:new Set(),d3:store3d()};
 const el=document.createElement('div');el.className='pl';el.id='pl';
 el.innerHTML=`<div class="plTop"><button class="ib" data-a="close" aria-label="إغلاق العرض">${ic('x')}</button><div class="plTitle">${esc(title||'')}</div><span class="plProg" id="plProg" aria-hidden="true"></span><button class="ib d3b" data-a="d3" aria-pressed="${!!PL.d3}" aria-label="العرض ثلاثي الأبعاد">${ic('box')}</button><button class="ib" data-a="reveal" aria-label="إظهار الإجابة" title="إظهار الإجابة">${ic('eye')}</button><button class="ib" data-a="reset" aria-label="إعادة النشاط" title="إعادة النشاط">${ic('rotate-ccw')}</button><button class="ib" data-a="shuf" aria-pressed="false" aria-label="ترتيب الأسئلة عشوائيًا" title="ترتيب الأسئلة عشوائيًا">${ic('shuffle')}</button><button class="ib" data-a="notes" aria-pressed="false" aria-label="ملاحظات المعلمة" title="ملاحظات المعلمة">${ic('notebook-pen')}</button><button class="ib" data-a="kid" aria-label="نجمة لطالب">${ic('star')}</button><button class="ib" data-a="wheel" aria-label="عجلة الأسماء">${ic('disc-3')}</button><button class="ib" data-a="mute" aria-label="الصوت">${ic(SND.muted?'volume-x':'volume-2')}</button></div><div class="plMain" data-tilt><div class="stage ${PL.d3?'d3':''}" id="stage"></div></div><div class="plBot"><button class="btn sec" data-a="prev">${ic('arrow-right')}<span>السابق</span></button><div class="teams" id="teams"></div><button class="btn pri" data-a="next"><span>التالي</span>${ic('arrow-left')}</button></div>`;
 el.insertAdjacentHTML('beforeend','<aside class="plNotes" id="plNotes" hidden><b>ملاحظات المعلمة</b><p id="plNotesT"></p></aside>');document.body.appendChild(el);document.body.style.overflow='hidden';el.addEventListener('click',plClick);
 try{const r=el.requestFullscreen&&el.requestFullscreen();r&&r.catch&&r.catch(()=>{})}catch(e){}
 renderPl();icons();sway()}
function closePl(){const el=$('#pl');if(el)el.remove();document.body.style.overflow='';try{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{})}catch(e){}PL=null;if(typeof MOT!=="undefined")MOT.flush()}
function renderTeams(){const t=$('#teams');if(!t||!PL)return;const R=(DESIGNS[PL.slides[PL.i].d]||DESIGNS.adv).reward,ts=MOT.teams();
 t.innerHTML=ts.map((g,i)=>`<div class="tg"><button class="team ${i===MOT.active?'on':''}" data-a="team" data-g="${i}" aria-pressed="${i===MOT.active}"><span class="dot" style="background:${hex(g.c)||'#ffc800'}"></span>${esc(g.n)} <b>${R} ${ar(g.s)}</b></button><button class="plus" data-a="plus" data-g="${i}" aria-label="أضيفي نقطة لفريق ${esc(g.n)}">+</button></div>`).join('')}
function renderPl(dir){const s=PL.slides[PL.i],pl=$('#pl'),st=$('#stage');st.classList.toggle('d3',!!PL.d3);
 const html=slideHTML(s,{mode:'play',done:PL.done,d3:PL.d3,cls:PL.d3&&dir?(dir>0?'in-n':'in-p'):''});
 if(PL.d3&&dir&&!reduced()){$$('.sl.gone',st).forEach(x=>x.remove());const old=$('.sl',st);if(old){old.classList.add('gone',dir>0?'out-n':'out-p');setTimeout(()=>old.remove(),650)}st.insertAdjacentHTML('beforeend',html)}else st.innerHTML=html;
 $('#plProg').innerHTML=PL.slides.map((_,k)=>`<i class="${k===PL.i?'on':''}"></i>`).join('');
 {const nt=$('#plNotesT');if(nt)nt.textContent=s.n||'لا توجد ملاحظات لهذه الشريحة.'}clearInterval(PL.tm);$('[data-a=prev]',pl).disabled=PL.i===0;$('[data-a=next]',pl).disabled=PL.i===PL.slides.length-1;renderTeams();icons();
 if((s.els||[]).some(e=>e.kind==='podium')&&!PL.done.has('end'+PL.i)){PL.done.add('end'+PL.i);setTimeout(()=>{confetti(220);sfx('end')},300)}}
function popAward(i){const tg=$$('#teams .tg')[i];if(!tg)return;const p=document.createElement('span');p.className='pop';p.textContent='+١ '+(DESIGNS[PL.slides[PL.i].d]||DESIGNS.adv).reward;tg.appendChild(p);setTimeout(()=>p.remove(),1200)}
function plWin(){confetti(130);sfx('win');const i=MOT.active;MOT.awardTeam(i,1,'إجابة صحيحة');MOT.active=(i+1)%MOT.teams().length;renderTeams();popAward(i)}
function plClick(e){const t=e.target.closest('button');if(!t||t.closest('.sl.gone'))return;const a=t.dataset.a;
 if(a==='close')return closePl();
 if(a==='next'){if(PL.i<PL.slides.length-1){PL.i++;renderPl(1)}return}
 if(a==='prev'){if(PL.i>0){PL.i--;renderPl(-1)}return}
 if(a==='d3'){PL.d3=!PL.d3;try{localStorage.setItem('mb3d',PL.d3?'1':'0')}catch(e){}t.setAttribute('aria-pressed',PL.d3);toast(PL.d3?'العرض ثلاثي الأبعاد مفعّل':'العرض المسطّح');renderPl();return}
 if(a==='team'){MOT.active=+t.dataset.g;renderTeams();return}
 if(a==='plus'){MOT.awardTeam(+t.dataset.g,1,'مكافأة من المعلمة');renderTeams();popAward(+t.dataset.g);sfx('star');return}
 if(a==='mute'){SND.muted=!SND.muted;t.innerHTML=ic(SND.muted?'volume-x':'volume-2');icons();return}
 if(a==='wheel')return openDialog(`<h2 class="dh">عجلة الأسماء</h2>${wheelBox()}`,{onMount:d=>mountWheel($('.wheel',d)),focus:false});
 if(a==='kid')return MOT.quickStar();
 if(a==='reset'){renderPl();toast('أُعيد النشاط');return}
 if(a==='reveal')return plReveal();
 if(a==='shuf'){const qi=PL.slides.map((x,k)=>x.els.some(e=>e.kind==='mcq'||e.kind==='tf')?k:-1).filter(k=>k>=0);if(qi.length<2)return toast('لا توجد أسئلة كافية للترتيب العشوائي');PL.orig=PL.orig||PL.slides.slice();const on=t.getAttribute('aria-pressed')!=='true';if(on){const qs=shuffle(qi.map(k=>PL.slides[k]));qi.forEach((k,j)=>PL.slides[k]=qs[j])}else PL.slides=PL.orig.slice();t.setAttribute('aria-pressed',on);toast(on?'رُتّبت الأسئلة عشوائيًا':'عادت الأسئلة لترتيبها');renderPl();return}
 if(a==='notes'){const n=$('#plNotes'),on=n.hidden;n.hidden=!on;t.setAttribute('aria-pressed',on);return}
 if(t.dataset.timer){const box=t.closest('.tmr'),sec=+box.dataset.sec,v=$('.tmv',box),c=$('.tmc',box);const paint=l=>{v.textContent=`${ar(Math.floor(l/60))}:${ar(String(l%60).padStart(2,'0'))}`;c.style.setProperty('--p',l/sec)};clearInterval(PL.tm);
  if(t.dataset.timer==='reset'){box._l=sec;paint(sec);box.classList.remove('end');$('[data-timer=go]',box).textContent='ابدؤوا';return}
  if(box._run){box._run=0;t.textContent='تابعوا';return}let l=box._l??sec;box._run=1;t.textContent='إيقاف مؤقت';PL.tm=setInterval(()=>{if(!box.isConnected||!box._run){clearInterval(PL.tm);return}l--;box._l=l;paint(Math.max(0,l));if(l<=5&&l>0)sfx('tick');if(l<=0){clearInterval(PL.tm);box._run=0;box.classList.add('end');sfx('end');toast('انتهى وقت النشاط');t.textContent='ابدؤوا'}},1000);return}
 if(a==='cert'){const w=MOT.teams().slice().sort((x,y)=>y.s-x.s)[0];return openDialog(`<h2 class="dh">شهادة الفريق الفائز</h2>${certHTML('فريق '+(w?w.n:''),'لتميّزه وحماسه في درس «'+(PL.title||'')+'»',PL.slides[PL.i].d)}`,{wide:1,focus:false})}
 if(t.dataset.speak)return speak(t.dataset.speak);
 if(t.dataset.game)return openGameById(t.dataset.game);
 if(t.dataset.face){sfx('star');toast('شكرًا لصدقكم! كل محاولة تقرّبنا من الفهم');t.parentElement.querySelectorAll('.face').forEach(b=>b.classList.toggle('on',b===t));return}
 if(t.classList.contains('gchk')){t.closest('li').classList.toggle('ok');sfx('tap');return}
 if(t.classList.contains('sitem')){if(t._dragged)return;return sortPick(t)}
 if(t.classList.contains('opt'))return plAnswer(t);
 if(t.classList.contains('tile'))return plTile(t);
 if(t.classList.contains('flip')){t.classList.toggle('on');sfx('flip')}}
function plAnswer(t){if(t.disabled)return;
 if(t.dataset.ok==='1'){$$('.opt',t.closest('.opts')).forEach(b=>b.disabled=true);t.classList.add('won');PL.done.add(t.dataset.wid);plWin()}
 else{t.classList.remove('no');void t.offsetWidth;t.classList.add('no');sfx('no');toast('محاولة جميلة! جرّبوا مرة أخرى')}}
function plTile(t){const box=t.closest('.ord');if(box.classList.contains('won')||t.classList.contains('u'))return;const sl=$$('.slot',box),empty=sl.find(s=>!s.textContent);if(!empty)return;
 empty.textContent=t.dataset.c;empty.classList.add('f');t.classList.add('u');sfx('tap');
 if(sl.every(s=>s.textContent)){if(sl.map(s=>s.textContent).join('')===box.dataset.w){box.classList.add('won');$('.ordw',box).textContent=box.dataset.w;PL.done.add(box.dataset.wid);plWin()}
  else{sfx('no');toast('الترتيب غير صحيح، جرّبوا مرة أخرى');box.classList.add('no');setTimeout(()=>{box.classList.remove('no');sl.forEach(s=>{s.textContent='';s.classList.remove('f')});$$('.tile',box).forEach(x=>x.classList.remove('u'))},700)}}}
function plReveal(){const st=$('#stage');if(!st)return;let done=false;
 const ok=$('.opt[data-ok="1"]',st);if(ok&&!ok.classList.contains('won')){ok.classList.add('won','rev');$$('.opt',st).forEach(b=>b.disabled=true);done=true}
 $$('.sitem',st).forEach(b=>{const bin=$(`.sbin[data-bin="${b.dataset.sc}"] .sbz`,st);if(bin){b.classList.add('in','rev');bin.appendChild(b);done=true}});
 $$('.flip:not(.on)',st).forEach(f=>{f.classList.add('on');done=true});
 if(!done)return toast('لا يوجد نشاط بإجابة في هذه الشريحة');sfx('pop');toast('ظهرت الإجابة')}
function sortPick(b){const w=b.closest('.sortw');if(b.classList.contains('in'))return;$$('.sitem',w).forEach(x=>x.classList.toggle('sel',x===b&&!b.classList.contains('sel')));sfx('tap')}
function sortDrop(w,b,bin){if(!bin||b.classList.contains('in'))return;if(String(bin.dataset.bin)===b.dataset.sc){b.classList.remove('sel');b.classList.add('in');$('.sbz',bin).appendChild(b);sfx('pop');const left=$$('.stray .sitem',w).length;if(!left){w.classList.add('won');sfx('win');confetti(120);toast('أحسنتم! صنّفتم كل البطاقات');PL&&PL.done.add(PL.i)}}else{b.classList.add('no');sfx('no');setTimeout(()=>b.classList.remove('no'),500);toast('قريبة! جرّبوا المجموعة الأخرى')}}
document.addEventListener('click',e=>{const bin=e.target.closest('.sbin');if(!bin||e.target.closest('.sitem'))return;const w=bin.closest('.sortw'),s=$('.sitem.sel',w);if(s)sortDrop(w,s,bin)});
document.addEventListener('keydown',e=>{const bin=e.target.closest&&e.target.closest('.sbin');if(bin&&(e.key==='Enter'||e.key===' ')){e.preventDefault();const w=bin.closest('.sortw'),s=$('.sitem.sel',w);if(s)sortDrop(w,s,bin)}});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('.sitem');if(!b||b.classList.contains('in'))return;const w=b.closest('.sortw');const sx=e.clientX,sy=e.clientY;let gh=null;
 const mv=ev=>{if(!gh&&Math.hypot(ev.clientX-sx,ev.clientY-sy)>8){gh=b.cloneNode(true);gh.classList.add('sghost');const r=b.getBoundingClientRect();gh.style.width=r.width+'px';document.body.appendChild(gh);b.classList.add('drag')}if(gh){gh.style.left=ev.clientX+'px';gh.style.top=ev.clientY+'px';$$('.sbin',w).forEach(x=>x.classList.remove('hov'));const t=document.elementFromPoint(ev.clientX,ev.clientY),bn=t&&t.closest('.sbin');if(bn&&w.contains(bn))bn.classList.add('hov')}};
 const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);b.classList.remove('drag');if(gh){gh.remove();$$('.sbin',w).forEach(x=>x.classList.remove('hov'));const t=document.elementFromPoint(ev.clientX,ev.clientY),bn=t&&t.closest('.sbin');b._dragged=1;setTimeout(()=>b._dragged=0,50);const kill=c=>{c.stopPropagation();c.preventDefault()};addEventListener('click',kill,{capture:true,once:true});setTimeout(()=>removeEventListener('click',kill,{capture:true}),80);if(bn&&w.contains(bn))sortDrop(w,b,bn)}};
 addEventListener('pointermove',mv);addEventListener('pointerup',up)});
document.addEventListener('keydown',e=>{const dl=$$('.dlg');if(e.key==='Escape'&&dl.length){closeDialog(dl[dl.length-1]);return}
 if(dl.length||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable)return;
 if(typeof GR!=="undefined"&&GR.on){if(e.key==='Escape')closeGame();return}
 if(!PL)return;if(e.key==='Escape')closePl();else if(e.key===' '&&!e.target.closest('button')){e.preventDefault();if(PL.i<PL.slides.length-1){PL.i++;renderPl(1)}}else if(e.key==='ArrowLeft'&&PL.i<PL.slides.length-1){PL.i++;renderPl(1)}else if(e.key==='ArrowRight'&&PL.i>0){PL.i--;renderPl(-1)}});

/* ---------- certificate & wheel ---------- */
function certHTML(name,reason,d){d=DESIGNS[d]?d:'gdn';const D=DESIGNS[d];return `<div class="cert" style="--wc:${D.c};--wc2:${D.c2}">${scene(d)}<div class="cin">${seal(D.c)}${mascot(D.m)}<div><div class="ck">شهادة تميّز</div><div class="cname">${esc(name)}</div><p class="creason">${esc(reason)}</p><div class="cfoot"><span>مع تحيات معلمتك ${esc(ME.p&&ME.p.name||'')}</span><span>${esc(fmtDate(today()))}</span></div></div></div></div>`}
const wheelBox=(names)=>`<div class="wheel"><div class="wwrap"><canvas class="wc" width="600" height="600" aria-label="عجلة"></canvas><div class="wptr"></div></div><div class="wres" aria-live="polite"></div><button type="button" class="btn pri" data-spin>${ic('rotate-cw')}لفّي العجلة</button>${names===false?'':`<label class="lab">الأسماء، اسم في كل سطر<textarea class="in wnames" rows="4">${esc((names||MOT.names()).join('\n'))}</textarea></label>`}</div>`;
function mountWheel(root,o={}){const cv=$('.wc',root),ta=$('.wnames',root),res=$('.wres',root);let ang=0,busy=false;
 const names=()=>o.items?o.items():ta.value.split('\n').map(s=>s.trim()).filter(Boolean);
 const cols=['#ffc800','#0284c7','#ea580c','#db2777','#16a34a','#7c3aed'];
 const draw=()=>{const c=cv.getContext('2d'),n=names(),N=Math.max(n.length,1),R=300,seg=2*Math.PI/N;c.clearRect(0,0,600,600);
  for(let i=0;i<N;i++){const a0=ang+i*seg;c.beginPath();c.moveTo(R,R);c.arc(R,R,R-8,a0,a0+seg);c.closePath();c.fillStyle=cols[i%cols.length];c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.stroke();
   c.save();c.translate(R,R);c.rotate(a0+seg/2);c.direction='rtl';c.textAlign='right';c.fillStyle=i%cols.length===0?'#171717':'#fff';c.font=`700 ${N>10?22:30}px "IBM Plex Sans Arabic", sans-serif`;const s=String(n[i]||'أضيفي أسماء');c.fillText(s.length>14?s.slice(0,13)+'…':s,R-34,10);c.restore()}
  c.beginPath();c.arc(R,R,34,0,2*Math.PI);c.fillStyle='#fff';c.fill();c.lineWidth=6;c.strokeStyle='#171717';c.stroke()};
 if(ta)ta.addEventListener('input',()=>{MOT.setNames(names());if(!busy)draw()});
 $('[data-spin]',root).addEventListener('click',()=>{const n=names();if(busy||!n.length)return;busy=true;res.textContent='';const start=ang,delta=Math.PI*2*(5+Math.random()),t0=performance.now(),dur=reduced()?10:3800;sfx('tap');
  const fr=t=>{const p=Math.min(1,(t-t0)/dur);ang=start+delta*(1-Math.pow(1-p,3));draw();if(p<1)requestAnimationFrame(fr);else{busy=false;const seg=2*Math.PI/n.length,a=((-Math.PI/2-ang)%(2*Math.PI)+2*Math.PI)%(2*Math.PI),k=Math.floor(a/seg)%n.length;res.textContent=n[k];confetti(70);sfx('win');o.onPick&&o.onPick(k)}};requestAnimationFrame(fr)});
 draw();setTimeout(draw,600);return{draw}}

/* ---------- gallery & tabs ---------- */
function gallery(id,items,o={}){const th=o.thumbs!==false;
 return `<div class="gal" id="${id}" data-i="0"><div class="gtrack" tabindex="0" role="region" aria-roledescription="معرض" aria-label="${esc(o.label||'معرض')}">${items.map(it=>`<figure class="gitem" data-tilt>${it.slide?`<div class="stage pv d3">${noBtn(slideHTML(it.slide,{d3:1}))}</div>`:it.html}${it.cap?`<figcaption>${it.cap}</figcaption>`:''}</figure>`).join('')}</div>
 <div class="gctl"><button type="button" class="ib" data-gnav="-1" aria-label="السابق">${ic('arrow-right')}</button><span class="gcount">${ar(1)} / ${ar(items.length)}</span><button type="button" class="ib" data-gnav="1" aria-label="التالي">${ic('arrow-left')}</button></div>
 ${th?`<div class="gthumbs">${items.map((it,i)=>`<button type="button" class="gth" data-gto="${i}" aria-current="${i===0}">${it.slide?thumb(it.slide):(it.th||'')}<span>${esc(it.label||'')}</span></button>`).join('')}</div>`:`<div class="gdots">${items.map((it,i)=>`<button type="button" class="gdot" data-gto="${i}" aria-label="${esc(it.label||'')}" aria-current="${i===0}"></button>`).join('')}</div>`}</div>`}
function galIndex(tr){const a=tr.getBoundingClientRect(),cx=a.left+a.width/2;let b=0,bd=1e9;[...tr.children].forEach((c,i)=>{const r=c.getBoundingClientRect(),dd=Math.abs(r.left+r.width/2-cx);if(dd<bd){bd=dd;b=i}});return b}
function syncGal(g,force){const tr=$('.gtrack',g);if(!tr)return;const i=galIndex(tr);if(!force&&String(i)===g.dataset.i)return;g.dataset.i=i;const n=tr.children.length;$('.gcount',g).textContent=`${ar(i+1)} / ${ar(n)}`;
 const nv=$$('[data-gnav]',g);nv[0].disabled=i===0;nv[1].disabled=i===n-1;$$('[data-gto]',g).forEach((b,k)=>b.setAttribute('aria-current',k===i));
 const strip=$('.gthumbs',g),t=strip&&strip.children[i];if(t){const sr=strip.getBoundingClientRect(),r=t.getBoundingClientRect();if(r.left<sr.left)strip.scrollBy({left:r.left-sr.left-12,behavior:'smooth'});else if(r.right>sr.right)strip.scrollBy({left:r.right-sr.right+12,behavior:'smooth'})}
 g.dispatchEvent(new CustomEvent('galchange',{detail:i}))}
function goTo(g,i,smooth=true){const tr=$('.gtrack',g),it=tr.children[Math.max(0,Math.min(i,tr.children.length-1))];if(!it)return;const a=tr.getBoundingClientRect(),b=it.getBoundingClientRect();tr.scrollBy({left:b.left-a.left,behavior:smooth&&!reduced()?'smooth':'auto'});if(!smooth)syncGal(g,true)}
const initGals=r=>$$('.gal',r).forEach(g=>syncGal(g,true));
document.addEventListener('scroll',e=>{const t=e.target;if(t.classList&&t.classList.contains('gtrack')){cancelAnimationFrame(t._r);t._r=requestAnimationFrame(()=>syncGal(t.closest('.gal')))}},true);
document.addEventListener('click',e=>{const b=e.target.closest('[data-gnav],[data-gto]');if(!b)return;const g=b.closest('.gal');if(b.dataset.gto!==undefined)goTo(g,+b.dataset.gto);else goTo(g,+g.dataset.i+ +b.dataset.gnav)});
document.addEventListener('keydown',e=>{const tr=e.target.closest&&e.target.closest('.gtrack');if(!tr)return;const g=tr.closest('.gal');if(e.key==='ArrowLeft'){e.preventDefault();e.stopPropagation();goTo(g,+g.dataset.i+1)}else if(e.key==='ArrowRight'){e.preventDefault();e.stopPropagation();goTo(g,+g.dataset.i-1)}},true);
const tabsHTML=(scope,list,cur)=>`<div class="tabs" role="tablist">${list.map(([k,l,icn,lock])=>`<button type="button" class="tab" role="tab" data-tab="${scope}" data-k="${esc(k)}" aria-selected="${k===cur}">${icn?ic(icn):''}${l}${lock?`<span class="lk">${ic('lock')}</span>`:''}</button>`).join('')}</div>`;
const designBtns=(cur,attr='data-design')=>`<div class="worldpick">${DK.map(k=>`<button type="button" class="wp ${k===cur?'on':''}" ${attr}="${k}" aria-pressed="${k===cur}"><span class="dot" style="background:${DESIGNS[k].c}"></span>${DESIGNS[k].name}</button>`).join('')}</div>`;

/* ---------- form kit: content forms from field lists ---------- */
function formHTML(keys,data){return keys.map(k=>{const f=FIELDS[k]||GFIELDS[k];if(!f)return'';const v=data[k];
 if(f.t==='text')return `<label class="lab">${f.l}<input class="in" data-f="${k}" value="${esc(v||'')}"></label>`;
 if(f.t==='num')return `<label class="lab">${f.l}<input class="in" type="number" min="${f.min||1}" max="${f.max||60}" data-f="${k}" value="${esc(v||f.def||'')}"></label>`;
 if(f.t==='sel')return `<label class="lab">${f.l}<select class="in" data-f="${k}">${f.opt.map(([a,b])=>`<option value="${esc(a)}" ${String(v)===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select></label>`;
 if(f.t==='pic')return `<div class="lab">${f.l}<div class="row">${picCell(v,`data-f="${k}"`)}</div></div>`;
 if(f.t==='game')return `<label class="lab">${f.l}<select class="in" data-f="${k}"><option value="">بدون لعبة</option>${allGames().map(g=>`<option value="${esc(g.id)}" ${v===g.id?'selected':''}>${esc(g.title)} · ${esc(GTYPES[g.type].name)}</option>`).join('')}</select></label>`;
 const rs=Array.isArray(v)?v:[];
 return `<fieldset class="rows"><legend>${f.l}</legend><div class="row hd" aria-hidden="true">${f.cols.map(c=>`<span class="${c.w||''}">${c.l}</span>`).join('')}<span class="sp"></span></div>${rs.map((r,i)=>`<div class="row">${f.cols.map((c,j)=>c.opt?`<select class="in ${c.w||''}" data-f="${k}" data-r="${i}" data-c="${j}" aria-label="${c.l}">${c.opt.map(o=>`<option ${r[j]===o?'selected':''}>${o}</option>`).join('')}</select>`:c.img?picCell(r[j],`data-f="${k}" data-r="${i}" data-c="${j}"`):`<input class="in ${c.w||''}" data-f="${k}" data-r="${i}" data-c="${j}" value="${esc(r[j]||'')}" aria-label="${c.l}">`).join('')}<button type="button" class="ib" data-delrow="${k}" data-r="${i}" aria-label="حذف السطر">${ic('trash-2')}</button></div>`).join('')}<button type="button" class="btn ter" data-addrow="${k}">${ic('plus')}أضيفي سطرًا</button></fieldset>`}).join('')}
function picCell(v,attrs){return isSrc(v)?`<span class="pcell"><img src="${safeSrc(v)}" alt=""><button type="button" class="ib sm" data-clrpic ${attrs} aria-label="إزالة الصورة">${ic('x')}</button></span>`:`<span class="pcell"><input class="in s" ${attrs} value="${esc(v||'')}" aria-label="رمز الصورة"><button type="button" class="ib sm" data-uppic ${attrs} aria-label="رفع صورة">${ic('image-up')}</button></span>`}
/* bind a form container: keeps data in sync, re-renders rows on add/remove */
function bindForm(box,keys,data,onChange){const fire=()=>{clearTimeout(box._t);box._t=setTimeout(()=>onChange&&onChange(),250)};
 const setv=(el,val)=>{const k=el.dataset.f;if(el.dataset.r!==undefined){data[k][+el.dataset.r][+el.dataset.c]=val}else data[k]=val};
 const rer=()=>{box.innerHTML=formHTML(keys,data);icons()};
 box.oninput=e=>{const t=e.target;if(!t.dataset.f)return;setv(t,t.value);fire()};
 box.onchange=e=>{const t=e.target;if(t.tagName==='SELECT'&&t.dataset.f){setv(t,t.value);fire()}};
 box.onclick=async e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.addrow){const f=FIELDS[b.dataset.addrow]||GFIELDS[b.dataset.addrow];(data[b.dataset.addrow]=data[b.dataset.addrow]||[]).push(f.cols.map(c=>c.opt?c.opt[0]:''));rer();fire()}
  else if(b.dataset.delrow){data[b.dataset.delrow].splice(+b.dataset.r,1);rer();fire()}
  else if(b.hasAttribute('data-uppic')){if(!lim('upload'))return needPlan('رفع الصور متاح في الباقة الأساسية فما فوق');const src=await pickImage(480);if(src){setv(b,src);rer();fire()}}
  else if(b.hasAttribute('data-clrpic')){setv(b,'⭐');rer();fire()}};
 rer()}

/* ---------- 3D: tilt that follows the pointer, gentle sway when idle ---------- */
function store3d(){try{return localStorage.getItem('mb3d')!=='0'}catch(e){return true}}
let tiltHost=null,lastMove=0;
function setTilt(st,x,y){if(!st)return;st.style.setProperty('--rx',(-(y-.5)*10).toFixed(2)+'deg');st.style.setProperty('--ry',((x-.5)*14).toFixed(2)+'deg')}
document.addEventListener('pointermove',e=>{if(reduced()||document.querySelector('.sghost'))return;const h=e.target.closest&&e.target.closest('[data-tilt]');if(tiltHost&&h!==tiltHost){const o=$('.stage.d3',tiltHost);if(o){o.style.removeProperty('--rx');o.style.removeProperty('--ry')}}tiltHost=h;if(!h)return;const st=$('.stage.d3',h);if(!st)return;lastMove=Date.now();const r=st.getBoundingClientRect();setTilt(st,Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height)))},{passive:true});
function sway(){if(reduced())return;const f=t=>{if(!PL)return;const st=$('#stage');if(st&&PL.d3&&Date.now()-lastMove>2500)setTilt(st,.5+Math.sin(t/2600)*.22,.5+Math.cos(t/3400)*.16);requestAnimationFrame(f)};requestAnimationFrame(f)}
