'use strict';
/* classroom.js: full class management (attendance, random picker, points with reasons,
   student files, gradebook, Excel/CSV import, reports, backup). Data lives in the class doc (K_*). */
const ATT={p:['حاضر','ح'],l:['متأخر','ت'],a:['غائب','غ'],e:['مستأذن','س']};
const DEF_REASONS=[{t:'مشاركة مميزة',n:2},{t:'إجابة صحيحة',n:1},{t:'تعاون',n:1},{t:'نظام وهدوء',n:1},{t:'إنجاز الواجب',n:1},{t:'عدم إنجاز الواجب',n:-1}];
const ASTYPES=['اختبار قصير','واجب','مشروع','مشاركة','اختبار'];
const CR={tab:'dash',date:null,period:'month',gsel:null};
const pad2=n=>String(n).padStart(2,'0');
const isoDay=(d=new Date())=>`${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const dayName=s=>{try{return new Date(s+'T12:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',{weekday:'long'})}catch(e){return s}};
const dayShort=s=>{try{return new Date(s+'T12:00:00').toLocaleDateString('ar-SA-u-ca-gregory-nu-arab',{day:'numeric',month:'short'})}catch(e){return s}};
const crReasons=()=>(ME.p&&Array.isArray(ME.p.reasons)&&ME.p.reasons.length?ME.p.reasons:DEF_REASONS);
function crCls(){const c=MOT.cls();if(!c)return null;c.students=c.students||[];c.att=c.att||{};c.pl=c.pl||[];c.as=c.as||[];c.gr=c.gr||{};c.pick=c.pick||{used:[],round:1};return c}
function crSave(){MOT.mark()}
const crToday=()=>CR.date||isoDay();
function crDays(c,from,to){return Object.keys(c.att).filter(d=>(!from||d>=from)&&(!to||d<=to)&&Object.keys(c.att[d]||{}).length).sort()}
function crRange(p){const t=new Date();if(p==='week'){const f=new Date(t);f.setDate(t.getDate()-6);return[isoDay(f),isoDay(t)]}if(p==='month'){const f=new Date(t);f.setDate(t.getDate()-29);return[isoDay(f),isoDay(t)]}return[null,null]}
function stuStats(c,s,from,to){const r={p:0,l:0,a:0,e:0,pts:0,g:[],gp:null};
 crDays(c,from,to).forEach(d=>{const v=c.att[d][s.id];if(v&&r[v]!=null)r[v]++});
 c.pl.forEach(x=>{if(x.s===s.id&&(!from||x.d.slice(0,10)>=from)&&(!to||x.d.slice(0,10)<=to))r.pts+=x.n});
 c.as.forEach(a=>{const v=(c.gr[a.id]||{})[s.id];if(v!==undefined&&v!==''&&!isNaN(+v))r.g.push({a,v:+v})});
 const rec=r.p+r.l+r.a;r.att=rec?Math.round((r.p+r.l)/rec*100):null;
 if(r.g.length)r.gp=Math.round(r.g.reduce((x,y)=>x+y.v/(+y.a.max||1),0)/r.g.length*100);return r}
const pctTxt=v=>v==null?'—':ar(v)+'٪';

/* ---------- page shell ---------- */
function vClassroom(){return `<section class="band hero2 w-sea"><div class="wrap"><div class="h2row"><div><span class="bd y">إدارة صفية كاملة</span><h1 class="h1s">فصلي</h1><p class="lead">الحضور، واختيار من يجيب، والنقاط بأسبابها، والدرجات، وملف كل طالب وتقاريره، في مكان واحد ومرتبط بنظام التحفيز.</p></div><div class="h2art">${mascot('sci')}</div></div><div id="crBar"></div>
 ${tabsHTML('cr',[['dash','لوحة التحكم','layout-dashboard'],['session','الحصة','presentation'],['students','الطلاب','users-round'],['grades','الدرجات','table-2'],['register','سجل الحضور','calendar-check'],['reports','التقارير','chart-column'],['settings','الإعدادات','settings']],CR.tab)}<div id="crPanel" role="tabpanel"></div></div></section>`}
function crBar(){const c=MOT.cls(),b=$('#crBar');if(!b)return;b.innerHTML=`<div class="clsbar"><label class="lab inl">الفصل<select class="in" id="crSel">${ME.classes.map(k=>`<option value="${esc(k._id)}" ${c&&k._id===c._id?'selected':''}>${esc(k.name)} · ${ar((k.students||[]).length)} طالب</option>`).join('')||'<option>لا توجد فصول</option>'}</select></label><button class="btn sec" data-newcls>${ic('plus')}فصل جديد</button>${c?`<button class="btn ter" data-rencls>${ic('pencil')}إعادة التسمية</button>`:''}<span class="note">بيانات الطلاب في حسابك فقط ولا يراها أحد غيرك.</span></div>`;icons()}
function crPanel(){const p=$('#crPanel'),c=crCls();if(!p)return;
 if(!c){p.innerHTML=`<div class="empty">${mascot('sci')}<h2>ابدئي بفصلك الأول</h2><p class="lead">أنشئي فصلًا لكل شعبة، ثم أضيفي الأسماء كتابةً أو من ملف Excel.</p><div class="acts" style="justify-content:center"><button class="btn pri" data-newcls>${ic('plus')}أنشئي فصلًا</button><button class="btn sec" data-demo>${ic('flask-conical')}جرّبي ببيانات تجريبية</button></div></div>`;icons();return}
 const S_=c.students;
 if(!S_.length&&!['settings'].includes(CR.tab)){p.innerHTML=`<div class="empty">${mascot('sci')}<h2>أضيفي طلاب «${esc(c.name)}»</h2><p class="lead">اكتبي الأسماء (اسم في كل سطر) أو استوردي ملف Excel أو CSV.</p>${addNamesHTML()}<button class="btn ter" data-demo>${ic('flask-conical')}أو جرّبي ببيانات تجريبية</button></div>`;icons();return}
 ({dash:crDash,session:crSession,students:crStudents,grades:crGrades,register:crRegister,reports:crReports,settings:crSettings})[CR.tab](p,c);icons()}
function addNamesHTML(){return `<div class="crAdd"><label class="lab">أسماء الطلاب (اسم في كل سطر)<textarea class="in" id="crNames" rows="4" placeholder="ريم عبدالله&#10;سارة أحمد&#10;لمى سعد"></textarea></label><div class="acts"><button class="btn pri" data-addnames>${ic('user-plus')}إضافة الأسماء</button><button class="btn sec" data-import>${ic('file-spreadsheet')}استيراد من Excel أو CSV</button></div></div>`}

/* ---------- dashboard ---------- */
function crDash(p,c){const t=isoDay(),day=c.att[t]||{},S_=c.students,pres=S_.filter(s=>day[s.id]==='p'||day[s.id]==='l').length,ptsT=c.pl.filter(x=>x.d.slice(0,10)===t).reduce((a,x)=>a+x.n,0);
 const days=crDays(c).slice(-10),bars=days.map(d=>{const v=Object.values(c.att[d]),n=v.length,ok=v.filter(x=>x==='p'||x==='l').length;return{d,pc:n?Math.round(ok/n*100):0}});
 const [f,to]=crRange('month'),risk=S_.map(s=>({s,st:stuStats(c,s,f,to)})).filter(x=>x.st.att!=null&&x.st.att<80).sort((a,b)=>a.st.att-b.st.att).slice(0,5);
 const top=S_.slice().sort((a,b)=>(b.st|0)-(a.st|0)).slice(0,5);
 const bk=ME.p.lastBackup?Math.floor((Date.now()-new Date(ME.p.lastBackup))/864e5):null;
 p.innerHTML=`${bk===null||bk>14?`<div class="crWarn">${ic('shield-check')}<span>${bk===null?'لم تحفظي نسخة احتياطية من بيانات فصولك بعد.':`مرّ ${ar(bk)} يومًا على آخر نسخة احتياطية.`} بياناتك محفوظة في حسابك، والنسخة ملف إضافي للاطمئنان.</span><button class="btn sec sm" data-backup>حفظ نسخة</button></div>`:''}
 <div class="crLesson"><label class="lab inl grow">عنوان درس اليوم<input class="in" id="crLessonT" value="${esc(c.lesson||'')}" placeholder="مثال: حرف الباء" maxlength="80"></label><button class="btn pri" data-go="session">${ic('play')}ابدئي الحصة</button></div>
 <div class="mtop"><div class="stat"><b>${ar(S_.length)}</b><span>طالب مسجّل</span></div><div class="stat"><b>${Object.keys(day).length?ar(pres):'—'}</b><span>حاضر اليوم</span></div><div class="stat"><b>${ar(ptsT)}</b><span>نقاط اليوم</span></div><div class="stat"><b>${ar(c.as.length)}</b><span>تقييم مسجّل</span></div></div>
 <div class="crGrid"><div class="crCard"><h3>الحضور في آخر الأيام</h3>${bars.length?`<div class="crBars">${bars.map(b=>`<div class="crB"><span class="crBv" style="height:${Math.max(4,b.pc)}%"><em>${ar(b.pc)}٪</em></span><small>${esc(dayShort(b.d))}</small></div>`).join('')}</div>`:'<p class="note">سجّلي الحضور من تبويب «الحصة» ليظهر هنا.</p>'}</div>
 <div class="crCard"><h3>الأعلى نقاطًا</h3><ol class="crList">${top.map(s=>`<li><button class="lk2" data-stu="${esc(s.id)}">${esc(s.n)}</button><b>⭐ ${ar(s.st|0)}</b></li>`).join('')}</ol></div>
 <div class="crCard"><h3>يحتاجون متابعة في الحضور</h3>${risk.length?`<ol class="crList">${risk.map(x=>`<li><button class="lk2" data-stu="${esc(x.s.id)}">${esc(x.s.n)}</button><b class="bad">${pctTxt(x.st.att)}</b></li>`).join('')}</ol>`:'<p class="note">لا أحد تحت ٨٠٪ في آخر ٣٠ يومًا.</p>'}</div></div>`}

/* ---------- session ---------- */
function crSession(p,c){const d=crToday(),day=c.att[d]||{},S_=c.students,n=Object.keys(day).length,pres=S_.filter(s=>day[s.id]==='p'||day[s.id]==='l').length;
 p.innerHTML=`<div class="crSesTop"><label class="lab inl">التاريخ<input type="date" class="in" id="crDate" value="${d}" max="${isoDay()}"></label><label class="lab inl grow">عنوان الدرس<input class="in" id="crLessonT" value="${esc(c.lesson||'')}" placeholder="مثال: حرف الباء" maxlength="80"></label><span class="bd">${dayName(d)} · ${n?`${ar(pres)} حاضر من ${ar(S_.length)}`:'لم يُسجّل الحضور'}</span></div>
 <div class="acts crSesAct"><button class="btn pri" data-allp>${ic('check-check')}الكل حاضرون${n<S_.length&&n?` (${ar(S_.length-n)} بلا حالة)`:''}</button><button class="btn sec" data-pick>${ic('shuffle')}اختيار طالب</button><button class="btn sec" data-ptall>${ic('sparkles')}نقطة للحاضرين</button><button class="btn ter" data-clearatt>${ic('eraser')}مسح حضور اليوم</button></div>
 <div class="crSes">${S_.map(s=>{const v=day[s.id]||'';return `<article class="crSc ${v?'st-'+v:''}"><div class="crScH"><button class="lk2" data-stu="${esc(s.id)}">${esc(s.n)}</button><b class="crPts">⭐ ${ar(s.st|0)}</b></div><div class="crSeg" role="group" aria-label="حالة الحضور">${Object.entries(ATT).map(([k,[l]])=>`<button class="crSg" data-att="${esc(s.id)}" data-v="${k}" aria-pressed="${v===k}">${l}</button>`).join('')}</div><button class="btn sec sm crPt" data-pt="${esc(s.id)}">${ic('star')}نقطة</button></article>`}).join('')}</div>`}
function setAtt(c,sid,v){const d=crToday();c.att[d]=c.att[d]||{};if(c.att[d][sid]===v)delete c.att[d][sid];else c.att[d][sid]=v;if(!Object.keys(c.att[d]).length)delete c.att[d];crSave()}
function givePts(c,sid,n,why){const s=c.students.find(x=>x.id===sid);if(!s)return;c.pl.push({s:sid,d:new Date().toISOString(),n,r:why});if(c.pl.length>4000)c.pl=c.pl.slice(-4000);MOT.awardStudent(sid,n,why)}
function ptsDialog(c,sid){const s=c.students.find(x=>x.id===sid);const d=openDialog(`<h2 class="dh">نقاط ${esc(s.n)} · ⭐ <span id="ptNow">${ar(s.st|0)}</span></h2><div class="crRs">${crReasons().map((r,i)=>`<button class="crR ${r.n<0?'neg':''}" data-r="${i}"><b>${r.n>0?'+':''}${ar(r.n)}</b>${esc(r.t)}</button>`).join('')}</div><form class="crRf"><input class="in" id="ptWhy" placeholder="سبب آخر…" maxlength="40"><input class="in" id="ptN" type="number" value="1" min="-5" max="5" aria-label="عدد النقاط"><button class="btn sec">أضيفي</button></form><h3 class="sh">آخر النقاط</h3><ol class="crLog" id="ptLog">${ptLog(c,sid)}</ol>`,{focus:false});
 const upd=()=>{$('#ptNow',d).textContent=ar(s.st|0);$('#ptLog',d).innerHTML=ptLog(c,sid);crPanel()};
 d.addEventListener('click',e=>{const b=e.target.closest('[data-r]');if(!b)return;const r=crReasons()[+b.dataset.r];givePts(c,sid,r.n,r.t);b.classList.add('done');setTimeout(()=>b.classList.remove('done'),500);upd()});
 $('form',d).onsubmit=e=>{e.preventDefault();const w=$('#ptWhy',d).value.trim()||'نقاط',n=Math.max(-5,Math.min(5,Math.round(num($('#ptN',d).value))))||1;givePts(c,sid,n,w);$('#ptWhy',d).value='';upd()}}
function ptLog(c,sid){const L=c.pl.filter(x=>x.s===sid).slice(-8).reverse();return L.map(x=>`<li><span>${esc(x.r)}</span><time>${esc(dayShort(x.d.slice(0,10)))}</time><b class="${x.n<0?'bad':''}">${x.n>0?'+':''}${ar(x.n)}</b></li>`).join('')||'<li class="note">لا نقاط بعد.</li>'}
function pickDialog(c){const day=c.att[crToday()]||{},marked=Object.keys(day).length;
 let pool=c.students.filter(s=>!marked||day[s.id]==='p'||day[s.id]==='l');if(!pool.length)return toast('لا يوجد طلاب حاضرون');
 const total=pool.length;let left=pool.filter(s=>!c.pick.used.includes(s.id)),fresh=false;if(!left.length){c.pick.used=[];c.pick.round=(c.pick.round|0)+1;left=pool;fresh=true}
 const s=left[Math.floor(Math.random()*left.length)];c.pick.used.push(s.id);crSave();
 const d=openDialog(`<div class="pick"><p class="note">${fresh?'بدأت جولة جديدة · ':''}الجولة ${ar(c.pick.round|0||1)} · ${ar(total-left.length+1)} من ${ar(total)}${marked?'':' · (لم يُسجّل الحضور، الاختيار من الجميع)'}</p><div class="pickRoll" id="pkR">؟</div><p class="pickSub" id="pkS"></p><div class="acts" style="justify-content:center"><button class="btn pri" data-ok>${ic('check')}إجابة صحيحة +١</button><button class="btn sec" data-try>${ic('heart')}محاولة جميلة</button><button class="btn ter" data-again>${ic('shuffle')}اختيار آخر</button></div></div>`,{focus:false});
 const roll=$('#pkR',d),names=pool.map(x=>x.n);let k=0;const iv=setInterval(()=>{roll.textContent=names[k++%names.length];sfx('tick')},70);
 setTimeout(()=>{clearInterval(iv);roll.textContent=s.n;roll.classList.add('on');sfx('win');const st=stuStats(c,s);$('#pkS',d).textContent=`⭐ ${ar(s.st|0)} نقطة${st.att!=null?' · الحضور '+pctTxt(st.att):''}`},1100);
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-ok')){givePts(c,s.id,1,'إجابة صحيحة');closeDialog(d);crPanel()}if(b.hasAttribute('data-try')){MOT.awardStudent(s.id,0,'محاولة جميلة','try');closeDialog(d);crPanel()}if(b.hasAttribute('data-again')){closeDialog(d);pickDialog(c)}})}

/* ---------- students ---------- */
function crStudents(p,c){const [f,to]=crRange('all');
 p.innerHTML=`<details class="crDet"><summary>${ic('user-plus')}إضافة طلاب</summary>${addNamesHTML()}</details>
 <div class="crTblW"><table class="crTbl"><thead><tr><th>#</th><th>الاسم</th><th>الحضور</th><th>النقاط</th><th>متوسط الدرجات</th><th>ملاحظات</th><th></th></tr></thead><tbody>${c.students.map((s,i)=>{const st=stuStats(c,s,f,to);return `<tr><td>${ar(i+1)}</td><td><button class="lk2" data-stu="${esc(s.id)}">${esc(s.n)}</button></td><td class="${st.att!=null&&st.att<80?'bad':''}">${pctTxt(st.att)}</td><td>⭐ ${ar(s.st|0)}</td><td>${pctTxt(st.gp)}</td><td>${ar((s.notes||[]).length)}</td><td class="crAct"><button class="ib" data-ren="${esc(s.id)}" aria-label="تعديل الاسم">${ic('pencil')}</button><button class="ib" data-del="${esc(s.id)}" aria-label="حذف">${ic('trash-2')}</button></td></tr>`}).join('')}</tbody></table></div>`}
