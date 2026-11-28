'use strict';
/* journey.js: interactive lesson journeys (landing, station map, stations with steps, certificate) */
const JCOL=['#9b5de5','#38bdf8','#4cc764','#f28b82','#f4c84e','#3b82f6','#f472b6'];
const JR={src:null,st:[],view:'land',si:0,step:0,name:'',prog:null,cur:null,pending:null};
const jSrcLesson=l=>({id:l.id,title:l.c.title,c:l.c,d:l.d,subj:l.subj,unit:l.unit});
function jBuild(src){const c=src.c||{},R=k=>rowsOK(c[k],FIELDS[k]&&FIELDS[k].k!=null?FIELDS[k].k:0);
 const pts=R('points').slice(0,3),ex=R('examples').map(r=>({pic:r[0],txt:r[1]})),cards=R('cards'),goals=R('goals').map(r=>r[0]);
 const quiz=[...R('questions').map(q=>({q:q[0],pic:q[1],opts:mcqOpts(q)})),...R('tf').map(t=>({q:t[0],pic:t[1],tf:1,opts:[{x:'صح',ok:t[2]!=='خطأ'},{x:'خطأ',ok:t[2]==='خطأ'}]}))];
 const st=[{t:'انطلاقة الرحلة',sub:'ماذا سنكتشف اليوم؟',ic:'🚀',steps:[{k:'learn',n:'تعرّف',say:c.hook?`${c.hook}`:`مرحبًا! اليوم نتعلّم ${c.title||''}`,pic:c.hookPic||'🚀',reveal:c.reveal},...(goals.length?[{k:'goals',n:'أهدافي',items:goals}]:[])]}];
 pts.forEach((p,i)=>{const steps=[{k:'learn',n:'تعرّف',say:p[1],pic:p[2]||'💡',head:p[0]}];const n=pts.length;
  const exs=ex.filter((_,k)=>k%n===i);if(exs.length)steps.push({k:'examples',n:'أمثلة',items:exs});
  const cs=cards.filter((_,k)=>k%n===i);if(cs.length)steps.push({k:'discover',n:'اكتشف',items:cs.map(r=>({w:r[0],pic:r[1],info:r[2]}))});
  if(quiz[i])steps.push({k:'quiz',n:'اختبر نفسك',items:[quiz[i]]});
  st.push({t:p[0],sub:String(p[1]||'').split(/[.،:]/)[0],ic:p[2]||'💡',steps})});
 if(!pts.length&&ex.length)st.push({t:'أمثلة من حولنا',sub:'لاحظ وتعلّم',ic:'🔎',steps:[{k:'examples',n:'أمثلة',items:ex}]});
 const ord=R('order'),cnt=R('count');if(ord.length||cnt.length)st.push({t:'العب وتعلّم',sub:'رتّب وعُدّ واربح النجوم',ic:'🧩',steps:[...ord.map(o=>({k:'order',n:'رتّب',word:String(o[0]).replace(/\s/g,''),pic:o[1]})),...cnt.map(x=>({k:'count',n:'عُدّ',pic:x[0],num:Math.min(10,Math.max(1,num(x[1])|0||1))}))]});
 const big=[...quiz.slice(pts.length),...quiz.slice(0,pts.length)].slice(0,6);if(big.length)st.push({t:'التحدي الكبير',sub:'أثبت أنك بطل صغير',ic:'🏆',steps:[{k:'quiz',n:'التحدي',items:big}]});
 st.forEach((s,i)=>s.col=JCOL[i%JCOL.length]);return st}
