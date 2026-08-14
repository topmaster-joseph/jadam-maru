import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const supabaseUrl = 'https://renzehysxirjilvdxacv.supabase.co';
const publishableKey = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const accessApi = `${supabaseUrl}/functions/v1/access-api`;
const allowedReturnOrigins = [
  'https://marketing.ekodi.kr',
  'https://jadam.ai.ekodi.kr',
  'https://pizzamaru.ai.ekodi.kr',
  'https://yogurt.ai.ekodi.kr',
  'https://cgma.ai.ekodi.kr',
  'https://jadam.ekodi.kr',
  'https://pizzamaru.ekodi.kr',
  'https://yogurt.ekodi.kr',
];

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function funnelStyle() {
  return `<style data-marketing-funnel>.trial-lab{margin:26px auto 0;max-width:920px;border:1px solid var(--line);background:#fff;border-radius:22px;padding:22px}.trial-lab-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start}.trial-lab-head small,.trial-strip small{display:block;color:var(--muted);font-weight:800;margin-bottom:5px}.trial-lab h2{margin:0;font-size:25px;letter-spacing:-.04em}.trial-lab-head p{margin:6px 0 0;color:var(--muted);font-size:13px;line-height:1.55}.trial-free-badge{padding:7px 10px;border-radius:999px;background:var(--soft);color:var(--muted);font-size:11px;font-weight:900;white-space:nowrap}.trial-form{display:grid;grid-template-columns:1fr 1fr auto;gap:9px;margin-top:18px}.trial-form label{display:grid;gap:5px;font-size:11px;font-weight:800;color:var(--muted)}.trial-form input,.trial-form select{width:100%;border:1px solid var(--line);border-radius:12px;padding:11px 12px;background:#fff;color:var(--ink);outline:none}.trial-form button{align-self:end;border:0;border-radius:12px;padding:12px 15px;background:var(--accent);color:#fff;font-weight:900;cursor:pointer}.trial-results{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.trial-result{border:1px solid var(--line);border-radius:14px;padding:13px;background:var(--bg)}.trial-result small{display:block;color:var(--muted);font-size:10px;font-weight:900;margin-bottom:5px}.trial-result p{margin:0;font-size:13px;line-height:1.55;white-space:pre-line}.trial-disclosure{margin:10px 2px 0;color:var(--muted);font-size:11px;line-height:1.5}.trial-strip{margin:14px auto 0;max-width:920px;border:1px solid var(--line);background:#fff;border-radius:20px;padding:18px 20px;display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}.trial-strip strong{display:block;font-size:20px;letter-spacing:-.03em}.trial-strip p{margin:5px 0 0;color:var(--muted);font-size:13px;line-height:1.55}.trial-strip a{background:var(--accent);color:#fff;border-radius:12px;padding:11px 14px;font-weight:900;font-size:13px;white-space:nowrap}@media(max-width:760px){.trial-lab-head{display:grid}.trial-form,.trial-results,.trial-strip{grid-template-columns:1fr}.trial-strip a{text-align:center}}</style>`;
}

function trialExperienceMarkup() {
  return `<section class="trial-lab" id="freeTrial"><div class="trial-lab-head"><div><small>NO LOGIN · BASIC TRIAL</small><h2>30초 마케팅 문구 무료체험</h2><p>상호와 오늘 홍보할 내용을 넣으면 SNS 문구·해시태그·쇼츠 훅 샘플을 바로 만듭니다.</p></div><span class="trial-free-badge">로그인 없이 이용</span></div><form class="trial-form" id="freeTrialForm"><label>상호·매장명<input id="trialStore" maxlength="40" required placeholder="예: 에코디카페"></label><label>오늘 홍보할 내용<input id="trialFocus" maxlength="60" required placeholder="예: 시원한 아이스라떼"></label><label>톤<select id="trialTone"><option value="warm">친근하게</option><option value="clean">깔끔하게</option><option value="energetic">활기차게</option></select></label><button type="submit">무료 샘플 만들기</button></form><div class="trial-results" id="trialResults" hidden><article class="trial-result"><small>SNS CAPTION</small><p id="trialCaption"></p></article><article class="trial-result"><small>HASHTAGS</small><p id="trialTags"></p></article><article class="trial-result"><small>SHORTS HOOK</small><p id="trialHook"></p></article></div><p class="trial-disclosure">이 체험은 비용 없이 동작하는 기본 샘플 엔진입니다. 실제 AI 자동생성·저장·채널연동·분석은 Google 무료회원 및 승인된 Pro 기능에서 단계적으로 제공합니다.</p></section><section class="trial-strip"><div><small>FREE → PRO</small><strong>기본 기능은 먼저 무료로 써보세요.</strong><p>Google 무료회원으로 계속 이용하고, 자동화·채널연동·분석이 필요해지면 Marketing AI Pro 사용을 신청할 수 있습니다.</p></div><a href="https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F">무료회원 / Pro 사용신청</a></section>`;
}