function stuDialog(c,sid){const s=c.students.find(x=>x.id===sid);if(!s)return;const st=stuStats(c,s);s.notes=s.notes||[];
 const html=()=>`<div class="sfile"><div class="sfH"><span class="av">${esc(String(s.n).slice(0,1))}</span><div><h2 class="dh">${esc(s.n)}</h2><p class="note">${esc(c.name)} · ${esc(lvlOf(s.st|0)[1])}</p></div></div>
 <div class="mtop"><div class="stat"><b>${pctTxt(st.att)}</b><span>الحضور</span></div><div class="stat"><b>${ar(s.st|0)}</b><span>النقاط</span></div><div class="stat"><b>${pctTxt(st.gp)}</b><span>متوسط الدرجات</span></div><div class="stat"><b>${ar(st.a)}</b><span>أيام الغياب</span></div></div>
 <div class="crGrid two"><div class="crCard"><h3>الدرجات</h3>${st.g.length?`<ol class="crList">${st.g.map(x=>`<li><span>${esc(x.a.n)}</span><b>${ar(x.v)} من ${ar(x.a.max)}</b></li>`).join('')}</ol>`:'<p class="note">لا درجات بعد.</p>'}</div>
 <div class="crCard"><h3>الملاحظات</h3><form class="crNf"><input class="in" id="noteT" placeholder="اكتبي ملاحظة…" maxlength="160"><button class="btn sec sm">إضافة</button></form><ol class="crList">${s.notes.slice().reverse().map(n=>`<li><span>${esc(n.t)}</span><time>${esc(dayName(n.d))} ${esc(dayShort(n.d))}</time><button class="ib sm" data-dn="${esc(n.id)}" aria-label="حذف الملاحظة">${ic('x')}</button></li>`).join('')||'<li class="note">لا ملاحظات.</li>'}</ol></div>
 <div class="crCard"><h3>آخر النقاط</h3><ol class="crLog">${ptLog(c,sid)}</ol></div>
 <div class="crCard"><h3>الحضور</h3><p>${['p','l','a','e'].map(k=>`<span class="attk st-${k}">${ATT[k][0]}: ${ar(st[k])}</span>`).join(' ')}</p></div></div>
 <div class="acts"><button class="btn pri" data-spts>${ic('star')}نقاط</button><button class="btn sec" data-sprint>${ic('printer')}تقرير للطباعة أو PDF</button></div></div>`;
 const d=openDialog(html(),{wide:1,focus:false});const re=()=>{$('.dbox',d).innerHTML=`<button class="ib x" data-close aria-label="إغلاق">${ic('x')}</button>`+html();icons()};icons();
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.dn){s.notes=s.notes.filter(n=>n.id!==b.dataset.dn);crSave();re()}if(b.hasAttribute('data-spts')){closeDialog(d);ptsDialog(c,sid)}if(b.hasAttribute('data-sprint'))printStudent(c,s)});
 d.addEventListener('submit',e=>{e.preventDefault();const t=$('#noteT',d).value.trim();if(!t)return;s.notes.push({id:uid(),d:isoDay(),t});crSave();re();crPanel()})}

