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

html=html.replace('<section class="trial-lab" id="freeTrial">','<section class="trial-lab member-trial" id="memberTrial" hidden>');
html=html.replace('NO LOGIN · BASIC TRIAL','FREE MEMBER · GOOGLE VERIFIED');
html=html.replace('로그인 없이 이용','Google 무료회원 전용');
html=html.replace('이 체험은 비용 없이 동작하는 기본 샘플 엔진입니다. 실제 AI 자동생성·저장·채널연동·분석은 Google 무료회원 및 승인된 Pro 기능에서 단계적으로 제공합니다.','Google 로그인으로 확인된 무료회원이 직접 사용하는 작업공간입니다. 무료 사용량과 등급 권한은 서버에서 확인합니다.');
html=html.replaceAll('href="#freeTrial"','href="#memberPreview"');
html=html.replace('<section class="choice-intro" aria-label="결제 방식">','<section class="choice-intro" id="memberPricingIntro" aria-label="결제 방식" hidden>');
html=html.replace('<section class="pricing" id="pricing" data-pricing-version=','<section class="pricing" id="pricing" hidden data-pricing-version=');

const style=`<style data-free-member-experience>
.member-preview{max-width:920px;margin:22px auto 0;background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px}.member-preview-head{text-align:center;max-width:680px;margin:0 auto}.member-preview-head small{font-size:11px;font-weight:900;letter-spacing:.08em;color:var(--muted)}.member-preview-head h2{font-size:29px;letter-spacing:-.045em;margin:7px 0}.member-preview-head p{margin:0;color:var(--muted);font-size:13px;line-height:1.65}.member-preview-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:18px}.member-preview-card{border:1px solid var(--soft);border-radius:15px;padding:15px;background:var(--bg)}.member-preview-card small{display:block;color:var(--muted);font-size:10px;font-weight:900;margin-bottom:6px}.member-preview-card strong{display:block;font-size:17px;letter-spacing:-.025em}.member-preview-card p{margin:6px 0 0;color:var(--muted);font-size:11px;line-height:1.55}.member-preview-action{display:flex;justify-content:center;margin-top:17px}.member-preview-action a{display:inline-flex;align-items:center;justify-content:center;border-radius:12px;padding:12px 17px;background:var(--accent);color:#fff;font-size:13px;font-weight:900}.member-preview-note{text-align:center;margin:9px 0 0;color:var(--muted);font-size:10px}.member-trial{scroll-margin-top:18px;display:none}.member-trial.authenticated-member{display:block!important}.member-trial::before{content:'Google 인증 무료회원 작업공간';display:inline-flex;margin-bottom:10px;border-radius:999px;padding:6px 9px;background:#e9f7ef;color:#146c43;font-size:10px;font-weight:900}@media(max-width:760px){.member-preview-grid{grid-template-columns:1fr}.member-preview{padding:18px}.member-preview-head h2{font-size:25px}}
</style>`;

const preview=`<section class="member-preview" id="memberPreview"><div class="member-preview-head"><small>GOOGLE LOGIN → FREE WORKSPACE</small><h2>무료는 로그인부터 시작합니다.</h2><p>EKODI Google 인증 후 문구·게시글·쇼츠 기획을 각각 월 1회 사용해 보세요. 사용량과 권한은 계정과 Workspace 기준으로 서버에서 관리합니다.</p></div><div class="member-preview-grid"><article class="member-preview-card"><small>01 · SHORT COPY</small><strong>문구 월 1회</strong><p>짧은 홍보 문구를 직접 만들어 봅니다.</p></article><article class="member-preview-card"><small>02 · POST</small><strong>게시글 월 1회</strong><p>조금 더 긴 게시물 초안을 직접 만들어 봅니다.</p></article><article class="member-preview-card"><small>03 · SHORTS</small><strong>쇼츠 월 1회</strong><p>짧은 영상의 첫 문장과 기획을 직접 만들어 봅니다.</p></article></div><div class="member-preview-action"><a href="${authHref}">Google로 무료 시작</a></div><p class="member-preview-note">주소를 직접 입력하거나 브라우저 기록만으로 FREE 작업공간이 열리지 않습니다.</p></section>`;

const runtime=`<script data-free-member-experience>(()=>{
const auth=document.querySelector('#googleCustomerAuth');
const preview=document.querySelector('#memberPreview');
const trial=document.querySelector('#memberTrial');
const pricing=document.querySelector('#pricing');
const pricingIntro=document.querySelector('#memberPricingIntro');
const headerFree=document.querySelector('.header-link[href="#memberPreview"]')||document.querySelector('.header-link[href="#memberTrial"]');
const authenticated=()=>document.body.dataset.ekodiAuthState==='authenticated'&&Boolean(window.EKODI_MARKETING_AUTH_TOKEN);
function render(){
  const member=authenticated();
  document.body.classList.toggle('free-member-mode',member);
  if(preview)preview.hidden=member;
  if(trial){trial.hidden=!member;trial.classList.toggle('authenticated-member',member)}
  if(pricing)pricing.hidden=!member;
  if(pricingIntro)pricingIntro.hidden=!member;
  if(headerFree){headerFree.href=member?'#memberTrial':'#memberPreview';headerFree.textContent=member?'작업공간':'무료 체험'}
  if(member&&auth&&!/✓|이용중/.test(auth.textContent||'')){auth.textContent='FREE 회원 ✓';auth.href='#memberTrial'}
  if(!member&&location.hash==='#memberTrial'){
    history.replaceState({},document.title,location.pathname+location.search+'#memberPreview');
    requestAnimationFrame(()=>preview?.scrollIntoView({behavior:'smooth',block:'start'}));
  }
}
window.addEventListener('ekodi:auth-ready',render);
window.addEventListener('ekodi:workspace-ready',render);
window.addEventListener('hashchange',render);
render();
})();</script>`;

html=html.replace('</head>',`${style}</head>`);
const marker='<section class="trial-lab member-trial" id="memberTrial" hidden>';
if(!html.includes(marker))throw new Error('Member trial section could not be located');
html=html.replace(marker,`${preview}${marker}`);
html=html.replace('</body>',`${runtime}</body>`);

for(const required of ['id="memberPreview"','id="memberTrial"','Google로 무료 시작','data-free-member-experience','ekodiAuthState','EKODI_MARKETING_AUTH_TOKEN','authenticated-member','문구 월 1회','게시글 월 1회','쇼츠 월 1회'])if(!html.includes(required))throw new Error(`Free-member experience contract missing: ${required}`);
if(html.includes("localStorage.getItem(KEY)==='1'"))throw new Error('Local browser state must not grant FREE membership');
fs.writeFileSync(hubFile,html);
console.log('✅ Marketing AI FREE workspace now requires a verified Google session and server-backed identity');
