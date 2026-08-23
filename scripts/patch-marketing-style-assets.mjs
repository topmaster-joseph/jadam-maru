import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const tenants = ['jadam', 'pizzamaru', 'yogurtpurple'];

const shellFallbackCss = `
:host{all:initial}
.wrap{--accent:#8ec8ff;--companion:#b5a2ff;--selector-bg:rgba(7,21,34,.94);--selector-border:#24425e;--selector-shadow:0 10px 30px rgba(0,0,0,.28);--public-rail:none;--rail-opacity:0;position:relative;font-family:Inter,"Noto Sans KR",system-ui,sans-serif;color:#f4f7fb}
.public-rail{position:fixed;z-index:2147482999;left:0;right:0;top:0;height:max(3px,env(safe-area-inset-top));min-height:3px;background:var(--public-rail);opacity:var(--rail-opacity);pointer-events:none}
.public-rail[hidden]{display:none}
.pill{display:flex;align-items:center;gap:8px;border:1px solid var(--selector-border);background:var(--selector-bg);backdrop-filter:blur(16px);box-shadow:var(--selector-shadow);border-radius:999px;padding:7px 9px 7px 11px;color:#f4f7fb;cursor:pointer;max-width:min(360px,calc(100vw - 24px));min-height:42px}
.pill:focus-visible,.action:focus-visible,.service:focus-visible,.footer a:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.dot{width:8px;height:8px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent) 16%,transparent);flex:0 0 auto}
.labels{min-width:0;text-align:left}
.space{display:block;font-size:12px;font-weight:850;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:250px}
.sub{display:flex;gap:6px;align-items:center;font-size:9px;color:#9fb1c3;margin-top:2px;white-space:nowrap}
.chev{font-size:10px;color:#9fb1c3}
.panel{position:absolute;right:0;top:calc(100% + 8px);width:min(326px,calc(100vw - 24px));max-height:min(72vh,560px);overflow:auto;background:#0b1d2e;border:1px solid color-mix(in srgb,var(--accent) 22%,#24425e);box-shadow:0 20px 56px rgba(0,0,0,.42);border-radius:16px;padding:10px;color:#f4f7fb}
.panel[hidden]{display:none}
.head{padding:6px 7px 10px;border-bottom:1px solid #18344d}
.head strong{display:block;font-size:13px}
.head small{display:block;color:#9fb1c3;font-size:9px;margin-top:3px}
.action{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;border:1px solid #23445f;background:#10263a;border-radius:11px;padding:10px;margin-top:9px;text-align:left;cursor:pointer;color:#f4f7fb;font-size:10px;font-weight:800}
.services{display:grid;gap:3px;margin-top:8px}
.service{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;border:0;background:transparent;border-radius:10px;padding:9px;cursor:pointer;text-align:left;color:#eaf0f6}
.service:hover{background:#10263a}
.service b{font-size:10px}
.service small{font-size:8px;color:#91a6ba}
.current{background:#10263a;box-shadow:inset 2px 0 0 var(--accent)}
.footer{display:flex;gap:6px;margin-top:8px;padding-top:8px;border-top:1px solid #18344d}
.footer a{flex:1;text-decoration:none;color:#dce7f0;background:#10263a;border-radius:9px;padding:8px;text-align:center;font-size:9px;font-weight:800}
@media(max-width:560px){.pill{max-width:230px}.panel{width:min(304px,calc(100vw - 20px))}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important;animation:none!important}}
`.trim();

function shortHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
}

function ensureCspSource(html, directive, source) {
  return html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i, tag =>
    tag.replace(/content="([^"]*)"/i, (_, csp) => {
      const parts = String(csp).split(';').map(part => part.trim()).filter(Boolean);
      const index = parts.findIndex(part => part === directive || part.startsWith(`${directive} `));
      if (index < 0) {
        parts.push(`${directive} ${source}`);
      } else {
        const tokens = parts[index].split(/\s+/);
        if (!tokens.includes(source)) parts[index] += ` ${source}`;
      }
      return `content="${parts.join('; ')}"`;
    })
  );
}

