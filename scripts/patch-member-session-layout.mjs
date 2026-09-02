import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubFile = path.join(root, 'dist', 'marketing-ai', 'index.html');
if (!fs.existsSync(hubFile)) throw new Error('Marketing AI hub must exist before member session layout patch');

let html = fs.readFileSync(hubFile, 'utf8');
html = html.replace(/<style data-member-session-layout>[\s\S]*?<\/style>/g, '');
html = html.replace(/<script data-member-session-layout>[\s\S]*?<\/script>/g, '');

if (!html.includes('id="memberTrial"') || !html.includes('class="member-workspace"')) {
  throw new Error('Member workspace must exist before member session layout patch');
}
if (!html.includes('class="hero hero-v2"') || !html.includes('class="product-preview"')) {
  throw new Error('Marketing visual shell must exist before member session layout patch');
}

const style = `<style data-member-session-layout>
body.member-session-mode main{padding-top:14px}
body.member-session-mode .hero.hero-v2{display:block;grid-template-columns:minmax(0,1fr);max-width:1120px;margin:0 auto 14px;gap:0;align-items:start;text-align:left}
body.member-session-mode .hero-copy{width:100%}
body.member-session-mode.member-workspace-ready .hero-kicker,
body.member-session-mode.member-workspace-ready .hero-copy>h1,
body.member-session-mode.member-workspace-ready .hero-copy>p,
body.member-session-mode.member-workspace-ready .hero-pills,
body.member-session-mode.member-workspace-ready .product-preview,
body.member-session-mode.member-workspace-ready .member-preview,
body.member-session-mode.member-workspace-ready .feature-strip,
body.member-session-mode.member-workspace-ready .workflow-v2,
body.member-session-mode.member-workspace-ready .bottom-cta,
body.member-session-mode.member-workspace-ready #memberPricingIntro{display:none!important}
body.member-session-mode #memberTrial{display:block!important;width:100%;max-width:none;margin:0;padding:18px;border-radius:20px;background:rgba(255,255,255,.96);box-shadow:0 12px 36px rgba(52,58,100,.08)}
body.member-session-mode .hero-copy .trial-lab{width:100%;max-width:none;margin:0}
body.member-session-mode .trial-lab-head{align-items:center;padding-bottom:4px}
body.member-session-mode .trial-lab-head h2{font-size:26px}
body.member-session-mode .trial-lab-head p{max-width:760px}
body.member-session-mode .member-workspace{margin:12px 0 14px;padding:15px;background:#f8f9fc}
body.member-session-mode .workspace-grid{grid-template-columns:minmax(260px,.72fr) minmax(0,1.28fr)}
body.member-session-mode .member-tool-form{margin-top:14px}
body.member-session-mode .pricing{max-width:1120px!important;margin:16px auto 0}
body.member-session-mode .pricing-head{text-align:left;padding:18px 2px 10px}
body.member-session-mode .pricing-head p{margin-left:0;margin-right:0;max-width:760px}
body.member-session-mode .top-actions .header-link:first-of-type{color:#3346d3}
@media(max-width:980px){body.member-session-mode .workspace-grid{grid-template-columns:1fr}}
@media(max-width:760px){body.member-session-mode main{padding-top:10px}body.member-session-mode .hero.hero-v2{margin:0}body.member-session-mode #memberTrial{padding:14px;border-radius:17px}body.member-session-mode .trial-lab-head{align-items:flex-start}body.member-session-mode .trial-lab-head h2{font-size:22px}body.member-session-mode .member-workspace{padding:12px}body.member-session-mode .pricing-head{padding-top:12px}}
</style>`;

const runtime = `<script data-member-session-layout>(()=>{
const KEY='ekodi-marketing-free-experience';
const auth=document.querySelector('#googleCustomerAuth');
const trial=document.querySelector('#memberTrial');
const preview=document.querySelector('.product-preview');
const links=[...document.querySelectorAll('.header-link')];
const workspaceLink=links.find(a=>['#memberPreview','#memberTrial','#freeTrial'].includes(a.getAttribute('href')))||links[0];
const pricingLink=links.find(a=>a.getAttribute('href')==='#pricing');
const url=new URL(location.href);
const welcomed=url.searchParams.get('welcome')==='free';
const hasMember=()=>document.body.classList.contains('free-member-mode')||document.body.classList.contains('paid-member-mode')||welcomed||/✓|이용중/.test(auth?.textContent||'');
const setBodyClass=(name,enabled)=>{const next=Boolean(enabled);if(document.body.classList.contains(name)===next)return false;document.body.classList.toggle(name,next);return true};
let renderQueued=false;
function render(){
  renderQueued=false;
  const member=hasMember();
  setBodyClass('member-session-mode',member);
  if(member&&trial&&trial.hidden){trial.hidden=false;trial.removeAttribute('hidden')}
  const ready=!!(member&&trial&&trial.isConnected&&trial.querySelector('#freeTrialForm'));
  setBodyClass('member-workspace-ready',ready);
  if(preview&&preview.hidden!==ready)preview.hidden=ready;
  if(workspaceLink){const href=member?'#memberTrial':'#memberPreview';if(workspaceLink.getAttribute('href')!==href)workspaceLink.href=href;if(workspaceLink.textContent!==(member?'작업공간':'무료 체험'))workspaceLink.textContent=member?'작업공간':'무료 체험'}
  if(pricingLink&&pricingLink.textContent!==(member?'플랜·자동화':'이용 방식'))pricingLink.textContent=member?'플랜·자동화':'이용 방식';
  if(member&&auth&&auth.textContent.trim()==='무료 체험 중 ✓'){auth.textContent='FREE 회원 ✓';auth.href='#memberTrial'}
  if(member&&trial&&!ready)console.warn('Marketing AI member workspace fallback: trial shell is not ready; public landing remains visible.');
}
function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(render)}
render();
if(auth)new MutationObserver(scheduleRender).observe(auth,{childList:true,subtree:true,characterData:true});
const bodyObserver=new MutationObserver(scheduleRender);
bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
setTimeout(()=>bodyObserver.disconnect(),5000);
setTimeout(scheduleRender,0);
setTimeout(scheduleRender,250);
})();</script>`;

html = html.replace('</head>', `${style}</head>`);
html = html.replace('</body>', `${runtime}</body>`);

for (const required of [
  'data-member-session-layout',
  'member-session-mode',
  'member-workspace-ready',
  "workspaceLink.textContent=member?'작업공간':'무료 체험'",
  "pricingLink.textContent=member?'플랜·자동화':'이용 방식'",
  'setBodyClass',
  'scheduleRender',
  'requestAnimationFrame(render)',
  'body.member-session-mode.member-workspace-ready .product-preview',
  'body.member-session-mode.member-workspace-ready .hero-copy>h1',
  'body.member-session-mode.member-workspace-ready .feature-strip',
  "trial.removeAttribute('hidden')",
  "trial.querySelector('#freeTrialForm')",
]) {
  if (!html.includes(required)) throw new Error(`Member session layout contract missing: ${required}`);
}

fs.writeFileSync(hubFile, html);
console.log('✅ Marketing AI member layout uses idempotent class writes and one animation-frame render per mutation burst');
