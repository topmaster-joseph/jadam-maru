import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const webRoot = path.join(root, 'dist', 'marketing-ai');
const source = path.join(webRoot, 'index.html');
const smoke = path.join(webRoot, '__browser-smoke.html');

if (!fs.existsSync(source)) throw new Error('Build Marketing AI before running browser smoke test');

const candidates = [process.env.CHROME_BIN,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean);
const chrome = candidates.find(candidate => fs.existsSync(candidate));
if (!chrome) throw new Error(`Chromium/Chrome not found. Checked: ${candidates.join(', ')}`);

let html = fs.readFileSync(source, 'utf8');
const seed = `<script data-browser-smoke-seed>(()=>{try{const member=new URL(location.href).searchParams.get('seed')==='member';for(const key of ['ekodi-marketing-free-experience','ekodi-marketing-first-trial-complete']){if(member)localStorage.setItem(key,'1');else localStorage.removeItem(key)}}catch{}})();</script>`;
const heartbeat = `<script data-browser-smoke-heartbeat>addEventListener('load',()=>setTimeout(()=>{document.documentElement.dataset.ekodiHeartbeat='ok'},650),{once:true});</script>`;
html = html.replace('<head>', `<head>${seed}`);
html = html.replace('</body>', `${heartbeat}</body>`);
fs.writeFileSync(smoke, html);

const mime = file => file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const pathname = decodeURIComponent(url.pathname === '/' ? '/__browser-smoke.html' : url.pathname);
  const target = path.normalize(path.join(webRoot, pathname));
  if (!target.startsWith(webRoot) || !fs.existsSync(target) || fs.statSync(target).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  res.writeHead(200, { 'content-type': mime(target), 'cache-control': 'no-store' });
  res.end(fs.readFileSync(target));
});

await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
const address = server.address();
const port = typeof address === 'object' && address ? address.port : 0;
if (!port) throw new Error('Browser smoke server failed to bind a port');

async function runCase(name, query) {
  const profile = fs.mkdtempSync(path.join('/tmp', 'ekodi-marketing-chrome-'));
  const url = `http://127.0.0.1:${port}/__browser-smoke.html?${query}`;
  const args = ['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-default-apps','--disable-extensions','--no-first-run',`--user-data-dir=${profile}`,'--virtual-time-budget=3500','--dump-dom',url];
  const child = spawn(chrome, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk.toString(); });
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });
  const exit = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`${name}: Chromium did not return within 12 seconds. Possible renderer/main-thread stall.\n${stderr.slice(-1800)}`)); }, 12000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.once('close', code => { clearTimeout(timer); resolve(code); });
  }).finally(() => fs.rmSync(profile, { recursive: true, force: true }));

  if (exit !== 0) throw new Error(`${name}: Chromium exited ${exit}.\n${stderr.slice(-1800)}`);
  if (!stdout.includes('data-ekodi-heartbeat="ok"')) throw new Error(`${name}: event-loop heartbeat never ran`);
  if (!stdout.includes('data-ekodi-auth-state="anonymous"')) throw new Error(`${name}: anonymous fast path did not settle`);
  if (!stdout.includes('id="googleCustomerAuth"')) throw new Error(`${name}: Google entry disappeared`);
  console.log(`✅ ${name}: Chromium remained responsive and anonymous auth settled`);
}

try {
  await runCase('fresh anonymous landing', 'seed=fresh');
  await runCase('member-local-state landing', 'seed=member');
} finally {
  server.close();
  fs.rmSync(smoke, { force: true });
}
