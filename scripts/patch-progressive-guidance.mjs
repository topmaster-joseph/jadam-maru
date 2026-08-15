import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubFile = path.join(root, 'dist', 'marketing-ai', 'index.html');
if (!fs.existsSync(hubFile)) throw new Error('Marketing AI hub must exist before progressive guidance patch');

let html = fs.readFileSync(hubFile, 'utf8');
html = html.replace(/<style data-progressive-guidance>[\s\S]*?<\/style>/g, '');
html = html.replace(/<script data-progressive-guidance>[\s\S]*?<\/script>/g, '');
html = html.replace(/<section class="post-trial-guide"[\s\S]*?<\/section><!-- post-trial-guide:end -->/g, '');

if (!html.includes('id="freeTrialForm"') || !html.includes('id="trialResults"') || !html.includes('id="pricing"')) {
  throw new Error('Trial, results and pricing must exist before progressive guidance patch');
}

const guide = `<section class="post-trial-guide" id="postTrialGuide" hidden><div><small>체험 후 다음 단계</small><strong>결과를 먼저 확인해 보세요.</strong><p>필요하면 그다음에 내 사용량에 맞는 플랜과 자동화 수준만 비교할 수 있습니다.</p></div><div class="post-trial-actions"><button type="button" class="secondary" id="tryAnotherContent">다른 콘텐츠 만들기</button><button type="button" id="openPlanGuide">내게 맞는 플랜 보기</button></div></section><!-- post-trial-guide:end -->`;

const limitMarker = /(<p class="trial-limit-message" id="trialLimitMessage"[^>]*><\/p>)/;
if (!limitMarker.test(html)) throw new Error('Trial limit message marker missing');
html = html.replace(limitMarker, `$1${guide}`);

const style = `<style data-progressive-guidance>
body.member-session-mode:not(.trial-complete) #pricing,
body.member-session-mode:not(.trial-complete) .automation-ladder,
body.member-session-mode:not(.trial-complete) .top-actions .header-link[href="#pricing"]{display:none!important}
body.member-session-mode.trial-complete:not(.pricing-open) #pricing{display:none!important}
body.member-session-mode .post-trial-guide{margin:14px 0 0;padding:14px 15px;border:1px solid #e2e6f2;border-radius:15px;background:linear-gradient(120deg,#fff,#f7f5ff);display:flex;align-items:center;justify-content:space-between;gap:18px}
body.member-session-mode .post-trial-guide[hidden]{display:none!important}
.post-trial-guide small{display:block;color:#6f5fe0;font-size:9px;font-weight:950;margin-bottom:4px}.post-trial-guide strong{display:block;font-size:15px;letter-spacing:-.025em}.post-trial-guide p{margin:4px 0 0;color:var(--muted);font-size:10px;line-height:1.5}.post-trial-actions{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.post-trial-actions button{border:0;border-radius:10px;padding:10px 12px;background:linear-gradient(100deg,#3158f5,#7c3aed);color:#fff;font-size:10px;font-weight:900;cursor:pointer;white-space:nowrap}.post-trial-actions button.secondary{background:#fff;color:#334155;border:1px solid #dfe4ef}
body.member-session-mode:not(.trial-complete) .workspace-head p{max-width:620px}
body.member-session-mode:not(.trial-complete) .workspace-head p::after{content:' 먼저 하나 만들어 본 뒤 필요한 안내만 보여드립니다.';color:#5361db;font-weight:800}
@media(max-width:760px){body.member-session-mode .post-trial-guide{display:grid}.post-trial-actions{justify-content:stretch}.post-trial-actions button{flex:1}.post-trial-guide p{font-size:9px}}
</style>`;

const runtime = `<script data-progressive-guidance>(()=>{
const DONE='ekodi-marketing-first-trial-complete';
const form=document.querySelector('#freeTrialForm');
const results=document.querySelector('#trialResults');
const guide=document.querySelector('#postTrialGuide');
const open=document.querySelector('#openPlanGuide');
const another=document.querySelector('#tryAnotherContent');
const pricing=document.querySelector('#pricing');
const pricingLink=[...document.querySelectorAll('.header-link')].find(a=>a.getAttribute('href')==='#pricing');
const isPaid=()=>document.body.classList.contains('paid-member-mode');
const completed=()=>isPaid()||localStorage.getItem(DONE)==='1';
const setBodyClass=(name,enabled)=>{const next=Boolean(enabled);if(document.body.classList.contains(name)===next)return false;document.body.classList.toggle(name,next);return true};
let renderQueued=false;
function render(){
  renderQueued=false;
  const done=completed();
  setBodyClass('trial-complete',done);
  if(guide&&guide.hidden===done)guide.hidden=!done;
  if(pricingLink&&pricingLink.hidden===done)pricingLink.hidden=!done;
  if(!done)setBodyClass('pricing-open',false);
}
function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(render)}
function complete(){localStorage.setItem(DONE,'1');scheduleRender();requestAnimationFrame(()=>guide?.scrollIntoView({behavior:'smooth',block:'nearest'}))}
form?.addEventListener('submit',()=>setTimeout(()=>{if(results&&!results.hidden)complete()},0));
open?.addEventListener('click',()=>{setBodyClass('pricing-open',true);pricing?.scrollIntoView({behavior:'smooth',block:'start'})});
another?.addEventListener('click',()=>{setBodyClass('pricing-open',false);form?.scrollIntoView({behavior:'smooth',block:'center'});form?.querySelector('input:not([type="hidden"])')?.focus({preventScroll:true})});
pricingLink?.addEventListener('click',e=>{if(!completed()){e.preventDefault();return}e.preventDefault();setBodyClass('pricing-open',true);pricing?.scrollIntoView({behavior:'smooth',block:'start'})});
const bodyObserver=new MutationObserver(scheduleRender);
bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
setTimeout(()=>bodyObserver.disconnect(),5000);
window.addEventListener('ekodi:auth-ready',scheduleRender);
window.addEventListener('ekodi:workspace-ready',scheduleRender);
render();
})();</script>`;

html = html.replace('</head>', `${style}</head>`);
html = html.replace('</body>', `${runtime}</body>`);

for (const required of [
  'data-progressive-guidance',
  'id="postTrialGuide"',
  'id="openPlanGuide"',
  'id="tryAnotherContent"',
  'ekodi-marketing-first-trial-complete',
  'trial-complete',
  'pricing-open',
  'body.member-session-mode:not(.trial-complete) #pricing',
  'setBodyClass',
  'scheduleRender',
  'requestAnimationFrame(render)',
  'bodyObserver.disconnect()',
]) {
  if (!html.includes(required)) throw new Error(`Progressive guidance contract missing: ${required}`);
}

fs.writeFileSync(hubFile, html);
console.log('✅ Marketing AI progressive guidance coalesces class mutations and disconnects its startup observer');
