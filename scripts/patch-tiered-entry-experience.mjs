import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubFile = path.join(root, 'dist', 'marketing-ai', 'index.html');
const pricingFile = path.join(root, 'content', 'marketing-ai-pricing.json');

if (!fs.existsSync(hubFile)) throw new Error('Marketing AI hub must exist before tiered entry experience patch');
if (!fs.existsSync(pricingFile)) throw new Error('Marketing AI pricing source is required for tiered entry experience');

const pricing = JSON.parse(fs.readFileSync(pricingFile, 'utf8'));
const plans = Array.isArray(pricing.plans) ? pricing.plans : [];
const requiredPlans = ['free', 'flex', 'plus', 'pro', 'auto'];
for (const id of requiredPlans) {
  if (!plans.some(plan => plan.id === id)) throw new Error(`Marketing AI plan is missing: ${id}`);
}

let html = fs.readFileSync(hubFile, 'utf8');
html = html.replace(/<style data-tiered-entry-experience>[\s\S]*?<\/style>/g, '');
html = html.replace(/<script data-tiered-entry-experience>[\s\S]*?<\/script>/g, '');
html = html.replace(/<section class="tier-shell"[\s\S]*?<\/section><!-- tier-shell:end -->/g, '');

if (!html.includes('id="googleCustomerAuth"')) throw new Error('Google membership entry is missing');
if (!html.includes('id="memberTrial"')) throw new Error('Member workspace is missing');
if (!html.includes('class="member-workspace"')) throw new Error('Member workspace details are missing');
if (!html.includes('data-public-landing-cleanup')) throw new Error('Public landing cleanup must run before tiered entry experience');

// A Google identity is FREE unless the membership service explicitly returns a paid plan.
// Never promote an account because a plan field is absent.
html = html
  .replaceAll("String(d.plan||'pro')", "String(d.plan||'free')")
  .replaceAll("String(d.plan || 'pro')", "String(d.plan || 'free')");
if (html.includes("d.plan||'pro'") || html.includes("d.plan || 'pro'")) {
  throw new Error('Unsafe paid-plan fallback survived Google membership bootstrap');
}

// Do not let an old browser marker masquerade as a current Google session.
html = html.replace(
  "const hasMemberSignal=()=>localStorage.getItem(KEY)==='1'||welcomed||/✓|이용중/.test(auth?.textContent||'');",
  "const hasMemberSignal=()=>welcomed||/✓|이용중/.test(auth?.textContent||'');",
);
html = html.replace(
  "const hasMember=()=>document.body.classList.contains('free-member-mode')||document.body.classList.contains('paid-member-mode')||localStorage.getItem(KEY)==='1'||welcomed||/✓|이용중/.test(auth?.textContent||'');",
  "const hasMember=()=>document.body.classList.contains('free-member-mode')||document.body.classList.contains('paid-member-mode')||welcomed||/✓|이용중/.test(auth?.textContent||'');",
);

const authHref = html.match(/id="googleCustomerAuth" href="([^"]+)"/)?.[1];
if (!authHref) throw new Error('Google auth return URL could not be resolved');

const publicHero = `<div class="hero-kicker">MARKETING AI · 필요한 만큼 자유롭게</div><h1>알리는 일은 더 간단하게.<br><span>선택은 끝까지 내 손에.</span></h1><p>Google로 시작하면 바로 FREE 회원이 됩니다. 먼저 직접 만들어 보고, 채널 연결과 자동화가 정말 필요해질 때만 다음 단계로 넓혀 가세요.</p><div class="public-entry-card" aria-label="마케팅AI 시작 안내"><div class="public-entry-steps"><span><b>1</b><strong>Google 로그인</strong><small>가입 즉시 FREE</small></span><span><b>2</b><strong>직접 사용</strong><small>문구·게시글·쇼츠</small></span><span><b>3</b><strong>필요할 때 확장</strong><small>FLEX → PLUS → PRO → AUTO</small></span></div><a class="public-google-cta" href="${authHref}"><i>G</i><span>Google로 무료 시작</span></a><small class="public-entry-note">카드 등록 없이 시작 · 유료 전환은 직접 선택 · 계정과 콘텐츠는 플랜을 낮춰도 보존 우선</small></div>`;

