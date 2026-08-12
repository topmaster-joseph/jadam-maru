import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = p => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const esc = (s='') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const store = read('content/store.json');
const menus = read('content/menus.json');
const config = read('content/marketing-ai-cases.json');
const out = path.join(root, 'dist', 'marketing-ai');
fs.mkdirSync(out, {recursive:true});

const css = `
:root{--bg:#f4f6f8;--panel:#fff;--ink:#17202a;--muted:#66727e;--line:#dfe5ea;--accent:#17202a;--soft:#eef2f5}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:system-ui,-apple-system,"Noto Sans KR",sans-serif}a{text-decoration:none;color:inherit}.shell{min-height:100vh;display:flex;flex-direction:column}.top{padding:20px clamp(18px,4vw,48px);display:flex;align-items:center;justify-content:space-between;gap:20px}.product{font-size:18px;font-weight:900;letter-spacing:-.03em}.badge{font-size:12px;font-weight:800;padding:7px 10px;border-radius:999px;background:var(--soft);color:var(--muted)}main{width:min(1080px,100%);margin:auto;padding:32px 20px 64px}.hero{text-align:center;max-width:760px;margin:4vh auto 34px}.eyebrow{font-size:12px;font-weight:900;letter-spacing:.12em;color:var(--muted)}h1{font-size:clamp(36px,6vw,68px);line-height:1.04;letter-spacing:-.055em;margin:12px 0}.hero p{font-size:clamp(16px,2vw,20px);line-height:1.65;color:var(--muted);margin:0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:20px;min-height:154px}.card small{display:block;color:var(--muted);margin-bottom:10px}.card strong{font-size:20px;letter-spacing:-.03em}.card p{color:var(--muted);font-size:14px;line-height:1.55;margin:10px 0 0}.menu{margin-top:14px;background:var(--panel);border:1px solid var(--line);border-radius:20px;padding:20px}.menu h2{margin:0 0 12px;font-size:18px}.row{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-top:1px solid var(--soft)}.row:first-of-type{border-top:0}.row b{white-space:nowrap}.empty{color:var(--muted);padding:12px 0}.actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:28px}.btn{border:0;border-radius:14px;padding:13px 18px;font-weight:850;background:var(--accent);color:#fff}.btn[disabled]{opacity:.42;cursor:not-allowed}.powered{margin-top:auto;text-align:center;padding:20px;font-size:12px;font-weight:800;color:#4e5964}.powered span{font-weight:950;color:#111820}.case-list{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.case-card{background:#fff;border:1px solid var(--line);border-radius:18px;padding:20px}.case-card.disabled{opacity:.6}.case-card strong{display:block;font-size:20px;margin:8px 0}.case-card small{color:var(--muted)}.qa-card{display:flex;flex-direction:column;gap:12px}.qa-status{display:inline-flex;align-self:flex-start;font-size:12px;font-weight:900;padding:6px 9px;border-radius:999px;background:#fff4d6;color:#7a4d00}.qa-open{display:inline-flex;align-items:center;justify-content:center;margin-top:auto;background:var(--accent);color:#fff;padding:12px 14px;border-radius:12px;font-weight:900}.qa-note{margin-top:20px;text-align:center;color:var(--muted);font-size:13px;line-height:1.6}@media(max-width:760px){.top{padding:16px 18px}.grid,.case-list{grid-template-columns:1fr}.hero{margin-top:2vh}.card{min-height:0}main{padding-top:18px}h1{font-size:44px}}
`;

const brandById = new Map((menus.brands || []).map(b => [b.id, b]));
const customDomains = Object.freeze({
  jadam: 'https://jadam.ekodi.kr/',
  pizzamaru: 'https://pizzamaru.ekodi.kr/',
  yogurtpurple: 'https://yogurtpurple.ekodi.kr/'
});

