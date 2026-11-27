'use strict';
/* app.js: routing, header, boot */
const ROUTES={home:[vHome,null,0],templates:[vTemplates,()=>tpPanel(),0],lessons:[vLessons,()=>lpPanel(),0],games:[vGames,()=>gpPanel(),0],studio:[vStudio,()=>{bindStudio();stRender()},0,'studio'],
 motivation:[vMotivation,()=>{bindMotivation();clsBar();motPanel()},1,'mot'],pricing:[vPricing,null,0],journey:[vJourney,()=>jMount(),0],dashboard:[vDashboard,()=>dbPanel(),1],admin:[vAdmin,()=>{bindAdmin();adPanel()},0,'admin']};
const NAV=[['home','الرئيسية'],['templates','القوالب'],['lessons','الدروس الجاهزة'],['games','الألعاب'],['studio','الاستوديو'],['motivation','التحفيز'],['pricing','الباقات']];
function hdr(){$('#nav').innerHTML=NAV.map(([k,l])=>`<a href="#${k}">${l}</a>`).join('')+(S.admin?`<a href="#admin">الإدارة</a>`:'');
 $('#acct').innerHTML=ME.p?`<a class="btn sec acc" href="#dashboard">${ic('circle-user-round')}<span>${esc(ME.p.name)}</span><em class="bd y">${esc(curPlan().name)}</em></a>`:`<a class="btn pri" href="#dashboard">${ic('log-in')}<span>حسابي</span></a>`;
 const v=(location.hash||'#home').slice(1);$$('#nav a').forEach(a=>a.classList.toggle('on',a.getAttribute('href')==='#'+v));icons()}
let routing=0;
async function route(){const my=++routing;let v=(location.hash||'#home').slice(1);if(v.startsWith('journey-')){JR.pending=v.slice(8);v='journey'}if(!ROUTES[v])v='home';const R=ROUTES[v];
 if(!ME.ready){$('#app').innerHTML=`<div class="loading">${mascot('star')}<p>جارٍ التحميل…</p></div>`;await loadMe();if(my!==routing)return}
 if(R[2]&&!ME.p){const ok=await ensureMe();if(my!==routing)return;if(!ok){location.hash='home';return}}
 if(v!=='studio')MOT.flush();
 const app=$('#app');app.onclick=pageClick;app.onchange=pageChange;app.oninput=pageInput;app.onsubmit=pageSubmit;
 app.innerHTML=R[0]();document.body.dataset.page=v;hdr();icons();
 if(v==='home'){paintHero();hmPanel()}if(R[1])R[1]();window.scrollTo(0,0)}
addEventListener('hashchange',route);
/* remember what was presented */
{const _op=openPlayer;openPlayer=function(sl,title,o){_op(sl,title,o);if(PL)logPlay(title)}}
addEventListener('beforeunload',()=>{MOT.flush()});
document.addEventListener('visibilitychange',()=>{if(document.hidden)MOT.flush()});
hdr();route();S.ready.then(()=>{hdr()});
