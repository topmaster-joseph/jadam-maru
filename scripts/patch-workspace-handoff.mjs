import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const supabaseUrl = 'https://renzehysxirjilvdxacv.supabase.co';
const publishableKey = 'sb_publishable_0QjB0WzZbjrd-FJ5D5cR7A_xUkXyOY_';
const accessApi = `${supabaseUrl}/functions/v1/access-api`;
const marketingApi = 'https://marketing-api.ekodi.kr';
const supabaseStorageKey = 'sb-renzehysxirjilvdxacv-auth-token';
const allowedReturnOrigins = [
  'https://marketing.ekodi.kr',
  'https://jadam.ekodi.kr',
  'https://pizzamaru.ekodi.kr',
  'https://yogurt.ekodi.kr',
];
const preferredTenantByOrigin = {
  'https://jadam.ekodi.kr': 'jadam',
  'https://pizzamaru.ekodi.kr': 'pizzamaru',
  'https://yogurt.ekodi.kr': 'yogurt',
};

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

function workspaceBootstrap() {
  return `<script type="module" data-ekodi-workspace-handoff>
const SUPABASE_URL=${JSON.stringify(supabaseUrl)};
const PUBLISHABLE_KEY=${JSON.stringify(publishableKey)};
const ACCESS=${JSON.stringify(accessApi)};
const MARKETING_API=${JSON.stringify(marketingApi)};
const AUTH_STORAGE_KEY=${JSON.stringify(supabaseStorageKey)};
const ALLOWED=new Set(${JSON.stringify(allowedReturnOrigins)});
const ORIGIN_TENANT=${JSON.stringify(preferredTenantByOrigin)};
const STORAGE='ekodi-marketing-workspace';
const hash=new URLSearchParams(location.hash.replace(/^#/,''));
const tokenHash=hash.get('ekodi_token');
const handedWorkspace=hash.get('ekodi_workspace');
const handedTenant=hash.get('ekodi_tenant');
const handedStore=hash.get('ekodi_store');
const dynamicAiOrigin=()=>location.protocol==='https:'&&/^[a-z0-9-]+\\.ai\\.ekodi\\.kr$/i.test(location.hostname);
const auth=document.querySelector('#googleCustomerAuth');
if(auth){
  const returnTo=(ALLOWED.has(location.origin)||dynamicAiOrigin())?location.origin+location.pathname:'https://marketing.ekodi.kr/';
  auth.href='https://auth.ekodi.kr/?site=marketing&return_to='+encodeURIComponent(returnTo);
}
const hasStoredSession=()=>{try{const value=localStorage.getItem(AUTH_STORAGE_KEY);return Boolean(value&&value!=='null'&&value!=='undefined')}catch{return false}};
const needsAuthClient=Boolean(tokenHash||handedWorkspace||handedTenant||handedStore||hasStoredSession());
window.EKODI_MARKETING_AUTH_PENDING=needsAuthClient;
const notifyAuth=authenticated=>{window.EKODI_MARKETING_AUTH_PENDING=false;window.dispatchEvent(new CustomEvent('ekodi:auth-ready',{detail:{authenticated:Boolean(authenticated)}}))};
if(!needsAuthClient){
  document.body.dataset.ekodiAuthState='anonymous';
  notifyAuth(false);
}else{
  const timeout=(promise,ms,label)=>Promise.race([promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error(label||'timeout')),ms))]);
  let createClient=null;
  try{
    try{({createClient}=await timeout(import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'),6000,'supabase_primary_timeout'))}
    catch(primary){
      console.warn('Marketing AI Supabase primary CDN failed; trying fallback',primary);
      ({createClient}=await timeout(import('https://esm.sh/@supabase/supabase-js@2?bundle'),6000,'supabase_fallback_timeout'));
    }
  }catch(loadError){
    console.error('Marketing AI Supabase client unavailable',loadError);
    if(auth){auth.textContent='로그인 연결 다시 시도';auth.title='인증 모듈 연결이 지연되고 있습니다. 다시 시도해 주세요.'}
    document.body.dataset.ekodiAuthError='client-unavailable';
    document.body.dataset.ekodiAuthState='unavailable';
    notifyAuth(false);
  }
  if(createClient){
    const sb=createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,persistSession:true}});
    let handoffError=null;
    if(tokenHash){
      try{const{error}=await timeout(sb.auth.verifyOtp({token_hash:tokenHash,type:'email'}),10000,'verify_otp_timeout');if(error)throw error}
      catch(e){handoffError=e;console.error('EKODI central handoff',e)}
    }
    const{data:{session}}=await sb.auth.getSession();
    if(session&&(tokenHash||handedWorkspace||handedTenant||handedStore))history.replaceState({},document.title,location.pathname+location.search);
    else if(!session&&tokenHash&&auth){auth.textContent='로그인 연결 다시 시도';auth.title=handoffError?.message||'로그인 정보를 적용하지 못했습니다. 다시 시도해 주세요.';document.body.dataset.ekodiAuthError='handoff-failed'}
    async function canonicalStoreId(){
      if(!dynamicAiOrigin())return'';
      try{const r=await fetch(MARKETING_API+'/api/marketing/workspace/resolve?host='+encodeURIComponent(location.hostname),{cache:'no-store'});if(!r.ok)return'';const d=await r.json();return String(d?.workspace?.storeId||'')}
      catch(e){console.error('EKODI canonical workspace resolve',e);return''}
    }
    async function resolveWorkspace(){
      if(!session)return null;
      try{
        const [r,hostStore]=await Promise.all([
          fetch(ACCESS+'/workspaces?site=marketing',{headers:{apikey:PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token},cache:'no-store'}),
          canonicalStoreId(),
        ]);
        if(!r.ok)return null;
        const d=await r.json();
        const list=Array.isArray(d.workspaces)?d.workspaces:[];
        const stored=sessionStorage.getItem(STORAGE);
        const requested=handedWorkspace||stored||'';
        let selected=requested?list.find(item=>item&&item.workspace_key===requested):null;
        if(requested&&!selected)sessionStorage.removeItem(STORAGE);
        if(!selected&&handedStore)selected=list.find(item=>item&&String(item.store_id||'')===handedStore&&['active','pre_registered'].includes(String(item.status||'')))||null;
        if(!selected&&handedTenant)selected=list.find(item=>item&&String(item.tenant_id||'')===handedTenant&&['active','pre_registered'].includes(String(item.status||'')))||null;
        if(hostStore){const hostSelected=list.find(item=>item&&String(item.store_id||'')===hostStore&&['active','pre_registered'].includes(String(item.status||'')));if(hostSelected)selected=hostSelected}
        const preferredTenant=ORIGIN_TENANT[location.origin]||'';
        if(!selected&&preferredTenant)selected=list.find(item=>item&&item.tenant===preferredTenant&&['active','pre_registered'].includes(String(item.status||'')))||null;
        if(!selected)selected=list.find(item=>item&&item.source==='registry'&&['active','pre_registered'].includes(String(item.status||'')))||list.find(item=>item&&item.workspace_kind==='personal')||list[0]||null;
        if(selected?.workspace_key)sessionStorage.setItem(STORAGE,selected.workspace_key);
        return selected;
      }catch(e){console.error('EKODI workspace resolve',e);return null}
    }
    function exposeWorkspace(selected){
      if(!selected)return;
      const context=Object.freeze({workspaceKey:selected.workspace_key||null,workspaceKind:selected.workspace_kind||null,workspaceName:selected.workspace_name||null,tenantId:selected.tenant_id||null,tenant:selected.tenant||null,storeId:selected.store_id||null,store:selected.store||null,storeName:selected.store_name||null,role:selected.role||null,plan:selected.plan||'free',status:selected.status||null,source:selected.source||null});
      window.EKODI_MARKETING_CONTEXT=context;
      document.body.dataset.ekodiWorkspace=context.workspaceKey||'';
      document.body.dataset.ekodiWorkspaceKind=context.workspaceKind||'';
      document.body.dataset.ekodiTenant=context.tenantId||'';
      document.body.dataset.ekodiStore=context.storeId||'';
      window.dispatchEvent(new CustomEvent('ekodi:workspace-ready',{detail:context}));
    }
    if(session){
      window.EKODI_MARKETING_AUTH_TOKEN=session.access_token;
      const selected=await resolveWorkspace();
      exposeWorkspace(selected);
      document.body.dataset.ekodiAuthError='';
      document.body.dataset.ekodiAuthState='authenticated';
      if(auth){const plan=String(selected?.plan||'free').toUpperCase();const name=selected?.workspace_name||selected?.store_name||(selected?.workspace_kind==='personal'?'개인':'Marketing AI');auth.textContent=name+' · '+plan+' ✓';auth.title=(session.user.email||'EKODI 회원')+' · '+name+' · '+plan}
    }else{
      document.body.dataset.ekodiAuthState='anonymous';
    }
    notifyAuth(Boolean(session));
  }
}
</script>`;
}

