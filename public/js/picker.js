'use strict';
/* picker.js: visual picker for the site's own illustrations (img/p). Returns the emoji key that
   PICS maps to the picture, so lessons keep working everywhere (player, games, PowerPoint). */
const PIC_GROUPS=[
 ['food','طعام وفواكه','apple banana strawberry grapes orange lemon watermelon carrot cucumber broccoli tomato lettuce salad bread honey milk cereal cookie candy ice_cream cupcake lollipop egg'],
 ['plants','نباتات','seed sprout potted_plant leaf autumn_leaves stem tree blossom rose tulip sunflower cactus roots cotton smell_flower'],
 ['nature','طقس وطبيعة','sun moon rainbow rain sun_cloud snowflake drop wave ice fire fan rock feather gem'],
 ['places','أماكن','mosque kaaba city house school door beach globe map compass'],
 ['school','أدوات مدرسية','pencil crayon book books backpack scissors ruler setsquare palette abacus'],
 ['science','علوم ووقت','bulb magnifier microscope testtube rocket calendar clock cycle recycle_bin scale_bal'],
 ['play','ألعاب واحتفال','gift balloon party blocks toy_blocks kite ball puzzle dice trophy coins finish_flag'],
 ['things','أشياء','key umbrella lock bell bicycle car frame target glasses headphones music megaphone speech'],
 ['animals','حيوانات','camel duck lion cat cow chicken sheep horse elephant fish bird turtle rabbit giraffe tiger polar_bear frog dog whale_tail'],
 ['insects','حشرات','butterfly caterpillar bee ant'],
 ['body','الجسم والنظافة','hand handprint heart_hands heart soap toothbrush bathtub lotion'],
 ['clothes','ملابس','coat scarf gloves sun_hat sunglasses'],
 ['shapes','أشكال ورموز','triangle square circle plus minus question arrow star sparkles']
];
const PIC_AR={apple:'تفاحة',banana:'موز',strawberry:'فراولة',grapes:'عنب',orange:'برتقال',lemon:'ليمون',watermelon:'بطيخ',carrot:'جزر',cucumber:'خيار',broccoli:'بروكلي',tomato:'طماطم',lettuce:'خس',salad:'سلطة',bread:'خبز',honey:'عسل',milk:'حليب',cereal:'حبوب الإفطار',cookie:'بسكويت',candy:'حلوى',ice_cream:'آيس كريم',cupcake:'كعكة',lollipop:'مصاصة',egg:'بيضة',
 seed:'بذرة',sprout:'نبتة',potted_plant:'نبتة في أصيص',leaf:'ورقة شجر',autumn_leaves:'أوراق الخريف',stem:'ساق',tree:'شجرة',blossom:'زهرة',rose:'وردة',tulip:'توليب',sunflower:'دوار الشمس',cactus:'صبار',roots:'جذور',cotton:'قطن',smell_flower:'زهرة للشم',
 sun:'شمس',moon:'قمر',rainbow:'قوس قزح',rain:'مطر',sun_cloud:'شمس وغيمة',snowflake:'ندفة ثلج',drop:'قطرة ماء',wave:'موجة',ice:'ثلج',fire:'نار',fan:'مروحة',rock:'صخرة',feather:'ريشة',gem:'جوهرة',
 mosque:'مسجد',kaaba:'الكعبة',city:'مدينة',house:'بيت',school:'مدرسة',door:'باب',beach:'شاطئ',globe:'الكرة الأرضية',map:'خريطة',compass:'بوصلة',
 pencil:'قلم رصاص',crayon:'قلم تلوين',book:'كتاب',books:'كتب',backpack:'حقيبة',scissors:'مقص',ruler:'مسطرة',setsquare:'مثلث هندسي',palette:'لوحة ألوان',abacus:'معداد',
 bulb:'مصباح',magnifier:'عدسة مكبرة',microscope:'مجهر',testtube:'أنبوب اختبار',rocket:'صاروخ',calendar:'تقويم',clock:'ساعة',cycle:'دورة',recycle_bin:'سلة تدوير',scale_bal:'ميزان',
 gift:'هدية',balloon:'بالون',party:'احتفال',blocks:'مكعبات',toy_blocks:'مكعبات ألعاب',kite:'طائرة ورقية',ball:'كرة',puzzle:'أحجية',dice:'نرد',trophy:'كأس',coins:'نقود',finish_flag:'علم النهاية',
 key:'مفتاح',umbrella:'مظلة',lock:'قفل',bell:'جرس',bicycle:'دراجة',car:'سيارة',frame:'إطار',target:'هدف',glasses:'نظارة',headphones:'سماعات',music:'موسيقى',megaphone:'مكبر صوت',speech:'فقاعة كلام',
 camel:'جمل',duck:'بطة',lion:'أسد',cat:'قطة',cow:'بقرة',chicken:'دجاجة',sheep:'خروف',horse:'حصان',elephant:'فيل',fish:'سمكة',bird:'عصفور',turtle:'سلحفاة',rabbit:'أرنب',giraffe:'زرافة',tiger:'نمر',polar_bear:'دب قطبي',frog:'ضفدع',dog:'كلب',whale_tail:'ذيل حوت',
 butterfly:'فراشة',caterpillar:'يرقة',bee:'نحلة',ant:'نملة',
 hand:'يد',handprint:'بصمة يد',heart_hands:'قلب باليدين',heart:'قلب',soap:'صابون',toothbrush:'فرشاة أسنان',bathtub:'حوض استحمام',lotion:'كريم',
 coat:'معطف',scarf:'وشاح',gloves:'قفازات',sun_hat:'قبعة',sunglasses:'نظارة شمسية',
 triangle:'مثلث',square:'مربع',circle:'دائرة',plus:'زائد',minus:'ناقص',question:'علامة استفهام',arrow:'سهم',star:'نجمة',sparkles:'لمعة'};
