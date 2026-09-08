import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const operatorConfig = readJson('content/operator-stores.json');
const file = path.join(root, 'dist', 'index.html');
if (!fs.existsSync(file)) throw new Error('Build the public site before applying the operator main patch.');

const stores = operatorConfig.stores || [];
if (stores.length !== 3) throw new Error('Operator gateway requires exactly three independent store entries.');
for (const store of stores) {
  if (!store.slug || !store.name || !store.publicSite) {
    throw new Error(`Invalid operator store configuration: ${store.slug || 'unknown'}`);
  }
}

const operator = operatorConfig.operator || {};
const brandMeta = {
  jadam: {
    short: '자담치킨',
    kicker: 'WELL-BEING CHICKEN',
    accent: '#f25a1d',
    accentDark: '#b73512',
    soft: '#fff1e7',
    ink: '#572313',
    hero: '바삭하고 든든한 오늘의 치킨',
    chips: ['치킨', '포장', '배달'],
  },
  pizzamaru: {
    short: '피자마루',
    kicker: 'FRESH PIZZA',
    accent: '#158547',
    accentDark: '#0c5f32',
    soft: '#eaf7ef',
    ink: '#123f29',
    hero: '좋은 재료로 채운 따뜻한 피자',
    chips: ['피자', '사이드', '배달'],
  },
  yogurtpurple: {
    short: '요거트퍼플',
    kicker: 'YOGURT DESSERT',
    accent: '#7f38b8',
    accentDark: '#5e278f',
    soft: '#f5ebfb',
    ink: '#42215e',
    hero: '산뜻하고 달콤한 한 컵의 휴식',
    chips: ['요거트', '디저트', '토핑'],
  },
};

const cards = stores.map((store, index) => {
  const meta = brandMeta[store.slug];
  if (!meta) throw new Error(`Missing gateway brand metadata: ${store.slug}`);
  return `<article class="gate-card gate-${esc(store.slug)}" style="--accent:${meta.accent};--accent-dark:${meta.accentDark};--soft:${meta.soft};--brand-ink:${meta.ink}">
    <div class="gate-card-top">
      <div><small>${esc(meta.kicker)}</small><h2>${esc(meta.short)}</h2></div>
      <span class="store-number">0${index + 1}</span>
    </div>
    <div class="store-identity">
      <span class="store-emoji" aria-hidden="true">${esc(store.emoji)}</span>
      <div><b>목포대점</b><p>${esc(meta.hero)}</p></div>
    </div>
    <p class="store-summary">${esc(store.summary || '')}</p>
    <div class="store-chips">${meta.chips.map(chip => `<span>${esc(chip)}</span>`).join('')}</div>
    <div class="gate-actions">
      <a class="gate-enter" href="${esc(store.publicSite)}" aria-label="${esc(store.name)} 매장 페이지로 이동">매장 입장 <span>→</span></a>
      <div>
        <a href="${esc(store.publicSite)}">매장 정보</a>
        <a href="${esc(store.publicSite)}">주문 · 배달</a>
      </div>
    </div>
  </article>`;
}).join('');

const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '자담&마루 새 매장 통합 게이트',
  itemListElement: stores.map((store, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: store.name,
    url: store.publicSite,
  })),
};

