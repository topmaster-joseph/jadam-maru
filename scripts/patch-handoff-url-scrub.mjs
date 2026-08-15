import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const memoryKey = '__EKODI_HANDOFF_HASH';

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

const scrub = `<script data-ekodi-handoff-scrub>(()=>{try{const raw=location.hash||'';if(!raw.includes('ekodi_token='))return;Object.defineProperty(window,'${memoryKey}',{value:raw,writable:true,configurable:true});history.replaceState({},document.title,location.pathname+location.search)}catch(error){console.error('EKODI handoff URL scrub failed',error)}})();</script>`;
const oldReader = "const hash=new URLSearchParams(location.hash.replace(/^#/,''));";
const privateReader = `const rawHandoff=window.${memoryKey}||location.hash;try{delete window.${memoryKey}}catch{window.${memoryKey}=''}const hash=new URLSearchParams(rawHandoff.replace(/^#/,''));`;

let patched = 0;
for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-ekodi-workspace-handoff') || !html.includes('id="googleCustomerAuth"')) continue;

  html = html.replace(/<script data-ekodi-handoff-scrub>[\s\S]*?<\/script>/g, '');
  if (!html.includes(privateReader)) {
    if (!html.includes(oldReader)) throw new Error(`Marketing handoff hash reader missing in ${path.relative(root, file)}`);
    html = html.replace(oldReader, privateReader);
  }

  html = html.replace(/<head([^>]*)>/i, match => `${match}${scrub}`);
  fs.writeFileSync(file, html);
  patched += 1;
}

if (patched < 4) throw new Error(`Expected Marketing AI hub + customer pages to scrub handoff URLs, patched ${patched}`);

for (const file of htmlFiles(out)) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('data-ekodi-workspace-handoff') || !html.includes('id="googleCustomerAuth"')) continue;
  const scrubAt = html.indexOf('data-ekodi-handoff-scrub');
  const receiverAt = html.indexOf('data-ekodi-workspace-handoff');
  if (scrubAt < 0 || receiverAt < 0 || scrubAt > receiverAt) throw new Error(`Handoff scrub must execute before receiver in ${path.relative(root, file)}`);
  if (!html.includes(`Object.defineProperty(window,'${memoryKey}'`)) throw new Error(`In-memory handoff capture missing in ${path.relative(root, file)}`);
  if (!html.includes(`delete window.${memoryKey}`)) throw new Error(`In-memory handoff purge missing in ${path.relative(root, file)}`);
  if (!html.includes('history.replaceState({},document.title,location.pathname+location.search)')) throw new Error(`Immediate URL cleanup missing in ${path.relative(root, file)}`);
  if (html.includes(`sessionStorage.setItem('${memoryKey}'`) || html.includes(`localStorage.setItem('${memoryKey}'`)) throw new Error(`Sensitive handoff token must never be persisted in browser storage: ${path.relative(root, file)}`);
}

console.log(`✅ Marketing AI handoff token is removed from the address bar before first paint and kept only in tab memory: ${patched} pages`);
