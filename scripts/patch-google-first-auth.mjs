import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const supabaseUrl = 'https://renzehysxirjilvdxacv.supabase.co';
const publishableKey = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
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

function centralAuthBootstrap() {
  return `<script type="module">import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';const sb=createClient(${JSON.stringify(supabaseUrl)},${JSON.stringify(publishableKey)},{auth:{detectSessionInUrl:true,persistSession:true}});const hash=new URLSearchParams(location.hash.replace(/^#/,''));const tokenHash=hash.get('ekodi_token');if(tokenHash){history.replaceState({},document.title,location.pathname+location.search);try{const{error}=await sb.auth.verifyOtp({token_hash:tokenHash,type:'email'});if(error)throw error}catch(e){console.error('EKODI central handoff',e)}}const a=document.querySelector('#googleCustomerAuth');if(a){const allowed=new Set(${JSON.stringify(allowedReturnOrigins)});const returnTo=allowed.has(location.origin)?location.origin+location.pathname:'https://marketing.ekodi.kr/';a.href='https://auth.ekodi.kr/?site=marketing&return_to='+encodeURIComponent(returnTo);const{data:{session}}=await sb.auth.getSession();if(session){a.textContent='인증 완료 ✓';a.title=session.user.email||'EKODI 인증 완료'}}</script>`;
}

let casePages = 0;
let indexPatched = false;

for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  // Remove the legacy per-tenant password modal and its runtime. Central identity is the only visible auth entry.
  html = html.replace(/<section class="auth-panel"[\s\S]*?<\/section>/g, '');
  html = html.replace(/<script>\(\(\)=>\{const API='https:\/\/api\.ekodi\.kr';const TENANT=[\s\S]*?<\/script>/g, '');
  html = html.replaceAll('https://yogurt.ekodi.kr/', 'https://yogurtpurple.ekodi.kr/');
  html = html.replace(
    "script-src 'unsafe-inline'; connect-src https://api.ekodi.kr;",
    `script-src 'unsafe-inline' https://cdn.jsdelivr.net; connect-src https://api.ekodi.kr ${supabaseUrl};`,
  );

  if (html.includes('id="customerAuthOpen"')) {
    html = html.replace(
      '<button class="auth-open" id="customerAuthOpen" type="button">고객 로그인</button>',
      '<a class="auth-open" id="googleCustomerAuth" href="https://auth.ekodi.kr/?site=marketing">통합 로그인</a>',
    );
    casePages += 1;
  }

  if (file === path.join(out, 'index.html')) {
    html = html.replace(
      '<span class="badge">APPLICATION CASES</span>',
      '<div class="top-actions"><span class="badge">APPLICATION CASES</span><a class="auth-open" id="googleCustomerAuth" href="https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F">통합 로그인</a></div>',
    );
    indexPatched = html.includes('auth.ekodi.kr/?site=marketing');
  }

  if (html.includes('id="googleCustomerAuth"') && !html.includes('EKODI central handoff')) {
    html = html.replace('</body>', `${centralAuthBootstrap()}</body>`);
  }

  if (html !== original) fs.writeFileSync(file, html);
}

if (casePages < 3) throw new Error(`Expected at least 3 Marketing AI case pages for central auth, patched ${casePages}`);
if (!indexPatched) throw new Error('Marketing AI index central login entry was not patched');

for (const file of htmlFiles(out)) {
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('/api/customer/login') || html.includes('/api/customer/accept-invite') || html.includes('id="customerAuthOpen"')) {
    throw new Error(`Legacy direct customer auth survived in ${path.relative(root, file)}`);
  }
  if (html.includes('https://yogurt.ekodi.kr/')) throw new Error(`Legacy yogurt domain survived in ${path.relative(root, file)}`);
  if (html.includes('id="googleCustomerAuth"')) {
    if (!html.includes('verifyOtp({token_hash:tokenHash')) throw new Error(`Central handoff receiver missing in ${path.relative(root, file)}`);
    if (!html.includes('cdn.jsdelivr.net/npm/@supabase/supabase-js')) throw new Error(`Supabase auth client missing in ${path.relative(root, file)}`);
  }
}

console.log(`Central Marketing AI auth patched: index + ${casePages} case pages`);
