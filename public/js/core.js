'use strict';
/* core.js: helpers, effects, storage, account & plans */
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const en=s=>String(s??'').replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>Date.now().toString(36).slice(-5)+Math.random().toString(36).slice(2,7);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const ic=n=>`<i data-lucide="${n}"></i>`;
const icons=()=>{try{lucide.createIcons({attrs:{'stroke-width':2}})}catch(e){}};
const hex=c=>/^#[0-9a-f]{3,8}$/i.test(String(c||''))?c:'';
const safeSrc=s=>{s=String(s||'');return /^data:image\/(png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(s)||/^\/_blob\/[\w-]+$/.test(s)||/^\/api\/file\/[\w.-]+$/.test(s)||/^https:\/\/[^"'<>\s]+$/.test(s)?s:''};
const today=()=>new Date().toISOString().slice(0,10);
const addDays=(n)=>new Date(Date.now()+n*864e5).toISOString().slice(0,10);
const fmtDate=d=>{try{return new Date(d).toLocaleDateString('ar-SA-u-ca-gregory',{year:'numeric',month:'short',day:'numeric'})}catch(e){return d}};
const num=v=>{const n=parseFloat(en(v));return isNaN(n)?0:n};

let _tt=0;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('on'),2000)}
function openDialog(html,o={}){const d=document.createElement('div');d.className='dlg';d.innerHTML=`<div class="dbox ${o.wide?'wide':''}" role="dialog" aria-modal="true"><button class="ib x" data-close aria-label="إغلاق">${ic('x')}</button>${html}</div>`;document.body.appendChild(d);
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]'))closeDialog(d)});d._onClose=o.onClose;icons();if(o.onMount)o.onMount(d);const f=$('input,textarea,select',d);if(f&&o.focus!==false)setTimeout(()=>f.focus(),30);return d}
function closeDialog(d){if(!d||!d.isConnected)return;d.remove();const c=d._onClose;d._onClose=null;c&&c()}
function confirmBox(msg,ok='تأكيد'){return new Promise(res=>{const d=openDialog(`<h2 class="dh">${esc(msg)}</h2><div class="acts"><button class="btn pri" data-ok>${ok}</button><button class="btn sec" data-close>إلغاء</button></div>`,{onClose:()=>res(false),focus:false});$('[data-ok]',d).onclick=()=>{d._onClose=null;d.remove();res(true)}})}

/* sound, confetti, speech */
const SND={muted:false};let AC=null;
function sfx(k){if(SND.muted)return;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();if(AC.state==='suspended')AC.resume();
 const seq={win:[[523,0],[659,.09],[784,.18],[1046,.27]],no:[[300,0],[220,.14]],tap:[[740,0]],pop:[[900,0],[1200,.04]],flip:[[600,0],[800,.05]],tick:[[1000,0]],end:[[523,0],[659,.14],[784,.28],[1046,.42],[784,.58],[1046,.72]],star:[[880,0],[1175,.08],[1568,.16]]}[k]||[[600,0]],t0=AC.currentTime;
 for(const[f,d]of seq){const o=AC.createOscillator(),g=AC.createGain();o.type=k==='no'?'sine':'triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t0+d);g.gain.exponentialRampToValueAtTime(.2,t0+d+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+d+(k==='tap'||k==='tick'?.07:.26));o.connect(g).connect(AC.destination);o.start(t0+d);o.stop(t0+d+.3)}}catch(e){}}
let parts=[],fxraf=0;
function confetti(n=120){if(reduced())return;const fx=$('#fx');fx.width=innerWidth;fx.height=innerHeight;const cols=['#ffc800','#0284c7','#ea580c','#db2777','#16a34a','#7c3aed'];
 for(let i=0;i<n;i++)parts.push({x:innerWidth/2+(Math.random()-.5)*260,y:innerHeight*.45,vx:(Math.random()-.5)*18,vy:-Math.random()*16-5,r:Math.random()*7+5,c:cols[i%6],a:Math.random()*6,life:0});
 if(!fxraf)fxraf=requestAnimationFrame(fxStep)}
function fxStep(){const fx=$('#fx'),c=fx.getContext('2d');c.clearRect(0,0,fx.width,fx.height);parts=parts.filter(p=>p.life<130&&p.y<fx.height+30);
 for(const p of parts){p.life++;p.vy+=.45;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=.2;c.save();c.translate(p.x,p.y);c.rotate(p.a);c.fillStyle=p.c;c.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);c.restore()}
 fxraf=parts.length?requestAnimationFrame(fxStep):0;if(!fxraf)c.clearRect(0,0,fx.width,fx.height)}
function speak(t){try{const u=new SpeechSynthesisUtterance(String(t));u.lang='ar-SA';u.rate=.9;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){toast('القراءة الصوتية غير متاحة على هذا الجهاز')}}

function pickImage(max=640){return new Promise(res=>{const i=document.createElement('input');i.type='file';i.accept='image/*';
 i.onchange=()=>{const f=i.files[0];if(!f)return res(null);const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.round(im.width*s);c.height=Math.round(im.height*s);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);res(c.toDataURL('image/jpeg',.8))};im.onerror=()=>res(null);im.src=r.result};r.readAsDataURL(f)};i.click()})}

