import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const hubFile=path.join(root,'dist','marketing-ai','index.html');
const authHref='https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F';

if(!fs.existsSync(hubFile))throw new Error('Marketing AI hub must exist before free-member experience patch');

let html=fs.readFileSync(hubFile,'utf8');

html=html.replace(/<style data-free-member-experience>[\s\S]*?<\/style>/g,'');
html=html.replace(/<script data-free-member-experience>[\s\S]*?<\/script>/g,'');
html=html.replace(/<section class="member-preview"[\s\S]*?<\/section>/g,'');

if(!html.includes('id="freeTrialForm"'))throw new Error('Hands-on trial form is required before member gating');

html=html.replace('<section class="trial-lab" id="freeTrial">','<section class="trial-lab member-trial" id="memberTrial">');
html=html.replace('NO LOGIN · BASIC TRIAL','FREE MEMBER · HANDS-ON TRIAL');
html=html.replace('로그인 없이 이용','무료회원 전용');
html=html.replace('이 체험은 비용 없이 동작하는 기본 샘플 엔진입니다. 실제 AI 자동생성·저장·채널연동·분석은 Google 무료회원 및 승인된 Pro 기능에서 단계적으로 제공합니다.','무료회원이 직접 사용해 보는 기본 체험입니다. 저장·채널연동·고급 분석 등 더 깊은 기능은 실제 사용 과정에서 필요할 때 안내합니다.');
html=html.replaceAll('href="#freeTrial"','href="#memberPreview"');
html=html.replace('<section class="choice-intro" aria-label="결제 방식">','<section class="choice-intro" id="memberPricingIntro" aria-label="결제 방식" hidden>');
html=html.replace('<section class="pricing" id="pricing" data-pricing-version=','<section class="pricing" id="pricing" hidden data-pricing-version=');

const style=`<style data-free-member-experience>
.member-preview{max-width:920px;margin:22px auto 0;background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px}.member-preview-head{text-align:center;max-width:680px;margin:0 auto}.member-preview-head small{font-size:11px;font-weight:900;letter-spacing:.08em;color:var(--muted)}.member-preview-head h2{font-size:29px;letter-spacing:-.045em;margin:7px 0}.member-preview-head p{margin:0;color:var(--muted);font-size:13px;line-height:1.65}.member-preview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.member-preview-card{border:1px solid var(--soft);border-radius:15px;padding:15px;background:var(--bg)}.member-preview-card small{display:block;color:var(--muted);font-size:10px;font-weight:900;margin-bottom:6px}.member-preview-card strong{display:block;font-size:17px;letter-spacing:-.025em}.member-preview-card p{margin:6px 0 0;color:var(--muted);font-size:11px;line-height:1.55}.member-preview-action{display:flex;justify-content:center;margin-top:17px}.member-preview-action a{display:inline-flex;align-items:center;justify-content:center;border-radius:12px;padding:12px 17px;background:var(--accent);color:#fff;font-size:13px;font-weight:900}.member-preview-note{text-align:center;margin:9px 0 0;color:var(--muted);font-size:10px}.member-trial{scroll-margin-top:18px;display:none}.member-trial:target,body.free-member-mode .member-trial,body.paid-member-mode .member-trial,body.member-session-mode .member-trial{display:block!important}.member-trial::before{content:'무료회원 체험공간';display:inline-flex;margin-bottom:10px;border-radius:999px;padding:6px 9px;background:#e9f7ef;color:#146c43;font-size:10px;font-weight:900}@media(max-width:760px){.member-preview-grid{grid-template-columns:1fr}.member-preview{padding:18px}.member-preview-head h2{font-size:25px}}
</style>`;

const preview=`<section class="member-preview" id="memberPreview"><div class="member-preview-head"><small>LOGIN → TRY IT YOURSELF</small><h2>무엇을 할 수 있는지 먼저 보고,<br>로그인 후 바로 직접 써보세요.</h2><p>처음부터 요금제를 고르게 하지 않습니다. 무료회원으로 들어오면 실제 화면에서 간단한 마케팅 작업을 바로 체험할 수 있습니다.</p></div><div class="member-preview-grid"><article class="member-preview-card"><small>01 · SNS 문구</small><strong>홍보 문구 만들기</strong><p>매장명과 오늘 알릴 내용을 넣어 게시용 문구 초안을 직접 만들어 봅니다.</p></article><article class="member-preview-card"><small>02 · HASHTAGS</small><strong>해시태그 추천</strong><p>매장과 상품 키워드를 바탕으로 바로 활용할 태그 묶음을 확인합니다.</p></article><article class="member-preview-card"><small>03 · SHORTS</small><strong>쇼츠 훅 만들기</strong><p>짧은 영상의 첫 문장과 후킹 문구를 직접 생성해 사용감을 확인합니다.</p></article></div><div class="member-preview-action"><a href="${authHref}">Google로 무료 체험 시작</a></div><p class="member-preview-note">로그인 후 결제 화면이 아니라 무료 체험공간으로 바로 이동합니다.</p></section>`;

