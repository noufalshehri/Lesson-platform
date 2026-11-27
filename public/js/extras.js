'use strict';
/* extras.js: parent communication (full student report + WhatsApp), exam services
   (paper builder, A/B versions, answer key, results analysis, seat cards, timer),
   impact measurement (pre/post), team achievement wall, and the QR code maker. */

/* ---------- shared helpers ---------- */
const GF=()=>!(ME.p&&ME.p.gender==='m');            // true = girls' wording (default)
const WG=(f,m)=>GF()?f:m;
const STU=()=>WG('الطالبة','الطالب');
const ORD=['الأول','الثاني','الثالث','الرابع','الخامس','السادس'];
const gradeWord=v=>v==null?'—':v>=90?'ممتاز':v>=80?'جيد جدًا':v>=65?'جيد':v>=50?'مقبول':'يحتاج دعمًا';
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
const median=a=>{if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),m=s.length>>1;return s.length%2?s[m]:(s[m-1]+s[m])/2};
const sdev=a=>{if(a.length<2)return null;const m=mean(a);return Math.sqrt(a.reduce((x,y)=>x+(y-m)**2,0)/(a.length-1))};
const r1=v=>v==null||isNaN(v)?null:Math.round(v*10)/10;
const nTxt=v=>v==null?'—':ar(r1(v));
const pTxt=v=>v==null?'—':ar(Math.round(v))+'٪';
function seeded(seed){let h=1779033703^String(seed).length;for(const ch of String(seed)){h=Math.imul(h^ch.charCodeAt(0),3432918353);h=h<<13|h>>>19}return()=>{h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);h^=h>>>16;return(h>>>0)/4294967296}}
function sShuffle(a,rnd){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
const chipsHTML=(attr,list,cur)=>`<div class="chips">${list.map(([k,l,i])=>`<button type="button" class="chip" ${attr}="${k}" aria-pressed="${cur===k}">${i?ic(i):''}${l}</button>`).join('')}</div>`;
const asPct=(c,a,sid)=>{const v=(c.gr[a.id]||{})[sid];return v===undefined||v===''||isNaN(+v)?null:+v/(+a.max||1)*100};

/* ============ 1) parent communication ============ */
const PRT={period:'all'};
const DEF_PMSG='السلام عليكم ورحمة الله وبركاته\nولي أمر {الاسم} المحترم،\nنطمئنكم على مستوى {الاسم} في {الفصل}:\n• الحضور: {الحضور} (غياب {الغياب} يوم)\n• النقاط والتحفيز: {النقاط} نقطة · مستوى «{المستوى}»\n• متوسط الدرجات: {الدرجات}\n{ملاحظة}\nشاكرين تعاونكم،\nالمعلمة {المعلمة}';
function waPhone(p){let d=en(p||'').replace(/\D/g,'');if(d.startsWith('00'))d=d.slice(2);if(/^05\d{8}$/.test(d))d='966'+d.slice(1);else if(/^5\d{8}$/.test(d))d='966'+d;return d}
function parentMsg(c,s){const[f,to]=crRange(PRT.period),st=stuStats(c,s,f,to);
 const map={'الاسم':s.n,'الفصل':c.name,'الحضور':pctTxt(st.att),'الغياب':ar(st.a),'النقاط':ar(s.st|0),'المستوى':lvlOf(s.st|0)[1],'الدرجات':pctTxt(st.gp),'المعلمة':(ME.p&&ME.p.name)||'','ملاحظة':s.comment?'• ملاحظة المعلمة: '+s.comment:''};
 return String((ME.p&&ME.p.parentMsg)||DEF_PMSG).replace(/\{([^}]+)\}/g,(m,k)=>k in map?map[k]:m).replace(/\n{3,}/g,'\n\n').trim()}
function stuInsights(c,s,st){const good=[],need=[],R={};
 c.pl.filter(x=>x.s===s.id).forEach(x=>{R[x.r]=(R[x.r]||0)+x.n});
 if(st.att!=null&&st.att>=95)good.push('انتظام ممتاز في الحضور');
 if(st.gp!=null&&st.gp>=90)good.push('مستوى تحصيلي متميز');else if(st.gp!=null&&st.gp>=80)good.push('مستوى تحصيلي جيد جدًا');
 Object.entries(R).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]).slice(0,2).forEach(([r])=>good.push(WG('تتميز','يتميز')+' بـ: '+r));
 if(Object.values(s.b||{}).reduce((a,b)=>a+b,0)>=3)good.push('حصل'+WG('ت','')+' على شارات تقدير متعددة');
 if(st.att!=null&&st.att<85)need.push('متابعة الانتظام في الحضور');
 if(st.l>=3)need.push('الحضور في الوقت المحدد');
 if(st.gp!=null&&st.gp<65)need.push('دعم في التحصيل الدراسي ومراجعة الدروس في المنزل');
 Object.entries(R).filter(([,n])=>n<0).sort((a,b)=>a[1]-b[1]).slice(0,2).forEach(([r])=>need.push('متابعة: '+r));
 return{good,need}}
function parentReport(c,s){const[f,to]=crRange(PRT.period),st=stuStats(c,s,f,to),per={week:'آخر أسبوع',month:'آخر شهر',all:'الفصل الدراسي كاملًا'}[PRT.period];
 const days=crDays(c,f,to),abs=days.filter(d=>c.att[d][s.id]==='a'),late=days.filter(d=>c.att[d][s.id]==='l');
 const pl=c.pl.filter(x=>x.s===s.id&&(!f||x.d.slice(0,10)>=f)).slice(-12).reverse(),ins=stuInsights(c,s,st),bd=BADGES.filter(b=>(s.b||{})[b.k]);
 return `<div class="prep"><div class="prepH"><div><span class="prepK">تقرير ${STU()} لولي الأمر</span><h2>${esc(s.n)}</h2></div><table class="prepI"><tr><th>الفصل</th><td>${esc(c.name)}</td><th>المدرسة</th><td>${esc(ME.p.school||'—')}</td></tr><tr><th>المعلمة</th><td>${esc(ME.p.name||'')}</td><th>الفترة</th><td>${per}</td></tr></table></div>
 <div class="prepS">${[['الحضور',pctTxt(st.att)],['أيام الغياب',ar(st.a)],['التأخر',ar(st.l)],['مجموع النقاط',ar(s.st|0)],['المستوى',esc(lvlOf(s.st|0)[1])],['متوسط الدرجات',pctTxt(st.gp)]].map(([l,v])=>`<div><b>${v}</b><span>${l}</span></div>`).join('')}</div>
 ${ins.good.length||ins.need.length?`<div class="prepG"><div><h3>${ic('sparkles')}نقاط القوة</h3><ul>${ins.good.map(t=>`<li>${esc(t)}</li>`).join('')||'<li>—</li>'}</ul></div><div><h3>${ic('target')}نتعاون معكم في</h3><ul>${ins.need.map(t=>`<li>${esc(t)}</li>`).join('')||'<li>لا ملاحظات، استمروا على هذا المستوى</li>'}</ul></div></div>`:''}
 <h3>الدرجات والتقييمات</h3>${st.g.length?`<table class="crTbl"><tr><th>التقييم</th><th>النوع</th><th>الدرجة</th><th>النسبة</th><th>التقدير</th></tr>${st.g.map(x=>{const pc=x.v/(+x.a.max||1)*100;return `<tr><td>${esc(x.a.n)}</td><td>${esc(x.a.t||'')}</td><td>${ar(x.v)} من ${ar(x.a.max)}</td><td>${pTxt(pc)}</td><td>${gradeWord(pc)}</td></tr>`}).join('')}</table>`:'<p class="note">لا توجد درجات مسجلة بعد.</p>'}
 <h3>الحضور</h3><p>${['p','l','a','e'].map(k=>`<span class="attk st-${k}">${ATT[k][0]}: ${ar(st[k])}</span>`).join(' ')}</p>${abs.length?`<p class="note">أيام الغياب: ${abs.map(d=>esc(dayName(d)+' '+dayShort(d))).join('، ')}</p>`:''}${late.length?`<p class="note">أيام التأخر: ${late.map(d=>esc(dayShort(d))).join('، ')}</p>`:''}
 ${bd.length?`<h3>الشارات</h3><p>${bd.map(b=>`<span class="attk">${b.n} × ${ar(s.b[b.k])}</span>`).join(' ')}</p>`:''}
 ${pl.length?`<h3>آخر النقاط وأسبابها</h3><table class="crTbl"><tr><th>التاريخ</th><th>السبب</th><th>النقاط</th></tr>${pl.map(x=>`<tr><td>${esc(dayShort(x.d.slice(0,10)))}</td><td>${esc(x.r)}</td><td>${x.n>0?'+':''}${ar(x.n)}</td></tr>`).join('')}</table>`:''}
 ${(s.notes||[]).length?`<h3>ملاحظات المعلمة</h3><ul>${s.notes.slice(-6).reverse().map(n=>`<li>${esc(dayShort(n.d))}: ${esc(n.t)}</li>`).join('')}</ul>`:''}
 ${s.comment?`<h3>كلمة المعلمة</h3><p class="prepC">${esc(s.comment)}</p>`:''}
 <div class="prepSig"><div>توقيع المعلمة<span></span></div><div>توقيع ولي الأمر<span></span></div></div><div class="prepPar">ملاحظات ولي الأمر:<span></span><span></span></div></div>`}