/* storage: artifact database when available, this browser otherwise */
const S={db:null,user:null,dl:null,uid:'local',owner:false,admin:false,mode:'local',q:{},email:'',get remote(){return this.mode==='cloud'||this.mode==='api'},get signedIn(){return this.uid!=='local'},
 async init(){try{if(window.claude&&claude.use){const[db,user,dl]=await Promise.all([claude.use('db'),claude.use('user'),claude.use('downloads')]);this.user=user;this.dl=dl;
   if(user){const id=await user.id();if(id)this.uid=id;this.owner=!!(await user.isOwner());this.admin=this.owner||!!(await user.canEdit())}
   if(db&&this.uid!=='local'){this.db=db;this.mode='cloud'}}}catch(e){}
  if(this.mode!=='cloud'&&location.protocol!=='file:'){try{const r=await fetch('/api/me',{credentials:'same-origin'});if((r.headers.get('content-type')||'').includes('json')&&(r.ok||r.status===401)){this.mode='api';if(r.ok)this.setMe(await r.json())}}catch(e){}}
  if(this.mode==='local'&&location.protocol==='file:'){this.owner=this.admin=true}},
 setMe(m){this.uid=m&&m.uid?m.uid:'local';this.email=(m&&m.email)||'';this.owner=this.admin=!!(m&&m.admin)},
 async call(method,url,body){const r=await fetch(url,{method,credentials:'same-origin',headers:body!==undefined?{'content-type':'application/json'}:{},body:body!==undefined?JSON.stringify(body):undefined});let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw{code:(j&&j.error)||('http_'+r.status),status:r.status};return j},
 key(p){return 'mb3:'+p},
 async get(p){if(this.mode==='api'){try{const j=await this.call('GET','/api/doc?p='+encodeURIComponent(p));return j&&j.data?j.data:null}catch(e){return null}}if(this.db){try{const s=await this.db.doc(p).get();return s.exists?clone(s.data()):null}catch(e){return null}}try{const v=localStorage.getItem(this.key(p));return v?JSON.parse(v):null}catch(e){return null}},
 set(p,d){const run=async()=>{if(this.mode==='api')await this.call('PUT','/api/doc?p='+encodeURIComponent(p),d);else if(this.db)await this.db.doc(p).set(d);else{try{localStorage.setItem(this.key(p),JSON.stringify(d))}catch(e){throw{code:'quota_exceeded'}}}};const nx=(this.q[p]||Promise.resolve()).catch(()=>{}).then(run);this.q[p]=nx;return nx},
 async del(p){if(this.mode==='api'){try{await this.call('DELETE','/api/doc?p='+encodeURIComponent(p))}catch(e){}return}if(this.db){try{await this.db.doc(p).delete()}catch(e){}return}try{localStorage.removeItem(this.key(p))}catch(e){}},
 async list(c){if(this.mode==='api'){try{const j=await this.call('GET','/api/list?c='+encodeURIComponent(c));return(j.docs||[]).map(d=>({...d.data,_id:d.id}))}catch(e){return[]}}if(this.db){try{const s=await this.db.collection(c).get();return s.docs.map(d=>({...clone(d.data()),_id:d.id}))}catch(e){return[]}}
  const out=[],pre=this.key(c)+'/';try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith(pre)&&!k.slice(pre.length).includes('/'))out.push({...JSON.parse(localStorage.getItem(k)),_id:k.slice(pre.length)})}}catch(e){}return out},
 up(k){return `data/users/${this.uid}/${k}`}
};
S.ready=S.init();