/* ---------- grades ---------- */
function crGrades(p,c){const A=c.as;
 p.innerHTML=`<form class="crAf"><label class="lab inl grow">اسم التقييم<input class="in" id="asN" placeholder="مثال: اختبار قصير: الجمع" maxlength="50" required></label><label class="lab inl">النوع<select class="in" id="asT">${ASTYPES.map(t=>`<option>${t}</option>`).join('')}</select></label><label class="lab inl">الدرجة العظمى<input class="in" id="asM" type="number" min="1" max="1000" value="10"></label><button class="btn pri">${ic('plus')}إضافة تقييم</button></form>
 ${A.length?`<div class="crTblW"><table class="crTbl crGr"><thead><tr><th>الطالب</th>${A.map(a=>`<th><span>${esc(a.n)}</span><small>${esc(a.t)} · من ${ar(a.max)}</small><button class="ib sm" data-delas="${esc(a.id)}" aria-label="حذف التقييم">${ic('trash-2')}</button></th>`).join('')}<th>المتوسط</th></tr></thead><tbody>${c.students.map(s=>{const st=stuStats(c,s);return `<tr><td><button class="lk2" data-stu="${esc(s.id)}">${esc(s.n)}</button></td>${A.map(a=>{const v=(c.gr[a.id]||{})[s.id];return `<td><input class="in gin" inputmode="decimal" data-g="${esc(a.id)}" data-s="${esc(s.id)}" value="${v==null?'':esc(v)}" aria-label="درجة ${esc(s.n)} في ${esc(a.n)}"></td>`}).join('')}<td class="gavg" data-avg="${esc(s.id)}">${pctTxt(st.gp)}</td></tr>`}).join('')}</tbody><tfoot><tr><td>متوسط الفصل</td>${A.map(a=>{const v=Object.values(c.gr[a.id]||{}).filter(x=>x!==''&&!isNaN(+x)).map(Number);return `<td>${v.length?ar(Math.round(v.reduce((x,y)=>x+y,0)/v.length*10)/10):'—'}</td>`}).join('')}<td></td></tr></tfoot></table></div><div class="acts"><button class="btn sec" data-csvg>${ic('file-down')}تنزيل الدرجات (Excel)</button></div>`:'<p class="note">أضيفي اختبارًا أو واجبًا أو مشروعًا، ثم اكتبي الدرجات في جدول واحد.</p>'}`}

