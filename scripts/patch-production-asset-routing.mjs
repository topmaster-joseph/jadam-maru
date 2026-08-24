import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist', 'marketing-ai');
const sourceSha = String(process.env.SOURCE_VERSION || process.env.CF_PAGES_COMMIT_SHA || process.env.GITHUB_SHA || 'local').trim();
const buildSha = sourceSha === 'local' ? 'local' : sourceSha.slice(0, 12);
const targets = [
  { slug: '', dir: output, ui: 'USER UI' },
  { slug: 'jadam', dir: path.join(output, 'jadam'), ui: 'ADMIN UI' },
  { slug: 'pizzamaru', dir: path.join(output, 'pizzamaru'), ui: 'ADMIN UI' },
  { slug: 'yogurtpurple', dir: path.join(output, 'yogurtpurple'), ui: 'ADMIN UI' },
];

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

function stampBuild(html) {
  const buildMarker = `<meta name="ekodi-build-sha" content="${buildSha}" data-ekodi-build-sha="${buildSha}">`;
  const routingMarker = '<meta name="ekodi-asset-routing" content="same-origin" data-ekodi-asset-routing="same-origin">';
  let clean = html.replace(/<meta\b[^>]*data-ekodi-build-sha=["'][^"']+["'][^>]*>/gi, '');
  clean = clean.replace(/<meta\b[^>]*data-ekodi-asset-routing=["'][^"']+["'][^>]*>/gi, '');
  return clean.replace('</head>', `${buildMarker}${routingMarker}</head>`);
}

function versionOfficialAssets(html) {
  let next = html;
  next = next.replace(/href=["']\/official-ui\.css(?:\?[^"']*)?["']/g, `href="/official-ui.css?v=${buildSha}"`);
  next = next.replace(/src=["']\/official-ui\.js(?:\?[^"']*)?["']/g, `src="/official-ui.js?v=${buildSha}"`);
  return next;
}

for (const target of targets) {
  const htmlFile = path.join(target.dir, 'index.html');
  if (!fs.existsSync(htmlFile)) throw new Error(`Production asset target missing: ${htmlFile}`);

  let html = fs.readFileSync(htmlFile, 'utf8');
  html = ensureCspSource(html, 'style-src', "'self'");
  html = ensureCspSource(html, 'script-src', "'self'");
  html = versionOfficialAssets(html);
  html = stampBuild(html);
  fs.writeFileSync(htmlFile, html);

  const label = target.slug || 'hub';
  if (!html.includes(`data-ekodi-ui-classification="${target.ui}"`)) {
    throw new Error(`${label}: official ${target.ui} classification missing`);
  }
  if (!html.includes(`data-ekodi-build-sha="${buildSha}"`)) {
    throw new Error(`${label}: build SHA marker missing`);
  }
  if (!html.includes('data-ekodi-asset-routing="same-origin"')) {
    throw new Error(`${label}: same-origin asset routing marker missing`);
  }
  if (!html.includes(`/official-ui.css?v=${buildSha}`) || !html.includes(`/official-ui.js?v=${buildSha}`)) {
    throw new Error(`${label}: official UI assets are not versioned same-origin resources`);
  }
  if (/https:\/\/jadam-maru\.pages\.dev\/marketing-ai[^"']*\/(?:site|official-ui|shell)\.(?:css|js)/i.test(html)) {
    throw new Error(`${label}: obsolete jadam-maru.pages.dev asset route survived`);
  }

  if (target.slug) {
    if (!/href=["']\/site\.css\?v=[^"']+["']/.test(html)) {
      throw new Error(`${label}: tenant stylesheet is not same-origin/versioned`);
    }
    if (!/src=["']\/shell-style\.js\?v=[^"']+["']/.test(html)) {
      throw new Error(`${label}: shell bridge is not same-origin/versioned`);
    }
    const shellBridgeFile = path.join(target.dir, 'shell-style.js');
    const shellBridge = fs.readFileSync(shellBridgeFile, 'utf8');
    if (!/\/shell\.css\?v=/.test(shellBridge)) {
      throw new Error(`${label}: shell fallback stylesheet is not same-origin/versioned`);
    }
  }
}

console.log(`✅ Marketing AI generated assets stay on each deployed Pages project/custom domain with same-origin routing and build marker ${buildSha}.`);
