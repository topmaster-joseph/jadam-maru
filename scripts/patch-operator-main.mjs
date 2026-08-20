import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const readJson = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

const operatorConfig = readJson('content/operator-stores.json');
const menus = readJson('content/menus.json');
const file = path.join(root, 'dist', 'index.html');
if (!fs.existsSync(file)) throw new Error('Build the public site before applying the operator main patch.');

const stores = operatorConfig.stores || [];
if (stores.length !== 3) throw new Error('Operator main requires exactly three independent store entries.');
for (const store of stores) {
  if (!store.slug || !store.name || !store.brandId || !store.publicSite || !store.marketingAi) {
    throw new Error(`Invalid operator store configuration: ${store.slug || 'unknown'}`);
  }
}

const menuByBrand = new Map((menus.brands || []).map(item => [item.id, item]));
const storeCards = stores.map((store, index) => {
  const menu = menuByBrand.get(store.brandId);
  if (!menu) throw new Error(`${store.slug}: matching menu brand not found: ${store.brandId}`);
  const items = (menu.items || []).slice(0, 3).map(item => `<li><span>${esc(item.name)}</span><b>${esc(item.priceDisplay)}</b></li>`).join('');
  return `<article class="operator-store store-${esc(store.slug)}">
    <div class="store-topline"><span>0${index + 1}</span><b>${esc(store.category)}</b></div>
    <div class="store-icon" aria-hidden="true">${esc(store.emoji)}</div>
    <h2>${esc(store.name)}</h2>
    <p>${esc(store.summary)}</p>
    <div class="store-menu"><small>대표 메뉴</small><ul>${items}</ul></div>
    <div class="store-actions">
      <a class="store-main-link" href="${esc(store.publicSite)}">매장 보기 <span>→</span></a>
      <a class="store-ai-link" href="${esc(store.marketingAi)}">Marketing AI</a>
    </div>
  </article>`;
}).join('');

const operator = operatorConfig.operator || {};
const schema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: '자담&마루 운영매장',
  itemListElement: stores.map((store, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: store.name,
    url: store.publicSite,
  })),
};