const jKey=()=>`mbj:${JR.src.id}:${JR.name||'-'}`;
function jLoad(){try{JR.prog=JSON.parse(localStorage.getItem(jKey()))}catch(e){}if(!JR.prog||!JR.prog.stars)JR.prog={stars:{},coins:0,done:[]}}
function jSave(){try{localStorage.setItem(jKey(),JSON.stringify(JR.prog))}catch(e){}}
const jStars=()=>Object.values(JR.prog.stars).reduce((a,b)=>a+b,0);
const jMasc=()=>(DESIGNS[JR.src.d]||DESIGNS.adv).m,jMName=()=>MASCOTS[jMasc()].split('،')[0];
const jOpen=i=>i===0||JR.prog.done.includes(i-1);
function openJourney(src){JR.src=src;JR.st=jBuild(src);JR.view='land';JR.name='';jLoad();if(location.hash==='#journey')route();else location.hash='journey'}
function vJourney(){return `<div class="jr" id="jr"></div>`}
function jMount(){if(JR.pending){const l=allLessons().find(x=>x.id===JR.pending);JR.pending=null;if(l&&lesLocked(l)){$('#jr').innerHTML=`<div class="jwrap"><div class="jcard jempty">${mascot('star')}<h2>رحلة «${esc(l.c.title)}» ضمن الباقة الاحترافية</h2><div class="jacts"><a class="jbtn purple" href="#pricing">اعرضي الباقات</a><a class="jbtn white" href="#lessons">الدروس</a></div></div></div>`;return}if(l){JR.src=jSrcLesson(l);JR.st=jBuild(JR.src);JR.view='land';jLoad()}}
 if(!JR.src){$('#jr').innerHTML=`<div class="jwrap"><div class="jcard jempty">${mascot('adv')}<h2>اختاري درسًا لتبدأ رحلته</h2><a class="jbtn green" href="#lessons">الدروس الجاهزة</a></div></div>`;return}
 const jr=$('#jr');jr.onclick=jClick;jr.oninput=e=>{if(e.target.id==='jName')JR.name=e.target.value.trim().slice(0,30)};jRender()}
function jTop(){const done=JR.prog.done.length,n=JR.st.length;return `<header class="jtop">${brandBar('jB')}<div class="jtb"><button class="jsq y" data-jv="land" aria-label="الصفحة الرئيسية">${ic('house')}</button><button class="jsq p" data-jv="map" aria-label="خريطة الرحلة">${ic('map')}</button></div>
 <div class="jprog"><div class="jpl"><span>تقدّمك في الرحلة</span><b>${ar(done)} / ${ar(n)} محطات</b></div><div class="jbar" role="progressbar" aria-valuenow="${done}" aria-valuemax="${n}" aria-label="شريط التقدم"><i style="width:${Math.max(4,done/n*100)}%"></i></div></div>
 <div class="jtb"><span class="jpill">⭐ <b>${ar(jStars())}</b></span><span class="jpill">🪙 <b>${ar(JR.prog.coins|0)}</b></span><button class="jsq s" data-jmute aria-label="الصوت">${ic(SND.muted?'volume-x':'volume-2')}</button><a class="jsq g" href="#lessons" aria-label="الخروج إلى المنصة">${ic('log-out')}</a></div></header>`}
function jRender(){const jr=$('#jr');if(!jr)return;const v=JR.view;
 if(v==='land')jr.innerHTML=brandBar('jB jBl')+jLand();else if(v==='map')jr.innerHTML=jTop()+jMap();else if(v==='st')jr.innerHTML=jTop()+jStation();else jr.innerHTML=jTop()+jCert();
 icons();window.scrollTo(0,0)}
function jLand(){const s=JR.src,c=s.c||{},pts=rowsOK(c.points).slice(0,3);
 return `<div class="jwrap jland"><button class="jsq s jmute" data-jmute aria-label="الصوت">${ic(SND.muted?'volume-x':'volume-2')}</button><a class="jsq g jexit" href="#lessons" aria-label="الخروج إلى المنصة">${ic('log-out')}</a>
 <div class="jhero"><div class="jhtxt"><span class="jchip">📚 ${esc(s.subj||c.sub||'درس')}${s.unit?' · '+esc(s.unit):''}</span><h1>رحلة في عالم<br><span class="jgrad">${esc(c.title||s.title)}</span></h1><p class="jq">هل أنت مستعد لتصبح بطلًا صغيرًا؟ 🚀</p>
  <label class="jlab" for="jName">ما اسمك أيها البطل الصغير؟ <small>(اختياري)</small></label><input class="jin" id="jName" value="${esc(JR.name)}" placeholder="اكتب اسمك هنا…" maxlength="30">
  <div class="jacts"><button class="jbtn green" data-jstart>${ic('rocket')}ابدأ المغامرة</button><button class="jbtn white" data-jhow>${ic('circle-help')}كيف ألعب؟</button></div></div>
  <div class="jhart"><div class="jbub">مرحبًا! ✨<br>تعال نكتشف ${esc(c.title||'')} معًا!</div>${mascot(jMasc())}</div></div>
 ${pts.length?`<h2 class="jh2">في هذه الرحلة نكتشف…</h2><div class="jprev">${pts.map((p,i)=>`<article class="jcard jpc" style="--c:${JCOL[(i+1)%JCOL.length]}"><div class="jpch"><span class="jtile sm">${picHTML(p[2]||'💡')}</span><h3>${esc(p[0])}</h3></div><div class="jfig">${picHTML(p[2]||'💡')}</div><p>${esc(p[1])}</p></article>`).join('')}</div>`:''}</div>`}