const runtime=`<script data-free-member-experience>(()=>{
const KEY='ekodi-marketing-free-experience';
const url=new URL(location.href);
const auth=document.querySelector('#googleCustomerAuth');
const landingPreview=document.querySelector('#memberPreview');
const trial=document.querySelector('#memberTrial');
const pricing=document.querySelector('#pricing');
const pricingIntro=document.querySelector('#memberPricingIntro');
const headerFree=document.querySelector('.header-link[href="#memberPreview"]');
const dashboardPreview=document.querySelector('.product-preview');
const welcomed=url.searchParams.get('welcome')==='free';
if(welcomed)localStorage.setItem(KEY,'1');
const hasMemberSignal=()=>localStorage.getItem(KEY)==='1'||welcomed||/✓|이용중/.test(auth?.textContent||'');
const hasPaidPlan=()=>/(AUTO|PRO|PLUS|FLEX)/.test((auth?.textContent||'').toUpperCase());
const setBodyClass=(name,enabled)=>{const next=Boolean(enabled);if(document.body.classList.contains(name)===next)return false;document.body.classList.toggle(name,next);return true};
let renderQueued=false;
function render(){
  renderQueued=false;
  const member=hasMemberSignal();
  const paid=member&&hasPaidPlan();
  if(member&&localStorage.getItem(KEY)!=='1')localStorage.setItem(KEY,'1');
  setBodyClass('free-member-mode',member&&!paid);
  setBodyClass('paid-member-mode',paid);
  if(landingPreview&&landingPreview.hidden!==member)landingPreview.hidden=member;
  if(trial){if(trial.hidden){trial.hidden=false;trial.removeAttribute('hidden')}const display=member||location.hash==='#memberTrial'?'block':'';if(trial.style.display!==display)trial.style.display=display}
  if(pricing&&pricing.hidden===member)pricing.hidden=!member;
  if(pricingIntro&&pricingIntro.hidden===member)pricingIntro.hidden=!member;
  if(dashboardPreview&&dashboardPreview.hidden!==(member&&!paid))dashboardPreview.hidden=member&&!paid;
  if(headerFree){const href=member?'#memberTrial':'#memberPreview';if(headerFree.getAttribute('href')!==href)headerFree.href=href;if(headerFree.textContent!=='무료 체험')headerFree.textContent='무료 체험'}
  if(member&&auth&&!/✓|이용중/.test(auth.textContent||'')){auth.textContent='무료 체험 중 ✓';auth.href='#memberTrial'}
  if((member||location.hash==='#memberTrial')&&location.hash==='#memberTrial')setTimeout(()=>trial?.scrollIntoView({behavior:'smooth',block:'start'}),120);
}
function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(render)}
render();
if(auth)new MutationObserver(scheduleRender).observe(auth,{childList:true,subtree:true,characterData:true});
window.addEventListener('hashchange',scheduleRender);
window.addEventListener('ekodi:auth-ready',scheduleRender);
if(welcomed){url.searchParams.delete('welcome');history.replaceState({},document.title,url.pathname+(url.searchParams.toString()?'?'+url.searchParams.toString():'')+'#memberTrial');scheduleRender()}
})();</script>`;

html=html.replace('</head>',`${style}</head>`);
const trialMarker='<section class="trial-lab member-trial" id="memberTrial">';
if(!html.includes(trialMarker))throw new Error('Member trial section could not be located');
html=html.replace(trialMarker,`${preview}${trialMarker}`);
html=html.replace('</body>',`${runtime}</body>`);

for(const required of ['id="memberPreview"','id="memberTrial"','id="freeTrialForm"','Google로 무료 체험 시작','data-free-member-experience','free-member-mode','dashboardPreview.hidden=member&&!paid','.member-trial:target',"trial.removeAttribute('hidden')",'hashchange','scheduleRender','requestAnimationFrame(render)']){
  if(!html.includes(required))throw new Error(`Free-member experience contract missing: ${required}`);
}

fs.writeFileSync(hubFile,html);
console.log('✅ Marketing AI free-member experience now coalesces auth-driven rendering and writes DOM state only when it changes');