/* ---------- register ---------- */
function crRegister(p,c){const days=crDays(c).slice(-20);
 p.innerHTML=days.length?`<p class="note">آخر ${ar(days.length)} يومًا مسجّلًا. لتعديل يوم سابق: اختاري تاريخه من تبويب «الحصة».</p><div class="crTblW"><table class="crTbl crReg"><thead><tr><th>الطالب</th>${days.map(d=>`<th><button class="lk2" data-day="${d}">${esc(dayShort(d))}</button></th>`).join('')}<th>النسبة</th></tr></thead><tbody>${c.students.map(s=>{const st=stuStats(c,s,days[0],days[days.length-1]);return `<tr><td>${esc(s.n)}</td>${days.map(d=>{const v=c.att[d][s.id];return `<td><span class="attd ${v?'st-'+v:''}" title="${v?ATT[v][0]:'بلا حالة'}">${v?ATT[v][1]:'·'}</span></td>`}).join('')}<td>${pctTxt(st.att)}</td></tr>`}).join('')}</tbody></table></div><p class="note">ح: حاضر · ت: متأخر · غ: غائب · س: مستأذن</p>`:`<div class="empty"><h2>لا يوجد حضور مسجّل بعد</h2><button class="btn pri" data-go="session">${ic('play')}سجّلي حضور اليوم</button></div>`}

