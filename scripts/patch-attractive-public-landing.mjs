import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubFile = path.join(root, 'dist', 'marketing-ai', 'index.html');

if (!fs.existsSync(hubFile)) {
  throw new Error('Marketing AI hub must exist before attractive public landing patch');
}

let html = fs.readFileSync(hubFile, 'utf8');
html = html.replace(/<style data-attractive-public-landing>[\s\S]*?<\/style>/g, '');

const authHref = html.match(/id="googleCustomerAuth" href="([^"]+)"/)?.[1];
if (!authHref) throw new Error('Google auth return URL could not be resolved');

const oldHero = /<div class="hero-kicker">MARKETING AI · 필요한 만큼 자유롭게<\/div><h1>[\s\S]*?<small class="public-entry-note">[\s\S]*?<\/small><\/div>/;
if (!oldHero.test(html)) {
  throw new Error('Existing public Marketing AI hero could not be located');
}

const newHero = `<div class="hero-kicker">AI가 시장을 읽고, 고객을 움직입니다</div>
<div class="public-hero-grid">
  <div class="public-hero-message">
    <h1>바쁜 사장님을 위한<br><span>마케팅 AI 비서</span></h1>
    <p class="public-hero-desc">가게에 딱 맞는 콘텐츠와 고객이 좋아할 메시지, 어디에 올릴지까지 AI가 함께 제안합니다. 어려운 마케팅을 오늘 할 일 하나로 바꿔보세요.</p>
    <div class="public-benefits" aria-label="마케팅AI 핵심 장점">
      <span>✓ 시간은 줄이고</span><span>✓ 알릴 일은 쉽게</span><span>✓ 선택은 내가 직접</span>
    </div>
    <div class="public-hero-actions">
      <a class="public-google-cta" href="${authHref}"><i>G</i><span>Google로 무료 시작하기</span></a>
      <a class="public-tour-cta" href="#publicHowItWorks"><span>▶</span> 2분 둘러보기</a>
    </div>
    <small class="public-entry-note">Google 계정으로 무료 회원 시작 · 카드 등록 없이 시작 · 유료 전환은 직접 선택</small>
  </div>
  <div class="public-dashboard" aria-label="마케팅AI가 제안하는 주간 마케팅 화면 예시">
    <span class="public-float public-float-analysis">✓ AI 분석 완료</span>
    <div class="public-dashboard-head"><strong>이번 주 마케팅 제안</strong><span>자동 생성</span></div>
    <div class="public-recommend-card">
      <small>추천 콘텐츠</small>
      <strong>이번 주 고객이 반응할<br>한 가지 소식을 먼저 알려보세요</strong>
      <div class="public-tags"><span>#신메뉴</span><span>#단골고객</span><span>#우리동네</span></div>
    </div>
    <div class="public-dashboard-grid">
      <div><small>추천 채널</small><div class="public-channel-icons"><b>인</b><b>N</b><b>▶</b></div></div>
      <div><small>AI가 살펴보는 것</small><strong>업종 · 고객 · 시기</strong><span>가게 상황에 맞춰 제안</span></div>
    </div>
    <span class="public-float public-float-ready">✦ 오늘 홍보 준비 완료</span>
  </div>
</div>
<section class="public-value-strip" id="publicHowItWorks" aria-label="마케팅AI 주요 기능">
  <article><i>◎</i><strong>내 가게 맞춤 전략</strong><span>업종과 상황을 바탕으로 지금 필요한 일을 제안</span></article>
  <article><i>✦</i><strong>콘텐츠 빠른 생성</strong><span>홍보 문구와 게시글, 쇼츠 아이디어까지 한곳에서</span></article>
  <article><i>➤</i><strong>채널별로 확장</strong><span>필요할 때 채널 연결과 예약 운영으로 넓히기</span></article>
  <article><i>↻</i><strong>성과를 보고 개선</strong><span>반응을 살펴 다음 마케팅을 더 선명하게 다듬기</span></article>
</section>
<section class="public-outcomes" aria-label="마케팅AI 이용 흐름">
  <div><small>01 · 먼저</small><strong>내 가게를 알려주세요</strong><span>업종과 목표를 바탕으로 AI가 상황을 이해합니다.</span></div>
  <div><small>02 · 바로</small><strong>오늘 쓸 콘텐츠를 만드세요</strong><span>복잡한 도구보다 실행할 한 가지부터 시작합니다.</span></div>
  <div><small>03 · 필요할 때</small><strong>자동화 범위를 넓히세요</strong><span>채널 연결과 예약, 반복 운영은 내가 선택합니다.</span></div>
</section>`;

html = html.replace(oldHero, newHero);

