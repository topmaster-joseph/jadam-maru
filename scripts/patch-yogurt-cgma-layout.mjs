import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const file = path.join(root, 'dist', 'marketing-ai', 'yogurtpurple', 'index.html');

if (!fs.existsSync(file)) {
  throw new Error(`Yogurt Purple Marketing AI workspace not found: ${file}`);
}

const style = `
<style data-yogurt-cgma-layout>
body.tenant-yogurtpurple{
  --tenant-bg:#f7f4fa;
  --tenant-surface:#fff;
  --tenant-soft:#f1ebf7;
  --tenant-accent:#7450a8;
  --tenant-ink:#261f2d;
  --tenant-muted:#746b7d;
  --tenant-line:#e6dfec;
  background:var(--tenant-bg);
  color:var(--tenant-ink);
  word-break:keep-all;
  overflow-wrap:normal;
}
.tenant-yogurtpurple .top{
  position:sticky;
  top:0;
  z-index:70;
  min-height:50px;
  padding:8px 18px;
  background:rgba(247,244,250,.96);
  border-bottom:1px solid var(--tenant-line);
  backdrop-filter:blur(12px);
  -webkit-backdrop-filter:blur(12px);
}
.tenant-yogurtpurple .product{font-size:13px;font-weight:900;letter-spacing:-.025em}
.tenant-yogurtpurple .top-actions{gap:6px}
.tenant-yogurtpurple .badge,.tenant-yogurtpurple .google-customer-auth,.tenant-yogurtpurple .auth-open{
  min-height:32px;
  border-radius:9px;
  font-size:11px;
}
.tenant-yogurtpurple main{
  width:min(1180px,100%);
  margin:0 auto;
  padding:20px 18px 34px;
  overflow:visible;
}
.tenant-yogurtpurple .tenant-hero{
  display:grid;
  grid-template-columns:minmax(320px,.92fr) minmax(420px,1.08fr);
  gap:14px;
  align-items:stretch;
  margin:0 0 14px;
}
.tenant-yogurtpurple .tenant-hero-copy,
.tenant-yogurtpurple .tenant-hero aside{
  border:1px solid var(--tenant-line);
  box-shadow:none;
}
.tenant-yogurtpurple .tenant-hero-copy{
  padding:22px;
  border-radius:20px;
  background:radial-gradient(circle at 12% 18%,rgba(224,203,244,.62),transparent 27%),#fff;
}
.tenant-yogurtpurple .tenant-kicker{gap:6px;font-size:10px;letter-spacing:.1em}
.tenant-yogurtpurple .tenant-kicker span,
.tenant-yogurtpurple .tenant-kicker b{padding:6px 9px}
.tenant-yogurtpurple .tenant-hero h1{
  max-width:650px;
  margin:10px 0 9px;
  font-size:clamp(30px,3.8vw,48px);
  line-height:1.03;
  letter-spacing:-.05em;
  text-wrap:balance;
}
.tenant-yogurtpurple .tenant-hero p{
  max-width:620px;
  margin:0;
  font-size:13px;
  line-height:1.55;
  color:var(--tenant-muted);
}
.tenant-yogurtpurple .tenant-actions{gap:6px;margin-top:14px}
.tenant-yogurtpurple .tenant-actions span{padding:7px 10px;font-size:11px}
.tenant-yogurtpurple .yogurt-visual-board{
  min-height:100%;
  padding:22px;
  border-radius:20px;
  gap:12px;
  background:linear-gradient(150deg,#352646,#7553a1 58%,#b985b5)!important;
}
.tenant-yogurtpurple .yogurt-visual-board:after{width:150px;height:150px;right:-50px;top:-50px}
.tenant-yogurtpurple .yogurt-visual-board small{font-size:10px;letter-spacing:.13em}
.tenant-yogurtpurple .visual-orbits{gap:6px}
.tenant-yogurtpurple .visual-orbits span{padding:7px 9px;font-size:9px}
.tenant-yogurtpurple .yogurt-visual-board>strong{font-size:20px}
.tenant-yogurtpurple .yogurt-visual-board p{font-size:12px;line-height:1.5;color:#eee7f4}

/* CGMA /market-ai와 같은 compact dashboard rhythm */
.tenant-yogurtpurple .pilot-wrap{margin:0 0 22px;gap:14px}
.tenant-yogurtpurple .pilot-brief,
.tenant-yogurtpurple .pilot-panel{
  padding:20px;
  border:1px solid #e4ddea;
  border-radius:20px;
  background:#fff;
  box-shadow:none;
}
.tenant-yogurtpurple .pilot-brief{
  grid-template-columns:minmax(0,1.5fr) minmax(230px,.8fr);
  gap:18px;
  background:#fff;
}
.tenant-yogurtpurple .pilot-brief h2{font-size:clamp(25px,4vw,34px)}
.tenant-yogurtpurple .pilot-brief p{font-size:13px;line-height:1.6;color:var(--tenant-muted)}
.tenant-yogurtpurple .pilot-flow{gap:8px;margin-top:14px}
.tenant-yogurtpurple .pilot-step{
  padding:11px 8px;
  border-radius:13px;
  background:#f6f2f9;
}
.tenant-yogurtpurple .pilot-step b{font-size:12px}
.tenant-yogurtpurple .pilot-step small{font-size:10px;color:var(--tenant-muted)}
.tenant-yogurtpurple .pilot-goals{gap:8px}
.tenant-yogurtpurple .pilot-goal{
  padding:12px;
  border-radius:14px;
  background:#f6f2f9;
}
.tenant-yogurtpurple .pilot-head{margin-bottom:14px}
.tenant-yogurtpurple .pilot-head p{font-size:13px;line-height:1.55}
.tenant-yogurtpurple .pilot-state{padding:7px 10px;border-radius:999px;font-size:11px}
.tenant-yogurtpurple .pilot-table-wrap{border-radius:14px;border-color:#e7e1ec}
.tenant-yogurtpurple .pilot-table th{background:#faf8fb}
.tenant-yogurtpurple .pilot-plan{gap:10px}
.tenant-yogurtpurple .pilot-plan article{
  padding:14px;
  border-radius:15px;
  border-color:#e7e1ec;
  background:#fff;
}
.tenant-yogurtpurple .pilot-approval{gap:8px}
.tenant-yogurtpurple .pilot-approval div{padding:11px;border-radius:13px;border-color:#e7e1ec}
.tenant-yogurtpurple .pilot-kpis{gap:7px}
.tenant-yogurtpurple .pilot-kpis span{padding:7px 10px;background:#f6f2f9}
.tenant-yogurtpurple .pilot-note{border-radius:14px}
.tenant-yogurtpurple .pilot-actions button{border-radius:12px}

.tenant-yogurtpurple .grid{gap:14px}
.tenant-yogurtpurple .card,
.tenant-yogurtpurple .menu{
  border:1px solid #e4ddea;
  border-radius:20px;
  background:#fff;
  box-shadow:none;
}

@media(max-width:900px){
  .tenant-yogurtpurple .tenant-hero{grid-template-columns:1fr;gap:12px}
  .tenant-yogurtpurple .pilot-brief{grid-template-columns:1fr}
}
@media(max-width:760px){
  .tenant-yogurtpurple .top{
    padding:8px 14px;
    padding-top:calc(8px + env(safe-area-inset-top));
    min-height:calc(50px + env(safe-area-inset-top));
  }
  .tenant-yogurtpurple main{padding:16px 14px 42px}
  .tenant-yogurtpurple .tenant-hero-copy,.tenant-yogurtpurple .yogurt-visual-board{padding:18px;border-radius:18px}
  .tenant-yogurtpurple .tenant-hero h1{font-size:clamp(29px,9.2vw,39px);margin:8px 0 7px}
  .tenant-yogurtpurple .tenant-hero p{font-size:12px}
  .tenant-yogurtpurple .pilot-brief,.tenant-yogurtpurple .pilot-panel{padding:17px;border-radius:18px}
  .tenant-yogurtpurple .pilot-flow{grid-template-columns:repeat(3,1fr)}
  .tenant-yogurtpurple .pilot-plan{grid-template-columns:1fr}
  .tenant-yogurtpurple .pilot-approval{grid-template-columns:1fr 1fr}
}
@media(max-width:480px){
  .tenant-yogurtpurple .product{font-size:12px}
  .tenant-yogurtpurple .badge{display:none}
  .tenant-yogurtpurple .tenant-hero h1{font-size:29px}
  .tenant-yogurtpurple .pilot-approval{grid-template-columns:1fr}
}
</style>`;

let html = fs.readFileSync(file, 'utf8');
html = html.replace(/<style\b[^>]*data-yogurt-cgma-layout[^>]*>[\s\S]*?<\/style>/i, '');
html = html.replace('</head>', `${style}</head>`);

if (!html.includes('data-yogurt-cgma-layout')) {
  throw new Error('Yogurt Purple CGMA-aligned layout injection failed.');
}
if (!html.includes('data-ekodi-marketing-pilot="yogurtpurple"')) {
  throw new Error('Yogurt Purple pilot dashboard is missing before CGMA layout alignment.');
}

fs.writeFileSync(file, html);
console.log('✅ Yogurt Purple Marketing AI aligned to the compact CGMA /market-ai visual rhythm.');