const heroLead = /<div class="hero-kicker">[\s\S]*?<div class="hero-pills">[\s\S]*?<\/div>/;
if (!heroLead.test(html)) throw new Error('Marketing AI hero lead could not be simplified');
html = html.replace(heroLead, publicHero);

const tierShell = `<section class="tier-shell" id="tierShell" aria-label="현재 마케팅AI 이용 단계"><div class="tier-status"><div><small id="tierEyebrow">CURRENT PLAN</small><h2 id="tierStatusName">FREE</h2><p id="tierStatusSummary">직접 만들어 보고 판단하는 단계입니다.</p></div><div class="tier-status-side"><strong id="tierPrice">무료</strong><span id="tierNext">필요할 때 FLEX로 확장</span></div></div><div class="tier-rail" id="tierRail" aria-label="이용 단계"><span data-plan-step="free"><b>FREE</b><small>직접 제작</small></span><span data-plan-step="flex"><b>FLEX</b><small>종량 실행</small></span><span data-plan-step="plus"><b>PLUS</b><small>예약 운영</small></span><span data-plan-step="pro"><b>PRO</b><small>반복·분석</small></span><span data-plan-step="auto"><b>AUTO</b><small>상시 자동화</small></span></div><div class="tier-capabilities" id="tierCapabilities"><article data-capability="content"><i>✦</i><strong>콘텐츠 제작</strong><span>문구·게시글·쇼츠</span></article><article data-capability="channels"><i>◎</i><strong>채널 연결</strong><span id="tierChannels">FREE에서는 미연결</span></article><article data-capability="publish"><i>➤</i><strong>게시 실행</strong><span id="tierPublish">FLEX부터 1회 게시</span></article><article data-capability="schedule"><i>◷</i><strong>예약 운영</strong><span id="tierSchedule">PLUS부터</span></article><article data-capability="automation"><i>↻</i><strong>반복 자동화</strong><span id="tierAutomation">PRO부터</span></article><article data-capability="analysis"><i>◔</i><strong>성과 분석</strong><span id="tierAnalysis">PRO부터</span></article></div></section><!-- tier-shell:end -->`;

const trialMarker = '<section class="trial-lab member-trial" id="memberTrial">';
if (!html.includes(trialMarker)) throw new Error('Member trial marker could not be located');
html = html.replace(trialMarker, `${trialMarker}${tierShell}`);

