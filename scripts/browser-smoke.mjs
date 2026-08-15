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
const seed = `<script data-browser-smoke-seed>(()=>{try{const member=new URL(location.href).searchParams.get('seed')==='member';for(const key of ['ekodi-marketing-free-experience','ekodi-marketing-first-trial-complete']){if(member)localStorage.setItem(key,'1');else localStorage.removeItem(key)}window.__EKODI_SMOKE_TICKS=0;setInterval(()=>{document.documentElement.dataset.ekodiHeartbeat=String(++window.__EKODI_SMOKE_TICKS)},150)}catch{}})();</script>`;
html = html.replace('<head>', `<head>${seed}`);
fs.writeFileSync(smoke, html);

const mime = file => file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
const server = http.createServer((req, res) => {
  const requestUrl = new URL(req.url || '/', 'http://127.0.0.1');
  const pathname = decodeURIComponent(requestUrl.pathname === '/' ? '/__browser-smoke.html' : requestUrl.pathname);
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

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitForFile(file, timeoutMs = 6000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(file)) return;
    await sleep(60);
  }
  throw new Error(`Timed out waiting for ${file}`);
}

async function cdpClient(wsUrl) {
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('CDP WebSocket open timeout')), 4000);
    ws.addEventListener('open', () => { clearTimeout(timer); resolve(); }, { once: true });
    ws.addEventListener('error', () => { clearTimeout(timer); reject(new Error('CDP WebSocket failed to open')); }, { once: true });
  });
  let id = 0;
  const pending = new Map();
  ws.addEventListener('message', event => {
    let message;
    try { message = JSON.parse(String(event.data)); } catch { return; }
    if (!message.id || !pending.has(message.id)) return;
    const item = pending.get(message.id);
    pending.delete(message.id);
    clearTimeout(item.timer);
    if (message.error) item.reject(new Error(message.error.message || 'CDP error'));
    else item.resolve(message.result || {});
  });
  const send = (method, params = {}, timeoutMs = 3000) => new Promise((resolve, reject) => {
    const commandId = ++id;
    const timer = setTimeout(() => { pending.delete(commandId); reject(new Error(`CDP ${method} timed out after ${timeoutMs}ms`)); }, timeoutMs);
    pending.set(commandId, { resolve, reject, timer });
    ws.send(JSON.stringify({ id: commandId, method, params }));
  });
  return { ws, send };
}

async function evaluate(send) {
  const result = await send('Runtime.evaluate', {
    expression: `({heartbeat:Number(document.documentElement.dataset.ekodiHeartbeat||0),auth:document.body?.dataset.ekodiAuthState||'',hasGoogle:Boolean(document.querySelector('#googleCustomerAuth')),ready:document.readyState,bodyClass:document.body?.className||''})`,
    returnByValue: true,
  }, 1800);
  return result?.result?.value || {};
}

async function stopChrome(child, client) {
  try { await client?.send('Browser.close', {}, 800); } catch {}
  try { client?.ws.close(); } catch {}
  if (child.exitCode === null) child.kill('SIGTERM');
  await Promise.race([new Promise(resolve => child.once('close', resolve)), sleep(800)]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

async function runCase(name, query) {
  const profile = fs.mkdtempSync(path.join('/tmp', 'ekodi-marketing-chrome-'));
  const activePortFile = path.join(profile, 'DevToolsActivePort');
  const url = `http://127.0.0.1:${port}/__browser-smoke.html?${query}`;
  const args = ['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update','--disable-default-apps','--disable-extensions','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'];
  const child = spawn(chrome, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });
  let client = null;
  try {
    await waitForFile(activePortFile);
    const [debugPort] = fs.readFileSync(activePortFile, 'utf8').trim().split(/\r?\n/);
    const endpoint = `http://127.0.0.1:${debugPort}`;
    let targets = [];
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline && !targets.length) {
      targets = await fetch(`${endpoint}/json/list`).then(response => response.json()).catch(() => []);
      if (!targets.length) await sleep(80);
    }
    const target = targets.find(item => item.type === 'page') || targets[0];
    if (!target?.webSocketDebuggerUrl) throw new Error(`${name}: Chrome page target not available`);
    client = await cdpClient(target.webSocketDebuggerUrl);
    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Page.navigate', { url }, 2500);

    const probeDeadline = Date.now() + 8000;
    let last = {};
    let responsiveSamples = 0;
    let previousHeartbeat = 0;
    while (Date.now() < probeDeadline) {
      try {
        last = await evaluate(client.send);
        if (last.heartbeat > previousHeartbeat) responsiveSamples += 1;
        previousHeartbeat = Math.max(previousHeartbeat, Number(last.heartbeat || 0));
        if (last.heartbeat >= 3 && responsiveSamples >= 2 && last.auth === 'anonymous' && last.hasGoogle) {
          console.log(`✅ ${name}: renderer heartbeat=${last.heartbeat}, auth=${last.auth}, ready=${last.ready}`);
          return;
        }
      } catch (error) {
        if (/timed out/.test(error.message)) throw new Error(`${name}: renderer stopped answering CDP runtime probes. ${error.message}`);
      }
      await sleep(180);
    }
    throw new Error(`${name}: renderer never reached a stable heartbeat/auth state. Last=${JSON.stringify(last)}\n${stderr.slice(-1200)}`);
  } finally {
    await stopChrome(child, client);
    fs.rmSync(profile, { recursive: true, force: true });
  }
}

try {
  for (let i = 1; i <= 3; i += 1) await runCase(`fresh anonymous landing #${i}`, `seed=fresh&run=${i}`);
  for (let i = 1; i <= 2; i += 1) await runCase(`member-local-state landing #${i}`, `seed=member&run=${i}`);
} finally {
  server.close();
  fs.rmSync(smoke, { force: true });
}
