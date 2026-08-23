import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const output = path.join(root, 'dist', 'marketing-ai');
const pagesBase = 'https://jadam-maru.pages.dev/marketing-ai';
const targets = [
  { slug: '', ui: 'USER UI', ai: 'EKODI User AI', role: '개인 AI 비서' },
  { slug: 'jadam', ui: 'ADMIN UI', ai: 'EKODI Admin AI', role: '운영 AI 직원' },
  { slug: 'pizzamaru', ui: 'ADMIN UI', ai: 'EKODI Admin AI', role: '운영 AI 직원' },
  { slug: 'yogurtpurple', ui: 'ADMIN UI', ai: 'EKODI Admin AI', role: '운영 AI 직원' },
];

function read(file) {
  if (!fs.existsSync(file)) throw new Error(`Missing generated UI file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

for (const target of targets) {
  const dir = target.slug ? path.join(output, target.slug) : output;
  const html = read(path.join(dir, 'index.html'));
  const css = read(path.join(dir, 'official-ui.css'));
  const runtime = read(path.join(dir, 'official-ui.js'));
  const base = target.slug ? `${pagesBase}/${target.slug}` : pagesBase;
  const label = target.slug || 'hub';

  for (const marker of [
    `data-ekodi-ui-classification="${target.ui}"`,
    'data-ekodi-ui-governance="official"',
    'data-ekodi-ui-governance-runtime="official"',
    'data-ekodi-surface="public"',
    `${base}/official-ui.css`,
    `${base}/official-ui.js`,
  ]) {
    if (!html.includes(marker)) throw new Error(`${label}: missing official UI marker ${marker}`);
  }

  if (!runtime.includes(target.ai) || !runtime.includes(target.role)) {
    throw new Error(`${label}: AI role contract mismatch`);
  }
  if (!runtime.includes("setSurface?.('workspace')") || !runtime.includes("setSurface?.('public')")) {
    throw new Error(`${label}: Shell public/workspace transition contract missing`);
  }
  if (!css.includes('position:fixed!important') || !css.includes('safe-area-inset-top')) {
    throw new Error(`${label}: mobile fixed-header/safe-area rule missing`);
  }
  if (!css.includes('focus-visible')) throw new Error(`${label}: keyboard focus rule missing`);

  if (target.ui === 'ADMIN UI') {
    if (!html.includes('data-ekodi-admin-context')) throw new Error(`${label}: ADMIN UI context strip missing`);
    if (!runtime.includes('EKODI Admin AI')) throw new Error(`${label}: ADMIN AI runtime missing`);
    const siteCss = read(path.join(dir, 'site.css'));
    const shellBridge = read(path.join(dir, 'shell-style.js'));
    if (siteCss.length < 1000) throw new Error(`${label}: tenant visual stylesheet unexpectedly small`);
    if (!html.includes(`${base}/site.css`) || !html.includes(`${base}/shell-style.js`)) {
      throw new Error(`${label}: tenant visual assets are not on canonical production paths`);
    }
    if (!shellBridge.includes(`${base}/shell.css`)) throw new Error(`${label}: shell fallback asset route mismatch`);
  } else if (html.includes('data-ekodi-admin-context')) {
    throw new Error('hub: ADMIN UI context leaked into USER UI');
  }
}

console.log('✅ Official EKODI USER UI / ADMIN UI governance, AI roles, mobile behavior and production asset routing verified.');