/* plans */
const PLAN_DEF=[
 {id:'free',name:'المجانية',m:0,y:0,desc:'للتجربة والتعرّف على المنصة',feat:['قالب واحد من كل فئة','٥ ألعاب تعليمية','٣ دروس جاهزة','حفظ ٥ عروض','لوحة تحفيز لفصل واحد'],lim:{tpl:1,games:5,lessons:3,saves:5,classes:1,export:0,upload:0}},
 {id:'basic',name:'الأساسية',m:15,y:99,desc:'لمن تصمم دروسها بنفسها',feat:['جميع القوالب بكل التصاميم','استوديو التصميم مع رفع الصور','تصدير PowerPoint','٨ ألعاب تعليمية','حفظ غير محدود','٣ فصول'],lim:{tpl:99,games:8,lessons:3,saves:9999,classes:3,export:1,upload:1}},
 {id:'pro',name:'الاحترافية',m:25,y:199,hot:1,desc:'كل شيء جاهز ومتجدد',feat:['كل ما في الأساسية','مكتبة الدروس الجاهزة كاملة','جميع الألعاب الثماني عشرة','خريطة المغامرات والشارات','١٠ فصول'],lim:{tpl:99,games:99,lessons:9999,saves:9999,classes:10,export:1,upload:1}},
 {id:'school',name:'المدارس والمؤسسات',m:null,y:null,desc:'حسابات متعددة وإدارة المعلمات',feat:['كل ما في الاحترافية','حسابات متعددة للمعلمات','إدارة الفصول والمعلمات','تقارير للإدارة المدرسية','تدريب ودعم مخصص'],lim:{tpl:99,games:99,lessons:9999,saves:9999,classes:99,export:1,upload:1}}
];
let PLANS=clone(PLAN_DEF);
const ME={p:null,reg:null,lessons:[],games:[],classes:[],ready:false,custom:[],hidden:[],news:null};
const planActive=pl=>pl&&pl.id&&(pl.id==='free'||String(pl.until||'')>=today());
function curPlan(){if(ME.reg&&ME.reg.blocked)return PLANS[0];if(S.mode==='api'){const r=ME.reg||{},id=r.planOverride||(r.plan&&r.plan!=='free'&&String(r.until||'')>=today()?r.plan:'free');return PLANS.find(p=>p.id===id)||PLANS[0]}const o=ME.reg&&ME.reg.planOverride;const id=o||(ME.p&&planActive(ME.p.plan)?ME.p.plan.id:'free');return PLANS.find(p=>p.id===id)||PLANS[0]}
const lim=k=>{const v=curPlan().lim[k];return v==null?0:v};
function needPlan(msg){const d=openDialog(`<div class="upg">${STK.crown}<h2 class="dh">${esc(msg||'هذه الميزة ضمن الباقات المدفوعة')}</h2><p class="lead">رقّي باقتك لتفتحي هذه الميزة وغيرها. الدفع في هذا النموذج تجريبي ولا يُخصم أي مبلغ.</p><div class="acts"><a class="btn pri" href="#pricing" data-close>اعرضي الباقات</a><button class="btn sec" data-close>لاحقًا</button></div></div>`,{focus:false})}

async function loadMe(){await S.ready;
 const [all,reg,plans,cat,hid,news]=await Promise.all([S.signedIn?S.list(`data/users/${S.uid}`):Promise.resolve([]),S.remote&&S.signedIn?S.get(`teachers/${S.uid}`):Promise.resolve(null),S.get('config/plans'),S.list('catalog'),S.get('config/catalog'),S.get('config/news')]);
 ME.p=all.find(d=>d._id==='profile')||null;ME.reg=reg;
 const by=(p)=>all.filter(d=>d._id.startsWith(p)).sort((a,b)=>String(b.updated||'').localeCompare(String(a.updated||'')));
 ME.lessons=by('L_');ME.games=by('G_');ME.classes=by('K_').sort((a,b)=>String(a.created||'').localeCompare(String(b.created||'')));
 if(plans&&Array.isArray(plans.plans))PLANS=PLAN_DEF.map(d=>{const o=plans.plans.find(x=>x.id===d.id)||{};return{...d,...o,lim:{...d.lim,...(o.lim||{})}}});
 ME.custom=cat;ME.hidden=(hid&&hid.hidden)||[];ME.news=news&&news.text?news:null;ME.ready=true}
async function saveProfile(){ME.p.updated=new Date().toISOString();await S.set(S.up('profile'),ME.p);await regTeacher()}
async function regTeacher(){if(!S.remote||!ME.p)return;const r={name:ME.p.name||'',school:ME.p.school||'',stage:ME.p.stage||'',plan:(ME.p.plan&&ME.p.plan.id)||'free',until:(ME.p.plan&&ME.p.plan.until)||'',lessons:ME.lessons.length,games:ME.games.length,classes:ME.classes.length,joined:ME.p.created||today(),seen:today()};
 if(ME.reg&&ME.reg.planOverride)r.planOverride=ME.reg.planOverride;if(ME.reg&&ME.reg.blocked)r.blocked=ME.reg.blocked;try{await S.set(`teachers/${S.uid}`,r);ME.reg=S.mode==='api'?((await S.get(`teachers/${S.uid}`))||r):r}catch(e){}}
