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
  return `<script type="module" data-ekodi-customer-prereg>import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';const sb=createClient(${JSON.stringify(supabaseUrl)},${JSON.stringify(publishableKey)},{auth:{detectSessionInUrl:true,persistSession:true}});const API=${JSON.stringify(customerApi)};const TENANT=${JSON.stringify(config.tenant)};const REALM=${JSON.stringify(config.realm)};const a=document.querySelector('#googleCustomerAuth');if(a){a.href='https://auth.ekodi.kr/?site='+encodeURIComponent(REALM);a.textContent='점주 Google 로그인';a.title='EKODI Control Center에 사전등록된 Google 계정으로 로그인';}let session=(await sb.auth.getSession()).data.session;for(let i=0;!session&&i<8;i++){await new Promise(r=>setTimeout(r,120));session=(await sb.auth.getSession()).data.session;}if(session){try{const r=await fetch(API+'/api/customer/federated-login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({tenant:TENANT,accessToken:session.access_token}),cache:'no-store'});const d=await r.json().catch(()=>({}));if(r.ok&&d.token){sessionStorage.setItem('ekodi-customer-token',d.token);sessionStorage.setItem('ekodi-customer-tenant',TENANT);sessionStorage.setItem('ekodi-customer-role',d.role||'');sessionStorage.setItem('ekodi-customer-email',d.email||session.user.email||'');if(a){a.textContent='고객 인증 완료 ✓';a.title=(d.email||session.user.email||'')+' · '+(d.role||'고객권한');}}else if(r.status===403&&a){a.textContent='등록 계정으로 로그인';a.title=d.error||'Control Center에 사전등록된 Google 이메일이 필요합니다.';}}catch(e){console.error('EKODI customer preregistration bridge',e);}}</script>`;
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
    `/api/customer/federated-login`,
    `site='+encodeURIComponent(REALM)`,
    config.tenant,
    config.realm,
    'ekodi-customer-token',
  ]) {
    if (!html.includes(needle)) throw new Error(`Customer preregistration contract missing ${needle}: ${config.dir}`);
  }
}

console.log('Managed store Google preregistration bridge patched: jadam, pizzamaru, yogurtpurple');