const css = `<style data-operator-main>
:root{--op-ink:#171615;--op-muted:#706c68;--op-line:#e7e1db;--op-paper:#fbfaf8;--op-dark:#1f1c1a;--op-jadam:#a8392e;--op-pizza:#c9771d;--op-yogurt:#7350a3}
body{background:var(--op-paper)!important;color:var(--op-ink)}
.operator-notice{min-height:34px;display:flex;align-items:center;justify-content:center;padding:8px 16px;background:var(--op-dark);color:#fff;font-size:11px;font-weight:800;letter-spacing:.08em;text-align:center}
.operator-header{position:sticky;top:0;z-index:70;min-height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 max(20px,5vw);background:rgba(251,250,248,.94);border-bottom:1px solid var(--op-line);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}
.operator-logo{display:flex;align-items:center;gap:11px;font-weight:900}.operator-logo i{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--op-dark);color:#fff;font:800 11px system-ui;font-style:normal}.operator-logo span{font-size:18px;letter-spacing:-.04em}.operator-nav{display:flex;gap:26px;font-size:12px;font-weight:800}.operator-nav a{color:#55504c}.operator-contact{padding:10px 13px;border-radius:999px;background:#fff;border:1px solid var(--op-line)}
.operator-main{max-width:1240px;margin:0 auto;padding:0 24px 80px}
.operator-hero{min-height:520px;display:grid;grid-template-columns:minmax(0,1.15fr) minmax(340px,.85fr);gap:24px;align-items:stretch;padding:44px 0 24px}.operator-hero-copy{display:flex;flex-direction:column;justify-content:center;padding:clamp(24px,5vw,58px);border:1px solid var(--op-line);border-radius:34px;background:#fff}.operator-kicker{font-size:10px;font-weight:900;letter-spacing:.15em;color:#7a746f}.operator-hero h1{margin:16px 0 18px;font-size:clamp(46px,6vw,78px);line-height:.98;letter-spacing:-.07em}.operator-hero h1 em{font-style:normal;color:#8a3128}.operator-hero p{max-width:700px;margin:0;color:var(--op-muted);font-size:16px;line-height:1.8}.operator-hero-note{display:flex;gap:8px;flex-wrap:wrap;margin-top:26px}.operator-hero-note span{padding:8px 11px;border-radius:999px;background:#f4f1ed;font-size:11px;font-weight:850}
.operator-stack{display:grid;grid-template-rows:repeat(3,1fr);gap:10px}.operator-stack a{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:22px 24px;border-radius:26px;color:#fff;min-height:132px}.operator-stack a:after{content:"";position:absolute;width:150px;height:150px;border-radius:50%;right:-48px;top:-52px;background:rgba(255,255,255,.1)}.operator-stack .stack-jadam{background:#4d2722}.operator-stack .stack-pizzamaru{background:#68431f}.operator-stack .stack-yogurtpurple{background:#49375d}.operator-stack small{display:block;margin-bottom:6px;font-size:9px;font-weight:900;letter-spacing:.14em;opacity:.72}.operator-stack b{font-size:22px;letter-spacing:-.04em}.operator-stack strong{font-size:30px;z-index:1}
.operator-section-head{display:flex;align-items:end;justify-content:space-between;gap:24px;padding:72px 2px 26px}.operator-section-head small{font-size:10px;font-weight:900;letter-spacing:.15em;color:#8a8179}.operator-section-head h2{font-size:clamp(34px,4.5vw,58px);line-height:1.08;letter-spacing:-.06em;margin:10px 0 0}.operator-section-head p{max-width:430px;margin:0;color:var(--op-muted);line-height:1.7;font-size:13px}
.operator-store-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.operator-store{position:relative;display:flex;flex-direction:column;min-height:520px;padding:26px;border:1px solid var(--op-line);border-radius:30px;background:#fff;overflow:hidden}.operator-store:before{content:"";position:absolute;inset:0 0 auto;height:6px;background:var(--store-accent)}.store-jadam{--store-accent:var(--op-jadam);--store-soft:#f9ece9}.store-pizzamaru{--store-accent:var(--op-pizza);--store-soft:#fbf0df}.store-yogurtpurple{--store-accent:var(--op-yogurt);--store-soft:#f3edf9}.store-topline{display:flex;justify-content:space-between;align-items:center;color:#827a73;font-size:10px;font-weight:900;letter-spacing:.1em}.store-topline b{padding:6px 9px;border-radius:999px;background:var(--store-soft);color:var(--store-accent)}.store-icon{margin:34px 0 20px;font-size:58px}.operator-store h2{font-size:28px;letter-spacing:-.05em;margin:0 0 10px}.operator-store>p{min-height:50px;margin:0;color:var(--op-muted);font-size:13px;line-height:1.65}.store-menu{margin-top:26px;padding:18px;border-radius:20px;background:var(--store-soft)}.store-menu small{display:block;margin-bottom:8px;color:var(--store-accent);font-size:10px;font-weight:900}.store-menu ul{list-style:none;padding:0;margin:0}.store-menu li{display:flex;justify-content:space-between;gap:16px;padding:9px 0;border-top:1px solid rgba(50,40,30,.08);font-size:12px}.store-menu li b{white-space:nowrap}.store-actions{display:flex;gap:8px;margin-top:auto;padding-top:26px}.store-actions a{display:inline-flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:13px;font-size:11px;font-weight:900}.store-main-link{flex:1;background:var(--store-accent);color:#fff}.store-ai-link{border:1px solid var(--op-line);background:#fff}
.operator-info{margin-top:72px;display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:14px}.operator-info>div{padding:30px;border:1px solid var(--op-line);border-radius:30px;background:#fff}.operator-info h2{margin:0 0 12px;font-size:36px;letter-spacing:-.055em}.operator-info p{margin:0;color:var(--op-muted);line-height:1.75;font-size:13px}.operator-facts{display:grid;gap:12px}.operator-facts div{padding-bottom:12px;border-bottom:1px solid var(--op-line)}.operator-facts div:last-child{border:0;padding-bottom:0}.operator-facts small{display:block;margin-bottom:4px;color:#8a8179;font-size:10px;font-weight:900}.operator-facts b{font-size:14px}.operator-warning{margin-top:16px;padding:13px 15px;border-radius:16px;background:#f5f2ee;color:#615b56;font-size:11px;line-height:1.6}
.operator-footer{max-width:1240px;margin:0 auto;padding:28px 24px 70px;border-top:1px solid var(--op-line);display:flex;justify-content:space-between;gap:16px;color:#817a74;font-size:11px}.operator-footer a{font-weight:800}
@media(max-width:820px){.operator-header{top:0;padding-top:env(safe-area-inset-top);min-height:68px}.operator-nav a:not(.operator-contact){display:none}.operator-main{padding:0 14px 60px}.operator-hero{grid-template-columns:1fr;min-height:0;padding-top:14px}.operator-hero-copy{border-radius:24px;padding:32px 22px}.operator-hero h1{font-size:48px}.operator-stack{grid-template-rows:none;grid-template-columns:1fr}.operator-stack a{min-height:108px;border-radius:20px}.operator-section-head{display:block;padding-top:52px}.operator-section-head p{margin-top:16px}.operator-store-grid{grid-template-columns:1fr}.operator-store{min-height:auto;border-radius:24px}.operator-info{grid-template-columns:1fr;margin-top:52px}.operator-info>div{border-radius:24px}.operator-footer{flex-direction:column;padding-bottom:90px}}
</style>`;