function crParents(p,c){const S_=c.students,[f,to]=crRange(PRT.period);
 p.innerHTML=`<div class="crCard prTop"><div><h3>${ic('messages-square')}التواصل مع أولياء الأمور</h3><p class="note">تقرير كامل لكل ${STU()}: الحضور وأيام الغياب، والنقاط بأسبابها، والشارات، والدرجات، والملاحظات، ونقاط القوة وما يحتاج متابعة. اطبعيه أو احفظيه PDF، أو أرسلي ملخصه عبر واتساب.</p></div>
 <div class="acts">${chipsHTML('data-pper',[['week','آخر أسبوع'],['month','آخر شهر'],['all','الفصل كاملًا']],PRT.period)}<label class="lab inl">صيغة التقرير<select class="in" id="prG"><option value="f" ${GF()?'selected':''}>طالبات</option><option value="m" ${GF()?'':'selected'}>طلاب</option></select></label></div></div>
 <div class="crTblW"><table class="crTbl prTbl"><thead><tr><th>${STU()}</th><th>ولي الأمر</th><th>الجوال</th><th>الحضور</th><th>النقاط</th><th>الدرجات</th><th>آخر تواصل</th><th></th></tr></thead><tbody>${S_.map(s=>{const st=stuStats(c,s,f,to),pa=s.parent||{},lc=(s.contacts||[]).slice(-1)[0];return `<tr><td><button class="lk2" data-stu="${esc(s.id)}">${esc(s.n)}</button></td><td><input class="in sm" data-par="${esc(s.id)}" data-pf="name" value="${esc(pa.name||'')}" placeholder="الاسم" maxlength="40" aria-label="اسم ولي الأمر"></td><td><input class="in sm" dir="ltr" inputmode="tel" data-par="${esc(s.id)}" data-pf="phone" value="${esc(pa.phone||'')}" placeholder="05xxxxxxxx" maxlength="16" aria-label="جوال ولي الأمر"></td><td class="${st.att!=null&&st.att<80?'bad':''}">${pctTxt(st.att)}</td><td>⭐ ${ar(s.st|0)}</td><td>${pctTxt(st.gp)}</td><td>${lc?`<small>${esc(dayShort(lc.d))} · ${esc(lc.via)}</small>`:'<small class="note">—</small>'}</td><td class="crAct"><button class="btn pri sm" data-prep="${esc(s.id)}">${ic('file-text')}التقرير</button><button class="btn sec sm" data-pwa="${esc(s.id)}" aria-label="واتساب">${ic('message-circle')}واتساب</button><button class="ib" data-plog="${esc(s.id)}" aria-label="تسجيل تواصل" title="تسجيل تواصل (اتصال أو لقاء)">${ic('phone')}</button></td></tr>`}).join('')}</tbody></table></div>
 <div class="acts"><button class="btn pri" data-pall>${ic('printer')}طباعة تقارير الجميع (صفحة لكل ${STU()})</button><button class="btn sec" data-pcsv>${ic('file-spreadsheet')}تنزيل أرقام أولياء الأمور</button></div>
 <details class="crDet"><summary>${ic('pencil')}نص رسالة واتساب</summary><p class="note">الكلمات بين القوسين تُستبدل تلقائيًا: {الاسم} {الفصل} {الحضور} {الغياب} {النقاط} {المستوى} {الدرجات} {ملاحظة} {المعلمة}</p><textarea class="in" id="prMsg" rows="8">${esc((ME.p&&ME.p.parentMsg)||DEF_PMSG)}</textarea><div class="acts"><button class="btn sec sm" data-pmsgdef>${ic('rotate-ccw')}النص الافتراضي</button></div></details>`;
 p.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const c=crCls(),d=b.dataset;if(!c)return;
  if(d.pper){PRT.period=d.pper;return crPanel()}
  if(d.prep)return prepDialog(c,d.prep);
  if(d.pwa)return sendWA(c,d.pwa);
  if(d.plog)return contactDialog(c,d.plog);
  if(b.hasAttribute('data-pall')){printHTML(`تقارير أولياء الأمور · ${c.name}`,c.students.map((s,i)=>`<div class="${i?'pgb':''}">${parentReport(c,s)}</div>`).join(''));return}
  if(b.hasAttribute('data-pcsv'))return dlFile(`أولياء أمور ${safeName(c.name)}.csv`,csv([[STU(),'ولي الأمر','الجوال'],...c.students.map(s=>[s.n,(s.parent||{}).name||'',(s.parent||{}).phone||''])]),'text/csv;charset=utf-8');
  if(b.hasAttribute('data-pmsgdef')){ME.p.parentMsg='';await saveProfile();$('#prMsg').value=DEF_PMSG;toast('أُعيد النص الافتراضي')}};
 p.onchange=async e=>{const t=e.target,c=crCls();if(!c)return;
  if(t.id==='prG'){ME.p.gender=t.value;await saveProfile();return crPanel()}
  if(t.dataset.par){const s=c.students.find(x=>x.id===t.dataset.par);if(!s)return;s.parent=s.parent||{};s.parent[t.dataset.pf]=t.value.trim().slice(0,40);crSave();toast('حُفظ')}
  if(t.id==='prMsg'){ME.p.parentMsg=t.value.slice(0,1200);await saveProfile();toast('حُفظ نص الرسالة')}}}
function logContact(c,s,via,note){s.contacts=s.contacts||[];s.contacts.push({d:isoDay(),via,note:note||''});if(s.contacts.length>60)s.contacts=s.contacts.slice(-60);crSave()}
function sendWA(c,sid){const s=c.students.find(x=>x.id===sid);if(!s)return;const ph=waPhone((s.parent||{}).phone);
 window.open(`https://wa.me/${ph}?text=${encodeURIComponent(parentMsg(c,s))}`,'_blank','noopener');logContact(c,s,'واتساب');if(!ph)toast('لا يوجد رقم، اختاري جهة الاتصال من واتساب');setTimeout(crPanel,300)}
function prepDialog(c,sid){const s=c.students.find(x=>x.id===sid);if(!s)return;
 const d=openDialog(`<div class="prepBox">${parentReport(c,s)}</div><label class="lab">كلمة المعلمة في التقرير (اختياري)<textarea class="in" id="prCom" rows="2" maxlength="300" placeholder="مثال: ${WG('ابنتكم','ابنكم')} مجتهد${WG('ة','')} ومتعاون${WG('ة','')}، ونتمنى مزيدًا من القراءة في المنزل">${esc(s.comment||'')}</textarea></label>
 <div class="acts"><button class="btn pri" data-pp>${ic('printer')}طباعة أو حفظ PDF</button><button class="btn sec" data-pw>${ic('message-circle')}إرسال الملخص واتساب</button><button class="btn ter" data-pc>${ic('copy')}نسخ الملخص</button></div>`,{wide:1,focus:false});
 const sync=()=>{const v=$('#prCom',d).value.trim().slice(0,300);if(v!==(s.comment||'')){s.comment=v;crSave()}};
 $('#prCom',d).onchange=()=>{sync();$('.prepBox',d).innerHTML=parentReport(c,s);icons()};
 d.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;sync();
  if(b.hasAttribute('data-pp')){logContact(c,s,'تقرير مطبوع');printHTML(`تقرير ${STU()}: ${s.n}`,parentReport(c,s))}
  if(b.hasAttribute('data-pw'))sendWA(c,sid);
  if(b.hasAttribute('data-pc')){try{await navigator.clipboard.writeText(parentMsg(c,s));toast('نُسخ الملخص')}catch(err){toast('تعذّر النسخ')}}})}
function contactDialog(c,sid){const s=c.students.find(x=>x.id===sid);if(!s)return;const L=(s.contacts||[]).slice().reverse();
 const d=openDialog(`<h2 class="dh">سجل التواصل · ${esc(s.n)}</h2><form class="crRf prCf"><select class="in" id="pcV"><option>اتصال هاتفي</option><option>لقاء في المدرسة</option><option>رسالة</option><option>واتساب</option></select><input class="in" id="pcN" placeholder="ملخص التواصل (اختياري)" maxlength="120"><button class="btn pri">تسجيل</button></form><ol class="crList">${L.map(x=>`<li><span>${esc(x.via)}${x.note?' · '+esc(x.note):''}</span><time>${esc(dayShort(x.d))}</time></li>`).join('')||'<li class="note">لا يوجد تواصل مسجّل.</li>'}</ol>`,{focus:false});
 $('form',d).onsubmit=e=>{e.preventDefault();logContact(c,s,$('#pcV',d).value,$('#pcN',d).value.trim());closeDialog(d);toast('سُجّل التواصل');crPanel()}}

