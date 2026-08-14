import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubFile = path.join(root, 'dist', 'marketing-ai', 'index.html');
const pricing = JSON.parse(fs.readFileSync(path.join(root, 'content', 'marketing-ai-pricing.json'), 'utf8'));
const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const won = value => `${Number(value).toLocaleString('ko-KR')}원`;
const authHref = planId => `https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F&plan=${encodeURIComponent(planId)}`;

if (!fs.existsSync(hubFile)) throw new Error('Marketing AI hub must be built before pricing patch');

function pricingStyle() {
  return `<style data-flex-pricing>
.header-link{font-size:12px;font-weight:850;color:var(--muted);padding:8px 5px}.choice-intro{max-width:920px;margin:14px auto 0}.choice-promise{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.choice-mode{background:#fff;border:1px solid var(--line);border-radius:16px;padding:15px}.choice-mode small{display:block;color:var(--muted);font-weight:850;font-size:10px;margin-bottom:5px}.choice-mode strong{display:block;font-size:17px;letter-spacing:-.025em}.choice-mode p{margin:6px 0 0;color:var(--muted);font-size:12px;line-height:1.5}.pricing{max-width:920px;margin:14px auto 0}.pricing-head{text-align:center;padding:20px 8px 12px}.pricing-head small{font-size:11px;font-weight:900;letter-spacing:.08em;color:var(--muted)}.pricing-head h2{font-size:30px;letter-spacing:-.045em;margin:7px 0}.pricing-head p{max-width:680px;margin:0 auto;color:var(--muted);font-size:13px;line-height:1.65}.pricing-philosophy{font-weight:900;color:var(--ink)!important;margin-top:7px!important}.plan-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.plan-card{background:#fff;border:1px solid var(--line);border-radius:17px;padding:15px;display:flex;flex-direction:column;min-height:292px;position:relative}.plan-card.recommended{border:2px solid var(--ink);padding:14px;box-shadow:0 10px 32px rgba(23,32,42,.08)}.plan-ribbon{display:none;position:absolute;right:10px;top:10px;border-radius:999px;background:var(--ink);color:#fff;font-size:9px;font-weight:900;padding:5px 7px}.plan-card.recommended .plan-ribbon{display:inline-flex}.plan-name{font-size:13px;font-weight:950;letter-spacing:.06em}.plan-price{font-size:25px;font-weight:950;letter-spacing:-.04em;margin-top:7px}.plan-price span{font-size:10px;color:var(--muted);font-weight:800}.plan-summary{font-size:11px;color:var(--muted);line-height:1.45;min-height:33px}.plan-benefits{padding:0;margin:10px 0 14px;list-style:none;display:grid;gap:6px;font-size:10px;line-height:1.4}.plan-benefits li:before{content:'✓ ';font-weight:950}.plan-estimate{margin-top:auto;border-top:1px solid var(--soft);padding-top:10px}.plan-estimate small{display:block;color:var(--muted);font-size:9px;font-weight:850}.plan-estimate strong{font-size:15px}.pricing-cta{display:block;margin-top:9px;text-align:center;border-radius:10px;padding:9px 7px;background:var(--soft);font-size:10px;font-weight:900}.estimator{margin-top:12px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px}.estimator-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}.estimator-head h3{margin:0;font-size:20px;letter-spacing:-.035em}.estimator-head p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.5}.beta-badge{white-space:nowrap;border-radius:999px;padding:6px 9px;background:#fff4d6;color:#7a4d00;font-size:9px;font-weight:900}.usage-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.usage-item{border:1px solid var(--soft);border-radius:13px;padding:10px;background:var(--bg)}.usage-item label{display:block;font-size:10px;font-weight:850;min-height:28px}.usage-item-meta{display:flex;justify-content:space-between;gap:8px;color:var(--muted);font-size:9px;margin:4px 0 7px}.usage-item input{width:100%;border:1px solid var(--line);border-radius:9px;padding:8px;background:#fff}.availability{font-weight:850}.best-plan{margin-top:12px;border-radius:15px;background:var(--ink);color:#fff;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;gap:16px}.best-plan small{display:block;opacity:.68;font-size:9px;font-weight:900;margin-bottom:4px}.best-plan strong{display:block;font-size:17px}.best-plan p{margin:3px 0 0;font-size:10px;opacity:.78}.best-plan-cost{text-align:right;white-space:nowrap}.best-plan-cost span{display:block;font-size:20px;font-weight:950}.automation-panel{margin-top:12px;background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px}.automation-panel h3{margin:0;font-size:20px;letter-spacing:-.035em}.automation-panel>p{margin:5px 0 0;color:var(--muted);font-size:11px;line-height:1.55}.automation-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:12px}.automation-card{border:1px solid var(--soft);border-radius:13px;padding:11px}.automation-card small{font-size:9px;color:var(--muted);font-weight:850}.automation-card strong{display:block;font-size:13px;margin-top:4px}.automation-card p{font-size:10px;color:var(--muted);line-height:1.45;margin:5px 0 0}.pricing-notice{margin:12px 3px 0;color:var(--muted);font-size:10px;line-height:1.55;text-align:center}.customer-promises{max-width:920px;margin:12px auto 0;background:#fff;border:1px solid var(--line);border-radius:18px;padding:14px 17px}.customer-promises strong{font-size:12px}.customer-promises ul{display:grid;grid-template-columns:1fr 1fr;gap:6px 18px;margin:8px 0 0;padding-left:17px;color:var(--muted);font-size:10px;line-height:1.5}
@media(max-width:900px){.plan-grid{grid-template-columns:repeat(2,1fr)}.usage-grid{grid-template-columns:repeat(2,1fr)}.automation-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:760px){.choice-promise,.customer-promises ul{grid-template-columns:1fr}.top-actions .header-link{display:none}.plan-grid,.usage-grid,.automation-grid{grid-template-columns:1fr}.plan-card{min-height:0}.best-plan{align-items:flex-start;display:grid}.best-plan-cost{text-align:left}.estimator-head{display:grid}}
</style>`;
}