function jMap(){return `<div class="jwrap"><div class="jmh"><div><h1 class="jt">خريطة الرحلة 🗺️</h1><p class="jq sm">${ar(JR.st.length)} محطات مليئة بالمغامرات، أكملها لتحصل على شهادة البطل الصغير.</p></div><div class="jmm"><div class="jbub sm">${JR.prog.done.length===JR.st.length?'أحسنت! أكملت الرحلة 🎉':JR.prog.done.length?'رائع! لنكمل الرحلة!':'لنبدأ من '+esc(JR.st[0].t)+'!'}</div>${mascot(jMasc())}</div></div>
 <ol class="jmap">${JR.st.map((s,i)=>{const op=jOpen(i),dn=JR.prog.done.includes(i),stn=JR.prog.stars[i]|0,cur=op&&!dn;return `<li><${op?'button':'div'} class="jst ${cur?'cur':''} ${op?'':'lock'}" ${op?`data-jst="${i}"`:''} style="--c:${s.col}"><span class="jnum">${ar(i+1)}</span><span class="jtile">${op?picHTML(s.ic):ic('lock')}</span><h2>${esc(s.t)}</h2><p>${esc(s.sub)}</p><div class="jsr"><span class="jstars" aria-label="${ar(stn)} من ٣ نجوم">${[1,2,3].map(k=>`<i class="${k<=stn?'on':''}">⭐</i>`).join('')}</span><span class="jgo ${dn?'dn':op?'':'lk'}">${dn?'✓ أعد المحاولة':op?'▶ ابدأ الآن':'🔒 مقفلة'}</span></div></${op?'button':'div'}></li>`}).join('')}</ol>
 ${JR.prog.done.length===JR.st.length?`<div class="jcenter"><button class="jbtn purple" data-jv="cert">${ic('award')}شهادتي</button></div>`:''}</div>`}
function jStation(){const s=JR.st[JR.si],stp=s.steps[JR.step],last=JR.step===s.steps.length-1;
 return `<div class="jwrap"><div class="jsh"><h1 class="jt" style="--c:${s.col}"><span class="jtile sm">${picHTML(s.ic)}</span>${esc(s.t)}</h1><nav class="jsteps" aria-label="خطوات المحطة">${s.steps.map((x,k)=>`<span class="${k<JR.step?'dn':k===JR.step?'on':''}">${k<JR.step?'✓':ar(k+1)+'.'} ${esc(x.n)}</span>`).join('')}</nav></div>
 <div class="jbody" id="jbody">${jStep(stp,s)}</div><div class="jnav">${JR.step>0?`<button class="jbtn white" data-jprev>${ic('arrow-right')}السابق</button>`:''}<button class="jbtn purple" data-jnext ${stp.need&&!stp.ok?'disabled':''}>${last?'أنهِ المحطة':'التالي'} ${ic(last?'flag':'arrow-left')}</button></div></div>`}
