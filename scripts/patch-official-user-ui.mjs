import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist', 'marketing-ai');
const targets = [
  { dir: output, ui: 'user', label: 'USER UI', ai: 'EKODI User AI', role: '개인 AI 비서' },
  ...['jadam', 'pizzamaru', 'yogurtpurple'].map(slug => ({
    dir: path.join(output, slug),
    ui: 'admin',
    label: 'ADMIN UI',
    ai: 'EKODI Admin AI',
    role: '운영 AI 직원',
  })),
];
const shellWorkspaceStyle = 'https://shell.ekodi.kr/workspace.css';

const css = `
/* EKODI official USER UI / ADMIN UI governance layer.
   USER UI and ADMIN UI share EKODI Core design tokens, but keep role, information density and AI responsibility separate. */
body.ekodi-authenticated-user,
body.ekodi-authenticated-admin{
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
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) .top{
  background:color-mix(in srgb,var(--ekodi-ui-bg,#071522) 94%,transparent)!important;
  border-bottom-color:var(--ekodi-ui-border,#24425e)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(.tenant-hero-copy,.tenant-hero aside,.pilot-brief,.pilot-panel,.card,.menu,.trial-lab,.trial-strip,.member-workspace,.pricing,.pricing-card,.workspace-card,.workspace-panel,.auth-dialog){
  background:var(--ekodi-ui-surface,#0b1d2e)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  border-color:var(--ekodi-ui-border,#24425e)!important;
  box-shadow:none!important;
}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(.pilot-step,.pilot-goal,.pilot-kpis span,.pilot-plan article,.trial-result,.auth-account-card){
  background:var(--ekodi-ui-surface-raised,#10263a)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  border-color:var(--ekodi-ui-border,#24425e)!important;
}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(p,small,.pilot-head p,.pilot-step small,.pilot-goal small,.trial-disclosure,.auth-copy,.empty){
  color:var(--ekodi-ui-muted,#9fb1c3)!important;
}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(h1,h2,h3,strong,b,.product){color:var(--ekodi-ui-text,#f4f7fb)}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(input,select,textarea){
  background:var(--ekodi-ui-surface,#0b1d2e)!important;
  color:var(--ekodi-ui-text,#f4f7fb)!important;
  border-color:var(--ekodi-ui-border,#24425e)!important;
}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(.pilot-table-wrap,.marketing-table-wrap){border-color:var(--ekodi-ui-border,#24425e)!important}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(.pilot-table th,th){background:var(--ekodi-ui-surface-raised,#10263a)!important;color:var(--ekodi-ui-muted,#9fb1c3)!important}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(.pilot-table td,td){border-color:var(--ekodi-ui-border,#24425e)!important;color:var(--ekodi-ui-text,#f4f7fb)}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) :where(a,button,input,select,textarea):focus-visible{outline:2px solid var(--ekodi-ui-accent,#8ec8ff)!important;outline-offset:2px}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) .pilot-note{background:#10263a!important;color:#d9c17c!important;border:1px solid var(--ekodi-ui-border,#24425e)}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) .tenant-hero-copy{background:var(--ekodi-ui-surface,#0b1d2e)!important}
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin).tenant-jadam .jadam-ops-card,
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin).tenant-pizzamaru .pizza-combo-board,
body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin).tenant-yogurtpurple .yogurt-visual-board{
  border-color:color-mix(in srgb,var(--tenant-accent,#8ec8ff) 44%,var(--ekodi-ui-border,#24425e))!important;
}
.ekodi-admin-context{display:none}
body.ekodi-authenticated-admin .ekodi-admin-context{
  display:flex;
  align-items:center;
  gap:9px;
  flex-wrap:wrap;
  margin:0 0 12px;
  padding:9px 11px;
  border:1px solid var(--ekodi-ui-border,#24425e);
  border-radius:12px;
  background:color-mix(in srgb,var(--ekodi-ui-surface,#0b1d2e) 92%,transparent);
  color:var(--ekodi-ui-text,#f4f7fb);
}
body.ekodi-authenticated-admin .ekodi-admin-context span{
  padding:4px 7px;
  border-radius:999px;
  background:var(--ekodi-ui-surface-raised,#10263a);
  color:var(--ekodi-ui-accent,#8ec8ff)!important;
  font-size:9px;
  font-weight:950;
  letter-spacing:.08em;
}
body.ekodi-authenticated-admin .ekodi-admin-context strong{font-size:11px}
body.ekodi-authenticated-admin .ekodi-admin-context small{margin-left:auto;font-size:9px;color:var(--ekodi-ui-muted,#9fb1c3)!important}
body.ekodi-authenticated-admin .pilot-wrap{gap:10px}
body.ekodi-authenticated-admin .pilot-panel{padding:17px}
body.ekodi-authenticated-admin .pilot-head{margin-bottom:10px}
@media(max-width:768px){
  body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin){scroll-padding-top:calc(56px + env(safe-area-inset-top))}
  body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) .top{position:fixed!important;top:0!important;left:0!important;right:0!important;width:100%!important;z-index:2147482000!important}
  body.ekodi-authenticated-admin .ekodi-admin-context small{width:100%;margin-left:0}
}
@media(prefers-reduced-motion:reduce){body:is(.ekodi-authenticated-user,.ekodi-authenticated-admin) *{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`;

