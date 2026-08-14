import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const hubFile = path.join(root, 'dist', 'marketing-ai', 'index.html');
if (!fs.existsSync(hubFile)) throw new Error('Marketing AI hub must exist before public landing cleanup');

let html = fs.readFileSync(hubFile, 'utf8');

if (!html.includes('class="hero hero-v2"')) throw new Error('Public hero shell is missing');
if (!html.includes('class="product-preview"')) throw new Error('Dashboard preview contract is missing');
if (!html.includes('id="memberPreview"')) throw new Error('Public feature preview is missing');
if (!html.includes('id="googleCustomerAuth"')) throw new Error('Google entry point is missing');

html = html.replace(/<style data-public-landing-cleanup>[\s\S]*?<\/style>/g, '');
html = html.replace('<div class="product-preview">', '<div class="product-preview" aria-hidden="true">');

// marketing.ekodi.kr is the public discovery hub. It should be indexable and
// its promise must match the real Google-first free workspace flow.
html = html
  .replace('<meta name="robots" content="noindex,nofollow">', '<meta name="robots" content="index,follow">')
  .replaceAll('로그인 없이 바로 체험', 'Google 로그인 후 바로 체험')
  .replaceAll('로그인 없이 30초 체험', 'Google 로그인 후 무료 체험')
  .replaceAll('LOGIN → TRY IT YOURSELF', 'FREE START · 먼저 체험');

const style = `<style data-public-landing-cleanup>
/* Anonymous landing: one story, one preview, one primary entry point. */
body:not(.member-session-mode) main{width:min(1020px,100%);padding:18px 20px 36px}
body:not(.member-session-mode) .hero.hero-v2{display:block;max-width:900px;margin:12px auto 8px;text-align:center}
body:not(.member-session-mode) .hero-copy{width:100%;max-width:900px;margin:0 auto}
body:not(.member-session-mode) .hero-kicker{margin:0 auto}
body:not(.member-session-mode) .hero.hero-v2 h1{max-width:780px;margin:12px auto 8px;font-size:clamp(38px,4.2vw,52px);line-height:1.06;letter-spacing:-.052em}
body:not(.member-session-mode) .hero-copy>p{max-width:620px;margin:0 auto;font-size:13px;line-height:1.6}
body:not(.member-session-mode) .hero-pills{display:none!important}
body:not(.member-session-mode) .product-preview{display:none!important}
body:not(.member-session-mode) .member-preview{max-width:820px;margin:18px auto 0;padding:0;border:0;background:transparent;box-shadow:none}
body:not(.member-session-mode) .member-preview-head{max-width:620px;margin:0 auto;text-align:center}
body:not(.member-session-mode) .member-preview-head small{font-size:9px;letter-spacing:.1em}
body:not(.member-session-mode) .member-preview-head h2{font-size:22px;line-height:1.28;margin:5px 0}
body:not(.member-session-mode) .member-preview-head p{font-size:10px;line-height:1.5}
body:not(.member-session-mode) .member-preview-grid{gap:8px;margin-top:12px}
body:not(.member-session-mode) .member-preview-card{padding:12px;border-color:#e7eaf2;border-radius:13px;background:rgba(255,255,255,.94);text-align:left;box-shadow:0 7px 20px rgba(31,41,55,.03)}
body:not(.member-session-mode) .member-preview-card small{font-size:9px;margin-bottom:4px}
body:not(.member-session-mode) .member-preview-card strong{font-size:14px}
body:not(.member-session-mode) .member-preview-card p{font-size:10px;line-height:1.42;margin-top:4px}
body:not(.member-session-mode) .member-preview-action{margin-top:12px}
body:not(.member-session-mode) .member-preview-action a{padding:11px 16px;border-radius:11px;background:linear-gradient(135deg,#3158f5,#6d28d9);box-shadow:0 8px 22px rgba(63,91,246,.18)}
body:not(.member-session-mode) .member-preview-note{font-size:9px;margin-top:6px}
/* These sections repeat the same promise and CTA on the anonymous page.
   Keep their DOM for authenticated workspace/pricing mode, hide only publicly. */
body:not(.member-session-mode) .feature-strip,
body:not(.member-session-mode) .workflow-v2,
body:not(.member-session-mode) .bottom-cta{display:none!important}
/* Domain/plan management belongs after sign-in. The latest store-specific
   Basic/Plus/Pro behavior remains intact once member-session-mode is active. */
body:not(.member-session-mode) .custom-domain-panel{display:none!important}
body:not(.member-session-mode) .powered{padding-top:10px}
@media(max-width:760px){
  body:not(.member-session-mode) main{padding:12px 14px 28px}
  body:not(.member-session-mode) .hero.hero-v2{margin:6px auto 8px}
  body:not(.member-session-mode) .hero.hero-v2 h1{font-size:33px;line-height:1.08;margin:9px auto 7px}
  body:not(.member-session-mode) .hero-copy>p{font-size:11px;line-height:1.55}
  body:not(.member-session-mode) .member-preview{margin-top:14px}
  body:not(.member-session-mode) .member-preview-head h2{font-size:19px}
  body:not(.member-session-mode) .member-preview-grid{grid-template-columns:1fr}
}
</style>`;

html = html.replace('</head>', `${style}</head>`);

for (const required of [
  'data-public-landing-cleanup',
  '<meta name="robots" content="index,follow">',
  'body:not(.member-session-mode) .product-preview{display:none!important}',
  'body:not(.member-session-mode) .hero.hero-v2{display:block',
  'body:not(.member-session-mode) .member-preview{max-width:820px',
  'body:not(.member-session-mode) .workflow-v2,',
  'body:not(.member-session-mode) .custom-domain-panel{display:none!important}',
  'FREE START · 먼저 체험',
]) {
  if (!html.includes(required)) throw new Error(`Public landing cleanup contract missing: ${required}`);
}
if (html.includes('로그인 없이 30초 체험') || html.includes('로그인 없이 바로 체험')) {
  throw new Error('Anonymous-trial copy remains on Google-login-first landing');
}

fs.writeFileSync(hubFile, html);
console.log('✅ Marketing AI anonymous landing is compact, indexable and uses one Google-first free-start path');
