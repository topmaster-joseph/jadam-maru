import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const supabaseUrl = 'https://renzehysxirjilvdxacv.supabase.co';
const publishableKey = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const customerApi = 'https://api.ekodi.kr';

const targets = [
  { dir: 'jadam', tenant: 'jadam', realm: 'jadam-client', label: '자담치킨 목포대점' },
  { dir: 'pizzamaru', tenant: 'pizzamaru', realm: 'pizzamaru-client', label: '피자마루 목포대점' },
  { dir: 'yogurtpurple', tenant: 'yogurt', realm: 'yogurt-client', label: '요거트퍼플 목포대점' },
];

function customerBootstrap(config) {
  return `<script type="module" data-ekodi-customer-prereg>import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';const sb=createClient(${JSON.stringify(supabaseUrl)},${JSON.stringify(publishableKey)},{auth:{detectSessionInUrl:true,persistSession:true}});const API=${JSON.stringify(customerApi)};const TENANT=${JSON.stringify(config.tenant)};const REALM=${JSON.stringify(config.realm)};const CUSTOMER_SESSION_WAIT_MS=12000;const CUSTOMER_SESSION_STEP_MS=150;const roleLabels={store_owner:'점주/책임자',marketing_manager:'마케팅담당자',hq_manager:'본사담당자',accounting_manager:'회계담당자',client_admin:'관리책임자',editor:'편집자',viewer:'조회자'};const roleLabel=role=>roleLabels[role]||role||'회원';const a=document.querySelector('#googleCustomerAuth');const currentReturn=new URL(location.href);currentReturn.hash='';const loginUrl=new URL('https://auth.ekodi.kr/');loginUrl.searchParams.set('site',REALM);loginUrl.searchParams.set('return_to',currentReturn.href);const loginHref=loginUrl.href;const planHref=()=>{const u=new URL('https://auth.ekodi.kr/');u.searchParams.set('site','marketing');u.searchParams.set('return_to',location.origin+'/');return u.href};if(a){a.href=loginHref;a.textContent='Google로 로그인';a.title='등록된 Google 이메일과 일치하면 역할과 권한이 자동 적용됩니다.';}const sleep=ms=>new Promise(r=>setTimeout(r,ms));async function sessionWhenReady(){let session=(await sb.auth.getSession()).data.session;const deadline=Date.now()+CUSTOMER_SESSION_WAIT_MS;while(!session&&Date.now()<deadline){await sleep(CUSTOMER_SESSION_STEP_MS);session=(await sb.auth.getSession()).data.session;}return session;}async function syncMembership(session,access){let plan='FREE';try{const r=await fetch(API+'/api/membership/me?site=marketing&tenant='+encodeURIComponent(TENANT),{headers:{authorization:'Bearer '+session.access_token},cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d.subscription?.planId)plan=String(d.subscription.planId).toUpperCase();}catch(e){console.error('EKODI membership state',e);}if(a){a.href=planHref();a.textContent='로그인됨 · '+roleLabel(access.role)+' · '+plan;a.title='등록된 역할이 적용되었습니다. 클릭하면 회원등급과 기능을 선택할 수 있습니다.';}}async function activate(session){if(!session)return;let lastError='';for(let attempt=0;attempt<3;attempt++){try{const r=await fetch(API+'/api/customer/federated-login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tenant:TENANT,accessToken:session.access_token}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d.token){sessionStorage.setItem('ekodi-customer-token',d.token);sessionStorage.setItem('ekodi-customer-tenant',TENANT);sessionStorage.setItem('ekodi-customer-role',d.role||'');sessionStorage.setItem('ekodi-customer-email',d.email||session.user.email||'');if(a){a.textContent='로그인됨 · '+roleLabel(d.role);a.title=(d.email||session.user.email||'')+' · '+roleLabel(d.role);}await syncMembership(session,d);return;}lastError=d.error||('http_'+r.status);if(r.status===403){if(a){a.href=loginHref;a.textContent='등록 계정으로 다시 로그인';a.title=lastError||'Control Center에 사전등록된 Google 이메일이 필요합니다.';}return;}if(r.status<500)break;}catch(e){lastError=e?.message||'network_error';console.error('EKODI customer preregistration bridge',e);}if(attempt<2)await sleep(300*(attempt+1));}console.error('EKODI customer activation sync failed',lastError);if(a){a.href=loginHref;a.textContent='Google 로그인 다시 시도';a.title='Google 로그인은 완료되었지만 고객권한 동기화가 끝나지 않았습니다. 다시 로그인하면 자동 확인합니다.';}}const session=await sessionWhenReady();if(session)await activate(session);</script>`;
}

for (const config of targets) {
  const file = path.join(out, config.dir, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Missing managed store page: ${file}`);
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<script type="module" data-ekodi-customer-prereg>[\s\S]*?<\/script>/g, '');
  if (!html.includes('id="googleCustomerAuth"')) throw new Error(`Google customer auth button missing: ${config.dir}`);
  html = html.replace('</body>', `${customerBootstrap(config)}</body>`);
  fs.writeFileSync(file, html);
}

for (const config of targets) {
  const file = path.join(out, config.dir, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  for (const needle of [
    'data-ekodi-customer-prereg',
    '/api/customer/federated-login',
    '/api/membership/me?site=marketing&tenant=',
    `site',REALM`,
    `return_to',currentReturn.href`,
    config.tenant,
    config.realm,
    'ekodi-customer-token',
    'CUSTOMER_SESSION_WAIT_MS=12000',
    'sessionWhenReady()',
    'Google로 로그인',
    'roleLabels',
    'customer activation sync failed',
  ]) {
    if (!html.includes(needle)) throw new Error(`Customer preregistration contract missing ${needle}: ${config.dir}`);
  }
  if (html.includes('점주 Google 로그인')) throw new Error(`Role-specific login label leaked into ${config.dir}`);
}

console.log('Managed store universal Google login, origin return, automatic role and membership bridge patched: jadam, pizzamaru, yogurtpurple');
