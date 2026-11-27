'use strict';
/* app.js: routing, header, boot */
const ROUTES={home:[vHome,null,0],templates:[vTemplates,()=>tpPanel(),0],lessons:[vLessons,()=>lpPanel(),0],games:[vGames,()=>gpPanel(),0],studio:[vStudio,()=>{bindStudio();stRender()},0,'studio'],
 class:[vClassroom,()=>{bindClassroom();crBar();crPanel()},1,'cr'],motivation:[vMotivation,()=>{bindMotivation();clsBar();motPanel()},1,'mot'],pricing:[vPricing,null,0],journey:[vJourney,()=>jMount(),0],dashboard:[vDashboard,()=>dbPanel(),1],admin:[vAdmin,()=>{bindAdmin();adPanel()},0,'admin']};
const NAV=[['home','الرئيسية'],['templates','القوالب'],['lessons','الدروس الجاهزة'],['games','الألعاب'],['studio','الاستوديو'],['class','فصلي'],['motivation','التحفيز'],['pricing','الباقات']];
const TABS=[['home','الرئيسية','house'],['lessons','الدروس','book-open-check'],['studio','الاستوديو','palette'],['games','الألعاب','gamepad-2'],['class','فصلي','users-round']];
const NAVI={home:'house',templates:'layout-template',lessons:'book-open-check',games:'gamepad-2',studio:'palette',class:'users-round',motivation:'trophy',pricing:'badge-check',admin:'shield',dashboard:'circle-user-round'};
function hdr(){const v=(location.hash||'#home').slice(1).split('-')[0],all=[...NAV,...(S.admin?[['admin','الإدارة']]:[])];
 $('#nav').innerHTML=all.map(([k,l])=>`<a href="#${k}" ${k===v?'aria-current="page" class="on"':''}>${l}</a>`).join('');
 $('#acct').innerHTML=ME.p?`<a class="btn sec acc" href="#dashboard" aria-label="حسابي">${ic('circle-user-round')}<span>${esc(ME.p.name)}</span><em class="bd y">${esc(curPlan().name)}</em></a>`:`<a class="btn pri" href="#dashboard">${ic('log-in')}<span>ابدئي مجانًا</span></a>`;
 $('#tabbar').innerHTML=TABS.map(([k,l,i])=>`<a href="#${k}" ${k===v?'class="on" aria-current="page"':''}>${ic(i)}<span>${l}</span></a>`).join('');
 $('#sheetPanel').innerHTML=`<div class="sh-h"><img src="img/logo.svg" alt="مضبوط"><button class="ib" data-shclose aria-label="إغلاق القائمة">${ic('x')}</button></div>${all.map(([k,l])=>`<a href="#${k}" ${k===v?'class="on"':''}>${ic(NAVI[k]||'circle')}${l}</a>`).join('')}<div class="sep"></div><a href="#dashboard">${ic('circle-user-round')}${ME.p?'حسابي':'تسجيل الدخول'}</a><a href="#faq">${ic('circle-help')}الأسئلة الشائعة</a>`;icons()}
function sheet(open){const s=$('#sheet');s.classList.toggle('open',open);$('#menuBtn').setAttribute('aria-expanded',open);document.body.style.overflow=open?'hidden':'';if(open)setTimeout(()=>$('#sheetPanel a')?.focus(),50);else $('#menuBtn').focus()}
document.addEventListener('click',e=>{if(e.target.closest('#menuBtn'))return sheet(true);if(e.target.closest('[data-shclose]')||e.target.closest('#sheetPanel a'))sheet(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#sheet').classList.contains('open'))sheet(false)});
const SKEL=`<div class="skel" aria-busy="true" aria-label="جارٍ التحميل"><div class="sk t"></div><div class="sk l"></div><div class="sk b"></div><div class="skg"><div class="sk"></div><div class="sk"></div><div class="sk"></div></div></div>`;
let routing=0;
async function route(){const my=++routing;let v=(location.hash||'#home').slice(1);if(v.startsWith('journey-')){JR.pending=v.slice(8);v='journey'}if(!ROUTES[v])v='home';const R=ROUTES[v];
 if(!ME.ready){$('#app').innerHTML=SKEL;await loadMe();if(my!==routing)return}
 if(R[2]&&!ME.p){const ok=await ensureMe();if(my!==routing)return;if(!ok){location.hash='home';return}}
 if(v!=='studio')MOT.flush();
 const app=$('#app');app.onclick=pageClick;app.onchange=pageChange;app.oninput=pageInput;app.onsubmit=pageSubmit;
 app.innerHTML=R[0]();document.body.dataset.page=v;hdr();icons();
 if(v==='home'){paintHero();hmPanel()}if(R[1])R[1]();{const id=location.hash.slice(1),f=id&&!ROUTES[id]&&document.getElementById(id);if(f){f.scrollIntoView({behavior:'smooth'});return}}window.scrollTo(0,0)}
addEventListener('hashchange',route);
/* remember what was presented */
{const _op=openPlayer;openPlayer=function(sl,title,o){_op(sl,title,o);if(PL)logPlay(title)}}
addEventListener('beforeunload',()=>{MOT.flush()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)MOT.flush()});
hdr();route();S.ready.then(()=>{hdr()});
