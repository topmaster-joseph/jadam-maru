import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const authStorageKey = 'sb-renzehysxirjilvdxacv-auth-token';
const targets = [
  path.join(out, 'index.html'),
  path.join(out, 'jadam', 'index.html'),
  path.join(out, 'pizzamaru', 'index.html'),
  path.join(out, 'yogurtpurple', 'index.html'),
];

const staticImport = "import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';\n";
const clientInit = "const tenant=String(panel.dataset.tenant||'').trim();const sb=createClient(SUPABASE,KEY,{auth:{detectSessionInUrl:true,persistSession:true}});";
const sessionInit = "const{data:{session}}=await sb.auth.getSession();if(!session?.access_token){panel.hidden=true}else{token=session.access_token;const ctx=await waitContext();storeId=String(ctx?.storeId||'');await load()}";

const sharedAuthRuntime = `const storedAuthHint=(()=>{try{const value=localStorage.getItem(${JSON.stringify(authStorageKey)});return Boolean(value&&value!=='null'&&value!=='undefined')}catch{return false}})();async function authTokenWhenReady(){const current=String(window.EKODI_MARKETING_AUTH_TOKEN||'');if(current)return current;if(!window.EKODI_MARKETING_AUTH_PENDING&&!storedAuthHint)return'';return new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);window.removeEventListener('ekodi:auth-ready',finish);resolve(String(window.EKODI_MARKETING_AUTH_TOKEN||''))};const timer=setTimeout(finish,4500);window.addEventListener('ekodi:auth-ready',finish,{once:true})})}const sharedToken=await authTokenWhenReady();if(!sharedToken){panel.hidden=true}else{token=sharedToken;const ctx=await waitContext();storeId=String(ctx?.storeId||'');await load()}`;

let patched = 0;
for (const file of targets) {
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const match = html.match(/<script type="module" data-custom-domain-ui>[\s\S]*?<\/script>/);
  if (!match) throw new Error(`Custom-domain runtime missing before stability patch: ${path.relative(root, file)}`);

  let runtime = match[0];
  if (!runtime.includes(staticImport)) throw new Error(`Static custom-domain Supabase import changed unexpectedly: ${path.relative(root, file)}`);
  if (!runtime.includes(clientInit)) throw new Error(`Custom-domain Supabase client initializer changed unexpectedly: ${path.relative(root, file)}`);
  if (!runtime.includes(sessionInit)) throw new Error(`Custom-domain session initializer changed unexpectedly: ${path.relative(root, file)}`);

  runtime = runtime.replace(staticImport, '');
  runtime = runtime.replace(clientInit, "const tenant=String(panel.dataset.tenant||'').trim();");
  runtime = runtime.replace(sessionInit, sharedAuthRuntime);
  html = html.replace(match[0], runtime);

  if (html.includes(staticImport)) throw new Error(`Static custom-domain Supabase import survived: ${path.relative(root, file)}`);
  if (!html.includes('authTokenWhenReady')) throw new Error(`Shared auth-token bridge missing from custom-domain runtime: ${path.relative(root, file)}`);
  if (!html.includes('window.EKODI_MARKETING_AUTH_TOKEN')) throw new Error(`Workspace auth-token bridge missing from custom-domain runtime: ${path.relative(root, file)}`);
  if (!html.includes('window.EKODI_MARKETING_AUTH_PENDING')) throw new Error(`Workspace auth-pending bridge missing from custom-domain runtime: ${path.relative(root, file)}`);
  fs.writeFileSync(file, html);
  patched += 1;
}

if (patched !== 4) throw new Error(`Expected 4 Marketing AI surfaces to receive runtime stability patch, patched ${patched}`);

const hub = fs.readFileSync(path.join(out, 'index.html'), 'utf8');
if (!hub.includes('needsAuthClient=Boolean')) throw new Error('Public hub anonymous auth fast path is missing');
if (!hub.includes("document.body.dataset.ekodiAuthState='anonymous'")) throw new Error('Public hub anonymous auth state is missing');
if (hub.includes(staticImport)) throw new Error('Public hub still eagerly imports Supabase for the custom-domain panel');

console.log('✅ Marketing AI runtime stability: anonymous visits skip auth/CDN work and custom-domain UI reuses the verified in-memory session');
