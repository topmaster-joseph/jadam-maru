import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist', 'marketing-ai');
const targets = [output, ...['jadam','pizzamaru','yogurtpurple'].map(slug => path.join(output, slug))];
const shellWorkspaceStyle = 'https://shell.ekodi.kr/workspace.css';

const css = `
/* EKODI USER UI official authenticated-workspace layer.
   Public landing remains service-specific; only authenticated work surfaces use Core UI. */
body.ekodi-authenticated-user{
  --bg:var(--ekodi-ui-bg,#071522);
  --panel:var(--ekodi-ui-surface,#0b1d2e);
  --soft:var(--ekodi-ui-surface-raised,#10263a);
  --line:var(--ekodi-ui-border,#24425e);
  --ink:var(--ekodi-ui-text,#f4f7fb);
  --muted:var(--ekodi-ui-muted,#9fb1c3);
  background:var(--ekodi-ui-bg,#071522)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  color-scheme:dark;
}
body.ekodi-authenticated-user .top{
  background:color-mix(in srgb,var(--ekodi-ui-bg,#071522) 94%,transparent)!important;
  border-bottom-color:var(--ekodi-ui-border,#24425e)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
}
body.ekodi-authenticated-user :where(.tenant-hero-copy,.tenant-hero aside,.pilot-brief,.pilot-panel,.card,.menu,.trial-lab,.trial-strip,.member-workspace,.pricing,.pricing-card,.workspace-card,.workspace-panel,.auth-dialog){
  background:var(--ekodi-ui-surface,#0b1d2e)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  border-color:var(--ekodi-ui-border,#24425e)!important;
  box-shadow:none!important;
}
body.ekodi-authenticated-user :where(.pilot-step,.pilot-goal,.pilot-kpis span,.pilot-plan article,.trial-result,.auth-account-card){
  background:var(--ekodi-ui-surface-raised,#10263a)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  border-color:var(--ekodi-ui-border,#24425e)!important;
}
body.ekodi-authenticated-user :where(p,small,.pilot-head p,.pilot-step small,.pilot-goal small,.trial-disclosure,.auth-copy,.empty){
  color:var(--ekodi-ui-muted,#9fb1c3)!important;
}
body.ekodi-authenticated-user :where(h1,h2,h3,strong,b,.product){color:var(--ekodi-ui-text,#f4f7fb)}
body.ekodi-authenticated-user :where(input,select,textarea){
  background:var(--ekodi-ui-surface,#0b1d2e)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  border-color:var(--ekodi-ui-border,#24425e)!important;
}
body.ekodi-authenticated-user :where(.pilot-table-wrap,.marketing-table-wrap){border-color:var(--ekodi-ui-border,#24425e)!important}
body.ekodi-authenticated-user :where(.pilot-table th,th){background:var(--ekodi-ui-surface-raised,#10263a)!important;color:var(--ekodi-ui-muted,#9fb1c3)!important}
body.ekodi-authenticated-user :where(.pilot-table td,td){border-color:var(--ekodi-ui-border,#24425e)!important;color:var(--ekodi-ui-text,#f4f7fb)}
body.ekodi-authenticated-user :where(a,button,input,select,textarea):focus-visible{outline:2px solid var(--ekodi-ui-accent,#8ec8ff)!important;outline-offset:2px}
body.ekodi-authenticated-user .powered{color:var(--ekodi-ui-muted,#9fb1c3)}
body.ekodi-authenticated-user .pilot-note{background:#10263a!important;color:#d9c17c!important;border:1px solid var(--ekodi-ui-border,#24425e)}
body.ekodi-authenticated-user .tenant-hero-copy{background:var(--ekodi-ui-surface,#0b1d2e)!important}
body.ekodi-authenticated-user.tenant-jadam .jadam-ops-card,
body.ekodi-authenticated-user.tenant-pizzamaru .pizza-combo-board,
body.ekodi-authenticated-user.tenant-yogurtpurple .yogurt-visual-board{
  border-color:color-mix(in srgb,var(--tenant-accent,#8ec8ff) 44%,var(--ekodi-ui-border,#24425e))!important;
}
@media(max-width:768px){
  body.ekodi-authenticated-user{scroll-padding-top:calc(56px + env(safe-area-inset-top))}
  body.ekodi-authenticated-user .top{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:2147482000!important}
}
@media(prefers-reduced-motion:reduce){body.ekodi-authenticated-user *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;

const runtime = `(()=>{
'use strict';
const AUTH_CLASS='ekodi-authenticated-user';
const WORKSPACE_STYLE=${JSON.stringify(shellWorkspaceStyle)};
const auth=document.querySelector('#googleCustomerAuth');
let scheduled=false;
function member(){
  const body=document.body;
  let local=false;
  try{local=localStorage.getItem('ekodi-marketing-free-experience')==='1';}catch{}
  return !!(body&&(body.classList.contains('member-session-mode')||body.classList.contains('free-member-mode')||body.classList.contains('paid-member-mode')||local||/✓|이용중/.test(auth?.textContent||'')));
}
function ensureWorkspaceStyle(){
  if(document.querySelector('link[data-ekodi-workspace-style]'))return;
  const link=document.createElement('link');
  link.rel='stylesheet';link.href=WORKSPACE_STYLE;link.dataset.ekodiWorkspaceStyle='official';
  document.head.appendChild(link);
}
function apply(){
  scheduled=false;
  const active=member();
  document.body?.classList.toggle(AUTH_CLASS,active);
  if(active){
    ensureWorkspaceStyle();
    document.documentElement.dataset.ekodiShellSurface='workspace';
    window.EKODIShell?.setSurface?.('workspace');
  }else{
    document.documentElement.dataset.ekodiShellSurface='public';
    window.EKODIShell?.setSurface?.('public');
  }
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
apply();
if(auth)new MutationObserver(schedule).observe(auth,{childList:true,subtree:true,characterData:true});
if(document.body)new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
window.addEventListener('storage',schedule);
window.addEventListener('ekodi:shell-theme',()=>{if(member()&&window.EKODIShell?.getTheme?.().surface!=='workspace')window.EKODIShell.setSurface('workspace')});
setTimeout(apply,0);setTimeout(apply,300);setTimeout(apply,1200);
})();
`;

for (const dir of targets) {
  const htmlFile = path.join(dir, 'index.html');
  if (!fs.existsSync(htmlFile)) throw new Error(`Official USER UI target missing: ${htmlFile}`);
  fs.writeFileSync(path.join(dir, 'official-user-ui.css'), css);
  fs.writeFileSync(path.join(dir, 'official-user-ui.js'), runtime);

  let html = fs.readFileSync(htmlFile, 'utf8');
  html = html.replace(/<link\b[^>]*data-ekodi-user-ui=["']official["'][^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*data-ekodi-user-ui-runtime=["']official["'][^>]*><\/script>/gi, '');
  html = html.replace('</head>', '<link rel="stylesheet" href="/official-user-ui.css" data-ekodi-user-ui="official"></head>');
  html = html.replace('</body>', '<script defer src="/official-user-ui.js" data-ekodi-user-ui-runtime="official"></script></body>');
  fs.writeFileSync(htmlFile, html);

  for (const marker of ['data-ekodi-user-ui="official"','data-ekodi-user-ui-runtime="official"','data-ekodi-surface="public"']) {
    if (!html.includes(marker)) throw new Error(`USER UI contract missing ${marker}: ${htmlFile}`);
  }
}

console.log('✅ EKODI official USER UI applied: service-specific public face → stable dark workspace after authentication.');
