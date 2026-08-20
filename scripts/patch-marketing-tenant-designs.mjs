import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const THEMES = {
  jadam: {
    name: '자담치킨 목포대점',
    bodyClass: 'tenant-jadam',
    hero: `<section class="hero tenant-hero jadam-hero" data-tenant-hero="jadam">
      <div class="tenant-hero-copy">
        <div class="tenant-kicker"><span>JADAM · DINNER OPS</span><b>배달·포장 전환형</b></div>
        <h1>오늘 저녁 주문 흐름을<br><em>먼저 준비합니다.</em></h1>
        <p>피크 시간 전에 어떤 메뉴를, 어떤 문구로, 어느 채널에 보여줄지 AI가 먼저 정리합니다. 점주는 확인하고 승인하는 데 집중합니다.</p>
        <div class="tenant-actions"><span>16:30 저녁 예열</span><span>17:30 피크 콘텐츠</span><span>주문·포장 KPI</span></div>
      </div>
      <aside class="jadam-ops-card" aria-label="자담치킨 오늘의 운영 포커스">
        <small>TODAY'S OPS</small>
        <strong>저녁 주문 전환</strong>
        <div><span>우선시간</span><b>16:30 → 20:30</b></div>
        <div><span>핵심행동</span><b>포장 · 재주문</b></div>
        <div><span>AI 상태</span><b>계획 승인 대기</b></div>
      </aside>
    </section>`,
  },
  pizzamaru: {
    name: '피자마루 목포대점',
    bodyClass: 'tenant-pizzamaru',
    hero: `<section class="hero tenant-hero pizza-hero" data-tenant-hero="pizzamaru">
      <div class="tenant-hero-copy">
        <div class="tenant-kicker"><span>PIZZAMARU · COMBO TABLE</span><b>메뉴조합·객단가형</b></div>
        <h1>한 판보다 중요한 건<br><em>어떤 조합으로 제안하느냐.</em></h1>
        <p>피자와 사이드, 상황과 시간대를 조합해 고객이 고르기 쉬운 제안을 만듭니다. AI는 매주 반응을 비교해 다음 조합을 준비합니다.</p>
        <div class="tenant-actions"><span>세트 제안</span><span>사이드 추가</span><span>객단가 학습</span></div>
      </div>
      <aside class="pizza-combo-board" aria-label="피자마루 조합 테스트">
        <small>THIS WEEK'S COMBO LAB</small>
        <div class="pizza-combo"><b>A</b><span>주력 피자</span><i>+</i><span>사이드</span></div>
        <div class="pizza-combo"><b>B</b><span>2~3인 상황</span><i>+</i><span>혜택 문구</span></div>
        <p>반응과 실제 주문값을 비교해 다음 주 추천 조합으로 학습합니다.</p>
      </aside>
    </section>`,
  },
  yogurtpurple: {
    name: '요거트퍼플 목포대점',
    bodyClass: 'tenant-yogurtpurple',
    hero: `<section class="hero tenant-hero yogurt-hero" data-tenant-hero="yogurtpurple">
      <div class="tenant-hero-copy">
        <div class="tenant-kicker"><span>YOGURT PURPLE · VISUAL LAB</span><b>비주얼·SNS형</b></div>
        <h1>한 컷의 분위기를<br><em>방문과 구매로 연결합니다.</em></h1>
        <p>제품 비주얼, 대학가의 시간대, 숏폼 맥락을 함께 읽어 저장하고 공유하고 찾아오게 만드는 콘텐츠 흐름을 준비합니다.</p>
        <div class="tenant-actions"><span>Visual 3안</span><span>15~30초 Shorts</span><span>저장·방문 KPI</span></div>
      </div>
      <aside class="yogurt-visual-board" aria-label="요거트퍼플 비주얼 실험 방향">
        <small>CREATIVE DIRECTIONS</small>
        <div class="visual-orbits"><span>PRODUCT</span><span>FRESH</span><span>MOOD</span></div>
        <strong>이번 주 3가지 비주얼 방향</strong>
        <p>제품 중심 · 가벼운 건강 이미지 · 감성형 콘텐츠를 나눠 반응을 비교합니다.</p>
      </aside>
    </section>`,
  },
};