function availabilityLabel(value) {
  return value === 'available' ? '이용 가능' : value === 'trial' ? '무료 체험' : value === 'preview' ? '베타 요금안' : '연동 예정';
}

function modeMarkup() {
  return (pricing.billingModes || []).map(mode => `<article class="choice-mode"><small>${esc(mode.label)}</small><strong>${esc(mode.headline)}</strong><p>${esc(mode.description)}</p></article>`).join('');
}

function planMarkup() {
  return (pricing.plans || []).map(plan => {
    const price = plan.monthlyFee === 0 ? '월 0원' : `월 ${won(plan.monthlyFee)}`;
    const benefits = (plan.benefits || []).map(item => `<li>${esc(item)}</li>`).join('');
    const cta = plan.id === 'free' ? 'FREE로 시작' : plan.id === 'flex' ? 'FLEX 선택' : `${plan.label} 월 구독 선택`;
    return `<article class="plan-card" data-plan="${esc(plan.id)}"><span class="plan-ribbon">추천</span><div class="plan-name">${esc(plan.label)}</div><div class="plan-price">${esc(price)} <span>${plan.id === 'free' ? '체험' : '기본료'}</span></div><p class="plan-summary">${esc(plan.summary)}</p><ul class="plan-benefits">${benefits}</ul><div class="plan-estimate"><small>선택한 사용량 예상</small><strong data-plan-total="${esc(plan.id)}">${plan.id === 'free' ? '무료 체험' : '-'}</strong></div><a class="pricing-cta" href="${authHref(plan.id)}">${esc(cta)}</a></article>`;
  }).join('');
}

function usageMarkup() {
  return (pricing.actions || []).map(action => `<div class="usage-item"><label for="usage-${esc(action.id)}">${esc(action.label)}</label><div class="usage-item-meta"><span>${won(action.basePrice)} / ${esc(action.unit)}</span><span class="availability">${esc(availabilityLabel(action.availability))}</span></div><input id="usage-${esc(action.id)}" data-usage="${esc(action.id)}" type="number" min="0" max="${Number(action.maxQty)}" step="1" value="${Number(action.defaultQty)}" inputmode="numeric"></div>`).join('');
}

