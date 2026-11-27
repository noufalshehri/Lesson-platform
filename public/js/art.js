'use strict';
/* art.js: scenes, mascots, stickers */
const star=(cx,cy,r,f)=>{let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*.45:r;d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)}return `<path d="${d}Z" fill="${f}"/>`};
const spark=(x,y,r,f='#fff',o=1)=>`<path d="M${x} ${y-r} Q${x} ${y} ${x+r} ${y} Q${x} ${y} ${x} ${y+r} Q${x} ${y} ${x-r} ${y} Q${x} ${y} ${x} ${y-r}Z" fill="${f}" opacity="${o}"/>`;
function sceneBase(w){
 let g='';
 if(w==='adv'){
  const cloud=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 12 Q0 2 11 2 Q14 -9 27 -6 Q35 -15 46 -5 Q58 -5 58 7 Q60 16 50 17 H9 Q0 17 0 12Z" fill="#fff"/><path d="M4 14 Q20 19 54 14 Q52 17 48 17 H9 Q3 17 4 14Z" fill="#dbeafe"/></g>`;
  const palm=`<path d="M-12 -8 Q-17 -30 -8 -50" stroke="#92400e" stroke-width="4.5" fill="none" stroke-linecap="round"/><path d="M-8 -50 Q-26 -60 -40 -47 Q-24 -52 -8 -50Z M-8 -50 Q-1 -66 16 -62 Q2 -58 -8 -50Z M-8 -50 Q10 -52 20 -40 Q4 -46 -8 -50Z M-8 -50 Q-22 -46 -28 -32 Q-18 -44 -8 -50Z" fill="#22c55e"/><circle cx="-10" cy="-49" r="2.6" fill="#78350f"/><circle cx="-6" cy="-47" r="2.4" fill="#78350f"/>`;
  const isl=(x,y,s,tree,fall)=>`<g transform="translate(${x} ${y}) scale(${s})">${fall?`<rect x="20" y="2" width="7" height="70" fill="url(#a-fall)"/>`:''}<path d="M-42 0 Q-38 26 -16 44 Q-4 60 3 74 Q10 58 18 44 Q38 24 42 0Z" fill="url(#a-rock)"/><path d="M-34 14 Q0 22 34 14 M-24 32 Q0 38 24 32" stroke="#78350f" stroke-width="2" fill="none" opacity=".45"/><path d="M-44 0 Q-42 -11 0 -11 Q42 -11 44 0 Q46 7 35 7 Q20 11 0 9 Q-20 11 -35 7 Q-46 7 -44 0Z" fill="url(#a-grass)"/><path d="M-30 6 q3 7 6 0 M-8 8 q3 8 6 0 M14 7 q3 7 6 0" fill="#15803d"/>${tree?palm:''}</g>`;
  const gem=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><circle r="10" fill="#c4b5fd" opacity=".35"/><path d="M0 -8 L7 -1 L0 9 L-7 -1Z" fill="#8b5cf6"/><path d="M0 -8 L7 -1 L0 -1Z" fill="#ddd6fe"/><path d="M-7 -1 L0 -1 L0 9Z" fill="#7c3aed"/></g>`;
  g=`<defs><linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38bdf8"/><stop offset=".6" stop-color="#93dcfb"/><stop offset="1" stop-color="#e0f7ff"/></linearGradient><radialGradient id="a-sun"><stop offset="0" stop-color="#fffbe0"/><stop offset=".3" stop-color="#fde047"/><stop offset="1" stop-color="#fde047" stop-opacity="0"/></radialGradient><linearGradient id="a-rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c2700c"/><stop offset="1" stop-color="#7c2d12"/></linearGradient><linearGradient id="a-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86efac"/><stop offset="1" stop-color="#16a34a"/></linearGradient><linearGradient id="a-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22d3ee"/><stop offset="1" stop-color="#0369a1"/></linearGradient><linearGradient id="a-fall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0f9ff"/><stop offset="1" stop-color="#bae6fd" stop-opacity="0"/></linearGradient></defs>
  <rect width="320" height="180" fill="url(#a-sky)"/><circle cx="270" cy="34" r="44" fill="url(#a-sun)"/><circle cx="270" cy="34" r="13" fill="#fff59d"/>
  <path d="M0 128 L40 94 L66 112 L108 80 L148 118 L190 90 L232 122 L272 96 L320 124 V180 H0Z" fill="#c7ebfd"/><path d="M108 80 L120 92 L112 90 L104 96 L98 89Z M190 90 L200 99 L193 98 L186 102 L181 98Z" fill="#fff" opacity=".8"/>
  <path d="M0 142 L32 122 L66 138 L104 114 L144 140 L184 118 L224 142 L266 120 L320 144 V180 H0Z" fill="#a5d8f7"/>
  ${cloud(40,24,1)}${cloud(150,14,.7)}${cloud(206,48,.55)}<g transform="translate(128 30) rotate(-12)"><path d="M0 -9 L7 0 L0 11 L-7 0Z" fill="#f97316"/><path d="M0 -9 L0 11 M-7 0 H7" stroke="#fff" stroke-width=".8" opacity=".8"/><path d="M0 11 q-4 6 0 10 q4 4 -1 9" stroke="#0c4a6e" stroke-width=".7" fill="none"/></g>
  ${isl(206,64,.42,0,0)}${isl(70,52,.38,1,0)}${isl(282,106,.86,0,1)}${isl(42,118,1.05,1,0)}
  <path d="M0 160 Q20 154 40 160 T80 160 T120 160 T160 160 T200 160 T240 160 T280 160 T320 160 V180 H0Z" fill="url(#a-sea)"/><path d="M10 166 q10 -4 20 0 M120 168 q10 -4 20 0 M230 166 q10 -4 20 0" stroke="#e0f2fe" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".8"/>
  ${gem(250,140,.9)}${gem(16,74,.7)}${gem(170,30,.6)}${spark(300,70,3)}${spark(100,30,2.6)}${spark(230,18,2.2)}`;
 }else if(w==='bld'){
  const bl=(x,wd,h,c,sh,roof)=>{const y=166-h;let s=`<rect x="${x}" y="${y}" width="${wd}" height="${h}" fill="${c}"/><rect x="${x+wd-5}" y="${y}" width="5" height="${h}" fill="${sh}"/>`;
   if(roof)s+=`<path d="M${x-3} ${y} L${x+wd/2} ${y-wd*.45} L${x+wd+3} ${y}Z" fill="${roof}"/>`;else s+=`<rect x="${x-2}" y="${y-3}" width="${wd+4}" height="4" rx="1" fill="${sh}"/>`;
   for(let r=0;r<Math.floor((h-14)/12);r++)for(let k=0;k<Math.floor((wd-6)/9);k++){const lit=(r+k+x)%3!==0;s+=`<rect x="${x+4+k*9}" y="${y+7+r*12}" width="5" height="6" rx="1" fill="${lit?'#fff3b0':'#fde68a'}" opacity="${lit?1:.55}"/>`}
   return s+`<rect x="${x+wd/2-4}" y="${158}" width="8" height="8" rx="1" fill="${sh}"/>`};
  g=`<defs><linearGradient id="b-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fb923c"/><stop offset=".55" stop-color="#fdba74"/><stop offset="1" stop-color="#fff1dc"/></linearGradient><radialGradient id="b-sun"><stop offset="0" stop-color="#fffbe0"/><stop offset=".35" stop-color="#fde68a"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient></defs>
  <rect width="320" height="180" fill="url(#b-sky)"/><circle cx="64" cy="40" r="46" fill="url(#b-sun)"/><circle cx="64" cy="40" r="15" fill="#fff7c2"/>
  <path d="M0 132 H18 V112 H34 V124 H52 V100 H70 V118 H96 V108 H120 V126 H200 V104 H222 V96 H240 V116 H262 V102 H290 V120 H320 V180 H0Z" fill="#fed7aa"/>
  <g fill="#fff" opacity=".85"><ellipse cx="150" cy="30" rx="24" ry="6"/><ellipse cx="162" cy="26" rx="12" ry="6"/><ellipse cx="250" cy="52" rx="18" ry="4.5"/></g>
  <rect x="262" y="26" width="7" height="140" fill="#f59e0b"/><path d="M262 30 L269 40 L262 50 L269 60 L262 70 L269 80 L262 90 L269 100 L262 110 L269 120 L262 130 L269 140 L262 150 L269 160" stroke="#b45309" stroke-width="1.3" fill="none"/><rect x="180" y="24" width="120" height="6" fill="#f59e0b"/><rect x="290" y="24" width="14" height="14" rx="2" fill="#78716c"/><rect x="258" y="16" width="16" height="10" rx="2" fill="#fbbf24"/><path d="M200 30 V70" stroke="#57534e" stroke-width="1.2"/><rect x="191" y="70" width="18" height="12" rx="2" fill="#ef4444"/><rect x="191" y="70" width="18" height="4" rx="2" fill="#fca5a5"/>
  ${bl(0,26,64,'#fb923c','#ea580c',0)}${bl(28,22,88,'#f59e0b','#d97706',0)}${bl(52,28,46,'#ef4444','#b91c1c','#7c2d12')}${bl(232,24,52,'#38bdf8','#0284c7','#1e3a8a')}${bl(276,24,78,'#fbbf24','#d97706',0)}${bl(302,22,40,'#a78bfa','#7c3aed','#4c1d95')}
  <rect y="166" width="320" height="14" fill="#57534e"/><rect y="164" width="320" height="4" fill="#a8a29e"/><path d="M8 173 H24 M44 173 H60 M80 173 H96 M116 173 H132 M152 173 H168 M188 173 H204 M224 173 H240 M260 173 H276 M296 173 H312" stroke="#fef3c7" stroke-width="2"/>
  <path d="M0 8 Q80 26 160 10 Q240 -4 320 14" stroke="#7c2d12" stroke-width="1" fill="none"/>${[14,34,54,74,94,114,134,186,206,226,246,266,286,306].map((x,i)=>{const y=x<160?8+18*Math.sin(x/160*Math.PI)*.9:10+6*Math.sin((x-160)/160*Math.PI);return `<path d="M${x-5} ${y.toFixed(1)} L${x+5} ${y.toFixed(1)} L${x} ${(y+9).toFixed(1)}Z" fill="${['#ef4444','#facc15','#38bdf8','#22c55e'][i%4]}"/>`}).join('')}
  ${spark(120,60,2.4,'#fff',.8)}${spark(226,70,2.2,'#fff',.8)}`;
 }else{
  const flower=(x,y,s,c)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q2 14 0 28" stroke="#15803d" stroke-width="2.4" fill="none"/><path d="M0 18 Q10 12 14 18 Q8 22 0 18Z" fill="#22c55e"/>${[0,60,120,180,240,300].map(a=>`<ellipse cx="${(6*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(6*Math.sin(a*Math.PI/180)).toFixed(1)}" rx="5.4" ry="3.6" transform="rotate(${a} ${(6*Math.cos(a*Math.PI/180)).toFixed(1)} ${(6*Math.sin(a*Math.PI/180)).toFixed(1)})" fill="${c}"/>`).join('')}<circle r="3.6" fill="#fde047"/><circle r="1.6" fill="#f59e0b"/></g>`;
  const fly=(x,y,s,c)=>`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cy="-4" rx="5.5" ry="6.8" fill="${c}"/><path d="M-2.6 -8 q1.4 -2 3.4 -1.6" stroke="#fff" stroke-width="1.2" fill="none" opacity=".7" stroke-linecap="round"/><path d="M-1 3 L1 3 L0 4.6Z" fill="${c}"/><path d="M0 4.6 q-2 4 0 8" stroke="#64748b" stroke-width=".6" fill="none"/></g>`;
  g=`<defs><linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e879f9"/><stop offset=".5" stop-color="#f9a8d4"/><stop offset="1" stop-color="#fdf2f8"/></linearGradient><radialGradient id="g-sun"><stop offset="0" stop-color="#fff"/><stop offset=".3" stop-color="#fef9c3"/><stop offset="1" stop-color="#fef9c3" stop-opacity="0"/></radialGradient><linearGradient id="g-hill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#86efac"/><stop offset="1" stop-color="#16a34a"/></linearGradient><linearGradient id="g-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fdf4ff"/><stop offset="1" stop-color="#e9d5ff"/></linearGradient></defs>
  <rect width="320" height="180" fill="url(#g-sky)"/><circle cx="58" cy="38" r="44" fill="url(#g-sun)"/><circle cx="58" cy="38" r="13" fill="#fffbeb"/>
  <g fill="none" stroke-width="5" opacity=".35"><path d="M190 130 A70 70 0 0 1 330 130" stroke="#f87171"/><path d="M196 130 A64 64 0 0 1 324 130" stroke="#fbbf24"/><path d="M202 130 A58 58 0 0 1 318 130" stroke="#4ade80"/><path d="M208 130 A52 52 0 0 1 312 130" stroke="#60a5fa"/></g>
  <path d="M0 130 Q60 104 130 124 Q200 140 260 116 Q300 104 320 112 V180 H0Z" fill="#bbf7d0"/>
  <g transform="translate(262 52)"><rect x="-22" y="26" width="44" height="56" fill="url(#g-wall)"/><rect x="-34" y="14" width="16" height="68" fill="url(#g-wall)"/><rect x="18" y="14" width="16" height="68" fill="url(#g-wall)"/><rect x="-8" y="-4" width="16" height="34" fill="url(#g-wall)"/><path d="M-36 14 L-26 -8 L-16 14Z M16 14 L26 -8 L36 14Z M-10 -4 L0 -28 L10 -4Z" fill="#c084fc"/><path d="M0 -28 V-38" stroke="#7c3aed" stroke-width="1.4"/><path d="M0 -38 L9 -35 L0 -32Z" fill="#f472b6"/><path d="M-26 -8 V-16 M26 -8 V-16" stroke="#7c3aed" stroke-width="1.2"/><path d="M-26 -16 L-19 -14 L-26 -12Z M26 -16 L33 -14 L26 -12Z" fill="#fde047"/><path d="M-6 82 V66 Q0 58 6 66 V82Z" fill="#a855f7"/><circle cx="0" cy="8" r="3.6" fill="#fde68a"/><rect x="-29" y="30" width="6" height="9" rx="3" fill="#fde68a"/><rect x="23" y="30" width="6" height="9" rx="3" fill="#fde68a"/><rect x="-14" y="42" width="6" height="9" rx="3" fill="#fde68a"/><rect x="8" y="42" width="6" height="9" rx="3" fill="#fde68a"/><path d="M-22 26 H22" stroke="#d8b4fe" stroke-width="2"/></g>
  <path d="M0 148 Q70 126 150 146 Q220 162 320 136 V180 H0Z" fill="#86efac"/><path d="M0 162 Q90 146 170 164 Q250 178 320 156 V180 H0Z" fill="url(#g-hill)"/>
  ${flower(14,148,1,'#f472b6')}${flower(34,156,.8,'#c084fc')}${flower(56,150,.9,'#fb7185')}${flower(300,152,.9,'#facc15')}${flower(180,158,.7,'#f472b6')}${flower(236,156,.8,'#c084fc')}
  ${fly(130,40,1,'#a78bfa')}${fly(24,96,.8,'#f472b6')}${fly(200,22,.7,'#fde047')}
  ${[[96,20,3],[150,62,2.4],[30,24,2.2],[214,92,2.6],[120,96,2],[306,30,2.4]].map(([x,y,r])=>spark(x,y,r,'#fff',.95)).join('')}
  ${[[80,120],[110,134],[200,128],[300,100]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.4" fill="#fef08a" opacity=".45"/><circle cx="${x}" cy="${y}" r="1.4" fill="#fffbeb"/>`).join('')}`;
 }
 return `<svg class="scene" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${g}</svg>`;
}
const TROPHY=`<svg class="trophy" viewBox="0 0 60 64" aria-hidden="true"><defs><linearGradient id="tro" x1="0" x2="1"><stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#ca8a04"/></linearGradient></defs><path d="M16 10 H8 Q8 28 20 30 M44 10 H52 Q52 28 40 30" stroke="#eab308" stroke-width="4.5" fill="none"/><path d="M15 6 H45 V22 Q45 40 30 42 Q15 40 15 22Z" fill="url(#tro)"/><rect x="26" y="42" width="8" height="8" fill="#ca8a04"/><rect x="17" y="50" width="26" height="9" rx="2.5" fill="#a16207"/><path d="M21 11 Q21 28 27 35" stroke="#fff" stroke-width="3" opacity=".55" fill="none" stroke-linecap="round"/><path d="M30 14 L32.5 19.5 L38 20 L34 24 L35 30 L30 27 L25 30 L26 24 L22 20 L27.5 19.5Z" fill="#fff7c2"/></svg>`;