/* ============ 2) exam services ============ */
const EX={sec:'build',cur:null,as:null,mast:80,seatT:'',seatO:'az',seatN:1};
const QT={mcq:['اختيار من متعدد','list-checks'],tf:['صح أو خطأ','circle-check'],fill:['أكمل الفراغ','text-cursor-input'],open:['سؤال مقالي','align-right']};
const qSecTitle=t=>({mcq:WG('اختاري الإجابة الصحيحة','اختر الإجابة الصحيحة'),tf:WG('ضعي علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام الخاطئة','ضع علامة (✓) أمام العبارة الصحيحة وعلامة (✗) أمام الخاطئة'),fill:WG('أكملي الفراغات بالكلمة المناسبة','أكمل الفراغات بالكلمة المناسبة'),open:WG('أجيبي عن الأسئلة الآتية','أجب عن الأسئلة الآتية')})[t];
const newQ=t=>({id:uid(),t,q:'',o:t==='mcq'?['','','','']:[],a:t==='tf'?'1':t==='mcq'?0:'',pts:1,lines:3});
const exTotal=x=>x.qs.reduce((a,q)=>a+(num(q.pts)||0),0);
const curEx=c=>(c.exams||[]).find(x=>x.id===EX.cur)||null;
function crExams(p,c){c.exams=c.exams||[];
 const top=chipsHTML('data-xsec',[['build','ورقة الاختبار','file-text'],['analysis','تحليل النتائج','chart-column'],['seats','أرقام الجلوس','hash'],['timer','مؤقت الاختبار','timer']],EX.sec);
 p.innerHTML=`<div class="acts">${top}</div><div id="exBody"></div>`;exBody(c);
 p.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const c=crCls(),d=b.dataset;if(!c)return;
  if(d.xsec){EX.sec=d.xsec;if(d.xsec!=='build')EX.cur=null;return crPanel()}
  if(b.hasAttribute('data-xnew')){const x={id:uid(),title:'اختبار '+(c.lesson||'قصير'),subj:'',grade:c.name,dur:30,ins:'',qs:[newQ('mcq')],created:new Date().toISOString()};c.exams.push(x);EX.cur=x.id;crSave();return exBody(c)}
  if(d.xopen){EX.cur=d.xopen;return exBody(c)}
  if(d.xdup){const s=c.exams.find(x=>x.id===d.xdup);const x=clone(s);x.id=uid();x.title=s.title+' (نسخة)';delete x.asId;x.qs.forEach(q=>q.id=uid());c.exams.push(x);crSave();return exBody(c)}
  if(d.xdel){const s=c.exams.find(x=>x.id===d.xdel);if(!await confirmBox(`حذف «${s.title}»؟`,'احذفي'))return;c.exams=c.exams.filter(x=>x!==s);crSave();return exBody(c)}
  if(b.hasAttribute('data-xback')){EX.cur=null;return exBody(c)}
  const x=curEx(c);
  if(x&&d.xadd){x.qs.push(newQ(d.xadd));crSave();exBody(c);const all=$$('.exQ');all[all.length-1]?.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(x&&d.xqdel){x.qs=x.qs.filter(q=>q.id!==d.xqdel);crSave();return exBody(c)}
  if(x&&(d.xup||d.xdn)){const i=x.qs.findIndex(q=>q.id===(d.xup||d.xdn)),j=i+(d.xup?-1:1);if(j<0||j>=x.qs.length)return;[x.qs[i],x.qs[j]]=[x.qs[j],x.qs[i]];crSave();return exBody(c)}
  if(x&&d.xprint){if(!x.qs.length)return toast('أضيفي أسئلة أولًا');const v=d.xprint;return v==='key'?printHTML(`نموذج الإجابة · ${x.title}`,examKey(x,'A')+'<div class="pgb"></div>'+examKey(x,'B')):printHTML(x.title,examPaper(x,v))}
  if(x&&b.hasAttribute('data-xtoas')){if(x.asId&&c.as.some(a=>a.id===x.asId))return toast('هذا الاختبار مضاف لجدول الدرجات');const a={id:uid(),n:x.title.slice(0,50),t:'اختبار',max:exTotal(x)||10,date:isoDay()};c.as.push(a);x.asId=a.id;crSave();toast('أُضيف إلى جدول الدرجات، سجّلي الدرجات من تبويب «الدرجات»');return exBody(c)}
  if(d.xan){EX.as=d.xan;return exBody(c)}
  if(b.hasAttribute('data-anprint')){const a=c.as.find(x=>x.id===EX.as);return printHTML(`تحليل نتائج: ${a.n}`,$('#anRep').innerHTML)}
  if(b.hasAttribute('data-ancsv')){const a=c.as.find(x=>x.id===EX.as);return dlFile(`تحليل ${safeName(a.n)}.csv`,csv([[STU(),'الدرجة','من','النسبة','التقدير'],...c.students.map(s=>{const v=asPct(c,a,s.id);return[s.n,v==null?'':(c.gr[a.id]||{})[s.id],a.max,v==null?'':Math.round(v)+'%',v==null?'لم يختبر':gradeWord(v)]})]),'text/csv;charset=utf-8')}
  if(b.hasAttribute('data-seatcards'))return printHTML(`بطاقات أرقام الجلوس · ${EX.seatT||c.name}`,seatCards(c));
  if(b.hasAttribute('data-seatlist'))return printHTML(`كشف ${EX.seatT||'الاختبار'} · ${c.name}`,seatList(c));
  if(b.hasAttribute('data-tstart'))return examTimer(Math.max(1,Math.min(300,Math.round(num($('#tMin').value))||30)),$('#tTitle').value.trim())};
 p.oninput=e=>{const t=e.target,c=crCls(),x=c&&curEx(c);if(!x)return;
  if(t.dataset.xm){x[t.dataset.xm]=t.dataset.xm==='dur'?Math.max(1,Math.round(num(t.value))||30):t.value.slice(0,t.dataset.xm==='ins'?300:80);crSave();if(t.dataset.xm==='title'){const h=$('#exHT');if(h)h.textContent=x.title||'اختبار'}return}
  if(t.dataset.xq){const q=x.qs.find(y=>y.id===t.dataset.xq);if(!q)return;const f=t.dataset.f;
   if(f==='q')q.q=t.value.slice(0,400);else if(f==='pts'){q.pts=Math.max(0,Math.min(100,num(t.value)));const tt=$('#exTot');if(tt)tt.textContent=ar(exTotal(x))}else if(f==='a')q.a=t.value.slice(0,120);else if(f==='lines')q.lines=Math.max(1,Math.min(12,Math.round(num(t.value))||3));else if(f.startsWith('o'))q.o[+f.slice(1)]=t.value.slice(0,120);crSave()}};
 p.onchange=e=>{const t=e.target,c=crCls();if(!c)return;const x=curEx(c);
  if(x&&t.dataset.xans){const q=x.qs.find(y=>y.id===t.dataset.xans);if(q){q.a=q.t==='mcq'?+t.value:t.value;crSave()}return}
  if(t.id==='anSel'){EX.as=t.value;return exBody(c)}
  if(t.id==='anM'){EX.mast=Math.max(1,Math.min(100,Math.round(num(t.value))||80));return exBody(c)}
  if(t.id==='seatT'){EX.seatT=t.value.trim().slice(0,60)}
  if(t.id==='seatO'){EX.seatO=t.value}
  if(t.id==='seatN'){EX.seatN=Math.max(1,Math.round(num(t.value))||1)}}}
function exBody(c){const b=$('#exBody');if(!b)return;({build:exBuild,analysis:exAnalysis,seats:exSeats,timer:exTimerV})[EX.sec](b,c);icons()}
function exBuild(b,c){const x=curEx(c);
 if(!x){b.innerHTML=`<div class="crCard"><h3>أوراق الاختبارات</h3><p class="note">ابني ورقة الاختبار بأسئلتك، وتطلع جاهزة للطباعة بترويسة المدرسة، مع نموذج ثانٍ بترتيب مختلف لمنع الغش، ونموذج إجابة للتصحيح.</p>
  ${c.exams.length?`<ol class="crList exList">${c.exams.slice().reverse().map(x=>`<li><button class="lk2" data-xopen="${esc(x.id)}">${esc(x.title||'اختبار')}</button><small class="note">${ar(x.qs.length)} سؤال · ${ar(exTotal(x))} درجة</small><span class="crAct"><button class="ib" data-xdup="${esc(x.id)}" aria-label="نسخ" title="نسخة">${ic('copy')}</button><button class="ib" data-xdel="${esc(x.id)}" aria-label="حذف">${ic('trash-2')}</button></span></li>`).join('')}</ol>`:''}
  <div class="acts"><button class="btn pri" data-xnew>${ic('plus')}اختبار جديد</button></div></div>`;return}
 const qn=t=>x.qs.filter(q=>q.t===t).length;
 b.innerHTML=`<div class="exHead"><button class="btn ter sm" data-xback>${ic('arrow-right')}كل الاختبارات</button><h3 id="exHT">${esc(x.title||'اختبار')}</h3><span class="bd y">المجموع: <b id="exTot">${ar(exTotal(x))}</b> درجة</span></div>
 <div class="crCard exMeta"><label class="lab">عنوان الاختبار<input class="in" data-xm="title" value="${esc(x.title)}" maxlength="80"></label><label class="lab">المادة<input class="in" data-xm="subj" value="${esc(x.subj)}" maxlength="80" placeholder="لغتي"></label><label class="lab">الصف<input class="in" data-xm="grade" value="${esc(x.grade)}" maxlength="80"></label><label class="lab">الزمن (دقيقة)<input class="in" type="number" min="1" data-xm="dur" value="${x.dur}"></label><label class="lab exWide">تعليمات (اختياري)<input class="in" data-xm="ins" value="${esc(x.ins||'')}" maxlength="300" placeholder="${WG('اقرئي','اقرأ')} الأسئلة جيدًا قبل الإجابة"></label></div>
 <div class="exQs">${x.qs.map((q,i)=>exQHTML(q,i,x.qs.length)).join('')||'<p class="note">أضيفي أول سؤال من الأزرار بالأسفل.</p>'}</div>
 <div class="exAdd"><span class="note">أضيفي سؤال:</span>${Object.entries(QT).map(([k,[l,i]])=>`<button class="btn sec sm" data-xadd="${k}">${ic(i)}${l}${qn(k)?` (${ar(qn(k))})`:''}</button>`).join('')}</div>
 <div class="acts exOut"><button class="btn pri" data-xprint="A">${ic('printer')}طباعة النموذج (أ)</button><button class="btn sec" data-xprint="B">${ic('shuffle')}النموذج (ب) بترتيب مختلف</button><button class="btn sec" data-xprint="key">${ic('key-round')}نموذج الإجابة</button><button class="btn ter" data-xtoas>${ic('table-2')}${x.asId&&c.as.some(a=>a.id===x.asId)?'مضاف لجدول الدرجات':'أضيفيه لجدول الدرجات'}</button></div>`}