/* ---------- reports ---------- */
function crReports(p,c){const [f,to]=crRange(CR.period),days=crDays(c,f,to),rows=c.students.map(s=>({s,st:stuStats(c,s,f,to)}));
 const avg=(()=>{const v=rows.map(r=>r.st.att).filter(x=>x!=null);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):null})();
 p.innerHTML=`<div class="acts"><div class="chips">${[['week','آخر أسبوع'],['month','آخر شهر'],['all','الفصل الدراسي كاملًا']].map(([k,l])=>`<button class="chip" data-per="${k}" aria-pressed="${CR.period===k}">${l}</button>`).join('')}</div></div>
 <div class="mtop"><div class="stat"><b>${ar(days.length)}</b><span>يوم مسجّل</span></div><div class="stat"><b>${pctTxt(avg)}</b><span>متوسط الحضور</span></div><div class="stat"><b>${ar(rows.reduce((a,r)=>a+r.st.pts,0))}</b><span>نقطة في الفترة</span></div><div class="stat"><b>${ar(rows.reduce((a,r)=>a+r.st.a,0))}</b><span>حالة غياب</span></div></div>
 ${days.length?`<div class="crCard"><h3>نسبة الحضور يوميًا</h3><div class="crBars">${days.slice(-14).map(d=>{const v=Object.values(c.att[d]),ok=v.filter(x=>x==='p'||x==='l').length,pc=v.length?Math.round(ok/v.length*100):0;return `<div class="crB"><span class="crBv" style="height:${Math.max(4,pc)}%"><em>${ar(pc)}٪</em></span><small>${esc(dayShort(d))}</small></div>`}).join('')}</div></div>`:''}
 <div class="crTblW"><table class="crTbl"><thead><tr><th>الطالب</th><th>حاضر</th><th>متأخر</th><th>غائب</th><th>مستأذن</th><th>الحضور</th><th>النقاط</th><th>الدرجات</th></tr></thead><tbody>${rows.map(r=>`<tr><td><button class="lk2" data-stu="${esc(r.s.id)}">${esc(r.s.n)}</button></td><td>${ar(r.st.p)}</td><td>${ar(r.st.l)}</td><td>${ar(r.st.a)}</td><td>${ar(r.st.e)}</td><td class="${r.st.att!=null&&r.st.att<80?'bad':''}">${pctTxt(r.st.att)}</td><td>${ar(r.st.pts)}</td><td>${pctTxt(r.st.gp)}</td></tr>`).join('')}</tbody></table></div>
 <div class="acts"><button class="btn pri" data-csvr>${ic('file-spreadsheet')}تنزيل التقرير (Excel)</button><button class="btn sec" data-printr>${ic('printer')}طباعة أو حفظ PDF</button></div>`}

/* ---------- settings ---------- */
function crSettings(p,c){const R=crReasons();
 p.innerHTML=`<div class="crGrid two"><div class="crCard"><h3>أسباب النقاط</h3><p class="note">تظهر عند منح النقاط. القيمة السالبة تُنقص النقاط.</p><div id="rsList">${R.map((r,i)=>`<div class="brow"><input class="in" data-rt="${i}" value="${esc(r.t)}" maxlength="30" aria-label="السبب"><input class="in rn" type="number" data-rn="${i}" value="${r.n}" min="-5" max="5" aria-label="القيمة"><button class="ib" data-rdel="${i}" aria-label="حذف">${ic('trash-2')}</button></div>`).join('')}</div><div class="acts"><button class="btn sec" data-radd>${ic('plus')}سبب جديد</button><button class="btn ter" data-rdef>استعادة الافتراضي</button></div></div>
 <div class="crCard"><h3>النسخة الاحتياطية</h3><p class="note">بياناتك محفوظة في حسابك. نزّلي نسخة في ملف للاطمئنان، أو انقلي فصولك من حساب آخر.${ME.p.lastBackup?` آخر نسخة: ${esc(fmtDate(ME.p.lastBackup))}.`:''}</p><div class="acts"><button class="btn pri" data-backup>${ic('download')}تنزيل نسخة احتياطية</button><button class="btn sec" data-restore>${ic('upload')}استعادة نسخة</button></div>
 <ul class="crList">${[['الفصول',ME.classes.length],['الطلاب',ME.classes.reduce((a,k)=>a+(k.students||[]).length,0)],['أيام الحضور',ME.classes.reduce((a,k)=>a+Object.keys(k.att||{}).length,0)],['الدرجات',ME.classes.reduce((a,k)=>a+Object.values(k.gr||{}).reduce((x,g)=>x+Object.keys(g).length,0),0)],['سجلات النقاط',ME.classes.reduce((a,k)=>a+(k.pl||[]).length,0)]].map(([l,v])=>`<li><span>${l}</span><b>${ar(v)}</b></li>`).join('')}</ul></div>
 <div class="crCard"><h3>هذا الفصل</h3><div class="acts"><button class="btn sec" data-demo>${ic('flask-conical')}فصل ببيانات تجريبية</button><button class="btn ter" data-resetatt>${ic('eraser')}مسح الحضور والنقاط والدرجات</button><button class="btn ter" data-delcls>${ic('trash-2')}حذف الفصل</button></div></div></div>`}