function jSay(t){return `<div class="jsay">${mascot(jMasc())}<div class="jbub">${esc(t)}<button class="jspk" data-jspeak="${esc(t)}" aria-label="استمع">${ICO_SPK}</button></div></div>`}
function jStep(x,s){switch(x.k){
 case 'learn':return `<div class="jgrid2">${jSay(x.say)}<figure class="jcard jfigc"><div class="jbig" style="--c:${s.col}">${picHTML(x.pic)}</div>${x.head?`<figcaption>🔍 ${esc(x.head)}</figcaption>`:''}${x.reveal?`<button class="jbtn yellow" data-jrev>🎁 اكشف المفاجأة</button><p class="jrev" hidden>${esc(x.reveal)}</p>`:''}</figure></div>`;
 case 'goals':return `<div class="jcard"><h2 class="jh3">🎯 في هذه الرحلة سأتعلّم</h2><p class="jq sm">اضغط على كل هدف عندما تكون مستعدًا له</p><div class="jgoals">${x.items.map((g,i)=>`<button class="jgoal" data-jgoal="${i}"><span class="jck">${ICO.ok}</span>${esc(g)}</button>`).join('')}</div></div>`;
 case 'examples':return `<div class="jcard"><h2 class="jh3">🔎 أمثلة من حولنا</h2><p class="jq sm">اضغط على كل مثال لتسمعه</p><div class="jexs">${x.items.map((e,i)=>`<button class="jex" data-jex="${i}" data-jspeak="${esc(e.txt)}"><span class="jexp">${picHTML(e.pic)}</span><b>${esc(e.txt)}</b></button>`).join('')}</div></div>`;
 case 'discover':{const n=x.items.length;return `<div class="jcard"><h2 class="jh3">✨ اكتشف الأسرار</h2><p class="jq sm">اضغط على كل بطاقة لتكشف سرّها (<b id="jdc">${ar(x.seen?x.seen.size:0)}</b> / ${ar(n)})</p><div class="jflips">${x.items.map((f,i)=>`<button class="jfl ${x.seen&&x.seen.has(i)?'on':''}" data-jfl="${i}"><span class="jfi"><span class="jff">${picHTML(f.pic)}<b>${esc(f.w)}</b><small>اضغط لتعرف ✦</small></span><span class="jfb">${esc(f.info)}</span></span></button>`).join('')}</div></div>`}
 case 'quiz':{x.need=1;x.i=x.i||0;const q=x.items[x.i];return `<div class="jcard jquiz"><p class="jqn">السؤال ${ar(x.i+1)} من ${ar(x.items.length)}</p><div class="jqh">${q.pic?`<span class="jtile sm">${picHTML(q.pic)}</span>`:''}<h2>${esc(q.q)}</h2><button class="jspk" data-jspeak="${esc(q.q)}" aria-label="استمع">${ICO_SPK}</button></div><div class="jopts ${q.tf?'tf':''}">${q.opts.map((o,k)=>`<button class="jopt ${q.tf?(o.x==='صح'?'ok':'no'):''}" data-jopt="${k}">${q.tf?ICO[o.x==='صح'?'ok':'no']:''}${esc(o.x)}</button>`).join('')}</div><p class="jfb2" id="jfb" aria-live="polite"></p></div>`}
 case 'order':{x.need=1;const L=Array.from(x.word);if(!x.mix){let m=shuffle(L),k=0;while(L.length>1&&m.join('')===x.word&&k++<10)m=shuffle(L);x.mix=m}return `<div class="jcard jord"><h2 class="jh3">🧩 رتّب الحروف لتكوّن الكلمة</h2>${x.pic?`<div class="jbig sm">${picHTML(x.pic)}</div>`:''}<div class="jslots">${L.map(()=>'<span></span>').join('')}</div><div class="jtiles">${x.mix.map(ch=>`<button class="jtl" data-jtl="${esc(ch)}">${esc(ch)}</button>`).join('')}</div><p class="jfb2" id="jfb" aria-live="polite"></p></div>`}
 case 'count':{x.need=1;if(!x.opts){const near=shuffle([x.num-1,x.num+1,x.num+2,x.num-2].filter(v=>v>=1&&v<=10)).slice(0,2);x.opts=shuffle([x.num,...near])}return `<div class="jcard jcnt"><h2 class="jh3">🔢 عُدّ ثم اختر الرقم</h2><div class="jtray">${Array.from({length:x.num},()=>`<span>${picHTML(x.pic)}</span>`).join('')}</div><div class="jopts">${x.opts.map(v=>`<button class="jopt big" data-jcnt="${v}">${ar(v)}</button>`).join('')}</div><p class="jfb2" id="jfb" aria-live="polite"></p></div>`}}return ''}