const style = `<style data-attractive-public-landing>
body:not(.member-session-mode){--public-blue:#3158f5;--public-violet:#7c3aed;--public-ink:#172033;--public-muted:#687287;background:radial-gradient(circle at 76% 18%,rgba(123,92,255,.13),transparent 25%),radial-gradient(circle at 24% 5%,rgba(49,88,245,.09),transparent 26%),linear-gradient(180deg,#fbfbff 0%,#f7f8ff 48%,#fff 100%)}
body:not(.member-session-mode) main{display:block!important;width:min(1180px,100%)!important;min-height:auto!important;margin:0 auto!important;padding:46px 26px 72px!important}
body:not(.member-session-mode) .hero.hero-v2{max-width:none!important;margin:0!important;text-align:left!important}
body:not(.member-session-mode) .hero-copy{max-width:none!important}
body:not(.member-session-mode) .hero-kicker{margin-left:0!important;padding:8px 13px!important;background:rgba(255,255,255,.8)!important;border:1px solid #e0e3ff!important;box-shadow:0 8px 30px rgba(47,58,120,.06);font-size:11px!important;font-weight:900!important;color:#4d5be7!important}
.public-hero-grid{display:grid;grid-template-columns:minmax(0,1.03fr) minmax(420px,.97fr);align-items:center;gap:54px;margin-top:20px}
body:not(.member-session-mode) .public-hero-message h1{margin:0!important;max-width:650px!important;font-size:clamp(48px,5.25vw,72px)!important;line-height:1.05!important;letter-spacing:-.06em!important;color:var(--public-ink)!important}
body:not(.member-session-mode) .public-hero-message h1 span{display:inline-block;margin-top:9px;background:linear-gradient(105deg,var(--public-blue),var(--public-violet));-webkit-background-clip:text;background-clip:text;color:transparent}
.public-hero-desc{max-width:610px!important;margin:22px 0 0!important;font-size:17px!important;line-height:1.75!important;color:var(--public-muted)!important;letter-spacing:-.02em}
.public-benefits{display:flex;gap:18px;flex-wrap:wrap;margin-top:22px;color:#30394c;font-size:14px;font-weight:800}.public-benefits span{display:inline-flex;align-items:center;gap:6px}.public-benefits span::first-letter{color:var(--public-blue)}
.public-hero-actions{display:flex;gap:12px;align-items:center;margin-top:28px}.public-google-cta{width:auto!important;min-width:250px;padding:15px 20px!important;border-radius:15px!important;font-size:15px!important;box-shadow:0 14px 34px rgba(69,62,215,.22)!important}.public-google-cta:hover{transform:translateY(-1px)}
.public-tour-cta{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:52px;padding:0 18px;border:1px solid #e0e4ee;border-radius:15px;background:rgba(255,255,255,.86);color:#3d4659;font-size:14px;font-weight:850;box-shadow:0 8px 25px rgba(30,41,59,.05)}.public-tour-cta span{display:grid;place-items:center;width:24px;height:24px;border-radius:999px;background:#eef0ff;color:#5d5de6;font-size:10px}
.public-entry-note{text-align:left!important;margin-top:11px!important;font-size:10px!important;color:#858da0!important}
.public-dashboard{position:relative;padding:26px;border:1px solid rgba(223,225,244,.92);border-radius:31px;background:linear-gradient(155deg,rgba(255,255,255,.94),rgba(244,243,255,.88));box-shadow:0 34px 90px rgba(78,67,180,.17);transform:rotate(1.5deg);isolation:isolate}.public-dashboard::before{content:'';position:absolute;z-index:-1;inset:14% -10% -15% 20%;border-radius:45%;background:linear-gradient(135deg,rgba(75,83,255,.28),rgba(139,92,246,.55));filter:blur(38px);opacity:.55}
.public-dashboard-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 12px 17px}.public-dashboard-head strong{font-size:15px}.public-dashboard-head span{padding:6px 9px;border-radius:999px;background:#f0edff;color:#6956dc;font-size:9px;font-weight:900}
.public-recommend-card{padding:20px;border-radius:20px;background:linear-gradient(125deg,#6158e8,#8b5cf6);color:#fff;box-shadow:0 16px 32px rgba(103,88,220,.22)}.public-recommend-card small{display:block;font-size:10px;opacity:.82}.public-recommend-card strong{display:block;margin-top:7px;font-size:18px;line-height:1.38;letter-spacing:-.035em}.public-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:14px}.public-tags span{padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.16);font-size:9px}
.public-dashboard-grid{display:grid;grid-template-columns:.85fr 1.15fr;gap:10px;margin-top:12px}.public-dashboard-grid>div{min-height:115px;padding:16px;border:1px solid #e8e8f3;border-radius:18px;background:rgba(255,255,255,.9)}.public-dashboard-grid small{display:block;color:#82889a;font-size:9px}.public-dashboard-grid strong{display:block;margin-top:12px;font-size:14px;letter-spacing:-.03em}.public-dashboard-grid span{display:block;margin-top:5px;color:#7e8495;font-size:9px}.public-channel-icons{display:flex;gap:7px;margin-top:18px}.public-channel-icons b{display:grid;place-items:center;width:31px;height:31px;border-radius:10px;background:#f1f3ff;color:#505bd7;font-size:11px}
.public-float{position:absolute;z-index:3;display:inline-flex;align-items:center;gap:7px;padding:10px 13px;border:1px solid rgba(225,226,242,.95);border-radius:14px;background:rgba(255,255,255,.94);box-shadow:0 14px 34px rgba(60,53,130,.13);color:#46506a;font-size:10px;font-weight:900;backdrop-filter:blur(10px)}.public-float-analysis{top:-18px;right:10px}.public-float-ready{right:-24px;bottom:28px;color:#6b4bd7}
.public-value-strip{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin-top:72px;border:1px solid #e8e9f4;border-radius:25px;background:rgba(255,255,255,.9);box-shadow:0 22px 60px rgba(37,44,88,.07);overflow:hidden;scroll-margin-top:24px}.public-value-strip article{min-height:170px;padding:28px 24px;text-align:center;border-right:1px solid #ececf5}.public-value-strip article:last-child{border-right:0}.public-value-strip i{display:grid;place-items:center;width:44px;height:44px;margin:0 auto 13px;border-radius:15px;background:linear-gradient(140deg,#eff1ff,#f4edff);color:#5d5de6;font-style:normal;font-size:22px;font-weight:900}.public-value-strip strong{display:block;font-size:14px;letter-spacing:-.025em}.public-value-strip span{display:block;margin-top:8px;color:#7b8395;font-size:11px;line-height:1.55}
.public-outcomes{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}.public-outcomes>div{padding:22px;border:1px solid #ececf4;border-radius:20px;background:rgba(255,255,255,.72)}.public-outcomes small{font-size:9px;font-weight:900;color:#6c63db}.public-outcomes strong{display:block;margin-top:8px;font-size:15px}.public-outcomes span{display:block;margin-top:7px;color:#7c8495;font-size:11px;line-height:1.55}
@media(max-width:980px){.public-hero-grid{grid-template-columns:1fr;gap:46px}.public-dashboard{max-width:620px;margin:0 auto}.public-value-strip{grid-template-columns:repeat(2,1fr)}.public-value-strip article:nth-child(2){border-right:0}.public-value-strip article:nth-child(-n+2){border-bottom:1px solid #ececf5}}
@media(max-width:760px){body:not(.member-session-mode) .top{padding:14px 18px!important}body:not(.member-session-mode) main{padding:28px 18px 52px!important}.public-hero-grid{margin-top:15px;gap:36px}body:not(.member-session-mode) .public-hero-message h1{font-size:42px!important;line-height:1.08!important}.public-hero-desc{margin-top:17px!important;font-size:14px!important;line-height:1.7!important}.public-benefits{gap:10px 14px;margin-top:17px;font-size:12px}.public-hero-actions{display:grid;grid-template-columns:1fr;margin-top:22px}.public-google-cta,.public-tour-cta{width:100%!important}.public-entry-note{text-align:center!important;font-size:9px!important}.public-dashboard{padding:17px;border-radius:24px;transform:none}.public-recommend-card{padding:17px}.public-recommend-card strong{font-size:16px}.public-dashboard-grid{grid-template-columns:1fr 1fr}.public-dashboard-grid>div{min-height:102px;padding:13px}.public-float-analysis{top:-16px;right:8px}.public-float-ready{right:9px;bottom:-17px}.public-value-strip{grid-template-columns:1fr;margin-top:58px;border-radius:20px}.public-value-strip article{min-height:0;padding:21px 18px;border-right:0;border-bottom:1px solid #ececf5}.public-value-strip article:last-child{border-bottom:0}.public-value-strip i{width:38px;height:38px;margin-bottom:10px}.public-outcomes{grid-template-columns:1fr}.public-outcomes>div{padding:18px}}
@media(max-width:390px){body:not(.member-session-mode) .public-hero-message h1{font-size:37px!important}.public-dashboard-grid{grid-template-columns:1fr}.public-float{font-size:9px}.public-benefits{display:grid}}
</style>`;

html = html.replace('</head>', `${style}</head>`);

for (const required of [
  'data-attractive-public-landing',
  '바쁜 사장님을 위한',
  '마케팅 AI 비서',
  'id="publicHowItWorks"',
  'Google로 무료 시작하기',
  'class="public-dashboard"',
]) {
  if (!html.includes(required)) throw new Error(`Attractive public landing contract missing: ${required}`);
}

fs.writeFileSync(hubFile, html);
console.log('✅ Marketing AI public landing now uses a richer, mobile-first benefit-led design');