function automationMarkup() {
  return (pricing.automationModes || []).map((item, index) => `<article class="automation-card"><small>STEP ${index + 1}</small><strong>${esc(item.label)}</strong><p>${esc(item.description)}</p></article>`).join('');
}

function pricingMarkup() {
  const promises = (pricing.customerPromise || []).map(item => `<li>${esc(item)}</li>`).join('');
  return `<section class="choice-intro" aria-label="결제 방식"><div class="choice-promise">${modeMarkup()}</div></section><section class="pricing" id="pricing" data-pricing-version="${esc(pricing.version)}"><div class="pricing-head"><small>FLEXIBLE PRICING · BEST PLAN AI</small><h2>내 사용량에 맞는 방식만 선택하세요.</h2><p class="pricing-philosophy">${esc(pricing.philosophy)}</p><p>모든 기능을 상위 회원에게만 가두지 않습니다. 필요한 기능은 개별로 사고, 자주 사용할 때만 상위 플랜의 낮은 단가와 자동화를 선택합니다.</p></div><div class="plan-grid">${planMarkup()}</div><section class="estimator" id="usageEstimator"><div class="estimator-head"><div><h3>이번 달 사용량으로 비교하기</h3><p>예상 사용량을 바꾸면 각 플랜의 월 예상비용을 같은 기준으로 계산합니다. 시스템이 플랜을 자동 변경하지는 않습니다.</p></div><span class="beta-badge">요금 선택</span></div><div class="usage-grid">${usageMarkup()}</div><div class="best-plan" aria-live="polite"><div><small>BEST PLAN AI</small><strong id="bestPlanMessage">사용량을 계산하는 중입니다.</strong><p id="bestPlanReason">가장 경제적인 선택을 투명하게 비교합니다.</p></div><div class="best-plan-cost"><small>예상 월 비용</small><span id="bestPlanCost">-</span></div></div></section><section class="automation-panel"><h3>소셜 자동화도 원하는 단계까지만</h3><p>Instagram·YouTube 등 소셜 계정 연동은 플랫폼별 공식 권한과 검수를 거쳐 단계적으로 활성화합니다. 한 번 게시부터 상시 자동화까지 같은 기능을 실행 수준에 따라 선택할 수 있습니다.</p><div class="automation-grid">${automationMarkup()}</div></section><section class="customer-promises"><strong>고객의 선택권을 지키는 기본 원칙</strong><ul>${promises}</ul></section><p class="pricing-notice">${esc(pricing.payment?.notice || '')}</p></section>`;
}

function pricingScript() {
  const clientConfig = JSON.stringify({
    actions: pricing.actions,
    plans: pricing.plans,
    status: pricing.status,
  }).replace(/</g, '\\u003c');
  return `<script data-flex-pricing-runtime>(()=>{const C=${clientConfig};const won=n=>Math.round(n).toLocaleString('ko-KR')+'원';const q=s=>document.querySelector(s);const all=s=>[...document.querySelectorAll(s)];const inputs=all('[data-usage]');function baseUsage(){return C.actions.reduce((sum,a)=>{const el=q('[data-usage="'+a.id+'"]');const raw=Number(el?.value||0);const qty=Math.max(0,Math.min(Number(a.maxQty||0),Number.isFinite(raw)?Math.floor(raw):0));if(el&&String(qty)!==el.value)el.value=String(qty);return sum+Number(a.basePrice||0)*qty},0)}function quote(plan,base){if(plan.id==='free')return base===0?0:Infinity;const discounted=base*Number(plan.unitMultiplier||1);return Number(plan.monthlyFee||0)+Math.max(0,discounted-Number(plan.includedCredit||0))}function render(){const base=baseUsage();let best=null;for(const plan of C.plans){const cost=quote(plan,base);const out=q('[data-plan-total="'+plan.id+'"]');if(out)out.textContent=Number.isFinite(cost)?won(cost):'사용 시 FLEX부터';if(Number.isFinite(cost)&&(!best||cost<best.cost))best={plan,cost};}all('.plan-card').forEach(card=>card.classList.toggle('recommended',card.dataset.plan===best?.plan.id));const msg=q('#bestPlanMessage'),reason=q('#bestPlanReason'),cost=q('#bestPlanCost');if(!best)return;if(cost)cost.textContent=won(best.cost);if(base===0){msg.textContent='아직 유료 사용량이 없어 FREE가 가장 합리적입니다.';reason.textContent='필요해질 때 FLEX 또는 상위 플랜을 선택하세요.';return}const flex=C.plans.find(p=>p.id==='flex');const flexCost=quote(flex,base);if(best.plan.id==='flex'){msg.textContent='현재 사용량에는 FLEX가 가장 경제적입니다.';reason.textContent='월 구독으로 올릴 필요 없이 쓴 만큼만 결제하는 편이 유리합니다.';}else{const saved=Math.max(0,flexCost-best.cost);msg.textContent='현재 사용량에는 '+best.plan.label+'가 가장 경제적입니다.';reason.textContent='FLEX 종량제 대비 월 약 '+won(saved)+' 절감되는 계산입니다. 변경은 사용자가 직접 선택합니다.';}}inputs.forEach(input=>input.addEventListener('input',render));render();})();</script>`;
}