function jCoin(n=1){JR.prog.coins=(JR.prog.coins|0)+n;jSave();const p=$('.jpill:nth-child(2) b');if(p)p.textContent=ar(JR.prog.coins)}
function jOk(x,msg){x.ok=1;const b=$('[data-jnext]');if(b)b.disabled=false;const f=$('#jfb');if(f){f.textContent=msg||'أحسنت! 🎉';f.className='jfb2 good'}sfx('win');confetti(80)}
function jNo(msg){const f=$('#jfb');if(f){f.textContent=msg||'محاولة جميلة! جرّب مرة أخرى ✨';f.className='jfb2 bad'}sfx('no');JR.cur.miss++}
function jFinishStation(){const s=JR.st[JR.si],q=JR.cur,stars=q.total?Math.max(1,Math.round(Math.max(0,q.total-q.miss)/q.total*3)):3;
 JR.prog.stars[JR.si]=Math.max(JR.prog.stars[JR.si]|0,stars);if(!JR.prog.done.includes(JR.si))JR.prog.done.push(JR.si);jCoin(10);jSave();sfx('end');confetti(200);
 const all=JR.prog.done.length===JR.st.length,nx=JR.si+1<JR.st.length;
 const d=openDialog(`<div class="jdone">${mascot(jMasc())}<h2>أنهيت محطة «${esc(s.t)}»!</h2><div class="jbigstars">${[1,2,3].map(k=>`<i class="${k<=stars?'on':''}">⭐</i>`).join('')}</div><p>ربحت ${ar(stars)} نجوم و١٠ عملات 🪙</p><div class="jacts">${all?`<button class="jbtn purple" data-jgo="cert">${ic('award')}شهادتي</button>`:nx?`<button class="jbtn green" data-jgo="next">المحطة التالية ${ic('arrow-left')}</button>`:''}<button class="jbtn white" data-jgo="map">${ic('map')}الخريطة</button></div></div>`,{focus:false,onClose:()=>{if(JR.view==='st'){JR.view='map';jRender()}}});
 d.onclick=e=>{const b=e.target.closest('[data-jgo]');if(!b)return;const g=b.dataset.jgo;d._onClose=null;d.remove();if(g==='next')jEnter(JR.si+1);else{JR.view=g;jRender()}}}
function jEnter(i){JR.si=i;JR.step=0;JR.cur={total:0,miss:0};JR.st[i].steps.forEach(x=>{delete x.ok;delete x.i;delete x.seen;delete x.mix;delete x.opts;if(x.k==='quiz')JR.cur.total+=x.items.length;if(x.k==='order'||x.k==='count')JR.cur.total++});JR.view='st';jRender()}
function jCert(){const nm=JR.name||'البطل الصغير',tot=jStars(),max=JR.st.length*3,c=MOT.cls(),kid=c&&(c.students||[]).find(s=>s.n.trim()===nm.trim());
 return `<div class="jwrap"><div class="jcert"><div class="jcin">${seal('#9b5de5')}${mascot(jMasc())}<div><span class="jchip">شهادة البطل الصغير</span><h1 class="jgrad">${esc(nm)}</h1><p>أكملتَ رحلة «${esc(JR.src.c.title||JR.src.title)}» بنجاح، وجمعت ${ar(tot)} من ${ar(max)} نجمة و${ar(JR.prog.coins|0)} عملة.</p><div class="jbigstars">${[1,2,3].map(k=>`<i class="${tot/max>=k/3-.01?'on':''}">⭐</i>`).join('')}</div><small>${esc(fmtDate(today()))}</small></div></div></div>
 <div class="jacts jcenter">${kid&&!JR.prog.sent?`<button class="jbtn green" data-jsend="${esc(kid.id)}">${ic('send')}أضيفي نجوم ${esc(nm)} إلى لوحة الفصل</button>`:''}<button class="jbtn white" data-jagain>${ic('rotate-ccw')}رحلة جديدة</button><a class="jbtn white" href="#lessons">${ic('log-out')}الخروج</a></div></div>`}
