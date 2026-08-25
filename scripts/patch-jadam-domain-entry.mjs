import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'dist', 'marketing-ai', 'jadam', 'index.html');
if (!fs.existsSync(file)) throw new Error('Jadam generated workspace is missing');

const entry = `
<section class="jadam-service-entry" data-jadam-service-entry>
  <div class="jadam-entry-shell">
    <div class="jadam-entry-brand"><span>J</span><b>JADAM CHICKEN · MOKPO NATIONAL UNIVERSITY</b></div>
    <small>EKODI PRIVATE SERVICE</small>
    <h1>자담치킨 맞춤형 AI의<br><em>전용 입구입니다.</em></h1>
    <p>이 주소에서는 자담치킨 AI의 내부 업무화면을 공개하지 않습니다. 사전 승인된 관계자만 전용 AI 운영실로 이동할 수 있습니다.</p>
    <div class="jadam-entry-rule"><b>일반 방문자</b><span>내부 데이터·계획·성과 화면 비공개</span></div>
    <div class="jadam-entry-rule"><b>승인 관계자</b><span>Google 계정 + 자담치킨 고객권한 확인 후 입장</span></div>
    <a id="jadamEntryLogin" href="https://auth.ekodi.kr/?site=jadam-client">승인 계정으로 전용 AI 운영실 들어가기</a>
    <span class="jadam-entry-canonical">전용 운영실 · jadam.ai.ekodi.kr</span>
  </div>
</section>`;

const bootstrap = `<script data-jadam-domain-role-bootstrap>(()=>{const h=location.hostname.toLowerCase();if(h==='jadam.ekodi.kr'||h==='marketing.jadam.ekodi.kr')document.documentElement.classList.add('jadam-entry-host');else document.documentElement.classList.add('jadam-ai-host')})();</script>`;

const style = `
<style data-jadam-domain-entry-style>
.jadam-service-entry{display:none}
html.jadam-entry-host body{margin:0!important;overflow:auto!important;background:#f4f0ed!important}
html.jadam-entry-host body>.shell,html.jadam-entry-host body>.jadam-access-gate{display:none!important}
html.jadam-entry-host .jadam-service-entry{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at 15% 15%,rgba(181,43,34,.12),transparent 34%),radial-gradient(circle at 85% 80%,rgba(38,24,22,.08),transparent 30%),#f4f0ed;color:#251916}
.jadam-entry-shell{width:min(650px,100%);padding:clamp(30px,6vw,58px);border:1px solid rgba(90,48,40,.14);border-radius:30px;background:#fffdfb;box-shadow:0 30px 90px rgba(60,33,28,.1)}
.jadam-entry-brand{display:flex;gap:11px;align-items:center;margin-bottom:24px}.jadam-entry-brand span{display:grid;place-items:center;width:42px;height:42px;border-radius:13px;background:#b52b22;color:#fff;font-size:22px;font-weight:950}.jadam-entry-brand b{font-size:10px;letter-spacing:.09em;color:#765e58}.jadam-entry-shell>small{font-size:10px;font-weight:950;letter-spacing:.14em;color:#9a6e65}.jadam-entry-shell h1{font-size:clamp(38px,7vw,62px);line-height:1;letter-spacing:-.06em;margin:13px 0 18px;color:#251916}.jadam-entry-shell h1 em{font-style:normal;color:#b52b22}.jadam-entry-shell>p{margin:0 0 22px;color:#75615c;font-size:14px;line-height:1.75}.jadam-entry-rule{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-top:1px solid #eee1dd;font-size:11px}.jadam-entry-rule b{color:#37221e}.jadam-entry-rule span{text-align:right;color:#8c746e}.jadam-entry-shell>a{display:block;margin-top:22px;padding:14px 17px;border-radius:14px;background:#281815;color:#fff;text-align:center;font-size:13px;font-weight:950;text-decoration:none}.jadam-entry-canonical{display:block;margin-top:11px;text-align:center;color:#a08680;font-size:9px;letter-spacing:.04em}
@media(max-width:560px){.jadam-entry-shell{border-radius:22px;padding:28px 22px}.jadam-entry-rule{display:grid;gap:5px}.jadam-entry-rule span{text-align:left}}
</style>`;

const runtime = `
<script data-jadam-domain-entry-runtime>(()=>{
  if(!document.documentElement.classList.contains('jadam-entry-host'))return;
  const link=document.querySelector('#jadamEntryLogin'); if(!link)return;
  const auth=new URL('https://auth.ekodi.kr/');
  auth.searchParams.set('site','jadam-client');
  auth.searchParams.set('return_to','https://jadam.ai.ekodi.kr/');
  link.href=auth.href;
})();</script>`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<script data-jadam-domain-role-bootstrap>[\s\S]*?<\/script>/g, '');
html = html.replace(/<style data-jadam-domain-entry-style>[\s\S]*?<\/style>/g, '');
html = html.replace(/<script data-jadam-domain-entry-runtime>[\s\S]*?<\/script>/g, '');
html = html.replace(/<section class="jadam-service-entry"[\s\S]*?<\/section>/g, '');
html = html.replace('</head>', `${bootstrap}${style}</head>`);
html = html.replace(/(<body[^>]*>)/, `$1${entry}`);
html = html.replace('</body>', `${runtime}</body>`);

for (const required of [
  'data-jadam-service-entry',
  'data-jadam-domain-role-bootstrap',
  "h==='jadam.ekodi.kr'",
  "h==='marketing.jadam.ekodi.kr'",
  'jadam-entry-host',
  "auth.searchParams.set('return_to','https://jadam.ai.ekodi.kr/')",
  '내부 데이터·계획·성과 화면 비공개',
  'data-jadam-access-gate',
  'data-jadam-private-workspace',
]) if (!html.includes(required)) throw new Error(`Jadam domain separation contract missing: ${required}`);

fs.writeFileSync(file, html);
console.log('✅ Jadam domain roles separated: legacy hostname = private entry, jadam.ai.ekodi.kr = protected AI workspace');
