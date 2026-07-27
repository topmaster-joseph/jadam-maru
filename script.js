const brandData = {
  chicken: {
    no: 'BRAND 01', symbol: '자담',
    title: '동물복지 원료육으로<br>더 바르게 만든 치킨',
    desc: '좋은 원료와 정직한 조리로 완성한 바삭한 즐거움. 자담치킨은 오늘도 안심하고 즐길 수 있는 치킨의 기준을 만들어 갑니다.',
    link: '자담치킨 공식 홈페이지', url: 'https://www.ejadam.co.kr',
    emoji: '🍗', stamp: 'CRISPY<br>& HONEST', bg: '#e54128', ghost: 'CHICKEN<br>DONE<br>RIGHT.'
  },
  pizza: {
    no: 'BRAND 02', symbol: '피자',
    title: '매일 구워 더 맛있는<br>온 가족의 피자',
    desc: '쫄깃한 도우와 풍성한 토핑, 합리적인 메뉴 구성. 피자마루는 함께 나누는 즐거운 외식 문화를 만들어 갑니다.',
    link: '피자마루 공식 홈페이지', url: 'https://www.pizzamaru.co.kr',
    emoji: '🍕', stamp: 'FRESHLY<br>BAKED', bg: '#d97d18', ghost: 'PIZZA<br>FOR<br>EVERYONE.'
  },
  yogurt: {
    no: 'BRAND 03', symbol: 'YP',
    title: '가볍고 산뜻하게 즐기는<br>새로운 요거트 디저트',
    desc: '요거트 아이스크림과 그릭요거트, 다채로운 토핑과 음료까지. 취향에 맞춰 가볍고 산뜻하게 즐겨 보세요.',
    link: '요거트퍼플 공식 홈페이지', url: 'https://www.yogurtpurple.com/web/index.html',
    emoji: '🍨', stamp: 'FRESH<br>& LIGHT', bg: '#704c96', ghost: 'PURPLE<br>MAKES<br>HAPPY.'
  }
};

document.querySelectorAll('.brand-tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.brand-tab').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  const data = brandData[button.dataset.brand];
  const panel = document.querySelector('.brand-panel');
  panel.animate([{ opacity: .25, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: 'ease' });
  panel.querySelector('.brand-no').textContent = data.no;
  panel.querySelector('.brand-symbol').textContent = data.symbol;
  panel.querySelector('h3').innerHTML = data.title;
  panel.querySelector('.brand-copy > p:not(.brand-no)').textContent = data.desc;
  const link = panel.querySelector('.brand-copy a');
  link.innerHTML = data.link + ' <span>→</span>';
  link.href = data.url;
  panel.querySelector('.food-emoji').textContent = data.emoji;
  panel.querySelector('.stamp').innerHTML = data.stamp;
  panel.querySelector('.brand-art > p').innerHTML = data.ghost;
  panel.querySelector('.brand-art').style.background = data.bg;
}));

const numbers = document.querySelectorAll('[data-count]');
let counted = false;
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (!entry.isIntersecting || counted) return;
  counted = true;
  numbers.forEach((number) => {
    const end = Number(number.dataset.count);
    const start = performance.now();
    const tick = (time) => {
      const progress = Math.min((time - start) / 1100, 1);
      number.textContent = Math.floor(end * (1 - Math.pow(1 - progress, 3))).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}));
const stats = document.querySelector('.stats');
if (stats) observer.observe(stats);

const topButton = document.querySelector('.to-top');
window.addEventListener('scroll', () => topButton.classList.toggle('show', scrollY > 500));
topButton.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

document.querySelector('.menu-btn').addEventListener('click', () => {
  const nav = document.querySelector('.nav');
  nav.classList.toggle('mobile-open');
});

const selectedBrandLabel = document.querySelector('#quick-selected-brand');
const naverOrderLink = document.querySelector('#naver-order-link');
document.querySelectorAll('.quick-brand').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.quick-brand').forEach((item) => {
    item.classList.remove('active');
    item.setAttribute('aria-pressed', 'false');
  });
  button.classList.add('active');
  button.setAttribute('aria-pressed', 'true');
  const brand = button.dataset.orderBrand;
  selectedBrandLabel.textContent = brand;
  naverOrderLink.href = `https://map.naver.com/p/search/${encodeURIComponent(brand)}`;
}));

document.querySelectorAll('.quick-apps button').forEach((button) => button.addEventListener('click', () => {
  const started = Date.now();
  window.location.href = button.dataset.scheme;
  window.setTimeout(() => {
    if (!document.hidden && Date.now() - started < 1800) {
      window.open(button.dataset.fallback, '_blank', 'noopener');
    }
  }, 900);
}));

const liveDialog = document.querySelector('#live-dialog');
document.querySelector('#live-help').addEventListener('click', () => liveDialog.showModal());
document.querySelector('.dialog-close').addEventListener('click', () => liveDialog.close());