function exQHTML(q,i,n){const nm='xa_'+q.id;let body='';
 if(q.t==='mcq')body=`<div class="exOpts">${q.o.map((o,k)=>`<label class="exOpt"><input type="radio" name="${nm}" value="${k}" data-xans="${esc(q.id)}" ${+q.a===k?'checked':''} aria-label="الإجابة الصحيحة"><span>${'أبجد'[k]}</span><input class="in sm" data-xq="${esc(q.id)}" data-f="o${k}" value="${esc(o)}" placeholder="الخيار ${'أبجد'[k]}" maxlength="120"></label>`).join('')}</div><p class="note">حدّدي الدائرة أمام الإجابة الصحيحة.</p>`;
 if(q.t==='tf')body=`<div class="chips">${[['1','صح ✓'],['0','خطأ ✗']].map(([v,l])=>`<label class="exOpt"><input type="radio" name="${nm}" value="${v}" data-xans="${esc(q.id)}" ${String(q.a)===v?'checked':''}>${l}</label>`).join('')}</div>`;
 if(q.t==='fill')body=`<label class="lab">الإجابة (لنموذج الإجابة)<input class="in sm" data-xq="${esc(q.id)}" data-f="a" value="${esc(q.a)}" maxlength="120"></label><p class="note">اكتبي ثلاث نقاط ... أو شرطات ___ مكان الفراغ في نص السؤال.</p>`;
 if(q.t==='open')body=`<div class="exRow"><label class="lab inl">عدد أسطر الإجابة<input class="in sm" type="number" min="1" max="12" data-xq="${esc(q.id)}" data-f="lines" value="${q.lines|0||3}"></label><label class="lab inl grow">الإجابة النموذجية (اختياري)<input class="in sm" data-xq="${esc(q.id)}" data-f="a" value="${esc(q.a)}" maxlength="120"></label></div>`;
 return `<article class="crCard exQ"><div class="exQh"><span class="bd">${ar(i+1)} · ${QT[q.t][0]}</span><label class="lab inl">الدرجة<input class="in sm exPts" type="number" min="0" step="0.5" data-xq="${esc(q.id)}" data-f="pts" value="${q.pts}"></label><span class="crAct"><button class="ib" data-xup="${esc(q.id)}" aria-label="أعلى" ${i?'':'disabled'}>${ic('arrow-up')}</button><button class="ib" data-xdn="${esc(q.id)}" aria-label="أسفل" ${i<n-1?'':'disabled'}>${ic('arrow-down')}</button><button class="ib" data-xqdel="${esc(q.id)}" aria-label="حذف السؤال">${ic('trash-2')}</button></span></div>
 <textarea class="in" rows="2" data-xq="${esc(q.id)}" data-f="q" placeholder="نص السؤال" maxlength="400">${esc(q.q)}</textarea>${body}</article>`}
function examOrder(x,ver){const rnd=seeded(x.id+ver),secs=['mcq','tf','fill','open'].map(t=>{let qs=x.qs.filter(q=>q.t===t);if(ver==='B'){qs=sShuffle(qs,rnd).map(q=>{if(q.t!=='mcq')return q;const idx=sShuffle(q.o.map((_,k)=>k).filter(k=>String(q.o[k]).trim()),rnd);return{...q,o:idx.map(k=>q.o[k]),a:idx.indexOf(+q.a)}})}else qs=qs.map(q=>q.t==='mcq'?(()=>{const idx=q.o.map((_,k)=>k).filter(k=>String(q.o[k]).trim());return{...q,o:idx.map(k=>q.o[k]),a:idx.indexOf(+q.a)}})():q);return{t,qs}}).filter(s=>s.qs.length);return secs}
const fillQ=s=>esc(s).replace(/(\.{3,}|…+|_{2,})/g,'<span class="exBl"></span>');
function examPaper(x,ver){const secs=examOrder(x,ver),tot=exTotal(x);let n=0;
 return `<table class="crTbl exHdr"><tr><th>المدرسة</th><td>${esc(ME.p.school||'')}</td><th>المادة</th><td>${esc(x.subj||'')}</td><th>الزمن</th><td>${ar(x.dur)} دقيقة</td></tr><tr><th>اسم ${STU()}</th><td colspan="3"></td><th>الصف</th><td>${esc(x.grade||'')}</td></tr><tr><th>المعلمة</th><td>${esc(ME.p.name||'')}</td><th>النموذج</th><td>${ver==='B'?'(ب)':'(أ)'}</td><th>الدرجة</th><td>&nbsp;&nbsp;&nbsp;&nbsp; من ${ar(tot)}</td></tr></table>
 ${x.ins?`<p class="exIns">${esc(x.ins)}</p>`:''}
 ${secs.map((s,si)=>`<section class="exSec"><h2>السؤال ${ORD[si]||ar(si+1)}: ${qSecTitle(s.t)} <small>(${ar(s.qs.reduce((a,q)=>a+(num(q.pts)||0),0))} درجة)</small></h2><ol>${s.qs.map(q=>{n++;
  if(q.t==='mcq')return `<li><p>${esc(q.q)}</p><div class="exPO">${q.o.map((o,k)=>`<span>${'أبجد'[k]}) ${esc(o)}</span>`).join('')}</div></li>`;
  if(q.t==='tf')return `<li class="exTF"><span class="exBox">(&nbsp;&nbsp;&nbsp;&nbsp;)</span><p>${esc(q.q)}</p></li>`;
  if(q.t==='fill')return `<li><p>${/(\.{3,}|…|_{2,})/.test(q.q)?fillQ(q.q):esc(q.q)+' <span class="exBl"></span>'}</p></li>`;
  return `<li><p>${esc(q.q)}</p>${'<div class="exLn"></div>'.repeat(q.lines|0||3)}</li>`}).join('')}</ol></section>`).join('')}
 <p class="exEnd">انتهت الأسئلة · ${WG('بالتوفيق يا بطلة','بالتوفيق يا بطل')}</p>`}
