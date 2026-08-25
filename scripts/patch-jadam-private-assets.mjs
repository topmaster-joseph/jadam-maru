import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const dir = path.join(root, 'dist', 'marketing-ai', 'jadam');
const htmlFile = path.join(dir, 'index.html');
if (!fs.existsSync(htmlFile)) throw new Error('Jadam generated workspace is missing');

const hash = value => crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 12);
let html = fs.readFileSync(htmlFile, 'utf8');

function takeStyle(marker) {
  const re = new RegExp(`<style\\s+${marker}>\\s*([\\s\\S]*?)<\\/style>`, 'i');
  const match = html.match(re);
  if (!match) throw new Error(`Missing Jadam inline style: ${marker}`);
  html = html.replace(re, '');
  return String(match[1] || '').trim();
}

function takeScript(marker) {
  const re = new RegExp(`<script\\s+${marker}>\\s*([\\s\\S]*?)<\\/script>`, 'i');
  const match = html.match(re);
  if (!match) throw new Error(`Missing Jadam inline script: ${marker}`);
  html = html.replace(re, '');
  return String(match[1] || '').trim();
}

const privateCss = takeStyle('data-jadam-private-style');
const entryCss = takeStyle('data-jadam-domain-entry-style');
const privateRuntime = takeScript('data-jadam-private-runtime');
const domainBootstrap = takeScript('data-jadam-domain-role-bootstrap');
const domainRuntime = takeScript('data-jadam-domain-entry-runtime');

const css = `/* Jadam private workspace + domain-role styles. Generated at build time. */\n${privateCss}\n\n${entryCss}\n`;
const privateJs = `/* Jadam approved-account runtime. Generated at build time. */\n${privateRuntime}\n`;
const domainBootstrapJs = `/* Jadam hostname role bootstrap. Must execute before body paint. */\n${domainBootstrap}\n`;
const domainRuntimeJs = `/* Jadam legacy-entry runtime. */\n${domainRuntime}\n`;

const cssName = 'jadam-private.css';
const privateName = 'jadam-private.js';
const bootstrapName = 'jadam-domain-bootstrap.js';
const domainName = 'jadam-domain-entry.js';
fs.writeFileSync(path.join(dir, cssName), css);
fs.writeFileSync(path.join(dir, privateName), privateJs);
fs.writeFileSync(path.join(dir, bootstrapName), domainBootstrapJs);
fs.writeFileSync(path.join(dir, domainName), domainRuntimeJs);

html = html.replace(/<link\b[^>]*data-jadam-private-assets=["']style["'][^>]*>/gi, '');
html = html.replace(/<script\b[^>]*data-jadam-private-assets=["']bootstrap["'][^>]*><\/script>/gi, '');
html = html.replace(/<script\b[^>]*data-jadam-private-assets=["']runtime["'][^>]*><\/script>/gi, '');
html = html.replace(/<script\b[^>]*data-jadam-private-assets=["']entry["'][^>]*><\/script>/gi, '');

const headAssets = `<link rel="stylesheet" href="/${cssName}?v=${hash(css)}" data-jadam-private-assets="style"><script src="/${bootstrapName}?v=${hash(domainBootstrapJs)}" data-jadam-private-assets="bootstrap"></script>`;
html = html.replace('</head>', `${headAssets}</head>`);
const bodyAssets = `<script src="/${privateName}?v=${hash(privateJs)}" data-jadam-private-assets="runtime"></script><script src="/${domainName}?v=${hash(domainRuntimeJs)}" data-jadam-private-assets="entry"></script>`;
html = html.replace('</body>', `${bodyAssets}</body>`);

for (const required of [
  'data-jadam-private-assets="style"',
  'data-jadam-private-assets="bootstrap"',
  'data-jadam-private-assets="runtime"',
  'data-jadam-private-assets="entry"',
  '/jadam-private.css?v=',
  '/jadam-private.js?v=',
  '/jadam-domain-bootstrap.js?v=',
  '/jadam-domain-entry.js?v=',
  'data-jadam-service-entry',
  'data-jadam-access-gate',
  'data-jadam-private-workspace',
]) if (!html.includes(required)) throw new Error(`Jadam external asset contract missing: ${required}`);

for (const forbidden of [
  '<style data-jadam-private-style>',
  '<style data-jadam-domain-entry-style>',
  '<script data-jadam-private-runtime>',
  '<script data-jadam-domain-role-bootstrap>',
  '<script data-jadam-domain-entry-runtime>',
]) if (html.includes(forbidden)) throw new Error(`Jadam CSP-unsafe inline asset remained: ${forbidden}`);

for (const asset of [cssName, privateName, bootstrapName, domainName]) {
  const target = path.join(dir, asset);
  if (!fs.existsSync(target) || fs.statSync(target).size < 100) throw new Error(`Jadam private asset missing/small: ${asset}`);
}

fs.writeFileSync(htmlFile, html);
console.log('✅ Jadam private workspace assets externalized for strict self-only CSP');