let html = fs.readFileSync(hubFile, 'utf8');
if (!html.includes('id="freeTrialForm"')) throw new Error('Anonymous free trial must remain on Marketing AI hub');
if (!html.includes('id="googleCustomerAuth"')) throw new Error('Central Google auth must remain on Marketing AI hub');

html = html.replace(/<style data-flex-pricing>[\s\S]*?<\/style>/g, '');
html = html.replace(/<script data-flex-pricing-runtime>[\s\S]*?<\/script>/g, '');
html = html.replace(/<section class="choice-intro"[\s\S]*?<\/section>/g, '');
html = html.replace(/<section class="pricing" id="pricing"[\s\S]*?<\/section>(?=\s*<\/main>)/g, '');
html = html.replace(/<section class="case-list">[\s\S]*?<\/section>/, '');
html = html.replace(/<section class="trial-strip">[\s\S]*?<\/section>/, '');
html = html.replace('<span class="badge">FREE TRIAL · APPLICATION CASES</span>', '<a class="header-link" href="#freeTrial">무료 체험</a><a class="header-link" href="#pricing">이용 방식</a>');
html = html.replace('<h1>매장마다 같은 엔진,<br>각자의 브랜드.</h1>', '<h1>내 매장 마케팅,<br>필요한 만큼 자유롭게.</h1>');
html = html.replace('<p>검수 완료된 점포만 공개 링크가 활성화됩니다.</p>', '<p>먼저 무료로 써보고 필요할 때만 결제하세요. 많이 사용할수록 단가는 낮아지고, 맡길수록 자동화는 깊어집니다.</p>');
html = html.replace(/<title>[^<]*적용사례<\/title>/, '<title>마케팅AI | 필요한 만큼 자유롭게</title>');
html = html.replace('</head>', `${pricingStyle()}</head>`);
html = html.replace('</main>', `${pricingMarkup()}</main>`);
html = html.replace('</body>', `${pricingScript()}</body>`);

for (const forbidden of ['APPLICATION CASES', '검수 완료된 점포만 공개 링크가 활성화됩니다.', 'class="case-list"']) {
  if (html.includes(forbidden)) throw new Error(`Public application-case emphasis survived: ${forbidden}`);
}
for (const required of ['id="pricing"', 'id="usageEstimator"', 'data-plan="free"', 'data-plan="flex"', 'data-plan="plus"', 'data-plan="pro"', 'data-plan="auto"', '&plan=plus', '&plan=pro', '&plan=auto', 'BEST PLAN AI', '1회 결제', '종량제', '자동화 플랜']) {
  if (!html.includes(required)) throw new Error(`Flexible pricing contract missing from hub: ${required}`);
}

fs.writeFileSync(hubFile, html);
console.log(`✅ Marketing AI merchant-first flexible pricing ${pricing.version} patched`);