const sharedCss = `
<style data-ekodi-tenant-designs>
body[class*="tenant-"]{--tenant-ink:#15171a;--tenant-muted:#69717a;--tenant-surface:#fff;--tenant-line:rgba(20,24,28,.1);--tenant-accent:#222;--tenant-soft:#f5f6f7;background:var(--tenant-bg,#f4f6f8);color:var(--tenant-ink)}
body[class*="tenant-"] .top{background:color-mix(in srgb,var(--tenant-surface) 94%,transparent);border-bottom:1px solid var(--tenant-line);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}
body[class*="tenant-"] main{width:min(1180px,100%);padding-top:22px}
body[class*="tenant-"] .tenant-hero{max-width:none;margin:0 0 18px;text-align:left;display:grid;grid-template-columns:minmax(0,1.45fr) minmax(290px,.7fr);gap:18px;align-items:stretch}
body[class*="tenant-"] .tenant-hero-copy,body[class*="tenant-"] .tenant-hero aside{border:1px solid var(--tenant-line);background:var(--tenant-surface);box-shadow:0 18px 50px rgba(20,24,28,.07)}
body[class*="tenant-"] .tenant-hero-copy{padding:clamp(24px,4vw,48px)}
body[class*="tenant-"] .tenant-hero h1{font-size:clamp(38px,6vw,72px);line-height:.98;letter-spacing:-.065em;margin:18px 0 18px;max-width:840px}
body[class*="tenant-"] .tenant-hero h1 em{font-style:normal;color:var(--tenant-accent)}
body[class*="tenant-"] .tenant-hero p{font-size:clamp(14px,1.7vw,18px);line-height:1.7;color:var(--tenant-muted);max-width:740px}
body[class*="tenant-"] .tenant-kicker{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:11px;font-weight:900;letter-spacing:.08em}
body[class*="tenant-"] .tenant-kicker span,body[class*="tenant-"] .tenant-kicker b{display:inline-flex;padding:7px 10px;border-radius:999px;background:var(--tenant-soft)}
body[class*="tenant-"] .tenant-kicker b{background:var(--tenant-accent);color:#fff}
body[class*="tenant-"] .tenant-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}
body[class*="tenant-"] .tenant-actions span{border:1px solid var(--tenant-line);background:color-mix(in srgb,var(--tenant-soft) 84%,#fff);border-radius:999px;padding:9px 12px;font-size:12px;font-weight:850}
body[class*="tenant-"] .pilot-wrap{margin-top:14px}
body[class*="tenant-"] .pilot-brief,body[class*="tenant-"] .pilot-panel{border-color:var(--tenant-line);box-shadow:none}
body[class*="tenant-"] .pilot-brief{background:linear-gradient(135deg,var(--tenant-surface),var(--tenant-soft))}
body[class*="tenant-"] .pilot-chip.safe{background:color-mix(in srgb,var(--tenant-accent) 14%,#fff);color:var(--tenant-accent)}
body[class*="tenant-"] .pilot-step,body[class*="tenant-"] .pilot-goal,body[class*="tenant-"] .pilot-kpis span{background:var(--tenant-soft)}
body[class*="tenant-"] .pilot-plan article{border-color:var(--tenant-line);background:color-mix(in srgb,var(--tenant-soft) 55%,#fff)}
body[class*="tenant-"] .pilot-actions button.primary{background:var(--tenant-accent);border-color:var(--tenant-accent)}
body[class*="tenant-"] .menu,body[class*="tenant-"] .card{border-color:var(--tenant-line);box-shadow:none}

body.tenant-jadam{--tenant-bg:#f3f1ef;--tenant-surface:#fffdfb;--tenant-soft:#f4ebe8;--tenant-accent:#b52b22;--tenant-ink:#231917;--tenant-muted:#72605b;--tenant-line:rgba(94,45,37,.13)}
.tenant-jadam .tenant-hero-copy{border-radius:22px 8px 22px 8px;background:linear-gradient(145deg,#fffdfb 0%,#fff7f3 72%,#f5e2dc 100%)}
.tenant-jadam .jadam-ops-card{border-radius:8px 22px 8px 22px;padding:28px;background:#261816!important;color:#fff;display:flex;flex-direction:column;justify-content:center;gap:14px}
.tenant-jadam .jadam-ops-card small{color:#d8b9b2;font-weight:900;letter-spacing:.14em}.tenant-jadam .jadam-ops-card>strong{font-size:28px;letter-spacing:-.04em}.tenant-jadam .jadam-ops-card div{display:flex;justify-content:space-between;gap:16px;padding-top:12px;border-top:1px solid rgba(255,255,255,.12)}.tenant-jadam .jadam-ops-card span{color:#d7c6c1;font-size:12px}.tenant-jadam .jadam-ops-card b{font-size:12px}.tenant-jadam .pilot-panel{border-radius:10px 22px}.tenant-jadam .pilot-brief{border-radius:22px 10px}.tenant-jadam .card,.tenant-jadam .menu{border-radius:10px 20px}

body.tenant-pizzamaru{--tenant-bg:#f7f1e7;--tenant-surface:#fffaf0;--tenant-soft:#f6e7c7;--tenant-accent:#c56a16;--tenant-ink:#2c2117;--tenant-muted:#776653;--tenant-line:rgba(105,72,34,.15)}
.tenant-pizzamaru .tenant-hero-copy{border-radius:30px;background:radial-gradient(circle at 8% 14%,rgba(255,211,123,.35),transparent 28%),#fffaf0}
.tenant-pizzamaru .pizza-combo-board{border-radius:30px;padding:28px;background:#3a2a1c!important;color:#fff;display:flex;flex-direction:column;justify-content:center;gap:13px}.tenant-pizzamaru .pizza-combo-board small{color:#dfc7a8;font-weight:900;letter-spacing:.13em}.tenant-pizzamaru .pizza-combo{display:grid;grid-template-columns:34px 1fr 24px 1fr;gap:8px;align-items:center;padding:12px;background:rgba(255,255,255,.08);border-radius:16px}.tenant-pizzamaru .pizza-combo b{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f1a94b;color:#3a2a1c}.tenant-pizzamaru .pizza-combo i{font-style:normal;text-align:center;color:#f1a94b}.tenant-pizzamaru .pizza-combo-board p{color:#ddcbb6;font-size:12px;margin:4px 0 0}.tenant-pizzamaru .pilot-panel,.tenant-pizzamaru .pilot-brief,.tenant-pizzamaru .card,.tenant-pizzamaru .menu{border-radius:26px}.tenant-pizzamaru .pilot-plan article{border-radius:20px}

body.tenant-yogurtpurple{--tenant-bg:#f6f3fa;--tenant-surface:#fff;--tenant-soft:#f0e9f7;--tenant-accent:#7450a8;--tenant-ink:#261f2d;--tenant-muted:#766d7f;--tenant-line:rgba(101,74,132,.13)}
.tenant-yogurtpurple .tenant-hero-copy{border-radius:36px;background:radial-gradient(circle at 12% 18%,rgba(224,203,244,.72),transparent 26%),radial-gradient(circle at 88% 82%,rgba(255,217,233,.65),transparent 24%),#fff}
.tenant-yogurtpurple .yogurt-visual-board{border-radius:36px;padding:30px;background:linear-gradient(150deg,#352646,#7553a1 58%,#b985b5)!important;color:#fff;display:flex;flex-direction:column;justify-content:center;gap:16px;overflow:hidden;position:relative}.tenant-yogurtpurple .yogurt-visual-board:after{content:"";position:absolute;width:170px;height:170px;border-radius:50%;background:rgba(255,255,255,.08);right:-55px;top:-55px}.tenant-yogurtpurple .yogurt-visual-board small{font-weight:900;letter-spacing:.14em;color:#e8dff1}.tenant-yogurtpurple .visual-orbits{display:flex;gap:8px;flex-wrap:wrap}.tenant-yogurtpurple .visual-orbits span{padding:10px 12px;border-radius:999px;background:rgba(255,255,255,.13);font-size:10px;font-weight:900;letter-spacing:.08em}.tenant-yogurtpurple .yogurt-visual-board>strong{font-size:22px;letter-spacing:-.04em}.tenant-yogurtpurple .yogurt-visual-board p{color:#eee7f4;font-size:12px;margin:0}.tenant-yogurtpurple .pilot-panel,.tenant-yogurtpurple .pilot-brief,.tenant-yogurtpurple .card,.tenant-yogurtpurple .menu{border-radius:32px}.tenant-yogurtpurple .pilot-plan article{border-radius:24px}.tenant-yogurtpurple .pilot-table-wrap{border-radius:20px}

@media(max-width:760px){
  body[class*="tenant-"] .top{position:sticky;top:0;z-index:60;padding-top:calc(12px + env(safe-area-inset-top));min-height:62px}
  body[class*="tenant-"] main{padding:14px 14px 54px}
  body[class*="tenant-"] .tenant-hero{grid-template-columns:1fr;gap:10px}
  body[class*="tenant-"] .tenant-hero-copy{padding:26px 20px}
  body[class*="tenant-"] .tenant-hero h1{font-size:42px}
  body[class*="tenant-"] .tenant-hero aside{padding:22px}
  body[class*="tenant-"] .pilot-brief,body[class*="tenant-"] .pilot-panel{padding:17px}
  .tenant-jadam .tenant-hero-copy,.tenant-jadam .jadam-ops-card{border-radius:18px}
  .tenant-pizzamaru .tenant-hero-copy,.tenant-pizzamaru .pizza-combo-board{border-radius:22px}
  .tenant-yogurtpurple .tenant-hero-copy,.tenant-yogurtpurple .yogurt-visual-board{border-radius:26px}
}
</style>`;