const body = `<body>
  <div class="operator-notice">한 운영사업자가 관리하지만, 자담치킨 · 피자마루 · 요거트퍼플은 각각 별도의 매장과 메뉴로 운영됩니다.</div>
  <header class="operator-header">
    <a class="operator-logo" href="#top"><i>J&M</i><span>${esc(operator.displayName || '자담&마루 운영매장')}</span></a>
    <nav class="operator-nav" aria-label="주요 메뉴"><a href="#stores">운영매장</a><a href="#operator">운영안내</a><a class="operator-contact" href="${esc(operator.contactHref || '#')}">문의</a></nav>
  </header>
  <main id="top" class="operator-main">
    <section class="operator-hero">
      <div class="operator-hero-copy">
        <div class="operator-kicker">ONE OPERATOR · THREE INDEPENDENT STORES</div>
        <h1>한 운영자,<br><em>세 개의 가게.</em></h1>
        <p>운영주체는 같지만 가게와 메뉴, 주문 경험은 각각 다릅니다. 원하는 매장을 먼저 고른 뒤 해당 매장의 메뉴와 주문 정보를 확인하세요.</p>
        <div class="operator-hero-note"><span>운영은 함께</span><span>메뉴는 각각</span><span>주문·채널도 매장별</span></div>
      </div>
      <div class="operator-stack" aria-label="운영 매장 바로가기">
        ${stores.map(store => `<a class="stack-${esc(store.slug)}" href="${esc(store.publicSite)}"><div><small>${esc(store.category)}</small><b>${esc(store.name)}</b></div><strong>${esc(store.emoji)}</strong></a>`).join('')}
      </div>
    </section>

    <section id="stores">
      <div class="operator-section-head"><div><small>OUR STORES</small><h2>같은 운영자 아래,<br>각자의 메뉴와 경험.</h2></div><p>세 매장을 하나의 메뉴판으로 섞지 않습니다. 각 매장의 대표 메뉴와 고객 채널, Marketing AI 공간을 독립적으로 연결합니다.</p></div>
      <div class="operator-store-grid">${storeCards}</div>
      <p class="operator-warning">메뉴·가격은 매장 운영 상황에 따라 달라질 수 있으며 실제 주문 시 해당 매장의 최신 정보가 우선합니다. 기준 확인일 ${esc(menus.lastVerified || '')}</p>
    </section>

    <section class="operator-info" id="operator">
      <div><small class="operator-kicker">OPERATOR INFORMATION</small><h2>공통 운영정보는 하나로,<br>매장 운영은 분명하게.</h2><p>${esc(operator.relationship || '')} 공통 운영정보는 사업자 안내를 위한 기준이며, 각 매장의 메뉴·주문·마케팅 채널 정보는 해당 매장에서 따로 관리합니다.</p></div>
      <div class="operator-facts"><div><small>공통 운영문의</small><b>${esc(operator.contact || '')}</b></div><div><small>운영 거점</small><b>${esc(operator.operationBase || '')}</b></div><div><small>기본 운영시간</small><b>${esc(operator.hours || '')}</b><p>${esc(operator.hoursNote || '')}</p></div></div>
    </section>
  </main>
  <footer class="operator-footer"><span>© ${new Date().getFullYear()} ${esc(operator.displayName || '자담&마루 운영매장')}</span><span><a href="terms.html">이용약관</a> · <a href="privacy.html">개인정보처리방침</a></span></footer>
</body>`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>자담&마루 운영매장 | 자담치킨 · 피자마루 · 요거트퍼플</title>');
html = html.replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="동일한 운영사업자가 관리하는 자담치킨 목포대점, 피자마루 목포대점, 요거트퍼플 목포대점 안내. 각 매장은 서로 다른 메뉴와 주문 채널로 운영됩니다.">');
html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(schema)}</script>`);
html = html.replace('</head>', `${css}</head>`);
html = html.replace(/<body>[\s\S]*<\/body>/, body);

for (const marker of ['data-operator-main', 'ONE OPERATOR', 'operator-store-grid', '자담치킨 목포대점', '피자마루 목포대점', '요거트퍼플 목포대점']) {
  if (!html.includes(marker)) throw new Error(`Operator main contract missing: ${marker}`);
}
if (html.includes('치킨도, 피자도,<br>요거트도 한 번에.')) throw new Error('Old combined-menu hero copy remains.');

fs.writeFileSync(file, html);
console.log('✅ Public main now presents one operator with three independent stores.');