const style = `<style data-tiered-entry-experience>
:root{--tier-accent:#3158f5;--tier-accent-2:#6d28d9;--tier-soft:#eef2ff;--tier-ink:#26366f}
/* Public front door: one promise, one path, no dashboard before sign-in. */
body:not(.member-session-mode){background:radial-gradient(circle at 50% 0%,#f0f1ff 0,#f7f8fc 38%,#f8fafc 72%)}
body:not(.member-session-mode) .top{max-width:1180px;width:100%;margin:0 auto;padding-top:22px}
body:not(.member-session-mode) .top .badge{display:none}
body:not(.member-session-mode) .top-actions .header-link{display:none!important}
body:not(.member-session-mode) #googleCustomerAuth{display:inline-flex;align-items:center;background:#fff;color:#334155;border:1px solid #dfe3ef;box-shadow:0 6px 18px rgba(43,54,94,.06);padding:9px 13px}
body:not(.member-session-mode) main{min-height:calc(100vh - 138px);display:grid;place-items:center;padding:22px 20px 44px}
body:not(.member-session-mode) .hero.hero-v2{max-width:920px!important;margin:0 auto!important}
body:not(.member-session-mode) .hero-kicker{display:inline-flex!important;padding:7px 11px;border:1px solid #dfe3ff;border-radius:999px;background:rgba(255,255,255,.72);color:#5b5bd6;font-size:10px;letter-spacing:.09em}
body:not(.member-session-mode) .hero.hero-v2 h1{font-size:clamp(42px,5.4vw,68px)!important;line-height:1.03!important;margin:16px auto 13px!important;max-width:820px!important}
body:not(.member-session-mode) .hero.hero-v2 h1 span{background:linear-gradient(110deg,#3158f5,#7c3aed);-webkit-background-clip:text;background-clip:text;color:transparent}
body:not(.member-session-mode) .hero-copy>p{font-size:15px!important;line-height:1.7!important;max-width:690px!important;color:#667085}
body:not(.member-session-mode) .member-preview,
body:not(.member-session-mode) .product-preview,
body:not(.member-session-mode) #memberTrial,
body:not(.member-session-mode) #pricing,
body:not(.member-session-mode) #memberPricingIntro,
body:not(.member-session-mode) .feature-strip,
body:not(.member-session-mode) .workflow-v2,
body:not(.member-session-mode) .bottom-cta,
body:not(.member-session-mode) .custom-domain-panel{display:none!important}
.public-entry-card{width:min(760px,100%);margin:25px auto 0;padding:16px;border:1px solid rgba(215,219,235,.92);border-radius:20px;background:rgba(255,255,255,.84);box-shadow:0 18px 55px rgba(45,55,100,.09);backdrop-filter:blur(14px)}
.public-entry-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:13px}
.public-entry-steps>span{display:grid;grid-template-columns:26px 1fr;column-gap:8px;align-items:center;text-align:left;padding:10px;border-radius:12px;background:#f8f9fc}
.public-entry-steps b{grid-row:1/3;width:26px;height:26px;display:grid;place-items:center;border-radius:9px;background:#eef0ff;color:#4c51bf;font-size:10px}
.public-entry-steps strong{font-size:11px;letter-spacing:-.02em}.public-entry-steps small{font-size:9px;color:#7a8292;margin-top:1px}
.public-google-cta{display:flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:14px 18px;border-radius:13px;background:linear-gradient(105deg,#3158f5,#7c3aed);color:#fff;font-size:14px;font-weight:900;box-shadow:0 10px 25px rgba(70,72,210,.2)}
.public-google-cta i{display:grid;place-items:center;width:22px;height:22px;border-radius:7px;background:#fff;color:#3551cc;font-style:normal;font-size:12px;font-weight:950}.public-entry-note{display:block;margin-top:9px;text-align:center;color:#7a8292;font-size:9px;line-height:1.45}
/* Signed-in workspace: the same information architecture, progressively richer by plan. */
body.member-session-mode.tier-free{--tier-accent:#3158f5;--tier-accent-2:#6d28d9;--tier-soft:#eef2ff;--tier-ink:#26366f}
body.member-session-mode.tier-flex{--tier-accent:#0f766e;--tier-accent-2:#0891b2;--tier-soft:#ecfdf5;--tier-ink:#115e59}
body.member-session-mode.tier-plus{--tier-accent:#6d28d9;--tier-accent-2:#8b5cf6;--tier-soft:#f5f3ff;--tier-ink:#5b21b6}
body.member-session-mode.tier-pro{--tier-accent:#b45309;--tier-accent-2:#7c3aed;--tier-soft:#fff7ed;--tier-ink:#92400e}
body.member-session-mode.tier-auto{--tier-accent:#111827;--tier-accent-2:#4338ca;--tier-soft:#eef2ff;--tier-ink:#111827}
body.member-session-mode #memberTrial{border:1px solid color-mix(in srgb,var(--tier-accent) 18%,#e4e7ec)!important;box-shadow:0 14px 42px color-mix(in srgb,var(--tier-accent) 9%,transparent)!important}
body.member-session-mode #memberTrial::before{display:none!important}
.tier-shell{margin:0 0 15px;padding:15px;border:1px solid color-mix(in srgb,var(--tier-accent) 18%,#e4e7ec);border-radius:17px;background:linear-gradient(125deg,#fff 10%,var(--tier-soft) 100%)}
.tier-status{display:flex;align-items:flex-start;justify-content:space-between;gap:18px}.tier-status small{font-size:8px;font-weight:950;letter-spacing:.12em;color:var(--tier-accent)}.tier-status h2{margin:2px 0 2px;font-size:26px;letter-spacing:-.045em;color:var(--tier-ink)}.tier-status p{margin:0;color:#687083;font-size:10px;line-height:1.45}.tier-status-side{text-align:right;display:grid;justify-items:end;gap:3px}.tier-status-side strong{font-size:12px;color:var(--tier-ink)}.tier-status-side span{font-size:9px;color:#7b8290}
.tier-rail{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px}.tier-rail>span{position:relative;padding:8px 9px;border-radius:11px;border:1px solid #e4e7ec;background:rgba(255,255,255,.78);opacity:.52}.tier-rail>span.current{border-color:var(--tier-accent);background:#fff;opacity:1;box-shadow:0 5px 16px color-mix(in srgb,var(--tier-accent) 10%,transparent)}.tier-rail>span.done{opacity:.78}.tier-rail b{display:block;font-size:9px;color:var(--tier-ink)}.tier-rail small{display:block;margin-top:2px;font-size:8px;color:#7a8292}
.tier-capabilities{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:8px}.tier-capabilities article{padding:9px;border:1px solid #e6e8ef;border-radius:11px;background:rgba(255,255,255,.76);opacity:.46}.tier-capabilities article.enabled{opacity:1;border-color:color-mix(in srgb,var(--tier-accent) 24%,#e6e8ef)}.tier-capabilities i{font-style:normal;font-size:12px;color:var(--tier-accent)}.tier-capabilities strong{display:block;margin-top:4px;font-size:9px}.tier-capabilities span{display:block;margin-top:2px;color:#7a8292;font-size:7.5px;line-height:1.35}
body.member-session-mode .workspace-plan{background:var(--tier-accent)!important}body.member-session-mode .automation-step.current{border-color:var(--tier-accent)!important;color:var(--tier-ink)}body.member-session-mode .member-tool-form button{background:linear-gradient(105deg,var(--tier-accent),var(--tier-accent-2))!important}
body.member-session-mode:not(.tier-free) .trial-lab-head small{color:var(--tier-accent)}body.member-session-mode:not(.tier-free) .trial-free-badge{background:var(--tier-soft);color:var(--tier-ink)}
body.member-session-mode.tier-auto .tier-shell{background:linear-gradient(125deg,#fff,#eef2ff 50%,#f5f3ff)}
@media(max-width:980px){.tier-capabilities{grid-template-columns:repeat(3,1fr)}}
@media(max-width:760px){body:not(.member-session-mode) .top{padding:14px}body:not(.member-session-mode) main{min-height:auto;padding:34px 14px 30px}body:not(.member-session-mode) .hero.hero-v2 h1{font-size:40px!important}.public-entry-card{padding:12px;border-radius:17px}.public-entry-steps{grid-template-columns:1fr}.public-entry-steps>span{padding:8px 10px}.tier-status{display:grid}.tier-status-side{text-align:left;justify-items:start}.tier-rail{grid-template-columns:repeat(5,minmax(70px,1fr));overflow-x:auto;padding-bottom:3px}.tier-capabilities{grid-template-columns:repeat(2,1fr)}.tier-shell{padding:12px}}
</style>`;