for (const [slug, theme] of Object.entries(THEMES)) {
  const file = path.join(root, 'dist', 'marketing-ai', slug, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`${slug}: generated workspace missing`);
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes(`data-ekodi-marketing-pilot="${slug}"`)) throw new Error(`${slug}: pilot workspace must be present before tenant design patch`);

  html = html.replace(/<style data-ekodi-tenant-designs>[\s\S]*?<\/style>/g, '');
  html = html.replace(/<body(?:\s+class="[^"]*")?>/, match => {
    const current = match.match(/class="([^"]*)"/)?.[1] || '';
    const next = [...new Set(`${current} ${theme.bodyClass}`.trim().split(/\s+/).filter(Boolean))].join(' ');
    return `<body class="${next}">`;
  });

  const hero = html.match(/<section class="hero(?: [^"]*)?">[\s\S]*?<\/section>/)?.[0];
  if (!hero) throw new Error(`${slug}: hero section missing`);
  html = html.replace(hero, theme.hero);
  html = html.replace('</head>', `${sharedCss}</head>`);

  for (const marker of [`data-tenant-hero="${slug}"`, theme.bodyClass, 'data-ekodi-tenant-designs', 'data-ekodi-marketing-pilot']) {
    if (!html.includes(marker)) throw new Error(`${slug}: tenant design contract missing ${marker}`);
  }
  fs.writeFileSync(file, html);
}

console.log('✅ Marketing AI tenant-tailored designs applied: jadam, pizzamaru, yogurtpurple');
