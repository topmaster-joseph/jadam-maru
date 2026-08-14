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

const style = `<style data-public-landing-cleanup>
/* Anonymous landing: one clear story, one clear entry point. The synthetic dashboard stays out of view until real data exists. */
body:not(.member-session-mode) main{width:min(1080px,100%);padding:22px 20px 58px}
body:not(.member-session-mode) .hero.hero-v2{display:block;max-width:920px;margin:18px auto 12px;text-align:center}
body:not(.member-session-mode) .hero-copy{width:100%;max-width:920px;margin:0 auto}
body:not(.member-session-mode) .hero-kicker{margin:0 auto}
body:not(.member-session-mode) .hero.hero-v2 h1{max-width:820px;margin:14px auto 10px;font-size:clamp(42px,4.6vw,58px);line-height:1.06;letter-spacing:-.055em}
body:not(.member-session-mode) .hero-copy>p{max-width:650px;margin:0 auto;font-size:14px;line-height:1.65}
body:not(.member-session-mode) .hero-pills{display:none!important}
body:not(.member-session-mode) .product-preview{display:none!important}
body:not(.member-session-mode) .member-preview{max-width:820px;margin:22px auto 0;padding:0;border:0;background:transparent;box-shadow:none}
body:not(.member-session-mode) .member-preview-head{max-width:640px}
body:not(.member-session-mode) .member-preview-head small{font-size:9px;letter-spacing:.1em}
body:not(.member-session-mode) .member-preview-head h2{font-size:24px;line-height:1.28;margin:6px 0}
body:not(.member-session-mode) .member-preview-head p{font-size:11px;line-height:1.55}
body:not(.member-session-mode) .member-preview-grid{gap:8px;margin-top:14px}
body:not(.member-session-mode) .member-preview-card{padding:13px;border-color:#e7eaf2;border-radius:14px;background:rgba(255,255,255,.9);text-align:left;box-shadow:0 8px 24px rgba(31,41,55,.035)}
body:not(.member-session-mode) .member-preview-card small{font-size:9px;margin-bottom:4px}
body:not(.member-session-mode) .member-preview-card strong{font-size:15px}
body:not(.member-session-mode) .member-preview-card p{font-size:10px;line-height:1.45;margin-top:5px}
body:not(.member-session-mode) .member-preview-action{margin-top:14px}
body:not(.member-session-mode) .member-preview-action a{padding:11px 16px;border-radius:11px;background:linear-gradient(135deg,#3158f5,#6d28d9);box-shadow:0 8px 22px rgba(63,91,246,.18)}
body:not(.member-session-mode) .member-preview-note{font-size:9px;margin-top:7px}
body:not(.member-session-mode) .feature-strip{max-width:920px;margin-top:18px}
@media(max-width:760px){
  body:not(.member-session-mode) main{padding:14px 14px 46px}
  body:not(.member-session-mode) .hero.hero-v2{margin:8px auto 10px}
  body:not(.member-session-mode) .hero.hero-v2 h1{font-size:36px;line-height:1.08;margin:11px auto 8px}
  body:not(.member-session-mode) .hero-copy>p{font-size:12px}
  body:not(.member-session-mode) .member-preview{margin-top:17px}
  body:not(.member-session-mode) .member-preview-head h2{font-size:21px}
  body:not(.member-session-mode) .member-preview-grid{grid-template-columns:1fr}
}
</style>`;

html = html.replace('</head>', `${style}</head>`);

for (const required of [
  'data-public-landing-cleanup',
  'body:not(.member-session-mode) .product-preview{display:none!important}',
  'body:not(.member-session-mode) .hero.hero-v2{display:block',
  'body:not(.member-session-mode) .member-preview{max-width:820px',
]) {
  if (!html.includes(required)) throw new Error(`Public landing cleanup contract missing: ${required}`);
}

fs.writeFileSync(hubFile, html);
console.log('✅ Marketing AI anonymous landing is compact, centered and free of the synthetic dashboard preview');