const clientPlans = plans.map(plan => ({
  id: plan.id,
  label: plan.label,
  monthlyFee: Number(plan.monthlyFee || 0),
  metered: Boolean(plan.metered),
  includedCredit: Number(plan.includedCredit || 0),
  summary: plan.summary || '',
  entitlements: plan.entitlements || {},
}));
const client = JSON.stringify(clientPlans).replace(/</g, '\\u003c');

const runtime = `<script data-tiered-entry-experience>(()=>{
const PLANS=${client};
const order=['free','flex','plus','pro','auto'];
const auth=document.querySelector('#googleCustomerAuth');
const q=s=>document.querySelector(s);
const fmt=n=>Number(n||0).toLocaleString('ko-KR');
const detect=()=>{const text=(auth?.textContent||'').toUpperCase();for(const id of ['AUTO','PRO','PLUS','FLEX'])if(text.includes(id))return id.toLowerCase();return 'free'};
const copy={
 free:{title:'무료 콘텐츠 작업공간',badge:'FREE 회원',summary:'직접 만들어 보고 판단하는 단계입니다.',next:'필요할 때 FLEX로 확장',workspace:'콘텐츠를 직접 만들고 추천 채널을 살펴보세요. 연결·게시·자동화는 아직 잠겨 있습니다.'},
 flex:{title:'필요할 때 실행하는 작업공간',badge:'FLEX · 종량',summary:'월 기본료 없이 필요한 실행만 결제하는 단계입니다.',next:'예약 운영이 필요하면 PLUS',workspace:'채널 1개를 연결하고 필요한 콘텐츠를 한 번씩 실행합니다. 반복 자동화는 하지 않습니다.'},
 plus:{title:'예약 중심 마케팅 작업공간',badge:'PLUS',summary:'꾸준한 운영을 예약으로 가볍게 자동화합니다.',next:'반복 운영·분석이 필요하면 PRO',workspace:'채널 2개까지 연결하고 예약 게시를 사용합니다. 반복 실행과 성과 분석은 PRO에서 열립니다.'},
 pro:{title:'반복 운영·분석 작업공간',badge:'PRO',summary:'다채널 반복 운영과 성과 분석을 함께 사용합니다.',next:'상시 운영이 필요하면 AUTO',workspace:'채널 5개까지 연결하고 반복 자동화와 성과 분석을 사용합니다. 중요한 실행은 사용자의 승인 규칙을 따릅니다.'},
 auto:{title:'AI 마케팅 운영센터',badge:'AUTO',summary:'승인 규칙과 예산 안에서 상시 운영하는 단계입니다.',next:'현재 가장 깊은 자동화 단계',workspace:'채널 10개까지 연결하고 기획·생성·예약·반복·분석 흐름을 상시 운영합니다. 자동화 범위는 언제든 사용자가 조정합니다.'}
};
const setClass=plan=>{for(const id of order)document.body.classList.toggle('tier-'+id,id===plan)};
const priceText=p=>p.id==='free'?'무료':p.id==='flex'?'월 기본료 0원 · 사용량 결제':'월 '+fmt(p.monthlyFee)+'원'+(p.metered?' + 사용량':'');
const enabled=(p,key)=>{if(key==='content')return true;if(key==='channels')return Number(p.entitlements?.connectedChannels||0)>0;if(key==='publish')return Boolean(p.entitlements?.directPublish);if(key==='schedule')return Boolean(p.entitlements?.scheduledPublish);if(key==='automation')return Boolean(p.entitlements?.recurringAutomation||p.entitlements?.alwaysOnAutomation);if(key==='analysis')return Boolean(p.entitlements?.performanceAnalysis);return false};
let last='';
function render(){
 const id=detect();const p=PLANS.find(x=>x.id===id)||PLANS[0];const c=copy[id]||copy.free;setClass(id);document.body.dataset.marketingPlan=id;
 q('#tierStatusName')&&(q('#tierStatusName').textContent=p.label||id.toUpperCase());q('#tierStatusSummary')&&(q('#tierStatusSummary').textContent=c.summary);q('#tierPrice')&&(q('#tierPrice').textContent=priceText(p));q('#tierNext')&&(q('#tierNext').textContent=c.next);
 q('#tierRail')?.querySelectorAll('[data-plan-step]').forEach(el=>{const n=order.indexOf(el.dataset.planStep),cur=order.indexOf(id);el.classList.toggle('current',n===cur);el.classList.toggle('done',n<cur)});
 q('#tierCapabilities')?.querySelectorAll('[data-capability]').forEach(el=>el.classList.toggle('enabled',enabled(p,el.dataset.capability)));
 const ch=Number(p.entitlements?.connectedChannels||0);q('#tierChannels')&&(q('#tierChannels').textContent=ch?ch+'개 연결 가능':'FREE에서는 미연결');q('#tierPublish')&&(q('#tierPublish').textContent=p.entitlements?.directPublish?'1회 게시 가능':'FLEX부터 1회 게시');q('#tierSchedule')&&(q('#tierSchedule').textContent=p.entitlements?.scheduledPublish?'예약 게시 가능':'PLUS부터');q('#tierAutomation')&&(q('#tierAutomation').textContent=p.entitlements?.alwaysOnAutomation?'상시 자동화':p.entitlements?.recurringAutomation?'반복 자동화 가능':'PRO부터');q('#tierAnalysis')&&(q('#tierAnalysis').textContent=p.entitlements?.performanceAnalysis?'성과 분석 사용':'PRO부터');
 q('#workspacePlan')&&(q('#workspacePlan').textContent=c.badge);const wh=q('.workspace-head h3');if(wh)wh.textContent=id==='free'?'내 마케팅 채널과 무료 사용량':'내 마케팅 채널과 이용 권한';const wp=q('.workspace-head p');if(wp)wp.textContent=c.workspace;
 const title=q('#memberTrial .trial-lab-head h2');if(title)title.textContent=c.title;const eyebrow=q('#memberTrial .trial-lab-head small');if(eyebrow)eyebrow.textContent=id==='free'?'FREE MEMBER · 직접 사용':'MEMBER WORKSPACE · '+(p.label||id.toUpperCase());const badge=q('#memberTrial .trial-free-badge');if(badge)badge.textContent=c.badge;
 const pricingLink=[...document.querySelectorAll('.header-link')].find(a=>a.getAttribute('href')==='#pricing');if(pricingLink&&document.body.classList.contains('member-session-mode'))pricingLink.textContent=id==='free'?'플랜 보기':'플랜 변경';
 if(last!==id){last=id;window.dispatchEvent(new CustomEvent('ekodi:marketing-plan-rendered',{detail:{plan:id}}))}
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;render()})};
render();if(auth)new MutationObserver(schedule).observe(auth,{childList:true,subtree:true,characterData:true});window.addEventListener('ekodi:auth-ready',schedule);window.addEventListener('ekodi:workspace-ready',schedule);setTimeout(schedule,0);setTimeout(schedule,350);
})();</script>`;

html = html.replace('</head>', `${style}</head>`);
html = html.replace('</body>', `${runtime}</body>`);

for (const required of [
  'data-tiered-entry-experience',
  'id="tierShell"',
  'id="tierRail"',
  'class="public-entry-card"',
  'Google로 무료 시작',
  "String(d.plan||'free')",
  'tier-free',
  'tier-flex',
  'tier-plus',
  'tier-pro',
  'tier-auto',
  "window.dispatchEvent(new CustomEvent('ekodi:marketing-plan-rendered'",
]) {
  if (!html.includes(required)) throw new Error(`Tiered entry experience contract missing: ${required}`);
}

fs.writeFileSync(hubFile, html);
console.log('✅ Marketing AI now has a simple Google-first landing and tier-aware FREE → FLEX → PLUS → PRO → AUTO workspace');
