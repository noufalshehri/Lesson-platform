/* Swipeable horizontal strips: mouse drag, wheel, edge fades, keep active item visible */
(function(){
  const SEL='.nav,.tabs,.worldpick,.strip,.gthumbs';
  function fades(el){
    const max=el.scrollWidth-el.clientWidth;
    if(max<=2){el.classList.remove('fadeS','fadeE');return}
    const pos=Math.abs(el.scrollLeft); // RTL: 0 at start, negative toward end
    el.classList.toggle('fadeS',pos>4);      // content hidden on the right (start)
    el.classList.toggle('fadeE',pos<max-4);  // content hidden on the left (end)
  }
  function showActive(el){
    const a=el.querySelector('[aria-selected=true],.on,[aria-current=true],[aria-pressed=true]');
    if(a&&el.scrollWidth>el.clientWidth){
      const r=a.getBoundingClientRect(),p=el.getBoundingClientRect();
      if(r.left<p.left||r.right>p.right)el.scrollBy({left:(r.left+r.width/2)-(p.left+p.width/2),behavior:'smooth'});
    }
  }
  function wire(el){
    if(el._strip){fades(el);showActive(el);return}
    el._strip=1;
    el.addEventListener('scroll',()=>fades(el),{passive:true});
    el.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)&&el.scrollWidth>el.clientWidth){el.scrollLeft-=e.deltaY;e.preventDefault()}},{passive:false});
    let down=null,moved=false;
    el.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;down={x:e.clientX,s:el.scrollLeft};moved=false});
    window.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-down.x;if(!moved&&Math.abs(dx)>6){moved=true;el.classList.add('drag')}if(moved)el.scrollLeft=down.s-dx});
    window.addEventListener('pointerup',()=>{if(!down)return;down=null;if(moved){setTimeout(()=>el.classList.remove('drag'),0);el.addEventListener('click',ev=>{ev.stopPropagation();ev.preventDefault()},{capture:true,once:true})}});
    if(window.ResizeObserver)new ResizeObserver(()=>fades(el)).observe(el);
    fades(el);showActive(el);
  }
  const scan=()=>document.querySelectorAll(SEL).forEach(wire);
  new MutationObserver(()=>{clearTimeout(scan.t);scan.t=setTimeout(scan,30)}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['aria-selected','aria-pressed','aria-current']});
  document.addEventListener('DOMContentLoaded',scan);window.addEventListener('hashchange',()=>setTimeout(scan,60));
  window.stripsScan=scan;
})();