function shellStyleBridge(cssHref) {
  return `(()=>{\n'use strict';\nconst href=${JSON.stringify(cssHref)};\nlet observer=null;\nfunction attach(){\n  const host=document.querySelector('[data-ekodi-shell-root]');\n  const shadow=host&&host.shadowRoot;\n  if(!shadow)return false;\n  if(shadow.querySelector('link[data-ekodi-shell-external-style]'))return true;\n  const link=document.createElement('link');\n  link.rel='stylesheet';\n  link.href=href;\n  link.dataset.ekodiShellExternalStyle='tenant';\n  shadow.prepend(link);\n  return true;\n}\nif(!attach()){\n  observer=new MutationObserver(()=>{if(attach()&&observer){observer.disconnect();observer=null;}});\n  observer.observe(document.documentElement,{childList:true,subtree:true});\n  window.addEventListener('load',attach,{once:true});\n  setTimeout(()=>{if(observer){observer.disconnect();observer=null;}attach();},15000);\n}\n})();\n`;
}

for (const tenant of tenants) {
  const dir = path.join(root, 'dist', 'marketing-ai', tenant);
  const htmlFile = path.join(dir, 'index.html');
  const cssFile = path.join(dir, 'site.css');
  const shellCssFile = path.join(dir, 'shell.css');
  const shellBridgeFile = path.join(dir, 'shell-style.js');

  if (!fs.existsSync(htmlFile)) throw new Error(`${tenant}: generated workspace missing`);

  let html = fs.readFileSync(htmlFile, 'utf8');
  const cssBlocks = [];

  html = html.replace(/<style(?:\s[^>]*)?>([\s\S]*?)<\/style>/gi, (_, css) => {
    const clean = String(css || '').trim();
    if (clean) cssBlocks.push(clean);
    return '';
  });

  if (!cssBlocks.length) throw new Error(`${tenant}: no generated style blocks found`);

  const css = [
    '/* Generated by scripts/patch-marketing-style-assets.mjs. Do not edit dist output directly. */',
    'html{background:#f4f6f8}',
    ...cssBlocks,
    ''
  ].join('\n\n');
  const siteHash = shortHash(css);
  const shellHash = shortHash(shellFallbackCss);
  const shellCssHref = `/shell.css?v=${shellHash}`;
  const bridge = shellStyleBridge(shellCssHref);
  const bridgeHash = shortHash(bridge);

  html = html.replace(/<link\b[^>]*data-ekodi-style-asset=["']tenant["'][^>]*>/gi, '');
  html = html.replace(/<script\b[^>]*data-ekodi-shell-style-fallback=["']tenant["'][^>]*><\/script>/gi, '');
  html = ensureCspSource(html, 'style-src', "'self'");
  html = ensureCspSource(html, 'script-src', "'self'");
  html = html.replace(
    '</head>',
    `<link rel="stylesheet" href="/site.css?v=${siteHash}" data-ekodi-style-asset="tenant"><script defer src="/shell-style.js?v=${bridgeHash}" data-ekodi-shell-style-fallback="tenant"></script></head>`
  );

  if (/<style(?:\s|>)/i.test(html)) throw new Error(`${tenant}: inline style block remained after extraction`);
  if (!html.includes('data-ekodi-style-asset="tenant"') || !html.includes('/site.css?v=')) {
    throw new Error(`${tenant}: self-hosted stylesheet link missing`);
  }
  if (!html.includes('data-ekodi-shell-style-fallback="tenant"') || !html.includes('/shell-style.js?v=')) {
    throw new Error(`${tenant}: external shell style fallback missing`);
  }

  fs.writeFileSync(cssFile, css);
  fs.writeFileSync(shellCssFile, `${shellFallbackCss}\n`);
  fs.writeFileSync(shellBridgeFile, bridge);
  fs.writeFileSync(htmlFile, html);

  if (!fs.existsSync(cssFile) || fs.statSync(cssFile).size < 1000) {
    throw new Error(`${tenant}: extracted stylesheet is unexpectedly small`);
  }
  if (!fs.existsSync(shellCssFile) || fs.statSync(shellCssFile).size < 1000) {
    throw new Error(`${tenant}: shell fallback stylesheet is unexpectedly small`);
  }
  if (!fs.existsSync(shellBridgeFile) || fs.statSync(shellBridgeFile).size < 400) {
    throw new Error(`${tenant}: shell style bridge is unexpectedly small`);
  }
}

console.log('✅ Marketing AI tenant and shared-shell styling externalized to CSP-safe self-hosted assets.');