for (const item of config.cases || []) {
  const brand = brandById.get(item.brandId);
  const menuRows = (brand?.items || []).filter(m => Number.isInteger(m.price) && m.price >= 0).map(m => `<div class="row"><span>${esc(m.name)}</span><b>${Number(m.price).toLocaleString('ko-KR')}원</b></div>`).join('');
  const menuBody = menuRows || `<div class="empty">가격이 확인된 메뉴부터 순차적으로 연결합니다. 확인되지 않은 가격은 표시하지 않습니다.</div>`;
  const dir = path.join(out, item.slug);
  fs.mkdirSync(dir, {recursive:true});
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>${esc(item.storeName)} | ${esc(config.productName)}</title><meta name="description" content="${esc(item.storeName)} ${esc(config.productName)} 적용사례"><style>${css}</style></head><body><div class="shell"><header class="top"><div class="product">${esc(config.productName)}</div><span class="badge">검수 중</span></header><main><section class="hero"><div class="eyebrow">MARKETING AI · ${esc(item.categoryLabel)}</div><h1>${esc(item.storeName)}</h1><p>${esc(item.headline)}. 매장 데이터와 콘텐츠, 채널 운영을 하나의 흐름으로 연결합니다.</p></section><section class="grid"><article class="card"><small>오늘의 콘텐츠</small><strong>추천 초안 준비</strong><p>매장 정보와 확인된 메뉴를 기준으로 게시 전 검토 가능한 콘텐츠를 준비합니다.</p></article><article class="card"><small>채널 운영</small><strong>한 곳에서 관리</strong><p>향후 네이버·인스타그램·유튜브 등 연결 채널을 점포별로 관리합니다.</p></article><article class="card"><small>매장 데이터</small><strong>${esc(store.phone)}</strong><p>${esc(store.address)}<br>${esc(store.hours.display)} · ${esc(store.hours.note)}</p></article></section><section class="menu"><h2>확인된 메뉴 데이터</h2>${menuBody}<p class="empty">기준 확인일 ${esc(menus.lastVerified)} · 주문 기능은 검수 완료 후에만 활성화됩니다.</p></section><div class="actions"><button class="btn" type="button" disabled>콘텐츠 만들기 · 검수 후 활성화</button><button class="btn" type="button" disabled>채널 게시 · 검수 후 활성화</button></div></main><footer class="powered">Powered by <span>${esc(config.poweredBy)}</span></footer></div></body></html>`;
  fs.writeFileSync(path.join(dir, 'index.html'), html);
}

const cards = (config.cases || []).map(item => config.publicLinksEnabled && item.status === 'approved'
  ? `<a class="case-card" href="./${esc(item.slug)}/"><small>${esc(item.categoryLabel)}</small><strong>${esc(item.storeName)}</strong><span>열기 →</span></a>`
  : `<article class="case-card disabled" aria-disabled="true"><small>${esc(item.categoryLabel)} · 검수 중</small><strong>${esc(item.storeName)}</strong><span>배포·검수 완료 후 공개</span></article>`).join('');
const index = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${esc(config.productName)} 적용사례</title><style>${css}</style></head><body><div class="shell"><header class="top"><div class="product">${esc(config.productName)}</div><span class="badge">APPLICATION CASES</span></header><main><section class="hero"><div class="eyebrow">MARKETING AI</div><h1>매장마다 같은 엔진,<br>각자의 브랜드.</h1><p>검수 완료된 점포만 공개 링크가 활성화됩니다.</p></section><section class="case-list">${cards}</section></main><footer class="powered">Powered by <span>${esc(config.poweredBy)}</span></footer></div></body></html>`;
fs.writeFileSync(path.join(out, 'index.html'), index);

const qaCards = (config.cases || []).map(item => {
  const href = customDomains[item.slug] || `../${esc(item.slug)}/`;
  const label = item.status === 'approved' ? '승인' : item.status === 'needs_changes' ? '수정 필요' : '승인 대기';
  return `<article class="case-card qa-card"><small>${esc(item.categoryLabel)}</small><strong>${esc(item.storeName)}</strong><span class="qa-status">${esc(label)}</span><a class="qa-open" href="${esc(href)}" target="_blank" rel="noopener">새창에서 검수하기 ↗</a></article>`;
}).join('');
const qaDir = path.join(out, 'qa');
fs.mkdirSync(qaDir, {recursive:true});
const qa = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>${esc(config.productName)} 검수센터</title><style>${css}</style></head><body><div class="shell"><header class="top"><div class="product">${esc(config.productName)} 검수센터</div><span class="badge">QA ONLY</span></header><main><section class="hero"><div class="eyebrow">MARKETING AI QA</div><h1>배포 전에<br>직접 확인합니다.</h1><p>각 점포를 새창으로 열어 브랜드명, 매장정보, 확인된 메뉴, 모바일 화면과 링크 동작을 검수합니다.</p></section><section class="case-list">${qaCards}</section><p class="qa-note">이 페이지는 검색엔진에 노출하지 않습니다. 공개 승인 전까지 마케팅AI 메인 화면의 점포 링크는 비활성 상태를 유지합니다.</p></main><footer class="powered">Powered by <span>${esc(config.poweredBy)}</span></footer></div></body></html>`;
fs.writeFileSync(path.join(qaDir, 'index.html'), qa);

console.log(`✅ Marketing AI 적용사례 ${config.cases?.length || 0}개 생성 완료`);