function trialExperienceScript() {
  return `<script>(()=>{const form=document.querySelector('#freeTrialForm');if(!form)return;const clean=v=>String(v||'').trim().replace(/\s+/g,' ');const tag=v=>'#'+clean(v).replace(/[^0-9A-Za-z가-힣]+/g,'');const lines={warm:(s,f)=>[s+'에서 오늘 '+f+' 어때요? 부담 없이 들러 맛있는 한 시간을 만나보세요. 😊','오늘 뭐 먹지? '+s+'의 '+f+'로 가볍게 결정!'],clean:(s,f)=>[s+' · 오늘의 추천은 '+f+'. 필요한 정보만 담아 깔끔하게 소개합니다.','오늘의 한 컷, '+f+'. '+s+'에서 확인하세요.'],energetic:(s,f)=>['지금 주목! '+s+'의 '+f+'가 오늘의 선택을 기다립니다. 바로 만나보세요!','3초만 집중! 오늘 '+s+'에서 놓치기 아까운 '+f+'!']};form.addEventListener('submit',e=>{e.preventDefault();const store=clean(document.querySelector('#trialStore').value),focus=clean(document.querySelector('#trialFocus').value),tone=document.querySelector('#trialTone').value;if(!store||!focus)return;const copy=(lines[tone]||lines.warm)(store,focus);document.querySelector('#trialCaption').textContent=copy[0];document.querySelector('#trialHook').textContent=copy[1];document.querySelector('#trialTags').textContent=[tag(store),tag(focus),'#오늘의추천','#동네마케팅','#소상공인'].filter(x=>x.length>1).join(' ');document.querySelector('#trialResults').hidden=false;document.querySelector('#trialResults').scrollIntoView({behavior:'smooth',block:'nearest'});});})();</script>`;
}

function centralAuthBootstrap() {
  return `<script type="module">import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';const sb=createClient(${JSON.stringify(supabaseUrl)},${JSON.stringify(publishableKey)},{auth:{detectSessionInUrl:true,persistSession:true}});const ACCESS=${JSON.stringify(accessApi)};const hash=new URLSearchParams(location.hash.replace(/^#/,''));const tokenHash=hash.get('ekodi_token');if(tokenHash){history.replaceState({},document.title,location.pathname+location.search);try{const{error}=await sb.auth.verifyOtp({token_hash:tokenHash,type:'email'});if(error)throw error}catch(e){console.error('EKODI central handoff',e)}}const a=document.querySelector('#googleCustomerAuth');if(a){const allowed=new Set(${JSON.stringify(allowedReturnOrigins)});const returnTo=allowed.has(location.origin)?location.origin+location.pathname:'https://marketing.ekodi.kr/';a.href='https://auth.ekodi.kr/?site=marketing&return_to='+encodeURIComponent(returnTo);const{data:{session}}=await sb.auth.getSession();if(session){a.textContent='무료회원 ✓';a.title=session.user.email||'EKODI 무료회원';try{const r=await fetch(ACCESS+'/me?site=marketing',{headers:{apikey:${JSON.stringify(publishableKey)},Authorization:'Bearer '+session.access_token},cache:'no-store'});if(r.ok){const d=await r.json();if(d.status==='active'||d.status==='pre_registered'){a.textContent=(String(d.plan||'pro').toUpperCase())+' 이용중 ✓';a.title=(session.user.email||'EKODI 회원')+' · '+String(d.plan||'pro').toUpperCase()}}}catch{}}}</script>`;
}