function examKey(x,ver){const secs=examOrder(x,ver);return `<h2>نموذج الإجابة ${ver==='B'?'(ب)':'(أ)'} · ${esc(x.title)}</h2>${secs.map((s,si)=>`<h3>السؤال ${ORD[si]||ar(si+1)}: ${QT[s.t][0]}</h3><table class="crTbl"><tr><th>#</th><th>السؤال</th><th>الإجابة</th><th>الدرجة</th></tr>${s.qs.map((q,i)=>`<tr><td>${ar(i+1)}</td><td>${esc(q.q)}</td><td><b>${q.t==='mcq'?(q.a>=0?`${'أبجد'[q.a]}) ${esc(q.o[q.a])}`:'—'):q.t==='tf'?(String(q.a)==='1'?'صح ✓':'خطأ ✗'):esc(q.a||'—')}</b></td><td>${ar(q.pts)}</td></tr>`).join('')}</table>`).join('')}`}
function exAnalysis(b,c){if(!c.as.length){b.innerHTML=`<div class="empty sm">${ic('table-2')}<h3>لا توجد تقييمات بعد</h3><p class="note">أضيفي اختبارًا في تبويب «الدرجات» وسجّلي الدرجات، أو ابني ورقة اختبار ثم «أضيفيه لجدول الدرجات».</p></div>`;return}
 const a=c.as.find(x=>x.id===EX.as)||c.as[c.as.length-1];EX.as=a.id;
 const rows=c.students.map(s=>({s,v:asPct(c,a,s.id),raw:(c.gr[a.id]||{})[s.id]})),got=rows.filter(r=>r.v!=null),P=got.map(r=>r.v),R=got.map(r=>+r.raw);
 const bands=[['ممتاز','٩٠ فأعلى',v=>v>=90,'#16a34a'],['جيد جدًا','٨٠–٨٩',v=>v>=80&&v<90,'#0284c7'],['جيد','٦٥–٧٩',v=>v>=65&&v<80,'#ca8a04'],['مقبول','٥٠–٦٤',v=>v>=50&&v<65,'#ea580c'],['يحتاج دعمًا','أقل من ٥٠',v=>v<50,'#dc2626']].map(([l,r,f,col])=>({l,r,col,n:P.filter(f).length}));
 const low=got.filter(r=>r.v<EX.mast).sort((x,y)=>x.v-y.v),hi=got.filter(r=>r.v>=90).sort((x,y)=>y.v-x.v),miss=rows.filter(r=>r.v==null),mx=Math.max(1,...bands.map(x=>x.n));
 b.innerHTML=`<div class="exRow"><label class="lab inl grow">التقييم<select class="in" id="anSel">${c.as.map(x=>`<option value="${esc(x.id)}" ${x.id===a.id?'selected':''}>${esc(x.n)} · من ${ar(x.max)}</option>`).join('')}</select></label><label class="lab inl">حد الإتقان ٪<input class="in sm" type="number" id="anM" min="1" max="100" value="${EX.mast}"></label></div>
 ${got.length?`<div id="anRep"><h3>${esc(a.n)} · ${esc(c.name)}</h3><div class="mtop">${[['المختبرون',`${ar(got.length)} من ${ar(rows.length)}`],['المتوسط',`${nTxt(mean(R))} (${pTxt(mean(P))})`],['الوسيط',nTxt(median(R))],['أعلى درجة',nTxt(Math.max(...R))],['أدنى درجة',nTxt(Math.min(...R))],['الانحراف المعياري',nTxt(sdev(R))],['نسبة النجاح',pTxt(P.filter(v=>v>=50).length/P.length*100)],[`نسبة الإتقان (${ar(EX.mast)}٪)`,pTxt(P.filter(v=>v>=EX.mast).length/P.length*100)]].map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
 <div class="crCard"><h3>توزيع المستويات</h3><div class="anBands">${bands.map(x=>`<div class="anB"><span>${x.l}<small>${x.r}</small></span><i style="width:${Math.round(x.n/mx*100)}%;background:${x.col}"></i><b>${ar(x.n)}</b></div>`).join('')}</div></div>
 <div class="crGrid"><div class="crCard"><h3>${ic('life-buoy')}خطة علاجية (أقل من ${ar(EX.mast)}٪)</h3>${low.length?`<ol class="crList">${low.map(r=>`<li><span>${esc(r.s.n)}</span><b class="bad">${pTxt(r.v)}</b></li>`).join('')}</ol>`:'<p class="note">الجميع وصل حد الإتقان.</p>'}</div><div class="crCard"><h3>${ic('rocket')}إثراء (٩٠٪ فأعلى)</h3>${hi.length?`<ol class="crList">${hi.map(r=>`<li><span>${esc(r.s.n)}</span><b>${pTxt(r.v)}</b></li>`).join('')}</ol>`:'<p class="note">لا أحد بعد.</p>'}</div>${miss.length?`<div class="crCard"><h3>${ic('user-x')}لم ${WG('يختبرن','يختبروا')} بعد</h3><ol class="crList">${miss.map(r=>`<li><span>${esc(r.s.n)}</span></li>`).join('')}</ol></div>`:''}</div></div>
 <div class="acts"><button class="btn pri" data-anprint>${ic('printer')}طباعة التحليل</button><button class="btn sec" data-ancsv>${ic('file-spreadsheet')}تنزيل Excel</button></div>`:'<p class="note">لم تُسجّل درجات لهذا التقييم بعد. سجّليها من تبويب «الدرجات».</p>'}`}
function seatOrder(c){const L=c.students.slice();if(EX.seatO==='az')L.sort((a,b)=>String(a.n).localeCompare(String(b.n),'ar'));return L.map((s,i)=>({s,no:EX.seatN+i}))}
function exSeats(b,c){if(!EX.seatT)EX.seatT=((c.exams||[]).slice(-1)[0]||{}).title||'';
 b.innerHTML=`<div class="crCard"><h3>أرقام الجلوس</h3><p class="note">بطاقات تُلصق على الطاولات، وكشف بالأرقام وعمود لتوقيع الحضور.</p><div class="exRow"><label class="lab inl grow">اسم الاختبار<input class="in" id="seatT" value="${esc(EX.seatT)}" placeholder="اختبار نهاية الوحدة" maxlength="60"></label><label class="lab inl">الترتيب<select class="in" id="seatO"><option value="az" ${EX.seatO==='az'?'selected':''}>أبجدي</option><option value="list" ${EX.seatO==='list'?'selected':''}>حسب القائمة</option></select></label><label class="lab inl">يبدأ من الرقم<input class="in sm" type="number" id="seatN" min="1" value="${EX.seatN}"></label></div>
 <div class="acts"><button class="btn pri" data-seatcards>${ic('printer')}طباعة البطاقات</button><button class="btn sec" data-seatlist>${ic('clipboard-list')}طباعة الكشف</button></div></div>`}
const seatCards=c=>`<div class="seatG">${seatOrder(c).map(({s,no})=>`<div class="seatC"><small>${esc(EX.seatT||'الاختبار')}</small><b>${ar(no)}</b><span>${esc(s.n)}</span><em>${esc(c.name)}</em></div>`).join('')}</div>`;
const seatList=c=>`<table class="crTbl"><tr><th>رقم الجلوس</th><th>اسم ${STU()}</th><th>الحضور</th><th>التوقيع</th></tr>${seatOrder(c).map(({s,no})=>`<tr><td>${ar(no)}</td><td>${esc(s.n)}</td><td></td><td></td></tr>`).join('')}</table>`;
function exTimerV(b,c){const x=(c.exams||[]).slice(-1)[0];b.innerHTML=`<div class="crCard"><h3>مؤقت الاختبار على الشاشة</h3><p class="note">اعرضيه على السبورة: أرقام كبيرة، ويتلوّن عند آخر ٥ دقائق، وينبّه عند انتهاء الوقت.</p><div class="exRow"><label class="lab inl grow">العنوان<input class="in" id="tTitle" value="${esc(x?x.title:'اختبار')}" maxlength="60"></label><label class="lab inl">المدة (دقيقة)<input class="in sm" type="number" id="tMin" min="1" max="300" value="${x?x.dur:30}"></label></div><div class="acts"><button class="btn pri lg" data-tstart>${ic('play')}ابدئي المؤقت</button></div></div>`}
function examTimer(min,title){let left=min*60,run=true,last=Date.now(),warned=false;
 const d=openDialog(`<div class="exT" id="exT"><p class="exTt">${esc(title||'الاختبار')}</p><div class="exTd" id="exTd"></div><div class="lvb exTb"><i id="exTb"></i></div><p class="note" id="exTs">الوقت المتبقي</p><div class="acts"><button class="btn sec" data-tp>${ic('pause')}إيقاف مؤقت</button><button class="btn sec" data-t5>${ic('plus')}٥ دقائق</button><button class="btn ter" data-tf>${ic('maximize')}ملء الشاشة</button></div></div>`,{wide:1,focus:false,onClose:()=>{clearInterval(iv);try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}}});
 const total=()=>Math.max(min*60,1),paint=()=>{const m=Math.floor(left/60),s=left%60;$('#exTd',d).textContent=ar(pad2(m))+':'+ar(pad2(s));$('#exTb',d).style.width=Math.max(0,left/total()*100)+'%';const box=$('#exT',d);box.classList.toggle('warn',left<=300&&left>60);box.classList.toggle('late',left<=60)};
 const iv=setInterval(()=>{const now=Date.now();if(run){const dt=Math.floor((now-last)/1000);if(dt>=1){left=Math.max(0,left-dt);last+=dt*1000;if(left<=300&&!warned){warned=true;sfx('tick');$('#exTs',d).textContent='باقي ٥ دقائق'}if(!left){run=false;sfx('end');$('#exTs',d).textContent='انتهى الوقت';$('#exT',d).classList.add('done')}paint()}}else last=now},250);
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-tp')){run=!run;last=Date.now();b.innerHTML=run?ic('pause')+'إيقاف مؤقت':ic('play')+'متابعة';icons()}if(b.hasAttribute('data-t5')){left+=300;min+=5;warned=left<=300;run=true;$('#exT',d).classList.remove('done');$('#exTs',d).textContent='الوقت المتبقي';paint()}if(b.hasAttribute('data-tf')){try{$('.dbox',d).requestFullscreen()}catch(err){}}});paint()}

/* ============ 3) impact measurement ============ */
const IM={pre:null,post:null,start:''};
function crImpact(p,c){
 if(c.as.length<2){p.innerHTML=`<div class="empty">${ic('trending-up')}<h2>قياس الأثر</h2><p class="lead">قارني نتائج طلابك قبل تطبيق استراتيجية أو برنامج علاجي وبعده، وتطلع لك نسبة التحسن وحجم الأثر وتقرير جاهز لملف الإنجاز.</p><p class="note">تحتاجين تقييمين: قبلي وبعدي.</p><button class="btn pri" data-imk>${ic('plus')}أنشئي اختبارًا قبليًا وبعديًا</button></div>`;
  p.onclick=e=>{const b=e.target.closest('[data-imk]');if(!b)return;const c=crCls();[['اختبار قبلي','pre'],['اختبار بعدي','post']].forEach(([n,k])=>{const a={id:uid(),n,t:'اختبار',max:10,date:isoDay()};c.as.push(a);IM[k]=a.id});crSave();toast('أُضيف التقييمان، سجّلي الدرجات من تبويب «الدرجات»');crPanel()};return}
 const A=c.as,pre=A.find(a=>a.id===IM.pre)||A.find(a=>/قبلي/.test(a.n))||A[0],post=A.find(a=>a.id===IM.post)||A.find(a=>/بعدي/.test(a.n)&&a!==pre)||A[A.length-1];IM.pre=pre.id;IM.post=post.id;
 const rows=c.students.map(s=>({s,a:asPct(c,pre,s.id),b:asPct(c,post,s.id)})).filter(r=>r.a!=null&&r.b!=null).map(r=>({...r,d:r.b-r.a}));
 const D=rows.map(r=>r.d),mA=mean(rows.map(r=>r.a)),mB=mean(rows.map(r=>r.b)),sd=sdev(D),es=sd?mean(D)/sd:null,g=mA!=null&&mA<100?(mB-mA)/(100-mA):null;
 const up=rows.filter(r=>r.d>0).length,eq=rows.filter(r=>r.d===0).length,dn=rows.filter(r=>r.d<0).length,mast=v=>rows.length?rows.filter(r=>v(r)>=EX.mast).length/rows.length*100:null;
 const esW=es==null?'—':Math.abs(es)>=.8?'كبير':Math.abs(es)>=.5?'متوسط':Math.abs(es)>=.2?'صغير':'ضعيف جدًا';
 const verdict=!rows.length?'':mean(D)>0?`ارتفع متوسط ${WG('الطالبات','الطلاب')} من ${pTxt(mA)} إلى ${pTxt(mB)} بزيادة ${nTxt(mean(D))} نقطة مئوية، وتحسّن ${ar(up)} من ${ar(rows.length)}، وحجم الأثر ${esW}${es!=null?` (d = ${ar(r1(es))})`:''}.`:mean(D)<0?`انخفض المتوسط من ${pTxt(mA)} إلى ${pTxt(mB)}. راجعي الاستراتيجية أو صعوبة الاختبار البعدي.`:'لم يتغير المتوسط بين القياسين.';
 const [ab,aa]=impWin(c);
 p.innerHTML=`<div class="crCard"><div class="exRow"><label class="lab inl grow">الاستراتيجية أو البرنامج المطبّق<input class="in" id="imT" value="${esc(c.impTitle||'')}" maxlength="80" placeholder="مثال: التعلم باللعب في درس الجمع"></label><label class="lab inl">القياس القبلي<select class="in" id="imPre">${A.map(a=>`<option value="${esc(a.id)}" ${a===pre?'selected':''}>${esc(a.n)}</option>`).join('')}</select></label><label class="lab inl">القياس البعدي<select class="in" id="imPost">${A.map(a=>`<option value="${esc(a.id)}" ${a===post?'selected':''}>${esc(a.n)}</option>`).join('')}</select></label></div></div>
 ${pre===post?'<p class="note bad">اختاري تقييمين مختلفين.</p>':!rows.length?`<p class="note">لا يوجد ${WG('طالبات لهن','طلاب لهم')} درجة في التقييمين معًا. سجّلي الدرجات من تبويب «الدرجات».</p>`:`<div id="imRep"><h3>تقرير قياس الأثر${c.impTitle?': '+esc(c.impTitle):''}</h3><p class="note">${esc(c.name)} · القبلي: ${esc(pre.n)} · البعدي: ${esc(post.n)} · ${ar(rows.length)} ${STU()}</p>
 <div class="mtop">${[['متوسط القبلي',pTxt(mA)],['متوسط البعدي',pTxt(mB)],['متوسط التحسن',(mean(D)>0?'+':'')+nTxt(mean(D))+' نقطة'],['نسبة من تحسّن',pTxt(up/rows.length*100)],['حجم الأثر',esW+(es!=null?` · ${ar(r1(es))}`:'')],['الكسب المعياري',g==null?'—':ar(r1(g*100))+'٪'],[`الإتقان قبل (${ar(EX.mast)}٪)`,pTxt(mast(r=>r.a))],['الإتقان بعد',pTxt(mast(r=>r.b))]].map(([l,v])=>`<div class="stat"><b>${v}</b><span>${l}</span></div>`).join('')}</div>
 <p class="imV">${ic('lightbulb')}${verdict}</p>
 <div class="crCard"><h3>قبل وبعد لكل ${STU()}</h3><div class="imLg"><span><i class="imA"></i>قبلي</span><span><i class="imB"></i>بعدي</span></div><div class="imRows">${rows.slice().sort((x,y)=>y.d-x.d).map(r=>`<div class="imR"><span class="imN">${esc(r.s.n)}</span><div class="imBars"><i class="imA" style="width:${Math.max(1,r.a)}%"></i><i class="imB" style="width:${Math.max(1,r.b)}%"></i></div><b class="${r.d<0?'bad':r.d>0?'ok':''}">${r.d>0?'+':''}${ar(Math.round(r.d))}</b></div>`).join('')}</div><p class="note">تحسّن: ${ar(up)} · ثبات: ${ar(eq)} · تراجع: ${ar(dn)}</p></div>
 ${ab&&aa?`<div class="crCard"><h3>الأثر على الحضور والتحفيز</h3><p class="note">مقارنة ${ar(ab.n)} يوم قبل تاريخ البدء بـ ${ar(aa.n)} يوم بعده.</p><table class="crTbl"><tr><th></th><th>قبل</th><th>بعد</th></tr><tr><td>نسبة الحضور</td><td>${pTxt(ab.att)}</td><td>${pTxt(aa.att)}</td></tr><tr><td>متوسط النقاط لكل ${STU()} يوميًا</td><td>${nTxt(ab.pts)}</td><td>${nTxt(aa.pts)}</td></tr></table></div>`:''}</div>
 <div class="exRow"><label class="lab inl">تاريخ بدء التطبيق (لمقارنة الحضور والنقاط)<input class="in" type="date" id="imS" value="${esc(c.impStart||'')}" max="${isoDay()}"></label></div>
 <div class="acts"><button class="btn pri" data-imp>${ic('printer')}طباعة تقرير الأثر</button><button class="btn sec" data-imcsv>${ic('file-spreadsheet')}تنزيل Excel</button></div>`}`;
 p.onclick=e=>{const b=e.target.closest('button');if(!b)return;const c=crCls();
  if(b.hasAttribute('data-imp'))return printHTML('تقرير قياس الأثر',$('#imRep').innerHTML);
  if(b.hasAttribute('data-imcsv'))return dlFile(`قياس الأثر ${safeName(c.name)}.csv`,csv([[STU(),'القبلي %','البعدي %','التغير'],...rows.map(r=>[r.s.n,Math.round(r.a),Math.round(r.b),Math.round(r.d)]),[],['المتوسط',r1(mA),r1(mB),r1(mean(D))],['حجم الأثر (d)',es==null?'':r1(es)]]),'text/csv;charset=utf-8')};
 p.onchange=e=>{const t=e.target,c=crCls();if(t.id==='imPre')IM.pre=t.value;if(t.id==='imPost')IM.post=t.value;if(t.id==='imT'){c.impTitle=t.value.trim().slice(0,80);crSave()}if(t.id==='imS'){c.impStart=t.value;crSave()}crPanel()}}
function impWin(c){const s=c.impStart;if(!s)return[null,null];const all=crDays(c),bef=all.filter(d=>d<s).slice(-30),aft=all.filter(d=>d>=s).slice(0,30);
 const calc=days=>{if(!days.length)return null;let ok=0,n=0;days.forEach(d=>Object.values(c.att[d]).forEach(v=>{n++;if(v==='p'||v==='l')ok++}));const set=new Set(days),pts=c.pl.filter(x=>set.has(x.d.slice(0,10))).reduce((a,x)=>a+x.n,0);return{n:days.length,att:n?ok/n*100:null,pts:c.students.length?pts/c.students.length/days.length:null}};
 return[calc(bef),calc(aft)]}

/* ============ 4) team achievement wall (motivation tab) ============ */
const WALL_T=['الفريق المتعاون','الفريق المتميز','أفضل نظام وهدوء','الأكثر مشاركة','بطل التحدي','الفريق المبدع','أفضل إنجاز للواجبات'];
const WL={};
function teamCert(t,w){const d=DESIGNS[w.dz]?w.dz:'chalk',D=DESIGNS[d];return `<div class="cert" style="--wc:${D.c};--wc2:${D.c2}">${scene(d)}<div class="cin">${seal(D.c)}${mascot(D.m)}<div><div class="ck">شهادة إنجاز · ${esc(w.title)}</div><div class="cname">فريق ${esc(t?t.n:'')}</div><p class="creason">${esc(w.reason||'')}</p><div class="cfoot"><span>مع تحيات معلمتكم ${esc(ME.p&&ME.p.name||'')}</span><span>${esc(fmtDate(w.d))}</span></div></div></div></div>`}
function motWall(p,c){c.wall=c.wall||[];const T=c.teams||[],cnt=t=>c.wall.filter(w=>w.team===t.id).length,best=Math.max(0,...T.map(cnt));
 p.innerHTML=`<div class="mtop"><div class="stat"><b>${ar(c.wall.length)}</b><span>شهادة معلّقة</span></div>${T.map(t=>`<div class="stat"><b><span class="dot" style="background:${hex(t.c)}"></span> ${ar(cnt(t))}</b><span>فريق ${esc(t.n)}</span></div>`).join('')}<button class="btn pri" data-wadd>${ic('pin')}علّقي شهادة</button></div>
 <div class="exRow"><label class="lab inl grow">اسم الفترة على اللوحة<input class="in" id="wTerm" value="${esc(c.term||'الفصل الدراسي الحالي')}" maxlength="40"></label><div class="acts"><button class="btn sec" data-wfull>${ic('maximize')}عرض على الشاشة</button><button class="btn sec" data-wprint>${ic('printer')}طباعة اللوحة</button><button class="btn ter" data-warch>${ic('archive')}ترم جديد</button></div></div>
 <div class="wallW" id="wallW"><div class="wallH">${STK.trophy}<div><h2>لوحة إنجاز الفرق</h2><span>${esc(c.term||'الفصل الدراسي الحالي')}</span></div></div>
 ${T.length?`<div class="wall">${T.map(t=>{const L=c.wall.filter(w=>w.team===t.id).sort((a,b)=>String(b.d).localeCompare(String(a.d)));return `<div class="wcol" style="--tc:${hex(t.c)||'#ffc800'}"><div class="wcolH"><b>فريق ${esc(t.n)}</b><span>${ar(L.length)} ${best&&L.length===best?'🏆':''}</span></div>${L.map((w,i)=>`<button class="wc" data-wview="${esc(w.id)}" style="--rot:${[-2.5,1.8,-1,2.4,-1.8][i%5]}deg"><i class="wpin"></i><b>${esc(w.title)}</b>${w.reason?`<span>${esc(w.reason)}</span>`:''}<small>${esc(dayShort(w.d))}</small></button>`).join('')||'<p class="wempty">بانتظار أول شهادة</p>'}</div>`}).join('')}</div>`:'<p class="note">أضيفي فرقًا من تبويب «الفرق» أولًا.</p>'}</div>
 ${(c.wallArch||[]).length?`<details class="crDet"><summary>${ic('archive')}لوحات الأترام السابقة</summary><ol class="crList">${c.wallArch.slice().reverse().map(a=>`<li><span>${esc(a.term)}</span><small>${T.map(t=>`${esc(t.n)}: ${ar(a.items.filter(w=>w.team===t.id).length)}`).join(' · ')}</small></li>`).join('')}</ol></details>`:''}`;icons();
 p.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const c=MOT.cls(),d=b.dataset;if(!c)return;
  if(b.hasAttribute('data-wadd'))return wallAdd(c);
  if(d.wview)return wallView(c,d.wview);
  if(b.hasAttribute('data-wfull')){try{$('#wallW').requestFullscreen()}catch(err){toast('ملء الشاشة غير متاح هنا')}return}
  if(b.hasAttribute('data-wprint'))return printHTML(`لوحة إنجاز الفرق · ${c.term||''}`,$('#wallW').outerHTML.replace('id="wallW"',''));
  if(b.hasAttribute('data-warch')){if(!c.wall.length)return toast('اللوحة فارغة');const n=await promptBox('اسم الترم الجديد','الفصل الدراسي الثاني');if(!n)return;c.wallArch=c.wallArch||[];c.wallArch.push({term:c.term||'ترم سابق',at:isoDay(),items:c.wall});c.wall=[];c.term=n;MOT.mark();toast('أُرشفت اللوحة وبدأ ترم جديد');motPanel()}};
 p.onchange=e=>{const t=e.target,c=MOT.cls();if(t.id==='wTerm'&&c){c.term=t.value.trim().slice(0,40)||'الفصل الدراسي الحالي';MOT.mark();motPanel()}}}
function wallAdd(c){const T=c.teams||[];if(!T.length)return toast('أضيفي فرقًا أولًا');WL.team=WL.team&&T.some(t=>t.id===WL.team)?WL.team:T[0].id;
 const d=openDialog(`<h2 class="dh">${ic('pin')}تعليق شهادة إنجاز لفريق</h2><div class="wtm">${T.map(t=>`<button type="button" class="chip" data-wt="${esc(t.id)}" aria-pressed="${t.id===WL.team}" style="--tc:${hex(t.c)}"><span class="dot" style="background:${hex(t.c)}"></span>${esc(t.n)}</button>`).join('')}</div>
 <form class="wfm"><label class="lab">عنوان الشهادة<input class="in" id="wTi" list="wTiL" value="${esc(WALL_T[0])}" maxlength="40" required><datalist id="wTiL">${WALL_T.map(t=>`<option value="${esc(t)}">`).join('')}</datalist></label><div class="chips wpre">${WALL_T.map(t=>`<button type="button" class="chip" data-wpre="${esc(t)}">${esc(t)}</button>`).join('')}</div>
 <label class="lab">سبب الإنجاز<input class="in" id="wRe" maxlength="90" placeholder="لتعاونهم في إنجاز مشروع ركن القراءة"></label><div class="exRow"><label class="lab inl">التاريخ<input class="in" type="date" id="wD" value="${isoDay()}"></label><label class="lab inl">التصميم<select class="in" id="wDz">${DK.map(k=>`<option value="${k}" ${k===(WL.dz||'chalk')?'selected':''}>${esc(DESIGNS[k].name)}</option>`).join('')}</select></label><label class="sw2"><input type="checkbox" id="wPts"> <span>وأضيفي ٥ نقاط للفريق</span></label></div>
 <div class="acts"><button class="btn pri">${ic('pin')}علّقيها على اللوحة</button><button type="button" class="btn sec" data-close>إلغاء</button></div></form>`,{wide:1,focus:false});
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.wt){WL.team=b.dataset.wt;$$('[data-wt]',d).forEach(x=>x.setAttribute('aria-pressed',x===b))}if(b.dataset.wpre)$('#wTi',d).value=b.dataset.wpre});
 $('form',d).onsubmit=e=>{e.preventDefault();const title=$('#wTi',d).value.trim();if(!title)return;WL.dz=$('#wDz',d).value;const w={id:uid(),team:WL.team,title:title.slice(0,40),reason:$('#wRe',d).value.trim().slice(0,90),d:$('#wD',d).value||isoDay(),dz:WL.dz};c.wall.push(w);
  const t=T.find(x=>x.id===w.team);MOT.log(`شهادة «${w.title}» لفريق ${t?t.n:''}`);if($('#wPts',d).checked){const i=T.indexOf(t);if(i>=0)MOT.awardTeam(i,5,'شهادة '+w.title)}MOT.mark();closeDialog(d);confetti(150);sfx('end');toast('عُلّقت الشهادة على اللوحة');motPanel()}}