function jClick(e){const b=e.target.closest('button');if(!b)return;const d=b.dataset;
 if(d.jmute!==undefined){SND.muted=!SND.muted;b.innerHTML=ic(SND.muted?'volume-x':'volume-2');icons();return}
 if(d.jv){JR.view=d.jv;return jRender()}
 if(d.jhow!==undefined)return openDialog(`<h2 class="dh">كيف ألعب؟</h2><ol class="jhow"><li>🗺️ افتح المحطات بالترتيب على خريطة الرحلة.</li><li>📖 في كل محطة: تعرّف، ثم جرّب، ثم اختبر نفسك.</li><li>⭐ أجب من أول مرة لتربح ٣ نجوم، و🪙 العملات مع كل اكتشاف.</li><li>🏆 أكمل كل المحطات لتحصل على شهادتك!</li></ol>`,{focus:false});
 if(d.jstart!==undefined){const n=$('#jName');JR.name=n?n.value.trim().slice(0,30):'';jLoad();sfx('star');JR.view='map';return jRender()}
 if(d.jst)return jEnter(+d.jst);
 if(d.jspeak)speak(d.jspeak);
 const s=JR.st[JR.si],x=s&&s.steps[JR.step];
 if(d.jprev!==undefined){JR.step--;return jRender()}
 if(d.jnext!==undefined){if(x.need&&!x.ok)return;if(JR.step<s.steps.length-1){JR.step++;return jRender()}return jFinishStation()}
 if(d.jrev!==undefined){b.nextElementSibling.hidden=false;b.remove();jCoin(2);sfx('star');confetti(60);return}
 if(d.jgoal){if(!b.classList.contains('on')){b.classList.add('on');jCoin();sfx('tap')}return}
 if(d.jex){if(!b.classList.contains('seen')){b.classList.add('seen');jCoin()}return}
 if(d.jfl){x.seen=x.seen||new Set();b.classList.add('on');sfx('flip');if(!x.seen.has(+d.jfl)){x.seen.add(+d.jfl);jCoin();$('#jdc').textContent=ar(x.seen.size)}return}
 if(d.jopt){if(x.ok)return;const q=x.items[x.i],o=q.opts[+d.jopt];if(o.ok){b.classList.add('won');$$('.jopt',$('#jbody')).forEach(z=>z.disabled=true);jCoin(3);
   if(x.i<x.items.length-1){jOk({},'أحسنت! السؤال التالي…');setTimeout(()=>{x.i++;$('#jbody').innerHTML=jStep(x,s);icons()},1100)}else jOk(x)}else{b.classList.add('no');b.disabled=true;jNo()}return}
 if(d.jtl){if(x.ok)return;const sl=$$('.jslots span',$('#jbody')),e2=sl.find(z=>!z.textContent);if(!e2||b.disabled)return;e2.textContent=d.jtl;e2.classList.add('f');b.disabled=true;sfx('tap');
  if(sl.every(z=>z.textContent)){if(sl.map(z=>z.textContent).join('')===x.word){$('.jslots').classList.add('won');jCoin(3);jOk(x,`أحسنت! الكلمة: ${x.word}`)}else{jNo('الترتيب غير صحيح، جرّب مرة أخرى');setTimeout(()=>{sl.forEach(z=>{z.textContent='';z.classList.remove('f')});$$('.jtl').forEach(t=>t.disabled=false)},700)}}return}
 if(d.jcnt){if(x.ok)return;if(+d.jcnt===x.num){b.classList.add('won');$$('.jopt',$('#jbody')).forEach(z=>z.disabled=true);jCoin(3);jOk(x)}else{b.classList.add('no');b.disabled=true;jNo()}return}
 if(d.jsend){MOT.awardStudent(d.jsend,jStars(),'رحلة: '+(JR.src.c.title||''));MOT.flush();JR.prog.sent=1;jSave();toast('أُضيفت النجوم إلى لوحة الفصل');return jRender()}
 if(d.jagain!==undefined){JR.name='';JR.view='land';jLoad();return jRender()}}
