'use strict';
/* pics.js: maps the emoji used in lesson content to original illustrations
   (soft 3D, childlike, no faces; generated with Canva, see img/p/). */
const PICS=(()=>{const m={
 '🍎':'apple','🍌':'banana','🍓':'strawberry','🍇':'grapes','🍊':'orange','🍋':'lemon','🍉':'watermelon','🥕':'carrot','🥒':'cucumber','🥦':'broccoli',
 '🍅':'tomato','🥬':'lettuce','🥗':'salad','🍞':'bread','🍯':'honey','🥛':'milk','🥣':'cereal','🍪':'cookie','🍬':'candy','🍦':'ice_cream','🧁':'cupcake','🍭':'lollipop',
 '🥚':'egg','🌰':'seed','🌱':'sprout','🪴':'potted_plant','🍃':'leaf','🍂':'autumn_leaves','🌿':'stem','🌳':'tree','🌸':'blossom','🌹':'rose','🌷':'tulip','🌻':'sunflower','🌵':'cactus','🫚':'roots',
 '🌈':'rainbow','☀️':'sun','☀':'sun','🌙':'moon','🌑':'moon','🌧️':'rain','🌧':'rain','🌤️':'sun_cloud','🌤':'sun_cloud','❄️':'snowflake','❄':'snowflake','💧':'drop','🌊':'wave','🧊':'ice','🔥':'fire','🌀':'fan',
 '🕌':'mosque','🕋':'kaaba','🏙️':'city','🏙':'city','🏠':'house','🏫':'school','🚪':'door','🏖️':'beach','🏖':'beach','🌍':'globe','🗺️':'map','🗺':'map','🧭':'compass',
 '✏️':'pencil','✏':'pencil','🖍️':'crayon','🖍':'crayon','📖':'book','📚':'books','🎒':'backpack','✂️':'scissors','✂':'scissors','📏':'ruler','📐':'setsquare','🎨':'palette','✍️':'pencil','✍':'pencil',
 '🧮':'abacus','💡':'bulb','🔍':'magnifier','🔎':'magnifier','🔬':'microscope','🧪':'testtube','🚀':'rocket','📅':'calendar','🕐':'clock',
 '🎁':'gift','🎈':'balloon','🎉':'party','🧸':'blocks','🪁':'kite','⚽':'ball','🧩':'puzzle','🏆':'trophy','🪙':'coins','💰':'coins',
 '🔑':'key','☂️':'umbrella','☂':'umbrella','🔒':'lock','🔔':'bell','🚲':'bicycle','🚗':'car','🖼️':'frame','🖼':'frame','🎯':'target',
 '🐪':'camel','🐫':'camel','🦆':'duck','🦁':'lion','🐱':'cat','🐄':'cow','🐔':'chicken','🐑':'sheep','🐎':'horse','🐘':'elephant',
 '🐟':'fish','🐦':'bird','🐥':'bird','🐢':'turtle','🐇':'rabbit','🦒':'giraffe','🐯':'tiger','🐻':'polar_bear','🐸':'frog','🐶':'dog',
 '🦋':'butterfly','🐛':'bitten_leaf','🐝':'beehive','🐳':'whale_tail','🐜':'anthill','✋':'hand','🖐️':'hand','🖐':'hand','🙌':'handprint','🤲':'heart_hands','🤝':'heart_hands','❤️':'heart','❤':'heart','🩵':'heart',
 '👁️':'glasses','👁':'glasses','👀':'glasses','👂':'headphones','👃':'smell_flower','👅':'lollipop','🧼':'soap','🪥':'toothbrush','🛁':'bathtub','🧴':'lotion','🚰':'drop',
 '🔺':'triangle','🟦':'square','🟨':'square','🟥':'square','🔴':'circle','🔵':'circle','🟡':'circle','🟢':'circle','🟠':'circle','⚪':'circle','🗑️':'recycle_bin','🗑':'recycle_bin','🚯':'recycle_bin',
 '🧥':'coat','🧣':'scarf','🧤':'gloves','👒':'sun_hat','🕶️':'sunglasses','🕶':'sunglasses','🏊':'beach',
 '⭐':'star','✨':'sparkles','💬':'speech','🎵':'music','📢':'megaphone','🗣️':'megaphone','🗣':'megaphone','🪨':'rock','🪶':'feather','💎':'gem','🐚':'gem'
};return m})();
/* returns an illustration path for a single known emoji, or '' */
function picSrc(v){if(!v)return '';const k=String(v).trim();const n=PICS[k]||PICS[k.replace(/️/g,'')];return n?'img/p/'+n+'.webp':''}
