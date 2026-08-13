import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist', 'marketing-ai');
const allowedReturnOrigins = [
  'https://marketing.ekodi.kr',
  'https://jadam.ekodi.kr',
  'https://pizzamaru.ekodi.kr',
  'https://yogurtpurple.ekodi.kr',
];

function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(full);
    return entry.isFile() && entry.name.endsWith('.html') ? [full] : [];
  });
}

let casePages = 0;
let indexPatched = false;

for (const file of htmlFiles(out)) {
  let html = fs.readFileSync(file, 'utf8');
  const original = html;

  if (html.includes('id="customerAuthOpen"')) {
    html = html.replace(
      '<button class="auth-open" id="customerAuthOpen" type="button">고객 로그인</button>',
      '<a class="auth-open" id="googleCustomerAuth" href="https://auth.ekodi.kr/?site=marketing">통합 로그인</a>',
    );

    const handoffScript = `<script>(()=>{const a=document.querySelector('#googleCustomerAuth');if(!a)return;const allowed=new Set(${JSON.stringify(allowedReturnOrigins)});const returnTo=allowed.has(location.origin)?location.origin+location.pathname:'https://marketing.ekodi.kr/';a.href='https://auth.ekodi.kr/?site=marketing&return_to='+encodeURIComponent(returnTo)})();</script>`;
    html = html.replace('</body>', `${handoffScript}</body>`);
    casePages += 1;
  }

  if (file === path.join(out, 'index.html')) {
    html = html.replace(
      '<span class="badge">APPLICATION CASES</span>',
      '<div class="top-actions"><span class="badge">APPLICATION CASES</span><a class="auth-open" href="https://auth.ekodi.kr/?site=marketing&return_to=https%3A%2F%2Fmarketing.ekodi.kr%2F">통합 로그인</a></div>',
    );
    indexPatched = html.includes('auth.ekodi.kr/?site=marketing');
  }

  if (html !== original) fs.writeFileSync(file, html);
}

if (casePages < 3) throw new Error(`Expected at least 3 Marketing AI case pages for central auth, patched ${casePages}`);
if (!indexPatched) throw new Error('Marketing AI index central login entry was not patched');

console.log(`Central Marketing AI auth patched: index + ${casePages} case pages`);
