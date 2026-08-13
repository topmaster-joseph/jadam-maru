import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const supabaseUrl = 'https://renzehysxirjilvdxacv.supabase.co';
const publishableKey = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const accessApi = `${supabaseUrl}/functions/v1/access-api`;
const allowedReturnOrigins = [
  'https://marketing.ekodi.kr',
  'https://jadam.ekodi.kr',
  'https://pizzamaru.ekodi.kr',
  'https://yogurtpurple.ekodi.kr',
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
  return `<style data-marketing-funnel>.trial-strip{margin:22px auto 0;max-width:920px;border:1px solid var(--line);background:#fff;border-radius:20px;padding:18px 20px;display:grid;grid-template-columns:1fr auto;gap:18px;align-items:center}.trial-strip small{display:block;color:var(--muted);font-weight:800;margin-bottom:5px}.trial-strip strong{display:block;font-size:20px;letter-spacing:-.03em}.trial-strip p{margin:5px 0 0;color:var(--muted);font-size:13px;line-height:1.55}.trial-strip a{background:var(--accent);color:#fff;border-radius:12px;padding:11px 14px;font-weight:900;font-size:13px;white-space:nowrap}@media(max-width:760px){.trial-strip{grid-template-columns:1fr}.trial-strip a{text-align:center}}</style>`;
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
  html = html.replaceAll('https://yogurt.ekodi.kr/', 'https://yogurtpurple.ekodi.kr/');
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
    if (!html.includes('Marketing AI Pro 사용신청')) {
      html = html.replace('</main>', '<section class="trial-strip"><div><small>FREE → PRO</small><strong>기본 기능은 먼저 무료로 써보세요.</strong><p>Google 무료회원으로 저장·계속 이용하고, 자동화·채널연동·분석이 필요해지면 Marketing AI Pro 사용을 신청할 수 있습니다.</p></div><a href="https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F">무료회원 / Pro 사용신청</a></section></main>');
    }
    indexPatched = html.includes('auth.ekodi.kr/?site=marketing') && html.includes('FREE → PRO');
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
  if (html.includes('https://yogurt.ekodi.kr/')) throw new Error(`Legacy yogurt domain survived in ${path.relative(root, file)}`);
  if (html.includes('id="googleCustomerAuth"')) {
    if (!html.includes('verifyOtp({token_hash:tokenHash')) throw new Error(`Central handoff receiver missing in ${path.relative(root, file)}`);
    if (!html.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js')) throw new Error(`Supabase auth client missing in ${path.relative(root, file)}`);
    if (!html.includes('Google로 무료 시작') && !html.includes('FREE → PRO')) throw new Error(`Free membership entry missing in ${path.relative(root, file)}`);
  }
}

console.log(`Marketing AI free-member → Pro funnel patched: index + ${casePages} case pages`);