/* additional scenes: space, sea, chalkboard, notebook */
function sceneMore(w){
 let g='';
 if(w==='space'){
  let sd=7,st='';const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280};
  for(let i=0;i<80;i++){const x=(rnd()*320).toFixed(1),y=(rnd()*150).toFixed(1),r=(rnd()*1.1+.3).toFixed(2);st+=`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${(.4+rnd()*.6).toFixed(2)}"/>`}
  g=`<defs><linearGradient id="s-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f0a3c"/><stop offset=".6" stop-color="#312e81"/><stop offset="1" stop-color="#6d28d9"/></linearGradient><radialGradient id="s-pl" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#fdba74"/><stop offset="1" stop-color="#c2410c"/></radialGradient><radialGradient id="s-pl2" cx=".35" cy=".35" r=".75"><stop offset="0" stop-color="#a5f3fc"/><stop offset="1" stop-color="#0e7490"/></radialGradient><radialGradient id="s-neb"><stop offset="0" stop-color="#f472b6" stop-opacity=".45"/><stop offset="1" stop-color="#f472b6" stop-opacity="0"/></radialGradient><radialGradient id="s-neb2"><stop offset="0" stop-color="#38bdf8" stop-opacity=".35"/><stop offset="1" stop-color="#38bdf8" stop-opacity="0"/></radialGradient></defs>
  <rect width="320" height="180" fill="url(#s-sky)"/><circle cx="80" cy="60" r="72" fill="url(#s-neb)"/><circle cx="250" cy="120" r="84" fill="url(#s-neb2)"/>${st}
  <ellipse cx="272" cy="44" rx="40" ry="9" fill="none" stroke="#fde68a" stroke-width="3" opacity=".55" transform="rotate(-18 272 44)"/><circle cx="272" cy="44" r="22" fill="url(#s-pl)"/><path d="M254 38 Q272 32 290 38 M252 48 Q272 44 292 50" stroke="#fed7aa" stroke-width="2.4" fill="none" opacity=".55"/><path d="M234 52 Q272 66 310 36" stroke="#fde68a" stroke-width="3" fill="none"/>
  <circle cx="36" cy="30" r="11" fill="url(#s-pl2)"/><circle cx="32" cy="27" r="2.4" fill="#0e7490" opacity=".5"/><circle cx="40" cy="34" r="1.8" fill="#0e7490" opacity=".5"/>
  <path d="M176 22 L214 8" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>${spark(214,8,3)}
  <path d="M0 150 Q80 136 160 148 Q240 160 320 142 V180 H0Z" fill="#a78bfa"/><path d="M0 164 Q100 152 200 166 Q262 172 320 160 V180 H0Z" fill="#7c3aed"/><ellipse cx="60" cy="158" rx="12" ry="3" fill="#8b5cf6"/><ellipse cx="236" cy="156" rx="16" ry="3.6" fill="#8b5cf6"/><ellipse cx="150" cy="170" rx="10" ry="2.4" fill="#6d28d9"/>
  <g transform="translate(40 116) rotate(40)"><path d="M0 -28 Q11 -15 11 6 L-11 6 Q-11 -15 0 -28Z" fill="#f1f5f9"/><path d="M0 -28 Q11 -15 11 6 L6 6 Q6 -14 0 -26Z" fill="#cbd5e1"/><circle cy="-9" r="4.6" fill="#38bdf8" stroke="#64748b" stroke-width="1.6"/><path d="M-11 0 L-18 13 L-11 8Z M11 0 L18 13 L11 8Z" fill="#ef4444"/><path d="M-7 6 Q0 28 7 6Z" fill="#fb923c"/><path d="M-3.5 6 Q0 19 3.5 6Z" fill="#fde047"/></g>
  ${spark(120,40,2.6)}${spark(300,96,2.4)}${spark(200,70,2)}`;
 }else if(w==='sea'){
  const fish=(x,y,s,c,f)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="#fff" stroke-width="1.1" opacity=".75"><circle r="5"/><circle cx="7" cy="-8" r="3"/><circle cx="-4" cy="-13" r="2"/><path d="M-2.4 -2 q1 -1.6 2.6 -1.6" stroke-linecap="round"/></g>`;
  const weed=(x,h,c)=>`<path d="M${x} 180 Q${x-7} ${180-h*.3} ${x+2} ${180-h*.5} Q${x+10} ${180-h*.7} ${x+1} ${180-h}" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  g=`<defs><linearGradient id="o-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset=".5" stop-color="#0891b2"/><stop offset="1" stop-color="#155e75"/></linearGradient><linearGradient id="o-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>
  <rect width="320" height="180" fill="url(#o-sea)"/><g opacity=".16" fill="#fff"><path d="M60 0 L92 0 L42 180 L8 180Z"/><path d="M150 0 L170 0 L150 180 L118 180Z"/><path d="M240 0 L264 0 L294 180 L258 180Z"/></g>
  <g fill="none" stroke="#fff" opacity=".65">${[[30,40,4],[36,26,2.5],[290,60,5],[282,44,3],[200,30,3],[120,90,2.5],[250,110,3.5]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" stroke-width="1.2"/>`).join('')}</g>
  ${fish(60,70,1.1,'#fb923c',0)}${fish(262,84,1,'#facc15',1)}${fish(220,40,.8,'#f472b6',1)}${fish(100,30,.7,'#a78bfa',0)}
  <path d="M0 156 Q60 146 120 154 Q200 164 320 150 V180 H0Z" fill="url(#o-sand)"/><path d="M30 166 q8 -3 16 0 M150 170 q10 -3 20 0 M240 164 q8 -3 16 0" stroke="#d97706" stroke-width="1.2" fill="none" opacity=".6"/>
  ${weed(14,60,'#16a34a')}${weed(24,44,'#22c55e')}${weed(300,66,'#16a34a')}${weed(310,46,'#4ade80')}
  <g stroke="#fb7185" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M70 160 V138 M70 148 L60 136 M70 144 L80 132"/></g><g stroke="#f472b6" stroke-width="4" fill="none" stroke-linecap="round"><path d="M250 158 V140 M250 150 L242 140 M250 146 L258 136"/></g>
  <g transform="translate(200 166)"><path d="M-8 2 Q0 -12 8 2Z" fill="#fdba74"/><path d="M0 2 L0 -8 M-4 2 L-2 -6 M4 2 L2 -6" stroke="#f97316" stroke-width=".8"/></g><path d="M120 170 q6 -10 12 0Z" fill="#fecaca"/><path d="M121 170 q5 -8 10 0" stroke="#f87171" stroke-width=".8" fill="none"/>`;
 }else if(w==='chalk'){
  g=`<defs><linearGradient id="c-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1f6f45"/><stop offset="1" stop-color="#14532d"/></linearGradient></defs>
  <rect width="320" height="180" fill="#92400e"/><rect x="7" y="7" width="306" height="158" rx="3" fill="url(#c-b)"/><rect x="7" y="7" width="306" height="158" rx="3" fill="none" stroke="#78350f" stroke-width="2"/>
  <g fill="#fff" opacity=".05"><ellipse cx="70" cy="50" rx="60" ry="18"/><ellipse cx="240" cy="124" rx="70" ry="16"/></g>
  <g stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".55"><circle cx="34" cy="32" r="8"/><path d="M34 18 V14 M34 46 V50 M20 32 H16 M48 32 H52 M24 22 L21 19 M44 42 L47 45 M44 22 L47 19 M24 42 L21 45"/><path d="M280 30 h10 M285 25 v10 M298 30 h8 M270 46 h10 M270 50 h10"/><path d="M292 150 c-12 -8 -14 -16 -8 -20 c4 -3 8 0 8 3 c0 -3 4 -6 8 -3 c6 4 4 12 -8 20Z"/><path d="M22 140 l8 -10 l8 10 v10 h-16Z M28 150 v-5 h4 v5"/><path d="M120 22 q10 -8 20 0 t20 0 t20 0"/></g>
  <rect y="165" width="320" height="15" fill="#78350f"/><rect y="165" width="320" height="3" fill="#a16207"/><rect x="40" y="168" width="16" height="4" rx="2" fill="#fff"/><rect x="62" y="168" width="14" height="4" rx="2" fill="#f9a8d4"/><rect x="82" y="168" width="12" height="4" rx="2" fill="#fde047"/><rect x="250" y="167" width="26" height="7" rx="1.5" fill="#1e3a8a"/><rect x="250" y="171" width="26" height="3" fill="#e5e7eb"/>`;
 }else if(w==='jgl'){
  const tree=(x,h,c,c2)=>`<path d="M${x} 180 V${180-h*.5}" stroke="#78350f" stroke-width="${h*.08}" stroke-linecap="round"/><circle cx="${x}" cy="${180-h*.62}" r="${h*.3}" fill="${c}"/><circle cx="${x-h*.18}" cy="${180-h*.5}" r="${h*.22}" fill="${c2}"/><circle cx="${x+h*.18}" cy="${180-h*.52}" r="${h*.22}" fill="${c2}"/><circle cx="${x-h*.08}" cy="${180-h*.72}" r="${h*.1}" fill="#fff" opacity=".18"/>`;
  const leaf=(x,y,r,c)=>`<path d="M0 0 Q12 -10 24 0 Q12 10 0 0Z M2 0 H22" fill="${c}" stroke="#14532d" stroke-width=".6" transform="translate(${x} ${y}) rotate(${r})"/>`;
  g=`<defs><linearGradient id="j-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bbf7d0"/><stop offset="1" stop-color="#f0fdf4"/></linearGradient><radialGradient id="j-sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fef9c3"/><stop offset="1" stop-color="#fef9c3" stop-opacity="0"/></radialGradient></defs>
  <rect width="320" height="180" fill="url(#j-sky)"/><circle cx="160" cy="10" r="90" fill="url(#j-sun)"/>
  <g opacity=".14" fill="#fef9c3"><path d="M150 0 L170 0 L210 180 L140 180Z"/><path d="M60 0 L74 0 L110 180 L70 180Z"/></g>
  ${tree(20,120,'#16a34a','#22c55e')}${tree(300,130,'#15803d','#16a34a')}${tree(60,80,'#4ade80','#22c55e')}${tree(262,86,'#4ade80','#16a34a')}
  <path d="M0 160 Q80 148 160 158 Q240 168 320 152 V180 H0Z" fill="#65a30d"/><path d="M0 170 Q120 160 220 172 Q280 176 320 168 V180 H0Z" fill="#4d7c0f"/>
  <g fill="#facc15"><circle cx="110" cy="166" r="2.4"/><circle cx="196" cy="170" r="2.4"/></g><g fill="#f472b6"><circle cx="140" cy="172" r="2.2"/><circle cx="232" cy="164" r="2.2"/></g>
  <path d="M0 0 Q20 30 8 60 M24 0 Q34 24 30 46 M320 0 Q296 34 308 66" stroke="#15803d" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${leaf(2,58,60,'#22c55e')}${leaf(22,40,40,'#4ade80')}${leaf(300,62,120,'#22c55e')}${leaf(130,20,-20,'#86efac')}${leaf(196,30,200,'#86efac')}`;
 }else if(w==='dsr'){
  const palm=(x,y,s)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0 Q4 -30 -2 -60" stroke="#92400e" stroke-width="5" fill="none" stroke-linecap="round"/>${[[-30,-52],[-24,-70],[0,-78],[24,-70],[30,-52]].map(([a,b])=>`<path d="M-2 -60 Q${a/2} ${b-6} ${a} ${b}" stroke="#16a34a" stroke-width="6" fill="none" stroke-linecap="round"/>`).join('')}<g fill="#b45309"><circle cx="-4" cy="-56" r="3"/><circle cx="2" cy="-55" r="3"/></g></g>`;
  g=`<defs><linearGradient id="d-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".7" stop-color="#fef3c7"/><stop offset="1" stop-color="#fffbeb"/></linearGradient><linearGradient id="d-d1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#d97706"/></linearGradient><linearGradient id="d-d2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>
  <rect width="320" height="180" fill="url(#d-sky)"/><circle cx="262" cy="40" r="22" fill="#fb923c" opacity=".85"/><circle cx="262" cy="40" r="32" fill="#fdba74" opacity=".25"/>
  <path d="M0 120 Q60 96 130 118 Q200 138 260 110 Q300 96 320 104 V180 H0Z" fill="url(#d-d1)" opacity=".7"/>
  <path d="M0 146 Q80 124 160 144 Q240 162 320 136 V180 H0Z" fill="url(#d-d2)"/><path d="M40 156 q20 -6 40 0 M200 162 q24 -6 48 0" stroke="#d97706" stroke-width="1.4" fill="none" opacity=".6"/>
  ${palm(34,150,1)}${palm(290,146,.8)}<g transform="translate(160 132)"><path d="M-30 0 L0 -26 L30 0Z" fill="#fef3c7" stroke="#b45309" stroke-width="2"/><path d="M-6 0 V-12 H6 V0" fill="#b45309"/><path d="M-30 0 H30" stroke="#b45309" stroke-width="2"/></g>
  <g fill="#fff" opacity=".7"><circle cx="60" cy="30" r="1.6"/><circle cx="110" cy="18" r="1.2"/><circle cx="190" cy="26" r="1.4"/></g>${spark(80,44,3,'#f59e0b')}${spark(210,58,2.4,'#f59e0b')}`;
 }else if(w==='tre'){
  g=`<defs><linearGradient id="t-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#e0f2fe"/></linearGradient><linearGradient id="t-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2dd4bf"/><stop offset="1" stop-color="#0f766e"/></linearGradient></defs>
  <rect width="320" height="180" fill="url(#t-sky)"/><g fill="#fff"><ellipse cx="60" cy="32" rx="26" ry="9"/><ellipse cx="76" cy="26" rx="16" ry="9"/><ellipse cx="248" cy="24" rx="22" ry="7"/></g>
  <rect y="110" width="320" height="70" fill="url(#t-sea)"/><path d="M0 116 q10 -4 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" stroke="#ccfbf1" stroke-width="1.6" fill="none" opacity=".8"/>
  <path d="M190 128 Q250 92 310 126 Z" fill="#fde68a"/><path d="M196 128 Q250 100 304 126" stroke="#fbbf24" stroke-width="2" fill="none"/>
  <path d="M262 112 Q266 84 258 64" stroke="#92400e" stroke-width="4" fill="none" stroke-linecap="round"/>${[[-26,-6],[-18,-22],[4,-26],[22,-14],[26,2]].map(([a,b])=>`<path d="M258 64 Q${258+a/2} ${64+b-6} ${258+a} ${64+b}" stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}
  <path d="M224 118 l6 -6 M224 112 l6 6" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/>
  <g transform="translate(244 112)"><rect x="-10" y="-8" width="20" height="12" rx="2" fill="#b45309"/><path d="M-10 -8 Q0 -16 10 -8Z" fill="#d97706"/><rect x="-2" y="-6" width="4" height="5" fill="#fde047"/></g>
  <g transform="translate(70 124)"><path d="M-28 0 H28 L20 12 H-20Z" fill="#92400e"/><path d="M0 0 V-40" stroke="#78350f" stroke-width="2.4"/><path d="M2 -38 L26 -16 H2Z" fill="#fff7ed"/><path d="M-2 -36 L-20 -16 H-2Z" fill="#fef3c7"/></g>
  <path d="M30 160 q8 -4 16 0 M140 166 q10 -4 20 0" stroke="#99f6e4" stroke-width="1.4" fill="none"/>${spark(150,40,3,'#fde047')}`;
 }else if(w==='calm'){
  g=`<rect width="320" height="180" fill="#f8fafc"/><circle cx="300" cy="10" r="70" fill="#e2e8f0" opacity=".7"/><circle cx="10" cy="176" r="56" fill="#e0f2fe" opacity=".8"/>
  <circle cx="40" cy="30" r="5" fill="#cbd5e1"/><circle cx="56" cy="30" r="5" fill="#fde68a"/><circle cx="72" cy="30" r="5" fill="#fecaca"/>
  <path d="M220 160 H300" stroke="#cbd5e1" stroke-width="3" stroke-linecap="round"/><path d="M236 168 H300" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>`;
 }else{
  let L='';for(let y=24;y<180;y+=10)L+=`<path d="M0 ${y} H320" stroke="#bfdbfe" stroke-width=".7"/>`;
  g=`<rect width="320" height="180" fill="#fffdf5"/>${L}<path d="M292 0 V180" stroke="#fca5a5" stroke-width="1.1"/>
  ${Array.from({length:13},(_,i)=>`<circle cx="${18+i*23}" cy="8" r="3.4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>`).join('')}
  <g transform="translate(30 150) rotate(-35)"><rect x="-26" y="-4" width="44" height="8" fill="#facc15"/><rect x="18" y="-4" width="7" height="8" fill="#f9a8d4"/><path d="M-26 -4 L-36 0 L-26 4Z" fill="#fde68a"/><path d="M-33 -1.2 L-36 0 L-33 1.2Z" fill="#334155"/></g>
  <path d="${(()=>{let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?5:11;d+=(i?'L':'M')+(272+r*Math.cos(a)).toFixed(1)+' '+(150+r*Math.sin(a)).toFixed(1)}return d+'Z'})()}" fill="none" stroke="#f59e0b" stroke-width="1.8" stroke-linejoin="round"/>
  <path d="M48 40 c-6 -8 -16 -2 -10 6 l10 10 l10 -10 c6 -8 -4 -14 -10 -6Z" fill="none" stroke="#f472b6" stroke-width="1.8"/>
  <path d="M250 40 L282 30 L262 52 L258 44Z M258 44 L282 30" fill="none" stroke="#60a5fa" stroke-width="1.6" stroke-linejoin="round"/><path d="M250 46 q-14 8 -30 2" stroke="#60a5fa" stroke-width="1.2" stroke-dasharray="3 3" fill="none"/>
  <rect x="-6" y="16" width="44" height="12" fill="#f9a8d4" opacity=".7" transform="rotate(-30 16 22)"/><rect x="282" y="160" width="44" height="12" fill="#a7f3d0" opacity=".75" transform="rotate(-30 304 166)"/>`;
 }
 return g;
}
function starPath(cx,cy,r,inner=.5){let d='';for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?r*inner:r;d+=(i?'L':'M')+(cx+rr*Math.cos(a)).toFixed(1)+' '+(cy+rr*Math.sin(a)).toFixed(1)}return d+'Z'}

/* original sticker set */
const STK=(()=>{const W=(b)=>`<svg viewBox="0 0 100 100" class="stk" aria-hidden="true">${b}</svg>`;return{
 star:W(`<defs><radialGradient id="k-st" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#f59e0b"/></radialGradient></defs><path d="${starPath(50,54,44,.5)}" fill="url(#k-st)" stroke="#f59e0b" stroke-width="5" stroke-linejoin="round"/><path d="M34 40 Q40 30 50 28" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`),
 heart:W(`<path d="M50 86 C14 62 8 40 20 26 C32 12 46 18 50 30 C54 18 68 12 80 26 C92 40 86 62 50 86Z" fill="#f43f5e" stroke="#be123c" stroke-width="4" stroke-linejoin="round"/><path d="M26 34 Q30 24 40 24" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`),
 trophy:W(`<path d="M28 18 H14 Q14 44 32 46 M72 18 H86 Q86 44 68 46" stroke="#eab308" stroke-width="6" fill="none"/><path d="M26 12 H74 V36 Q74 62 50 64 Q26 62 26 36Z" fill="#facc15" stroke="#ca8a04" stroke-width="3"/><rect x="44" y="64" width="12" height="12" fill="#ca8a04"/><rect x="30" y="76" width="40" height="12" rx="3" fill="#a16207"/><path d="${starPath(50,36,11,.45)}" fill="#fff7c2"/>`),
 medal:W(`<path d="M30 6 L44 40 L56 40 L42 6Z" fill="#3b82f6"/><path d="M70 6 L56 40 L44 40 L58 6Z" fill="#ef4444"/><circle cx="50" cy="62" r="28" fill="#facc15" stroke="#ca8a04" stroke-width="4"/><circle cx="50" cy="62" r="19" fill="#fde047"/><path d="${starPath(50,62,13,.45)}" fill="#f59e0b"/>`),
 crown:W(`<path d="M12 72 L18 30 L36 50 L50 22 L64 50 L82 30 L88 72Z" fill="#facc15" stroke="#ca8a04" stroke-width="4" stroke-linejoin="round"/><rect x="12" y="72" width="76" height="12" rx="3" fill="#eab308"/><circle cx="50" cy="56" r="6" fill="#ef4444"/><circle cx="30" cy="62" r="4.5" fill="#3b82f6"/><circle cx="70" cy="62" r="4.5" fill="#22c55e"/><circle cx="18" cy="28" r="4" fill="#fde047"/><circle cx="50" cy="20" r="4" fill="#fde047"/><circle cx="82" cy="28" r="4" fill="#fde047"/>`),
 rocket:W(`<g transform="rotate(35 50 50)"><path d="M50 8 Q70 28 68 66 L32 66 Q30 28 50 8Z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="3"/><circle cx="50" cy="38" r="9" fill="#38bdf8" stroke="#64748b" stroke-width="3"/><path d="M32 52 L18 74 L33 68Z M68 52 L82 74 L67 68Z" fill="#ef4444"/><path d="M38 66 Q50 98 62 66Z" fill="#fb923c"/><path d="M44 66 Q50 84 56 66Z" fill="#fde047"/></g>`),
 balloon:W(`<ellipse cx="50" cy="40" rx="28" ry="34" fill="#ef4444"/><path d="M36 22 Q42 14 52 14" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/><path d="M46 74 L54 74 L50 80Z" fill="#b91c1c"/><path d="M50 80 Q42 88 52 94" stroke="#64748b" stroke-width="2" fill="none"/>`),
 gift:W(`<rect x="14" y="40" width="72" height="50" rx="4" fill="#a855f7"/><rect x="10" y="28" width="80" height="16" rx="4" fill="#c084fc"/><rect x="44" y="28" width="12" height="62" fill="#fde047"/><path d="M50 28 C36 8 20 18 34 28Z M50 28 C64 8 80 18 66 28Z" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>`),
 rainbow:W(`<g fill="none" stroke-width="8"><path d="M10 78 A40 40 0 0 1 90 78" stroke="#ef4444"/><path d="M18 78 A32 32 0 0 1 82 78" stroke="#f59e0b"/><path d="M26 78 A24 24 0 0 1 74 78" stroke="#22c55e"/><path d="M34 78 A16 16 0 0 1 66 78" stroke="#3b82f6"/></g><ellipse cx="14" cy="80" rx="12" ry="7" fill="#fff" stroke="#e2e8f0" stroke-width="2"/><ellipse cx="86" cy="80" rx="12" ry="7" fill="#fff" stroke="#e2e8f0" stroke-width="2"/>`),
 sun:W(`<g stroke="#f59e0b" stroke-width="6" stroke-linecap="round"><path d="M50 6 V16 M50 84 V94 M6 50 H16 M84 50 H94 M19 19 L26 26 M74 74 L81 81 M81 19 L74 26 M26 74 L19 81"/></g><circle cx="50" cy="50" r="26" fill="#fde047" stroke="#f59e0b" stroke-width="4"/><circle cx="42" cy="46" r="3" fill="#78350f"/><circle cx="58" cy="46" r="3" fill="#78350f"/><path d="M40 57 Q50 66 60 57" stroke="#78350f" stroke-width="3.5" fill="none" stroke-linecap="round"/>`),
 cloud:W(`<path d="M24 74 Q8 74 10 58 Q12 44 28 46 Q30 26 50 26 Q68 26 72 42 Q90 40 90 58 Q90 74 74 74Z" fill="#fff" stroke="#93c5fd" stroke-width="4"/>`),
 bulb:W(`<path d="M50 8 Q78 8 78 38 Q78 54 64 64 L64 74 L36 74 L36 64 Q22 54 22 38 Q22 8 50 8Z" fill="#fde047" stroke="#ca8a04" stroke-width="4"/><rect x="36" y="76" width="28" height="8" rx="2" fill="#94a3b8"/><rect x="40" y="86" width="20" height="7" rx="3" fill="#64748b"/><path d="M42 50 L50 40 L58 50" stroke="#ca8a04" stroke-width="3" fill="none"/><path d="M34 28 Q38 18 48 16" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>`),
 book:W(`<path d="M50 24 Q30 12 8 18 V80 Q30 74 50 86 Q70 74 92 80 V18 Q70 12 50 24Z" fill="#fff" stroke="#3b82f6" stroke-width="4" stroke-linejoin="round"/><path d="M50 24 V86" stroke="#3b82f6" stroke-width="3"/><path d="M18 34 Q30 30 42 36 M18 46 Q30 42 42 48 M58 36 Q70 30 82 34 M58 48 Q70 42 82 46" stroke="#93c5fd" stroke-width="3" fill="none" stroke-linecap="round"/>`),
 pencil:W(`<g transform="rotate(-40 50 50)"><rect x="18" y="40" width="58" height="20" fill="#facc15"/><rect x="18" y="40" width="58" height="7" fill="#fde047"/><rect x="76" y="40" width="10" height="20" fill="#94a3b8"/><rect x="86" y="40" width="8" height="20" rx="3" fill="#f9a8d4"/><path d="M18 40 L2 50 L18 60Z" fill="#fde68a"/><path d="M8 46 L2 50 L8 54Z" fill="#334155"/></g>`),
 check:W(`<circle cx="50" cy="50" r="42" fill="#22c55e" stroke="#15803d" stroke-width="4"/><path d="M30 52 L44 66 L72 36" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`),
 flower:W(`${[0,60,120,180,240,300].map(a=>`<ellipse cx="${(50+20*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(46+20*Math.sin(a*Math.PI/180)).toFixed(1)}" rx="16" ry="11" transform="rotate(${a} ${(50+20*Math.cos(a*Math.PI/180)).toFixed(1)} ${(46+20*Math.sin(a*Math.PI/180)).toFixed(1)})" fill="#f472b6"/>`).join('')}<circle cx="50" cy="46" r="12" fill="#fde047" stroke="#f59e0b" stroke-width="3"/><path d="M50 70 V96" stroke="#16a34a" stroke-width="5"/>`),
 apple:W(`<path d="M50 30 Q30 18 18 34 Q6 54 22 76 Q34 94 50 84 Q66 94 78 76 Q94 54 82 34 Q70 18 50 30Z" fill="#ef4444"/><path d="M50 30 Q50 18 56 8" stroke="#78350f" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M54 18 Q68 6 76 16 Q66 26 54 18Z" fill="#22c55e"/><path d="M28 44 Q30 34 40 32" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".6"/>`),
 thumb:W(`<circle cx="50" cy="50" r="42" fill="#38bdf8" stroke="#0284c7" stroke-width="4"/><path d="${starPath(50,50,22,.45)}" fill="#fff"/>`)
}})();
const STK_NAMES={star:'نجمة',heart:'قلب',trophy:'كأس',medal:'ميدالية',crown:'تاج',rocket:'صاروخ',balloon:'بالون',gift:'هدية',rainbow:'قوس قزح',sun:'شمس',cloud:'غيمة',bulb:'فكرة',book:'كتاب',pencil:'قلم',check:'صح',flower:'زهرة',apple:'تفاحة',thumb:'وسام'};

