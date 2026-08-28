import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const dist=path.join(root,'dist','marketing-ai');
const ensure=(dir)=>fs.mkdirSync(dir,{recursive:true});

function copyAlias(sourceSlug,targetSlug,canonicalUrl){
  const source=path.join(dist,sourceSlug);
  const target=path.join(dist,targetSlug);
  if(!fs.existsSync(path.join(source,'index.html')))throw new Error(`Missing source Marketing AI workspace: ${sourceSlug}`);
  fs.rmSync(target,{recursive:true,force:true});
  fs.cpSync(source,target,{recursive:true});
  const file=path.join(target,'index.html');
  let html=fs.readFileSync(file,'utf8');
  html=html.replace(/<link\s+rel=["']canonical["'][^>]*>/ig,'');
  html=html.replace('</head>',`<link rel="canonical" href="${canonicalUrl}"></head>`);
  fs.writeFileSync(file,html);
}

function entry(slug,name,description,target){
  const dir=path.join(dist,slug);ensure(dir);
  const canonical=`https://marketing.ekodi.kr/${slug}/`;
  fs.writeFileSync(path.join(dir,'index.html'),`<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><link rel="canonical" href="${canonical}"><title>${name} | 에코디 마케팅AI</title><style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f7f8fa;color:#17191d}main{max-width:720px;margin:auto;padding:64px 22px}.card{background:#fff;border:1px solid #e5e7eb;border-radius:22px;padding:28px}h1{margin:0 0 12px}p{color:#59606a;line-height:1.65}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:22px}a{padding:12px 15px;border-radius:12px;border:1px solid #dfe3e8;color:inherit;text-decoration:none;font-weight:800}.primary{background:#17191d;color:#fff}</style></head><body><main><div>EKODI · MARKETING AI</div><section class="card"><h1>${name}</h1><p>${description}</p><div class="actions"><a class="primary" href="${target}">전용 작업공간 열기</a><a href="https://my.ekodi.kr/${slug}/">My EKODI</a></div></section></main></body></html>`);
}

copyAlias('yogurtpurple','yogurt','https://marketing.ekodi.kr/yogurt/');
entry('biz','에코디비즈 · 마케팅AI','에코디비즈가 사용하는 공통 에코디 마케팅AI 진입점입니다.','https://marketing.ekodi.kr/');
entry('cgma','청계상권 · 마케팅AI','청계면상인회 전용 운영공간을 공통 마케팅AI 경로에서 연결합니다.','https://cgma.ai.ekodi.kr/market-ai');

for(const slug of ['jadam','pizzamaru','yogurt','church','biz','cgma']){
  if(!fs.existsSync(path.join(dist,slug,'index.html')))throw new Error(`Canonical Marketing AI path missing: ${slug}`);
}
console.log('✅ Canonical Marketing AI parent paths built: jadam, pizzamaru, yogurt, church, biz, cgma');
