const brandData = {
  chicken: { no:'BRAND 01', symbol:'ㅈㄷ', title:'동물복지의 가치를<br>담은 웰빙치킨', desc:'동물복지 원료육과 건강한 재료를 지향하는 자담치킨. 더 나은 치킨의 기준을 만들어 갑니다.', link:'자담치킨 공식 홈페이지', url:'https://www.ejadam.co.kr', emoji:'🍗', stamp:'CRISPY<br>& HONEST', bg:'#e54128', ghost:'CHICKEN<br>DONE<br>RIGHT.' },
  pizza: { no:'BRAND 02', symbol:'ㅍㅈ', title:'그린티 웰빙도우로<br>완성한 한 판', desc:'특허받은 그린티 웰빙도우와 합리적인 메뉴 구성. 피자마루는 함께 나누는 즐거운 외식 문화를 만듭니다.', link:'피자마루 공식 홈페이지', url:'https://www.pizzamaru.co.kr', emoji:'🍕', stamp:'FRESHLY<br>BAKED', bg:'#d97d18', ghost:'PIZZA<br>FOR<br>EVERYONE.' },
  yogurt: { no:'BRAND 03', symbol:'YP', title:'아이스크림부터 그릭까지<br>다채로운 요거트', desc:'요거트아이스크림, 그릭요거트, 요거와상과 음료까지. 취향에 맞춰 가볍고 다채롭게 즐깁니다.', link:'요거트퍼플 공식 홈페이지', url:'https://www.yogurtpurple.com/web/index.html', emoji:'🫐', stamp:'FRESH<br>& LIGHT', bg:'#704c96', ghost:'PURPLE<br>MAKES<br>HAPPY.' }
};
document.querySelectorAll('.brand-tab').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.brand-tab').forEach(x=>x.classList.remove('active')); btn.classList.add('active');
  const d=brandData[btn.dataset.brand], p=document.querySelector('.brand-panel');
  p.animate([{opacity:.25,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:360,easing:'ease'});
  p.querySelector('.brand-no').textContent=d.no; p.querySelector('.brand-symbol').textContent=d.symbol;
  p.querySelector('h3').innerHTML=d.title; p.querySelector('.brand-copy>p:not(.brand-no)').textContent=d.desc;
  p.querySelector('.brand-copy a').innerHTML=d.link+' <span>→</span>'; p.querySelector('.brand-copy a').href=d.url; p.querySelector('.brand-copy a').target='_blank'; p.querySelector('.brand-copy a').rel='noopener'; p.querySelector('.food-emoji').textContent=d.emoji;
  p.querySelector('.stamp').innerHTML=d.stamp; p.querySelector('.brand-art>p').innerHTML=d.ghost; p.querySelector('.brand-art').style.background=d.bg;
}));
const nums=document.querySelectorAll('[data-count]'); let counted=false;
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting&&!counted){counted=true;nums.forEach(n=>{const end=+n.dataset.count,start=performance.now();function tick(t){const p=Math.min((t-start)/1100,1);n.textContent=Math.floor(end*(1-Math.pow(1-p,3))).toLocaleString();if(p<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)})}}));
io.observe(document.querySelector('.stats'));
const topBtn=document.querySelector('.to-top'); window.addEventListener('scroll',()=>topBtn.classList.toggle('show',scrollY>500)); topBtn.onclick=()=>scrollTo({top:0,behavior:'smooth'});
document.querySelector('.menu-btn').onclick=()=>{const nav=document.querySelector('.nav');nav.style.display=nav.style.display==='flex'?'none':'flex';nav.style.position='absolute';nav.style.top='72px';nav.style.left='0';nav.style.right='0';nav.style.padding='30px';nav.style.background='#f7f3eb';nav.style.flexDirection='column';nav.style.gap='22px'};