async function saveReasons(R){ME.p.reasons=R;await saveProfile()}

/* ---------- import / export ---------- */
function loadScript(src){return new Promise((res,rej)=>{if([...document.scripts].some(s=>s.src===src))return res();const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
function pickFile(accept){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept=accept;i.onchange=()=>res(i.files[0]||null);i.click()})}
async function readNames(file){const ext=(file.name.split('.').pop()||'').toLowerCase();let rows=[];
 if(ext==='xlsx'||ext==='xls'){await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');const wb=XLSX.read(await file.arrayBuffer(),{type:'array'});rows=XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:''})}
 else{const t=(await file.text()).replace(/^﻿/,'');rows=t.split(/\r?\n/).map(l=>l.split(/[,;\t]/))}
 rows=rows.map(r=>r.map(x=>String(x==null?'':x).trim()));let col=0;const h=rows[0]||[];const hi=h.findIndex(x=>/اسم|الاسم|name/i.test(x));
 if(hi>=0){col=hi;rows=rows.slice(1)}else{const cnt=h.map((_,k)=>rows.filter(r=>r[k]&&isNaN(+r[k])).length);col=cnt.indexOf(Math.max(...cnt,0));if(col<0)col=0}
 return [...new Set(rows.map(r=>r[col]).filter(x=>x&&isNaN(+x)).map(x=>x.slice(0,50)))].slice(0,80)}
async function importNames(c){const f=await pickFile('.xlsx,.xls,.csv,.txt');if(!f)return;let names;try{names=await readNames(f)}catch(e){return toast('تعذّرت قراءة الملف. جرّبي حفظه بصيغة CSV')}
 if(!names.length)return toast('لم نجد أسماء في الملف');const have=new Set(c.students.map(s=>s.n.trim()));
 const d=openDialog(`<h2 class="dh">معاينة الاستيراد · ${esc(f.name)}</h2><p class="note">${ar(names.length)} اسمًا. الأسماء المكررة غير محددة.</p><div class="crImp">${names.map((n,i)=>`<label class="crImpR"><input type="checkbox" data-i="${i}" ${have.has(n)?'':'checked'}><span>${esc(n)}</span><em class="${have.has(n)?'bad':''}">${have.has(n)?'مكرر':'جديد'}</em></label>`).join('')}</div><div class="acts"><button class="btn pri" data-ok>حفظ المحدد</button><button class="btn sec" data-close>إلغاء</button></div>`,{wide:1,focus:false});
 $('[data-ok]',d).onclick=()=>{const pick=$$('input:checked',d).map(x=>names[+x.dataset.i]);addStudents(c,pick);closeDialog(d)}}
function addStudents(c,names){names=names.map(n=>n.trim()).filter(Boolean).slice(0,80);if(!names.length)return;const T=c.teams||[];names.forEach(n=>c.students.push({id:uid(),n:n.slice(0,50),team:T.length?T[c.students.length%T.length].id:'',st:0,pt:0,b:{},notes:[]}));crSave();toast(`أُضيف ${ar(names.length)} طالب`);crBar();crPanel()}
function dlFile(name,data,type){const b=new Blob([data],{type}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
const csvCell=v=>{v=String(v==null?'':v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
const csv=rows=>'﻿'+rows.map(r=>r.map(csvCell).join(',')).join('\r\n');
const safeName=s=>String(s).replace(/[\\/:*?"<>|]/g,'-');
function csvReport(c){const [f,to]=crRange(CR.period);dlFile(`تقرير ${safeName(c.name)} ${isoDay()}.csv`,csv([['الطالب','حاضر','متأخر','غائب','مستأذن','نسبة الحضور','النقاط في الفترة','مجموع النقاط','متوسط الدرجات',...c.as.map(a=>`${a.n} (من ${a.max})`)],...c.students.map(s=>{const st=stuStats(c,s,f,to);return[s.n,st.p,st.l,st.a,st.e,st.att==null?'':st.att+'%',st.pts,s.st|0,st.gp==null?'':st.gp+'%',...c.as.map(a=>(c.gr[a.id]||{})[s.id]??'')]})]),'text/csv;charset=utf-8')}
function csvGrades(c){dlFile(`درجات ${safeName(c.name)}.csv`,csv([['الطالب',...c.as.map(a=>`${a.n} (من ${a.max})`),'المتوسط'],...c.students.map(s=>{const st=stuStats(c,s);return[s.n,...c.as.map(a=>(c.gr[a.id]||{})[s.id]??''),st.gp==null?'':st.gp+'%']})]),'text/csv;charset=utf-8')}
function printHTML(title,body){const w=document.createElement('div');w.id='prt';w.innerHTML=`<div class="prtH"><b>مضبوط · فصلي</b><span>${esc(ME.p.name||'')}${ME.p.school?' · '+esc(ME.p.school):''}</span><span>${esc(fmtDate(new Date().toISOString()))}</span></div><h1>${esc(title)}</h1>${body}`;document.body.appendChild(w);document.body.classList.add('printing');const done=()=>{document.body.classList.remove('printing');w.remove();removeEventListener('afterprint',done)};addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(done,1500)},60)}
function printReport(c){const p=$('#crPanel');const t=p.querySelector('table').outerHTML;const per={week:'آخر أسبوع',month:'آخر شهر',all:'الفصل الدراسي'}[CR.period];printHTML(`تقرير ${c.name} · ${per}`,p.querySelector('.mtop').outerHTML+t)}
function printStudent(c,s){const st=stuStats(c,s);printHTML(`تقرير الطالب: ${s.n}`,`<p>${esc(c.name)}</p><table class="crTbl"><tr><th>الحضور</th><th>حاضر</th><th>متأخر</th><th>غائب</th><th>مستأذن</th><th>النقاط</th><th>متوسط الدرجات</th></tr><tr><td>${pctTxt(st.att)}</td><td>${ar(st.p)}</td><td>${ar(st.l)}</td><td>${ar(st.a)}</td><td>${ar(st.e)}</td><td>${ar(s.st|0)}</td><td>${pctTxt(st.gp)}</td></tr></table><h2>الدرجات</h2><table class="crTbl">${st.g.map(x=>`<tr><td>${esc(x.a.n)}</td><td>${ar(x.v)} من ${ar(x.a.max)}</td></tr>`).join('')||'<tr><td>لا درجات</td></tr>'}</table><h2>الملاحظات</h2><ul>${(s.notes||[]).map(n=>`<li>${esc(dayShort(n.d))}: ${esc(n.t)}</li>`).join('')||'<li>لا ملاحظات</li>'}</ul>`)}
async function backup(){await MOT.flush();dlFile(`نسخة فصولي ${isoDay()}.json`,JSON.stringify({app:'madbot-class',v:1,at:new Date().toISOString(),reasons:ME.p.reasons||null,classes:ME.classes}),'application/json');ME.p.lastBackup=new Date().toISOString();await saveProfile();toast('نُزّلت النسخة الاحتياطية');crPanel()}
async function restore(){const f=await pickFile('.json');if(!f)return;let j;try{j=JSON.parse(await f.text())}catch(e){return toast('الملف غير صالح')}if(!j||j.app!=='madbot-class'||!Array.isArray(j.classes))return toast('هذا ليس ملف نسخة من «فصلي»');
 if(!await confirmBox(`استعادة ${ar(j.classes.length)} فصل؟ الفصول التي بالاسم نفسه في النسخة ستُستبدل.`,'استعيدي'))return;
 for(const k of j.classes.slice(0,Math.max(1,lim('classes')))){if(!k||!k._id||!/^K_[\w-]+$/.test(k._id))continue;const{_id,...b}=k;await S.set(S.up(_id),b);const i=ME.classes.findIndex(x=>x._id===_id);if(i>=0)ME.classes[i]=k;else ME.classes.push(k)}
 if(j.reasons)ME.p.reasons=j.reasons;if(!ME.p.activeClass&&ME.classes[0])ME.p.activeClass=ME.classes[0]._id;await saveProfile();toast('اكتملت الاستعادة');crBar();crPanel()}
async function demoClass(){if(ME.classes.length>=lim('classes'))return needPlan(`باقتك الحالية تسمح بـ ${ar(lim('classes'))} فصل`);
 const c=newClass('فصل تجريبي');const N=['ريم عبدالله','لمى سعد','جود خالد','شهد فهد','نورة سلطان','رهف ماجد','دانة ناصر','لين تركي','هيا بندر','سارة أحمد','غلا محمد','وعد علي'];
 c.students=N.map((n,i)=>({id:uid(),n,team:c.teams[i%4].id,st:0,pt:0,b:{},notes:[]}));c.att={};c.pl=[];c.as=[];c.gr={};c.lesson='حرف الباء';
 const t=new Date();let k=0;for(let back=20;back>=1&&k<12;back--){const d=new Date(t);d.setDate(t.getDate()-back);if([5,6].includes(d.getDay()))continue;k++;const ds=isoDay(d);c.att[ds]={};c.students.forEach((s,i)=>{const r=Math.random();c.att[ds][s.id]=i===6?(r<.35?'a':'p'):(r<.05?'a':r<.1?'l':r<.12?'e':'p')})}
 c.students.forEach(s=>{const n=2+Math.floor(Math.random()*8);for(let j=0;j<n;j++){const r=DEF_REASONS[Math.floor(Math.random()*5)];c.pl.push({s:s.id,d:new Date(t-Math.random()*20*864e5).toISOString(),n:r.n,r:r.t});s.st+=r.n}});
 [['اختبار قصير: الحروف','اختبار قصير',10],['واجب: الأرقام','واجب',5],['مشروع: ركن القراءة','مشروع',20]].forEach(([n,ty,m])=>{const a={id:uid(),n,t:ty,max:m,date:isoDay()};c.as.push(a);c.gr[a.id]={};c.students.forEach(s=>c.gr[a.id][s.id]=Math.max(Math.round(m*.5),Math.round(m*(.6+Math.random()*.4))))});
 c.students[0].notes=[{id:uid(),d:isoDay(),t:'تحسن ملحوظ في القراءة الجهرية.'}];
 ME.classes.push(c);ME.p.activeClass=c._id;await S.set(S.up(c._id),(({_id,...b})=>b)(c));await saveProfile();toast('أُنشئ فصل تجريبي، احذفيه من الإعدادات متى شئتِ');crBar();crPanel()}

/* ---------- events ---------- */
function bindClassroom(){const app=$('#app');
 app.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.tab==='cr'){CR.tab=d.k;$$('.tab',b.parentElement).forEach(x=>x.setAttribute('aria-selected',x===b));return crPanel()}
  if(b.hasAttribute('data-newcls')){await addClass();crBar();return crPanel()}
  if(b.hasAttribute('data-demo'))return demoClass();
  if(b.hasAttribute('data-backup'))return backup();
  if(b.hasAttribute('data-restore'))return restore();
  const c=crCls();if(!c)return;
  if(d.go){CR.tab=d.go;$$('#app .tab').forEach(x=>x.setAttribute('aria-selected',x.dataset.k===d.go));return crPanel()}
  if(b.hasAttribute('data-rencls')){const n=await promptBox('اسم الفصل','',c.name);if(n){c.name=n;MOT.dirty=true;await MOT.flush();crBar()}return}
  if(b.hasAttribute('data-delcls')){if(!await confirmBox(`حذف «${c.name}» مع حضوره ودرجاته ونقاطه؟ لا يمكن التراجع.`,'احذفي الفصل'))return;await S.del(S.up(c._id));ME.classes=ME.classes.filter(k=>k!==c);ME.p.activeClass=ME.classes[0]?ME.classes[0]._id:null;await saveProfile();crBar();return crPanel()}
  if(b.hasAttribute('data-addnames')){addStudents(c,$('#crNames').value.split('\n'));return}
  if(b.hasAttribute('data-import'))return importNames(c);
  if(d.stu)return stuDialog(c,d.stu);
  if(d.att){setAtt(c,d.att,d.v);return crPanel()}
  if(b.hasAttribute('data-allp')){const dd=crToday();c.att[dd]=c.att[dd]||{};c.students.forEach(s=>{if(!c.att[dd][s.id])c.att[dd][s.id]='p'});crSave();sfx('win');return crPanel()}
  if(b.hasAttribute('data-clearatt')){if(!await confirmBox('مسح حضور هذا اليوم؟','امسحي'))return;delete c.att[crToday()];crSave();return crPanel()}
  if(b.hasAttribute('data-pick'))return pickDialog(c);
  if(d.pt)return ptsDialog(c,d.pt);
  if(b.hasAttribute('data-ptall')){const day=c.att[crToday()]||{},m=Object.keys(day).length,L=c.students.filter(s=>!m||day[s.id]==='p'||day[s.id]==='l');L.forEach(s=>{c.pl.push({s:s.id,d:new Date().toISOString(),n:1,r:'نقطة للجميع'});s.st=(s.st|0)+1});MOT.log(`نقطة لـ ${ar(L.length)} طالب`);crSave();confetti(140);sfx('end');return crPanel()}
  if(d.ren){const s=c.students.find(x=>x.id===d.ren);const n=await promptBox('تعديل الاسم','',s.n);if(n){s.n=n.slice(0,50);crSave();crPanel()}return}
  if(d.del){const s=c.students.find(x=>x.id===d.del);if(!await confirmBox(`حذف ${s.n} مع درجاته ونقاطه؟`,'احذفي'))return;c.students=c.students.filter(x=>x!==s);Object.values(c.att).forEach(x=>delete x[s.id]);Object.values(c.gr).forEach(x=>delete x[s.id]);c.pl=c.pl.filter(x=>x.s!==s.id);crSave();crBar();return crPanel()}
  if(d.delas){const a=c.as.find(x=>x.id===d.delas);if(!await confirmBox(`حذف «${a.n}» ودرجاته؟`,'احذفي'))return;c.as=c.as.filter(x=>x!==a);delete c.gr[a.id];crSave();return crPanel()}
  if(b.hasAttribute('data-csvg'))return csvGrades(c);
  if(b.hasAttribute('data-csvr'))return csvReport(c);
  if(b.hasAttribute('data-printr'))return printReport(c);
  if(d.per){CR.period=d.per;return crPanel()}
  if(d.day){CR.date=d.day;CR.tab='session';$$('#app .tab').forEach(x=>x.setAttribute('aria-selected',x.dataset.k==='session'));return crPanel()}
  if(b.hasAttribute('data-radd')){const R=clone(crReasons());R.push({t:'سبب جديد',n:1});await saveReasons(R);return crPanel()}
  if(d.rdel){const R=clone(crReasons());R.splice(+d.rdel,1);await saveReasons(R.length?R:clone(DEF_REASONS));return crPanel()}
  if(b.hasAttribute('data-rdef')){await saveReasons(clone(DEF_REASONS));return crPanel()}
  if(b.hasAttribute('data-resetatt')){if(!await confirmBox(`مسح كل الحضور والنقاط والدرجات في «${c.name}»؟ تبقى الأسماء.`,'امسحي'))return;c.att={};c.pl=[];c.as=[];c.gr={};c.pick={used:[],round:1};c.students.forEach(s=>{s.st=0;s.b={}});crSave();return crPanel()}};
 app.onchange=async e=>{const t=e.target;if(t.id==='crSel'){ME.p.activeClass=t.value;saveProfile();MOT._tmp=null;crBar();return crPanel()}const c=crCls();if(!c)return;
  if(t.id==='crDate'){CR.date=t.value&&t.value!==isoDay()?t.value:null;return crPanel()}
  if(t.dataset.g){const v=en(t.value.trim());const a=c.as.find(x=>x.id===t.dataset.g);if(v!==''&&(isNaN(+v)||+v<0||+v>+a.max)){t.classList.add('err');return toast(`الدرجة بين ٠ و${ar(a.max)}`)}t.classList.remove('err');c.gr[a.id]=c.gr[a.id]||{};if(v==='')delete c.gr[a.id][t.dataset.s];else c.gr[a.id][t.dataset.s]=+v;crSave();const s=c.students.find(x=>x.id===t.dataset.s),cell=$(`[data-avg="${t.dataset.s}"]`);if(cell)cell.textContent=pctTxt(stuStats(c,s).gp);return}
  if(t.dataset.rt!==undefined||t.dataset.rn!==undefined){const R=clone(crReasons());$$('[data-rt]').forEach(x=>R[+x.dataset.rt].t=x.value.trim().slice(0,30)||'سبب');$$('[data-rn]').forEach(x=>R[+x.dataset.rn].n=Math.max(-5,Math.min(5,Math.round(num(x.value))))||1);await saveReasons(R);toast('حُفظت الأسباب')}};
 app.oninput=e=>{const t=e.target,c=crCls();if(!c)return;if(t.id==='crLessonT'){c.lesson=t.value.slice(0,80);crSave()}};
 app.onkeydown=e=>{const t=e.target;if(t.classList&&t.classList.contains('gin')&&e.key==='Enter'){e.preventDefault();const all=$$('.gin'),i=all.indexOf(t),n=$$(`.gin[data-g="${t.dataset.g}"]`),k=n.indexOf(t);(n[k+1]||all[i+1]||t).focus()}};
 app.onsubmit=e=>{e.preventDefault();const c=crCls();if(!c||!e.target.classList.contains('crAf'))return;const n=$('#asN').value.trim(),m=num($('#asM').value);if(!n||m<1)return toast('اكتبي اسم التقييم والدرجة العظمى');c.as.push({id:uid(),n:n.slice(0,50),t:$('#asT').value,max:m,date:isoDay()});crSave();crPanel()}}