/* file -> first emoji that maps to it */
const PIC_KEY=(()=>{const r={};Object.entries(PICS).forEach(([e,f])=>{if(!r[f])r[f]=e});return r})();
const PK={g:'all',q:''};
function picItems(){const seen=new Set(),out=[];PIC_GROUPS.forEach(([g,,list])=>list.split(' ').forEach(f=>{if(PIC_KEY[f]&&!seen.has(f)){seen.add(f);out.push({f,g,e:PIC_KEY[f],n:PIC_AR[f]||f})}}));
 Object.keys(PIC_KEY).forEach(f=>{if(!seen.has(f)){seen.add(f);out.push({f,g:'shapes',e:PIC_KEY[f],n:PIC_AR[f]||f})}});return out}
const picGridHTML=(attr,cur)=>{const q=PK.q.trim(),L=picItems().filter(x=>(PK.g==='all'||x.g===PK.g)&&(!q||x.n.includes(q)||x.f.includes(q.toLowerCase())||x.e===q));
 return L.length?L.map(x=>`<button type="button" class="pkb ${cur&&picSrc(cur)==='img/p/'+x.f+'.webp'?'on':''}" ${attr}="${x.e}" title="${esc(x.n)}"><img src="img/p/${x.f}.webp" alt="" loading="lazy"><span>${esc(x.n)}</span></button>`).join(''):`<p class="note">لا توجد صورة بهذا الاسم.</p>`};
const picTabsHTML=()=>`<div class="pkTabs">${[['all','الكل'],...PIC_GROUPS.map(([g,n])=>[g,n])].map(([g,n])=>`<button type="button" class="chip" data-pkg="${g}" aria-pressed="${PK.g===g}">${n}</button>`).join('')}</div>`;
/* dialog: resolves to the chosen emoji key, or null */
function pickPic(cur){return new Promise(res=>{let done=false;
 const d=openDialog(`<h2 class="dh">${ic('images')}اختاري صورة</h2><input class="in pkQ" type="search" placeholder="ابحثي: تفاحة، شمس، كتاب…" value="${esc(PK.q)}" aria-label="بحث في الصور">${picTabsHTML()}<div class="pkGrid" id="pkGrid">${picGridHTML('data-pkv',cur)}</div>`,{wide:1,focus:false,onClose:()=>{if(!done)res(null)}});
 const grid=$('#pkGrid',d),re=()=>{grid.innerHTML=picGridHTML('data-pkv',cur)};
 $('.pkQ',d).oninput=e=>{PK.q=e.target.value;re()};
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.pkg){PK.g=b.dataset.pkg;$$('[data-pkg]',d).forEach(x=>x.setAttribute('aria-pressed',x===b));re();return}
  if(b.dataset.pkv){done=true;res(b.dataset.pkv);closeDialog(d)}})})}
/* add a "choose picture" button beside every picture field in the studio's properties panel */
function enhancePicFields(root){$$('input[data-pw="pic"],input[data-pa="emo"],input[data-popp]',root).forEach(inp=>{if(inp.dataset.pkd)return;inp.dataset.pkd=1;
 const b=document.createElement('button');b.type='button';b.className='pkPick';b.setAttribute('aria-label','اختاري صورة');
 const paint=()=>{const s=picSrc(inp.value);b.innerHTML=s?`<img src="${s}" alt="">`:`<span>${esc(inp.value)||'🖼️'}</span>`};paint();
 const w=document.createElement('span');w.className='pkWrap';inp.parentNode.insertBefore(w,inp);w.appendChild(b);w.appendChild(inp);
 inp.addEventListener('input',paint);
 b.onclick=async()=>{const v=await pickPic(inp.value);if(!v)return;inp.value=v;paint();inp.dispatchEvent(new Event('input',{bubbles:true}))}})}