const legacyCentralAuth = /<script type="module">import\{createClient\}from'https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\/\+esm';const sb=createClient\([\s\S]*?console\.error\('EKODI central handoff',e\)[\s\S]*?<\/script>/g;
const currentWorkspaceAuth = /<script type="module" data-ekodi-workspace-handoff>[\s\S]*?<\/script>/g;

let patched = 0;
for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="googleCustomerAuth"')) continue;

  let replaced = false;
  html = html.replace(currentWorkspaceAuth, () => {
    replaced = true;
    return workspaceBootstrap();
  });
  if (!replaced) {
    html = html.replace(legacyCentralAuth, () => {
      replaced = true;
      return workspaceBootstrap();
    });
  }
  if (!replaced) throw new Error(`Central Marketing AI handoff bootstrap not found in ${path.relative(root, file)}`);

  html = html.replace(/script-src([^;]*);/i, (all, hosts) => {
    let next = hosts;
    for (const host of ['https://cdn.jsdelivr.net', 'https://esm.sh']) if (!next.includes(host)) next += ` ${host}`;
    return `script-src${next};`;
  });
  html = html.replace(/connect-src([^;]*);/i, (all, hosts) => {
    let next = hosts;
    for (const host of [supabaseUrl, marketingApi]) if (!next.includes(host)) next += ` ${host}`;
    return `connect-src${next};`;
  });
  fs.writeFileSync(file, html);
  patched += 1;
}