function runtimeFor(target) {
  return `(()=>{
'use strict';
const UI=${JSON.stringify(target.ui)};
const LABEL=${JSON.stringify(target.label)};
const AI=${JSON.stringify(target.ai)};
const ROLE=${JSON.stringify(target.role)};
const ACTIVE_CLASS=UI==='admin'?'ekodi-authenticated-admin':'ekodi-authenticated-user';
const OTHER_CLASS=UI==='admin'?'ekodi-authenticated-user':'ekodi-authenticated-admin';
const WORKSPACE_STYLE=${JSON.stringify(shellWorkspaceStyle)};
const auth=document.querySelector('#googleCustomerAuth');
let scheduled=false;
function member(){
  const body=document.body;
  return !!(body&&(body.classList.contains('member-session-mode')||body.classList.contains('free-member-mode')||body.classList.contains('paid-member-mode')||/✓|이용중/.test(auth?.textContent||'')));
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
  const body=document.body;
  body?.classList.remove(OTHER_CLASS);
  body?.classList.toggle(ACTIVE_CLASS,active);
  if(body){
    body.dataset.ekodiUiClassification=LABEL;
    body.dataset.ekodiAi=AI;
    body.dataset.ekodiAiRole=ROLE;
  }
  document.documentElement.dataset.ekodiUiClassification=LABEL;
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
}

for (const target of targets) {
  const htmlFile = path.join(target.dir, 'index.html');
  if (!fs.existsSync(htmlFile)) throw new Error(`Official UI target missing: ${htmlFile}`);
  fs.writeFileSync(path.join(target.dir, 'official-ui.css'), css);
  fs.writeFileSync(path.join(target.dir, 'official-ui.js'), runtimeFor(target));

  let html = fs.readFileSync(htmlFile, 'utf8');
  html = html.replace(/<meta\b[^>]*data-ekodi-ui-classification=["'][^"']+["'][^>]*>/gi, '');
  html = html.replace(/<link\b[^>]*data-ekodi-user-ui=["']official["'][^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*data-ekodi-user-ui-runtime=["']official["'][^>]*><\/script>/gi, '');
  html = html.replace(/<link\b[^>]*data-ekodi-ui-governance=["']official["'][^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*data-ekodi-ui-governance-runtime=["']official["'][^>]*><\/script>/gi, '');
  html = html.replace(/<section class="ekodi-admin-context"[\s\S]*?<\/section>/gi, '');

  const meta = `<meta name="ekodi-ui-classification" content="${target.label}" data-ekodi-ui-classification="${target.label}">`;
  html = html.replace('</head>', `${meta}<link rel="stylesheet" href="/official-ui.css" data-ekodi-ui-governance="official"></head>`);
  if (target.ui === 'admin') {
    const context = '<section class="ekodi-admin-context" data-ekodi-admin-context aria-label="EKODI 관리자 UI"><span>ADMIN UI</span><strong>EKODI Admin AI · 운영 AI 직원</strong><small>운영 상태 · 승인 · 처리 · 분석</small></section>';
    html = html.replace('<main>', `<main>${context}`);
  }
  html = html.replace('</body>', `<script defer src="/official-ui.js" data-ekodi-ui-governance-runtime="official" data-ekodi-ui-class="${target.ui}"></script></body>`);
  fs.writeFileSync(htmlFile, html);

  for (const marker of [`data-ekodi-ui-classification="${target.label}"`,'data-ekodi-ui-governance="official"','data-ekodi-ui-governance-runtime="official"','data-ekodi-surface="public"']) {
    if (!html.includes(marker)) throw new Error(`Official UI contract missing ${marker}: ${htmlFile}`);
  }
  if (target.ui === 'admin' && !html.includes('data-ekodi-admin-context')) throw new Error(`ADMIN UI context missing: ${htmlFile}`);
}

console.log('✅ EKODI official UI governance applied: USER UI for member entry, ADMIN UI for store operation workspaces, shared through EKODI Core.');