function wallView(c,id){const w=c.wall.find(x=>x.id===id);if(!w)return;const t=(c.teams||[]).find(x=>x.id===w.team);
 const d=openDialog(`${teamCert(t,w)}<div class="acts" style="margin-top:12px"><button class="btn pri" data-wp>${ic('printer')}طباعة الشهادة</button><button class="btn ter" data-wd>${ic('trash-2')}إزالتها من اللوحة</button></div>`,{wide:1,focus:false});
 d.addEventListener('click',async e=>{const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-wp'))printHTML(`شهادة إنجاز · فريق ${t?t.n:''}`,teamCert(t,w));
  if(b.hasAttribute('data-wd')){if(!await confirmBox('إزالة الشهادة من اللوحة؟','أزيليها'))return;c.wall=c.wall.filter(x=>x!==w);MOT.mark();closeDialog(d);motPanel()}})}

/* ============ 5) QR code maker (own page) ============ */
const QR={type:'url',f:{url:'https://app.madbot.store',text:'',phone:'',msg:'',mail:'',subj:'',ssid:'',pw:'',enc:'WPA'},label:'',fg:'#111827',bg:'#ffffff',size:512,ec:'M',copies:'1'};
async function qrLib(){if(window.qrcode)return true;for(const u of['https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js','https://unpkg.com/qrcode-generator@1.4.4/qrcode.js']){try{await loadScript(u);if(window.qrcode)return true}catch(e){}}return false}
const wEsc=s=>String(s).replace(/([\\;,:"])/g,'\\$1');
function qrData(){const f=QR.f;switch(QR.type){case 'url':{let u=f.url.trim();if(u&&!/^[a-z][\w+.-]*:/i.test(u))u='https://'+u;return u}
 case 'text':return f.text.trim();case 'wa':{const ph=waPhone(f.phone);return ph||f.msg.trim()?`https://wa.me/${ph}${f.msg.trim()?'?text='+encodeURIComponent(f.msg.trim()):''}`:''}
 case 'mail':return f.mail.trim()?`mailto:${f.mail.trim()}${f.subj.trim()?'?subject='+encodeURIComponent(f.subj.trim()):''}`:'';
 case 'wifi':return f.ssid.trim()?`WIFI:T:${f.enc};S:${wEsc(f.ssid.trim())};P:${f.enc==='nopass'?'':wEsc(f.pw)};;`:''}return ''}
function qrMatrix(txt){const q=qrcode(0,QR.ec);if(qrcode.stringToBytesFuncs&&qrcode.stringToBytesFuncs['UTF-8']){qrcode.stringToBytes=qrcode.stringToBytesFuncs['UTF-8'];q.addData(txt,'Byte')}else q.addData(unescape(encodeURIComponent(txt)),'Byte');q.make();return q}
function qrCanvas(txt,px){const q=qrMatrix(txt),n=q.getModuleCount(),qz=4,lab=QR.label.trim(),cell=Math.max(1,Math.floor(px/(n+qz*2))),side=cell*(n+qz*2),lh=lab?Math.round(side*.13):0;
 const cv=document.createElement('canvas');cv.width=side;cv.height=side+lh;const x=cv.getContext('2d');x.fillStyle=hex(QR.bg)||'#fff';x.fillRect(0,0,cv.width,cv.height);x.fillStyle=hex(QR.fg)||'#000';
 for(let r=0;r<n;r++)for(let k=0;k<n;k++)if(q.isDark(r,k))x.fillRect((k+qz)*cell,(r+qz)*cell,cell,cell);
 if(lab){x.font=`700 ${Math.round(lh*.5)}px "IBM Plex Sans Arabic",sans-serif`;x.textAlign='center';x.textBaseline='middle';x.direction='rtl';let t=lab;while(x.measureText(t).width>side*.92&&t.length>3)t=t.slice(0,-1);x.fillText(t===lab?t:t+'…',side/2,side+lh*.35)}return cv}
function vQR(){const f=QR.f,T=[['url','رابط','link'],['text','نص','type'],['wa','واتساب','message-circle'],['mail','بريد','mail'],['wifi','شبكة واي فاي','wifi']];
 return `<section class="band hero2 w-sea"><div class="wrap"><div class="h2row"><div><span class="bd y">أداة مجانية</span><h1 class="h1s">صانع رمز QR</h1><p class="lead">حوّلي أي رابط أو نص إلى رمز QR تطبعينه على أوراق العمل والواجبات وباب الفصل: رابط درس، أو نموذج، أو رقم واتساب للتواصل مع أولياء الأمور.</p></div><div class="h2art qrHero">${ic('qr-code')}</div></div>
 <div class="qrW"><div class="crCard qrF">${chipsHTML('data-qt',T,QR.type)}
 <div class="qrFl">${QR.type==='url'?`<label class="lab">الرابط<input class="in" dir="ltr" data-qf="url" value="${esc(f.url)}" placeholder="https://"></label><div class="chips qrQuick">${[['موقع الدروس','https://lesson.madbot.store'],['المنصة','https://app.madbot.store'],['ملف الإنجاز','https://enjaz.madbot.store'],['متجر مضبوط','https://madbot.store']].map(([l,u])=>`<button type="button" class="chip" data-qu="${u}">${l}</button>`).join('')}</div>`:''}
 ${QR.type==='text'?`<label class="lab">النص<textarea class="in" rows="4" data-qf="text" maxlength="800" placeholder="سؤال اليوم، أو تعليمات النشاط…">${esc(f.text)}</textarea></label>`:''}
 ${QR.type==='wa'?`<label class="lab">رقم الجوال<input class="in" dir="ltr" inputmode="tel" data-qf="phone" value="${esc(f.phone)}" placeholder="05xxxxxxxx"></label><label class="lab">رسالة جاهزة (اختياري)<textarea class="in" rows="3" data-qf="msg" maxlength="400" placeholder="السلام عليكم، أنا ولي أمر الطالبة…">${esc(f.msg)}</textarea></label>`:''}
 ${QR.type==='mail'?`<label class="lab">البريد<input class="in" dir="ltr" type="email" data-qf="mail" value="${esc(f.mail)}"></label><label class="lab">الموضوع (اختياري)<input class="in" data-qf="subj" value="${esc(f.subj)}"></label>`:''}
 ${QR.type==='wifi'?`<label class="lab">اسم الشبكة<input class="in" dir="ltr" data-qf="ssid" value="${esc(f.ssid)}"></label><label class="lab">التشفير<select class="in" data-qf="enc">${[['WPA','WPA/WPA2'],['WEP','WEP'],['nopass','بدون كلمة مرور']].map(([v,l])=>`<option value="${v}" ${f.enc===v?'selected':''}>${l}</option>`).join('')}</select></label>${f.enc==='nopass'?'':`<label class="lab">كلمة مرور الشبكة<input class="in" dir="ltr" data-qf="pw" value="${esc(f.pw)}" autocomplete="off"></label>`}`:''}</div>
 <label class="lab">نص تحت الرمز (اختياري)<input class="in" data-qo="label" value="${esc(QR.label)}" maxlength="40" placeholder="امسحي الرمز لمشاهدة الدرس"></label>
 <div class="exRow"><label class="lab inl">لون الرمز<input class="in qrC" type="color" data-qo="fg" value="${QR.fg}"></label><label class="lab inl">الخلفية<input class="in qrC" type="color" data-qo="bg" value="${QR.bg}"></label><label class="lab inl">الحجم<select class="in" data-qo="size">${[[256,'صغير'],[512,'متوسط'],[1024,'كبير للطباعة']].map(([v,l])=>`<option value="${v}" ${QR.size==v?'selected':''}>${l}</option>`).join('')}</select></label><label class="lab inl">تحمّل التلف<select class="in" data-qo="ec">${[['L','منخفض'],['M','متوسط'],['Q','عالٍ'],['H','الأعلى']].map(([v,l])=>`<option value="${v}" ${QR.ec===v?'selected':''}>${l}</option>`).join('')}</select></label></div></div>
 <div class="crCard qrP"><div id="qrOut" class="qrOut"><p class="note">جارٍ التحضير…</p></div><div class="acts"><button class="btn pri" data-qdl>${ic('download')}تنزيل صورة PNG</button><label class="lab inl">النسخ في الصفحة<select class="in" data-qo="copies">${['1','4','9','16','30'].map(v=>`<option ${QR.copies===v?'selected':''}>${v}</option>`).join('')}</select></label><button class="btn sec" data-qpr>${ic('printer')}طباعة</button></div><p class="note">جرّبي مسح الرمز بكاميرا الجوال قبل الطباعة.</p></div></div></div></section>`}
let _qrT=0;
async function qrDraw(){const o=$('#qrOut');if(!o)return;const t=qrData();if(!t){o.innerHTML=`<p class="note">اكتبي المحتوى ليظهر الرمز.</p>`;return}
 if(!await qrLib()){o.innerHTML=`<p class="note bad">تعذّر تحميل أداة الرموز. تأكدي من الاتصال بالإنترنت.</p>`;return}
 try{const cv=qrCanvas(t,Math.min(QR.size,512));cv.className='qrCv';cv.setAttribute('role','img');cv.setAttribute('aria-label','رمز QR');o.replaceChildren(cv)}catch(e){o.innerHTML=`<p class="note bad">المحتوى طويل جدًا على رمز واحد. اختصريه أو خفّضي «تحمّل التلف».</p>`}}
function qrMount(){const app=$('#app');qrDraw();
 app.onclick=async e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;
  if(d.qt){QR.type=d.qt;app.innerHTML=vQR();icons();return qrDraw()}
  if(d.qu){QR.f.url=d.qu;$('[data-qf=url]').value=d.qu;return qrDraw()}
  const t=qrData();if((b.hasAttribute('data-qdl')||b.hasAttribute('data-qpr'))&&(!t||!await qrLib()))return toast('اكتبي المحتوى أولًا');
  let cv;try{cv=qrCanvas(t,QR.size)}catch(err){return toast('المحتوى طويل جدًا')}
  if(b.hasAttribute('data-qdl'))cv.toBlob(bl=>dlFile(`QR ${safeName(QR.label||QR.type)}.png`,bl,'image/png'),'image/png');
  if(b.hasAttribute('data-qpr')){const n=+QR.copies||1,src=cv.toDataURL('image/png');const keep=ME.p;if(!keep)ME.p={name:''};try{printHTML(QR.label||'رمز QR',`<div class="qrPG n${n>9?'s':n>4?'m':n>1?'t':'l'}">${Array.from({length:n},()=>`<img src="${src}" alt="QR">`).join('')}</div>`)}finally{ME.p=keep}}};
 const upd=e=>{const t=e.target;if(t.dataset.qf){QR.f[t.dataset.qf]=t.value;if(t.dataset.qf==='enc'){app.innerHTML=vQR();icons()}}else if(t.dataset.qo){QR[t.dataset.qo]=t.dataset.qo==='size'?+t.value:t.value}else return;clearTimeout(_qrT);_qrT=setTimeout(qrDraw,180)};
 app.oninput=upd;app.onchange=upd;app.onsubmit=e=>e.preventDefault()}