const css = `<style data-store-gateway>
:root{--ink:#171612;--muted:#6f6a61;--line:#e8e1d7;--paper:#fbf8f2;--panel:#fffdf9;--shadow:0 22px 60px rgba(55,44,30,.09)}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 8% 0%,#fff7e8 0,transparent 28%),radial-gradient(circle at 92% 12%,#eef8ed 0,transparent 28%),var(--paper)!important;color:var(--ink);font-family:"Noto Sans KR",system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
a{color:inherit;text-decoration:none}.gateway-notice{min-height:34px;display:flex;align-items:center;justify-content:center;padding:7px 16px;background:#173f2a;color:#fff;font-size:11px;font-weight:800;letter-spacing:.02em;text-align:center}
.gateway-header{height:70px;display:flex;align-items:center;justify-content:space-between;padding:0 max(18px,4vw);border-bottom:1px solid rgba(110,94,70,.12);background:rgba(251,248,242,.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
.gateway-logo{display:flex;align-items:center;gap:10px;font-weight:900;letter-spacing:-.04em}.gateway-logo i{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#173f2a;color:white;font:800 11px "Manrope",sans-serif;font-style:normal}.gateway-logo span{font-size:16px}.gateway-call{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border:1px solid var(--line);border-radius:999px;background:#fff;font-size:12px;font-weight:850}.gateway-call strong{color:#173f2a}
.gateway-main{width:min(1480px,100%);min-height:calc(100svh - 104px);margin:0 auto;padding:clamp(24px,3.6vw,48px) max(18px,3vw) 28px;display:flex;flex-direction:column;justify-content:center}
.gateway-intro{text-align:center;margin:0 auto clamp(24px,3vw,38px);max-width:820px}.gateway-kicker{margin:0 0 10px;color:#17814c;font:900 11px "Manrope",sans-serif;letter-spacing:.18em}.gateway-intro h1{margin:0;font-size:clamp(34px,4.5vw,62px);line-height:1.02;letter-spacing:-.065em}.gateway-intro h1 em{font-style:normal;color:#17814c}.gateway-intro p{margin:14px auto 0;color:var(--muted);font-size:14px;line-height:1.7}.gateway-intro .independent{display:inline-flex;align-items:center;gap:7px;margin-top:12px;padding:7px 11px;border-radius:999px;background:#fff;border:1px solid var(--line);font-size:10px;font-weight:800;color:#6b635a}
.gateway-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.gate-card{position:relative;overflow:hidden;min-height:430px;padding:26px;border-radius:30px;border:1px solid color-mix(in srgb,var(--accent) 18%,#e5ddd2);background:linear-gradient(180deg,#fff 0%,var(--soft) 100%);box-shadow:var(--shadow);display:flex;flex-direction:column;isolation:isolate}.gate-card:before{content:"";position:absolute;width:210px;height:210px;border-radius:50%;right:-80px;top:-90px;background:color-mix(in srgb,var(--accent) 16%,transparent);z-index:-1}.gate-card:after{content:"";position:absolute;width:160px;height:160px;border-radius:48% 52% 61% 39%;left:-95px;bottom:-90px;background:color-mix(in srgb,var(--accent) 10%,transparent);z-index:-1}
.gate-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.gate-card-top small{display:block;margin-bottom:8px;color:var(--accent-dark);font:900 9px "Manrope",sans-serif;letter-spacing:.15em}.gate-card h2{margin:0;color:var(--brand-ink);font-size:clamp(26px,2.3vw,36px);line-height:1;letter-spacing:-.06em}.store-number{display:grid;place-items:center;min-width:42px;height:42px;border-radius:14px;background:#fff;border:1px solid color-mix(in srgb,var(--accent) 15%,#eee);color:var(--accent-dark);font:900 11px "Manrope",sans-serif}
.store-identity{display:flex;align-items:center;gap:16px;margin:28px 0 16px}.store-emoji{display:grid;place-items:center;width:82px;height:82px;border-radius:24px;background:#fff;box-shadow:0 12px 30px rgba(40,30,20,.08);font-size:46px}.store-identity b{display:block;color:var(--accent-dark);font-size:17px;letter-spacing:-.03em}.store-identity p{margin:5px 0 0;color:var(--muted);font-size:12px}.store-summary{margin:0;min-height:44px;color:#5f5a52;font-size:12px;line-height:1.7}.store-chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:18px}.store-chips span{padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.74);border:1px solid rgba(80,60,40,.08);color:var(--accent-dark);font-size:10px;font-weight:800}
.gate-actions{margin-top:auto;padding-top:24px}.gate-enter{display:flex;align-items:center;justify-content:space-between;width:100%;padding:15px 17px;border-radius:16px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));color:#fff;font-size:14px;font-weight:900;box-shadow:0 12px 25px color-mix(in srgb,var(--accent) 23%,transparent)}.gate-enter span{font-size:20px}.gate-actions>div{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}.gate-actions>div a{display:flex;align-items:center;justify-content:center;padding:10px;border-radius:13px;background:#fff;border:1px solid rgba(80,60,40,.1);font-size:10px;font-weight:850}
.gateway-footer{display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:22px;color:#766f65;font-size:10px}.gateway-footer span{display:flex;align-items:center;gap:6px}.gateway-footer i{width:4px;height:4px;border-radius:50%;background:#c6bbaa}.gateway-footer a{font-weight:850;color:#173f2a}
@media(max-width:900px){.gateway-main{justify-content:flex-start}.gateway-grid{grid-template-columns:1fr}.gate-card{min-height:360px}.gateway-intro{margin-top:4px}.gateway-intro h1{font-size:42px}}
@media(max-width:560px){.gateway-notice{font-size:9px}.gateway-header{height:62px}.gateway-logo span{font-size:14px}.gateway-call span{display:none}.gateway-main{padding:24px 13px 28px}.gateway-intro h1{font-size:36px}.gateway-intro p{font-size:12px}.gate-card{padding:21px;border-radius:24px}.store-emoji{width:70px;height:70px;font-size:38px}.gateway-footer{line-height:1.6}}
@media(prefers-reduced-motion:no-preference){.gate-card{transition:transform .22s ease,box-shadow .22s ease}.gate-card:hover{transform:translateY(-5px);box-shadow:0 28px 70px rgba(55,44,30,.13)}.gate-enter{transition:transform .18s ease}.gate-enter:hover{transform:translateY(-1px)}}
</style>`;