const DESIGNS={
 adv:{name:'جزر المغامرة',c:'#0284c7',c2:'#e0f2fe',c3:'#7dd3fc',m:'adv',reward:'💎'},
 bld:{name:'مدينة البنّائين',c:'#ea580c',c2:'#ffedd5',c3:'#fdba74',m:'bld',reward:'🏠'},
 gdn:{name:'الحديقة المسحورة',c:'#db2777',c2:'#fce7f3',c3:'#f9a8d4',m:'gdn',reward:'🌸'},
 space:{name:'رحلة الفضاء',c:'#7c3aed',c2:'#ede9fe',c3:'#c4b5fd',m:'spc',reward:'🚀'},
 sea:{name:'أعماق البحر',c:'#0891b2',c2:'#cffafe',c3:'#67e8f9',m:'sub',reward:'🐚'},
 chalk:{name:'السبورة',c:'#ca8a04',c2:'#fef9c3',c3:'#fde047',m:'star',reward:'⭐'},
 note:{name:'دفتري',c:'#2563eb',c2:'#dbeafe',c3:'#93c5fd',m:'pen',reward:'✏️'},
 jgl:{name:'الغابة الخضراء',c:'#15803d',c2:'#dcfce7',c3:'#86efac',m:'tree',reward:'🍃'},
 dsr:{name:'رمال الصحراء',c:'#b45309',c2:'#fef3c7',c3:'#fcd34d',m:'lan',reward:'⭐'},
 tre:{name:'جزيرة الكنز',c:'#0f766e',c2:'#ccfbf1',c3:'#5eead4',m:'chest',reward:'🪙'},
 calm:{name:'هادئ وبسيط',c:'#475569',c2:'#f1f5f9',c3:'#cbd5e1',m:'book',reward:'⭐'}
};
const DK7=['adv','bld','gdn','space','sea','chalk','note'];
const DK=Object.keys(DESIGNS);
const MASCOTS={adv:'منطاد المغامرة',bld:'مكعّبات الأرقام',gdn:'أصيص الحروف',sci:'مختبر العلوم',spc:'صاروخ الفضاء',sub:'غوّاصة البحر',pen:'علبة الأقلام',tree:'شجرة الغابة',lan:'فانوس الصحراء',chest:'صندوق الكنز',book:'كتاب القراءة',star:'نجمة الإنجاز'};
const SHADOW=`<ellipse cx="100" cy="246" rx="54" ry="8" fill="#0f172a" opacity=".14"/>`;
const COMP={
 adv:()=>`<defs><radialGradient id="cpA" cx=".35" cy=".3" r=".85"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#0369a1"/></radialGradient><linearGradient id="cpAb" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d97706"/><stop offset="1" stop-color="#92400e"/></linearGradient></defs>${SHADOW}
  <path d="M100 18 C150 18 172 58 166 98 C160 134 128 156 112 172 H88 C72 156 40 134 34 98 C28 58 50 18 100 18Z" fill="url(#cpA)"/>
  <path d="M100 18 C120 30 126 120 108 172 H92 C74 120 80 30 100 18Z" fill="#fde047"/><path d="M100 18 C86 40 84 130 96 172" stroke="#f59e0b" stroke-width="2" fill="none" opacity=".6"/>
  <path d="M58 54 C52 70 52 92 60 112" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".45"/>
  <path d="M88 172 L84 200 M112 172 L116 200 M96 172 L94 200 M104 172 L106 200" stroke="#78350f" stroke-width="2.4"/>
  <rect x="76" y="198" width="48" height="34" rx="6" fill="url(#cpAb)"/><path d="M78 208 H122 M78 220 H122" stroke="#78350f" stroke-width="2" opacity=".5"/><rect x="72" y="194" width="56" height="8" rx="4" fill="#b45309"/>
  <path d="M124 204 L148 196 L148 214Z" fill="#ef4444"/><path d="M124 204 V232" stroke="#78350f" stroke-width="2"/>
  ${spark(30,40,7,'#fde047')}${spark(176,30,5,'#fde047')}${spark(170,150,4,'#7dd3fc')}`,
 bld:()=>{const cube=(x,y,c,d,t,ch)=>`<g transform="translate(${x} ${y})"><path d="M0 0 L26 -14 L52 0 L26 14Z" fill="${t}"/><path d="M0 0 L26 14 V46 L0 32Z" fill="${c}"/><path d="M52 0 L26 14 V46 L52 32Z" fill="${d}"/><text x="13" y="30" font-family="Baloo Bhaijaan 2,sans-serif" font-weight="800" font-size="20" fill="#fff" text-anchor="middle" transform="skewY(28) translate(0 -7)">${ch}</text></g>`;
  return `${SHADOW}${cube(24,186,'#ef4444','#b91c1c','#fca5a5','١')}${cube(76,186,'#22c55e','#15803d','#86efac','٢')}${cube(126,186,'#3b82f6','#1d4ed8','#93c5fd','٣')}${cube(50,140,'#f59e0b','#b45309','#fde68a','٤')}${cube(102,140,'#a855f7','#7e22ce','#d8b4fe','٥')}${cube(76,94,'#ec4899','#be185d','#f9a8d4','٦')}${spark(36,70,7,'#fde047')}${spark(168,84,5,'#fde047')}${spark(150,40,4,'#f9a8d4')}`},
 gdn:()=>{const fl=(x,y,s,c,cc)=>`<g transform="translate(${x} ${y}) scale(${s})">${[0,60,120,180,240,300].map(a=>`<ellipse cx="${(13*Math.cos(a*Math.PI/180)).toFixed(1)}" cy="${(13*Math.sin(a*Math.PI/180)).toFixed(1)}" rx="12" ry="8" transform="rotate(${a} ${(13*Math.cos(a*Math.PI/180)).toFixed(1)} ${(13*Math.sin(a*Math.PI/180)).toFixed(1)})" fill="${c}"/>`).join('')}<circle r="8" fill="${cc}"/><circle cx="-2.5" cy="-2.5" r="2.6" fill="#fff" opacity=".6"/></g>`;
  return `<defs><linearGradient id="cpG" x1="0" x2="1"><stop offset="0" stop-color="#fb923c"/><stop offset="1" stop-color="#c2410c"/></linearGradient></defs>${SHADOW}
  <path d="M100 176 Q96 120 70 84 M100 176 Q102 110 104 60 M100 176 Q112 126 142 96" stroke="#16a34a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M86 132 Q64 118 62 138 Q80 144 86 132Z M108 112 Q130 96 136 116 Q118 124 108 112Z M102 150 Q122 144 124 160 Q108 164 102 150Z" fill="#22c55e"/>
  ${fl(70,80,1,'#f472b6','#fde047')}${fl(104,54,1.15,'#facc15','#f97316')}${fl(144,92,.95,'#a78bfa','#fde047')}
  <path d="M52 176 H148 L136 240 Q100 248 64 240Z" fill="url(#cpG)"/><rect x="46" y="168" width="108" height="16" rx="6" fill="#ea580c"/>
  <text x="100" y="222" font-family="Baloo Bhaijaan 2,sans-serif" font-weight="800" font-size="30" fill="#fff7ed" text-anchor="middle">أ ب ت</text>
  ${spark(34,40,7,'#fde047')}${spark(172,40,5,'#f9a8d4')}`},
 sci:()=>`<defs><linearGradient id="cpS" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#a5f3fc"/><stop offset="1" stop-color="#0891b2"/></linearGradient><linearGradient id="cpS2" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#bbf7d0"/><stop offset="1" stop-color="#16a34a"/></linearGradient></defs>${SHADOW}
  <path d="M60 60 H90 V112 L126 196 Q132 232 98 234 H52 Q18 232 24 196 L60 112Z" fill="#f0f9ff" stroke="#94a3b8" stroke-width="4" transform="translate(-6 6)"/>
  <path d="M38 180 Q60 168 100 180 L112 206 Q114 226 92 228 H50 Q28 226 30 206Z" fill="url(#cpS)" transform="translate(-6 6)"/>
  <rect x="50" y="54" width="42" height="12" rx="5" fill="#64748b"/>
  <circle cx="58" cy="208" r="5" fill="#fff" opacity=".7"/><circle cx="76" cy="196" r="3.4" fill="#fff" opacity=".7"/><circle cx="72" cy="150" r="4" fill="#a5f3fc"/><circle cx="80" cy="128" r="6" fill="#cffafe"/><circle cx="66" cy="102" r="3" fill="#a5f3fc"/>
  <path d="M138 120 H162 V214 Q162 234 150 234 Q138 234 138 214Z" fill="#f0fdf4" stroke="#94a3b8" stroke-width="4"/><path d="M141 178 H159 V214 Q159 230 150 230 Q141 230 141 214Z" fill="url(#cpS2)"/><rect x="132" y="112" width="36" height="10" rx="4" fill="#64748b"/>
  <g transform="translate(150 70)"><circle r="22" fill="none" stroke="#f59e0b" stroke-width="7"/><circle r="16" fill="#e0f2fe" opacity=".8"/><path d="M15 15 L34 34" stroke="#78350f" stroke-width="9" stroke-linecap="round"/><path d="M-8 -8 q4 -5 10 -4" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/></g>
  ${spark(30,40,7,'#fde047')}${spark(108,30,5,'#7dd3fc')}`,
 spc:()=>`<defs><linearGradient id="cpR" x1="0" x2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#cbd5e1"/></linearGradient></defs>${SHADOW}
  <path d="M100 236 Q86 214 92 196 H108 Q114 214 100 236Z" fill="#f97316"/><path d="M100 226 Q93 212 96 198 H104 Q107 212 100 226Z" fill="#fde047"/>
  <path d="M70 160 L48 196 L76 188Z" fill="#ef4444"/><path d="M130 160 L152 196 L124 188Z" fill="#ef4444"/>
  <path d="M100 20 C134 50 140 110 130 196 H70 C60 110 66 50 100 20Z" fill="url(#cpR)" stroke="#94a3b8" stroke-width="3"/>
  <path d="M100 20 C116 34 124 52 127 70 H73 C76 52 84 34 100 20Z" fill="#ef4444"/>
  <circle cx="100" cy="112" r="20" fill="#38bdf8" stroke="#475569" stroke-width="6"/><circle cx="93" cy="105" r="6" fill="#fff" opacity=".6"/>
  <rect x="92" y="150" width="16" height="40" rx="8" fill="#ef4444"/>
  ${spark(30,40,7,'#fde047')}${spark(170,60,5,'#c4b5fd')}${spark(160,170,4,'#fde047')}${spark(36,150,4,'#c4b5fd')}`,
 sub:()=>`<defs><linearGradient id="cpU" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/></linearGradient></defs>${SHADOW}
  <ellipse cx="100" cy="160" rx="82" ry="50" fill="url(#cpU)"/><rect x="78" y="88" width="52" height="40" rx="12" fill="#f59e0b"/><path d="M116 88 V64 H140" stroke="#64748b" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="136" y="56" width="16" height="14" rx="4" fill="#64748b"/>
  ${[60,100,140].map(x=>`<circle cx="${x}" cy="158" r="15" fill="#67e8f9" stroke="#b45309" stroke-width="5"/><circle cx="${x-5}" cy="153" r="4" fill="#fff" opacity=".7"/>`).join('')}
  <path d="M18 160 L2 140 V180Z" fill="#f59e0b"/><circle cx="18" cy="160" r="6" fill="#b45309"/>
  <g fill="none" stroke="#67e8f9" stroke-width="3" opacity=".9"><circle cx="160" cy="80" r="8"/><circle cx="174" cy="56" r="5"/><circle cx="160" cy="36" r="3.5"/></g>`,
 pen:()=>`${SHADOW}
  ${[['#ef4444',-14,70],['#22c55e',0,52],['#3b82f6',14,64],['#facc15',-4,40]].map(([c,r,h])=>`<g transform="rotate(${r} 100 150)"><rect x="92" y="${150-h-40}" width="16" height="${h+40}" fill="${c}"/><path d="M92 ${150-h-40} L100 ${150-h-62} L108 ${150-h-40}Z" fill="#fde68a"/><path d="M97 ${150-h-54} L100 ${150-h-62} L103 ${150-h-54}Z" fill="#334155"/></g>`).join('')}
  <path d="M56 140 H144 L134 236 Q100 244 66 236Z" fill="#2563eb"/><rect x="50" y="132" width="100" height="16" rx="6" fill="#1d4ed8"/><path d="M70 176 H130 M72 200 H128" stroke="#93c5fd" stroke-width="4" stroke-linecap="round"/>
  ${spark(36,50,6,'#fde047')}${spark(166,70,5,'#93c5fd')}`,
 tree:()=>`${SHADOW}<path d="M92 244 Q96 190 94 150 H106 Q104 190 108 244Z" fill="#92400e"/><path d="M100 196 L76 176 M100 180 L124 162" stroke="#92400e" stroke-width="7" stroke-linecap="round"/>
  <circle cx="100" cy="92" r="60" fill="#16a34a"/><circle cx="58" cy="126" r="34" fill="#22c55e"/><circle cx="142" cy="124" r="36" fill="#22c55e"/><circle cx="100" cy="62" r="34" fill="#4ade80"/>
  <circle cx="82" cy="54" r="10" fill="#fff" opacity=".25"/>${[[70,100],[128,88],[106,128],[56,138],[146,140]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="#ef4444"/><circle cx="${x-2}" cy="${y-2}" r="2" fill="#fff" opacity=".6"/>`).join('')}
  <path d="M28 236 Q40 222 52 236 M150 238 Q160 226 172 238" stroke="#65a30d" stroke-width="5" fill="none" stroke-linecap="round"/>`,
 lan:()=>`<defs><radialGradient id="cpL" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fef9c3"/><stop offset="1" stop-color="#fbbf24"/></radialGradient></defs>${SHADOW}
  <circle cx="100" cy="150" r="80" fill="#fde68a" opacity=".35"/><path d="M84 40 Q100 14 116 40" stroke="#b45309" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path d="M70 60 H130 L120 44 H80Z" fill="#b45309"/><path d="M66 64 H134 L144 200 H56Z" fill="url(#cpL)" stroke="#b45309" stroke-width="6" stroke-linejoin="round"/>
  <path d="M100 64 V200 M78 64 L70 200 M122 64 L130 200" stroke="#b45309" stroke-width="4"/>
  <path d="M100 168 Q86 148 100 124 Q114 148 100 168Z" fill="#f97316"/><path d="M100 162 Q94 150 100 138 Q106 150 100 162Z" fill="#fef08a"/>
  <path d="M50 200 H150 L140 220 H60Z" fill="#92400e"/>${spark(36,80,6,'#f59e0b')}${spark(168,96,5,'#f59e0b')}`,
 chest:()=>`${SHADOW}<path d="M40 130 H160 V230 Q100 240 40 230Z" fill="#a16207"/><path d="M40 130 Q100 60 160 130Z" fill="#ca8a04"/>
  <rect x="40" y="140" width="120" height="12" fill="#facc15"/><rect x="40" y="196" width="120" height="10" fill="#facc15"/><rect x="88" y="140" width="24" height="34" rx="4" fill="#fde047" stroke="#a16207" stroke-width="3"/><circle cx="100" cy="156" r="4" fill="#a16207"/>
  ${[[70,108],[96,96],[124,104],[110,86]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="11" fill="#facc15" stroke="#ca8a04" stroke-width="3"/>`).join('')}<path d="M80 80 L88 64 L96 80Z" fill="#38bdf8"/>
  ${spark(40,70,7,'#fde047')}${spark(166,60,6,'#fde047')}${spark(170,150,4,'#fde047')}`,
 book:()=>`${SHADOW}<path d="M100 96 Q60 74 24 86 V216 Q60 204 100 226Z" fill="#e2e8f0"/><path d="M100 96 Q140 74 176 86 V216 Q140 204 100 226Z" fill="#f8fafc"/>
  <path d="M100 96 V226" stroke="#94a3b8" stroke-width="3"/><path d="M24 86 V216 Q60 204 100 226 Q140 204 176 216 V86" fill="none" stroke="#475569" stroke-width="5" stroke-linejoin="round"/>
  ${[120,140,160,180].map(y=>`<path d="M40 ${y} Q66 ${y-8} 88 ${y+4} M112 ${y+4} Q134 ${y-8} 160 ${y}" stroke="#cbd5e1" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}
  <path d="M140 74 V120 L148 112 L156 120 V70Z" fill="#ef4444"/>${spark(40,50,6,'#fde047')}${spark(164,40,5,'#93c5fd')}`,
 star:()=>`<defs><radialGradient id="msf" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#fff7c2"/><stop offset=".55" stop-color="#fde047"/><stop offset="1" stop-color="#f59e0b"/></radialGradient></defs>${SHADOW}
  <path d="M74 176 L58 238 L80 226 L92 246 L104 186Z" fill="#ef4444"/><path d="M126 176 L142 238 L120 226 L108 246 L96 186Z" fill="#3b82f6"/>
  <path d="${starPath(100,110,90,.52)}" fill="url(#msf)" stroke="#f59e0b" stroke-width="8" stroke-linejoin="round"/>
  <path d="${starPath(100,110,46,.52)}" fill="#fff7c2" opacity=".65"/><path d="M66 72 Q78 56 96 54" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
  ${spark(30,30,8,'#fde047')}${spark(170,50,6,'#fde047')}${spark(178,170,5,'#fde047')}${spark(24,160,4,'#fde047')}`
};
function mascot(k){const f=COMP[k]||COMP.adv;return `<svg class="masc comp" viewBox="0 0 200 256" aria-hidden="true">${f()}</svg>`}
function scene(w){if(['adv','bld','gdn'].includes(w))return sceneBase(w);return `<svg class="scene" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sceneMore(DESIGNS[w]?w:'adv')}</svg>`}
const seal=c=>`<svg class="cseal" viewBox="0 0 60 60" aria-hidden="true"><path d="${starPath(30,30,28,.6)}" fill="#fde047" stroke="#f59e0b" stroke-width="2" stroke-linejoin="round"/><circle cx="30" cy="30" r="14" fill="${c}"/><path d="${starPath(30,30,8,.45)}" fill="#fff"/></svg>`;