let casePages = 0;
let indexPatched = false;

for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Legacy tenant/password auth is removed. Google identity is the single membership entry point.
  html = html.replace(/<section class="auth-panel"[\s\S]*?<\/section>/g, '');
  html = html.replace(/<script>\(\(\)=>\{const API='https:\/\/api\.ekodi\.kr';const TENANT=[\s\S]*?<\/script>/g, '');
  html = html.replaceAll('https://yogurtpurple.ekodi.kr/', 'https://yogurt.ekodi.kr/');
  html = html.replace(
    "script-src 'unsafe-inline'; connect-src https://api.ekodi.kr;",
    `script-src 'unsafe-inline' https://cdn.jsdelivr.net; connect-src https://api.ekodi.kr ${supabaseUrl};`,
  );

  if (!html.includes('data-marketing-funnel')) html = html.replace('</head>', `${funnelStyle()}</head>`);

  if (html.includes('id="customerAuthOpen"')) {
    html = html.replace(
      '<button class="auth-open" id="customerAuthOpen" type="button">고객 로그인</button>',
      '<a class="auth-open" id="googleCustomerAuth" href="https://auth.ekodi.kr/?site=marketing">Google로 무료 시작</a>',
    );
    casePages += 1;
  }

  if (file === path.join(out, 'index.html')) {
    html = html.replace(
      '<span class="badge">APPLICATION CASES</span>',
      '<div class="top-actions"><span class="badge">FREE TRIAL · APPLICATION CASES</span><a class="auth-open" id="googleCustomerAuth" href="https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F">Google로 무료 시작</a></div>',
    );
    if (!html.includes('id="freeTrialForm"')) html = html.replace('</main>', `${trialExperienceMarkup()}</main>`);
    if (!html.includes('Marketing AI basic trial engine')) html = html.replace('</body>', `<!-- Marketing AI basic trial engine -->${trialExperienceScript()}</body>`);
    indexPatched = html.includes('auth.ekodi.kr/?site=marketing') && html.includes('FREE → PRO') && html.includes('id="freeTrialForm"');
  }

  if (html.includes('id="googleCustomerAuth"') && !html.includes('EKODI central handoff')) {
    html = html.replace('</body>', `${centralAuthBootstrap()}</body>`);
  }

  if (html !== original) fs.writeFileSync(file, html);
}

if (casePages < 3) throw new Error(`Expected at least 3 Marketing AI case pages for central auth, patched ${casePages}`);
if (!indexPatched) throw new Error('Marketing AI free-to-Pro funnel was not patched on index');

for (const file of htmlFiles(out)) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('/api/customer/login') || html.includes('/api/customer/accept-invite') || html.includes('id="customerAuthOpen"')) {
    throw new Error(`Legacy direct customer auth survived in ${path.relative(root, file)}`);
  }
  if (html.includes('https://yogurtpurple.ekodi.kr/')) throw new Error(`Legacy yogurt domain survived in ${path.relative(root, file)}`);
  if (html.includes('id="googleCustomerAuth"')) {
    if (!html.includes('verifyOtp({token_hash:tokenHash')) throw new Error(`Central handoff receiver missing in ${path.relative(root, file)}`);
    if (!html.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js')) throw new Error(`Supabase auth client missing in ${path.relative(root, file)}`);
    if (!html.includes('Google로 무료 시작') && !html.includes('FREE → PRO')) throw new Error(`Free membership entry missing in ${path.relative(root, file)}`);
  }
}

const hub = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
if (!hub.includes('id="freeTrialForm"') || !hub.includes('Marketing AI basic trial engine')) throw new Error('Anonymous basic trial is missing from Marketing AI hub');

console.log(`Marketing AI anonymous trial + free-member → Pro funnel patched: index + ${casePages} case pages`);