if (patched < 4) throw new Error(`Expected Marketing AI hub + customer pages to receive workspace handoff, patched ${patched}`);

for (const file of htmlFiles(out)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="googleCustomerAuth"')) continue;
  if (!html.includes('data-ekodi-workspace-handoff')) throw new Error(`Workspace handoff receiver missing in ${path.relative(root, file)}`);
  if (!html.includes("ACCESS+'/workspaces?site=marketing'")) throw new Error(`Workspace list validation missing in ${path.relative(root, file)}`);
  if (!html.includes("hash.get('ekodi_workspace')")) throw new Error(`Selected workspace handoff key missing in ${path.relative(root, file)}`);
  if (!html.includes("hash.get('ekodi_store')")) throw new Error(`Selected store handoff key missing in ${path.relative(root, file)}`);
  if (!html.includes("hash.get('ekodi_tenant')")) throw new Error(`Selected tenant handoff key missing in ${path.relative(root, file)}`);
  if (!html.includes('needsAuthClient=Boolean')) throw new Error(`Anonymous auth fast path missing in ${path.relative(root, file)}`);
  if (!html.includes('window.EKODI_MARKETING_AUTH_PENDING=needsAuthClient')) throw new Error(`Auth pending bridge missing in ${path.relative(root, file)}`);
  if (!html.includes("document.body.dataset.ekodiAuthState='anonymous'")) throw new Error(`Anonymous auth state missing in ${path.relative(root, file)}`);
  if (!html.includes('supabase_primary_timeout')) throw new Error(`Primary Supabase CDN timeout guard missing in ${path.relative(root, file)}`);
  if (!html.includes('https://esm.sh/@supabase/supabase-js@2?bundle')) throw new Error(`Supabase fallback CDN missing in ${path.relative(root, file)}`);
  if (!html.includes("if(session&&(tokenHash||handedWorkspace||handedTenant||handedStore))")) throw new Error(`Successful handoff cleanup guard missing in ${path.relative(root, file)}`);
  if (!html.includes('window.EKODI_MARKETING_AUTH_TOKEN=session.access_token')) throw new Error(`Shared in-memory auth token bridge missing in ${path.relative(root, file)}`);
  if (!html.includes('window.EKODI_MARKETING_CONTEXT')) throw new Error(`Workspace context export missing in ${path.relative(root, file)}`);
  if (!html.includes("sessionStorage.setItem(STORAGE,selected.workspace_key)")) throw new Error(`Verified workspace persistence missing in ${path.relative(root, file)}`);
  if (!html.includes('/api/marketing/workspace/resolve?host=')) throw new Error(`Canonical Store resolver missing in ${path.relative(root, file)}`);
  if (!html.includes("/^[a-z0-9-]+\\.ai\\.ekodi\\.kr$/i")) throw new Error(`Dynamic ai.ekodi.kr return policy missing in ${path.relative(root, file)}`);
}

for (const dir of ['jadam', 'pizzamaru', 'yogurtpurple']) {
  const file = path.join(out, dir, 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-ekodi-customer-prereg')) throw new Error(`Universal customer login bridge was lost in ${dir}`);
  if (!html.includes('/api/customer/federated-login')) throw new Error(`Customer role bridge was lost in ${dir}`);
  if (!html.includes('/api/membership/me?site=marketing&tenant=')) throw new Error(`Membership bridge was lost in ${dir}`);
  if (!html.includes('ORIGIN_TENANT')) throw new Error(`Current-site workspace preference missing in ${dir}`);
}

console.log(`Marketing AI selected workspace handoff + anonymous fast path + resilient Supabase fallback patched: ${patched} pages`);
