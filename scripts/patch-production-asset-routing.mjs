import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist', 'marketing-ai');
const pagesOrigin = 'https://jadam-maru.pages.dev';
const pagesBase = `${pagesOrigin}/marketing-ai`;
const sourceSha = String(process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || process.env.SOURCE_VERSION || 'local').trim();
const buildSha = sourceSha === 'local' ? 'local' : sourceSha.slice(0, 12);
const targets = [
  { slug: '', dir: output, ui: 'USER UI' },
  { slug: 'jadam', dir: path.join(output, 'jadam'), ui: 'ADMIN UI' },
  { slug: 'pizzamaru', dir: path.join(output, 'pizzamaru'), ui: 'ADMIN UI' },
  { slug: 'yogurtpurple', dir: path.join(output, 'yogurtpurple'), ui: 'ADMIN UI' },
];

function assetBase(slug) {
  return slug ? `${pagesBase}/${slug}` : pagesBase;
}

function ensureCspSource(html, directive, source) {
  return html.replace(/<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/i, tag =>
    tag.replace(/content="([^"]*)"/i, (_, csp) => {
      const parts = String(csp).split(';').map(part => part.trim()).filter(Boolean);
      const index = parts.findIndex(part => part === directive || part.startsWith(`${directive} `));
      if (index < 0) {
        parts.push(`${directive} 'self' ${source}`);
      } else {
        const tokens = parts[index].split(/\s+/);
        if (!tokens.includes(source)) parts[index] += ` ${source}`;
      }
      return `content="${parts.join('; ')}"`;
    })
  );
}

function stampBuild(html) {
  const marker = `<meta name="ekodi-build-sha" content="${buildSha}" data-ekodi-build-sha="${buildSha}">`;
  const clean = html.replace(/<meta\b[^>]*data-ekodi-build-sha=["'][^"']+["'][^>]*>/gi, '');
  return clean.replace('</head>', `${marker}</head>`);
}

function rewriteHtml(html, slug) {
  const base = assetBase(slug);
  let next = html;
  next = next.replace(/href=["']\/site\.css(\?[^"']*)?["']/g, (_, q = '') => `href="${base}/site.css${q}"`);
  next = next.replace(/src=["']\/shell-style\.js(\?[^"']*)?["']/g, (_, q = '') => `src="${base}/shell-style.js${q}"`);
  next = next.replace(/href=["']\/official-ui\.css(\?[^"']*)?["']/g, (_, q = '') => `href="${base}/official-ui.css${q}"`);
  next = next.replace(/src=["']\/official-ui\.js(\?[^"']*)?["']/g, (_, q = '') => `src="${base}/official-ui.js${q}"`);
  next = ensureCspSource(next, 'style-src', pagesOrigin);
  next = ensureCspSource(next, 'script-src', pagesOrigin);
  return stampBuild(next);
}

function rewriteShellBridge(file, slug) {
  if (!fs.existsSync(file)) return;
  const base = assetBase(slug);
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/(["'])\/shell\.css(\?[^"']*)?\1/g, (_, _quote, q = '') => JSON.stringify(`${base}/shell.css${q}`));
  fs.writeFileSync(file, after);
  if (!after.includes(`${base}/shell.css`)) throw new Error(`${slug}: shell.css production route missing`);
}

for (const target of targets) {
  const htmlFile = path.join(target.dir, 'index.html');
  if (!fs.existsSync(htmlFile)) throw new Error(`Production asset target missing: ${htmlFile}`);
  let html = fs.readFileSync(htmlFile, 'utf8');
  html = rewriteHtml(html, target.slug);
  fs.writeFileSync(htmlFile, html);

  if (!html.includes(`data-ekodi-ui-classification="${target.ui}"`)) {
    throw new Error(`${target.slug || 'hub'}: official ${target.ui} classification missing`);
  }
  if (!html.includes(`data-ekodi-build-sha="${buildSha}"`)) {
    throw new Error(`${target.slug || 'hub'}: build SHA marker missing`);
  }
  if (!html.includes(`${assetBase(target.slug)}/official-ui.css`)) {
    throw new Error(`${target.slug || 'hub'}: official UI stylesheet is not pinned to the production asset origin`);
  }
  if (!html.includes(`${assetBase(target.slug)}/official-ui.js`)) {
    throw new Error(`${target.slug || 'hub'}: official UI runtime is not pinned to the production asset origin`);
  }
  if (/href=["']\/(?:site|official-ui)\.css/.test(html) || /src=["']\/(?:shell-style|official-ui)\.js/.test(html)) {
    throw new Error(`${target.slug || 'hub'}: root-relative generated UI assets remain and can break host rewrites`);
  }
  if (!html.includes(pagesOrigin)) throw new Error(`${target.slug || 'hub'}: Pages production origin missing from CSP/assets`);

  if (target.slug) {
    if (!html.includes(`${assetBase(target.slug)}/site.css`)) throw new Error(`${target.slug}: tenant stylesheet production route missing`);
    if (!html.includes(`${assetBase(target.slug)}/shell-style.js`)) throw new Error(`${target.slug}: shell bridge production route missing`);
    rewriteShellBridge(path.join(target.dir, 'shell-style.js'), target.slug);
  }
}

console.log(`✅ Marketing AI generated UI assets pinned to canonical Cloudflare Pages paths with build marker ${buildSha}.`);
