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

function workspaceBootstrap() {
  return `<script type="module" data-ekodi-workspace-handoff>import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';const SUPABASE_URL=${JSON.stringify(supabaseUrl)};const PUBLISHABLE_KEY=${JSON.stringify(publishableKey)};const ACCESS=${JSON.stringify(accessApi)};const ALLOWED=new Set(${JSON.stringify(allowedReturnOrigins)});const STORAGE='ekodi-marketing-workspace';const sb=createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{detectSessionInUrl:true,persistSession:true}});const hash=new URLSearchParams(location.hash.replace(/^#/,''));const tokenHash=hash.get('ekodi_token');const handedWorkspace=hash.get('ekodi_workspace');if(tokenHash||handedWorkspace){history.replaceState({},document.title,location.pathname+location.search)}if(tokenHash){try{const{error}=await sb.auth.verifyOtp({token_hash:tokenHash,type:'email'});if(error)throw error}catch(e){console.error('EKODI central handoff',e)}}const auth=document.querySelector('#googleCustomerAuth');if(auth){const returnTo=ALLOWED.has(location.origin)?location.origin+location.pathname:'https://marketing.ekodi.kr/';auth.href='https://auth.ekodi.kr/?site=marketing&return_to='+encodeURIComponent(returnTo)}const{data:{session}}=await sb.auth.getSession();async function resolveWorkspace(){if(!session)return null;try{const r=await fetch(ACCESS+'/workspaces?site=marketing',{headers:{apikey:PUBLISHABLE_KEY,Authorization:'Bearer '+session.access_token},cache:'no-store'});if(!r.ok)return null;const d=await r.json();const list=Array.isArray(d.workspaces)?d.workspaces:[];const stored=sessionStorage.getItem(STORAGE);const requested=handedWorkspace||stored||'';let selected=requested?list.find(item=>item&&item.workspace_key===requested):null;if(requested&&!selected)sessionStorage.removeItem(STORAGE);if(!selected){selected=list.find(item=>item&&item.source==='registry'&&['active','pre_registered'].includes(String(item.status||'')))||list.find(item=>item&&item.workspace_kind==='personal')||list[0]||null}if(selected?.workspace_key)sessionStorage.setItem(STORAGE,selected.workspace_key);return selected}catch(e){console.error('EKODI workspace resolve',e);return null}}function exposeWorkspace(selected){if(!selected)return;const context=Object.freeze({workspaceKey:selected.workspace_key||null,workspaceKind:selected.workspace_kind||null,workspaceName:selected.workspace_name||null,tenantId:selected.tenant_id||null,tenant:selected.tenant||null,storeId:selected.store_id||null,store:selected.store||null,storeName:selected.store_name||null,role:selected.role||null,plan:selected.plan||'free',status:selected.status||null});window.EKODI_MARKETING_CONTEXT=context;document.body.dataset.ekodiWorkspace=context.workspaceKey||'';document.body.dataset.ekodiWorkspaceKind=context.workspaceKind||'';document.body.dataset.ekodiTenant=context.tenantId||'';document.body.dataset.ekodiStore=context.storeId||'';window.dispatchEvent(new CustomEvent('ekodi:workspace-ready',{detail:context}))}if(session){const selected=await resolveWorkspace();exposeWorkspace(selected);if(auth){const plan=String(selected?.plan||'free').toUpperCase();const name=selected?.workspace_name||selected?.store_name||(selected?.workspace_kind==='personal'?'개인':'Marketing AI');auth.textContent=name+' · '+plan+' ✓';auth.title=(session.user.email||'EKODI 회원')+' · '+name+' · '+plan}}}</script>`;
}

const legacyCentralAuth = /<script type="module">import\{createClient\}from'https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2\/\+esm';const sb=createClient\([\s\S]*?console\.error\('EKODI central handoff',e\)[\s\S]*?<\/script>/g;
const currentWorkspaceAuth = /<script type="module" data-ekodi-workspace-handoff>[\s\S]*?<\/script>/g;

let patched = 0;
for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('id="googleCustomerAuth"')) continue;

  html = html.replace(currentWorkspaceAuth, '');
  const beforeLegacy = html;
  html = html.replace(legacyCentralAuth, '');
  if (beforeLegacy === html && !beforeLegacy.includes('data-ekodi-workspace-handoff')) {
    throw new Error(`Central Marketing AI handoff bootstrap not found in ${path.relative(root, file)}`);
  }

  html = html.replace('</body>', `${workspaceBootstrap()}</body>`);
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
  if (!html.includes('window.EKODI_MARKETING_CONTEXT')) throw new Error(`Workspace context export missing in ${path.relative(root, file)}`);
  if (!html.includes("sessionStorage.setItem(STORAGE,selected.workspace_key)")) throw new Error(`Verified workspace persistence missing in ${path.relative(root, file)}`);
}

console.log(`Marketing AI selected workspace handoff patched and validated: ${patched} pages`);