const body = `<body>
  <div class="gateway-notice">자담치킨 · 피자마루 · 요거트퍼플 목포대점 통합 연결 화면</div>
  <header class="gateway-header">
    <a class="gateway-logo" href="#top" aria-label="새 매장 통합 게이트 홈"><i>J&M</i><span>새 매장 통합 게이트</span></a>
    <a class="gateway-call" href="${esc(operator.contactHref || '#')}"><span>공통 운영문의</span><strong>${esc(operator.contact || '')}</strong></a>
  </header>
  <main id="top" class="gateway-main">
    <section class="gateway-intro" aria-labelledby="gateway-title">
      <p class="gateway-kicker">THREE STORES · ONE GATE</p>
      <h1 id="gateway-title">오늘은 어떤 맛으로<br><em>들어가 볼까요?</em></h1>
      <p>자담치킨, 피자마루, 요거트퍼플. 원하는 매장을 고르면 각 매장의 주소·연락처·메뉴·주문·배달 연결 화면으로 바로 이동합니다.</p>
      <span class="independent">각 매장은 별도의 가게와 메뉴로 독립 운영됩니다.</span>
    </section>
    <section class="gateway-grid" aria-label="새 매장 선택">${cards}</section>
    <div class="gateway-footer">
      <span>운영 거점 ${esc(operator.operationBase || '')}</span><i></i>
      <span>기본 운영시간 ${esc(operator.hours || '')}</span><i></i>
      <a href="${esc(operator.contactHref || '#')}">전화 문의</a>
      <span>·</span><a href="privacy.html">개인정보처리방침</a>
    </div>
  </main>
</body>`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>새 매장 통합 게이트 | 자담치킨 · 피자마루 · 요거트퍼플 목포대점</title>');
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="자담치킨 목포대점, 피자마루 목포대점, 요거트퍼플 목포대점을 한 화면에서 선택해 각 매장 페이지로 이동하는 통합 게이트입니다.">');
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
html = html.replace('</head>', `${css}</head>`);
html = html.replace(/<body>[\s\S]*<\/body>/, body);

for (const marker of ['data-store-gateway', 'THREE STORES · ONE GATE', 'gateway-grid', '자담치킨', '피자마루', '요거트퍼플', '매장 입장']) {
  if (!html.includes(marker)) throw new Error(`Store gateway contract missing: ${marker}`);
}
for (const store of stores) {
  if (!html.includes(store.publicSite)) throw new Error(`Gateway target missing: ${store.publicSite}`);
}

fs.writeFileSync(file, html);
console.log('✅ Public main is now a one-screen gateway for three independent stores.');
